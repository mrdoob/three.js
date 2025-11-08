import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { Jimp } from 'jimp';
import * as fs from 'fs/promises';

const exceptionList = [

	// Take too long
	'webgpu_parallax_uv', 				// 11 min
	'webgpu_cubemap_adjustments', 		// 9 min
	'webgl_loader_lwo', 				// 8 min
	'webgpu_cubemap_mix', 				// 2 min
	'webgl_loader_texture_ultrahdr', 	// 1 min
	'webgl_marchingcubes', 				// 1 min
 	'webgl_materials_cubemap_dynamic', 	// 1 min
	'webgl_materials_displacementmap', 	// 1 min
	'webgl_materials_envmaps_hdr', 		// 1 min
	'webgpu_water', 					// 1 min

	// Needs investigation
	'physics_rapier_instancing',
	'webgl_shadowmap',
	'webgl_postprocessing_dof2',
	'webgl_video_kinect',
	'webgl_worker_offscreencanvas',
	'webgpu_backdrop_water',
	'webgpu_lightprobe_cubecamera',
	'webgpu_portal',
	'webgpu_postprocessing_ao',
	'webgpu_postprocessing_dof',
	'webgpu_postprocessing_ssgi',
	'webgpu_postprocessing_sss',
	'webgpu_postprocessing_traa',
	'webgpu_reflection',
	'webgpu_texturegrad',
	'webgpu_tsl_vfx_flames',

	// Need more time to render
	'css3d_mixed',
	'webgl_loader_3dtiles',
	'webgl_loader_texture_lottie',
	'webgl_morphtargets_face',
	'webgl_renderer_pathtracer',
	'webgl_shadowmap_progressive',
	'webgpu_materials_matcap',
	'webgpu_morphtargets_face',
	'webgpu_shadowmap_progressive',

	// Video hangs the CI?
	'css3d_youtube',
	'webgpu_materials_video',

	// Timeout
	'webgl_test_memory2',

	// Webcam
	'webgl_materials_video_webcam',
	'webgl_morphtargets_webcam',

	// WebGL device lost
	'webgpu_materialx_noise',
	'webgpu_portal',
	'webgpu_shadowmap',

	// WebGPU needed
	'webgpu_compute_audio',
	'webgpu_compute_birds',
	'webgpu_compute_cloth',
	'webgpu_compute_particles_fluid',
	'webgpu_compute_reduce',
	'webgpu_compute_sort_bitonic',
	'webgpu_compute_texture',
	'webgpu_compute_texture_3d',
	'webgpu_compute_texture_pingpong',
	'webgpu_compute_water',
	'webgpu_hdr',
	'webgpu_lights_tiled',
	'webgpu_materials',
	'webgpu_multiple_canvas',
	'webgpu_particles',
	'webgpu_struct_drawindirect',
	'webgpu_tsl_editor',
	'webgpu_tsl_interoperability',
	'webgpu_tsl_vfx_linkedparticles',
	'webgpu_tsl_wood'

];

/* Configuration */

const port = 1234;
const pixelThreshold = 0.1; // threshold error in one pixel
const maxDifferentPixels = 0.3; // at most 0.3% different pixels

const idleTime = 2; // 2 seconds - for how long there should be no network requests
const parseTime = 1; // 1 second per megabyte

const networkTimeout = 5; // 5 minutes, set to 0 to disable
const renderTimeout = 5; // 5 seconds, set to 0 to disable
const numAttempts = 2; // perform 2 attempts before failing
const numCIJobs = 5; // GitHub Actions run the script in 5 threads

const width = 400;
const height = 250;
const viewScale = 2;
const jpgQuality = 95;

console.red = msg => console.log( `\x1b[31m${msg}\x1b[39m` );
console.green = msg => console.log( `\x1b[32m${msg}\x1b[39m` );
console.yellow = msg => console.log( `\x1b[33m${msg}\x1b[39m` );

let browser;

/* Launch server */

const app = express();
app.use( express.static( path.resolve() ) );
const server = app.listen( port, main );

process.on( 'SIGINT', () => close() );

