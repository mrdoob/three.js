/**
 * @author munrocket / https://github.com/munrocket
 */

const puppeteer = require( 'puppeteer' );
const handler = require( 'serve-handler' );
const http = require( 'http' );
const pixelmatch = require( 'pixelmatch' );
const printImage = require( 'image-output' );
const png = require( 'pngjs' ).PNG;
const fs = require( 'fs' );

const port = 1234;
const pixelThreshold = 0.2; // threshold error in one pixel
const maxFailedPixels = 0.05; // total failed pixels

const exceptionList = [

	'index',
	'css3d_youtube', // video tag not deterministic enough
	'webgl_kinect', // same here
	'webaudio_visualizer', // audio can't be analyzed without proper audio hook
	'webgl_loader_texture_pvrtc', // not supported in CI, useless
	'webgl_materials_envmaps_parallax',
	'webgl_test_memory2', // gives fatal error in puppeteer
	'webgl_worker_offscreencanvas', // in a worker, not robust
	'webgl2_multisampled_renderbuffers'

].concat( ( process.platform === "win32" ) ? [

	'webgl_effects_ascii' // windows fonts not supported

] : [] );

const networkTimeout = 600;
const networkTax = 2000; // additional timeout for resources size
const pageSizeMinTax = 1.0; // in mb, when networkTax = 0
const pageSizeMaxTax = 5.0; // in mb, when networkTax = networkTax
const renderTimeout = 1200;
const maxAttemptId = 3; // progresseve attempts
const progressFunc = n => 1 + n;

console.green = ( msg ) => console.log( `\x1b[32m${ msg }\x1b[37m` );
console.red = ( msg ) => console.log( `\x1b[31m${ msg }\x1b[37m` );
console.null = () => {};


/* Launch server */

const server = http.createServer( ( req, resp ) => handler( req, resp ) );
server.listen( port, async () => await pup );
server.on( 'SIGINT', () => process.exit( 1 ) );


/* Launch puppeteer with WebGL support in Linux */

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
	await page.setViewport( { width: 800, height: 600 } );

	const cleanPage = fs.readFileSync( 'test/e2e/clean-page.js', 'utf8' );
	const injection = fs.readFileSync( 'test/e2e/deterministic-injection.js', 'utf8' );
	await page.evaluateOnNewDocument( injection );

	page.on( 'console', msg => ( msg.text().slice( 0, 8 ) === 'Warning.' ) ? console.null( msg.text() ) : {} );
	page.on( 'response', async ( response ) => {

		try {

			await response.buffer().then( buffer => pageSize += buffer.length );

		} catch ( e ) {

			console.null( `Warning. Wrong request. \n${ e }` );

		}

	} );


	/* Find files */

	const exactList = process.argv.slice( 2 ).map( f => f.replace( '.html', '' ) );

	const files = fs.readdirSync( './examples' )
		.filter( s => s.slice( - 5 ) === '.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => ( process.argv.length > 2 ) ? exactList.includes( f ) : ! exceptionList.includes( f ) );


	/* Loop for each file, with CI parallelism */

	let pageSize, file, attemptProgress;
	let failedScreenshots = [];
	const isParallel = 'CI' in process.env;
	const beginId = isParallel ? Math.floor( parseInt( process.env.CI.slice( 0, 1 ) ) * files.length / 4 ) : 0;
	const endId = isParallel ? Math.floor( ( parseInt( process.env.CI.slice( - 1 ) ) + 1 ) * files.length / 4 ) : files.length;

	for ( let id = beginId; id < endId; ++ id ) {


		/* At least 3 attempts before fail */

		let attemptId = process.env.MAKE ? 1 : 0;

		while ( attemptId < maxAttemptId ) {


			/* Load target page */

			file = files[ id ];
			attemptProgress = progressFunc( attemptId );
			pageSize = 0;
			global.gc();
			global.gc();

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

					let resourcesSize = Math.min( 1, ( pageSize / 1024 / 1024 - pageSizeMinTax ) / pageSizeMaxTax );
					await new Promise( resolve => setTimeout( resolve, networkTax * resourcesSize * attemptProgress ) );


					/* Resolve render promise */

					window.chromeRenderStarted = true;
					await new Promise( function ( resolve ) {

						if ( typeof performance.wow === 'undefined' ) {

							performance.wow = performance.now;

						}
						let renderStart = performance.wow();
						let waitingLoop = setInterval( function () {

							let renderEcceded = ( performance.wow() - renderStart > renderTimeout * attemptProgress );
							if ( window.chromeRenderFinished || renderEcceded ) {

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

					console.red( `WTF? 'Network timeout' is small for your machine. file: ${ file } \n${ e }` );
					failedScreenshots.push( file );
					continue;

				} else {

					console.log( 'Another attempt..' );
					await new Promise( resolve => setTimeout( resolve, networkTimeout * attemptProgress ) );

				}

			}


			/* Make or diff? */

			if ( process.env.MAKE ) {


				/* Make screenshots */

				attemptId = maxAttemptId;
				await page.screenshot( { path: `./examples/screenshots/${ file }.png` } );
				printImage( png.sync.read( fs.readFileSync( `./examples/screenshots/${ file }.png` ) ), console );
				console.green( `file: ${ file } generated` );


			} else if ( fs.existsSync( `./examples/screenshots/${ file }.png` ) ) {


				/* Diff screenshots */

				let actual = png.sync.read( await page.screenshot() );
				let expected = png.sync.read( fs.readFileSync( `./examples/screenshots/${ file }.png` ) );
				let diff = new png( { width: actual.width, height: actual.height } );

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
					console.red( `ERROR! Image sizes does not match in file: ${ file }` );
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

						printImage( diff, console );
						console.red( `ERROR! Diff wrong in ${ numFailedPixels.toFixed( 3 ) } of pixels in file: ${ file }` );
						failedScreenshots.push( file );
						continue;

					} else {

						console.log( 'Another attempt...' );

					}

				}

			} else {

				attemptId = maxAttemptId;
				console.null( `Warning! Screenshot not exists: ${ file }` );
				continue;

			}

		}

	}


	/* Finish */

	if ( failedScreenshots.length ) {

		if ( failedScreenshots.length > 1 ) {

			console.red( 'List of failed screenshots: ' + failedScreenshots.join(' ') );

		} else {

			console.red( `If you sure that all is right, try to run \`npm run make-screenshot ${ failedScreenshots[ 0 ] }\`` );

		}

		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ endId - beginId } screenshots not pass.` );

	} else if ( ! process.env.MAKE ) {

		console.green( `TEST PASSED! ${ endId - beginId } screenshots correctly rendered.` );

	}

	browser.close();
	server.close();
	process.exit( failedScreenshots.length );

} );
