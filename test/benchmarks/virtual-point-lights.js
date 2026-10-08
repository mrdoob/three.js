import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import { createServer } from '../../utils/server.js';

// Run from the repository root: node test/benchmarks/virtual-point-lights.js
// Arguments: output directory, width (800), height (600). Shadows use cached GPU maps.
const args = process.argv.slice( 2 );
assert.ok( args.every( argument => ! argument.startsWith( '--' ) ), 'Usage: node test/benchmarks/virtual-point-lights.js [output directory] [width] [height]' );
const output = args[ 0 ];
const width = Number( args[ 1 ] || 800 );
const height = Number( args[ 2 ] || 600 );
assert.ok( Number.isInteger( width ) && width > 0 && Number.isInteger( height ) && height > 0 );
const runs = 3;
const warmup = 1000;
const duration = 5000;
const scenes = [ 'webgpu_virtualpointlights', 'webgpu_virtualpointlights_complex' ];
const modes = [
	{ name: 'shadow maps', mode: 'combined', shadows: true },
	{ name: 'visibility off', mode: 'combined', shadows: false },
	{ name: 'direct only', mode: 'direct only', shadows: true }
];
const referenceName = 'shadow-map-visible';
const results = [];
const server = createServer();
let browser;

try {

	if ( output ) await mkdir( output, { recursive: true } );
	await new Promise( resolve => server.listen( 0, resolve ) );
	browser = await puppeteer.launch( {

		headless: true,
		args: [ '--enable-unsafe-webgpu', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--disable-gpu-watchdog' ],
		defaultViewport: { width, height, deviceScaleFactor: 1 },
		protocolTimeout: 120000

	} );
	console.log( `Browser: ${ await browser.version() }; ${ width } x ${ height }, seed 1; ${ warmup } ms warm-up, ${ duration } ms measurement, fences every 8 frames.` );

	for ( const scene of scenes ) {

		let reference;

		// Start with the high-count reference. Each configuration gets a fresh page.
		for ( const count of [ 1024, 256, 64 ] ) {

			for ( const mode of modes ) {

				for ( let run = 0; run < runs; run ++ ) {

					console.log( `Starting ${ scene }, ${ count } rays, ${ mode.name }, run ${ run + 1 }` );
					const page = await browser.newPage();
					await page.setRequestInterception( true );
					page.on( 'request', request => {

						if ( new URL( request.url() ).pathname === '/favicon.ico' ) {

							request.respond( { status: 204 } );

						} else {

							request.continue();

						}

					} );
					const errors = [];
					page.on( 'pageerror', error => errors.push( error.message ) );
					page.on( 'console', message => {

						if ( message.type() === 'error' ) errors.push( message.text() );

					} );
					await page.goto( `http://localhost:${ server.address().port }/examples/${ scene }.html?benchmark` );
					await page.waitForFunction( () => window.vplBenchmark !== undefined, { timeout: 120000 } );
					const result = await page.evaluate( ( settings, warmup, duration ) => window.vplBenchmark.run( settings, warmup, duration ), { count, mode: mode.mode, shadows: mode.shadows, seed: 1 }, warmup, duration );
					console.log( `Completed measurement: ${ result.frames } frames in ${ result.elapsed.toFixed( 1 ) } ms` );
					assert.deepEqual( errors, [], 'The example must render without errors' );
					assert.ok( result.frames > 0 && result.elapsed >= duration );
					assert.ok( result.count > 0 && result.count <= count );

					if ( run === 0 ) {

						// Read the completed output target outside the measurement interval.
						const pixels = await page.evaluate( () => window.vplBenchmark.capture() );
						assert.equal( pixels.length, width * height * 4, 'Readback must be tightly packed RGBA8; rebuild stale build files if this fails' );
						const image = new PNG( { width, height } );
						image.data = Buffer.from( pixels );
						assert.ok( pixels.some( ( value, i ) => i % 4 !== 3 && value > 0 ), 'Output must contain rendered geometry' );
						const png = PNG.sync.write( image );
						if ( reference === undefined ) reference = image;
						assert.equal( image.data.length, reference.data.length );
						let squaredError = 0;
						for ( let i = 0; i < image.data.length; i ++ ) {

							if ( i % 4 !== 3 ) squaredError += ( image.data[ i ] - reference.data[ i ] ) ** 2;

						}

						result.imageRMSE = Math.sqrt( squaredError / ( image.width * image.height * 3 ) ) / 255;
						if ( output ) await writeFile( join( output, `${ scene }-${ count }-${ mode.name.replaceAll( ' ', '-' ) }.png` ), png );

					}

					results.push( { scene, budget: count, mode: mode.name, run: run + 1, ...result } );
					if ( output ) await writeFile( join( output, 'samples.json' ), JSON.stringify( results, null, 2 ) );
					console.log( `${ scene }, ${ count } rays (${ result.count } VPLs), ${ mode.name }, run ${ run + 1 }: ${ result.fps.toFixed( 1 ) } fps` );
					await page.close();

				}

			}

		}

	}

	const rows = [];
	for ( const scene of scenes ) {

		for ( const count of [ 64, 256, 1024 ] ) {

			for ( const mode of modes ) {

				const samples = results.filter( result => result.scene === scene && result.budget === count && result.mode === mode.name );
				const median = samples.map( result => result.msPerFrame ).sort( ( a, b ) => a - b )[ 1 ];
				const rebuildMedian = samples.map( result => result.rebuildMs ).sort( ( a, b ) => a - b )[ 1 ];
				rows.push( { scene, budget: count, VPLs: samples[ 0 ].count, mode: mode.name, fps: ( 1000 / median ).toFixed( 1 ), 'ms/frame': median.toFixed( 3 ), 'rebuild ms': rebuildMedian.toFixed( 1 ), 'image RMSE': samples[ 0 ].imageRMSE.toFixed( 4 ) } );

			}

		}

	}

	console.log( `Median sustained GPU-completed throughput of 3 runs. Image RMSE is display-space RGB vs. 1024-ray ${ referenceName } gather in each scene; this is a single-bounce reference, not ground truth.` );
	console.table( rows );
	if ( output ) await writeFile( join( output, 'results.json' ), JSON.stringify( { browser: await browser.version(), warmup, duration, width, height, referenceName, results, medians: rows }, null, 2 ) );

} finally {

	if ( browser !== undefined ) await browser.close();
	server.close();

}