async function main() {

	/* Create output directory */

	try { await fs.rm( 'test/e2e/output-screenshots', { recursive: true, force: true } ); } catch {}
	try { await fs.mkdir( 'test/e2e/output-screenshots' ); } catch {}

	/* Find files */

	let isMakeScreenshot = false;
	let isWebGPU = false;

	let argvIndex = 2;

	if ( process.argv[ argvIndex ] === '--webgpu' ) {

		isWebGPU = true;
		argvIndex ++;

	}

	if ( process.argv[ argvIndex ] === '--make' ) {

		isMakeScreenshot = true;
		argvIndex ++;

	}

	const exactList = process.argv.slice( argvIndex )
		.map( f => f.replace( '.html', '' ) );

	const isExactList = exactList.length !== 0;

	let files = ( await fs.readdir( 'examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' && s !== 'index.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.includes( f ) : ! exceptionList.includes( f ) );

	if ( isExactList ) {

		for ( const file of exactList ) {

			if ( ! files.includes( file ) ) {

				console.log( `Warning! Unrecognised example name: ${ file }` );

			}

		}

	}

	if ( isWebGPU ) files = files.filter( f => f.includes( 'webgpu_' ) );

	/* CI parallelism */

	if ( 'CI' in process.env ) {

		const CI = parseInt( process.env.CI );

		files = files.slice(
			Math.floor( CI * files.length / numCIJobs ),
			Math.floor( ( CI + 1 ) * files.length / numCIJobs )
		);

	}

	/* Launch browser */

	const flags = [
		'--hide-scrollbars',
		'--use-angle=swiftshader',
		'--enable-unsafe-swiftshader',
		'--no-sandbox'
	];

	const viewport = { width: width * viewScale, height: height * viewScale };

	browser = await puppeteer.launch( {
		headless: process.env.VISIBLE ? false : 'new',
		args: flags,
		defaultViewport: viewport,
		handleSIGINT: false,
		protocolTimeout: 0,
		userDataDir: './.puppeteer_profile'
	} );

	/* Prepare injections */

	const buildInjection = ( code ) => code.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' );

	const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );
	const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );

	const builds = {
		'three.core.js': buildInjection( await fs.readFile( 'build/three.core.js', 'utf8' ) ),
		'three.module.js': buildInjection( await fs.readFile( 'build/three.module.js', 'utf8' ) ),
		'three.webgpu.js': buildInjection( await fs.readFile( 'build/three.webgpu.js', 'utf8' ) )
	};

	/* Prepare page */

	const errorMessagesCache = [];

	const page = await browser.newPage();
	await preparePage( page, injection, builds, errorMessagesCache );

	/* Loop for each file */

	const failedScreenshots = [];

	for ( const file of files ) {

		await makeAttempt( page, failedScreenshots, cleanPage, isMakeScreenshot, file );

	}

	/* Finish */

	failedScreenshots.sort();
	const list = failedScreenshots.join( ' ' );

	if ( isMakeScreenshot && failedScreenshots.length ) {

		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you are sure that everything is correct, try to run "npm run make-screenshot ${ list }". If this does not help, add remaining screenshots to the exception list.` );
		console.red( `${ failedScreenshots.length } from ${ files.length } screenshots have not generated successfully.` );

	} else if ( isMakeScreenshot && ! failedScreenshots.length ) {

		console.green( `${ files.length } screenshots successfully generated.` );

	} else if ( failedScreenshots.length ) {

		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you are sure that everything is correct, try to run "npm run make-screenshot ${ list }". If this does not help, add remaining screenshots to the exception list.` );
		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ files.length } screenshots have not rendered correctly.` );

	} else {

		console.green( `TEST PASSED! ${ files.length } screenshots rendered correctly.` );

	}

	setTimeout( close, 300, failedScreenshots.length );

}

async function preparePage( page, injection, builds, errorMessages ) {

	await page.evaluateOnNewDocument( injection );
	await page.setRequestInterception( true );

	page.on( 'console', async msg => {

		const type = msg.type();

		const file = page.file;

		if ( file === undefined ) {

			return;

		}

		const args = await Promise.all( msg.args().map( async arg => {
			try {
				return await arg.executionContext().evaluate( arg => arg instanceof Error ? arg.message : arg, arg );
			} catch ( e ) { // Execution context might have been already destroyed
				return arg;
			}
		} ) );

		let text = args.join( ' ' ); // https://github.com/puppeteer/puppeteer/issues/3397#issuecomment-434970058

		text = text.trim();
		if ( text === '' ) return;

		text = file + ': ' + text.replace( /\[\.WebGL-(.+?)\] /g, '' );

		if ( text === `${ file }: JSHandle@error` ) {

			text = `${ file }: Unknown error`;

		}

		if ( errorMessages.includes( text ) ) {

			return;

		}

		errorMessages.push( text );

		if ( type === 'warning' ) {

			console.yellow( text );

		} else if ( type === 'error' ) {

			page.error = text;

		} else {

			console.log( `[Browser] ${text}` );

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

		const url = request.url();

		for ( const build in builds ) {

			if ( url === `http://localhost:${ port }/build/${ build }` ) {

				await request.respond( {
					status: 200,
					contentType: 'application/javascript; charset=utf-8',
					body: builds[ build ]
				} );

				return;

			}

		}

		await request.continue();

	} );

}

