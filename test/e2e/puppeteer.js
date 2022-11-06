import puppeteer from 'puppeteer';
import handler from 'serve-handler';
import http from 'http';
import pixelmatch from 'pixelmatch';
import jimp from 'jimp';
import fs from 'fs';

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

	'index',
	'css3d_youtube', // video tag not deterministic enough
	'webaudio_visualizer', // audio can't be analyzed without proper audio hook
	'webgl_effects_ascii', // blink renders text differently in every platform
	'webgl_loader_imagebitmap', // takes too long to load?
	'webgl_loader_texture_lottie', // not sure why this fails
	'webgl_loader_texture_pvrtc', // not supported in CI, useless
	'webgl_morphtargets_face', // To investigate...
	'webgl_nodes_materials_standard', // puppeteer does not support import maps yet
	'webgl_postprocessing_crossfade', // fails for some misterious reason
	'webgl_raymarching_reflect', // exception for Github Actions
	'webgl_renderer_pathtracer', // slow to render
	'webgl_test_memory2', // gives fatal error in puppeteer
	'webgl_tiled_forward', // exception for Github Actions
	'webgl_video_kinect', // video tag not deterministic enough
	'webgl_video_panorama_equirectangular', // video tag not deterministic enough?
	'webgl_worker_offscreencanvas', // in a worker, not robust
	// webxr
	'webxr_ar_lighting',
	// webgpu
	'webgpu_audio_processing',
	'webgpu_compute',
	'webgpu_cubemap_adjustments',
	'webgpu_cubemap_mix',
	'webgpu_depth_texture',
	'webgpu_equirectangular',
	'webgpu_instance_mesh',
	'webgpu_instance_uniform',
	'webgpu_lights_custom',
	'webgpu_lights_selective',
	'webgpu_loader_gltf',
	'webgpu_materials',
	'webgpu_nodes_playground',
	'webgpu_particles',
	'webgpu_rtt',
	'webgpu_sandbox',
	'webgpu_skinning_instancing',
	'webgpu_skinning_points',
	'webgpu_skinning',
	'webgpu_sprites'
].concat( ( process.platform === 'win32' ) ? [

	'webgl_effects_ascii' // windows fonts not supported

] : [] );

console.green = ( msg ) => console.log( `\x1b[32m${ msg }\x1b[37m` );
console.red = ( msg ) => console.log( `\x1b[31m${ msg }\x1b[37m` );
console.null = () => {};


/* Launch server */

const server = http.createServer( ( req, resp ) => handler( req, resp ) );
server.listen( port, async () => await pup );
server.on( 'SIGINT', () => process.exit( 1 ) );


/* Launch browser */

