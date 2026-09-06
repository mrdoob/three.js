import {
	Box3,
	CubeCamera,
	CubeRenderTarget,
	FloatType,
	HalfFloatType,
	Light,
	LinearFilter,
	NearestFilter,
	NodeMaterial,
	QuadMesh,
	RenderTarget,
	RenderTarget3D,
	RGBAFormat,
	Vector3
} from 'three/webgpu';

import {
	array,
	cubeTexture,
	float,
	Fn,
	int,
	ivec2,
	Loop,
	screenCoordinate,
	texture,
	uniform,
	vec3,
	vec4
} from 'three/tsl';

import { LightProbeGridNode, ATLAS_PADDING } from '../tsl/lighting/LightProbeGridNode.js';

// Shared fullscreen-quad for the bake passes.
const _quad = /*@__PURE__*/ new QuadMesh();

// Reusable temp objects.
const _position = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();

// Bake materials, shared across grids so the shaders compile once, not per bake.
let _shMaterial = null;
let _shSampleCount = - 1;
let _cubeNode = null;
let _batchNode = null;
let _resolutionUniform = null;
let _sliceZUniform = null;
let _repackMaterials = null;

// Bake render targets, pooled by size so rebakes don't churn allocations.
let _cubeRenderTarget = null;
let _cubeCamera = null;
let _cubeKey = '';
let _batchTarget = null;

// Golden-angle increment for the equal-area Fibonacci sphere.
const GOLDEN_ANGLE = Math.PI * ( 3.0 - Math.sqrt( 5.0 ) );

/**
 * Returns the output node for the spherical-harmonic projection pass. Each
 * fragment of the 9-wide batch row computes a single SH coefficient by
 * integrating the captured cubemap over an equal-area Fibonacci sphere,
 * selecting the basis function for its column. Sampling the cubemap by world
 * direction keeps the projection independent of the cube face layout.
 *
 * @private
 * @param {Node} cube - The captured environment cubemap texture node.
 * @param {number} sampleCount - Number of directions to integrate.
 * @return {Node<vec4>} The projected coefficient.
 */
function projectSHNode( cube, sampleCount ) {

	return Fn( () => {

		const coefIndex = int( screenCoordinate.x ).toVar();
		const accum = vec3( 0.0 ).toVar();

		Loop( sampleCount, ( { i } ) => {

			const fi = float( i );

			// Equal-area Fibonacci sphere direction.
			const z = float( 1.0 ).sub( fi.mul( 2.0 ).add( 1.0 ).div( sampleCount ) );
			const r = z.mul( z ).oneMinus().max( 0.0 ).sqrt();
			const phi = fi.mul( GOLDEN_ANGLE );
			const dir = vec3( r.mul( phi.cos() ), z, r.mul( phi.sin() ) ).toVar();

			const radiance = cube.sample( dir ).level( 0 ).rgb;

			// The L2 SH basis function for this fragment's coefficient.
			const x = dir.x, y = dir.y, zc = dir.z;
			const basis = array( [
				float( 0.282095 ),
				y.mul( 0.488603 ),
				zc.mul( 0.488603 ),
				x.mul( 0.488603 ),
				x.mul( y ).mul( 1.092548 ),
				y.mul( zc ).mul( 1.092548 ),
				zc.mul( zc ).mul( 3.0 ).sub( 1.0 ).mul( 0.315392 ),
				x.mul( zc ).mul( 1.092548 ),
				x.mul( x ).sub( y.mul( y ) ).mul( 0.546274 )
			] ).element( coefIndex );

			accum.addAssign( radiance.mul( basis ) );

		} );

		// Equal-area quadrature: each direction covers 4*PI / sampleCount.
		const norm = float( 4.0 * Math.PI / sampleCount );

		return vec4( accum.mul( norm ), 1.0 );

	} )();

}

/**
 * Returns the repack output node for one of the seven SH textures. It reads the
 * 9 projected coefficients from the batch texture for the probe at the current
 * texel and packs the four floats stored by this texture index.
 *
 * @private
 * @param {Node} batch - The batch texture node holding projected coefficients.
 * @param {number} textureIndex - The output texture index (0–6).
 * @param {Node<vec3>} resolution - The probe grid resolution uniform.
 * @param {Node<int>} sliceZ - The current Z slice being written.
 * @return {Node<vec4>} The packed texel.
 */
