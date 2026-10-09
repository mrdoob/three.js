import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

// Browser CPU benchmarks and independent output audit, plus actual WebGPU
// rendering. No software GPU results are accepted. Run from repository root.
const server = createServer();
let browser;
const output = { date: new Date().toISOString(), cpu: os.cpus()[ 0 ].model, samples: [] };
const directory = 'test/benchmarks/uv-unwrapper';

try {

	await new Promise( resolve => server.listen( 0, resolve ) );
	browser = await puppeteer.launch( { headless: true, args: [ '--enable-unsafe-webgpu', '--use-angle=d3d11' ], protocolTimeout: 300000 } );
	const page = await browser.newPage();
	await page.setViewport( { width: 1440, height: 1000, deviceScaleFactor: 1 } );
	const errors = [];
	page.on( 'pageerror', error => errors.push( error.message ) );
	const base = `http://localhost:${ server.address().port }`;
	await page.goto( `${ base }/${ directory }/probe.html` );
	output.gpu = await page.evaluate( async () => {

		const adapter = await navigator.gpu?.requestAdapter( { powerPreference: 'high-performance' } );
		if ( ! adapter ) throw new Error( 'No hardware WebGPU adapter available.' );
		const info = adapter.info;
		const gl = document.createElement( 'canvas' ).getContext( 'webgl2' );
		const extension = gl?.getExtension( 'WEBGL_debug_renderer_info' );
		return {
			vendor: info.vendor, architecture: info.architecture, device: info.device, description: info.description,
			fallback: info.isFallbackAdapter ?? adapter.isFallbackAdapter ?? false,
			webglRenderer: extension ? gl.getParameter( extension.UNMASKED_RENDERER_WEBGL ) : 'unavailable'
		};

	} );
	assert.equal( output.gpu.fallback, false, 'Hardware adapter required' );
	assert.doesNotMatch( JSON.stringify( output.gpu ), /swiftshader|llvmpipe|software|lavapipe/i );
	assert.match( JSON.stringify( output.gpu ), /nvidia|amd|intel|apple|10de|1002|8086/i, 'Identify a real GPU before rendering' );
	console.log( 'Hardware:', output.gpu );
	await page.goto( `${ base }/examples/webgpu_unwrap.html` );
	await page.waitForFunction( () => window.unwrapExample?.result, { timeout: 60000 } );
	await mkdir( `${ directory }/screenshots`, { recursive: true } );

	for ( const model of [ 'boxes', 'DamagedHelmet/glTF/DamagedHelmet.gltf', 'Soldier.glb', 'Xbot.glb', 'LeePerrySmith/LeePerrySmith.glb' ] ) {

		for ( const mode of [ 'lightmap', 'normal', 'normal-input' ] ) {

			const sample = await page.evaluate( async ( model, mode ) => {

				document.getElementById( 'mode' ).value = mode === 'lightmap' ? mode : 'normal';
				document.getElementById( 'inputUV' ).checked = mode === 'normal-input';
				const { auditAtlas } = await import( '/test/benchmarks/uv-unwrapper/validate.js' );
				const first = await window.unwrapExample.loadModel( model );
				const runs = [];
				for ( let i = 0; i < 3; i ++ ) {

					window.unwrapExample.unwrap();
					runs.push( window.unwrapExample.result.statistics.totalMilliseconds );

				}

				const result = window.unwrapExample.result;
				runs.sort( ( a, b ) => a - b );
				return {
					model, mode, coldMilliseconds: first.statistics.totalMilliseconds, medianMilliseconds: runs[ 1 ],
					statistics: result.statistics, density: result.texelsPerUnit,
					methods: result.charts.reduce( ( counts, chart ) => {

						counts[ chart.method ] = ( counts[ chart.method ] || 0 ) + 1; return counts;

					}, {} ),
					audit: auditAtlas( result )
				};

			}, model, mode );
			output.samples.push( sample );
			console.log( JSON.stringify( sample ) );
			assert.equal( sample.audit.overlaps, 0, `${ model }/${ mode } overlap` );
			assert.equal( sample.audit.collapsed, 0, `${ model }/${ mode } collapsed` );
			assert.equal( sample.audit.paddingViolations, 0 );
			assert.ok( sample.audit.maxStretch <= ( mode === 'lightmap' ? 1.5 : 2 ) + 0.01 );
			// Give the render loop two frames after the synchronous CPU work.
			await page.evaluate( () => new Promise( resolve => requestAnimationFrame( () => requestAnimationFrame( resolve ) ) ) );
			if ( mode === 'normal' ) await page.screenshot( { path: `${ directory }/screenshots/${ model.split( '/' )[ 0 ].replace( '.glb', '' ) }.png` } );

		}

	}

	output.expectedFailures = [];
	for ( const mode of [ 'lightmap', 'normal' ] ) {

		const failure = await page.evaluate( async mode => {

			document.getElementById( 'mode' ).value = mode;
			document.getElementById( 'inputUV' ).checked = false;
			try {

				await window.unwrapExample.loadModel( 'space_ship_hallway.glb' );
				return null;

			} catch ( error ) {

				return { model: 'space_ship_hallway.glb', mode, error: error.message };

			}

		}, mode );
		assert.match( failure?.error || '', /Float32 atlas precision/ );
		output.expectedFailures.push( failure );
		console.log( 'Expected rejection:', failure );

	}

	output.scaling = await page.evaluate( async () => {

		const THREE = await import( 'three' );
		const { UVUnwrapper } = await import( '/examples/jsm/utils/UVUnwrapper.js' );
		const { auditAtlas } = await import( '/test/benchmarks/uv-unwrapper/validate.js' );
		const samples = [];
		for ( const segments of [ 32, 64, 128, 256 ] ) {

			for ( const mode of [ 'lightmap', 'normal' ] ) {

				const times = [];
				let result;
				for ( let i = 0; i < 3; i ++ ) {

					const mesh = new THREE.Mesh( new THREE.SphereGeometry( 1, segments, segments / 2 ) );
					result = new UVUnwrapper().unwrap( mesh, { mode, resolution: 2048 } );
					times.push( result.statistics.totalMilliseconds );

				}

				times.sort( ( a, b ) => a - b );
				samples.push( { segments, mode, medianMilliseconds: times[ 1 ], statistics: result.statistics, audit: auditAtlas( result ) } );

			}

		}

		return samples;

	} );
	for ( const sample of output.scaling ) {

		console.log( JSON.stringify( sample ) );
		assert.equal( sample.audit.overlaps, 0 );
		assert.equal( sample.audit.collapsed, 0 );
		assert.equal( sample.audit.paddingViolations, 0 );

	}

	output.sceneScaling = await page.evaluate( async () => {

		const THREE = await import( 'three' );
		const { UVUnwrapper } = await import( '/examples/jsm/utils/UVUnwrapper.js' );
		const { auditAtlas } = await import( '/test/benchmarks/uv-unwrapper/validate.js' );
		const samples = [];
		for ( const count of [ 100, 1000, 10000 ] ) {

			const geometry = new THREE.BoxGeometry(), root = new THREE.Group();
			for ( let i = 0; i < count; i ++ ) {

				const mesh = new THREE.Mesh( geometry );
				mesh.position.set( i % 100 * 3, 0, Math.floor( i / 100 ) * 3 );
				mesh.scale.set( 1 + i % 4 * 0.2, 1 + i % 7 * 0.3, 1 );
				mesh.rotation.y = i * 0.123;
				root.add( mesh );

			}

			const times = [];
			let result;
			for ( let i = 0; i < 3; i ++ ) {

				for ( const mesh of root.children ) mesh.geometry = geometry;
				result = new UVUnwrapper().unwrap( root, { resolution: 4096 } );
				times.push( result.statistics.totalMilliseconds );

			}

			times.sort( ( a, b ) => a - b );
			samples.push( { meshes: count, medianMilliseconds: times[ 1 ], statistics: result.statistics, audit: auditAtlas( result ) } );

		}

		return samples;

	} );
	for ( const sample of output.sceneScaling ) {

		console.log( JSON.stringify( sample ) );
		assert.equal( sample.audit.overlaps, 0 );
		assert.equal( sample.audit.collapsed, 0 );
		assert.equal( sample.audit.paddingViolations, 0 );

	}

	assert.deepEqual( errors, [], 'No browser/runtime errors' );
	output.browser = await browser.version();
	await writeFile( `${ directory }/results.json`, JSON.stringify( output, null, 2 ) + '\n' );
	console.log( `Results: ${ directory }/results.json` );

} finally {

	if ( browser ) await browser.close();
	await new Promise( resolve => server.close( resolve ) );

}
