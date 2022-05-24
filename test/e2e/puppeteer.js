import puppeteer from 'puppeteer-core';
import handler from 'serve-handler';
import http from 'http';
import pixelmatch from 'pixelmatch';
import jimp from 'jimp';
import * as fs from 'fs/promises';
import fetch from 'node-fetch';

const LAST_REVISION_URLS = {
    linux: 'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/LAST_CHANGE',
    mac: 'https://storage.googleapis.com/chromium-browser-snapshots/Mac/LAST_CHANGE',
    mac_arm: 'https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/LAST_CHANGE',
    win32: 'https://storage.googleapis.com/chromium-browser-snapshots/Win/LAST_CHANGE',
    win64: 'https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/LAST_CHANGE'
};

const port = 1234;
const pixelThreshold = 0.1 /* TODO: decrease to 0.005 */; // threshold error in one pixel
const maxFailedPixels = 0.05; // total failed pixels

const networkTimeout = 180; // 3 minutes - set to 0 to disable
const renderTimeout = 4; // 4 seconds - set to 0 to disable

const numAttempts = 2; // perform 2 attempts before failing

const width = 400;
const height = 250;
const viewScale = 2; // TODO: possibly increase?
const jpgQuality = 95;

const exceptionList = [

	'webgl_effects_ascii', // renders differently on different platforms, investigate
	'webgl_loader_texture_ktx', // "GL_INVALID_OPERATION: Invalid internal format." investigate
	'webgl_morphtargets_face', // does not work on GitHub? investigate
	'webgl_tiled_forward', // investigate
	'webgl_worker_offscreencanvas', // investigate

	// webgpu - "No available adapters. JSHandle@error"
	'webgpu_compute',
	'webgpu_cubemap_mix',
	'webgpu_depth_texture',
	'webgpu_instance_mesh',
	'webgpu_instance_uniform',
	'webgpu_lights_custom',
	'webgpu_lights_selective',
	'webgpu_loader_gltf',
	'webgpu_materials',
	'webgpu_nodes_playground',
	'webgpu_rtt',
	'webgpu_sandbox',
	'webgpu_skinning_instancing',
	'webgpu_skinning_points',
	'webgpu_skinning'

];

console.green = ( msg ) => console.log( `\x1b[32m${ msg }\x1b[37m` );
console.red = ( msg ) => console.log( `\x1b[31m${ msg }\x1b[37m` );

let browser;

/* Launch server */

const server = http.createServer( handler );
server.listen( port, main );
server.on( 'SIGINT', () => {

	server.close();
	if ( browser !== undefined ) browser.close();
	process.exit( 1 );

} );

async function downloadLatestChromium() {

	const browserFetcher = puppeteer.createBrowserFetcher();

	const lastRevisionURL = LAST_REVISION_URLS[ browserFetcher.platform() ];
	const revision = await ( await fetch( lastRevisionURL ) ).text();

	const revisionInfo = browserFetcher.revisionInfo( revision );
	if ( revisionInfo.local === true ) {

		console.log( 'Latest Chromium is already downloaded.' );
		return revisionInfo;

	} else {

		console.log( 'Downloading latest Chromium...' );
		const revisionInfo = await browserFetcher.download( revision );
		console.log( 'Downloaded.' );
		return revisionInfo;

	}

}