function repackNode( batch, textureIndex, resolution, sliceZ ) {

	return Fn( () => {

		const ix = int( screenCoordinate.x );
		const iy = int( screenCoordinate.y );

		const nx = int( resolution.x );
		const ny = int( resolution.y );
		const probeIndex = ix.add( iy.mul( nx ) ).add( sliceZ.mul( nx ).mul( ny ) );

		const c0 = batch.load( ivec2( 0, probeIndex ) );
		const c1 = batch.load( ivec2( 1, probeIndex ) );
		const c2 = batch.load( ivec2( 2, probeIndex ) );
		const c3 = batch.load( ivec2( 3, probeIndex ) );
		const c4 = batch.load( ivec2( 4, probeIndex ) );
		const c5 = batch.load( ivec2( 5, probeIndex ) );
		const c6 = batch.load( ivec2( 6, probeIndex ) );
		const c7 = batch.load( ivec2( 7, probeIndex ) );
		const c8 = batch.load( ivec2( 8, probeIndex ) );

		let packed;

		switch ( textureIndex ) {

			case 0: packed = vec4( c0.xyz, c1.x ); break;
			case 1: packed = vec4( c1.yz, c2.xy ); break;
			case 2: packed = vec4( c2.z, c3.xyz ); break;
			case 3: packed = vec4( c4.xyz, c5.x ); break;
			case 4: packed = vec4( c5.yz, c6.xy ); break;
			case 5: packed = vec4( c6.z, c7.xyz ); break;
			default: packed = vec4( c8.xyz, 0.0 ); break;

		}

		return packed;

	} )();

}

/**
 * Lazily pools the shared cube render target.
 *
 * @private
 * @param {number} cubemapSize - Resolution of each cubemap face.
 * @param {number} near - Cube camera near plane.
 * @param {number} far - Cube camera far plane.
 */
function ensureCubeTarget( cubemapSize, near, far ) {

	const cubeKey = `${ cubemapSize },${ near },${ far }`;

	if ( _cubeRenderTarget === null || _cubeKey !== cubeKey ) {

		if ( _cubeRenderTarget !== null ) _cubeRenderTarget.dispose();

		_cubeRenderTarget = new CubeRenderTarget( cubemapSize, { type: HalfFloatType, generateMipmaps: false } );
		_cubeCamera = new CubeCamera( near, far, _cubeRenderTarget );
		_cubeKey = cubeKey;

	}

}

/**
 * Reserves a batch target until an iterator finishes or is closed. Other grids
 * can bake between its steps without overwriting the captured probe rows.
 *
 * @private
 * @param {number} totalProbes - Number of probes (batch target height).
 * @return {RenderTarget} The reserved target.
 */
