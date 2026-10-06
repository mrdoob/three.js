// Run sequential five-second throughput comparisons with vsync disabled.
// node test/benchmarks/shared-webgl-buffers.runner.js --size=256 --detail=128 --depth=24 --output=/tmp/shared-buffers.json
import puppeteer from 'puppeteer';
import { writeFile } from 'node:fs/promises';
import { createServer } from '../../utils/server.js';

const parameters = new URLSearchParams( process.argv.slice( 2 ).map( argument => argument.replace( /^--/, '' ) ).join( '&' ) );
const outputPath = parameters.get( 'output' );
parameters.delete( 'output' );
parameters.set( 'mode', 'throughput' );
if ( ! parameters.has( 'depth' ) ) parameters.set( 'depth', '24' );
const launchFlags = [ '--no-sandbox', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit' ];
const server = createServer();
let browser;

try {

	await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
	browser = await puppeteer.launch( { headless: true, args: launchFlags } );
	const page = await browser.newPage();
	page.on( 'pageerror', error => console.error( error ) );
	await page.goto( `http://127.0.0.1:${server.address().port}/test/benchmarks/shared-webgl-buffers.html?${parameters}` );
	const result = await page.evaluate( () => window.sharedBuffersResult );
	const report = { browser: await browser.version(), launchFlags, result };
	if ( outputPath ) await writeFile( outputPath, JSON.stringify( report, null, 2 ) + '\n' );
	console.log( JSON.stringify( { width: result.width, sphereSegments: result.sphereSegments, ssrDepthBits: result.ssrDepthBits, gpu: result.gpu, throughput: result.throughput }, null, 2 ) );

} finally {

	if ( browser ) await browser.close();
	await new Promise( resolve => server.close( resolve ) );

}
