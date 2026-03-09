import {
	CubeCamera,
	FloatType,
	HalfFloatType,
	LinearFilter,
	Mesh,
	NearestFilter,
	Object3D,
	OrthographicCamera,
	PlaneGeometry,
	RGBAFormat,
	Scene,
	ShaderMaterial,
	Vector3,
	Vector4,
	WebGL3DRenderTarget,
	WebGLCoordinateSystem,
	WebGLCubeRenderTarget,
	WebGLRenderTarget
} from 'three';

// Shared fullscreen-quad scene / camera
let _scene = null;
let _camera = null;
let _mesh = null;

// SH projection material (depends on cubemapSize + flip)
let _shMaterial = null;
let _lastCubemapSize = 0;
let _lastFlip = 0;

// Repack materials (one per output texture)
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
const _savedViewport = /*@__PURE__*/ new Vector4();
const _savedScissor = /*@__PURE__*/ new Vector4();

/**
 * A 3D grid of L2 Spherical Harmonic irradiance probes that provides
 * position-dependent diffuse global illumination. L1 coefficients are stored
 * in full RGB and L2 coefficients as luminance, packed into five RGBA
 * `WebGL3DRenderTarget` instances with `LinearFilter` for hardware trilinear
 * interpolation.
 *
 * Baking is fully GPU-resident: cubemap rendering, SH projection, and
 * texture packing all happen on the GPU with zero CPU readback.
 *
 * @three_import import { LightProbeVolume } from 'three/addons/lighting/LightProbeVolume.js';
 */
class LightProbeVolume extends Object3D {

	/**
	 * Constructs a new irradiance probe grid.
	 *
	 * @param {Box3} boundingBox - The world-space bounding box for the grid.
	 * @param {Vector3} resolution - The number of probes along each axis (x, y, z).
	 */
	constructor( boundingBox, resolution ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightProbeVolume = true;

		/**
		 * The world-space bounding box for the grid.
		 * @type {Box3}
		 */
		this.boundingBox = boundingBox.clone();

		/**
		 * The number of probes along each axis.
		 * @type {Vector3}
		 */
		this.resolution = resolution.clone();

		/**
		 * The five RGBA 3D textures storing packed SH coefficients.
		 * @type {Data3DTexture[]}
		 */
		this.textures = [ null, null, null, null, null ];

		/**
		 * Internal render targets for GPU-resident baking.
		 * @private
		 */
		this._renderTargets = [ null, null, null, null, null ];

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

		const min = this.boundingBox.min;
		const max = this.boundingBox.max;
		const res = this.resolution;

		target.set(
			res.x > 1 ? min.x + ix * ( max.x - min.x ) / ( res.x - 1 ) : ( min.x + max.x ) * 0.5,
			res.y > 1 ? min.y + iy * ( max.y - min.y ) / ( res.y - 1 ) : ( min.y + max.y ) * 0.5,
			res.z > 1 ? min.z + iz * ( max.z - min.z ) / ( res.z - 1 ) : ( min.z + max.z ) * 0.5
		);

		return target;

	}

