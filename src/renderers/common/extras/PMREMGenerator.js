import NodeMaterial from '../../../materials/nodes/NodeMaterial.js';
import { sphericalGaussianBlur, ggxConvolution, ggxIntegration } from '../../../nodes/pmrem/PMREMUtils.js';
import { equirectUV } from '../../../nodes/utils/EquirectUV.js';
import { positionWorldDirection } from '../../../nodes/accessors/Position.js';
import { uniform } from '../../../nodes/core/UniformNode.js';
import { texture } from '../../../nodes/accessors/TextureNode.js';
import { cubeTexture } from '../../../nodes/accessors/CubeTextureNode.js';
import { int, uint } from '../../../nodes/tsl/TSLBase.js';

import { Color } from '../../../math/Color.js';
import { floorPowerOfTwo } from '../../../math/MathUtils.js';
import { Vector3 } from '../../../math/Vector3.js';
import { Mesh } from '../../../objects/Mesh.js';
import { BoxGeometry } from '../../../geometries/BoxGeometry.js';
import { CubeCamera } from '../../../cameras/CubeCamera.js';
import CubeRenderTarget from '../CubeRenderTarget.js';
import {
	CubeReflectionMapping,
	CubeRefractionMapping,
	LinearFilter,
	LinearMipmapLinearFilter,
	NoBlending,
	RGBAFormat,
	HalfFloatType,
	BackSide,
	LinearSRGBColorSpace
} from '../../../constants.js';
import { warnOnce } from '../../../utils.js';

// Smaller inputs are upsampled so that every PMREM has enough mip levels.
const MIN_SIZE = 256;

// Log2 of the face size of the roughest mip level. Smaller faces can't
// represent the diffuse irradiance that is stored in this level.
const LOD_MIN = 3;

// The number of spiral samples per blur pass.
// Used for scene blur in fromScene() method.
const BLUR_SAMPLES = 20;

// GGX VNDF importance sampling configuration for the sharp mip levels.
const GGX_SAMPLES = 256;

// The rough mip levels integrate every texel of this source mip instead, which is
// noise free and cheaper than the many samples their wide lobes would need.
const INTEGRATION_SIZE = 16;
const INTEGRATION_LEVELS = 3;

const _origin = /*@__PURE__*/ new Vector3();
const _clearColor = /*@__PURE__*/ new Color();

// maps materials to their uniforms dictionary

const _uniformsMap = new WeakMap();

