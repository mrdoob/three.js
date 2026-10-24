import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-resize`;
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

		// an instanced mesh and a mesh drawn before the culling is resized

		const instanced = new THREE.InstancedMesh( new THREE.BoxGeometry(), new THREE.MeshBasicNodeMaterial( { color: 0xff0000 } ), 3 );
		for ( let i = 0; i < 3; i ++ ) instanced.setMatrixAt( i, new THREE.Matrix4().makeTranslation( ( i - 1 ) * 2, 3, 0 ) );
		scene.add( instanced );

		const sphere = new THREE.Mesh( new THREE.SphereGeometry( 1, 16, 8 ), new THREE.MeshBasicNodeMaterial( { color: 0x00ff00 } ) );
		sphere.position.y = - 3;
		scene.add( sphere );

		const target = new THREE.RenderTarget( size, size );
		renderer.setRenderTarget( target );

		const drawer = new GPUDrivenDrawer( { lodThreshold: 0 } );
		const records = () => [ ...renderer._renderLists._activeLists ].map( list => drawer._renderListBatches.get( list ) ).filter( record => record && record.culling );

		const render = async ( frames ) => {

			for ( let i = 0; i < frames; i ++ ) {

				renderer.render( scene, camera );
				await renderer.backend.device.queue.onSubmittedWorkDone();

			}

		};

		renderer.drawer = drawer;
		await renderer.compileAsync( scene, camera );
		await render( 3 );

		const before = records()[ 0 ];
		const culling = before.culling;
		const capacity = culling.capacity.batches;
		const batches = before.entries.map( entry => [ entry, entry.batch, entry.batch.meshes.map( mesh => mesh.material ) ] );

		// more batches than the capacity of the culling: one material each

		const quad = new THREE.PlaneGeometry( 0.5, 0.5 );

		for ( let i = 0; i < capacity + 8; i ++ ) {

			const mesh = new THREE.Mesh( quad, new THREE.MeshBasicNodeMaterial( { color: new THREE.Color().setHSL( i / ( capacity + 8 ), 1, 0.5 ) } ) );
			mesh.position.set( ( i % 8 - 3.5 ) * 0.9, Math.floor( i / 8 ) * 0.9 - 1, 1 );
			scene.add( mesh );

		}

		await renderer.compileAsync( scene, camera );
		await render( 3 );

		const after = records()[ 0 ];
		const actual = await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		renderer.drawer = new THREE.Drawer();
		await render( 1 );
		const expected = await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		let different = 0;

		for ( let i = 0; i < expected.length; i += 4 ) {

			if ( expected[ i ] !== actual[ i ] || expected[ i + 1 ] !== actual[ i + 1 ] || expected[ i + 2 ] !== actual[ i + 2 ] ) different ++;

		}

		return {
			sameCulling: after.culling === culling,
			resized: after.culling.capacity.batches > capacity,
			batches: after.culling.batchEnd,
			keptBatches: batches.every( ( [ entry, batch ] ) => entry.batch === batch ),
			keptMaterials: batches.every( ( [ entry, , materials ] ) => entry.batch.meshes.every( ( mesh, i ) => mesh.material === materials[ i ] ) ),
			different,
			pixels: expected.length / 4,
			gpuErrors
		};

	} );

	assert.equal( result.sameCulling, true, 'The culling must be resized, not created again.' );
	assert.equal( result.resized, true, 'The culling must grow for the new batches.' );
	assert.equal( result.keptBatches, true, 'The batches drawn before the resize must be kept.' );
	assert.equal( result.keptMaterials, true, 'The materials of the kept batches must not be created again.' );
	assert.equal( result.different, 0, `The resized culling differs from the regular pipeline in ${ result.different } of ${ result.pixels } pixels.` );
	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	console.log( `GPU-driven resize passed: ${ result.batches } batches, kept batches and materials, instanced transforms, exact pixels.` );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
