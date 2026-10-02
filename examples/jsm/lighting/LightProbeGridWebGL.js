import {
	Box3,
	CubeCamera,
	Data3DTexture,
	FloatType,
	HalfFloatType,
	LinearFilter,
	MathUtils,
	Mesh,
	NearestFilter,
	Object3D,
	OrthographicCamera,
	PlaneGeometry,
	RGBAFormat,
	Scene,
	ShaderMaterial,
	Vector3,
	WebGL3DRenderTarget,
	WebGLCubeRenderTarget,
	WebGLRenderTarget
} from 'three';

import { replaceSunLights, restoreSunLights } from './LightProbeGridUtils.js';

// Shared fullscreen-quad scene / camera
let _scene = null;
let _camera = null;
let _mesh = null;

// SH projection material (depends on cubemapSize)
let _shMaterial = null;
let _lastCubemapSize = 0;

// Repack materials (one per output sub-volume / texture index)
let _repackMaterials = null;

// Cached bake resources
let _cubeRenderTarget = null;
let _cubeCamera = null;
let _cachedCubemapSize = 0;
let _cachedNear = 0;
let _cachedFar = 0;

// Cached batch render target
let _batchTarget = null;
let _batchTargetProbes = 0;

// Reusable temp objects
const _position = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();
const _copyRegion = /*@__PURE__*/ new Box3();

// Direct-light captures use a black atlas without changing the light layout.
let _emptyAtlas = null;

// Number of padding texels added at each boundary of every sub-volume in the atlas.
const ATLAS_PADDING = 1;

/**
 * A 3D grid of L2 Spherical Harmonic irradiance probes that provides
 * position-dependent diffuse global illumination.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * For {@link WebGPURenderer}, use {@link LightProbeGrid}.
 *
 * All seven packed SH sub-volumes are stored in a **single** RGBA
 * `WebGL3DRenderTarget` using a texture-atlas layout along the Z axis.
 * Each sub-volume occupies `( nz + 2 )` atlas slices: one padding slice at
 * each end (a copy of the nearest edge data slice) to prevent color bleeding
 * when the hardware trilinear filter reads across a sub-volume boundary.
 *
 * Atlas layout (nz = resolution.z, PADDING = 1):
 * ```
 *   slice   0              : padding  (copy of sub-volume 0, data slice 0)
 *   slices  1 … nz         : sub-volume 0 data
 *   slice   nz + 1         : padding  (copy of sub-volume 0, data slice nz-1)
 *   slice   nz + 2         : padding  (copy of sub-volume 1, data slice 0)
 *   slices  nz+3 … 2*nz+2  : sub-volume 1 data
 *   …
 * ```
 * Total atlas depth = `7 * ( nz + 2 )`.
 *
 * Baking is fully GPU-resident: cubemap rendering, SH projection, and
 * texture packing all happen on the GPU with zero CPU readback.
 *
 * @three_import import { LightProbeGridWebGL } from 'three/addons/lighting/LightProbeGridWebGL.js';
 */
