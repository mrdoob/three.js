import { Box3, CubeCamera, CubeRenderTarget, HalfFloatType, MathUtils, Vector3 } from 'three/webgpu';

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

	constructor( { position = new Vector3(), influenceBox = new Box3(), projectionBox = null, blendDistance = 1, texture = null, near = 0.1, far = 100 } = {} ) {

		this.position = position.clone();
		this.influenceBox = influenceBox.clone();
		this.projectionBox = projectionBox === null ? null : projectionBox.clone();
		this.blendDistance = blendDistance;
		this.texture = texture;
		this.source = texture === null ? 'capture' : 'texture';
		this.near = near;
		this.far = far;
		this._renderTarget = null;
		this._camera = null;

	}

	/** Returns an inward face-distance fade, or zero outside the volume. */
	getWeight( position ) {

		const box = this.influenceBox;
		const distance = Math.min(
			position.x - box.min.x, box.max.x - position.x,
			position.y - box.min.y, box.max.y - position.y,
			position.z - box.min.z, box.max.z - position.z
		);
		return MathUtils.clamp( distance / Math.max( this.blendDistance, 1e-6 ), 0, 1 );

	}

	/**
	 * Captures all six faces synchronously. Hide reflective/debug objects before
	 * calling this method to avoid self-reflections. SpecularProbes.capture()
	 * explicitly filters and packs the captured textures before publishing them.
	 */
	capture( renderer, scene, resolution ) {

		if ( this._renderTarget !== null && this._renderTarget.width !== resolution ) this.dispose();
		if ( this._renderTarget === null ) {

			this._renderTarget = new CubeRenderTarget( resolution, { type: HalfFloatType } );
			this._camera = new CubeCamera( this.near, this.far, this._renderTarget );

		}

		this._camera.position.copy( this.position );
		for ( const camera of this._camera.children ) {

			if ( camera.near !== this.near || camera.far !== this.far ) {

				camera.near = this.near;
				camera.far = this.far;
				camera.updateProjectionMatrix();

			}

		}

		const target = renderer.getRenderTarget();
		const face = renderer.getActiveCubeFace();
		const mip = renderer.getActiveMipmapLevel();
		const xrEnabled = renderer.xr.enabled;
		const autoClear = renderer.autoClear;
		const autoClearColor = renderer.autoClearColor;
		const autoClearDepth = renderer.autoClearDepth;
		const autoClearStencil = renderer.autoClearStencil;
		const mrt = renderer.getMRT();
		const mipmapsAutoUpdate = this._renderTarget.texture.mipmapsAutoUpdate;

		try {

			renderer.autoClear = renderer.autoClearColor = renderer.autoClearDepth = renderer.autoClearStencil = true;
			renderer.setMRT( null );
			this._camera.update( renderer, scene );
			this.texture = this._renderTarget.texture;

		} finally {

			renderer.setRenderTarget( target, face, mip );
			renderer.xr.enabled = xrEnabled;
			renderer.autoClear = autoClear;
			renderer.autoClearColor = autoClearColor;
			renderer.autoClearDepth = autoClearDepth;
			renderer.autoClearStencil = autoClearStencil;
			renderer.setMRT( mrt );
			this._renderTarget.texture.mipmapsAutoUpdate = mipmapsAutoUpdate;

		}

		return this;

	}

	dispose() {

		if ( this._renderTarget !== null ) {

			if ( this.texture === this._renderTarget.texture ) this.texture = null;
			// PMREM's cache listens to source texture disposal, not target disposal.
			this._renderTarget.texture.dispose();
			this._renderTarget.dispose();
			this._renderTarget = null;
			this._camera = null;

		}

	}

}

export { SpecularProbe };
