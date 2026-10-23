import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-alpha-test`;
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

		// a cutout texture: the left half is opaque, the right half is discarded by the alpha test

		const data = new Uint8Array( [ 255, 255, 255, 255, 255, 255, 255, 0 ] );
		const map = new THREE.DataTexture( data, 2, 1 );
		map.needsUpdate = true;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 4;

		// alpha-tested instances in front of an opaque box: the box must be visible through the discarded half, also
		// after the occlusion culling used the depth of the cutout planes of the last frame

		const cutoutMaterial = new THREE.MeshBasicNodeMaterial( { color: 0xff0000, map, alphaTest: 0.5 } );
		const cutout = new THREE.InstancedMesh( new THREE.PlaneGeometry( 1.5, 1.5, 4, 4 ), cutoutMaterial, 2 );
		cutout.setMatrixAt( 0, new THREE.Matrix4().makeTranslation( - 0.8, 0, 1 ) );
		cutout.setMatrixAt( 1, new THREE.Matrix4().makeTranslation( 0.8, 0, 1 ) );
		scene.add( cutout );

		const box = new THREE.Mesh( new THREE.BoxGeometry( 4, 2, 0.5 ), new THREE.MeshBasicNodeMaterial( { color: 0x0000ff } ) );
		box.position.z = - 1;
		scene.add( box );

		const target = new THREE.RenderTarget( size, size );
		renderer.setRenderTarget( target );

		const capture = async ( drawer, frames ) => {

			renderer.drawer = drawer;

			for ( let i = 0; i < frames; i ++ ) {

				renderer.render( scene, camera );
				await renderer.backend.device.queue.onSubmittedWorkDone();

			}

			return await renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		};

		const expected = await capture( new THREE.Drawer(), 1 );

		const drawer = new GPUDrivenDrawer( { lodThreshold: 0 } );
		await renderer.compileAsync( scene, camera );
		const actual = await capture( drawer, 4 );

		const records = [ ...renderer._renderLists._activeLists ].map( list => drawer._renderListBatches.get( list ) ).filter( Boolean );
		const cutoutBatch = records.some( record => record.entries.some( entry => entry.material === cutoutMaterial && entry.batch !== null ) );

		let different = 0;

		for ( let i = 0; i < expected.length; i += 4 ) {

			if ( expected[ i ] !== actual[ i ] || expected[ i + 1 ] !== actual[ i + 1 ] || expected[ i + 2 ] !== actual[ i + 2 ] ) different ++;

		}

		// the pixel at the discarded half of the right plane shows the box

		const pixel = ( x, y ) => Array.from( actual.slice( ( y * size + x ) * 4, ( y * size + x ) * 4 + 4 ) );

		return { cutoutBatch, different, pixels: expected.length / 4, discarded: pixel( 56, 32 ), opaque: pixel( 40, 32 ), gpuErrors };

	} );

	assert.equal( result.cutoutBatch, true, 'Alpha-tested materials must use GPU-driven batches.' );
	assert.equal( result.different, 0, `GPU-driven alpha test differs from the regular pipeline in ${ result.different } of ${ result.pixels } pixels.` );
	assert.ok( result.discarded[ 2 ] > 200 && result.discarded[ 0 ] < 10, 'The box must be visible through the discarded half.' );
	assert.ok( result.opaque[ 0 ] > 200 && result.opaque[ 2 ] < 10, 'The opaque half must draw the cutout material.' );
	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	console.log( 'GPU-driven alpha test passed: instanced cutout batches, exact pixels, occlusion culling behind discarded fragments.' );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