class LightProbeGridWebGL extends Object3D {

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

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightProbeGrid = true;

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
		 * by {@link LightProbeGridWebGL#bake}.
		 *
		 * @type {Box3}
		 */
		this.boundingBox = new Box3();

		/**
		 * The single RGBA atlas 3D texture storing all seven packed SH sub-volumes.
		 *
		 * @type {?Data3DTexture}
		 * @default null
		 */
		this.texture = null;

		/**
		 * Internal render target for GPU-resident baking.
		 *
		 * @private
		 * @type {?WebGL3DRenderTarget}
		 * @default null
		 */
		this._renderTarget = null;

		// Indirect captures read a snapshot while the live atlas is updated in place.
		this._bounceTarget = null;
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
	 * indirect light, so a grid added to the scene before baking accumulates
	 * one bounce per extra pass.
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
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 * @param {Object} [options] - Bake options.
	 * @param {number} [options.cubemapSize=8] - Resolution of each cubemap face.
	 * @param {number} [options.near=0.1] - Near plane for the cube camera.
	 * @param {number} [options.far=100] - Far plane for the cube camera.
	 * @param {number} [options.bounces=0] - Additional bounce passes. Only available when baking the whole grid.
	 * @param {number} [options.start=0] - Index of the first probe to bake.
	 * @param {number} [options.count] - Number of probes to bake. Defaults to the remaining probes.
	 * @param {number} [options.pass=0] - Starting pass. Zero captures direct light; later passes sample the previous pass. Ranged calls require `bounces: 0`.
	 */
	bake( renderer, scene, options = {} ) {

		const res = this.resolution;
		const totalProbes = res.x * res.y * res.z;
		const {
			bounces = 0,
			start = 0,
			count = totalProbes - start,
			pass: firstPass = 0
		} = options;
		const end = start + count;

		if ( ! Number.isInteger( start ) || ! Number.isInteger( count ) || start < 0 || count < 0 || end > totalProbes ) {

			throw new RangeError( 'THREE.LightProbeGridWebGL: Invalid probe range.' );

		}

		if ( ! Number.isInteger( firstPass ) || firstPass < 0 || ! Number.isInteger( bounces ) || bounces < 0 ) {

			throw new RangeError( 'THREE.LightProbeGridWebGL: Pass and bounce counts must be non-negative integers.' );

		}

		if ( bounces > 0 && count !== totalProbes ) {

			throw new RangeError( 'THREE.LightProbeGridWebGL: For ranged baking, use pass instead of bounces.' );

		}

		if ( count === 0 ) return;

		if ( firstPass > 0 && start > 0 && this._bouncePass !== firstPass ) {

			throw new Error( 'THREE.LightProbeGridWebGL: Start each indirect pass at probe 0.' );

		}

		this._ensureTextures();
		this.updateBoundingBox();
		_ensureBakeResources( options );
		_ensureBatchTarget( totalProbes );
		_ensureRepackResources();

		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
		const currentAutoClear = renderer.autoClear;
		const currentXrEnabled = renderer.xr.enabled;
		const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
		const currentMatrixWorldAutoUpdate = scene.matrixWorldAutoUpdate;
		const currentVisible = this.visible;
		const currentTexture = this.texture;
		const renderTarget = this._renderTarget;
		const currentViewport = renderTarget.viewport.clone();
		let replacedSunLights = null;

		try {

			this.visible = true;

			// Scene is static during the bake: update once, disable auto-update.

			if ( currentMatrixWorldAutoUpdate === true ) {

				scene.updateMatrixWorld( true );
				scene.matrixWorldAutoUpdate = false;

			}

			replacedSunLights = replaceSunLights( scene );

			// Render shadow maps once, not once per cube face.

			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;

			for ( let pass = firstPass; pass <= firstPass + bounces; pass ++ ) {

				this._updateBakeTexture( renderer, pass, start );
				this._captureProbes( renderer, scene, start, end );
				this._repackProbes( renderer, start, end );

			}

		} finally {

			renderTarget.viewport.copy( currentViewport );
			renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
			renderer.autoClear = currentAutoClear;
			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			if ( replacedSunLights !== null ) restoreSunLights( scene, replacedSunLights );

			scene.matrixWorldAutoUpdate = currentMatrixWorldAutoUpdate;
			this.visible = currentVisible;
			this.texture = currentTexture;

		}

	}

	/**
	 * Selects the atlas to sample during capture, snapshotting each indirect pass
	 * before its first range overwrites the live atlas.
	 *
	 * @private
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {number} pass - The bounce pass.
	 * @param {number} start - The first probe index.
	 */
	_updateBakeTexture( renderer, pass, start ) {

		if ( pass === 0 ) {

			this.texture = _emptyAtlas;
			if ( start === 0 ) this._bouncePass = - 1;
			return;

		}

		if ( start === 0 ) {

			const renderTarget = this._renderTarget;

			if ( this._bounceTarget === null ) this._bounceTarget = renderTarget.clone();

			renderer.initRenderTarget( renderTarget );
			renderer.initRenderTarget( this._bounceTarget );
			_copyRegion.min.set( 0, 0, 0 );
			_copyRegion.max.set( renderTarget.width, renderTarget.height, renderTarget.depth );
			renderer.copyTextureToTexture( renderTarget.texture, this._bounceTarget.texture, _copyRegion );
			this._bouncePass = pass;

		}

		this.texture = this._bounceTarget.texture;

	}

	/**
	 * Captures cubemaps and projects their SH coefficients into the batch target.
	 *
	 * @private
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {number} start - The first probe index.
	 * @param {number} end - The exclusive end probe index.
	 */
	_captureProbes( renderer, scene, start, end ) {

		const { x: nx, y: ny, z: nz } = this.resolution;
		const probesPerLayer = nx * nz;

		_mesh.material = _shMaterial;
		_shMaterial.uniforms.envMap.value = _cubeRenderTarget.texture;

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
			renderer.render( _scene, _camera );

		}

	}

