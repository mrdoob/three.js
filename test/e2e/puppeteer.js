import puppeteer from 'puppeteer-core';
import handler from 'serve-handler';
import http from 'http';
import pixelmatch from 'pixelmatch';
import jimp from 'jimp';
import * as fs from 'fs/promises';
import fetch from 'node-fetch';

class PromiseQueue {

	constructor( func, ...args ) {

		this.func = func.bind( this, ...args );
		this.promises = [];

	}

	add( ...args ) {

		const promise = this.func( ...args );
		this.promises.push( promise );
		promise.then( () => this.promises.splice( this.promises.indexOf( promise ), 1 ) );

	}

	async waitForAll() {

		while ( this.promises.length > 0 ) {

			await Promise.all( this.promises );

		}

	}

}

function regexify( str ) {

	return new RegExp( '^' + str.replace( /\*/g, '.*' ) + '$' );

}

function unregexify( regexp ) {

	return regexp.source.slice( 1, -1 ).replace( /\.\*/g, '*' );

}

const webgpuEnabled = process.platform === 'asdadadasdads'; // process.platform !== 'linux';
const temporaryWebGPUHack = webgpuEnabled; // TODO: remove this when it would be possible to screenshot WebGPU with fromSurface: true

/* CONFIG VARIABLES START */

const idleTime = 3; // 3 seconds - for how long there should be no network requests
const parseTime = 2; // 2 seconds per megabyte

const exceptionList = [

	'css3d_periodictable', // investigate
	'misc_uv_tests', // investigate
	'webgl_buffergeometry_glbufferattribute', // investigate
	'webgl_effects_ascii', // renders differently on different platforms, investigate
	'webgl_lights_spotlights', // investigate
	'webgl_lines_sphere', // changes with every screenshot, investigate
	'webgl_loader_mmd_audio', // does not load sufficiently quickly? investigate
	'webgl_loader_texture_ktx', // "GL_INVALID_OPERATION: Invalid internal format." investigate
	'webgl_morphtargets_face', // does not work on GitHub? investigate
	'webgl_multiple_elements_text', // investigate
	'webgl_postprocessing_dof2', // does not load sufficiently quickly? investigate
	'webgl_shadowmap_progressive', // investigate
	'webgl_test_memory2', // for some reason takes extremely long to load, investigate
	'webgl_tiled_forward', // investigate
	'webgl_worker_offscreencanvas', // investigate
	'webxr_vr_sandbox', // "WebGL: INVALID_VALUE: texSubImage2D: no canvas" investigate
	
	// video tag is not deterministic enough, investigate
	'css3d_youtube',
	'*video*'

].concat( webgpuEnabled ? [] : [ 'webgpu*' ] ).map( regexify );

/* CONFIG VARIABLES END */

const LAST_REVISION_URLS = {
    linux: 'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/LAST_CHANGE',
    mac: 'https://storage.googleapis.com/chromium-browser-snapshots/Mac/LAST_CHANGE',
    mac_arm: 'https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/LAST_CHANGE',
    win32: 'https://storage.googleapis.com/chromium-browser-snapshots/Win/LAST_CHANGE',
    win64: 'https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/LAST_CHANGE'
};

const port = 1234;
const pixelThreshold = 0.1; // threshold error in one pixel
const maxFailedPixels = 0.01 /* TODO: decrease to 0.005 */; // total failed pixels

const networkTimeout = 180; // 3 minutes - set to 0 to disable
const renderTimeout = 1; // 1 second - set to 0 to disable

const numAttempts = 5; // perform 5 attempts before failing

const numPages = 16;

const width = 400;
const height = 250;
const viewScale = 2; // TODO: possibly increase?
const jpgQuality = 95;

console.red = ( msg ) => console.log( `\x1b[31m${ msg }\x1b[37m` );
console.yellow = ( msg ) => console.log( `\x1b[33m${ msg }\x1b[37m` );
console.green = ( msg ) => console.log( `\x1b[32m${ msg }\x1b[37m` );