function acquireBatchTarget( totalProbes ) {

	let target = _batchTarget;
	_batchTarget = null;

	if ( target === null || target.height !== totalProbes ) {

		if ( target !== null ) target.dispose();

		target = new RenderTarget( 9, totalProbes, {
			type: FloatType,
			format: RGBAFormat,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

	}

	return target;

}

/**
 * Lazily builds the shared bake materials and rebinds them to the current
 * cube/batch textures. The SH projection material is rebuilt only when the
 * sample count changes; the repack materials are static.
 *
 * @private
 * @param {number} sampleCount - Number of directions integrated by the projection.
 * @param {CubeTexture} cubeMap - The current cube render target texture.
 * @param {Texture} batchMap - The current batch render target texture.
 */
function ensureBakeMaterials( sampleCount, cubeMap, batchMap ) {

	if ( _repackMaterials === null ) {

		_cubeNode = cubeTexture( cubeMap );
		_batchNode = texture( batchMap );
		_resolutionUniform = uniform( new Vector3() );
		_sliceZUniform = uniform( 0, 'int' );
		_repackMaterials = [];

		for ( let t = 0; t < 7; t ++ ) {

			const material = new NodeMaterial();
			material.outputNode = repackNode( _batchNode, t, _resolutionUniform, _sliceZUniform );
			material.depthTest = false;
			material.depthWrite = false;
			_repackMaterials.push( material );

		}

	} else {

		_cubeNode.value = cubeMap;
		_batchNode.value = batchMap;

	}

	if ( _shMaterial === null || _shSampleCount !== sampleCount ) {

		if ( _shMaterial !== null ) _shMaterial.dispose();

		_shMaterial = new NodeMaterial();
		_shMaterial.outputNode = projectSHNode( _cubeNode, sampleCount );
		_shMaterial.depthTest = false;
		_shMaterial.depthWrite = false;
		_shSampleCount = sampleCount;

	}

}

/**
 * A 3D grid of L2 Spherical Harmonic irradiance probes that provides
 * position-dependent diffuse global illumination.
 *
 * This is the {@link WebGPURenderer} version of `LightProbeGrid`. The grid is a
 * {@link Light}, so adding it to the scene applies its baked irradiance to every
 * lit node material automatically. When using {@link WebGLRenderer}, import the
 * grid from `LightProbeGridWebGL.js` instead.
 *
 * The baked data is stored in a single RGBA `RenderTarget3D` atlas that packs
 * the nine L2 SH coefficients into seven sub-volumes stacked along Z. Baking is
 * fully GPU-resident: cubemap rendering, SH projection, and texture packing all
 * happen on the GPU with zero CPU readback.
 *
 * @augments Light
 * @three_import import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';
 */
class LightProbeGrid extends Light {

	/**
	 * Constructs a new irradiance probe grid.
	 *
	 * The volume is centered at the object's position.
	 *
	 * @param {number} [width=1] - Full width of the volume along X.
	 * @param {number} [height=1] - Full height of the volume along Y.
	 * @param {number} [depth=1] - Full depth of the volume along Z.
	 * @param {number} [widthProbes] - Number of probes along X. Defaults to `Math.max( 2, Math.round( width ) + 1 )`.
	 * @param {number} [heightProbes] - Number of probes along Y. Defaults to `Math.max( 2, Math.round( height ) + 1 )`.
	 * @param {number} [depthProbes] - Number of probes along Z. Defaults to `Math.max( 2, Math.round( depth ) + 1 )`.
	 */
	constructor( width = 1, height = 1, depth = 1, widthProbes, heightProbes, depthProbes ) {

		super( 0xffffff, 1 );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightProbeGrid = true;

		this.type = 'LightProbeGrid';

		/**
		 * The full width of the volume along X.
		 *
		 * @type {number}
		 */
		this.width = width;

		/**
		 * The full height of the volume along Y.
		 *
		 * @type {number}
		 */
		this.height = height;

		/**
		 * The full depth of the volume along Z.
		 *
		 * @type {number}
		 */
		this.depth = depth;

		/**
		 * The number of probes along each axis.
		 *
		 * @type {Vector3}
		 */
		this.resolution = new Vector3(
			widthProbes !== undefined ? widthProbes : Math.max( 2, Math.round( width ) + 1 ),
			heightProbes !== undefined ? heightProbes : Math.max( 2, Math.round( height ) + 1 ),
			depthProbes !== undefined ? depthProbes : Math.max( 2, Math.round( depth ) + 1 )
		);

		/**
		 * The world-space bounding box for the grid. Updated automatically
		 * by {@link LightProbeGrid#bake}.
		 *
		 * @type {Box3}
		 */
		this.boundingBox = new Box3();

		/**
		 * Distance in world units over which the grid contribution fades out
		 * past the volume boundary. `0` applies the contribution everywhere
		 * (clamped), which matches a single-volume setup. Use a small positive
		 * value to blend multiple overlapping grids.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.falloff = 0;

		/**
		 * The single RGBA atlas 3D texture storing all seven packed SH
		 * sub-volumes stacked along Z.
		 *
		 * @type {?Data3DTexture}
		 * @default null
		 */
		this.texture = null;

		/**
		 * Internal render target for GPU-resident baking.
		 *
		 * @private
		 * @type {?RenderTarget3D}
		 * @default null
		 */
		this._renderTarget = null;
		this._baking = false;
		this._bakeIntensity = 1;

		this.updateBoundingBox();

	}

	/**
	 * Returns the world-space position of the probe at grid indices (ix, iy, iz).
	 *
	 * @param {number} ix - X index.
	 * @param {number} iy - Y index.
	 * @param {number} iz - Z index.
	 * @param {Vector3} target - The target vector.
	 * @return {Vector3} The world-space position.
	 */
	getProbePosition( ix, iy, iz, target ) {

		const pos = this.position;
		const res = this.resolution;
		const w = this.width, h = this.height, d = this.depth;

		target.set(
			res.x > 1 ? pos.x - w / 2 + ix * w / ( res.x - 1 ) : pos.x,
			res.y > 1 ? pos.y - h / 2 + iy * h / ( res.y - 1 ) : pos.y,
			res.z > 1 ? pos.z - d / 2 + iz * d / ( res.z - 1 ) : pos.z
		);

		return target;

	}

	/**
	 * Updates the world-space bounding box from the current position and size.
	 */
	updateBoundingBox() {

		_size.set( this.width, this.height, this.depth );
		this.boundingBox.setFromCenterAndSize( this.position, _size );

	}

	/**
	 * Bakes all probes by rendering cubemaps at each probe position and
	 * projecting to L2 SH. Optionally iterates additional passes to capture
	 * indirect bounces: each extra pass samples the previous pass's data as
	 * indirect light, so a grid added to the scene before baking accumulates
	 * one bounce per extra pass.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 * @param {Object} [options] - Bake options.
	 * @param {number} [options.cubemapSize=8] - Resolution of each cubemap face.
	 * @param {number} [options.near=0.1] - Near plane for the cube camera.
	 * @param {number} [options.far=100] - Far plane for the cube camera.
	 * @param {number} [options.bounces=0] - Additional bounce passes after the initial direct pass.
	 * @param {number} [options.sampleCount=512] - Directions integrated when projecting each cubemap to SH.
	 */
	bake( renderer, scene, options = {} ) {

		const steps = this.bakeSteps( renderer, scene, { ...options, probesPerStep: Infinity } );

		while ( steps.next().done === false ) {

			// Complete every step synchronously.

		}

		this.visible = true;

	}

	/**
	 * Bakes a limited number of probes each time the returned iterator advances.
	 * Renderer and scene state are restored before each yield, allowing normal
	 * rendering between steps. The atlas is updated after each complete bounce
	 * pass. Keep the captured scene static until completion, or close the iterator
	 * with `return()` before restarting after a scene change. Only one iterator
	 * per grid can be active at a time.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 * @param {Object} [options] - The options accepted by {@link LightProbeGrid#bake}.
	 * @param {number} [options.probesPerStep=8] - Maximum probes captured per step.
	 * @yields {number} The fraction of probes completed across all passes.
	 * @return {Generator<number>} The bake iterator.
	 */
	* bakeSteps( renderer, scene, options = {} ) {

		if ( renderer.isWebGPURenderer !== true ) {

			throw new Error( 'THREE.LightProbeGrid: Baking requires a WebGPURenderer. For WebGLRenderer, use LightProbeGridWebGL.' );

		}

		if ( renderer.initialized === false ) {

			throw new Error( 'THREE.LightProbeGrid: Initialize the renderer with "await renderer.init();" before baking.' );

		}

		if ( this._baking ) throw new Error( 'THREE.LightProbeGrid: Close the active bake iterator before starting another bake.' );

		const { bounces = 0, probesPerStep = 8 } = options;

		if ( probesPerStep < 1 || ( probesPerStep !== Infinity && Number.isInteger( probesPerStep ) === false ) ) {

			throw new Error( 'THREE.LightProbeGrid: probesPerStep must be a positive integer.' );

		}

		if ( renderer.library.getLightNodeClass( LightProbeGrid ) === null ) {

			renderer.library.addLight( LightProbeGridNode, LightProbeGrid );

		}

		this._ensureTextures();
		this.updateBoundingBox();

		const totalProbes = this.resolution.x * this.resolution.y * this.resolution.z;
		const batchTarget = acquireBatchTarget( totalProbes );
		this._baking = true;

		try {

			for ( let pass = 0; pass <= bounces; pass ++ ) {

				for ( let start = 0; start < totalProbes; start += probesPerStep ) {

					const end = Math.min( start + probesPerStep, totalProbes );
					this._bakeStep( renderer, scene, options, batchTarget, pass, start, end );

					if ( pass < bounces || end < totalProbes ) yield ( pass * totalProbes + end ) / ( ( bounces + 1 ) * totalProbes );

				}

			}

		} finally {

			// Keep one idle batch target. Active iterators retain their own targets.
			if ( _batchTarget !== null ) _batchTarget.dispose();
			_batchTarget = batchTarget;
			this._baking = false;

		}

	}

	/**
	 * Captures one step and restores all temporary state before returning.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The captured scene.
	 * @param {Object} options - Bake options.
	 * @param {RenderTarget} batchTarget - This bake's projected coefficients.
	 * @param {number} pass - The current bounce pass.
	 * @param {number} start - First probe to capture.
	 * @param {number} end - Exclusive last probe to capture.
	 */
	_bakeStep( renderer, scene, options, batchTarget, pass, start, end ) {

		const { cubemapSize = 8, near = 0.1, far = 100, sampleCount = 512 } = options;
		const res = this.resolution;
		const nz = res.z;
		const paddedSlices = nz + 2 * ATLAS_PADDING;

		// Other grids may have used the shared cube and materials between steps.
		ensureCubeTarget( cubemapSize, near, far );
		ensureBakeMaterials( sampleCount, _cubeRenderTarget.texture, batchTarget.texture );
		_resolutionUniform.value.copy( res );

		const currentRenderTarget = renderer.getRenderTarget();
		const currentCubeFace = renderer.getActiveCubeFace();
		const currentMipmapLevel = renderer.getActiveMipmapLevel();
		const currentAutoClear = renderer.autoClear;
		const currentXrEnabled = renderer.xr.enabled;
		const currentInspectorEnabled = renderer.inspector.enabled;
		const currentMatrixWorldAutoUpdate = scene.matrixWorldAutoUpdate;
		const currentVisible = this.visible;
		const currentBakeIntensity = this._bakeIntensity;
		const shadowLights = [];

		try {

			renderer.inspector.enabled = false;

			if ( currentMatrixWorldAutoUpdate === true ) {

				scene.updateMatrixWorld( true );
				scene.matrixWorldAutoUpdate = false;

			}

			// Refresh once per step: normal rendering may use different casters.
			scene.traverse( ( object ) => {

				if ( object.isLight && object.castShadow && object.shadow ) {

					shadowLights.push( { light: object, autoUpdate: object.shadow.autoUpdate } );
					object.shadow.autoUpdate = false;
					object.shadow.needsUpdate = true;

				}

			} );

			// Keep the light layout stable so changing passes does not rebuild shaders.
			this.visible = true;
			this._bakeIntensity = pass > 0 ? 1 : 0;
			_quad.material = _shMaterial;

			for ( let probeIndex = start; probeIndex < end; probeIndex ++ ) {

				const ix = probeIndex % res.x;
				const iy = Math.floor( probeIndex / res.x ) % res.y;
				const iz = Math.floor( probeIndex / ( res.x * res.y ) );

				this.getProbePosition( ix, iy, iz, _position );
				_cubeCamera.position.copy( _position );

				renderer.autoClear = true;
				_cubeCamera.update( renderer, scene );

				// Every row is overwritten once per pass; preserve the other rows.
				renderer.autoClear = false;
				batchTarget.viewport.set( 0, probeIndex, 9, 1 );
				renderer.setRenderTarget( batchTarget );
				_quad.render( renderer );

			}

			if ( end === res.x * res.y * res.z ) {

				// Publish only complete passes, with duplicated edge slices for padding.
				renderer.autoClear = true;

				for ( let t = 0; t < 7; t ++ ) {

					_quad.material = _repackMaterials[ t ];
					const base = t * paddedSlices;

					for ( let iz = 0; iz < paddedSlices; iz ++ ) {

						_sliceZUniform.value = Math.max( 0, Math.min( iz - ATLAS_PADDING, nz - 1 ) );
						renderer.setRenderTarget( this._renderTarget, base + iz );
						_quad.render( renderer );

					}

				}

			}

		} finally {

			renderer.setRenderTarget( currentRenderTarget, currentCubeFace, currentMipmapLevel );
			renderer.autoClear = currentAutoClear;
			renderer.xr.enabled = currentXrEnabled;
			renderer.inspector.enabled = currentInspectorEnabled;
			scene.matrixWorldAutoUpdate = currentMatrixWorldAutoUpdate;
			this.visible = currentVisible;
			this._bakeIntensity = currentBakeIntensity;

			for ( const { light, autoUpdate } of shadowLights ) {

				light.shadow.autoUpdate = autoUpdate;
				light.shadow.needsUpdate = true;

			}

		}

	}

	/**
	 * Ensures the atlas 3D texture exists with the correct dimensions.
	 *
	 * @private
	 */
	_ensureTextures() {

		if ( this._renderTarget !== null ) return;

		const res = this.resolution;
		const nx = res.x, ny = res.y, nz = res.z;

		// Atlas depth: 7 sub-volumes, each with ATLAS_PADDING slices at both ends.
		const atlasDepth = 7 * ( nz + 2 * ATLAS_PADDING );

		this._renderTarget = new RenderTarget3D( nx, ny, atlasDepth, {
			type: HalfFloatType,
			format: RGBAFormat,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			depthBuffer: false
		} );

		this.texture = this._renderTarget.texture;

	}

	/**
	 * Frees GPU resources.
	 */
	dispose() {

		if ( this._renderTarget !== null ) {

			this._renderTarget.dispose();
			this._renderTarget = null;
			this.texture = null;

		}

		super.dispose();

	}

}

export { LightProbeGrid };
