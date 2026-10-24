import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-clipping`;
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
		const { VisibilityBufferDrawer } = await import( 'three/addons/drawers/VisibilityBufferDrawer.js' );
		const renderer = new THREE.WebGPURenderer();
		await renderer.init();
		const gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => gpuErrors.push( event.error.message ) );
		const size = 64;
		renderer.setSize( size, size );
		const target = new THREE.RenderTarget( size, size );
		renderer.setRenderTarget( target );
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 5;
		const geometry = new THREE.PlaneGeometry( 1.2, 1.8, 4, 4 );
		const material = new THREE.MeshBasicNodeMaterial( { color: 0x00ff00 } );
		const backgroundMaterial = new THREE.MeshBasicNodeMaterial( { color: 0x0000ff } );
		const scenarios = [];

		const capture = async ( scene ) => {

			renderer.render( scene, camera );
			await renderer.backend.device.queue.onSubmittedWorkDone();
			return renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

		};

		for ( const mode of [ 'hardware', 'depth-prepass', 'visibility' ] ) {

			for ( const layout of [ 'clipped-first', 'plain-first', 'intersection', 'nested', 'bundle-inside-clip', 'clip-inside-bundle', 'disabled' ] ) {

				const scene = new THREE.Scene();
				const clipped = new THREE.Mesh( geometry, material );
				clipped.position.x = - 1;
				const plain = new THREE.Mesh( geometry, material );
				plain.position.x = 1;
				const background = new THREE.Mesh( geometry, backgroundMaterial );
				background.position.set( - 1, 0, - 0.3 );
				const clippingGroup = new THREE.ClippingGroup();
				clippingGroup.clippingPlanes = [ new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 ) ];
				clippingGroup.add( clipped );
				clippingGroup.enabled = layout !== 'disabled';
				let root = clippingGroup;

				if ( layout === 'intersection' ) {

					clippingGroup.clipIntersection = true;
					clippingGroup.clippingPlanes.push( new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 1 ) );

				} else if ( layout === 'nested' ) {

					const inner = new THREE.ClippingGroup();
					inner.clippingPlanes = [ new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 1 ) ];
					inner.add( clipped );
					clippingGroup.add( inner );

				} else if ( layout === 'bundle-inside-clip' ) {

					const bundle = new THREE.BundleGroup();
					bundle.add( clipped );
					clippingGroup.add( bundle );

				} else if ( layout === 'clip-inside-bundle' ) {

					root = new THREE.BundleGroup();
					root.add( clippingGroup );

				}

				if ( layout === 'plain-first' ) scene.add( plain, root, background );
				else scene.add( root, plain, background );

				const drawer = mode === 'visibility' ? new VisibilityBufferDrawer( { lodThreshold: 0, maxRasterSize: 64 } ) : new GPUDrivenDrawer( { lodThreshold: 0, depthPrepass: mode === 'depth-prepass' } );
				renderer.drawer = drawer;
				await renderer.compileAsync( scene, camera );
				const first = await capture( scene );
				let settled;
				for ( let i = 0; i < 3; i ++ ) settled = await capture( scene );
				const list = renderer._renderLists.get( scene, camera, renderer.lighting );
				const record = drawer._renderListBatches.get( list );
				const entries = record ? [ ...record.entries, ...[ ...record.staticGroups.values() ].flatMap( data => data.entries ) ] : [];
				const batched = object => entries.some( entry => entry.batch !== null && entry.objects.includes( object ) );
				renderer.drawer = new THREE.Drawer();
				const expected = await capture( scene );
				let maxError = 0;

				// Compare interiors on both sides of the clipping planes, avoiding software/hardware silhouette differences.

				for ( let y = 24; y < 40; y ++ ) {

					for ( const left of [ 14, 42 ] ) {

						for ( let x = left; x < left + 9; x ++ ) {

							for ( let c = 0; c < 4; c ++ ) {

								const i = ( y * size + x ) * 4 + c;
								maxError = Math.max( maxError, Math.abs( first[ i ] - expected[ i ] ), Math.abs( settled[ i ] - expected[ i ] ) );

							}

						}

					}

				}

				scenarios.push( { mode, layout, maxError, plainBatched: batched( plain ), clippedBatched: batched( clipped ) } );
				drawer.dispose();

			}

		}

		geometry.dispose();
		material.dispose();
		backgroundMaterial.dispose();
		target.dispose();
		renderer.dispose();
		return { scenarios, gpuErrors };

	} );

	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	for ( const scenario of result.scenarios ) {

		const label = `${ scenario.mode }: ${ scenario.layout }`;
		assert.equal( scenario.maxError, 0, `${ label } must preserve clipping and reveal the background through clipped fragments.` );
		assert.equal( scenario.plainBatched, true, `${ label } must keep unclipped objects in the GPU-driven pipeline.` );
		assert.equal( scenario.clippedBatched, scenario.layout === 'disabled', `${ label } must use conventional rendering for active clipping planes.` );

	}

	console.log( `GPU-driven clipping passed: ${ result.scenarios.length } scenarios, shared materials, both traversal orders, intersection, nested clipping, static bundles and occlusion.` );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
