import { Box3, CubeCamera, CubeReflectionMapping, CubeRenderTarget, HalfFloatType, LinearMipmapLinearFilter, PMREMGenerator, RenderTarget, Scene, Vector3 } from 'three/webgpu';
import { cubeTexture, equirectUV, positionWorldDirection, texture } from 'three/tsl';

// The core generator clamps automatic sizes to 256. These explicitly authored
// cubemaps also support 64 and 128; all are above its 32px integration source.
class ProbePMREMGenerator extends PMREMGenerator {

	_setSize( size ) {

		this._cubeSize = size;

	}

}

/**
 * WebGPU-only reflection storage: one rgba16float GPU texture, 6 array layers
 * per cube, viewed and sampled as a real cube-array. Sources remain caller-owned.
 * Resolution is common to every cube; null sources leave their cube black.
 * Filtering and copying stay on the GPU, without image readback.
 */
class SpecularProbeAtlas {

	constructor() {

		this.texture = null;
		this.maxLod = 0;
		this.resolution = 128;
		this.count = 0;
		this._target = null;

	}

	/**
	 * Build all cubes in source order. Call after renderer.init(). The method
	 * submits GPU work; callers measuring completion must await the device queue.
	 */
	update( renderer, sources, { resolution = 128 } = {} ) {

		if ( renderer.backend.isWebGPUBackend !== true ) throw new Error( 'SpecularProbeAtlas requires the WebGPU backend; cube arrays are unsupported by WebGL.' );
		if ( ! [ 64, 128, 256, 512, 1024 ].includes( resolution ) ) throw new Error( 'SpecularProbeAtlas: Resolution must be a power of two from 64 to 1024.' );

		const maxLod = Math.log2( resolution ) - 3;
		const target = new RenderTarget( resolution, resolution, {
			depth: sources.length * 6,
			type: HalfFloatType,
			depthBuffer: false,
			generateMipmaps: false,
			minFilter: LinearMipmapLinearFilter
		} );
		target.texture.isArrayTexture = true;
		target.texture.isCubeArrayTexture = true;
		target.texture.mapping = CubeReflectionMapping;
		target.texture.name = 'SpecularProbeAtlas';
		for ( let lod = 0; lod <= maxLod; lod ++ ) target.texture.mipmaps.push( { width: resolution >> lod, height: resolution >> lod } );

		const sourceTarget = new CubeRenderTarget( resolution, {
			type: HalfFloatType,
			depthBuffer: false,
			generateMipmaps: true,
			minFilter: LinearMipmapLinearFilter
		} );
		const camera = new CubeCamera( 0.1, 10, sourceTarget );
		const scene = new Scene();
		const generator = new ProbePMREMGenerator( renderer );
		const region = new Box3();
		const destination = new Vector3();
		const previousTarget = renderer.getRenderTarget();
		const previousFace = renderer.getActiveCubeFace();
		const previousMip = renderer.getActiveMipmapLevel();
		const xrEnabled = renderer.xr.enabled;
		const mrt = renderer.getMRT();
		const autoClear = renderer.autoClear;
		const autoClearColor = renderer.autoClearColor;
		const autoClearDepth = renderer.autoClearDepth;
		const autoClearStencil = renderer.autoClearStencil;
		let filteredTarget = null;
		let completed = false;

		try {

			renderer.setMRT( null );
			renderer.autoClear = renderer.autoClearColor = renderer.autoClearDepth = renderer.autoClearStencil = true;
			renderer.initRenderTarget( target );

			for ( let index = 0; index < sources.length; index ++ ) {

				const source = sources[ index ];
				if ( source === null ) continue;

				// Resample both cube and equirectangular inputs to the selected size.
				scene.backgroundNode = source.isCubeTexture === true
					? cubeTexture( source, positionWorldDirection ).level( 0 )
					: texture( source, equirectUV( positionWorldDirection ) ).level( 0 );
				camera.update( renderer, scene );
				filteredTarget = generator.fromCubemap( sourceTarget.texture );
				const filteredTexture = filteredTarget.texture;

				for ( let lod = 0; lod <= maxLod; lod ++ ) {

					const size = resolution >> lod;
					region.min.set( 0, 0, 0 );
					region.max.set( size, size, 6 );
					destination.set( 0, 0, index * 6 );
					renderer.copyTextureToTexture( filteredTexture, target.texture, region, destination, lod, lod );

				}

				if ( filteredTarget !== null ) {

					filteredTarget.dispose();
					filteredTarget = null;

				}

			}

			completed = true;

		} finally {

			renderer.setRenderTarget( previousTarget, previousFace, previousMip );
			renderer.xr.enabled = xrEnabled;
			renderer.setMRT( mrt );
			renderer.autoClear = autoClear;
			renderer.autoClearColor = autoClearColor;
			renderer.autoClearDepth = autoClearDepth;
			renderer.autoClearStencil = autoClearStencil;
			if ( filteredTarget !== null ) filteredTarget.dispose();
			if ( generator !== null ) generator.dispose();
			sourceTarget.dispose();
			if ( completed === false ) target.dispose();

		}

		if ( this._target !== null ) this._target.dispose();
		this._target = target;
		this.texture = target.texture;
		this.maxLod = maxLod;
		this.resolution = resolution;
		this.count = sources.length;
		return this;

	}

	/** Cube index is distinct from the underlying six face-layer indices. */
	sample( directionNode, indexNode, lodNode ) {

		return cubeTexture( this.texture, directionNode ).depth( indexNode ).level( lodNode );

	}

	dispose() {

		if ( this._target !== null ) this._target.dispose();
		this._target = null;
		this.texture = null;

	}

}

export { SpecularProbeAtlas };
