import {
	Box3,
	CubeCamera,
	CubeRenderTarget,
	FloatType,
	HalfFloatType,
	Light,
	LinearFilter,
	MathUtils,
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
import { replaceSunLights, restoreSunLights } from './LightProbeGridUtils.js';

// Shared fullscreen-quad for the bake passes.
const _quad = /*@__PURE__*/ new QuadMesh();

// Reusable temp objects.
const _position = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();
const _copyRegion = /*@__PURE__*/ new Box3();

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
let _batchProbes = - 1;

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
 * Lazily pools the shared cube and batch render targets, recreating them only
 * when their dimensions change.
 *
 * @private
 * @param {number} cubemapSize - Resolution of each cubemap face.
 * @param {number} near - Cube camera near plane.
 * @param {number} far - Cube camera far plane.
 * @param {number} totalProbes - Number of probes (batch target height).
 */
function ensureBakeTargets( cubemapSize, near, far, totalProbes ) {

	const cubeKey = `${ cubemapSize },${ near },${ far }`;

	if ( _cubeRenderTarget === null || _cubeKey !== cubeKey ) {

		if ( _cubeRenderTarget !== null ) _cubeRenderTarget.dispose();

		_cubeRenderTarget = new CubeRenderTarget( cubemapSize, { type: HalfFloatType, generateMipmaps: false } );
		_cubeCamera = new CubeCamera( near, far, _cubeRenderTarget );
		_cubeKey = cubeKey;

	}

	if ( _batchTarget === null || _batchProbes !== totalProbes ) {

		if ( _batchTarget !== null ) _batchTarget.dispose();

		_batchTarget = new RenderTarget( 9, totalProbes, {
			type: FloatType,
			format: RGBAFormat,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

		_batchProbes = totalProbes;

	}

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

		// Indirect captures read a snapshot while the live atlas is updated in place.
		this._bounceGrid = null;
		this._bouncePass = - 1;

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
	 * Bakes probes by rendering cubemaps at each probe position and
	 * projecting to L2 SH. Optionally iterates additional passes to capture
	 * indirect bounces: each extra pass samples the previous pass's data as
	 * indirect light, accumulating one bounce per extra pass.
	 *
	 * Use `start` and `count` to bake a range and publish its cells immediately.
	 * Indices advance along X, then Z, then Y, filling horizontal layers from bottom
	 * to top. For incremental indirect bounces, finish the whole grid for `pass: 0`,
	 * then repeat with `pass: 1`, etc. Start each pass at index 0 to snapshot the
	 * previous pass before updating its cells.
	 *
	 * Shadow-casting instances of `SunLight` are temporarily replaced with
	 * equivalent directional lights, since their view-fitted shadow cascades
	 * cannot be frozen across probe renders.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 * @param {Object} [options] - Bake options.
	 * @param {number} [options.cubemapSize=8] - Resolution of each cubemap face.
	 * @param {number} [options.near=0.1] - Near plane for the cube camera.
	 * @param {number} [options.far=100] - Far plane for the cube camera.
	 * @param {number} [options.bounces=0] - Additional bounce passes. Only available when baking the whole grid.
	 * @param {number} [options.sampleCount=512] - Directions integrated when projecting each cubemap to SH.
	 * @param {number} [options.start=0] - Index of the first probe to bake.
	 * @param {number} [options.count] - Number of probes to bake. Defaults to the remaining probes.
	 * @param {number} [options.pass=0] - Starting pass. Zero captures direct light; later passes sample the previous pass. Ranged calls require `bounces: 0`.
	 */
	bake( renderer, scene, options = {} ) {

		// The bake is node based, so it needs a WebGPURenderer.
		if ( renderer.isWebGPURenderer !== true ) {

			throw new Error( 'THREE.LightProbeGrid: .bake() requires a WebGPURenderer. For WebGLRenderer, use LightProbeGridWebGL.' );

		}

		// The bake issues GPU work immediately, so the renderer must be ready.
		if ( renderer.initialized === false ) {

			throw new Error( 'THREE.LightProbeGrid: .bake() called before the renderer is initialized. Use "await renderer.init();" first.' );

		}

		// Register the light node with this renderer (idempotent).
		if ( renderer.library.getLightNodeClass( LightProbeGrid ) === null ) {

			renderer.library.addLight( LightProbeGridNode, LightProbeGrid );

		}

		const res = this.resolution;
		const totalProbes = res.x * res.y * res.z;
		const {
			cubemapSize = 8,
			near = 0.1,
			far = 100,
			bounces = 0,
			sampleCount = 512,
			start = 0,
			count = totalProbes - start,
			pass: firstPass = 0
		} = options;
		const end = start + count;

		if ( ! Number.isInteger( start ) || ! Number.isInteger( count ) || start < 0 || count < 0 || end > totalProbes ) {

			throw new RangeError( 'THREE.LightProbeGrid: Invalid probe range.' );

		}

		if ( ! Number.isInteger( firstPass ) || firstPass < 0 || ! Number.isInteger( bounces ) || bounces < 0 ) {

			throw new RangeError( 'THREE.LightProbeGrid: Pass and bounce counts must be non-negative integers.' );

		}

		if ( bounces > 0 && count !== totalProbes ) {

			throw new RangeError( 'THREE.LightProbeGrid: For ranged baking, use pass instead of bounces.' );

		}

		if ( count === 0 ) return;

		if ( firstPass > 0 && start > 0 && this._bouncePass !== firstPass ) {

			throw new Error( 'THREE.LightProbeGrid: Start each indirect pass at probe 0.' );

		}

		this._ensureTextures();
		this.updateBoundingBox();

		// Bind the pooled bake resources to the current textures.

		ensureBakeTargets( cubemapSize, near, far, totalProbes );
		ensureBakeMaterials( sampleCount, _cubeRenderTarget.texture, _batchTarget.texture );
		_resolutionUniform.value.copy( res );

		// Save renderer / scene state to restore after the bake.

		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
		const currentAutoClear = renderer.autoClear;
		const currentXrEnabled = renderer.xr.enabled;
		const currentInspectorEnabled = renderer.inspector.enabled;
		const currentMatrixWorldAutoUpdate = scene.matrixWorldAutoUpdate;
		const currentVisible = this.visible;
		const renderTarget = this._renderTarget;
		const currentViewport = renderTarget.viewport.clone();
		const shadowStates = [];
		let replacedSunLights = null;

		try {

			renderer.inspector.enabled = false;
			this.visible = false;

			// Scene is static during the bake: update once, disable auto-update.

			if ( currentMatrixWorldAutoUpdate === true ) {

				scene.updateMatrixWorld( true );
				scene.matrixWorldAutoUpdate = false;

			}

			replacedSunLights = replaceSunLights( scene );

			// Render each shadow map once, not once per cube face.

			scene.traverse( ( object ) => {

				if ( object.isLight && object.castShadow && object.shadow ) {

					const shadow = object.shadow;
					shadowStates.push( { shadow, autoUpdate: shadow.autoUpdate } );
					shadow.autoUpdate = false;
					shadow.needsUpdate = true;

				}

			} );

			for ( let pass = firstPass; pass <= firstPass + bounces; pass ++ ) {

				this._updateBounceGrid( renderer, scene, pass, start );
				this._captureProbes( renderer, scene, start, end );
				this._repackProbes( renderer, start, end );

			}

		} finally {

			// Restore renderer / scene state (pooled targets and materials kept).

			renderTarget.viewport.copy( currentViewport );
			renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
			renderer.autoClear = currentAutoClear;
			renderer.xr.enabled = currentXrEnabled;
			scene.matrixWorldAutoUpdate = currentMatrixWorldAutoUpdate;

			for ( const { shadow, autoUpdate } of shadowStates ) shadow.autoUpdate = autoUpdate;

			if ( replacedSunLights !== null ) restoreSunLights( scene, replacedSunLights );

			this.visible = currentVisible;
			if ( this._bounceGrid !== null ) this._bounceGrid.removeFromParent();

			renderer.inspector.enabled = currentInspectorEnabled;

		}

	}

	/**
	 * Snapshots each indirect pass before its first range overwrites the live atlas.
	 * A separate light keeps the capture and main-view texture bindings stable.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {number} pass - The bounce pass.
	 * @param {number} start - The first probe index.
	 */
	_updateBounceGrid( renderer, scene, pass, start ) {

		if ( pass === 0 ) {

			if ( start === 0 ) this._bouncePass = - 1;
			return;

		}

		if ( start === 0 ) {

			const renderTarget = this._renderTarget;

			if ( this._bounceGrid === null ) {

				const res = this.resolution;
				this._bounceGrid = new LightProbeGrid( this.width, this.height, this.depth, res.x, res.y, res.z );
				this._bounceGrid._ensureTextures();

			}

			renderer.initRenderTarget( renderTarget );
			renderer.initRenderTarget( this._bounceGrid._renderTarget );
			_copyRegion.min.set( 0, 0, 0 );
			_copyRegion.max.set( renderTarget.width, renderTarget.height, renderTarget.depth );
			renderer.copyTextureToTexture( renderTarget.texture, this._bounceGrid.texture, _copyRegion );
			this._bouncePass = pass;

		}

		const bounceGrid = this._bounceGrid;
		bounceGrid.boundingBox.copy( this.boundingBox );
		bounceGrid.intensity = this.intensity;
		bounceGrid.falloff = this.falloff;
		scene.add( bounceGrid );

	}

	/**
	 * Captures cubemaps and projects their SH coefficients into the batch target.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {number} start - The first probe index.
	 * @param {number} end - The exclusive end probe index.
	 */
	_captureProbes( renderer, scene, start, end ) {

		const { x: nx, y: ny, z: nz } = this.resolution;
		const probesPerLayer = nx * nz;

		_quad.material = _shMaterial;

		for ( let probeIndex = start; probeIndex < end; probeIndex ++ ) {

			const ix = probeIndex % nx;
			const iy = Math.floor( probeIndex / probesPerLayer );
			const iz = Math.floor( probeIndex / nx ) % nz;

			this.getProbePosition( ix, iy, iz, _position );
			_cubeCamera.position.copy( _position );

			// The cube faces must be cleared per face.
			renderer.autoClear = true;
			_cubeCamera.update( renderer, scene );

			// Keep batch rows in texture order (X, Y, Z).
			const batchRow = ix + iy * nx + iz * nx * ny;

			renderer.autoClear = false;
			_batchTarget.viewport.set( 0, batchRow, 9, 1 );
			renderer.setRenderTarget( _batchTarget );
			_quad.render( renderer );

		}

	}

	/**
	 * Packs a probe range into the live atlas, including its boundary padding.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {number} start - The first probe index.
	 * @param {number} end - The exclusive end probe index.
	 */
	_repackProbes( renderer, start, end ) {

		const { x: nx, y: ny, z: nz } = this.resolution;
		const probesPerLayer = nx * nz;
		const startY = Math.floor( start / probesPerLayer );
		const endY = Math.floor( end / probesPerLayer );
		const paddedSlices = nz + 2 * ATLAS_PADDING;
		const renderTarget = this._renderTarget;

		// Map the horizontal bake range to contiguous rows in each Z slice.
		for ( let iz = 0; iz < nz; iz ++ ) {

			const sliceStart = startY * nx + MathUtils.clamp( start % probesPerLayer - iz * nx, 0, nx );
			const sliceEnd = endY * nx + MathUtils.clamp( end % probesPerLayer - iz * nx, 0, nx );

			for ( let probeIndex = sliceStart; probeIndex < sliceEnd; ) {

				const ix = probeIndex % nx;
				const iy = Math.floor( probeIndex / nx );

				// Coalesce complete rows within a slice into one rectangle.
				const width = Math.min( nx - ix, sliceEnd - probeIndex );
				let height = 1;

				if ( width === nx ) {

					height = Math.min( ny - iy, Math.floor( ( sliceEnd - probeIndex ) / nx ) );

				}

				renderTarget.viewport.set( ix, iy, width, height );
				_sliceZUniform.value = iz;

				for ( let t = 0; t < 7; t ++ ) {

					_quad.material = _repackMaterials[ t ];
					const base = t * paddedSlices;

					renderer.setRenderTarget( renderTarget, base + ATLAS_PADDING + iz );
					_quad.render( renderer );

					if ( iz === 0 ) {

						renderer.setRenderTarget( renderTarget, base );
						_quad.render( renderer );

					}

					if ( iz === nz - 1 ) {

						renderer.setRenderTarget( renderTarget, base + ATLAS_PADDING + nz );
						_quad.render( renderer );

					}

				}

				probeIndex += width * height;

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

		if ( this._bounceGrid !== null ) {

			this._bounceGrid.dispose();
			this._bounceGrid = null;
			this._bouncePass = - 1;

		}

		if ( this._renderTarget !== null ) {

			this._renderTarget.dispose();
			this._renderTarget = null;
			this.texture = null;

		}

		super.dispose();

	}

}

export { LightProbeGrid };
