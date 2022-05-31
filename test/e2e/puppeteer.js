import puppeteer from 'puppeteer-core';
import handler from 'serve-handler';
import http from 'http';
import pixelmatch from 'pixelmatch';
import jimp from 'jimp';
import * as fs from 'fs/promises';
import fetch from 'node-fetch';

/* CONFIG VARIABLES START */

const idleTime = 3; // 3 seconds - for how long there should be no network requests
const parseTime = 2; // 2 seconds per megabyte

const exceptionList = [

	'css3d_periodictable', // investigate
	'webgl_buffergeometry_glbufferattribute', // investigate
	'webgl_effects_ascii', // renders differently on different platforms, investigate
	'webgl_lights_spotlights', // investigate
	'webgl_lines_sphere', // changes with every screenshot, investigate
	'webgl_loader_texture_ktx', // "GL_INVALID_OPERATION: Invalid internal format." investigate
	'webgl_morphtargets_face', // does not work on GitHub? investigate
	'webgl_multiple_elements_text', // investigate
	'webgl_test_memory2', // for some reason takes extremely long to load, investigate
	'webgl_tiled_forward', // investigate
	'webgl_worker_offscreencanvas', // investigate
	'webgpu*', // "No available adapters. JSHandle@error", investigate
	
	// video tag is not deterministic enough, investigate
	'css3d_youtube',
	'*video*'

].map( str => new RegExp( '^' + str.replaceAll( '*', '.*' ) + '$' ) );

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

const networkTimeout = 180; // 2 minutes - set to 0 to disable
const renderTimeout = 1; // 1 second - set to 0 to disable

const numAttempts = 2; // perform 2 attempts before failing

const width = 400;
const height = 250;
const viewScale = 2; // TODO: possibly increase?
const jpgQuality = 95;

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

		console.log( 'Latest Chromium has been already downloaded.' );
		return revisionInfo;

	} else {

		console.log( 'Downloading latest Chromium...' );
		const revisionInfo = await browserFetcher.download( revision );
		console.log( 'Downloaded.' );
		return revisionInfo;

	}

}

async function main() {

	/* Find files */

	const isMakeScreenshot = process.argv[ 2 ] === '--make';

	const exactList = process.argv.slice( isMakeScreenshot ? 3 : 2 )
		.map( f => f.replace( '.html', '' ) )
		.map( str => new RegExp( '^' + str.replaceAll( '*', '.*' ) + '$' ) );

	const isExactList = exactList.length !== 0;

	const files = ( await fs.readdir( './examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' && s !== 'index.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.some( r => r.test( f ) ) : ! exceptionList.some( r => r.test( f ) ) );

	if ( isExactList ) {

		for ( let regexp of exactList ) {

			if ( ! files.some( f => regexp.test( f ) ) ) {

				console.log( `Warning! Unrecognised example name: ${ regexp.source.slice( 1, -1 ).replace( '.*', '*' ) }` );

			}

		}

	}

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

	const messages = [];
	
	let file, pageSize;

	page.on( 'console', msg => {

		if ( msg.type() !== 'warning' && msg.type() !== 'error' ) {

			return;

		}

		const text = file + ': ' + msg.text().replace( /\[\.WebGL-(.+?)\] /g, '' );

		if ( text.includes( 'GPU stall due to ReadPixels' ) || text.includes( 'GPUStatsPanel' ) ) {

			return;

		}

		if ( messages.includes( text ) ) {

			return;

		}

		messages.push( text );
		console.log( text );

	} );

	page.on( 'response', async ( response ) => {

		try {

			if ( response.status === 200 ) {

				await response.buffer().then( buffer => pageSize += buffer.length );

			}

		} catch {}

	} );

	/* Loop for each file, with CI parallelism */

	const failedScreenshots = [];

	const CI = process.env.CI === undefined || isMakeScreenshot ? null : parseInt( process.env.CI );
	const jobs = 8;

	for ( let fileID = 0; fileID < files.length; fileID ++ ) {

		if ( CI !== null && fileID % jobs !== CI ) {

			continue;

		}

		for ( let attemptID = 0; attemptID < numAttempts; attemptID ++ ) {

			/* Load target page */

			file = files[ fileID ];
			pageSize = 0;

			try {

				await page.goto( `http://localhost:${ port }/examples/${ file }.html`, {
					waitUntil: 'networkidle0',
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

				}, renderTimeout, pageSize / 1024 / 1024 * parseTime * 1000 );

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
	
	const numFiles = CI === null ? files.length : Math.floor( ( files.length - CI ) / jobs ) + 1;

	if ( isMakeScreenshot && failedScreenshots.length ) {

		console.red( `${ failedScreenshots.length } from ${ numFiles } screenshots have not generated succesfully.` );

	} else if ( isMakeScreenshot && ! failedScreenshots.length ) {

		console.green( `${ numFiles } screenshots succesfully generated.` );

	} else if ( failedScreenshots.length ) {

		const list = failedScreenshots.join( ' ' );
		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you sure that everything is correct, try to run \`npm run make-screenshot ${ list }\`. If this does not help, try increasing idleTime and parseTime variables in /test/e2e/puppeteer.js file. If this also does not help, add remaining screenshots to the exception list.` );
		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ numFiles } screenshots have not rendered correctly.` );

	} else {

		console.green( `TEST PASSED! ${ numFiles } screenshots rendered correctly.` );

	}

	setTimeout( () => {

		server.close();
		browser.close();
		process.exit( failedScreenshots.length );

	}, 300 );

}