async function makeAttempt( page, failedScreenshots, cleanPage, isMakeScreenshot, file, attemptID = 0 ) {

	try {

		page.file = file;
		page.pageSize = 0;
		page.error = undefined;

		/* Load target page */

		try {

			await page.goto( `http://localhost:${ port }/examples/${ file }.html`, {
				waitUntil: 'networkidle0',
				timeout: networkTimeout * 60000
			} );

		} catch ( e ) {

			throw new Error( `Error happened while loading file ${ file }: ${ e }` );

		}

		try {

			/* Render page */

			await page.evaluate( cleanPage );

			await page.waitForNetworkIdle( {
				timeout: networkTimeout * 60000,
				idleTime: idleTime * 1000
			} );

			await page.evaluate( async ( renderTimeout, parseTime ) => {

				await new Promise( resolve => setTimeout( resolve, parseTime ) );

				/* Resolve render promise */

				window._renderStarted = true;

				await new Promise( function ( resolve, reject ) {

					const renderStart = performance._now();

					const waitingLoop = setInterval( function () {

						const renderTimeoutExceeded = ( renderTimeout > 0 ) && ( performance._now() - renderStart > 1000 * renderTimeout );

						if ( renderTimeoutExceeded ) {

							clearInterval( waitingLoop );
							reject( 'Render timeout exceeded' );

						} else if ( window._renderFinished ) {

							clearInterval( waitingLoop );
							resolve();

						}

					}, 100 );

				} );

			}, renderTimeout, page.pageSize / 1024 / 1024 * parseTime * 1000 );

		} catch ( e ) {

			if ( e.includes && e.includes( 'Render timeout exceeded' ) === false ) {

				throw new Error( `Error happened while rendering file ${ file }: ${ e }` );

			} /* else { // This can mean that the example doesn't use requestAnimationFrame loop

				console.yellow( `Render timeout exceeded in file ${ file }` );

			} */ // TODO: fix this

		}

		const screenshot = ( await Jimp.read( await page.screenshot(), { quality: jpgQuality } ) ).scale( 1 / viewScale );

		if ( page.error !== undefined ) throw new Error( page.error );

		if ( isMakeScreenshot ) {

			/* Make screenshots */

			await screenshot.write( `examples/screenshots/${ file }.jpg` );

			console.green( `Screenshot generated for file ${ file }` );

		} else {

			/* Diff screenshots */

			let expected;

			try {

				expected = ( await Jimp.read( `examples/screenshots/${ file }.jpg`, { quality: jpgQuality } ) );

			} catch {

				await screenshot.write( `test/e2e/output-screenshots/${ file }-actual.jpg` );
				throw new Error( `Screenshot does not exist: ${ file }` );

			}

			const actual = screenshot.bitmap;
			const diff = screenshot.clone();

			let numDifferentPixels;

			try {

				numDifferentPixels = pixelmatch( expected.bitmap.data, actual.data, diff.bitmap.data, actual.width, actual.height, {
					threshold: pixelThreshold,
					alpha: 0.2
				} );

			} catch {

				await screenshot.write( `test/e2e/output-screenshots/${ file }-actual.jpg` );
				await expected.write( `test/e2e/output-screenshots/${ file }-expected.jpg` );
				throw new Error( `Image sizes does not match in file: ${ file }` );

			}

			/* Print results */

			const differentPixels = numDifferentPixels / ( actual.width * actual.height ) * 100;

			if ( differentPixels < maxDifferentPixels ) {

				console.green( `Diff ${ differentPixels.toFixed( 1 ) }% in file: ${ file }` );

			} else {

				await screenshot.write( `test/e2e/output-screenshots/${ file }-actual.jpg` );
				await expected.write( `test/e2e/output-screenshots/${ file }-expected.jpg` );
				await diff.write( `test/e2e/output-screenshots/${ file }-diff.jpg` );
				throw new Error( `Diff wrong in ${ differentPixels.toFixed( 1 ) }% of pixels in file: ${ file }` );

			}

		}

	} catch ( e ) {

		if ( attemptID === numAttempts - 1 ) {

			console.red( e );
			failedScreenshots.push( file );

		} else {

			console.yellow( `${ e }, another attempt...` );
			await makeAttempt( page, failedScreenshots, cleanPage, isMakeScreenshot, file, attemptID + 1 );

		}

	} finally {

		page.file = undefined; // release lock

	}

}

function close( exitCode = 1 ) {

	console.log( 'Closing...' );

	browser.close();
	server.close();
	process.exit( exitCode );

}
