import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-budget`;
const systemChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.CHROME_EXECUTABLE || ( existsSync( systemChrome ) ? systemChrome : undefined );
let browser;

try {

	browser = await puppeteer.launch( { headless: true, executablePath, args: [ '--enable-unsafe-webgpu' ] } );
	const page = await browser.newPage();
	const errors = [];
	page.on( 'pageerror', error => errors.push( error.message ) );
	page.on( 'console', message => {

		if ( message.type() === 'error' ) errors.push( message.text() );

	} );
	await page.setRequestInterception( true );
	page.on( 'request', request => {

		if ( request.url() === url ) {

			request.respond( {
				contentType: 'text/html',
				body: `<!doctype html><link rel="icon" href="data:,"><script type="importmap">
{"imports":{"three":"/src/Three.WebGPU.js","three/webgpu":"/src/Three.WebGPU.js","three/tsl":"/src/Three.TSL.js","three/addons/":"/examples/jsm/"}}
</script>`
			} );

		} else {

			request.continue();

		}

	} );
	await page.goto( url );

	const result = await page.evaluate( async () => {

		// the warnings of the drawer, the budgets grow silently

		const warnings = [];
		const consoleWarn = console.warn;

		console.warn = ( ...parameters ) => {

			if ( String( parameters[ 0 ] ).includes( 'GPUDrivenDrawer' ) ) warnings.push( parameters[ 0 ] );

			consoleWarn.apply( console, parameters );

		};

		const THREE = await import( 'three/webgpu' );
		const { GPUDrivenDrawer } = await import( 'three/addons/drawers/GPUDrivenDrawer.js' );
		const { ready } = await import( 'three/addons/utils/ClusterGeometryUtils.js' );
		await ready;

		const size = 64;
		const renderer = new THREE.WebGPURenderer();
		await renderer.init();
		const gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => gpuErrors.push( event.error.message ) );
		renderer.setSize( size, size );

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 12;

		// many visible objects with many clusters each: more visible clusters than the estimate of the queue

		const geometry = new THREE.SphereGeometry( 0.25, 32, 16 );
		const material = new THREE.MeshBasicNodeMaterial( { color: 0xff8800 } );

		for ( let x = 0; x < 16; x ++ ) {

			for ( let y = 0; y < 12; y ++ ) {

				const mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( ( x - 7.5 ) * 0.6, ( y - 5.5 ) * 0.6, 0 );
				scene.add( mesh );

			}

		}

		const target = new THREE.RenderTarget( size, size );
		renderer.setRenderTarget( target );

		const drawer = new GPUDrivenDrawer( { lodThreshold: 0 } );
		const record = () => [ ...renderer._renderLists._activeLists ].map( list => drawer._renderListBatches.get( list ) ).find( record => record && record.culling );

		const render = async ( frames ) => {

			for ( let i = 0; i < frames; i ++ ) {

				renderer.render( scene, camera );
				await renderer.backend.device.queue.onSubmittedWorkDone();
				await new Promise( resolve => setTimeout( resolve, 0 ) );

			}

		};

		renderer.drawer = drawer;
		await renderer.compileAsync( scene, camera );
		await render( 1 );

		const culling = record().culling;
		const entry = record().entries.find( entry => entry.material === material );
		const initialQueue = entry.batch.queueCapacity;

		// until measured, the queue holds all clusters, so the first render is complete

		const first = await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		// the counters are read a few projections after the culling was created, the culling is resized after. the
		// first read of a budget calibrates it to the visible clusters

		await render( 8 );

		const calibrated = await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		let firstDifferent = 0;

		for ( let i = 0; i < first.length; i += 4 ) {

			if ( first[ i ] !== calibrated[ i ] || first[ i + 1 ] !== calibrated[ i + 1 ] || first[ i + 2 ] !== calibrated[ i + 2 ] ) firstDifferent ++;

		}

		const calibratedBudget = entry.queueBudget;

		// more visible objects than the measured budget: the budget grows

		for ( let x = 0; x < 16; x ++ ) {

			for ( let y = 0; y < 12; y ++ ) {

				const mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( ( x - 7.2 ) * 0.6, ( y - 5.2 ) * 0.6, 0.5 );
				scene.add( mesh );

			}

		}

		await renderer.compileAsync( scene, camera );
		await render( 8 );

		const actual = await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		renderer.drawer = new THREE.Drawer();
		await render( 1 );
		const expected = await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		let different = 0;

		for ( let i = 0; i < expected.length; i += 4 ) {

			if ( expected[ i ] !== actual[ i ] || expected[ i + 1 ] !== actual[ i + 1 ] || expected[ i + 2 ] !== actual[ i + 2 ] ) different ++;

		}

		console.warn = consoleWarn;

		return {
			sameCulling: record().culling === culling,
			initialQueue,
			calibratedBudget,
			firstDifferent,
			warnings: warnings.length,
			queue: entry.batch.queueCapacity,
			budget: entry.queueBudget,
			different,
			pixels: expected.length / 4,
			gpuErrors
		};

	} );

	assert.ok( result.calibratedBudget <= result.initialQueue, `The first queue must hold all visible clusters ( ${ result.initialQueue } -> ${ result.calibratedBudget } ).` );
	assert.equal( result.firstDifferent, 0, `The first render differs from the calibrated render in ${ result.firstDifferent } pixels.` );
	assert.ok( result.budget > result.calibratedBudget, `The measured budget must grow after the next overflow ( ${ result.calibratedBudget } -> ${ result.budget } ).` );
	assert.equal( result.warnings, 0, 'The growth of a budget must not be reported.' );
	assert.ok( result.queue >= result.budget, 'The resized queue must hold the budget.' );
	assert.equal( result.sameCulling, true, 'The culling must be resized, not created again.' );
	assert.equal( result.different, 0, `The grown queue differs from the regular pipeline in ${ result.different } of ${ result.pixels } pixels.` );
	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	console.log( `GPU-driven budget passed: queue ${ result.initialQueue } complete first render -> ${ result.calibratedBudget } calibrated -> ${ result.budget } grown silently, exact pixels.` );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
