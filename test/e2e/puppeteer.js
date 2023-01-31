import chalk from 'chalk';
import puppeteer, { BrowserFetcher } from 'puppeteer-core';
import express from 'express';
import path from 'path';
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

/* CONFIG VARIABLES START */

const idleTime = 3; // 3 seconds - for how long there should be no network requests
const parseTime = 2; // 2 seconds per megabyte

const exceptionList = [

	// video tag not deterministic enough
	'css3d_youtube',
	'webgl_video_kinect',
	'webgl_video_panorama_equirectangular',

	'webaudio_visualizer', // audio can't be analyzed without proper audio hook

	'webgl_effects_ascii', // blink renders text differently in every platform

	'webxr_ar_lighting', // webxr

	'webgl_worker_offscreencanvas', // in a worker, not robust

	// TODO: most of these can be fixed just by increasing idleTime and parseTime
	'webgl_buffergeometry_glbufferattribute',
	'webgl_lensflares',
	'webgl_lines_sphere',
	'webgl_loader_imagebitmap',
	'webgl_loader_texture_lottie',
	'webgl_loader_texture_pvrtc',
	'webgl_morphtargets_face',
	'webgl_nodes_materials_standard',
	'webgl_postprocessing_crossfade',
	'webgl_postprocessing_dof2',
	'webgl_raymarching_reflect',
	'webgl_renderer_pathtracer',
	'webgl_shadowmap_progressive',
	'webgl_test_memory2',
	'webgl_tiled_forward'

];

const macExceptionList = [

	'physics_oimo_instancing',
	'webgl2_multisampled_renderbuffers',
	'webgl2_ubo',
	'webgl_animation_keyframes',
	'webgl_animation_skinning_additive_blending',
	'webgl_animation_skinning_ik',
	'webgl_buffergeometry_compression',
	'webgl_buffergeometry_custom_attributes_particles',
	'webgl_buffergeometry_indexed',
	'webgl_buffergeometry_instancing_billboards',
	'webgl_buffergeometry_lines_indexed',
	'webgl_buffergeometry_points_interleaved',
	'webgl_buffergeometry_uint',
	'webgl_camera',
	'webgl_camera_array',
	'webgl_camera_logarithmicdepthbuffer',
	'webgl_clipping',
	'webgl_clipping_advanced',
	'webgl_custom_attributes',
	'webgl_custom_attributes_points3',
	'webgl_decals',
	'webgl_depth_texture',
	'webgl_framebuffer_texture',
	'webgl_furnace_test',
	'webgl_geometry_extrude_shapes2',
	'webgl_gpgpu_birds_gltf',
	'webgl_gpgpu_protoplanet',
	'webgl_instancing_scatter',
	'webgl_interactive_buffergeometry',
	'webgl_interactive_raycasting_points',
	'webgl_interactive_voxelpainter',
	'webgl_lightningstrike',
	'webgl_lightprobe_cubecamera',
	'webgl_loader_gltf_compressed',
	'webgl_loader_gltf_instancing',
	'webgl_loader_ifc',
	'webgl_loader_ply',
	'webgl_loader_svg',
	'webgl_loader_texture_dds',
	'webgl_materials_envmaps_groundprojected',
	'webgl_materials_envmaps_hdr',
	'webgl_materials_variations_lambert',
	'webgl_materials_variations_standard',
	'webgl_materials_variations_toon',
	'webgl_mirror',
	'webgl_modifier_subdivision',
	'webgl_multiple_renderers',
	'webgl_performance_shader',
	'webgl_pmrem_test',
	'webgl_points_waves',
	'webgl_postprocessing_sao',
	'webgl_postprocessing_smaa',
	'webgl_postprocessing_ssaa',
	'webgl_postprocessing_ssao',
	'webgl_postprocessing_unreal_bloom_selective',
	'webgl_shaders_tonemapping',
	'webgl_shadow_contact',
	'webgl_shadowmap',
	'webgl_shadowmap_vsm',
	'webgl_shadowmesh',
	'webgl_tonemapping'

];

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
const maxFailedPixels = 0.05; // at most 5% different pixels

const networkTimeout = 30; // 30 seconds, set to 0 to disable
const renderTimeout = 1.5; // 1.5 seconds, set to 0 to disable

const numAttempts = 3; // perform 3 progressive attempts before failing

const numPages = 16; // use 16 browser pages

const numCIJobs = 3; // GitHub Actions run the script in 3 threads

const width = 400;
const height = 250;
const viewScale = 2;
const jpgQuality = 95;

console.red = msg => console.log( chalk.red( msg ) );
console.yellow = msg => console.log( chalk.yellow( msg ) );
console.green = msg => console.log( chalk.green( msg ) );

let browser;

/* Launch server */

