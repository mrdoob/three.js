import { Vector3 } from 'three/webgpu';
import { SpecularProbeAtlas } from './SpecularProbeAtlas.js';

const _size = new Vector3();
const volume = ( probe ) => {

	probe.influenceBox.getSize( _size );
	return _size.x * _size.y * _size.z;

};

/**
 * A static collection of local reflection volumes, packed into one GPU cube
 * array. The shader evaluates face fades and front-to-back coverage at every
 * surface pixel. Smaller influence boxes have priority over larger boxes;
 * equal volumes retain their input order. Uncovered coverage samples the
 * captured `scene.environment`, or black without one.
 *
 * Call capture() after changing sources, probe order, or resolution.
 * Loaded textures remain caller-owned. Cube arrays require the WebGPU backend.
 *
 * @three_import import { SpecularProbes } from 'three/addons/lighting/SpecularProbes.js';
 */
class SpecularProbes {

	constructor( probes ) {

		this.probes = probes;
		this.boxProjection = true;
		this.atlas = new SpecularProbeAtlas();
		this.sortedProbes = [];
		this.lastCaptureTime = 0;
		this.capturing = false;

	}

	/**
	 * Capture scene sources, filter every source (including loaded sources and
	 * sky), and publish the cube array. Returns CPU wall time in milliseconds,
	 * including GPU completion, filtering, and packing. Drains prior GPU work
	 * before starting; first capture includes shader/pipeline compilation.
	 */
	async capture( renderer, scene, { resolution = 128 } = {} ) {

		if ( this.capturing ) throw new Error( 'SpecularProbes: A capture is already in progress.' );
		if ( renderer.backend.isWebGPUBackend !== true ) throw new Error( 'SpecularProbes: Cube arrays require the WebGPU backend.' );
		if ( ! [ 64, 128, 256, 512, 1024 ].includes( resolution ) ) throw new Error( 'SpecularProbes: Resolution must be 64, 128, 256, 512, or 1024.' );
		this.capturing = true;

		try {

			await renderer.backend.device.queue.onSubmittedWorkDone();
			const start = performance.now();
			const probes = this.probes.slice().sort( ( a, b ) => volume( a ) - volume( b ) );
			for ( const probe of probes ) {

				if ( probe.source === 'capture' ) {

					probe.resolution = resolution;
					probe.capture( renderer, scene );

				}

				if ( probe.texture === null ) throw new Error( 'SpecularProbes: A loaded probe has no texture.' );

			}

			await this.atlas.update( renderer, [ ...probes.map( ( probe ) => probe.texture ), scene.environment ], { resolution } );
			await renderer.backend.device.queue.onSubmittedWorkDone();
			this.sortedProbes = probes;
			this.lastCaptureTime = performance.now() - start;
			return this.lastCaptureTime;

		} finally {

			this.capturing = false;

		}

	}

	/** CPU inspection of the same front-to-back combiner used per pixel. */
	getWeights( position ) {

		let remaining = 1;
		const weights = this.sortedProbes.map( ( probe ) => {

			const weight = probe.getWeight( position ) * remaining;
			remaining -= weight;
			return { probe, weight };

		} );
		return { weights, fallbackWeight: remaining };

	}

	dispose() {

		this.atlas.dispose();
		for ( const probe of this.probes ) probe.dispose();

	}

}

export { SpecularProbes };