/**
 * This class generates a Prefiltered, Mipmapped Radiance Environment Map
 * (PMREM) from a cubeMap environment texture. This allows different levels of
 * blur to be quickly accessed based on material roughness. The result is a
 * cube render target whose mip levels hold the environment prefiltered for
 * increasing roughness values, from a mirror-like level 0 down to a level
 * that represents roughness 1. The roughness of a mip level is defined by
 * {@link PMREMGenerator.lodToRoughness}.
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

		this._cubeSize = 0;
		this._sourceTarget = null;

		this._cubeCamera = new CubeCamera( 1, 10, null );
		this._boxMesh = new Mesh( new BoxGeometry( 5, 5, 5 ), null );

		this._cubemapMaterial = null;
		this._equirectMaterial = null;

		this._blurMaterial = null;
		this._ggxMaterial = null;
		this._integrationMaterial = null;

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
	 * @param {number} [options.size=256] - The texture size of the PMREM, rounded down to a power of two and at least 256.
	 * @param {Vector3} [options.position=origin] - The position of the internal cube camera that renders the scene.
	 * @param {?CubeRenderTarget} [options.renderTarget=null] - The render target to use.
	 * @return {CubeRenderTarget} The resulting PMREM.
	 */
	fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		const {
			size = 256,
			position = _origin,
			renderTarget = null,
		} = options;

		const renderer = this._renderer;

		this._setSize( size );

		if ( this._hasInitialized === false ) {

			throw new Error( 'THREE.PMREMGenerator: .fromScene() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

		}

		const pmremTarget = renderTarget || this._allocateTarget();
		const sourceTarget = this._getSourceTarget();

		if ( sigma > 0 ) {

			// Allocate the full mip chain before disabling mipmap generation for the capture.
			renderer.initRenderTarget( sourceTarget );
			sourceTarget.texture.generateMipmaps = false;

		}

		// clear each face with the scene background or the clear color, whatever the app's clear settings are

		const autoClear = renderer.autoClear;
		const autoClearColor = renderer.autoClearColor;
		const autoClearDepth = renderer.autoClearDepth;
		const autoClearStencil = renderer.autoClearStencil;
		const background = scene.background;

		renderer.autoClear = true;
		renderer.autoClearColor = true;
		renderer.autoClearDepth = true;
		renderer.autoClearStencil = true;

		if ( background === null ) scene.background = renderer.getClearColor( _clearColor );

		const cubeCamera = new CubeCamera( near, far, sourceTarget );
		cubeCamera.position.copy( position );
		cubeCamera.update( renderer, scene );

		renderer.autoClear = autoClear;
		renderer.autoClearColor = autoClearColor;
		renderer.autoClearDepth = autoClearDepth;
		renderer.autoClearStencil = autoClearStencil;

		scene.background = background;

		if ( sigma > 0 ) {

			sourceTarget.texture.generateMipmaps = true;
			this._blur( pmremTarget, sigma );

		}

		this._applyPMREM( pmremTarget );

		return pmremTarget;

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
	 * @param {number} [options.size=256] - The texture size of the PMREM, rounded down to a power of two and at least 256.
	 * @param {Vector3} [options.position=origin] - The position of the internal cube camera that renders the scene.
	 * @param {?CubeRenderTarget} [options.renderTarget=null] - The render target to use.
	 * @return {Promise<CubeRenderTarget>} A Promise that resolve with the PMREM when the generation has been finished.
	 * @see {@link PMREMGenerator#fromScene}
	 */
	async fromSceneAsync( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		warnOnce( 'PMREMGenerator: ".fromSceneAsync()" is deprecated. Use "await renderer.init()" instead.' ); // @deprecated r181

		await this._renderer.init();

		return this.fromScene( scene, sigma, near, far, options );

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512), as this matches best
	 * with the 256 x 256 cubemap output. Smaller inputs are upsampled.
	 *
	 * @param {Texture} equirectangular - The equirectangular texture to be converted.
	 * @param {?CubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {CubeRenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromEquirectangularAsync}
	 */
	fromEquirectangular( equirectangular, renderTarget = null ) {

		if ( this._hasInitialized === false ) {

			throw new Error( 'THREE.PMREMGenerator: .fromEquirectangular() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

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
	 * @param {?CubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {Promise<CubeRenderTarget>} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromEquirectangular}
	 */
	async fromEquirectangularAsync( equirectangular, renderTarget = null ) {

		warnOnce( 'PMREMGenerator: ".fromEquirectangularAsync()" is deprecated. Use "await renderer.init()" instead.' ); // @deprecated r181

		await this._renderer.init();

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Generates a PMREM from a cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256, as this matches best
	 * with the 256 x 256 cubemap output. Smaller inputs are upsampled.
	 *
	 * @param {Texture} cubemap - The cubemap texture to be converted.
	 * @param {?CubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {CubeRenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromCubemapAsync}
	 */
	fromCubemap( cubemap, renderTarget = null ) {

		if ( this._hasInitialized === false ) {

			throw new Error( 'THREE.PMREMGenerator: .fromCubemap() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

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
	 * @param {?CubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {Promise<CubeRenderTarget>} The resulting PMREM.
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
	 * Disposes of the PMREMGenerator's internal memory. The PMREMs it returned
	 * belong to the caller and are not disposed.
	 */
	dispose() {

		if ( this._sourceTarget !== null ) this._sourceTarget.dispose();

		if ( this._cubemapMaterial !== null ) this._cubemapMaterial.dispose();
		if ( this._equirectMaterial !== null ) this._equirectMaterial.dispose();
		if ( this._blurMaterial !== null ) this._blurMaterial.dispose();
		if ( this._ggxMaterial !== null ) this._ggxMaterial.dispose();
		if ( this._integrationMaterial !== null ) this._integrationMaterial.dispose();

		this._boxMesh.geometry.dispose();

	}

	/**
	 * Returns the roughness a mip level of a PMREM has been prefiltered for.
	 * The inverse mapping is used by the renderers when sampling a PMREM.
	 *
	 * @param {number} lod - The mip level.
	 * @param {number} maxLod - The last mip level of the PMREM.
	 * @return {number} The roughness.
	 */
	static lodToRoughness( lod, maxLod ) {

		return maxLod > 0 ? 1 - Math.sqrt( 1 - lod / maxLod ) : 0;

	}

	// private interface

	_setSize( cubeSize ) {

		this._cubeSize = Math.max( MIN_SIZE, floorPowerOfTwo( cubeSize ) );

	}

	_fromTexture( texture, renderTarget ) {

		if ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ) {

			this._setSize( texture.image.length === 0 ? 16 : ( texture.image[ 0 ].width || texture.image[ 0 ].image.width ) );

		} else { // Equirectangular

			this._setSize( texture.image.width / 4 );

		}

		const pmremTarget = renderTarget || this._allocateTarget();

		this._textureToCubemap( texture );
		this._applyPMREM( pmremTarget );

		return pmremTarget;

	}

	_allocateTarget() {

		const size = this._cubeSize;

		const pmremTarget = _createRenderTarget( size, false, false );

		// One entry per prefiltered mip level. The renderer allocates exactly these
		// levels and, unlike with generateMipmaps, never overwrites them.

		for ( let lod = 0; lod <= Math.log2( size ) - LOD_MIN; lod ++ ) {

			pmremTarget.texture.mipmaps.push( { width: size >> lod, height: size >> lod } );

		}

		pmremTarget.texture.name = 'PMREM';
		pmremTarget.texture.isPMREMTexture = true;

		return pmremTarget;

	}

	_getSourceTarget() {

		const size = this._cubeSize;
		const sourceTarget = this._sourceTarget;

		if ( sourceTarget === null || sourceTarget.width !== size ) {

			if ( sourceTarget !== null ) sourceTarget.dispose();

			this._sourceTarget = _createRenderTarget( size, true, true );

		}

		return this._sourceTarget;

	}

	async _compileMaterial( material ) {

		this._boxMesh.material = material;
		await this._renderer.compile( this._boxMesh, this._cubeCamera.children[ 0 ] );

	}

	/**
	 * Renders the box mesh with the given material into all six faces of a cube render target.
	 *
	 * @private
	 * @param {CubeRenderTarget} target - The render target.
	 * @param {number} lod - The mip level to render into.
	 * @param {NodeMaterial} material - The material.
	 */
	_renderCube( target, lod, material ) {

		const boxMesh = this._boxMesh;
		const cubeCamera = this._cubeCamera;

		boxMesh.material = material;

		cubeCamera.renderTarget = target;
		cubeCamera.activeMipmapLevel = lod;
		cubeCamera.update( this._renderer, boxMesh );

	}

	_textureToCubemap( texture ) {

		let material;

		if ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ) {

			if ( this._cubemapMaterial === null ) {

				this._cubemapMaterial = _getCubemapMaterial();

			}

			material = this._cubemapMaterial;

		} else {

			if ( this._equirectMaterial === null ) {

				this._equirectMaterial = _getEquirectMaterial();

			}

			material = this._equirectMaterial;

		}

		_uniformsMap.get( material ).envMap.value = texture;

		this._renderCube( this._getSourceTarget(), 0, material );

	}

	/**
	 * Prefilters the source cubemap into the mip levels of the PMREM. The sharp levels
	 * integrate the GGX lobe of their roughness with VNDF importance sampling, reading the
	 * mip level of the source that matches the solid angle of each sample. The rough
	 * levels weight every texel of a small source mip with the GGX lobe instead.
	 *
	 * @private
	 * @param {CubeRenderTarget} pmremTarget - The PMREM.
	 */
	_applyPMREM( pmremTarget ) {

		if ( this._ggxMaterial === null ) {

			this._ggxMaterial = _getGGXMaterial();
			this._integrationMaterial = _getIntegrationMaterial();

		}

		const size = this._cubeSize;
		const maxLod = pmremTarget.texture.mipmaps.length - 1;

		const ggxUniforms = _uniformsMap.get( this._ggxMaterial );
		ggxUniforms.envMap.value = this._sourceTarget.texture;

		const integrationUniforms = _uniformsMap.get( this._integrationMaterial );
		integrationUniforms.envMap.value = this._sourceTarget.texture;
		integrationUniforms.sourceLod.value = Math.log2( size / INTEGRATION_SIZE );

		for ( let lod = 0; lod <= maxLod; lod ++ ) {

			const roughness = PMREMGenerator.lodToRoughness( lod, maxLod );

			if ( lod > maxLod - INTEGRATION_LEVELS ) {

				integrationUniforms.roughness.value = roughness;

				this._renderCube( pmremTarget, lod, this._integrationMaterial );

			} else {

				// lod of the source mip whose texel matches a sample's solid angle 1 / ( GGX_SAMPLES * pdf ), with
				// pdf( L ) = D( H ) / 4 for V = N and half a level toward the blurrier mip to hide residual sample
				// noise. The shader only adds log2 of the GGX denominator per sample. Level 0 is a plain copy.
				const lodBias = roughness > 0 ? Math.log2( size ) + 0.5 * Math.log2( 6 / ( GGX_SAMPLES * Math.pow( roughness, 4 ) ) ) + 0.5 : 0;

				ggxUniforms.roughness.value = roughness;
				ggxUniforms.lodBias.value = lodBias;

				this._renderCube( pmremTarget, lod, this._ggxMaterial );

			}

		}

	}

	/**
	 * This is a two-pass Gaussian blur for a cubemap. Each pass importance-samples
	 * the Gaussian along a spiral kernel (Golden Angle), which distributes samples
	 * isotropically on the sphere (no pole artifacts).
	 *
	 * Used for initial scene blur in fromScene() method when sigma > 0. Level 0 of
	 * the PMREM serves as the intermediate target.
	 *
	 * @private
	 * @param {CubeRenderTarget} pmremTarget - The PMREM.
	 * @param {number} sigma - The blur radius in radians.
	 */
	_blur( pmremTarget, sigma ) {

		if ( this._blurMaterial === null ) {

			this._blurMaterial = _getBlurMaterial();

		}

		const material = this._blurMaterial;
		const uniforms = _uniformsMap.get( material );

		const sourceTarget = this._sourceTarget;

		// Two passes of sigma / sqrt( 2 ) compose to a blur of sigma while squaring
		// the effective sample count. Sigmas beyond PI are visually indistinguishable
		// from a uniform blur, so clamp to keep the shader math finite.
		uniforms.sigma.value = Math.min( sigma, Math.PI ) / Math.SQRT2;

		uniforms.envMap.value = sourceTarget.texture;
		this._renderCube( pmremTarget, 0, material );

		uniforms.envMap.value = pmremTarget.texture;
		this._renderCube( sourceTarget, 0, material );

	}

}

function _createRenderTarget( size, generateMipmaps, depthBuffer ) {

	return new CubeRenderTarget( size, {
		magFilter: LinearFilter,
		minFilter: LinearMipmapLinearFilter,
		generateMipmaps: generateMipmaps,
		type: HalfFloatType,
		format: RGBAFormat,
		colorSpace: LinearSRGBColorSpace,
		depthBuffer: depthBuffer
	} );

}

function _getMaterial( type, uniforms, fragmentNode ) {

	const material = new NodeMaterial();
	material.name = `PMREM_${ type }`;
	material.fragmentNode = fragmentNode;
	material.side = BackSide;
	material.blending = NoBlending;
	material.depthTest = false;
	material.depthWrite = false;

	_uniformsMap.set( material, uniforms );

	return material;

}

function _getBlurMaterial() {

	const uniforms = {
		envMap: cubeTexture(),
		sigma: uniform( 0 )
	};

	return _getMaterial( 'blur', uniforms, sphericalGaussianBlur( {
		...uniforms,
		direction: positionWorldDirection,
		SAMPLES: int( BLUR_SAMPLES )
	} ) );

}

function _getGGXMaterial() {

	const uniforms = {
		envMap: cubeTexture(),
		roughness: uniform( 0 ),
		lodBias: uniform( 0 )
	};

	return _getMaterial( 'ggx', uniforms, ggxConvolution( {
		...uniforms,
		direction: positionWorldDirection,
		GGX_SAMPLES: uint( GGX_SAMPLES )
	} ) );

}

function _getIntegrationMaterial() {

	const uniforms = {
		envMap: cubeTexture(),
		roughness: uniform( 0 ),
		sourceLod: uniform( 0 ),
		sourceSize: uniform( INTEGRATION_SIZE, 'int' ) // a uniform so the loops aren't unrolled
	};

	return _getMaterial( 'integration', uniforms, ggxIntegration( {
		...uniforms,
		direction: positionWorldDirection
	} ) );

}

function _getCubemapMaterial() {

	const uniforms = {
		envMap: cubeTexture()
	};

	return _getMaterial( 'cubemap', uniforms, uniforms.envMap.sample( positionWorldDirection ) );

}

function _getEquirectMaterial() {

	const uniforms = {
		envMap: texture()
	};

	return _getMaterial( 'equirect', uniforms, uniforms.envMap.sample( equirectUV( positionWorldDirection ) ).level( 0 ) );

}

export default PMREMGenerator;