async function main() {

	/* Download browser */

	const { executablePath } = await downloadLatestChromium();

	/* Launch browser */

	browser = await puppeteer.launch( {
		executablePath,
		headless: ! process.env.VISIBLE,
		args: [
			// TODO: test if these three flags are really needed
			'--use-gl=swiftshader',
			'--no-sandbox',
			'--enable-surface-synchronization'
		]
	} );

	/* Prepare page */

	const page = ( await browser.pages() )[ 0 ];
	await page.setViewport( { width: width * viewScale, height: height * viewScale } );

	const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );

	const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );
	await page.evaluateOnNewDocument( injection );

	const threeJsBuild = ( await fs.readFile( 'build/three.module.js', 'utf8' ) )
		.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' ); // TODO: remove this (will require regenerating screenshots)
	await page.setRequestInterception( true );

	let messages;

	page.on( 'console', msg => {

		if ( msg.type() !== 'warning' && msg.type() !== 'error' ) {

			return;

		}

		const text = msg.text();

		if ( text.includes( 'GPU stall due to ReadPixels' ) ) {

			return;

		}

		if ( messages.includes( text ) ) {

			return;

		}

		messages.push( text );
		console.log( text );

	} );

	page.on( 'request', async ( request ) => {
		
		if ( request.url() === 'http://localhost:1234/build/three.module.js' ) {

			await request.respond( {
				status: 200,
				contentType: 'application/javascript; charset=utf-8',
				body: threeJsBuild
			} );

		} else {

			await request.continue();

		}

	} );

	/* Find files */

	const isMakeScreenshot = process.argv[ 2 ] === '--make';

	const exactList = process.argv.slice( isMakeScreenshot ? 3 : 2 )
		.map( f => f.replace( '.html', '' ) );

	const isExactList = exactList.length !== 0;

	const files = ( await fs.readdir( './examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' && s !== 'index.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.includes( f ) : ! exceptionList.includes( f ) );

	/* Loop for each file, with CI parallelism */

	const failedScreenshots = [];

	let beginID = 0;
	let endID = files.length;

	if ( process.env.CI !== undefined ) {

		const jobs = 8;

		beginID = Math.floor( parseInt( process.env.CI.slice( 0, 1 ) ) * files.length / jobs );
		endID = Math.floor( ( parseInt( process.env.CI.slice( - 1 ) ) + 1 ) * files.length / jobs );

	}

	for ( let fileID = beginID; fileID < endID; fileID ++ ) {

		messages = [];

		for ( let attemptID = 0; attemptID < numAttempts; attemptID ++ ) {

			/* Load target page */

			const file = files[ fileID ];

			try {

				await page.goto( `http://localhost:${ port }/examples/${ file }.html`, {
					waitUntil: 'networkidle2',
					timeout: networkTimeout * 1000
				} );

			} catch ( e ) {

				if ( attemptID === numAttempts - 1 ) {

					console.red( `Error happened while loading file ${ file }: ${ e }` );
					failedScreenshots.push( file );
					break;

				} else {

					console.log( 'Another attempt...' );
					continue;

				}

			}

			try {

				/* Render page */

				await page.evaluate( cleanPage );

				await page.evaluate( async ( renderTimeout ) => {

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

				}, renderTimeout );

			} catch ( e ) {

				if ( attemptID === numAttempts - 1 ) {

					console.red( `Error happened while loading file ${ file }: ${ e }` );
					failedScreenshots.push( file );
					break;

				} else {

					console.log( 'Another attempt...' );
					continue;

				}

			}

			if ( isMakeScreenshot ) {

				/* Make screenshots */

				( await jimp.read( await page.screenshot() ) )
					.scale( 1 / viewScale ).quality( jpgQuality )
					.write( `./examples/screenshots/${ file }.jpg` );

				console.green( `Screenshot generated for file ${ file }` );
				break;

			} else {

				try {

					/* Diff screenshots */

					const expected = ( await jimp.read( await fs.readFile( `./examples/screenshots/${ file }.jpg` ) ) ).bitmap;
					const actual = ( await jimp.read( await page.screenshot() ) ).scale( 1 / viewScale ).quality( jpgQuality ).bitmap;

					let numFailedPixels;

					try {

						numFailedPixels = pixelmatch( expected.data, actual.data, null, actual.width, actual.height, {
							threshold: pixelThreshold,
							alpha: 0.2,
							diffMask: process.env.FORCE_COLOR === '0',
							diffColor: process.env.FORCE_COLOR === '0' ? [ 255, 255, 255 ] : [ 255, 0, 0 ]
						} );

					} catch {

						console.red( `ERROR! Image sizes does not match in file: ${ file }` );
						failedScreenshots.push( file );
						break;

					}

					numFailedPixels /= actual.width * actual.height;

					/* Print results */

					if ( numFailedPixels < maxFailedPixels ) {

						console.green( `diff: ${ numFailedPixels.toFixed( 3 ) }, file: ${ file }` );
						break;

					} else {

						if ( attemptID === numAttempts - 1 ) {

							console.red( `ERROR! Diff wrong in ${ numFailedPixels.toFixed( 3 ) } of pixels in file: ${ file }` );
							failedScreenshots.push( file );
							break;

						} else {

							console.log( 'Another attempt...' );

						}

					}

				} catch {

					console.log( `Warning! Screenshot does not exist: ${ file }` );
					break;

				}

			}

		}

	}

	/* Finish */

	if ( isMakeScreenshot && failedScreenshots.length ) {

		console.red( `${ failedScreenshots.length } from ${ exactList.length } screenshots did not generated succesfully.` );

	} else if ( isMakeScreenshot && ! failedScreenshots.length ) {

		console.green( `${ exactList.length } screenshots succesfully generated.` );

	} else if ( failedScreenshots.length ) {

		const list = failedScreenshots.join( ' ' );
		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you sure that everything is correct, try to run \`npm run make-screenshot ${ list }\`` );
		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ endID - beginID } screenshots did not render correctly.` );

	} else {

		console.green( `TEST PASSED! ${ endID - beginID } screenshots rendered correctly.` );

	}

	setTimeout( () => {

		server.close();
		browser.close();
		process.exit( failedScreenshots.length );

	}, 300 );

}
