import assert from 'node:assert/strict';
import os from 'node:os';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

// Browser CPU benchmarks and independent output audit in a dedicated harness.
// Run from repository root; generated results are local output.
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
	await page.goto( `${ base }/${ directory }/harness.html` );
	await page.waitForFunction( () => window.unwrapHarness );

	for ( const model of [ 'boxes', 'DamagedHelmet/glTF/DamagedHelmet.gltf', 'Soldier.glb', 'Xbot.glb', 'LeePerrySmith/LeePerrySmith.glb' ] ) {

		for ( const mode of [ 'lightmap', 'normal', 'normal-input' ] ) {

			const sample = await page.evaluate( async ( model, mode ) => {

				window.unwrapHarness.params.mode = mode === 'lightmap' ? mode : 'normal';
				window.unwrapHarness.params.useInputUVs = mode === 'normal-input';
				const { auditAtlas } = await import( '/test/unit/addons/utils/UVUnwrapperTestUtils.js' );
				const first = await window.unwrapHarness.loadModel( model );
				const runs = [];
				for ( let i = 0; i < 3; i ++ ) {

					window.unwrapHarness.unwrap();
					runs.push( window.unwrapHarness.result.diagnostics.statistics.totalMilliseconds );

				}

				const result = window.unwrapHarness.result;
				runs.sort( ( a, b ) => a - b );
				return {
					model, mode, coldMilliseconds: first.diagnostics.statistics.totalMilliseconds, medianMilliseconds: runs[ 1 ],
					statistics: result.diagnostics.statistics, density: result.texelsPerUnit,
					methods: result.diagnostics.charts.reduce( ( counts, chart ) => {

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
			assert.ok( Math.abs( sample.statistics.minTexelsPerUnit - sample.audit.minDensity ) < 1e-6 );
			assert.ok( Math.abs( sample.statistics.maxTexelsPerUnit - sample.audit.maxDensity ) < 1e-6 );
			assert.ok( sample.audit.maxStretch <= ( mode === 'lightmap' ? 1.5 : 2 ) + 0.01 );

		}

	}

	output.expectedFailures = [];
	for ( const mode of [ 'lightmap', 'normal' ] ) {

		const failure = await page.evaluate( async mode => {

			window.unwrapHarness.params.mode = mode;
			window.unwrapHarness.params.useInputUVs = false;
			try {

				await window.unwrapHarness.loadModel( 'space_ship_hallway.glb' );
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
		const { auditAtlas } = await import( '/test/unit/addons/utils/UVUnwrapperTestUtils.js' );
		const samples = [];
		for ( const segments of [ 32, 64, 128, 256 ] ) {

			for ( const mode of [ 'lightmap', 'normal' ] ) {

				const times = [];
				let result;
				for ( let i = 0; i < 3; i ++ ) {

					const mesh = new THREE.Mesh( new THREE.SphereGeometry( 1, segments, segments / 2 ) );
					result = new UVUnwrapper().unwrap( mesh, { mode, resolution: 2048, diagnostics: true } );
					times.push( result.diagnostics.statistics.totalMilliseconds );

				}

				times.sort( ( a, b ) => a - b );
				samples.push( { segments, mode, medianMilliseconds: times[ 1 ], statistics: result.diagnostics.statistics, audit: auditAtlas( result ) } );

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
		const { auditAtlas } = await import( '/test/unit/addons/utils/UVUnwrapperTestUtils.js' );
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
				result = new UVUnwrapper().unwrap( root, { resolution: 4096, diagnostics: true } );
				times.push( result.diagnostics.statistics.totalMilliseconds );

			}

			times.sort( ( a, b ) => a - b );
			samples.push( { meshes: count, medianMilliseconds: times[ 1 ], statistics: result.diagnostics.statistics, audit: auditAtlas( result ) } );

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
	console.log( JSON.stringify( output ) );

} finally {

	if ( browser ) await browser.close();
	await new Promise( resolve => server.close( resolve ) );

}