	/**
	 * Bakes all probes by rendering cubemaps at each probe position
	 * and projecting to L2 SH. Fully GPU-resident with zero CPU readback.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 * @param {Object} [options] - Bake options.
	 * @param {number} [options.cubemapSize=8] - Resolution of each cubemap face.
	 * @param {number} [options.near=0.1] - Near plane for the cube camera.
	 * @param {number} [options.far=100] - Far plane for the cube camera.
	 */
	bake( renderer, scene, options = {} ) {

		const { cubeRenderTarget, cubeCamera } = _ensureBakeResources( renderer, options );

		this._ensureTextures();

		// Prevent feedback: temporarily hide the volume during baking
		this.visible = false;

		const res = this.resolution;
		const totalProbes = res.x * res.y * res.z;

		// Batch render target for SH coefficients: 9 pixels wide, one row per probe
		const batchTarget = _ensureBatchTarget( totalProbes );

		// Save renderer state
		const savedRenderTarget = renderer.getRenderTarget();
		renderer.getViewport( _savedViewport );
		renderer.getScissor( _savedScissor );
		const savedScissorTest = renderer.getScissorTest();

		// Clear pooled batch target so skipped probes read as zero
		batchTarget.scissorTest = false;
		batchTarget.viewport.set( 0, 0, 9, totalProbes );
		renderer.setRenderTarget( batchTarget );
		renderer.clear();

		const t0 = performance.now();

		// Phase 1: Render cubemaps and project to SH into batch target
		// Note: set viewport/scissor on the render target directly to avoid pixel ratio scaling
		batchTarget.scissorTest = true;

		// Disable shadow map auto-update during bake — lights don't move between probes.
		// Force one shadow update on the first render so maps are initialized.
		const savedShadowAutoUpdate = renderer.shadowMap.autoUpdate;
		renderer.shadowMap.autoUpdate = false;
		renderer.shadowMap.needsUpdate = true;

		for ( let iz = 0; iz < res.z; iz ++ ) {

			for ( let iy = 0; iy < res.y; iy ++ ) {

				for ( let ix = 0; ix < res.x; ix ++ ) {

					const probeIndex = ix + iy * res.x + iz * res.x * res.y;

					this.getProbePosition( ix, iy, iz, _position );
					cubeCamera.position.copy( _position );
					cubeCamera.update( renderer, scene );

					// SH projection
					_shMaterial.uniforms.envMap.value = cubeRenderTarget.texture;
					_mesh.material = _shMaterial;
					batchTarget.viewport.set( 0, probeIndex, 9, 1 );
					batchTarget.scissor.set( 0, probeIndex, 9, 1 );
					renderer.setRenderTarget( batchTarget );
					renderer.render( _scene, _camera );

				}

			}

		}

		renderer.shadowMap.autoUpdate = savedShadowAutoUpdate;

		// Phase 2: Repack SH data from batch target into 3D textures (GPU-to-GPU)
		_ensureRepackResources();

		for ( let t = 0; t < 5; t ++ ) {

			_repackMaterials[ t ].uniforms.batchTexture.value = batchTarget.texture;
			_repackMaterials[ t ].uniforms.resolution.value.copy( res );

			const rt = this._renderTargets[ t ];
			rt.scissorTest = false;
			rt.viewport.set( 0, 0, res.x, res.y );

			for ( let iz = 0; iz < res.z; iz ++ ) {

				_repackMaterials[ t ].uniforms.sliceZ.value = iz;
				_mesh.material = _repackMaterials[ t ];
				renderer.setRenderTarget( rt, iz );
				renderer.render( _scene, _camera );

			}

		}

		// Restore renderer state
		renderer.setRenderTarget( savedRenderTarget );
		renderer.setViewport( _savedViewport );
		renderer.setScissor( _savedScissor );
		renderer.setScissorTest( savedScissorTest );

		console.log( `LightProbeVolume: bake complete ${ ( performance.now() - t0 ).toFixed( 1 ) }ms` );

		this.visible = true;

	}

	/**
	 * Ensures the 3D render target textures exist with the correct dimensions.
	 * @private
	 */
	_ensureTextures() {

		const res = this.resolution;
		const nx = res.x, ny = res.y, nz = res.z;

		for ( let t = 0; t < 5; t ++ ) {

			if ( this._renderTargets[ t ] !== null ) continue;

			const rt = new WebGL3DRenderTarget( nx, ny, nz, {
				format: RGBAFormat,
				type: FloatType,
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				generateMipmaps: false,
				depthBuffer: false
			} );

			this._renderTargets[ t ] = rt;
			this.textures[ t ] = rt.texture;

		}

	}

