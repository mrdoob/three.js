import NodeMaterial from '../../../materials/nodes/NodeMaterial.js';
import { getDirection, blur, ggxConvolution } from '../../../nodes/pmrem/PMREMUtils.js';
import { equirectUV } from '../../../nodes/utils/EquirectUV.js';
import { uniform } from '../../../nodes/core/UniformNode.js';
import { uniformArray } from '../../../nodes/accessors/UniformArrayNode.js';
import { texture } from '../../../nodes/accessors/TextureNode.js';
import { cubeTexture } from '../../../nodes/accessors/CubeTextureNode.js';
import { float, uint, vec3 } from '../../../nodes/tsl/TSLBase.js';
import { uv } from '../../../nodes/accessors/UV.js';
import { attribute } from '../../../nodes/core/AttributeNode.js';

import { OrthographicCamera } from '../../../cameras/OrthographicCamera.js';
import { Color } from '../../../math/Color.js';
import { Vector3 } from '../../../math/Vector3.js';
import { BufferGeometry } from '../../../core/BufferGeometry.js';
import { BufferAttribute } from '../../../core/BufferAttribute.js';
import { RenderTarget } from '../../../core/RenderTarget.js';
import { Mesh } from '../../../objects/Mesh.js';
import { PerspectiveCamera } from '../../../cameras/PerspectiveCamera.js';
import { MeshBasicMaterial } from '../../../materials/MeshBasicMaterial.js';
import { BoxGeometry } from '../../../geometries/BoxGeometry.js';
import {
	CubeReflectionMapping,
	CubeRefractionMapping,
	CubeUVReflectionMapping,
	LinearFilter,
	NoBlending,
	RGBAFormat,
	HalfFloatType,
	BackSide,
	LinearSRGBColorSpace
} from '../../../constants.js';
import { warn, error, warnOnce } from '../../../utils.js';

const LOD_MIN = 4;

// The standard deviations (radians) associated with the extra mips.
// Used for scene blur in fromScene() method.
const EXTRA_LOD_SIGMA = [ 0.125, 0.215, 0.35, 0.446, 0.526, 0.582 ];

// The maximum length of the blur for loop. Smaller sigmas will use fewer
// samples and exit early, but not recompile the shader.
// Used for scene blur in fromScene() method.
const MAX_SAMPLES = 20;

// GGX VNDF importance sampling configuration
const GGX_SAMPLES = 512;

const _flatCamera = /*@__PURE__*/ new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
const _cubeCamera = /*@__PURE__*/ new PerspectiveCamera( 90, 1 );
const _clearColor = /*@__PURE__*/ new Color();
let _oldTarget = null;
let _oldActiveCubeFace = 0;
let _oldActiveMipmapLevel = 0;

const _origin = /*@__PURE__*/ new Vector3();

// maps blur materials to their uniforms dictionary

const _uniformsMap = new WeakMap();

// WebGPU Face indices
const _faceLib = [
	3, 1, 5,
	0, 4, 2
];

const _direction = /*@__PURE__*/ getDirection( uv(), attribute( 'faceIndex' ) ).normalize();
const _outputDirection = /*@__PURE__*/ vec3( _direction.x, _direction.y, _direction.z );

/**
 * This class generates a Prefiltered, Mipmapped Radiance Environment Map
 * (PMREM) from a cubeMap environment texture. This allows different levels of
 * blur to be quickly accessed based on material roughness. It is packed into a
 * special CubeUV format that allows us to perform custom interpolation so that
 * we can support nonlinear formats such as RGBE. Unlike a traditional mipmap
 * chain, it only goes down to the LOD_MIN level (above), and then creates extra
 * even more filtered 'mips' at the same LOD_MIN resolution, associated with
 * higher roughness levels. In this way we maintain resolution to smoothly
 * interpolate diffuse lighting while limiting sampling computation.
 *
 * The prefiltering uses GGX VNDF (Visible Normal Distribution Function)
 * importance sampling based on "Sampling the GGX Distribution of Visible Normals"
 * (Heitz, 2018) to generate environment maps that accurately match the GGX BRDF
 * used in material rendering for physically-based image-based lighting.
 */
