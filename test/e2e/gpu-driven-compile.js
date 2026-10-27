import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-compile`;
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
		const { MeshletDrawingPipeline } = await import( 'three/addons/pipelines/MeshletDrawingPipeline.js' );
		const { mrt, output, vec4 } = await import( 'three/tsl' );
		const renderer = new THREE.WebGPURenderer( { requiredLimits: { maxUniformBufferBindingSize: 65536, maxStorageBuffersPerShaderStage: 8 } } );
		await renderer.init();
		const gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => gpuErrors.push( event.error.message ) );
		renderer.setSize( 32, 32 );
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 4;
		const target = new THREE.RenderTarget( 32, 32, { count: 2 } );
		target.textures[ 0 ].name = 'output';
		target.textures[ 1 ].name = 'auxiliary';
		const attachments = mrt( { output, auxiliary: vec4( 0.25, 0.5, 0.75, 1 ) } );
		renderer.setRenderTarget( target );
		renderer.setMRT( attachments );
		const material = new THREE.MeshBasicNodeMaterial( { color: 0xff0000 } );
		const geometries = [ new THREE.BoxGeometry(), new THREE.SphereGeometry( 0.5, 8, 6 ), new THREE.TorusGeometry( 0.5, 0.1, 6, 8 ) ];
		const meshes = geometries.map( geometry => new THREE.Mesh( geometry, material ) );
		meshes[ 1 ].position.x = 100;
		meshes[ 2 ].position.x = 200;
		scene.add( ...meshes );
		const shared = new THREE.Mesh( geometries[ 0 ], material );
		shared.position.x = 300;
		scene.add( shared );
		const instanced = new THREE.InstancedMesh( geometries[ 0 ], material, 2 );
		instanced.position.x = 400;
		scene.add( instanced );
		const dormantGeometry = new THREE.ConeGeometry( 0.5, 1, 8 );
		const dormant = new THREE.InstancedMesh( dormantGeometry, material, 1 );
		dormant.count = 0;
		dormant.visible = false;
		scene.add( dormant );
		const counts = { render: 0, compute: 0, draws: 0, dispatches: 0 };

		for ( const [ method, key ] of [[ 'createRenderPipeline', 'render' ], [ 'createComputePipeline', 'compute' ], [ 'draw', 'draws' ], [ 'compute', 'dispatches' ]] ) {

			const original = renderer.backend[ method ];
			renderer.backend[ method ] = function ( ...args ) {

				counts[ key ] ++;
				return original.apply( this, args );

			};

		}

		const scenarios = [];

		for ( const options of [ {}, { occlusionCulling: false }, { debug: true, depthPrepass: true }, { nested: true } ] ) {

			const pipeline = new MeshletDrawingPipeline( { lodThreshold: 0, ...options } );
			renderer.drawingPipeline = pipeline;
			const contexts = renderer._renderContexts;
			const getContext = contexts.get;

			if ( options.nested ) {

				// Reuse a context captured from a nested postprocessing pass, as Megacity does.

				contexts.get = function ( renderTarget, mrt, depth ) {

					return getContext.call( this, renderTarget, mrt, renderTarget === target && mrt === attachments ? 2 : depth );

				};

			}

			const before = { ...counts };
			const initialCallDepth = renderer._callDepth;
			const progress = [];
			await renderer.compileAsync( scene, camera, null, event => progress.push( [ event.loaded, event.total ] ) );
			const compiled = { ...counts };
			const renderList = renderer._renderLists.get( scene, camera, renderer.lighting );
			const record = pipeline._renderListBatches.get( renderList );
			const culling = record.culling;
			const batches = record.entries.map( entry => entry.batch );
			const preparedGeometries = [ ...geometries, dormantGeometry ].every( geometry => pipeline._clusters.has( geometry ) );
			if ( options.nested ) renderer._callDepth = 1;
			renderer.render( scene, camera );
			renderer._callDepth = initialCallDepth;
			await renderer.backend.device.queue.onSubmittedWorkDone();
			const rendered = { ...counts };
			const center = Array.from( await renderer.readRenderTargetPixelsAsync( target, 16, 16, 1, 1 ) );
			await renderer.compileAsync( scene, camera );
			scenarios.push( {
				options, before, compiled, rendered, recompiled: { ...counts }, center, progress, preparedGeometries,
				batchCount: batches.length,
				reused: record.culling === culling && record.entries.every( ( entry, i ) => entry.batch === batches[ i ] ),
				stateRestored: renderer.getRenderTarget() === target && renderer.drawingPipeline === pipeline && renderer.getMRT() === attachments && renderer._callDepth === initialCallDepth && renderer._precompilationState === null
			} );
			contexts.get = getContext;

		}

		renderer.drawingPipeline = new THREE.StandardDrawingPipeline();
		const beforeDefault = { ...counts };
		await renderer.compileAsync( scene, camera );
		const compiledDefault = { ...counts };
		renderer.render( scene, camera );
		await renderer.backend.device.queue.onSubmittedWorkDone();
		const renderedDefault = { ...counts };

		target.dispose();
		for ( const geometry of geometries ) geometry.dispose();
		dormantGeometry.dispose();
		material.dispose();
		renderer.dispose();
		return { scenarios, gpuErrors, beforeDefault, compiledDefault, renderedDefault };

	} );

	for ( const scenario of result.scenarios ) {

		assert.equal( scenario.preparedGeometries, true, 'All distinct geometries, including those outside the frustum, must have meshlets.' );
		// the meshes of all geometries with one material share a batch, the instanced meshes have their own batch
		assert.equal( scenario.batchCount, 2, 'All material/instancing batches must be ready in one compilation.' );
		assert.equal( scenario.compiled.draws, scenario.before.draws, 'Compilation must not draw the occlusion scene.' );
		assert.equal( scenario.compiled.dispatches, scenario.before.dispatches, 'Compilation must not dispatch compute shaders.' );
		assert.ok( scenario.compiled.compute > scenario.before.compute, 'Compute pipelines must be compiled.' );
		assert.equal( scenario.rendered.render, scenario.compiled.render, 'First render must reuse the compiled render pipelines.' );
		assert.equal( scenario.rendered.compute, scenario.compiled.compute, 'First render must reuse the compiled compute pipelines.' );
		assert.equal( scenario.recompiled.render, scenario.rendered.render, 'Repeated compilation must reuse render pipelines.' );
		assert.equal( scenario.recompiled.compute, scenario.rendered.compute, 'Repeated compilation must reuse compute pipelines.' );
		assert.equal( scenario.reused, true, 'Prepared batches and culling buffers must survive the first render.' );
		assert.equal( scenario.stateRestored, true );
		assert.ok( scenario.center[ 3 ] > 200, 'The prepared scene must render an opaque mesh.' );
		assert.deepEqual( scenario.progress.at( - 1 ), [ scenario.progress.length, scenario.progress.length ] );

	}

	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	assert.equal( result.compiledDefault.draws, result.beforeDefault.draws );
	assert.equal( result.renderedDefault.render, result.compiledDefault.render, 'The standard drawing pipeline must still reuse its compiled pipelines.' );
	console.log( 'GPU-driven compileAsync passed: multiple geometries, shared geometry, instancing, MRT, occlusion, debug, depth prepass, nested passes, no draws/dispatches and pipeline reuse. The default StandardDrawingPipeline also passed.' );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
