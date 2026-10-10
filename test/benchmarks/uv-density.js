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