class PMREMGenerator {

	/**
	 * Constructs a new PMREM generator.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		this._renderer = renderer;
		this._pingPongRenderTarget = null;

		this._lodMax = 0;
		this._cubeSize = 0;
		this._sizeLods = [];
		this._sigmas = [];
		this._lodMeshes = [];

		this._blurMaterial = null;
		this._ggxMaterial = null;

		this._cubemapMaterial = null;
		this._equirectMaterial = null;
		this._backgroundBox = null;

	}

	get _hasInitialized() {

		return this._renderer.hasInitialized();

	}

	/**
	 * Generates a PMREM from a supplied Scene, which can be faster than using an
	 * image if networking bandwidth is low. Optional sigma specifies a blur radius
	 * in radians to be applied to the scene before PMREM generation. Optional near
	 * and far planes ensure the scene is rendered in its entirety.
	 *
	 * @param {Scene} scene - The scene to be captured.
	 * @param {number} [sigma=0] - The blur radius in radians.
	 * @param {number} [near=0.1] - The near plane distance.
	 * @param {number} [far=100] - The far plane distance.
	 * @param {Object} [options={}] - The configuration options.
	 * @param {number} [options.size=256] - The texture size of the PMREM.
	 * @param {Vector3} [options.renderTarget=origin] - The position of the internal cube camera that renders the scene.
	 * @param {?RenderTarget} [options.renderTarget=null] - The render target to use.
	 * @return {RenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromScene}
	 */
	fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		const {
			size = 256,
			position = _origin,
			renderTarget = null,
		} = options;

		this._setSize( size );

		if ( this._hasInitialized === false ) {

			warn( 'PMREMGenerator: ".fromScene()" called before the backend is initialized. Try using "await renderer.init()" instead.' );

			const cubeUVRenderTarget = renderTarget || this._allocateTarget();

			options.renderTarget = cubeUVRenderTarget;

			this.fromSceneAsync( scene, sigma, near, far, options );

			return cubeUVRenderTarget;

		}

		_oldTarget = this._renderer.getRenderTarget();
		_oldActiveCubeFace = this._renderer.getActiveCubeFace();
		_oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel();

		const cubeUVRenderTarget = renderTarget || this._allocateTarget();
		cubeUVRenderTarget.depthBuffer = true;

		this._init( cubeUVRenderTarget );

		this._sceneToCubeUV( scene, near, far, cubeUVRenderTarget, position );

		if ( sigma > 0 ) {

			this._blur( cubeUVRenderTarget, 0, 0, sigma );

		}

