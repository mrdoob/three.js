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
const pixelThreshold = 0.1; // threshold error in one pixel
const maxFailedPixels = 0.05; // total failed pixels

const networkTimeout = 600;
const networkTax = 2000; // additional timeout for resources size
const pageSizeMinTax = 1.0; // in mb, when networkTax = 0
const pageSizeMaxTax = 5.0; // in mb, when networkTax = networkTax
const renderTimeout = 1200;
const maxAttemptId = 3; // progresseve attempts
const progressFunc = n => 1 + n;

const width = 400;
const height = 250;
const viewScale = 2;
const jpgQuality = 95;

const exceptionList = [

	// TODO: retest these examples

	'index',
	'css3d_youtube', // video tag not deterministic enough
	'webaudio_visualizer', // audio can't be analyzed without proper audio hook
	'webgl_effects_ascii', // blink renders text differently in every platform
	'webgl_loader_imagebitmap', // takes too long to load?
	'webgl_loader_texture_lottie', // not sure why this fails
	'webgl_loader_texture_pvrtc', // not supported in CI, useless
	'webgl_morphtargets_face', // To investigate...
	'webgl_postprocessing_crossfade', // fails for some misterious reason
	'webgl_raymarching_reflect', // exception for Github Actions
	'webgl_test_memory2', // gives fatal error in puppeteer
	'webgl_tiled_forward', // exception for Github Actions
	'webgl_video_kinect', // video tag not deterministic enough
	'webgl_video_panorama_equirectangular', // video tag not deterministic enough?
	'webgl_worker_offscreencanvas', // in a worker, not robust
	'webxr_ar_lighting', // webxr
	
	// TODO: fix those examples
	
	'webgl_materials_standard_nodes', // puppeteer does not support import maps yet
	'webgpu_compute', // webgpu
	'webgpu_cubemap_mix', // webgpu
	'webgpu_depth_texture', // webgpu
	'webgpu_instance_mesh', // webgpu
	'webgpu_instance_uniform', // webgpu
	'webgpu_lights_custom', // webgpu
	'webgpu_lights_selective', // webgpu
	'webgpu_loader_gltf', // webgpu
	'webgpu_materials', // webgpu
	'webgpu_nodes_playground', // webgpu
	'webgpu_rtt', // webgpu
	'webgpu_sandbox', // webgpu
	'webgpu_skinning_instancing', // webgpu
	'webgpu_skinning_points', // webgpu
	'webgpu_skinning' // webgpu

];

console.green = ( msg ) => console.log( `\x1b[32m${ msg }\x1b[37m` );
console.red = ( msg ) => console.log( `\x1b[31m${ msg }\x1b[37m` );
console.null = console.log; // () => {};

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
	return revisionInfo.local === true ? revisionInfo : await browserFetcher.download( revision );

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
			'--enable-surface-synchronization',

			//'--enable-unsafe-webgpu'
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

	page.on( 'console', msg => ( msg.type() === 'warning' || msg.type() === 'error' ) ? console.null( msg.text() ) : null );
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
	page.on( 'response', async ( response ) => {

		try {

			if ( response.status === 200 ) {

				await response.buffer().then( buffer => pageSize += buffer.length );

			}

		} catch ( e ) {

			console.null( `Warning. Wrong request. \n${ e }` );

		}

	} );

	/* Find files */

	const isMakeScreenshot = process.argv[ 2 ] === '--make';

	const exactList = process.argv.slice( isMakeScreenshot ? 3 : 2 )
		.map( f => f.replace( '.html', '' ) );

	const isExactList = exactList.length !== 0;

	const files = ( await fs.readdir( './examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.includes( f ) : ! exceptionList.includes( f ) );

	/* Loop for each file, with CI parallelism */

	let pageSize, file, attemptProgress;
	const failedScreenshots = [];

	let beginId = 0;
	let endId = files.length;

	if ( process.env.CI !== undefined ) {

		const jobs = 8;

		beginId = Math.floor( parseInt( process.env.CI.slice( 0, 1 ) ) * files.length / jobs );
		endId = Math.floor( ( parseInt( process.env.CI.slice( - 1 ) ) + 1 ) * files.length / jobs );

	}

	for ( let id = beginId; id < endId; ++ id ) {

		let attemptId = 0;

		/* At least 3 attempts before fail */

		while ( attemptId < maxAttemptId ) {

			/* Load target page */

			file = files[ id ];
			attemptProgress = progressFunc( attemptId );
			pageSize = 0;

			try {

				await page.goto( `http://localhost:${ port }/examples/${ file }.html`, {
					waitUntil: 'networkidle2',
					timeout: networkTimeout * attemptProgress
				} );

			} catch {

				if ( ++ attemptId === maxAttemptId ) {

					console.red( `ERROR! Network timeout exceeded while loading file ${ file }` );
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

				await page.evaluate( async ( pageSize, pageSizeMinTax, pageSizeMaxTax, networkTax, renderTimeout, attemptProgress ) => {

					/* Resource timeout */

					const resourcesSize = Math.min( 1, ( pageSize / 1024 / 1024 - pageSizeMinTax ) / pageSizeMaxTax );
					await new Promise( resolve => setTimeout( resolve, networkTax * resourcesSize * attemptProgress ) );

					/* Resolve render promise */

					window._renderStarted = true;

					await new Promise( function ( resolve ) {

						const renderStart = performance._now();

						const waitingLoop = setInterval( function () {

							const renderExceeded = ( performance._now() - renderStart > renderTimeout * attemptProgress );

							if ( renderExceeded ) {

								console.log( 'Warning. Render timeout exceeded...' );

							}

							if ( window._renderFinished || renderExceeded ) {

								clearInterval( waitingLoop );
								resolve();

							}

						}, 0 );

					} );

				}, pageSize, pageSizeMinTax, pageSizeMaxTax, networkTax, renderTimeout, attemptProgress );

			} catch ( e ) {

				if ( ++ attemptId === maxAttemptId ) {

					console.red( `ERROR! Network timeout exceeded while loading file ${ file }` );
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

						attemptId = maxAttemptId;
						console.green( `diff: ${ numFailedPixels.toFixed( 3 ) }, file: ${ file }` );

					} else {

						if ( ++ attemptId === maxAttemptId ) {

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

	if ( failedScreenshots.length ) {

		if ( failedScreenshots.length > 1 ) {

			console.red( 'List of failed screenshots: ' + failedScreenshots.join( ' ' ) );

		} else {

			console.red( `If you sure that everything is right, try to run \`npm run make-screenshot ${ failedScreenshots[ 0 ] }\`` );

		}

		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ endId - beginId } screenshots not pass.` );

	} else if ( ! isMakeScreenshot ) {

		console.green( `TEST PASSED! ${ endId - beginId } screenshots correctly rendered.` );

	}

	setTimeout( () => {

		server.close();
		browser.close();
		process.exit( failedScreenshots.length );

	}, 300 );

}