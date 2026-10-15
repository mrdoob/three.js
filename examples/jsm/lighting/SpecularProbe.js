import { Box3, CubeCamera, CubeRenderTarget, HalfFloatType, Vector3 } from 'three/webgpu';

/**
 * An authored local reflection volume. Coordinates are world-space, axis-aligned.
 * The influence box controls blending; the optional projection box approximates
 * the room's reflecting surfaces and need not match the influence box.
 *
 * Loaded cube/equirectangular textures remain caller-owned. Only internally
 * captured render targets are disposed by this class.
 *
 * @three_import import { SpecularProbe } from 'three/addons/lighting/SpecularProbe.js';
 */
class SpecularProbe {

	constructor( { position = new Vector3(), influenceBox = new Box3(), projectionBox = null, blendDistance = 1, texture = null, resolution = 128, near = 0.1, far = 100 } = {} ) {

		this.position = position.clone();
		this.influenceBox = influenceBox.clone();
		this.projectionBox = projectionBox === null ? null : projectionBox.clone();
		this.blendDistance = blendDistance;
		this.texture = texture;
		this.resolution = resolution;
		this.near = near;
		this.far = far;
		this.realtime = false;
		this._renderTarget = null;
		this._camera = null;

	}

	/** Returns an inward face-distance fade, or zero outside the volume. */
	getWeight( position ) {

		const box = this.influenceBox;
		if ( ! box.containsPoint( position ) ) return 0;
		if ( this.blendDistance <= 0 ) return 1;

		const distance = Math.min(
			position.x - box.min.x, box.max.x - position.x,
			position.y - box.min.y, box.max.y - position.y,
			position.z - box.min.z, box.max.z - position.z
		);
		return Math.min( distance / this.blendDistance, 1 );

	}

	/**
	 * Captures all six faces synchronously. Hide reflective/debug objects before
	 * calling this method to avoid self-reflections. PMREM filtering is performed
	 * lazily by the consuming TSL node. Call after renderer initialization.
	 */
	capture( renderer, scene ) {

		if ( this._renderTarget === null ) {

			this._renderTarget = new CubeRenderTarget( this.resolution, { type: HalfFloatType } );
			this._camera = new CubeCamera( this.near, this.far, this._renderTarget );

		}

		this._camera.position.copy( this.position );
		const target = renderer.getRenderTarget();
		const face = renderer.getActiveCubeFace();
		const mip = renderer.getActiveMipmapLevel();
		const xrEnabled = renderer.xr.enabled;
		const mipmapsAutoUpdate = this._renderTarget.texture.mipmapsAutoUpdate;

		try {

			this._camera.update( renderer, scene );
			this.texture = this._renderTarget.texture;

		} finally {

			renderer.setRenderTarget( target, face, mip );
			renderer.xr.enabled = xrEnabled;
			this._renderTarget.texture.mipmapsAutoUpdate = mipmapsAutoUpdate;

		}

		return this;

	}

	dispose() {

		if ( this._renderTarget !== null ) {

			if ( this.texture === this._renderTarget.texture ) this.texture = null;
			this._renderTarget.dispose();
			this._renderTarget = null;
			this._camera = null;

		}

	}

}

export { SpecularProbe };
