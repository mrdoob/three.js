import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const server = createServer();
await new Promise( resolve => server.listen( 0, resolve ) );
const browser = await puppeteer.launch( { headless: true, args: [ '--enable-unsafe-webgpu', '--ignore-gpu-blocklist' ] } );
try {

	for ( const backend of [ 'WebGL', 'WebGPU' ] ) {

		const page = await browser.newPage();
		await page.setViewport( { width: 1280, height: 900 } );
		const errors = [];
		page.on( 'pageerror', error => errors.push( error.message ) );
		page.on( 'console', message => {

			if ( message.type() === 'error' ) errors.push( message.text() );

		} );
		await page.goto( `http://localhost:${ server.address().port }/examples/webgl_postprocessing_traa.html?backend=${ backend }` );
		await page.waitForFunction( () => document.querySelector( '#status' ).textContent.includes( 'frame ' ), { timeout: 90000 } );
		await page.waitForFunction( () => Number( document.querySelector( '#status' ).textContent.split( 'frame ' )[ 1 ] ) >= 90, { timeout: 90000 } );
		await page.screenshot( { path: join( tmpdir(), `three-traa-${ backend }.png` ) } );
		const change = async ( name, value ) => page.evaluate( ( { name, value } ) => {

			const row = Array.from( document.querySelectorAll( '.controller' ) ).find( row => row.querySelector( '.name' )?.textContent === name );
			if ( ! row ) throw new Error( 'Missing control: ' + name );
			const select = row.querySelector( 'select' );
			const checkbox = row.querySelector( 'input[type=checkbox]' );
			if ( select ) {

				select.value = Array.from( select.options ).find( option => option.textContent === value ).value;
				select.dispatchEvent( new Event( 'change', { bubbles: true } ) );

			} else if ( checkbox ) {

				if ( checkbox.checked !== value ) checkbox.click();

			} else row.querySelector( 'button' ).click();

		}, { name, value } );
		await change( 'cameraMotion', 'Orbit' );
		await change( 'transparentBackground', true );
		await new Promise( resolve => setTimeout( resolve, 700 ) );
		await page.screenshot( { path: join( tmpdir(), `three-traa-${ backend }-alpha.png` ) } );
		await change( 'cameraCut' );
		await change( 'TRAA enabled', false );
		await change( '2× size reference (no AA)', true );
		await new Promise( resolve => setTimeout( resolve, 700 ) );
		await page.setViewport( { width: 960, height: 720 } );
		await change( '2× size reference (no AA)', false );
		await change( 'TRAA enabled', true );
		await new Promise( resolve => setTimeout( resolve, 700 ) );
		console.log( backend, await page.$eval( '#status', element => element.textContent ), errors );
		await page.close();
		if ( errors.length ) throw new Error( errors.join( '\n' ) );

	}

} finally {

	await browser.close();
	server.close();

}
