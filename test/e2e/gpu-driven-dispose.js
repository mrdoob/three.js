import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-dispose`;
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

		// the GPU buffers alive

		const sizes = new WeakMap();
		const buffers = { count: 0, bytes: 0 };
		const createBuffer = GPUDevice.prototype.createBuffer;
		const destroy = GPUBuffer.prototype.destroy;

		GPUDevice.prototype.createBuffer = function ( descriptor ) {

			const buffer = createBuffer.call( this, descriptor );

			sizes.set( buffer, descriptor.size );
			buffers.count ++;
			buffers.bytes += descriptor.size;

			return buffer;

		};

		GPUBuffer.prototype.destroy = function () {

			const size = sizes.get( this );

			if ( size !== undefined ) {

				sizes.delete( this );
				buffers.count --;
				buffers.bytes -= size;

			}

			return destroy.call( this );

		};

		const THREE = await import( 'three/webgpu' );
		const { MeshletDrawingPipeline } = await import( 'three/addons/pipelines/MeshletDrawingPipeline.js' );
		const { ready } = await import( 'three/addons/utils/MeshletGeometryUtils.js' );
		await ready;

		const size = 64;
		const renderer = new THREE.WebGPURenderer();
		await renderer.init();
		const gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => gpuErrors.push( event.error.message ) );
		renderer.setSize( size, size );

		const pipeline = new MeshletDrawingPipeline( { lodThreshold: 0 } );
		renderer.drawingPipeline = pipeline;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 12;
		const target = new THREE.RenderTarget( size, size );
		renderer.setRenderTarget( target );

		// an object which stays in the scene while the geometry pool moves its vertices

		const anchor = new THREE.Mesh( new THREE.BoxGeometry( 2, 2, 2 ), new THREE.MeshBasicNodeMaterial( { color: 0x888888 } ) );
		anchor.position.z = - 2;
		scene.add( anchor );

		const render = async ( frames ) => {

			for ( let i = 0; i < frames; i ++ ) {

				renderer.render( scene, camera );
				await renderer.backend.device.queue.onSubmittedWorkDone();

			}

		};

		const record = () => [ ...renderer._renderLists._activeLists ].map( list => pipeline._renderListBatches.get( list ) ).find( record => record && record.culling );

		const state = async () => ( {
			bytes: buffers.bytes,
			materials: record().lookup.size,
			poolGeometries: pipeline._geometryPool.geometries.size,
			poolVersion: pipeline._geometryPool.version,
			center: Array.from( await renderer.readRenderTargetPixelsAsync( target, size / 2, size / 2, 1, 1 ) )
		} );

		window.references = [];
		window.cycles = [];

		// objects of unique geometries and materials, instanced meshes and a mesh with multiple materials, drawn and disposed

		window.runCycle = async ( cycle ) => {

			const meshes = [];
			const geometries = [];
			const materials = [];

			for ( let i = 0; i < 20; i ++ ) {

				const geometry = new THREE.SphereGeometry( 0.3, 8 + i, 6 + ( i % 5 ) );
				const material = new THREE.MeshBasicNodeMaterial( { color: new THREE.Color().setHSL( i / 20, 1, 0.5 ) } );
				const mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( ( i % 5 - 2 ) * 1.5, Math.floor( i / 5 ) * 1.5 - 2, 0 );
				meshes.push( mesh );
				geometries.push( geometry );
				materials.push( material );

			}

			for ( let i = 0; i < 2; i ++ ) {

				const geometry = new THREE.TorusGeometry( 0.3, 0.1, 8, 12 + i );
				const material = new THREE.MeshBasicNodeMaterial( { color: 0x00ffff } );
				const mesh = new THREE.InstancedMesh( geometry, material, 8 );
				for ( let j = 0; j < 8; j ++ ) mesh.setMatrixAt( j, new THREE.Matrix4().makeTranslation( j - 4, 4 + i, 0 ) );
				meshes.push( mesh );
				geometries.push( geometry );
				materials.push( material );

			}

			const groups = new THREE.BoxGeometry( 1, 1, 1, 2, 2, 2 );
			const groupMaterials = [ 0, 1, 2, 3, 4, 5 ].map( i => new THREE.MeshBasicNodeMaterial( { color: new THREE.Color().setHSL( i / 6, 0.5, 0.5 ) } ) );
			const multi = new THREE.Mesh( groups, groupMaterials );
			multi.position.set( 4, 3, 0 );
			meshes.push( multi );
			geometries.push( groups );
			materials.push( ...groupMaterials );

			for ( const mesh of meshes ) scene.add( mesh );

			// with and without precompilation, the meshlets are processed in compileAsync() or one geometry per frame

			if ( cycle % 2 === 0 ) await renderer.compileAsync( scene, camera );
			await render( 30 );

			for ( const mesh of meshes ) {

				scene.remove( mesh );

				if ( mesh.isInstancedMesh ) mesh.dispose();

			}

			for ( const geometry of geometries ) geometry.dispose();
			for ( const material of materials ) material.dispose();

			if ( cycle === 0 ) window.references.push( ...[ ...meshes, ...geometries, ...materials ].map( object => new WeakRef( object ) ) );

			// longer than the projections after which unused batches are disposed

			await render( 70 );

			window.cycles.push( await state() );

		};

		window.disposePipeline = async () => {

			scene.remove( anchor );
			anchor.geometry.dispose();
			anchor.material.dispose();
			await render( 2 );

			pipeline.dispose();
			target.dispose();
			await render( 1 );

			const bytes = buffers.bytes;

			// the renderer disposes its pipeline

			let pipelineDisposed = 0;
			const dispose = pipeline.dispose.bind( pipeline );

			pipeline.dispose = () => {

				pipelineDisposed ++;
				dispose();

			};

			await renderer.dispose();

			return { bytes, pipelineDisposed, gpuErrors };

		};

	} );

	for ( let cycle = 0; cycle < 4; cycle ++ ) await page.evaluate( ( cycle ) => window.runCycle( cycle ), cycle );

	const cycles = await page.evaluate( () => window.cycles );
	const disposed = await page.evaluate( () => window.disposePipeline() );

	const cdp = await page.createCDPSession();

	for ( let i = 0; i < 3; i ++ ) await cdp.send( 'HeapProfiler.collectGarbage' );

	const collected = await page.evaluate( () => window.references.filter( reference => reference.deref() === undefined ).length );
	const references = await page.evaluate( () => window.references.length );

	for ( const cycle of cycles ) {

		assert.equal( cycle.bytes, cycles[ 0 ].bytes, 'The GPU memory must not grow after disposing the objects of a cycle.' );
		assert.equal( cycle.materials, 1, 'The disposed materials must be removed from the batches of the render list.' );
		assert.equal( cycle.poolGeometries, 1, 'The vertices of the disposed geometries must be removed from the geometry pool.' );
		assert.deepEqual( cycle.center, cycles[ 0 ].center, 'The remaining object must be drawn after the geometry pool moved its vertices.' );

	}

	assert.ok( cycles.at( - 1 ).poolVersion > cycles[ 0 ].poolVersion, 'The geometry pool must reclaim the vertices of disposed geometries.' );
	assert.ok( cycles[ 0 ].center[ 0 ] > 0, 'The remaining object must be drawn.' );
	assert.equal( collected, references, `The disposed objects must be collected ( ${ collected } of ${ references } ).` );
	assert.equal( disposed.bytes, 0, 'The disposed pipeline must not keep GPU buffers.' );
	assert.equal( disposed.pipelineDisposed, 1, 'Renderer.dispose() must dispose the pipeline.' );
	assert.deepEqual( disposed.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	console.log( `GPU-driven dispose passed: ${ cycles.length } cycles at ${ ( cycles[ 0 ].bytes / 1024 ).toFixed( 0 ) } KiB, ${ collected } disposed objects collected, no buffers after pipeline.dispose(), disposed by Renderer.dispose().` );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
