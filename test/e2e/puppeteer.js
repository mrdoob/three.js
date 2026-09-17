import puppeteer from 'puppeteer';
import { Image } from './image.js';
import * as fs from 'fs/promises';
import { createServer } from '../../utils/server.js';
import { availableParallelism } from 'node:os';
import browserExamples from './browser-examples.js';

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
	'webgpu_vxgi',
	'webgpu_vxgi_sponza',

	// Incremental light probe baking
	'webgl_lightprobes_sponza',
	'webgpu_generator_city', // Sub-pixel coverage of thin high-contrast geometry edges differs across rasterizers #33817
	'webgpu_lightprobes_sponza',

	// Video hangs the CI?
	'css3d_youtube',
	'webgpu_materials_video',
	'webgl_video_kinect',
	'webgl_video_panorama_equirectangular',

	// Timeout
	'webgl_test_memory2',

	// Webcam
	'webgl_materials_video_webcam',
	'webgl_morphtargets_webcam'

];

/* Configuration */

const port = 1234;
const pixelThreshold = 0.1; // threshold error in one pixel
const maxDifferentPixels = 0.1; // at most 0.1% different pixels

const idleTime = 2; // 2 seconds - for how long there should be no network requests
const parseTime = 1; // 1 second per megabyte

const networkTimeout = 5; // 5 minutes, set to 0 to disable
const renderTimeout = 5; // 5 seconds, set to 0 to disable
const numCIJobs = Number( process.env.E2E_SHARDS || 5 );
const concurrency = Number( process.env.E2E_CONCURRENCY ) || availableParallelism(); // native captures per process

const width = 400;
const height = 250;
const viewScale = 2;
const jpgQuality = 95;

console.red = msg => console.log( `\x1b[31m${msg}\x1b[39m` );
console.green = msg => console.log( `\x1b[32m${msg}\x1b[39m` );
console.yellow = msg => console.log( `\x1b[33m${msg}\x1b[39m` );

let browser, captureNative;

main().catch( error => {

	console.error( error );
	close( 1 );

} );

process.on( 'SIGINT', () => {

	console.log( '\nInterrupted, cleaning up...' );
	close( 1 );

} );

async function main() {

	/* Find files */

	let isMakeScreenshot = false;
	const isBrowser = process.argv.includes( '--browser' );
	const nativeOnly = process.argv.includes( '--node' );
	if ( nativeOnly && isBrowser ) throw new Error( 'Choose either --node or --browser.' );
	const argv = process.argv.filter( arg => ! [ '--node', '--browser' ].includes( arg ) );
	let isWebGPU = false;

	let argvIndex = 2;

	if ( argv[ argvIndex ] === '--webgpu' ) {

		isWebGPU = true;
		argvIndex ++;

	}

	if ( argv[ argvIndex ] === '--make' ) {

		isMakeScreenshot = true;
		argvIndex ++;

	}

	const exactList = argv.slice( argvIndex )
		.map( f => f.replace( '.html', '' ) );

	const isExactList = exactList.length !== 0;

	let files = ( await fs.readdir( 'examples' ) )
		.filter( s => s.slice( - 5 ) === '.html' && s !== 'index.html' )
		.map( s => s.slice( 0, s.length - 5 ) );

	for ( const file of Object.keys( browserExamples ) ) {

		if ( ! files.includes( file ) ) throw new Error( `Unknown browser example: ${ file }` );

	}

	files = files.filter( f => isExactList ? exactList.includes( f ) : ! exceptionList.includes( f ) );

	if ( isExactList ) {

		for ( const file of exactList ) {

			if ( ! files.includes( file ) ) {

				console.log( `Warning! Unrecognised example name: ${ file }` );

			}

		}

	}

	if ( isWebGPU ) files = files.filter( f => f.includes( 'webgpu_' ) );
	if ( ! isExactList && ( nativeOnly || isBrowser ) ) files = files.filter( f => Object.hasOwn( browserExamples, f ) === isBrowser );

	/* CI parallelism */

	if ( 'CI' in process.env ) {

		const CI = Number( process.env.CI );
		if ( ! Number.isInteger( numCIJobs ) || numCIJobs < 1 || ! Number.isInteger( CI ) || CI < 0 || CI >= numCIJobs ) throw new Error( 'Invalid CI shard or E2E_SHARDS.' );

		// Browser captures keep their alphabetical order: the shared Chrome carries state from one example to the next and
		// the baselines were recorded in this order. Native captures are isolated processes, so their shards interleave
		// to spread the heavy examples.
		files = isBrowser
			? files.slice( Math.floor( CI * files.length / numCIJobs ), Math.floor( ( CI + 1 ) * files.length / numCIJobs ) )
			: files.filter( ( _, i ) => i % numCIJobs === CI );

	}

	/* Create output directory */

	try {

		await fs.rm( 'test/e2e/output-screenshots', { recursive: true, force: true } );

	} catch ( e ) {}

	try {

		await fs.mkdir( 'test/e2e/output-screenshots' );

	} catch ( e ) {}

	captureNative = isBrowser ? null : ( await import( './native.js' ) ).capture;

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

	const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );
	const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );

	// Workers do not receive evaluateOnNewDocument scripts.
	const buildInjection = ( code ) => injection + '\n' + code
		.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' )
		// Disables WebGPU timestamp queries to prevent Inspector/Profiler from crashing in E2E software mode
		.replace( /this\.trackTimestamp\s*=\s*\(\s*parameters\.trackTimestamp\s*===\s*true\s*\);/g, 'Object.defineProperty(this, \'trackTimestamp\', { get: () => false, set: () => {} });' );

	let builds;

	/* Prepare page */

	const errorMessagesCache = [];

	const launchPage = async () => {

		if ( ! server.listening ) await new Promise( resolve => server.listen( port, resolve ) );
		builds ||= {
			'three.core.js': buildInjection( await fs.readFile( 'build/three.core.js', 'utf8' ) ),
			'three.module.js': buildInjection( await fs.readFile( 'build/three.module.js', 'utf8' ) ),
			'three.webgpu.js': buildInjection( await fs.readFile( 'build/three.webgpu.js', 'utf8' ) )
		};
		browser = await puppeteer.launch( launchOptions );
		const page = await browser.newPage();
		await preparePage( page, injection, builds, errorMessagesCache );
		return page;

	};

	let lock = Promise.resolve();
	const ctx = {
		page: undefined,
		launchPage,
		nativeOnly,
		native: 0,
		browser: 0,
		// The browser page is shared: one capture at a time.
		lock( task ) {

			const run = lock.then( task );
			lock = run.catch( () => {} );
			return run;

		},
		async restart() {

			// SIGKILL the whole Chrome process tree; browser.close() can hang after a wedged GPU process
			const proc = browser.process();
			if ( proc ) {

				proc.kill( 'SIGKILL' );
				await new Promise( resolve => proc.once( 'exit', resolve ) );

			}

			errorMessagesCache.length = 0;
			ctx.page = await launchPage();

		}
	};

	/* Loop for each file */

	const failedScreenshots = [];
	const pool = ( queue, size ) => Promise.all( Array.from( { length: Math.min( size, queue.length ) }, async () => {

		while ( queue.length ) await checkFile( ctx, failedScreenshots, cleanPage, isMakeScreenshot, queue.shift() );

	} ) );

	// Native captures are separate processes and run in parallel. On Linux, WebGPU captures rasterize on the CPU
	// (SwiftShader) and keep every core busy on their own, so they run one at a time.
	const cpuBound = file => captureNative && process.platform === 'linux' && file.startsWith( 'webgpu_' );
	await pool( files.filter( cpuBound ), 1 );
	await pool( files.filter( file => ! cpuBound( file ) ), captureNative ? concurrency : 1 );

	/* Finish */

	console.log( `Captured ${ ctx.native } examples with Node, ${ ctx.browser } with Puppeteer.` );

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

	setTimeout( close, browser ? 300 : 0, failedScreenshots.length ? 1 : 0 );

}

