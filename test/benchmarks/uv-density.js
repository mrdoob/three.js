import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import { createServer } from '../../utils/server.js';
const server = createServer();
await new Promise( resolve => server.listen( 0, resolve ) );
const browser = await puppeteer.launch( { headless: true, args: [ '--enable-unsafe-webgpu', '--use-angle=d3d11' ] } );
try {

	const page = await browser.newPage();
	await page.setViewport( { width: 1440, height: 1000 } );
	const errors = [];
	page.on( 'pageerror', error => errors.push( error.message ) );
	// A planar glTF fixture gives an exact density reference independent of the model menu.
	const vertices = new Float32Array( [ - 1, - 1, 0, 1, - 1, 0, 1, 1, 0, - 1, 1, 0 ] );
	const indices = new Uint16Array( [ 0, 1, 2, 0, 2, 3 ] );
	const data = Buffer.concat( [ Buffer.from( vertices.buffer ), Buffer.from( indices.buffer ) ] );
	const fixture = {
		asset: { version: '2.0' }, scene: 0, scenes: [ { nodes: [ 0 ] } ], nodes: [ { mesh: 0 } ],
		meshes: [ { primitives: [ { attributes: { POSITION: 0 }, indices: 1 } ] } ],
		buffers: [ { byteLength: data.length, uri: `data:application/octet-stream;base64,${ data.toString( 'base64' ) }` } ],
		bufferViews: [ { buffer: 0, byteLength: vertices.byteLength }, { buffer: 0, byteOffset: vertices.byteLength, byteLength: indices.byteLength } ],
		accessors: [
			{ bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [ - 1, - 1, 0 ], max: [ 1, 1, 0 ] },
			{ bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' }
		]
	};
	await page.setRequestInterception( true );
	page.on( 'request', request => {

		if ( request.url().endsWith( '/DamagedHelmet.gltf' ) ) {

			request.respond( { status: 200, contentType: 'application/json', body: JSON.stringify( fixture ) } );

		} else {

			request.continue();

		}

	} );
	await page.goto( `http://localhost:${ server.address().port }/examples/webgpu_unwrap.html` );
	await page.waitForFunction( () => document.getElementById( 'status' ).textContent.includes( 'texels/world unit' ) );
	const gpu = await page.evaluate( async () => {

		const adapter = await navigator.gpu.requestAdapter();
		return { vendor: adapter.info.vendor, architecture: adapter.info.architecture, fallback: adapter.info.isFallbackAdapter };

	} );
	assert.equal( gpu.fallback, false );
	assert.match( gpu.vendor, /nvidia|amd|intel|apple/i );
	console.log( gpu );
	await page.evaluate( () => {

		const select = Array.from( document.querySelectorAll( 'select' ) ).find( e => Array.from( e.options ).some( o => o.textContent === 'Texel density' ) );
		select.value = 'Texel density';
		select.dispatchEvent( new Event( 'change' ) );

	} );
	for ( const [ factor, expected ] of [[ 1, [ 40, 212, 92 ]], [ Math.SQRT2, [ 255, 224, 48 ]], [ 1 / Math.SQRT2, [ 255, 224, 48 ]], [ 2, [ 239, 48, 40 ]], [ 0.5, [ 239, 48, 40 ]]] ) {

		await page.evaluate( factor => {

			const density = Number( document.getElementById( 'status' ).textContent.match( /([\d.]+) texels\/world unit/ )[ 1 ] ) * factor;
			const input = Array.from( document.querySelectorAll( 'input[type=number]' ) ).find( e => e.closest( '.param-control' ) ) || document.querySelector( 'input[type=number]' );
			input.value = density;
			input.dispatchEvent( new Event( 'change' ) );

		}, factor );
		await new Promise( resolve => setTimeout( resolve, 300 ) );
		const png = PNG.sync.read( Buffer.from( await page.screenshot() ) );
		const offset = ( 500 * png.width + 700 ) * 4;
		const actual = Array.from( png.data.subarray( offset, offset + 3 ) );
		console.log( factor, actual );
		for ( let i = 0; i < 3; i ++ ) assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 5 );

	}

	assert.deepEqual( errors, [] );

} finally {

	await browser.close();
	server.close();

}