	/**
	 * Packs a probe range into the live atlas, including its boundary padding.
	 *
	 * @private
	 * @param {WebGLRenderer} renderer - The renderer.
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

		for ( const material of _repackMaterials ) {

			material.uniforms.batchTexture.value = _batchTarget.texture;
			material.uniforms.resolution.value.copy( this.resolution );

		}

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

				for ( let t = 0; t < 7; t ++ ) {

					_mesh.material = _repackMaterials[ t ];
					_mesh.material.uniforms.sliceZ.value = iz;
					const base = t * paddedSlices;

					renderer.setRenderTarget( renderTarget, base + ATLAS_PADDING + iz );
					renderer.render( _scene, _camera );

					if ( iz === 0 ) {

						renderer.setRenderTarget( renderTarget, base );
						renderer.render( _scene, _camera );

					}

					if ( iz === nz - 1 ) {

						renderer.setRenderTarget( renderTarget, base + ATLAS_PADDING + nz );
						renderer.render( _scene, _camera );

					}

				}

				probeIndex += width * height;

			}

		}

	}

	/**
	 * Ensures the atlas 3D render target exists with the correct dimensions.
	 *
	 * @private
	 */
	_ensureTextures() {

		if ( this._renderTarget !== null ) return;

		const res = this.resolution;
		const nx = res.x, ny = res.y, nz = res.z;

		// Atlas depth: 7 sub-volumes, each with ATLAS_PADDING slices at both ends
		const atlasDepth = 7 * ( nz + 2 * ATLAS_PADDING );

		const rt = new WebGL3DRenderTarget( nx, ny, atlasDepth, {
			format: RGBAFormat,
			type: FloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			depthBuffer: false
		} );

		this._renderTarget = rt;
		this.texture = rt.texture;

	}

	/**
	 * Frees GPU resources.
	 */
	dispose() {

		if ( this._bounceTarget !== null ) {

			this._bounceTarget.dispose();
			this._bounceTarget = null;
			this._bouncePass = - 1;

		}

		if ( this._renderTarget !== null ) {

			this._renderTarget.dispose();
			this._renderTarget = null;
			this.texture = null;

		}

	}

}

// Internal: Ensure the shared fullscreen-quad scene exists
function _ensureScene() {

	if ( _scene === null ) {

		_camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		_mesh = new Mesh( new PlaneGeometry( 2, 2 ) );
		_scene = new Scene();
		_scene.add( _mesh );

	}

}

