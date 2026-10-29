import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-culling`;
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
	await page.evaluate( async () => {

		const THREE = await import( 'three/webgpu' );
		const { MeshletDrawingPipeline } = await import( 'three/addons/pipelines/MeshletDrawingPipeline.js' );
		const { ready } = await import( 'three/addons/utils/MeshletGeometryUtils.js' );
		await ready;
		const renderer = new THREE.WebGPURenderer( { requiredLimits: { maxUniformBufferBindingSize: 65536, maxStorageBuffersPerShaderStage: 8 } } );
		await renderer.init();
		window.gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => window.gpuErrors.push( event.error.message ) );
		renderer.setSize( 32, 32 );
		renderer.drawingPipeline = new MeshletDrawingPipeline( { lodThreshold: 0 } );
		await Promise.resolve();
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 4;
		const geometry = new THREE.BoxGeometry();
		const target = new THREE.RenderTarget( 32, 32 );
		renderer.setRenderTarget( target );
		const meshes = [];

		// 238 batches reserve 476 table entries: 76,160 bytes, exceeding a 64 KiB uniform binding.
		for ( let i = 0; i < 238; i ++ ) {

			const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicNodeMaterial( { color: i === 0 ? 0xff0000 : 0x0000ff } ) );
			scene.add( mesh );
			meshes.push( mesh );

		}

		window.testCulling = { renderer, scene, camera, meshes, target, geometry };
		window.captureCulling = async () => {

			renderer.render( scene, camera );
			await renderer.backend.device.queue.onSubmittedWorkDone();
			const records = [ ...renderer._renderLists._activeLists ].map( list => renderer.drawingPipeline._renderListBatches.get( list ) ).filter( Boolean );
			const record = records.find( record => record.culling !== null );
			const center = await renderer.readRenderTargetPixelsAsync( target, 16, 16, 1, 1 );
			const args = new Uint32Array( await renderer.getArrayBufferAsync( record.culling.argsAttribute ) );
			const visible = record.entries.filter( entry => args[ entry.batch.index * 8 + 1 ] > 0 ).length;
			return {
				batches: record.culling.batchEnd,
				capacity: record.culling.capacity.batches,
				visible,
				lastBatchIndex: record.entries.find( entry => entry.material === meshes[ 0 ].material ).batch.index,
				center: Array.from( center ),
				gpuErrors: [ ...window.gpuErrors ]
			};

		};

	} );

	let result = await page.evaluate( () => window.captureCulling() );
	assert.equal( result.batches, 238 );
	assert.equal( result.capacity, 476 );
	assert.equal( result.lastBatchIndex, 237 );
	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );

	// Keep only the final table entry visible. Its count must update on the GPU without rebuilding the culling.
	await page.evaluate( () => {

		for ( let i = 1; i < 238; i ++ ) window.testCulling.meshes[ i ].position.x = 100;

	} );
	result = await page.evaluate( () => window.captureCulling() );
	assert.equal( result.visible, 1 );
	assert.ok( result.center[ 0 ] > 200 && result.center[ 2 ] < 10, 'The last batch must draw its red material.' );

	await page.evaluate( () => {

		window.testCulling.meshes[ 0 ].visible = false;

	} );
	result = await page.evaluate( () => window.captureCulling() );
	assert.equal( result.visible, 0, 'Hiding a batch must upload its zero object count.' );

	await page.evaluate( () => {

		window.testCulling.meshes[ 0 ].visible = true;
		window.testCulling.renderer.drawingPipeline.debug = true;

	} );
	result = await page.evaluate( () => window.captureCulling() );
	assert.equal( result.visible, 1, 'Debug mode rebuilds batches using the same large table.' );

	await page.evaluate( () => {

		window.testCulling.renderer.drawingPipeline.occlusionCulling = false;

	} );
	result = await page.evaluate( () => window.captureCulling() );
	assert.equal( result.visible, 1, 'Large tables also work without occlusion culling.' );
	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	console.log( 'GPU-driven culling passed: 238 batches, 64 KiB uniform limit, 8 storage bindings, dynamic counts, debug and occlusion modes.' );
	await page.evaluate( () => {

		const { renderer, target, geometry, meshes } = window.testCulling;
		target.dispose();
		geometry.dispose();
		for ( const mesh of meshes ) mesh.material.dispose();
		renderer.dispose();

	} );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
