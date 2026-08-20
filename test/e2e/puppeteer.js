import puppeteer from 'puppeteer';
import pLimit from 'p-limit';
import * as os from 'os';
import { Image } from './image.js';
import * as fs from 'fs/promises';
import { createServer } from '../../utils/server.js';

const server = createServer();

const exceptionList = [

	// Take too long
	'webgpu_cubemap_mix', 				// 2 min
	'webgl_loader_texture_ultrahdr', 	// 1 min
	'webgl_marchingcubes', 				// 1 min
 	'webgl_materials_cubemap_dynamic', 	// 1 min
	'webgl_materials_displacementmap', 	// 1 min
	'webgl_materials_envmaps_hdr', 		// 1 min
	'webgpu_water', 					// 1 min

	// Requires HTML-in-Canvas API
	'webgl_materials_texture_html',
	'webgpu_materials_texture_html',

	// Black screen
	'webgpu_postprocessing_ao',
	'webgpu_postprocessing_dof',
	'webgpu_postprocessing_ssgi',
	'webgpu_postprocessing_ssgi_ballpool',
	'webgpu_postprocessing_sss',
	'webgpu_postprocessing_traa',
	'webgpu_tsl_vfx_linkedparticles',
	'webgpu_volume_lighting_traa',

	// Timming issues?
	'physics_rapier_instancing',
	'webgl_shadowmap',
	'webaudio_visualizer',
	'webgpu_compute_audio',
	'webgpu_compute_cloth',
	'webgpu_compute_particles_fluid',
	'webgpu_compute_rasterizer_ibl', // Rasterizer discrepancies
	'webgpu_compute_sort_bitonic',
	'webgpu_storage_buffer',
	'webgpu_tsl_editor',
	'webgpu_tsl_graph',
	'webxr_vr_video',
	'webgpu_tsl_transpiler',
	'webgpu_rendertarget_2d-array_3d',
	'webgpu_volume_fire',

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
	'webgpu_postprocessing_ssr_denoise',

	// Video hangs the CI?
	'css3d_youtube',
	'webgpu_materials_video',
	'webgl_video_kinect',
	'webgl_video_panorama_equirectangular',

	// Timeout
	'webgl_test_memory2',

	// Webcam
	'webgl_materials_video_webcam',
	'webgl_morphtargets_webcam',

	// Sub-pixel coverage of thin high-contrast geometry edges differs across rasterizers #33817
	'webgpu_generator_city'

];

/* Configuration */

const port = 1234;
const pixelThreshold = 0.1; // threshold error in one pixel
const maxDifferentPixels = 0.1; // at most 0.1% different pixels

const idleTime = 0.4; // seconds - for how long there should be no network requests. Was 2s,
// tuned for real network latency; localhost round-trips are near-instant so a much shorter
// window is enough to catch a late-firing follow-up request.

const networkTimeout = 5; // 5 minutes, set to 0 to disable
const renderTimeout = 5; // 5 seconds, set to 0 to disable
const numCIJobs = 5; // GitHub Actions run the script in 5 threads

const width = 400;
const height = 250;
const viewScale = 2;
const jpgQuality = 95;

// Number of tabs allowed to run concurrently in the shared browser process.
// Override with E2E_WORKERS. Software rendering is CPU-bound, so going past
// the physical core count has shown no further speedup in testing (measured
// on an 8-core machine: 8 vs 16 was a wash) - default to the core count
// rather than oversubscribing.
const CONCURRENCY = Number( process.env.E2E_WORKERS ) || Math.max( 1, os.cpus().length );

console.red = msg => console.log( `\x1b[31m${msg}\x1b[39m` );
console.green = msg => console.log( `\x1b[32m${msg}\x1b[39m` );
console.yellow = msg => console.log( `\x1b[33m${msg}\x1b[39m` );

let browser;

/* Shared page pool; every example runs in its own tab so no state
 * (console listeners, request interception, DOM, storage, in-flight
 * requests) can leak between examples that run concurrently. */

let injection, builds;

const PAGE_QUEUE_SIZE = Math.min( 4, CONCURRENCY );
const pageQueue = [];

async function openPage() {

	const page = await browser.newPage();
	await preparePage( page, injection, builds );
	return page;

}

// Kept topped up to PAGE_QUEUE_SIZE. Opening a tab isn't instant, so
// pre-warming a few ahead of time means an example that's ready to start
// usually finds one already opening (or open) instead of paying that
// latency itself.
function getPage() {

	while ( pageQueue.length < PAGE_QUEUE_SIZE ) pageQueue.push( openPage() );

	return pageQueue.shift();

}

