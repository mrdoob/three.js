import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';
import { benchmarkExamples } from './lightprobe-repack-examples.js';

// Run from the repository root: node test/benchmarks/lightprobe-repack.js
// CHROME_PATH can select a local hardware-capable Chrome installation.
const server = createServer();
let browser;

try {

	await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
	browser = await puppeteer.launch( {
		executablePath: process.env.CHROME_PATH || undefined,
		headless: false,
		args: [ '--enable-unsafe-webgpu', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--disable-background-timer-throttling', '--disable-renderer-backgrounding' ]
	} );
	if ( process.argv.includes( '--examples' ) ) {

		const index = process.argv.indexOf( '--reference-source' );
		const result = await benchmarkExamples( browser, `http://127.0.0.1:${ server.address().port }`, index === - 1 ? null : process.argv[ index + 1 ] );
		console.log( JSON.stringify( result, null, 2 ) );

	} else {

		const page = await browser.newPage();
		const errors = [];
		page.on( 'pageerror', error => errors.push( error.message ) );
		page.on( 'console', message => console.log( message.text() ) );
		const query = process.argv.includes( '--accuracy-only' ) ? '?accuracyOnly' : '';
		await page.goto( `http://127.0.0.1:${ server.address().port }/test/benchmarks/lightprobe-repack.html${ query }` );
		await page.waitForFunction( () => window.benchmarkResults || window.benchmarkError, { timeout: 300000 } );
		const result = await page.evaluate( () => ( { results: window.benchmarkResults, error: window.benchmarkError } ) );
		assert.deepEqual( errors, [] );
		assert.equal( result.error, undefined );
		console.log( JSON.stringify( result.results, null, 2 ) );

	}

} finally {

	if ( browser ) await browser.close();
	await new Promise( resolve => server.close( resolve ) );

}