	/**
	 * Frees GPU resources.
	 */
	dispose() {

		for ( let t = 0; t < 5; t ++ ) {

			if ( this._renderTargets[ t ] !== null ) {

				this._renderTargets[ t ].dispose();
				this._renderTargets[ t ] = null;
				this.textures[ t ] = null;

			}

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
function _ensureGPUResources( cubemapSize, flip ) {

	_ensureScene();

	// Recreate material when cubemap size or flip changes
	if ( cubemapSize !== _lastCubemapSize || flip !== _lastFlip ) {

		if ( _shMaterial !== null ) _shMaterial.dispose();

		_shMaterial = new ShaderMaterial( {
			defines: {
				CUBEMAP_SIZE: cubemapSize,
				FLIP: flip.toFixed( 1 )
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
				precision highp float;
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

								float col = ( 1.0 - ( float( ix ) + 0.5 ) * pixelSize ) * FLIP;
								float row = 1.0 - ( float( iy ) + 0.5 ) * pixelSize;

								vec3 coord;

								if ( face == 0 ) coord = vec3( -1.0 * FLIP, row, col * FLIP );
								else if ( face == 1 ) coord = vec3( 1.0 * FLIP, row, -col * FLIP );
								else if ( face == 2 ) coord = vec3( col, 1.0, -row );
								else if ( face == 3 ) coord = vec3( col, -1.0, row );
								else if ( face == 4 ) coord = vec3( col, row, 1.0 );
								else coord = vec3( -col, row, -1.0 );

								float lengthSq = dot( coord, coord );
								float weight = 4.0 / ( sqrt( lengthSq ) * lengthSq );
								totalWeight += weight;

								vec3 dir = normalize( coord );
								vec3 cw = textureCube( envMap, coord ).rgb * weight;

								accum0 += cw * 0.282095;
								accum1 += cw * ( 0.488603 * dir.y );
								accum2 += cw * ( 0.488603 * dir.z );
								accum3 += cw * ( 0.488603 * dir.x );
								accum4 += cw * ( 1.092548 * dir.x * dir.y );
								accum5 += cw * ( 1.092548 * dir.y * dir.z );
								accum6 += cw * ( 0.315392 * ( 3.0 * dir.z * dir.z - 1.0 ) );
								accum7 += cw * ( 1.092548 * dir.x * dir.z );
								accum8 += cw * ( 0.546274 * ( dir.x * dir.x - dir.y * dir.y ) );

							}

						}

					}

					float norm = 4.0 * 3.14159265359 / totalWeight;

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
		_lastFlip = flip;

	}

}

// Internal: Ensure GPU resources for repacking SH into 3D textures
function _ensureRepackResources() {

	if ( _repackMaterials !== null ) return;

	_ensureScene();

	// Create 5 materials, one per output texture packing
	// L1 coefficients stored as RGB, L2 as luminance in alpha/red
	// Texture 0: (c0.rgb, c4_lum)
	// Texture 1: (c1.rgb, c5_lum)
	// Texture 2: (c2.rgb, c6_lum)
	// Texture 3: (c3.rgb, c7_lum)
	// Texture 4: (c8_lum, 0.0, 0.0, 0.0)

	const repackVertexShader = /* glsl */`
		void main() {
			gl_Position = vec4( position.xy, 0.0, 1.0 );
		}
	`;

	_repackMaterials = [];

	for ( let t = 0; t < 5; t ++ ) {

		_repackMaterials[ t ] = new ShaderMaterial( {
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
				precision highp float;
				uniform sampler2D batchTexture;
				uniform vec3 resolution;
				uniform int sliceZ;

				const vec3 LUM = vec3( 0.2126, 0.7152, 0.0722 );

				void main() {

					int ix = int( gl_FragCoord.x );
					int iy = int( gl_FragCoord.y );
					int iz = sliceZ;

					int probeIndex = ix + iy * int( resolution.x ) + iz * int( resolution.x ) * int( resolution.y );

					#if TEXTURE_INDEX == 0
						vec4 cL1 = texelFetch( batchTexture, ivec2( 0, probeIndex ), 0 );
						vec4 cL2 = texelFetch( batchTexture, ivec2( 4, probeIndex ), 0 );
						gl_FragColor = vec4( cL1.rgb, dot( cL2.rgb, LUM ) );
					#elif TEXTURE_INDEX == 1
						vec4 cL1 = texelFetch( batchTexture, ivec2( 1, probeIndex ), 0 );
						vec4 cL2 = texelFetch( batchTexture, ivec2( 5, probeIndex ), 0 );
						gl_FragColor = vec4( cL1.rgb, dot( cL2.rgb, LUM ) );
					#elif TEXTURE_INDEX == 2
						vec4 cL1 = texelFetch( batchTexture, ivec2( 2, probeIndex ), 0 );
						vec4 cL2 = texelFetch( batchTexture, ivec2( 6, probeIndex ), 0 );
						gl_FragColor = vec4( cL1.rgb, dot( cL2.rgb, LUM ) );
					#elif TEXTURE_INDEX == 3
						vec4 cL1 = texelFetch( batchTexture, ivec2( 3, probeIndex ), 0 );
						vec4 cL2 = texelFetch( batchTexture, ivec2( 7, probeIndex ), 0 );
						gl_FragColor = vec4( cL1.rgb, dot( cL2.rgb, LUM ) );
					#else
						vec4 cL2 = texelFetch( batchTexture, ivec2( 8, probeIndex ), 0 );
						gl_FragColor = vec4( dot( cL2.rgb, LUM ), 0.0, 0.0, 0.0 );
					#endif

				}
			`
		} );

	}

}

// Internal: Ensure cube render target and camera exist with the right parameters
function _ensureBakeResources( renderer, options ) {

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

	const flip = renderer.coordinateSystem === WebGLCoordinateSystem ? - 1 : 1;

	_ensureGPUResources( cubemapSize, flip );

	return { cubeRenderTarget: _cubeRenderTarget, cubeCamera: _cubeCamera };

}

function _ensureBatchTarget( totalProbes ) {

	if ( _batchTarget === null || _batchTargetProbes < totalProbes ) {

		if ( _batchTarget !== null ) _batchTarget.dispose();

		_batchTarget = new WebGLRenderTarget( 9, totalProbes, {
			type: FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

		_batchTargetProbes = totalProbes;

	}

	return _batchTarget;

}

export { LightProbeVolume };