		this._applyPMREM( cubeUVRenderTarget );

		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	/**
	 * Generates a PMREM from a supplied Scene, which can be faster than using an
	 * image if networking bandwidth is low. Optional sigma specifies a blur radius
	 * in radians to be applied to the scene before PMREM generation. Optional near
	 * and far planes ensure the scene is rendered in its entirety (the cubeCamera
	 * is placed at the origin).
	 *
	 * @deprecated
	 * @param {Scene} scene - The scene to be captured.
	 * @param {number} [sigma=0] - The blur radius in radians.
	 * @param {number} [near=0.1] - The near plane distance.
	 * @param {number} [far=100] - The far plane distance.
	 * @param {Object} [options={}] - The configuration options.
	 * @param {number} [options.size=256] - The texture size of the PMREM.
	 * @param {Vector3} [options.position=origin] - The position of the internal cube camera that renders the scene.
	 * @param {?RenderTarget} [options.renderTarget=null] - The render target to use.
	 * @return {Promise<RenderTarget>} A Promise that resolve with the PMREM when the generation has been finished.
	 * @see {@link PMREMGenerator#fromScene}
	 */
	async fromSceneAsync( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		warnOnce( 'PMREMGenerator: ".fromSceneAsync()" is deprecated. Use "await renderer.init()" instead.' ); // @deprecated r181

		await this._renderer.init();

		return this.fromScene( scene, sigma, near, far, options );

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512),
	 * as this matches best with the 256 x 256 cubemap output.
	 *
	 * @param {Texture} equirectangular - The equirectangular texture to be converted.
	 * @param {?RenderTarget} [renderTarget=null] - The render target to use.
	 * @return {RenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromEquirectangularAsync}
	 */
	fromEquirectangular( equirectangular, renderTarget = null ) {

		if ( this._hasInitialized === false ) {

			warn( 'PMREMGenerator: .fromEquirectangular() called before the backend is initialized. Try using "await renderer.init()" instead.' );

			this._setSizeFromTexture( equirectangular );

			const cubeUVRenderTarget = renderTarget || this._allocateTarget();

			this.fromEquirectangularAsync( equirectangular, cubeUVRenderTarget );

			return cubeUVRenderTarget;

		}

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512),
	 * as this matches best with the 256 x 256 cubemap output.
	 *
	 * @deprecated
	 * @param {Texture} equirectangular - The equirectangular texture to be converted.
	 * @param {?RenderTarget} [renderTarget=null] - The render target to use.
	 * @return {Promise<RenderTarget>} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromEquirectangular}
	 */
	async fromEquirectangularAsync( equirectangular, renderTarget = null ) {

		warnOnce( 'PMREMGenerator: ".fromEquirectangularAsync()" is deprecated. Use "await renderer.init()" instead.' ); // @deprecated r181

		await this._renderer.init();

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Generates a PMREM from an cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256,
	 * as this matches best with the 256 x 256 cubemap output.
	 *
	 * @param {Texture} cubemap - The cubemap texture to be converted.
	 * @param {?RenderTarget} [renderTarget=null] - The render target to use.
	 * @return {RenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromCubemapAsync}
	 */
	fromCubemap( cubemap, renderTarget = null ) {

		if ( this._hasInitialized === false ) {

			warn( 'PMREMGenerator: .fromCubemap() called before the backend is initialized. Try using .fromCubemapAsync() instead.' );

			this._setSizeFromTexture( cubemap );

			const cubeUVRenderTarget = renderTarget || this._allocateTarget();

			this.fromCubemapAsync( cubemap, renderTarget );

			return cubeUVRenderTarget;

		}

		return this._fromTexture( cubemap, renderTarget );

	}

	/**
	 * Generates a PMREM from an cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256,
	 * with the 256 x 256 cubemap output.
	 *
	 * @deprecated
	 * @param {Texture} cubemap - The cubemap texture to be converted.
	 * @param {?RenderTarget} [renderTarget=null] - The render target to use.
	 * @return {Promise<RenderTarget>} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromCubemap}
	 */
	async fromCubemapAsync( cubemap, renderTarget = null ) {

		warnOnce( 'PMREMGenerator: ".fromCubemapAsync()" is deprecated. Use "await renderer.init()" instead.' ); // @deprecated r181

		await this._renderer.init();

		return this._fromTexture( cubemap, renderTarget );

	}

	/**
	 * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 *
	 * @returns {Promise}
	 */
	async compileCubemapShader() {

		if ( this._cubemapMaterial === null ) {

			this._cubemapMaterial = _getCubemapMaterial();
			await this._compileMaterial( this._cubemapMaterial );

		}

	}

	/**
	 * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 *
	 * @returns {Promise}
	 */
	async compileEquirectangularShader() {

		if ( this._equirectMaterial === null ) {

			this._equirectMaterial = _getEquirectMaterial();
			await this._compileMaterial( this._equirectMaterial );

		}

	}

	/**
	 * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
	 * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
	 * one of them will cause any others to also become unusable.
	 */
	dispose() {

		this._dispose();

		if ( this._cubemapMaterial !== null ) this._cubemapMaterial.dispose();
		if ( this._equirectMaterial !== null ) this._equirectMaterial.dispose();
		if ( this._backgroundBox !== null ) {

			this._backgroundBox.geometry.dispose();
			this._backgroundBox.material.dispose();

		}

	}

	// private interface

	_setSizeFromTexture( texture ) {

		if ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ) {

			this._setSize( texture.image.length === 0 ? 16 : ( texture.image[ 0 ].width || texture.image[ 0 ].image.width ) );

		} else { // Equirectangular

			this._setSize( texture.image.width / 4 );

		}

	}

	_setSize( cubeSize ) {

		this._lodMax = Math.floor( Math.log2( cubeSize ) );
		this._cubeSize = Math.pow( 2, this._lodMax );

	}

	_dispose() {

		if ( this._blurMaterial !== null ) this._blurMaterial.dispose();
		if ( this._ggxMaterial !== null ) this._ggxMaterial.dispose();

		if ( this._pingPongRenderTarget !== null ) this._pingPongRenderTarget.dispose();

		for ( let i = 0; i < this._lodMeshes.length; i ++ ) {

			this._lodMeshes[ i ].geometry.dispose();

		}

	}

	_cleanup( outputTarget ) {

		this._renderer.setRenderTarget( _oldTarget, _oldActiveCubeFace, _oldActiveMipmapLevel );
		outputTarget.scissorTest = false;
		_setViewport( outputTarget, 0, 0, outputTarget.width, outputTarget.height );

	}

	_fromTexture( texture, renderTarget ) {

		this._setSizeFromTexture( texture );

		_oldTarget = this._renderer.getRenderTarget();
		_oldActiveCubeFace = this._renderer.getActiveCubeFace();
		_oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel();

		const cubeUVRenderTarget = renderTarget || this._allocateTarget();
		this._init( cubeUVRenderTarget );
		this._textureToCubeUV( texture, cubeUVRenderTarget );
		this._applyPMREM( cubeUVRenderTarget );
		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	_allocateTarget() {

		const width = 3 * Math.max( this._cubeSize, 16 * 7 );
		const height = 4 * this._cubeSize;

		const cubeUVRenderTarget = _createRenderTarget( width, height );

		return cubeUVRenderTarget;

	}

	_init( renderTarget ) {

		if ( this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== renderTarget.width || this._pingPongRenderTarget.height !== renderTarget.height ) {

			if ( this._pingPongRenderTarget !== null ) {

				this._dispose();

			}

			this._pingPongRenderTarget = _createRenderTarget( renderTarget.width, renderTarget.height );

			const { _lodMax } = this;
			( { lodMeshes: this._lodMeshes, sizeLods: this._sizeLods, sigmas: this._sigmas } = _createPlanes( _lodMax ) );

			this._blurMaterial = _getBlurShader( _lodMax, renderTarget.width, renderTarget.height );
			this._ggxMaterial = _getGGXShader( _lodMax, renderTarget.width, renderTarget.height );

		}

	}

	async _compileMaterial( material ) {

		const mesh = new Mesh( new BufferGeometry(), material );
		await this._renderer.compile( mesh, _flatCamera );

	}

	_sceneToCubeUV( scene, near, far, cubeUVRenderTarget, position ) {

		const cubeCamera = _cubeCamera;
		cubeCamera.near = near;
		cubeCamera.far = far;

		// px, py, pz, nx, ny, nz
		const upSign = [ 1, 1, 1, 1, - 1, 1 ];
		const forwardSign = [ 1, - 1, 1, - 1, 1, - 1 ];

		const renderer = this._renderer;

		const originalAutoClear = renderer.autoClear;

		renderer.getClearColor( _clearColor );

		renderer.autoClear = false;

		if ( this._backgroundBox === null ) {

			this._backgroundBox = new Mesh(
				new BoxGeometry(),
				new MeshBasicMaterial( {
					name: 'PMREM.Background',
					side: BackSide,
					depthWrite: false,
					depthTest: false,
				} )
			);

		}

		const backgroundBox = this._backgroundBox;
		const backgroundMaterial = backgroundBox.material;

		let useSolidColor = false;

		const background = scene.background;

		if ( background ) {

			if ( background.isColor ) {

				backgroundMaterial.color.copy( background );
				scene.background = null;
				useSolidColor = true;

			}

		} else {

			backgroundMaterial.color.copy( _clearColor );
			useSolidColor = true;

		}

		renderer.setRenderTarget( cubeUVRenderTarget );

		renderer.clear();

		if ( useSolidColor ) {

			renderer.render( backgroundBox, cubeCamera );

		}

		for ( let i = 0; i < 6; i ++ ) {

			const col = i % 3;

			if ( col === 0 ) {

				cubeCamera.up.set( 0, upSign[ i ], 0 );
				cubeCamera.position.set( position.x, position.y, position.z );
				cubeCamera.lookAt( position.x + forwardSign[ i ], position.y, position.z );

			} else if ( col === 1 ) {

				cubeCamera.up.set( 0, 0, upSign[ i ] );
				cubeCamera.position.set( position.x, position.y, position.z );
				cubeCamera.lookAt( position.x, position.y + forwardSign[ i ], position.z );


			} else {

				cubeCamera.up.set( 0, upSign[ i ], 0 );
				cubeCamera.position.set( position.x, position.y, position.z );
				cubeCamera.lookAt( position.x, position.y, position.z + forwardSign[ i ] );


			}

			const size = this._cubeSize;

			_setViewport( cubeUVRenderTarget, col * size, i > 2 ? size : 0, size, size );

			renderer.render( scene, cubeCamera );

		}

		renderer.autoClear = originalAutoClear;
		scene.background = background;

	}

	_textureToCubeUV( texture, cubeUVRenderTarget ) {

		const renderer = this._renderer;

		const isCubeTexture = ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping );

		if ( isCubeTexture ) {

			if ( this._cubemapMaterial === null ) {

				this._cubemapMaterial = _getCubemapMaterial( texture );

			}

		} else {

			if ( this._equirectMaterial === null ) {

				this._equirectMaterial = _getEquirectMaterial( texture );

			}

		}

		const material = isCubeTexture ? this._cubemapMaterial : this._equirectMaterial;
		material.fragmentNode.value = texture;

		const mesh = this._lodMeshes[ 0 ];
		mesh.material = material;

		const size = this._cubeSize;

		_setViewport( cubeUVRenderTarget, 0, 0, 3 * size, 2 * size );

		renderer.setRenderTarget( cubeUVRenderTarget );
		renderer.render( mesh, _flatCamera );

	}

	_applyPMREM( cubeUVRenderTarget ) {

		const renderer = this._renderer;
		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		const n = this._lodMeshes.length;

		// Use GGX VNDF importance sampling
		for ( let i = 1; i < n; i ++ ) {

			this._applyGGXFilter( cubeUVRenderTarget, i - 1, i );

		}

		renderer.autoClear = autoClear;

	}

	/**
	 * Applies GGX VNDF importance sampling filter to generate a prefiltered environment map.
	 * Uses Monte Carlo integration with VNDF importance sampling to accurately represent the
	 * GGX BRDF for physically-based rendering. Reads from the previous LOD level and
	 * applies incremental roughness filtering to avoid over-blurring.
	 *
	 * @private
	 * @param {RenderTarget} cubeUVRenderTarget
	 * @param {number} lodIn - Source LOD level to read from
	 * @param {number} lodOut - Target LOD level to write to
	 */
	_applyGGXFilter( cubeUVRenderTarget, lodIn, lodOut ) {

		const renderer = this._renderer;
		const pingPongRenderTarget = this._pingPongRenderTarget;

		const ggxMaterial = this._ggxMaterial;
		const ggxMesh = this._lodMeshes[ lodOut ];
		ggxMesh.material = ggxMaterial;

		const ggxUniforms = _uniformsMap.get( ggxMaterial );

		// Calculate incremental roughness between LOD levels
		const targetRoughness = lodOut / ( this._lodMeshes.length - 1 );
		const sourceRoughness = lodIn / ( this._lodMeshes.length - 1 );
		const incrementalRoughness = Math.sqrt( targetRoughness * targetRoughness - sourceRoughness * sourceRoughness );

		// Apply blur strength mapping for better quality across the roughness range
		const blurStrength = 0.0 + targetRoughness * 1.25;
		const adjustedRoughness = incrementalRoughness * blurStrength;

		// Calculate viewport position based on output LOD level
		const { _lodMax } = this;
		const outputSize = this._sizeLods[ lodOut ];
		const x = 3 * outputSize * ( lodOut > _lodMax - LOD_MIN ? lodOut - _lodMax + LOD_MIN : 0 );
		const y = 4 * ( this._cubeSize - outputSize );

		// Read from previous LOD with incremental roughness
		cubeUVRenderTarget.texture.frame = ( cubeUVRenderTarget.texture.frame || 0 ) + 1;
		ggxUniforms.envMap.value = cubeUVRenderTarget.texture;
		ggxUniforms.roughness.value = adjustedRoughness;
		ggxUniforms.mipInt.value = _lodMax - lodIn; // Sample from input LOD

		_setViewport( pingPongRenderTarget, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( pingPongRenderTarget );
		renderer.render( ggxMesh, _flatCamera );

		// Copy from pingPong back to cubeUV (simple direct copy)
		pingPongRenderTarget.texture.frame = ( pingPongRenderTarget.texture.frame || 0 ) + 1;
		ggxUniforms.envMap.value = pingPongRenderTarget.texture;
		ggxUniforms.roughness.value = 0.0; // Direct copy
		ggxUniforms.mipInt.value = _lodMax - lodOut; // Read from the level we just wrote

		_setViewport( cubeUVRenderTarget, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( cubeUVRenderTarget );
		renderer.render( ggxMesh, _flatCamera );

	}

	/**
	 * This is a two-pass Gaussian blur for a cubemap. Normally this is done
	 * vertically and horizontally, but this breaks down on a cube. Here we apply
	 * the blur latitudinally (around the poles), and then longitudinally (towards
	 * the poles) to approximate the orthogonally-separable blur. It is least
	 * accurate at the poles, but still does a decent job.
	 *
	 * Used for initial scene blur in fromScene() method when sigma > 0.
	 *
	 * @private
	 * @param {RenderTarget} cubeUVRenderTarget - The cubemap render target.
	 * @param {number} lodIn - The input level-of-detail.
	 * @param {number} lodOut - The output level-of-detail.
	 * @param {number} sigma - The blur radius in radians.
	 * @param {Vector3} [poleAxis] - The pole axis.
	 */
	_blur( cubeUVRenderTarget, lodIn, lodOut, sigma, poleAxis ) {

		const pingPongRenderTarget = this._pingPongRenderTarget;

		this._halfBlur(
			cubeUVRenderTarget,
			pingPongRenderTarget,
			lodIn,
			lodOut,
			sigma,
			'latitudinal',
			poleAxis );

		this._halfBlur(
			pingPongRenderTarget,
			cubeUVRenderTarget,
			lodOut,
			lodOut,
			sigma,
			'longitudinal',
			poleAxis );

	}

	_halfBlur( targetIn, targetOut, lodIn, lodOut, sigmaRadians, direction, poleAxis ) {

		const renderer = this._renderer;
		const blurMaterial = this._blurMaterial;

		if ( direction !== 'latitudinal' && direction !== 'longitudinal' ) {

			error( 'blur direction must be either latitudinal or longitudinal!' );

		}

		// Number of standard deviations at which to cut off the discrete approximation.
		const STANDARD_DEVIATIONS = 3;

		const blurMesh = this._lodMeshes[ lodOut ];
		blurMesh.material = blurMaterial;

		const blurUniforms = _uniformsMap.get( blurMaterial );

		const pixels = this._sizeLods[ lodIn ] - 1;
		const radiansPerPixel = isFinite( sigmaRadians ) ? Math.PI / ( 2 * pixels ) : 2 * Math.PI / ( 2 * MAX_SAMPLES - 1 );
		const sigmaPixels = sigmaRadians / radiansPerPixel;
		const samples = isFinite( sigmaRadians ) ? 1 + Math.floor( STANDARD_DEVIATIONS * sigmaPixels ) : MAX_SAMPLES;

		if ( samples > MAX_SAMPLES ) {

			warn( `sigmaRadians, ${
				sigmaRadians}, is too large and will clip, as it requested ${
				samples} samples when the maximum is set to ${MAX_SAMPLES}` );

		}

		const weights = [];
		let sum = 0;

		for ( let i = 0; i < MAX_SAMPLES; ++ i ) {

			const x = i / sigmaPixels;
			const weight = Math.exp( - x * x / 2 );
			weights.push( weight );

			if ( i === 0 ) {

				sum += weight;

			} else if ( i < samples ) {

				sum += 2 * weight;

			}

		}

		for ( let i = 0; i < weights.length; i ++ ) {

			weights[ i ] = weights[ i ] / sum;

		}

		targetIn.texture.frame = ( targetIn.texture.frame || 0 ) + 1;

		blurUniforms.envMap.value = targetIn.texture;
		blurUniforms.samples.value = samples;
		blurUniforms.weights.array = weights;
		blurUniforms.latitudinal.value = direction === 'latitudinal' ? 1 : 0;

		if ( poleAxis ) {

			blurUniforms.poleAxis.value = poleAxis;

		}

		const { _lodMax } = this;
		blurUniforms.dTheta.value = radiansPerPixel;
		blurUniforms.mipInt.value = _lodMax - lodIn;

		const outputSize = this._sizeLods[ lodOut ];
		const x = 3 * outputSize * ( lodOut > _lodMax - LOD_MIN ? lodOut - _lodMax + LOD_MIN : 0 );
		const y = 4 * ( this._cubeSize - outputSize );

		_setViewport( targetOut, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( targetOut );
		renderer.render( blurMesh, _flatCamera );

	}

}

function _createPlanes( lodMax ) {

	const sizeLods = [];
	const sigmas = [];
	const lodMeshes = [];

	let lod = lodMax;

	const totalLods = lodMax - LOD_MIN + 1 + EXTRA_LOD_SIGMA.length;

	for ( let i = 0; i < totalLods; i ++ ) {

		const sizeLod = Math.pow( 2, lod );
		sizeLods.push( sizeLod );
		let sigma = 1.0 / sizeLod;

		if ( i > lodMax - LOD_MIN ) {

			sigma = EXTRA_LOD_SIGMA[ i - lodMax + LOD_MIN - 1 ];

		} else if ( i === 0 ) {

			sigma = 0;

		}

		sigmas.push( sigma );

		const texelSize = 1.0 / ( sizeLod - 2 );
		const min = - texelSize;
		const max = 1 + texelSize;
		const uv1 = [ min, min, max, min, max, max, min, min, max, max, min, max ];

		const cubeFaces = 6;
		const vertices = 6;
		const positionSize = 3;
		const uvSize = 2;
		const faceIndexSize = 1;

		const position = new Float32Array( positionSize * vertices * cubeFaces );
		const uv = new Float32Array( uvSize * vertices * cubeFaces );
		const faceIndex = new Float32Array( faceIndexSize * vertices * cubeFaces );

		for ( let face = 0; face < cubeFaces; face ++ ) {

			const x = ( face % 3 ) * 2 / 3 - 1;
			const y = face > 2 ? 0 : - 1;
			const coordinates = [
				x, y, 0,
				x + 2 / 3, y, 0,
				x + 2 / 3, y + 1, 0,
				x, y, 0,
				x + 2 / 3, y + 1, 0,
				x, y + 1, 0
			];

			const faceIdx = _faceLib[ face ];
			position.set( coordinates, positionSize * vertices * faceIdx );
			uv.set( uv1, uvSize * vertices * faceIdx );
			const fill = [ faceIdx, faceIdx, faceIdx, faceIdx, faceIdx, faceIdx ];
			faceIndex.set( fill, faceIndexSize * vertices * faceIdx );

		}

		const planes = new BufferGeometry();
		planes.setAttribute( 'position', new BufferAttribute( position, positionSize ) );
		planes.setAttribute( 'uv', new BufferAttribute( uv, uvSize ) );
		planes.setAttribute( 'faceIndex', new BufferAttribute( faceIndex, faceIndexSize ) );
		lodMeshes.push( new Mesh( planes, null ) );

		if ( lod > LOD_MIN ) {

			lod --;

		}

	}

	return { lodMeshes, sizeLods, sigmas };

}

function _createRenderTarget( width, height ) {

	const params = {
		magFilter: LinearFilter,
		minFilter: LinearFilter,
		generateMipmaps: false,
		type: HalfFloatType,
		format: RGBAFormat,
		colorSpace: LinearSRGBColorSpace,
		//depthBuffer: false
	};

	const cubeUVRenderTarget = new RenderTarget( width, height, params );
	cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;
	cubeUVRenderTarget.texture.name = 'PMREM.cubeUv';
	cubeUVRenderTarget.texture.isPMREMTexture = true;
	cubeUVRenderTarget.scissorTest = true;
	return cubeUVRenderTarget;

}

function _setViewport( target, x, y, width, height ) {

	target.viewport.set( x, y, width, height );
	target.scissor.set( x, y, width, height );

}

function _getMaterial( type ) {

	const material = new NodeMaterial();
	material.depthTest = false;
	material.depthWrite = false;
	material.blending = NoBlending;
	material.name = `PMREM_${ type }`;

	return material;

}

function _getBlurShader( lodMax, width, height ) {

	const weights = uniformArray( new Array( MAX_SAMPLES ).fill( 0 ) );
	const poleAxis = uniform( new Vector3( 0, 1, 0 ) );
	const dTheta = uniform( 0 );
	const n = float( MAX_SAMPLES );
	const latitudinal = uniform( 0 ); // false, bool
	const samples = uniform( 1 ); // int
	const envMap = texture();
	const mipInt = uniform( 0 ); // int
	const CUBEUV_TEXEL_WIDTH = float( 1 / width );
	const CUBEUV_TEXEL_HEIGHT = float( 1 / height );
	const CUBEUV_MAX_MIP = float( lodMax );

	const materialUniforms = {
		n,
		latitudinal,
		weights,
		poleAxis,
		outputDirection: _outputDirection,
		dTheta,
		samples,
		envMap,
		mipInt,
		CUBEUV_TEXEL_WIDTH,
		CUBEUV_TEXEL_HEIGHT,
		CUBEUV_MAX_MIP
	};

	const material = _getMaterial( 'blur' );
	material.fragmentNode = blur( { ...materialUniforms, latitudinal: latitudinal.equal( 1 ) } );

	_uniformsMap.set( material, materialUniforms );

	return material;

}

function _getGGXShader( lodMax, width, height ) {

	const envMap = texture();
	const roughness = uniform( 0 );
	const mipInt = uniform( 0 );
	const CUBEUV_TEXEL_WIDTH = float( 1 / width );
	const CUBEUV_TEXEL_HEIGHT = float( 1 / height );
	const CUBEUV_MAX_MIP = float( lodMax );

	const materialUniforms = {
		envMap,
		roughness,
		mipInt,
		CUBEUV_TEXEL_WIDTH,
		CUBEUV_TEXEL_HEIGHT,
		CUBEUV_MAX_MIP
	};

	const material = _getMaterial( 'ggx' );
	material.fragmentNode = ggxConvolution( {
		...materialUniforms,
		N_immutable: _outputDirection,
		GGX_SAMPLES: uint( GGX_SAMPLES )
	} );

	_uniformsMap.set( material, materialUniforms );

	return material;

}

function _getCubemapMaterial( envTexture ) {

	const material = _getMaterial( 'cubemap' );
	material.fragmentNode = cubeTexture( envTexture, _outputDirection );

	return material;

}

function _getEquirectMaterial( envTexture ) {

	const material = _getMaterial( 'equirect' );
	material.fragmentNode = texture( envTexture, equirectUV( _outputDirection ), 0 );

	return material;

}

export default PMREMGenerator;