async function closePage( page ) {

	try {

		await page.close();

	} catch ( e ) {}

}

/* Launch server */

server.listen( port, main );

process.on( 'SIGINT', async () => {

	console.log( '\nInterrupted, cleaning up...' );

	if ( browser ) {

		try {

			await browser.close();

		} catch ( e ) {}

	}

	server.close();
	process.exit( 1 );

} );

async function main() {

	/* Create output directory */

	try {

		await fs.rm( 'test/e2e/output-screenshots', { recursive: true, force: true } );

	} catch ( e ) {}

	try {

		await fs.mkdir( 'test/e2e/output-screenshots' );

	} catch ( e ) {}

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
		'--enable-unsafe-webgpu',
		'--enable-features=Vulkan',
		'--disable-vulkan-surface',
		'--ignore-gpu-blocklist',
		'--disable-gpu-driver-bug-workarounds',
		'--disable-gpu-watchdog',
		'--no-sandbox'
	];

	const viewport = { width: width * viewScale, height: height * viewScale };

	const launchOptions = {
		headless: ( 'CI' in process.env || process.env.VISIBLE ) ? false : 'new',
		env: { ...process.env, VK_DRIVER_FILES: '/usr/share/vulkan/icd.d/lvp_icd.x86_64.json' },
		args: flags,
		defaultViewport: viewport,
		handleSIGINT: false,
		protocolTimeout: 0,
		userDataDir: './.puppeteer_profile'
	};

	/* Prepare injections */

	const buildInjection = ( code ) => code
		.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' )
		// Disables WebGPU timestamp queries to prevent Inspector/Profiler from crashing in E2E software mode
		.replace( /this\.trackTimestamp\s*=\s*\(\s*parameters\.trackTimestamp\s*===\s*true\s*\);/g, 'Object.defineProperty(this, \'trackTimestamp\', { get: () => false, set: () => {} });' );

	const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );
	injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );

	builds = {
		'three.core.js': buildInjection( await fs.readFile( 'build/three.core.js', 'utf8' ) ),
		'three.module.js': buildInjection( await fs.readFile( 'build/three.module.js', 'utf8' ) ),
		'three.webgpu.js': buildInjection( await fs.readFile( 'build/three.webgpu.js', 'utf8' ) )
	};

	browser = await puppeteer.launch( launchOptions );

	/* Run every file, up to CONCURRENCY tabs at a time */

	const failedScreenshots = [];
	const limit = pLimit( CONCURRENCY );

	console.log( `Testing ${ files.length } example(s) with up to ${ CONCURRENCY } concurrent tab(s)${ isMakeScreenshot ? ' (generating screenshots)' : '' }.` );

	await Promise.all( files.map( file => limit( () => checkFile( failedScreenshots, cleanPage, isMakeScreenshot, file ) ) ) );

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

async function preparePage( page, injection, builds ) {

	await page.evaluateOnNewDocument( injection );
	await page.setRequestInterception( true );

	// Print-only dedup, scoped to this page/tab so a genuine repeated error
	// in another concurrently-running example is never suppressed.
	const seenMessages = new Set();

	page.on( 'console', async msg => {

		const type = msg.type();

		const file = page.file;

		if ( file === undefined ) {

			return;

		}

		const args = await Promise.all( msg.args().map( async arg => {

			try {

				return await arg.executionContext().evaluate( arg => arg instanceof Error ? arg.message : arg, arg );

			} catch ( e ) {

				// Execution context might have been already destroyed

				return arg;

			}

		} ) );

		let text = args.join( ' ' ); // https://github.com/puppeteer/puppeteer/issues/3397#issuecomment-434970058

		text = text.trim();
		if ( text === '' ) return;
		if ( text.includes( 'Timestamp tracking is disabled' ) ) return;
		// ANGLE's SwiftShader backend (SwANGLE) never implements
		// GL_KHR_parallel_shader_compile on any platform - it's not a flag or
		// config gap, so this warning is expected/unavoidable under the
		// software rendering this suite deliberately uses for reproducibility.
		if ( text.includes( 'KHR_parallel_shader_compile extension not supported' ) ) return;

		text = file + ': ' + text.replace( /\[\.WebGL-(.+?)\] /g, '' );

		if ( text === `${ file }: JSHandle@error` ) {

			text = `${ file }: Unknown error`;

		}

		if ( type === 'error' ) {

			page.error = text;

		}

		if ( seenMessages.has( text ) ) {

			return;

		}

		seenMessages.add( text );

		if ( type === 'warning' ) {

			console.yellow( text );

		} else if ( type !== 'error' ) {

			console.log( `[Browser] ${text}` );

		}

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

async function renderAndScreenshot( page, cleanPage, file ) {

	page.file = file;
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

		await page.evaluate( async ( { renderTimeout } ) => {

			// Wait for the main thread to actually go idle (worker-based
			// decode, shader compile, texture upload, etc. all show up as
			// scheduled work) instead of guessing a fixed delay from the
			// downloaded byte count.
			await new Promise( resolve => {

				if ( 'requestIdleCallback' in window ) requestIdleCallback( resolve, { timeout: 500 } );
				else setTimeout( resolve, 50 );

			} );

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

				}, 16 );

			} );

		}, { renderTimeout } );

	} catch ( e ) {

		if ( e.includes && e.includes( 'Render timeout exceeded' ) === false ) {

			throw new Error( `Error happened while rendering file ${ file }: ${ e }` );

		} /* else { // This can mean that the example doesn't use requestAnimationFrame loop

			console.yellow( `Render timeout exceeded in file ${ file }` );

		} */ // TODO: fix this

	}

	const screenshot = ( await Image.read( await page.screenshot() ) ).scale( 1 / viewScale );

	if ( page.error !== undefined ) throw new Error( page.error );

	return screenshot;

}

