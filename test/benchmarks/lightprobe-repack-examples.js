import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Optionally serve the upstream LightProbeGrid source as an immutable baseline.
// This keeps the removed implementation out of the addon and benchmark sources.
export async function benchmarkExamples( browser, baseURL, referenceFile ) {

	const reference = referenceFile ? await readFile( referenceFile, 'utf8' ) : null;
	const results = [];

	for ( const name of [ 'webgpu_lightprobes', 'webgpu_lightprobes_complex' ] ) {

		for ( const path of reference ? [ 'raster', 'compute' ] : [ 'compute' ] ) {

			const page = await browser.newPage();
			await page.setViewport( { width: 1280, height: 720, deviceScaleFactor: 1 } );
			const errors = [];
			page.on( 'pageerror', error => errors.push( error.message ) );
			page.on( 'console', message => {

				if ( message.type() === 'error' && ! message.text().includes( '404' ) ) errors.push( message.text() );

			} );
			await page.setRequestInterception( true );
			page.on( 'request', async request => {

				const pathname = new URL( request.url() ).pathname;
				if ( path === 'raster' && pathname.endsWith( '/lighting/LightProbeGrid.js' ) ) {

					await request.respond( { status: 200, contentType: 'text/javascript', body: reference } );

				} else if ( pathname === `/examples/${ name }.html` ) {

					let html = await readFile( fileURLToPath( new URL( `../../examples/${ name }.html`, import.meta.url ) ), 'utf8' );
					html = html.replaceAll( '../build/three.webgpu.js', '../src/Three.WebGPU.js' ).replaceAll( '../build/three.tsl.js', '../src/Three.TSL.js' );
					const grids = name.endsWith( '_complex' ) ? '[ probesLeft, probesRight ]' : '[ probes ]';
					html = html.replace( 'init();', `window.benchmarkScene = { get renderer() { return renderer; }, get scene() { return scene; }, get camera() { return camera; }, get grids() { return ${ grids }; } }; init().then( () => window.benchmarkReady = true ).catch( error => window.benchmarkError = error.stack );` );
					html = html.replaceAll( 'renderer.setAnimationLoop( animate );', '' );
					await request.respond( { status: 200, contentType: 'text/html', body: html } );

				} else {

					await request.continue();

				}

			} );
			await page.goto( `${ baseURL }/examples/${ name }.html` );
			await page.waitForFunction( () => window.benchmarkReady || window.benchmarkError, { timeout: 120000 } );
			const result = await page.evaluate( async () => {

				if ( window.benchmarkError ) throw new Error( window.benchmarkError );
				const { renderer, scene, camera, grids } = window.benchmarkScene;
				renderer._animation.stop();
				renderer.inspector.enabled = false;
				const device = renderer.backend.device;
				const adapter = await navigator.gpu.requestAdapter( { powerPreference: 'high-performance' } );
				const info = adapter.info;
				const hardware = { vendor: info.vendor, architecture: info.architecture, device: info.device, description: info.description, isFallbackAdapter: info.isFallbackAdapter };
				if ( info.isFallbackAdapter || /swiftshader|llvmpipe|lavapipe|software/i.test( JSON.stringify( hardware ) ) ) throw new Error( 'A hardware GPU is required.' );

				function update() {

					renderer._nodes.nodeFrame.update();
					renderer.info.reset();
					if ( grids.length === 1 ) {

						grids[ 0 ].bake( renderer, scene, { cubemapSize: 32, near: 0.05, far: 20, bounces: 3 } );

					} else {

						for ( const grid of grids ) scene.remove( grid );
						for ( let pass = 0; pass <= 3; pass ++ ) {

							for ( const grid of grids ) grid.bake( renderer, scene, { cubemapSize: 32, near: 0.05, far: 20, pass } );
							if ( pass === 0 ) for ( const grid of grids ) scene.add( grid );

						}

					}

					renderer.setRenderTarget( null );
					renderer.render( scene, camera );

				}

				async function measure( milliseconds ) {

					await device.queue.onSubmittedWorkDone();
					const start = performance.now();
					let completed = 0;
					do {

						update();
						await device.queue.onSubmittedWorkDone();
						completed ++;

					} while ( performance.now() - start < milliseconds );

					const elapsed = performance.now() - start;
					return { completed, elapsed, updatesPerSecond: completed * 1000 / elapsed, amortizedMilliseconds: elapsed / completed };

				}

				await measure( 1200 );
				return { ...await measure( 5000 ), resolutions: grids.map( grid => grid.resolution.toArray() ), hardware };

			} );
			await page.close();
			if ( errors.length ) throw new Error( errors.join( '\n' ) );
			results.push( { name, path, ...result } );
			console.log( JSON.stringify( results.at( - 1 ) ) );

		}

	}

	return results;

}
