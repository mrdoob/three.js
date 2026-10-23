import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-materials`;
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
		const renderer = new THREE.WebGPURenderer( { requiredLimits: { maxStorageBuffersPerShaderStage: 8 } } );
		await renderer.init();
		const gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => gpuErrors.push( event.error.message ) );
		const target = new THREE.RenderTarget( 64, 64 );
		renderer.setRenderTarget( target );
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 4;
		const geometry = new THREE.BufferGeometry();
		const positions = [], normals = [], indices = [];

		for ( let band = 0; band < 3; band ++ ) {

			const left = band - 1.5, right = left + 1, base = band * 4;
			positions.push( left, - 0.35, 0, right, - 0.35, 0, right, 0.35, 0, left, 0.35, 0 );
			for ( let i = 0; i < 4; i ++ ) normals.push( 0, 0, 1 );
			indices.push( base, base + 1, base + 2, base, base + 2, base + 3 );
			geometry.addGroup( band * 6, 6, [ 2, 0, 1 ][ band ] );

		}

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		geometry.setIndex( indices );
		const geometries = [ geometry, geometry.toNonIndexed() ];
		const materials = [ 0xff0000, 0x00ff00, 0x0000ff ].map( color => new THREE.MeshBasicNodeMaterial( { color } ) );
		const transparent = new THREE.MeshBasicNodeMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 } );
		const hidden = materials[ 1 ].clone();
		hidden.visible = false;
		const scenarios = [];
		const pipelines = { render: 0, compute: 0 };

		for ( const [ method, key ] of [[ 'createRenderPipeline', 'render' ], [ 'createComputePipeline', 'compute' ]] ) {

			const original = renderer.backend[ method ];
			renderer.backend[ method ] = function ( ...args ) {

				pipelines[ key ] ++;
				return original.apply( this, args );

			};

		}

		const capture = async ( scene ) => {

			renderer.render( scene, camera );
			await renderer.backend.device.queue.onSubmittedWorkDone();
			return renderer.readRenderTargetPixelsAsync( target, 0, 0, 64, 64 );

		};

		for ( const name of [ 'indexed', 'nonindexed', 'mesh', 'shared', 'hybrid', 'hidden', 'static', 'static-overflow', 'draw-range' ] ) {

			const scene = new THREE.Scene();
			const source = name === 'nonindexed' ? geometries[ 1 ] : geometry;
			const palette = name === 'hybrid' ? [ materials[ 0 ], materials[ 1 ], transparent ] : name === 'hidden' ? [ materials[ 0 ], hidden, materials[ 2 ] ] : materials;
			const plainMesh = name === 'mesh' || name === 'shared';
			const mesh = plainMesh ? new THREE.Mesh( source, palette ) : new THREE.InstancedMesh( source, palette, 2 );

			if ( plainMesh ) {

				mesh.position.y = - 0.6;
				if ( name === 'shared' ) {

					const other = new THREE.Mesh( source, [ materials[ 1 ], materials[ 2 ], materials[ 0 ] ] );
					other.position.y = 0.6;
					scene.add( other );

				}

			} else {

				mesh.setMatrixAt( 0, new THREE.Matrix4().makeTranslation( 0, - 0.6, 0 ) );
				mesh.setMatrixAt( 1, new THREE.Matrix4().makeTranslation( 0, 0.6, 0 ) );
				mesh.instanceMatrix.needsUpdate = true;
				mesh.computeBoundingSphere();

			}

			if ( name.startsWith( 'static' ) ) {

				const bundle = new THREE.BundleGroup();
				bundle.static = true;
				bundle.add( mesh );
				scene.add( bundle );

			} else {

				scene.add( mesh );

			}

			if ( name === 'draw-range' ) source.setDrawRange( 6, 6 );
			renderer.drawer = new THREE.Drawer();
			const reference = await capture( scene );
			const drawer = name === 'static-overflow' ? new class extends GPUDrivenDrawer {

				get maxInstances() {

					return 2;

				}

			}( { lodThreshold: 0 } ) : new GPUDrivenDrawer( { lodThreshold: 0 } );
			renderer.drawer = drawer;
			await renderer.compileAsync( scene, camera );
			const compiledPipelines = { ...pipelines };
			const pixels = await capture( scene );
			const renderedPipelines = { ...pipelines };
			const list = renderer._renderLists.get( scene, camera, renderer.lighting );
			const record = drawer._renderListBatches.get( list );
			const entries = record ? [ ...record.entries, ...[ ...record.staticGroups.values() ].flatMap( data => data.entries ) ] : [];
			const activeBatches = record?.culling?.batches.filter( batch => batch.count > 0 ).length ?? 0;
			let maxError = 0;
			for ( let i = 0; i < pixels.length; i ++ ) maxError = Math.max( maxError, Math.abs( pixels[ i ] - reference[ i ] ) );
			scenarios.push( { name, maxError, activeBatches, entries: entries.length, compiledPipelines, renderedPipelines, cachedGroups: drawer._groupClusters.get( source )?.size ?? 0 } );
			source.setDrawRange( 0, Infinity );
			if ( mesh.isInstancedMesh ) mesh.dispose();

		}

		target.dispose();
		for ( const source of geometries ) source.dispose();
		for ( const material of [ ...materials, transparent, hidden ] ) material.dispose();
		renderer.dispose();
		return { scenarios, gpuErrors };

	} );
	console.log( JSON.stringify( result, null, 2 ) );
	for ( const scenario of result.scenarios ) {

		assert.equal( scenario.maxError, 0, `${ scenario.name }: every material group must match conventional rendering.` );
		const fallback = scenario.name === 'static-overflow' || scenario.name === 'draw-range';
		// one batch per material: the meshes of the shared geometry with different material arrays share the batches
		assert.equal( scenario.activeBatches, fallback ? 0 : [ 'hybrid', 'hidden' ].includes( scenario.name ) ? 2 : 3, `${ scenario.name }: compatible submeshes must use GPU batches.` );
		if ( scenario.name === 'shared' ) assert.equal( scenario.cachedGroups, 3, 'Meshes with different material arrays must share the meshlets for each geometry group.' );
		assert.deepEqual( scenario.renderedPipelines, scenario.compiledPipelines, `${ scenario.name }: first render must reuse compileAsync pipelines.` );

	}

	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	console.log( 'GPU-driven multiple materials passed: exact pixels, indexed and nonindexed groups, instancing, mixed transparency, hidden materials, static bundles, overflow fallback, draw ranges and compileAsync.' );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
