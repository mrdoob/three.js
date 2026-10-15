/**
 * Selects at most two local reflection probes for a debug object. Probe weights
 * come from overlapping influence volumes, not a nearest-neighbor graph.
 * Author volumes so at most two overlap along the walkthrough: truncating a
 * larger overlap can cause a visible transition when the selected pair changes.
 *
 * Weights sum to one including the global fallback. Sampling/blending happens
 * in linear HDR radiance, after each probe's independent box projection.
 *
 * Selection is object-wide; box projection is evaluated per fragment. This is
 * intended for the small debug sphere, not large meshes crossing several rooms.
 * The shader always samples two local PMREMs and one fallback, so sampling cost
 * is bounded while CPU selection is linear in the number of authored probes.
 *
 * Textures must use the same world-space orientation as three.js environment
 * maps. Loaded cube and equirectangular inputs are filtered by pmremTexture;
 * author HDR inputs in linear color space (and mark sRGB LDR images correctly).
 * Material envMapRotation should be left at its default identity for projection.
 *
 * Usage:
 * `js
 * const system = new SpecularProbes( probes, environmentTexture );
 * const node = specularProbes( system, uniform( 0.15 ) );
 * material.colorNode = node; // MeshBasicNodeMaterial
 * system.update( sphere.position ); // each frame, before rendering
 * `
 *
 * @three_import import { SpecularProbes } from 'three/addons/lighting/SpecularProbes.js';
 */
class SpecularProbes {

	constructor( probes, fallbackTexture ) {

		if ( ! fallbackTexture ) throw new Error( 'SpecularProbes: A global fallback texture is required.' );

		this.probes = probes;
		this.fallbackTexture = fallbackTexture;
		this.boxProjection = true;
		this.slots = [ { probe: null, weight: 0 }, { probe: null, weight: 0 } ];
		this.fallbackWeight = 1;
		this._captureIndex = 0;
		this._lastCaptureTime = - Infinity;

	}

	/** Select the probes using the debug object's center, once per frame. */
	update( position ) {

		const slots = this.slots;
		for ( const slot of slots ) {

			slot.probe = null;
			slot.weight = 0;

		}

		for ( const probe of this.probes ) {

			if ( probe.texture === null ) continue;
			const weight = probe.getWeight( position );
			if ( weight > slots[ 0 ].weight ) {

				slots[ 1 ].probe = slots[ 0 ].probe;
				slots[ 1 ].weight = slots[ 0 ].weight;
				slots[ 0 ].probe = probe;
				slots[ 0 ].weight = weight;

			} else if ( weight > slots[ 1 ].weight ) {

				slots[ 1 ].probe = probe;
				slots[ 1 ].weight = weight;

			}

		}

		const total = slots[ 0 ].weight + slots[ 1 ].weight;
		this.fallbackWeight = Math.max( 0, 1 - total );
		const normalization = Math.max( total, 1 );
		for ( const slot of slots ) slot.weight /= normalization;
		return this;

	}

	/**
	 * Capture at most one realtime probe per interval (time and interval in
	 * seconds). Each update still renders six faces; this is amortization across
	 * probes, not across faces. Returns the updated probe, or null.
	 */
	updateCapture( renderer, scene, time, interval = 1 ) {

		if ( time - this._lastCaptureTime < interval ) return null;

		for ( let i = 0; i < this.probes.length; i ++ ) {

			const probe = this.probes[ this._captureIndex % this.probes.length ];
			this._captureIndex ++;
			if ( probe.realtime === false ) continue;
			probe.capture( renderer, scene );
			this._lastCaptureTime = time;
			return probe;

		}

		return null;

	}

}

export { SpecularProbes };