let browser;

/* Launch server */

const server = http.createServer( handler );
server.listen( port, main );
server.on( 'SIGINT', () => close() );

async function downloadLatestChromium() {

	const browserFetcher = puppeteer.createBrowserFetcher();

	const lastRevisionURL = LAST_REVISION_URLS[ browserFetcher.platform() ];
	const revision = await ( await fetch( lastRevisionURL ) ).text();

	const revisionInfo = browserFetcher.revisionInfo( revision );
	if ( revisionInfo.local === true ) {

		console.log( 'Latest Chromium has been already downloaded.' );
		return revisionInfo;

	} else {

		console.log( 'Downloading latest Chromium...' );
		const revisionInfo = await browserFetcher.download( revision );
		console.log( 'Downloaded.' );
		return revisionInfo;

	}

}

async function fromSurface( page ) {

	await page.session.send( 'Target.activateTarget', { targetId: page.target()._targetId } );
	const b64 = await page.session.send( 'Page.captureScreenshot', { fromSurface: false } );
	return Buffer.from( b64.data, 'base64' );

}

async function main() {

	/* Find files */

	const isMakeScreenshot = process.argv[ 2 ] === '--make';

	const exactList = process.argv.slice( isMakeScreenshot ? 3 : 2 )
		.map( f => f.replace( '.html', '' ) )
		.map( regexify );

	const isExactList = exactList.length !== 0;

	const files = ( await fs.readdir( './examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' && s !== 'index.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.some( r => r.test( f ) ) : ! exceptionList.some( r => r.test( f ) ) );

	if ( isExactList ) {

		for ( let regexp of exactList ) {

			if ( ! files.some( f => regexp.test( f ) ) ) {

				console.log( `Warning! Unrecognised example name: ${ unregexify( regexp ) }` );

			}

		}

	}

	/* Download browser */

	const { executablePath } = await downloadLatestChromium();

	/* Launch browser */

	const flags = [ '--hide-scrollbars' ];
	if ( webgpuEnabled ) flags.push( '--enable-unsafe-webgpu' );
	if ( process.platform === 'linux' ) flags.push( '--enable-features=Vulkan,UseSkiaRenderer', '--use-vulkan=native', '--disable-vulkan-surface', '--disable-features=VaapiVideoDecoder', '--ignore-gpu-blocklist', '--use-angle=vulkan' );

	const viewport = { width: width * viewScale, height: height * viewScale };

	browser = await puppeteer.launch( {
		executablePath,
		headless: ! temporaryWebGPUHack,
		args: flags,
		defaultViewport: viewport,
		handleSIGINT: false
	} );

	// this line is intended to stop the script if the browser is closed by user (while debugging)
	// browser.on( 'targetdestroyed', target => ( target.type() === 'other' ) ? close() : null );
	// for some reason it randomly stops the script after about ~30 screenshots processed

	/* Prepare injections */

	const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );
	const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );
	const build = ( await fs.readFile( 'build/three.module.js', 'utf8' ) ).replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' );

	/* Prepare pages */

	const pages = await browser.pages();
	while ( pages.length < numPages && pages.length < files.length ) pages.push( await browser.newPage() );

	const messages = [];

	for ( const page of pages ) {

		/* let page.pageSize, page.file, page.session */

		await page.evaluateOnNewDocument( injection );
		await page.setRequestInterception( true );

		page.on( 'console', msg => {

			const type = msg.type();

			if ( type !== 'warning' && type !== 'error' ) {

				return;

			}

			const file = page.file;

			if ( file === undefined ) {

				return;

			}

			const text = file + ': ' + msg.text().replace( /\[\.WebGL-(.+?)\] /g, '' ).trim();

			if ( text.includes( 'GPU stall due to ReadPixels' ) || text.includes( 'GPUStatsPanel' ) || text.includes( '404 (Not Found)' ) ) {

				return;

			}

			if ( messages.includes( text ) ) {

				return;

			}

			if ( text.includes( 'A wait operation has not completed in the specified time' ) ) {

				page.error = `${ file }: Internal Vulkan error - a wait operation has not completed in the specified time`;
				return;

			}

			if ( text.includes( 'context lost' ) ) {

				page.error = `${ file }: WebGL context lost`;
				return;

			}

			if ( text.includes( 'Error creating WebGL context' ) ) {

				page.error = `${ file }: Error creating WebGL context`;
				return;

			}

			if ( text.includes( 'JSHandle@error' ) ) {

				page.error = `${ file }: Error happened`;
				return;

			}

			if ( text.includes( 'A WebGL context could not be created' ) ) {

				return;

			}

			messages.push( text );

			if ( type === 'warning' ) {

				console.yellow( text );

			} else {

				page.error = text;

			}

		} );

		page.on( 'response', async ( response ) => {

			try {

				if ( response.status === 200 ) {

					await response.buffer().then( buffer => page.pageSize += buffer.length );

				}

			} catch {}

		} );

		page.on( 'request', async ( request ) => {

			if ( request.url() === `http://localhost:${ port }/build/three.module.js` ) {

				await request.respond( {
					status: 200,
					contentType: 'application/javascript; charset=utf-8',
					body: build
				} );

			} else {

				await request.continue();

			}

		} );

		/* Prepare session if WebGPU hack is enabled */

		if ( temporaryWebGPUHack ) {

			page.session = await page.target().createCDPSession();

		}

	}

	/* Prepare browser window's bounds if WebGPU hack is enabled */
	// TODO: remove this when https://github.com/puppeteer/puppeteer/issues/1910 will be fixed

	if ( temporaryWebGPUHack ) {

		const page = pages[ 0 ];
		const session = page.session;

		const { width, height } = viewport;
		const { windowId } = await session.send( 'Browser.getWindowForTarget' );
		await session.send( 'Browser.setWindowBounds', { windowId, bounds: { width, height } } );
		const { width: clientWidth, height: clientHeight } = ( await jimp.read( await fromSurface( page ) ) ).bitmap;
		await session.send( 'Browser.setWindowBounds', { windowId, bounds: {
			width: 2 * width - clientWidth,
			height: 2 * height - clientHeight
		} } );

	}

	/* Loop for each file */

	const failedScreenshots = [];

	const queue = new PromiseQueue( makeAttempt, pages, failedScreenshots, cleanPage, isMakeScreenshot );
	for ( const file of files ) queue.add( file );
	await queue.waitForAll();

	failedScreenshots.sort();

	/* Finish */
	
	if ( isMakeScreenshot && failedScreenshots.length ) {

		const list = failedScreenshots.join( ' ' );
		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you sure that everything is correct, try to run \`npm run make-screenshot ${ list }\`. If this does not help, try increasing idleTime and parseTime variables in /test/e2e/puppeteer.js file. If this also does not help, add remaining screenshots to the exception list.` );
		console.red( `${ failedScreenshots.length } from ${ files.length } screenshots have not generated succesfully.` );

	} else if ( isMakeScreenshot && ! failedScreenshots.length ) {

		console.green( `${ files.length } screenshots succesfully generated.` );

	} else if ( failedScreenshots.length ) {

		const list = failedScreenshots.join( ' ' );
		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you sure that everything is correct, try to run \`npm run make-screenshot ${ list }\`. If this does not help, try increasing idleTime and parseTime variables in /test/e2e/puppeteer.js file. If this also does not help, add remaining screenshots to the exception list.` );
		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ files.length } screenshots have not rendered correctly.` );

	} else {

		console.green( `TEST PASSED! ${ files.length } screenshots rendered correctly.` );

	}

	setTimeout( close, 300, failedScreenshots.length );

}

async function makeAttempt( pages, failedScreenshots, cleanPage, isMakeScreenshot, file, attemptID = 0 ) {

	const page = await new Promise( ( resolve, reject ) => {

		const interval = setInterval( () => {

			for ( const page of pages ) {

				if ( page.file === undefined ) {

					clearInterval( interval );
					resolve( page );

				}

			}

		}, 100 );

	} );

	page.file = file;

	try {

		page.pageSize = 0;

		/* Load target page */

		try {

			await page.goto( `http://localhost:${ port }/examples/${ file }.html`, {
				waitUntil: 'networkidle0',
				timeout: networkTimeout * 1000
			} );

		} catch ( e ) {

			throw new Error( `Error happened while loading file ${ file }: ${ e }` );

		}

		try {

			/* Render page */

			await page.evaluate( cleanPage );

			await page.waitForNetworkIdle( {
				timeout: networkTimeout * 1000,
				idleTime: idleTime * 1000
			} );

			await page.evaluate( async ( renderTimeout, parseTime ) => {

				await new Promise( resolve => setTimeout( resolve, parseTime ) );

				/* Resolve render promise */

				window._renderStarted = true;

				await new Promise( function ( resolve ) {

					const renderStart = performance._now();

					const waitingLoop = setInterval( function () {

						const renderTimeoutExceeded = ( renderTimeout > 0 ) && ( performance._now() - renderStart > 1000 * renderTimeout );

						if ( renderTimeoutExceeded ) {

							console.log( 'Warning. Render timeout exceeded...' );

						}

						if ( window._renderFinished || renderTimeoutExceeded ) {

							clearInterval( waitingLoop );
							resolve();

						}

					}, 0 );

				} );

			}, renderTimeout, page.pageSize / 1024 / 1024 * parseTime * 1000 );

		} catch ( e ) {

			throw new Error( `Error happened while loading file ${ file }: ${ e }` );

		}

		const screenshot = await jimp.read( temporaryWebGPUHack ? await fromSurface( page ) : await page.screenshot() );
		screenshot.scale( 1 / viewScale ).quality( jpgQuality );

		if ( page.error !== undefined ) throw new Error( page.error );

		if ( isMakeScreenshot ) {

			/* Make screenshot */

			screenshot.write( `./examples/screenshots/${ file }.jpg` );
			console.green( `Screenshot generated for file ${ file }` );

		} else {

			/* Diff screenshots */

			let expected;

			try {

				expected = ( await jimp.read( await fs.readFile( `./examples/screenshots/${ file }.jpg` ) ) ).bitmap;

			} catch {

				throw new Error( `Screenshot does not exist: ${ file }` );

			}

			const actual = screenshot.bitmap;

			let numFailedPixels;

			try {

				numFailedPixels = pixelmatch( expected.data, actual.data, null, actual.width, actual.height, {
					threshold: pixelThreshold,
					alpha: 0.2,
					diffMask: process.env.FORCE_COLOR === '0',
					diffColor: process.env.FORCE_COLOR === '0' ? [ 255, 255, 255 ] : [ 255, 0, 0 ]
				} );

			} catch {

				throw new Error( `Image sizes does not match in file: ${ file }` );

			}

			numFailedPixels /= actual.width * actual.height;

			/* Print results */

			if ( numFailedPixels < maxFailedPixels ) {

				console.green( `Diff ${ numFailedPixels.toFixed( 3 ) } in file: ${ file }` );

			} else {

				throw new Error( `Diff wrong in ${ numFailedPixels.toFixed( 3 ) } of pixels in file: ${ file }` );

			}

		}

	} catch ( e ) { 

		if ( attemptID === numAttempts - 1 ) {

			console.red( e );
			failedScreenshots.push( file );

		} else {

			// console.log( `${ e }, another attempt...` );
			this.add( file, attemptID + 1 );

		}

	} finally {

		page.file = undefined;
		page.error = undefined;

	}

}

function close( exitCode = 1 ) {

	console.log( 'Closing...' );

	if ( browser !== undefined ) browser.close();
	server.close();
	process.exit( exitCode );

}