// Internal: Ensure GPU resources for SH projection are created
function _ensureGPUResources( cubemapSize ) {

	_ensureScene();

	// Recreate material when cubemap size changes
	if ( cubemapSize !== _lastCubemapSize ) {

		if ( _shMaterial !== null ) _shMaterial.dispose();

		_shMaterial = new ShaderMaterial( {
			precision: 'highp',
			defines: {
				CUBEMAP_SIZE: cubemapSize
			},
			uniforms: {
				envMap: { value: null }
			},
			vertexShader: /* glsl */`
				void main() {
					gl_Position = vec4( position.xy, 0.0, 1.0 );
				}
			`,
			fragmentShader: /* glsl */`
				#include <common>

				uniform samplerCube envMap;

				void main() {

					int coefIndex = int( gl_FragCoord.x );

					vec3 accum0 = vec3( 0.0 );
					vec3 accum1 = vec3( 0.0 );
					vec3 accum2 = vec3( 0.0 );
					vec3 accum3 = vec3( 0.0 );
					vec3 accum4 = vec3( 0.0 );
					vec3 accum5 = vec3( 0.0 );
					vec3 accum6 = vec3( 0.0 );
					vec3 accum7 = vec3( 0.0 );
					vec3 accum8 = vec3( 0.0 );
					float totalWeight = 0.0;
					float pixelSize = 2.0 / float( CUBEMAP_SIZE );

					for ( int face = 0; face < 6; face ++ ) {

						for ( int iy = 0; iy < CUBEMAP_SIZE; iy ++ ) {

							for ( int ix = 0; ix < CUBEMAP_SIZE; ix ++ ) {

								// WebGL cubemaps have a left-handed orientation (flip = -1)
								float col = ( float( ix ) + 0.5 ) * pixelSize - 1.0;
								float row = 1.0 - ( float( iy ) + 0.5 ) * pixelSize;

								vec3 coord;

								if ( face == 0 ) coord = vec3( 1.0, row, -col );
								else if ( face == 1 ) coord = vec3( -1.0, row, col );
								else if ( face == 2 ) coord = vec3( col, 1.0, -row );
								else if ( face == 3 ) coord = vec3( col, -1.0, row );
								else if ( face == 4 ) coord = vec3( col, row, 1.0 );
								else coord = vec3( -col, row, -1.0 );

								float lengthSq = dot( coord, coord );
								float weight = 4.0 / ( sqrt( lengthSq ) * lengthSq );
								totalWeight += weight;

								vec3 dir = normalize( coord );
								vec3 cw = textureCube( envMap, coord ).rgb * weight;

								// band 0
								accum0 += cw * 0.282095;

								// band 1
								accum1 += cw * ( 0.488603 * dir.y );
								accum2 += cw * ( 0.488603 * dir.z );
								accum3 += cw * ( 0.488603 * dir.x );

								// band 2
								accum4 += cw * ( 1.092548 * ( dir.x * dir.y ) );
								accum5 += cw * ( 1.092548 * ( dir.y * dir.z ) );
								accum6 += cw * ( 0.315392 * ( 3.0 * dir.z * dir.z - 1.0 ) );
								accum7 += cw * ( 1.092548 * ( dir.x * dir.z ) );
								accum8 += cw * ( 0.546274 * ( dir.x * dir.x - dir.y * dir.y ) );

							}

						}

					}

					float norm = 4.0 * PI / totalWeight;

					vec3 accum;
					if ( coefIndex == 0 ) accum = accum0;
					else if ( coefIndex == 1 ) accum = accum1;
					else if ( coefIndex == 2 ) accum = accum2;
					else if ( coefIndex == 3 ) accum = accum3;
					else if ( coefIndex == 4 ) accum = accum4;
					else if ( coefIndex == 5 ) accum = accum5;
					else if ( coefIndex == 6 ) accum = accum6;
					else if ( coefIndex == 7 ) accum = accum7;
					else accum = accum8;

					gl_FragColor = vec4( accum * norm, 1.0 );

				}
			`
		} );

		_lastCubemapSize = cubemapSize;

	}

}