async function checkFile( failedScreenshots, cleanPage, isMakeScreenshot, file ) {

	const pageStart = performance.now();
	let page = await getPage();

	try {

		let screenshot;

		try {

			screenshot = await renderAndScreenshot( page, cleanPage, file );

		} catch ( e ) {

			if ( String( e ).includes( 'WebGPU Device Lost' ) ) {

				// A wedged GPU device tends to only affect the tab it happened
				// in - replace this one tab with a fresh one and retry once,
				// rather than tearing down the whole shared browser (which
				// would also kill every other example currently in flight).
				console.yellow( `${ e }` );
				console.yellow( `Restarting tab for ${ file } after device loss...` );
				closePage( page ); // fire-and-forget; the wedged tab doesn't need to finish closing before we retry
				page = await getPage();

				screenshot = await renderAndScreenshot( page, cleanPage, file );

			} else {

				throw e;

			}

		}

		const pageElapsed = ( performance.now() - pageStart ) / 1000;

		if ( isMakeScreenshot ) {

			/* Make screenshots */

			await screenshot.write( `examples/screenshots/${ file }.jpg`, jpgQuality );

			console.green( `Screenshot generated for file ${ file }` );

		} else {

			/* Diff screenshots */

			let expected;

			try {

				expected = await Image.read( `examples/screenshots/${ file }.jpg` );

			} catch ( e ) {

				await screenshot.write( `test/e2e/output-screenshots/${ file }-actual.jpg`, jpgQuality );
				throw new Error( `Screenshot does not exist: ${ file }` );

			}

			const actual = screenshot.bitmap;
			const diff = screenshot.clone();

			let numDifferentPixels;

			try {

				numDifferentPixels = expected.compare( screenshot, diff, pixelThreshold );

			} catch ( e ) {

				await screenshot.write( `test/e2e/output-screenshots/${ file }-actual.jpg`, jpgQuality );
				await expected.write( `test/e2e/output-screenshots/${ file }-expected.jpg`, jpgQuality );
				throw new Error( `Image sizes do not match in file: ${ file }` );

			}

			/* Print results */

			const differentPixels = numDifferentPixels / ( actual.width * actual.height ) * 100;

			if ( differentPixels < maxDifferentPixels ) {

				console.green( `Diff ${ differentPixels.toFixed( 1 ) }% in file: ${ file } (${ pageElapsed.toFixed( 1 ) }s)` );

			} else {

				await screenshot.write( `test/e2e/output-screenshots/${ file }-actual.jpg`, jpgQuality );
				await expected.write( `test/e2e/output-screenshots/${ file }-expected.jpg`, jpgQuality );
				await diff.write( `test/e2e/output-screenshots/${ file }-diff.jpg`, jpgQuality );
				throw new Error( `Diff wrong in ${ differentPixels.toFixed( 1 ) }% of pixels in file: ${ file } (${ pageElapsed.toFixed( 1 ) }s)` );

			}

		}

	} catch ( e ) {

		console.red( e );
		failedScreenshots.push( file );

	} finally {

		// Fire-and-forget: closing the tab doesn't affect this file's
		// outcome, so don't make the run wait on it - let it close in the
		// background while the next queued example gets going.
		closePage( page );

	}

}

function close( exitCode = 1 ) {

	console.log( 'Closing...' );

	browser.close();
	server.close();
	process.exit( exitCode );

}
