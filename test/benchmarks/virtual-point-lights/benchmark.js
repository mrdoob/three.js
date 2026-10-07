import { RenderTarget } from 'three/webgpu';

// Invoked only by ?benchmark. The runner disables browser vsync and frame limits.
export function createBenchmark( renderer, scene, camera, configure ) {

	if ( ! renderer.backend.isWebGPUBackend ) throw new Error( 'This benchmark requires WebGPU.' );
	const queue = renderer.backend.device.queue;
	let deviceLost;
	renderer.backend.device.lost.then( info => {

		deviceLost = info.message;

	} );
	// Use an output target to include tone mapping and MSAA while avoiding browser
	// compositor scheduling. Readback also avoids headless canvas-capture stalls.
	const target = new RenderTarget( renderer.domElement.width, renderer.domElement.height, { samples: renderer.samples } );
	renderer.setOutputRenderTarget( target );

	async function measure( duration ) {

		await queue.onSubmittedWorkDone();
		let frames = 0;
		const start = performance.now();
		let elapsed;

		do {

			// Amortize fence overhead without building an unbounded GPU queue.
			// All rendering, including direct shadows and output, is included.
			for ( let i = 0; i < 8; i ++ ) renderer.render( scene, camera );
			await queue.onSubmittedWorkDone();
			if ( deviceLost !== undefined ) throw new Error( `GPU device lost: ${ deviceLost }` );
			frames += 8;
			elapsed = performance.now() - start;

		} while ( elapsed < duration );

		return { frames, elapsed, fps: frames * 1000 / elapsed, msPerFrame: elapsed / frames };

	}

	return {

		async capture() {

			const pixels = await renderer.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height );
			return Array.from( pixels );

		},

		async run( settings, warmup, duration ) {

			await queue.onSubmittedWorkDone();
			const rebuildStart = performance.now();
			const count = configure( settings );
			await queue.onSubmittedWorkDone();
			const rebuildMs = performance.now() - rebuildStart;
			await renderer.compileAsync( scene, camera );
			await measure( warmup );
			const result = await measure( duration );
			return { ...result, count, rebuildMs };

		}

	};

}