async function preparePage( page, injection, builds, errorMessages ) {

	// Ignore ambient input from the browser window; scripted DOM clicks still work.
	const client = await page.createCDPSession();
	await client.send( 'Input.setIgnoreInputEvents', { ignore: true } );

	await page.evaluateOnNewDocument( injection );
	await page.setRequestInterception( true );

	page.on( 'pageerror', error => {

		if ( page.file !== undefined ) page.error = `${ page.file }: ${ error.message }`;

	} );

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

		} catch ( e ) {}

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

async function captureBrowser( ctx, cleanPage, file ) {

	ctx.page ||= await ctx.launchPage();
	const page = ctx.page;
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

		await page.waitForFunction( () => window._videosReady(), {
			polling: 100,
			timeout: renderTimeout * 1000
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

		if ( e !== 'Render timeout exceeded' ) {

			throw new Error( `Error happened while rendering file ${ file }: ${ e }` );

		} /* else { // This can mean that the example doesn't use requestAnimationFrame loop

			console.yellow( `Render timeout exceeded in file ${ file }` );

		} */ // TODO: fix this

	}

	const screenshot = await Image.read( await page.screenshot() );

	if ( page.error !== undefined ) throw new Error( page.error );

	return screenshot;

}

async function checkFile( ctx, failedScreenshots, cleanPage, isMakeScreenshot, file ) {

	const pageStart = performance.now();
	let isNative = Boolean( captureNative );

	try {

		let image;
		if ( isNative ) {

			image = await captureNative( file, width * viewScale, height * viewScale );
			if ( image.browser ) {

				if ( ctx.nativeOnly ) throw new Error( `Browser required for ${ file }: ${ image.browser }. Review its classification in test/e2e/browser-examples.js.` );
				console.log( `Browser required for ${ file }: ${ image.browser }` );
				isNative = false;

			}

		}

		if ( ! isNative ) image = await ctx.lock( () => captureBrowser( ctx, cleanPage, file ).finally( () => {

			if ( ctx.page ) ctx.page.file = undefined; // release lock

		} ) );
		ctx[ isNative ? 'native' : 'browser' ] ++;
		const screenshot = image.scale( 1 / viewScale );
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

		if ( ! isNative && String( e ).includes( 'WebGPU Device Lost' ) ) {

			console.yellow( `${ e }` );
			console.yellow( 'Restarting browser...' );
			await ctx.lock( () => ctx.restart() );

		} else {

			console.red( e );
			await fs.writeFile( `test/e2e/output-screenshots/${ file }-error.txt`, String( e ) );
			failedScreenshots.push( file );

		}

	}

}

async function close( exitCode = 1 ) {

	console.log( 'Closing...' );

	try {

		await browser?.close();

	} catch ( error ) {

		console.error( error );
		exitCode = 1;

	}

	server.close();
	process.exit( exitCode );

}