const app = express();
app.use( express.static( path.resolve() ) );
const server = app.listen( port, main );

process.on( 'SIGINT', () => close() );

async function main() {

	/* Find files */

	const isMakeScreenshot = process.argv[ 2 ] === '--make';

	const exactList = process.argv.slice( isMakeScreenshot ? 3 : 2 )
		.map( f => f.replace( '.html', '' ) );

	const isExactList = exactList.length !== 0;

	const filesExceptionList = process.platform === 'darwin' ? exceptionList.concat( macExceptionList ) : exceptionList;

	let files = ( await fs.readdir( 'examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' && s !== 'index.html' )
		.map( s => s.slice( 0, s.length - 5 ) )
		.filter( f => isExactList ? exactList.includes( f ) : ! filesExceptionList.includes( f ) );

	if ( isExactList ) {

		for ( const file of exactList ) {

			if ( ! files.includes( file ) ) {

				console.log( `Warning! Unrecognised example name: ${ file }` );

			}

		}

	}

	/* CI parallelism */

	if ( 'CI' in process.env ) {

		const CI = parseInt( process.env.CI );

		files = files.slice(
			Math.floor( CI * files.length / numCIJobs ),
			Math.floor( ( CI + 1 ) * files.length / numCIJobs )
		);

	}

	/* Download browser */

	const { executablePath } = await downloadLatestChromium();

	/* Launch browser */

	const flags = [ '--hide-scrollbars', '--enable-unsafe-webgpu' ];
	flags.push( '--enable-features=Vulkan', '--use-gl=swiftshader', '--use-angle=swiftshader', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader' );
	// if ( process.platform === 'linux' ) flags.push( '--enable-features=Vulkan,UseSkiaRenderer', '--use-vulkan=native', '--disable-vulkan-surface', '--disable-features=VaapiVideoDecoder', '--ignore-gpu-blocklist', '--use-angle=vulkan' );

	const viewport = { width: width * viewScale, height: height * viewScale };

	browser = await puppeteer.launch( {
		executablePath,
		headless: ! process.env.VISIBLE,
		args: flags,
		defaultViewport: viewport,
		handleSIGINT: false
	} );

	// this line is intended to stop the script if the browser (in headful mode) is closed by user (while debugging)
	// browser.on( 'targetdestroyed', target => ( target.type() === 'other' ) ? close() : null );
	// for some reason it randomly stops the script after about ~30 screenshots processed

	/* Prepare injections */

	const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );
	const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );
	const build = ( await fs.readFile( 'build/three.module.js', 'utf8' ) ).replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' );

	/* Prepare pages */

	const errorMessagesCache = [];

	const pages = await browser.pages();
	while ( pages.length < numPages && pages.length < files.length ) pages.push( await browser.newPage() );

	for ( const page of pages ) await preparePage( page, injection, build, errorMessagesCache );

	/* Loop for each file */

	const failedScreenshots = [];

	const queue = new PromiseQueue( makeAttempt, pages, failedScreenshots, cleanPage, isMakeScreenshot );
	for ( const file of files ) queue.add( file );
	await queue.waitForAll();

	/* Finish */

	failedScreenshots.sort();
	const list = failedScreenshots.join( ' ' );

	if ( isMakeScreenshot && failedScreenshots.length ) {

		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you are sure that everything is correct, try to run "npm run make-screenshot ${ list }". If this does not help, try increasing idleTime and parseTime variables in /test/e2e/puppeteer.js file. If this also does not help, add remaining screenshots to the exception list.` );
		console.red( `${ failedScreenshots.length } from ${ files.length } screenshots have not generated succesfully.` );

	} else if ( isMakeScreenshot && ! failedScreenshots.length ) {

		console.green( `${ files.length } screenshots succesfully generated.` );

	} else if ( failedScreenshots.length ) {

		console.red( 'List of failed screenshots: ' + list );
		console.red( `If you are sure that everything is correct, try to run "npm run make-screenshot ${ list }". If this does not help, try increasing idleTime and parseTime variables in /test/e2e/puppeteer.js file. If this also does not help, add remaining screenshots to the exception list.` );
		console.red( `TEST FAILED! ${ failedScreenshots.length } from ${ files.length } screenshots have not rendered correctly.` );

	} else {

		console.green( `TEST PASSED! ${ files.length } screenshots rendered correctly.` );

	}

	setTimeout( close, 300, failedScreenshots.length );

}

async function downloadLatestChromium() {

	const browserFetcher = new BrowserFetcher( { path: 'test/e2e/chromium' } );

	const lastRevisionURL = LAST_REVISION_URLS[ browserFetcher.platform() ];
	const revision = await ( await fetch( lastRevisionURL ) ).text();

	let revisionInfo = browserFetcher.revisionInfo( revision );
	if ( revisionInfo.local === true ) {

		console.log( 'Latest Chromium has been already downloaded.' );

	} else {

		console.log( 'Downloading latest Chromium...' );
		revisionInfo = await browserFetcher.download( revision );
		console.log( 'Downloaded.' );

	}
	return revisionInfo;

}

async function preparePage( page, injection, build, errorMessages ) {

	/* let page.file, page.pageSize, page.error */

	await page.evaluateOnNewDocument( injection );
	await page.setRequestInterception( true );

	page.on( 'console', async msg => {

		const type = msg.type();

		if ( type !== 'warning' && type !== 'error' ) {

			return;

		}

		const file = page.file;

		if ( file === undefined ) {

			return;

		}

		const args = await Promise.all( msg.args().map( async arg => {
			try {
				return await arg.executionContext().evaluate( arg => arg instanceof Error ? arg.message : arg, arg );
			} catch (e) { // Execution context might have been already destroyed
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

		if ( text.includes( 'Unable to access the camera/webcam' ) ) {

			return;

		}

		if ( errorMessages.includes( text ) ) {

			return;

		}

		errorMessages.push( text );

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

}

async function makeAttempt( pages, failedScreenshots, cleanPage, isMakeScreenshot, file, attemptID = 0 ) {

	const timeoutCoefficient = attemptID + 1;

	const page = await new Promise( ( resolve, reject ) => {

		const interval = setInterval( () => {

			for ( const page of pages ) {

				if ( page.file === undefined ) {

					page.file = file; // acquire lock
					clearInterval( interval );
					resolve( page );
					break;

				}

			}

		}, 100 );

	} );

	try {

		page.pageSize = 0;
		page.error = undefined;

		/* Load target page */

		try {

			await page.goto( `http://localhost:${ port }/examples/${ file }.html`, {
				waitUntil: 'networkidle0',
				timeout: networkTimeout * timeoutCoefficient * 1000
			} );

		} catch ( e ) {

			throw new Error( `Error happened while loading file ${ file }: ${ e }` );

		}

		try {

			/* Render page */

			await page.evaluate( cleanPage );

			await page.waitForNetworkIdle( {
				timeout: networkTimeout * timeoutCoefficient * 1000,
				idleTime: idleTime * timeoutCoefficient * 1000
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

					}, 10 );

				} );

			}, renderTimeout * timeoutCoefficient, page.pageSize / 1024 / 1024 * parseTime * 1000 * timeoutCoefficient );

		} catch ( e ) {

			if ( ! e.message.includes( 'Render timeout exceeded' ) ) {

				throw new Error( `Error happened while rendering file ${ file }: ${ e }` );

			} /* else { // This can mean that the example doesn't use requestAnimationFrame loop

				console.yellow( `Render timeout exceeded in file ${ file }` );

			} */ // TODO: fix this

		}

		const screenshot = ( await jimp.read( await page.screenshot() ) ).scale( 1 / viewScale ).quality( jpgQuality );

		if ( page.error !== undefined ) throw new Error( page.error );

		if ( isMakeScreenshot ) {

			/* Make screenshots */

			await screenshot.writeAsync( `examples/screenshots/${ file }.jpg` );

			console.green( `Screenshot generated for file ${ file }` );

		} else {

			/* Diff screenshots */

			let expected;

			try {

				expected = await jimp.read( `examples/screenshots/${ file }.jpg` );

			} catch {

				throw new Error( `Screenshot does not exist: ${ file }` );

			}

			const actual = screenshot.bitmap;
			const diff = screenshot.clone();

			let numFailedPixels;

			try {

				numFailedPixels = pixelmatch( expected.bitmap.data, actual.data, diff.bitmap.data, actual.width, actual.height, {
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

			const percFailedPixels = 100 * numFailedPixels;

			if ( numFailedPixels < maxFailedPixels ) {

				console.green( `Diff ${ percFailedPixels.toFixed( 1 ) }% in file: ${ file }` );

			} else {

				throw new Error( `Diff wrong in ${ percFailedPixels.toFixed( 1 ) }% of pixels in file: ${ file }` );

			}

		}

	} catch ( e ) { 

		if ( attemptID === numAttempts - 1 ) {

			console.red( e );
			failedScreenshots.push( file );

		} else {

			if ( ! e.message.includes( 'TimeoutError' ) ) { // TODO: fix this

				console.yellow( `${ e }, another attempt...` );

			}
			this.add( file, attemptID + 1 );

		}

	}

	page.file = undefined; // release lock

}

function close( exitCode = 1 ) {

	console.log( 'Closing...' );

	if ( browser !== undefined ) browser.close();
	server.close();
	process.exit( exitCode );

}