// Internal: Ensure GPU resources for repacking SH into the atlas 3D texture
function _ensureRepackResources() {

	if ( _repackMaterials !== null ) return;

	_ensureScene();

	// Create 7 materials, one per output texture packing
	// Texture 0: (c0.r, c0.g, c0.b, c1.r)
	// Texture 1: (c1.g, c1.b, c2.r, c2.g)
	// Texture 2: (c2.b, c3.r, c3.g, c3.b)
	// Texture 3: (c4.r, c4.g, c4.b, c5.r)
	// Texture 4: (c5.g, c5.b, c6.r, c6.g)
	// Texture 5: (c6.b, c7.r, c7.g, c7.b)
	// Texture 6: (c8.r, c8.g, c8.b, 0.0)

	const repackVertexShader = /* glsl */`
		void main() {
			gl_Position = vec4( position.xy, 0.0, 1.0 );
		}
	`;

	_repackMaterials = [];

	for ( let t = 0; t < 7; t ++ ) {

		_repackMaterials[ t ] = new ShaderMaterial( {
			precision: 'highp',
			defines: {
				TEXTURE_INDEX: t
			},
			uniforms: {
				batchTexture: { value: null },
				resolution: { value: new Vector3() },
				sliceZ: { value: 0 }
			},
			vertexShader: repackVertexShader,
			fragmentShader: /* glsl */`
				uniform sampler2D batchTexture;
				uniform vec3 resolution;
				uniform int sliceZ;

				void main() {

					int ix = int( gl_FragCoord.x );
					int iy = int( gl_FragCoord.y );
					int iz = sliceZ;

					int probeIndex = ix + iy * int( resolution.x ) + iz * int( resolution.x ) * int( resolution.y );

					// Read 9 SH coefficients from the batch texture row
					vec4 c0 = texelFetch( batchTexture, ivec2( 0, probeIndex ), 0 );
					vec4 c1 = texelFetch( batchTexture, ivec2( 1, probeIndex ), 0 );
					vec4 c2 = texelFetch( batchTexture, ivec2( 2, probeIndex ), 0 );
					vec4 c3 = texelFetch( batchTexture, ivec2( 3, probeIndex ), 0 );
					vec4 c4 = texelFetch( batchTexture, ivec2( 4, probeIndex ), 0 );
					vec4 c5 = texelFetch( batchTexture, ivec2( 5, probeIndex ), 0 );
					vec4 c6 = texelFetch( batchTexture, ivec2( 6, probeIndex ), 0 );
					vec4 c7 = texelFetch( batchTexture, ivec2( 7, probeIndex ), 0 );
					vec4 c8 = texelFetch( batchTexture, ivec2( 8, probeIndex ), 0 );

					// Pack into the output format for this texture index
					#if TEXTURE_INDEX == 0
						gl_FragColor = vec4( c0.rgb, c1.r );
					#elif TEXTURE_INDEX == 1
						gl_FragColor = vec4( c1.gb, c2.rg );
					#elif TEXTURE_INDEX == 2
						gl_FragColor = vec4( c2.b, c3.rgb );
					#elif TEXTURE_INDEX == 3
						gl_FragColor = vec4( c4.rgb, c5.r );
					#elif TEXTURE_INDEX == 4
						gl_FragColor = vec4( c5.gb, c6.rg );
					#elif TEXTURE_INDEX == 5
						gl_FragColor = vec4( c6.b, c7.rgb );
					#else
						gl_FragColor = vec4( c8.rgb, 0.0 );
					#endif

				}
			`
		} );

	}

}

// Internal: Ensure cube render target and camera exist with the right parameters
function _ensureBakeResources( options ) {

	if ( _emptyAtlas === null ) {

		_emptyAtlas = new Data3DTexture( new Uint16Array( 4 ), 1, 1, 1 );
		_emptyAtlas.type = HalfFloatType;
		_emptyAtlas.minFilter = LinearFilter;
		_emptyAtlas.magFilter = LinearFilter;
		_emptyAtlas.needsUpdate = true;

	}

	const {
		cubemapSize = 8,
		near = 0.1,
		far = 100
	} = options;

	if ( _cubeRenderTarget === null || cubemapSize !== _cachedCubemapSize || near !== _cachedNear || far !== _cachedFar ) {

		if ( _cubeRenderTarget !== null ) _cubeRenderTarget.dispose();

		_cubeRenderTarget = new WebGLCubeRenderTarget( cubemapSize, { type: HalfFloatType } );
		_cubeCamera = new CubeCamera( near, far, _cubeRenderTarget );
		_cachedCubemapSize = cubemapSize;
		_cachedNear = near;
		_cachedFar = far;

	}

	_ensureGPUResources( cubemapSize );

}

function _ensureBatchTarget( totalProbes ) {

	if ( _batchTarget === null || _batchTargetProbes !== totalProbes ) {

		if ( _batchTarget !== null ) _batchTarget.dispose();

		_batchTarget = new WebGLRenderTarget( 9, totalProbes, {
			type: FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

		_batchTargetProbes = totalProbes;

	}

}

export { LightProbeGridWebGL };