const pup = puppeteer.launch( {
	headless: ! process.env.VISIBLE,
	args: [
		'--use-gl=swiftshader',
		'--no-sandbox',
		'--enable-surface-synchronization'
	]
} ).then( async browser => {


	/* Prepare page */

	const page = ( await browser.pages() )[ 0 ];
	await page.setViewport( { width: width * viewScale, height: height * viewScale } );

	const cleanPage = fs.readFileSync( 'test/e2e/clean-page.js', 'utf8' );
	const injection = fs.readFileSync( 'test/e2e/deterministic-injection.js', 'utf8' );
	await page.evaluateOnNewDocument( injection );

	const threeJsBuild = fs.readFileSync( 'build/three.module.js', 'utf8' )
		.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' );
	await page.setRequestInterception( true );

	page.on( 'console', msg => ( msg.text().slice( 0, 8 ) === 'Warning.' ) ? console.null( msg.text() ) : {} );
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

			await response.buffer().then( buffer => pageSize += buffer.length );

		} catch ( e ) {

			console.null( `Warning. Wrong request. \n${ e }` );

		}

	} );


	/* Find files */

	const isMakeScreenshot = process.argv[ 2 ] == '--make';
	const isExactList = process.argv.length > ( 2 + isMakeScreenshot );

	const exactList = process.argv.slice( isMakeScreenshot ? 3 : 2 )
		.map( f => f.replace( '.html', '' ) );

	const files = fs.readdirSync( './examples' )
		.filter( s => s.slice( - 5 ) === '.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.includes( f ) : ! exceptionList.includes( f ) );


	/* Loop for each file, with CI parallelism */

	let pageSize, file, attemptProgress;
	const failedScreenshots = [];

	let beginId = 0;
	let endId = files.length;

	if ( 'CI' in process.env ) {

		const jobs = 8;

		beginId = Math.floor( parseInt( process.env.CI.slice( 0, 1 ) ) * files.length / jobs );
		endId = Math.floor( ( parseInt( process.env.CI.slice( - 1 ) ) + 1 ) * files.length / jobs );

	}

	for ( let id = beginId; id < endId; ++ id ) {

		/* At least 3 attempts before fail */

		let attemptId = isMakeScreenshot ? 1.5 : 0;

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

				console.null( 'Warning. Network timeout exceeded...' );

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

						performance._now = performance._now || performance.now;

						const renderStart = performance._now();

						const waitingLoop = setInterval( function () {

							const renderEcceded = ( performance._now() - renderStart > renderTimeout * attemptProgress );
							if ( window._renderFinished || renderEcceded ) {

								if ( renderEcceded ) {

									console.log( 'Warning. Render timeout exceeded...' );

								}

								clearInterval( waitingLoop );
								resolve();

							}

						}, 0 );

					} );

				}, pageSize, pageSizeMinTax, pageSizeMaxTax, networkTax, renderTimeout, attemptProgress );

			} catch ( e ) {

				if ( ++ attemptId === maxAttemptId ) {

					console.red( `Something completely wrong. 'Network timeout' is small for your machine. file: ${ file } \n${ e }` );
					failedScreenshots.push( file );
					continue;

				} else {

					console.log( 'Another attempt..' );
					await new Promise( resolve => setTimeout( resolve, networkTimeout * attemptProgress ) );

				}

			}


			if ( isMakeScreenshot ) {


				/* Make screenshots */

				attemptId = maxAttemptId;
				( await jimp.read( await page.screenshot() ) )
					.scale( 1 / viewScale ).quality( jpgQuality )
					.write( `./examples/screenshots/${ file }.jpg` );

				console.green( `file: ${ file } generated` );


			} else if ( fs.existsSync( `./examples/screenshots/${ file }.jpg` ) ) {


				/* Diff screenshots */

				const actual = ( await jimp.read( await page.screenshot() ) ).scale( 1 / viewScale ).quality( jpgQuality ).bitmap;
				const expected = ( await jimp.read( fs.readFileSync( `./examples/screenshots/${ file }.jpg` ) ) ).bitmap;
				const diff = actual;

				let numFailedPixels;

				try {

					numFailedPixels = pixelmatch( expected.data, actual.data, diff.data, actual.width, actual.height, {
						threshold: pixelThreshold,
						alpha: 0.2,
						diffMask: process.env.FORCE_COLOR === '0',
						diffColor: process.env.FORCE_COLOR === '0' ? [ 255, 255, 255 ] : [ 255, 0, 0 ]
					} );

				} catch {

					attemptId = maxAttemptId;
					console.red( `Something completely wrong. Image sizes does not match in file: ${ file }` );
					failedScreenshots.push( file );
					continue;

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
						continue;

					} else {

						console.log( 'Another attempt...' );

					}

				}

			} else {

				attemptId = maxAttemptId;
				console.log( `Warning! Screenshot not exists: ${ file }` );
				continue;

			}

		}

	}


	/* Finish */

	if ( failedScreenshots.length ) {

		if ( failedScreenshots.length > 1 ) {

			console.red( 'List of failed screenshots: ' + failedScreenshots.join( ' ' ) );

		} else {

			console.red( `If you sure that all is right, try to run \`npm run make-screenshot ${ failedScreenshots[ 0 ] }\`` );

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

} );
