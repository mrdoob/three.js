import NodeMaterial from '../../../materials/nodes/NodeMaterial.js';
import { sphericalGaussianBlur, ggxConvolution, ggxIntegration, ggxIntegrationTexel } from '../../../nodes/pmrem/PMREMUtils.js';
import { equirectUV } from '../../../nodes/utils/EquirectUV.js';
import { positionWorldDirection } from '../../../nodes/accessors/Position.js';
import { uniform } from '../../../nodes/core/UniformNode.js';
import { texture } from '../../../nodes/accessors/TextureNode.js';
import { cubeTexture } from '../../../nodes/accessors/CubeTextureNode.js';
import { storageTexture, textureStore } from '../../../nodes/accessors/StorageTextureNode.js';
import { globalId, workgroupId } from '../../../nodes/gpgpu/ComputeBuiltinNode.js';
import { workgroupArray } from '../../../nodes/gpgpu/WorkgroupInfoNode.js';
import { workgroupBarrier } from '../../../nodes/gpgpu/BarrierNode.js';
import { invocationLocalIndex } from '../../../nodes/core/IndexNode.js';
import { select } from '../../../nodes/math/ConditionalNode.js';
import { Loop } from '../../../nodes/utils/LoopNode.js';
import { Fn, If, float, int, uint, vec2, vec3, vec4, uvec2 } from '../../../nodes/tsl/TSLBase.js';

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
	LinearMipmapLinearFilter,
	NoBlending,
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

// Spiral samples per pass of the initial fromScene() blur.
const BLUR_SAMPLES = 20;

// GGX VNDF samples for the sharp mip levels.
const GGX_SAMPLES = 256;

// Integrate a small source mip for the rough levels to avoid sampling noise.
const INTEGRATION_SIZE = 16;
const INTEGRATION_LEVELS = 3;

// Compute path: output texels per workgroup side for the GGX levels, and threads that
// share the integration of one output texel for the rough levels.
const GGX_WORKGROUP_SIZE = 8;
const INTEGRATION_WORKGROUP_SIZE = 64;

const _origin = /*@__PURE__*/ new Vector3();
const _clearColor = /*@__PURE__*/ new Color();

// maps materials to their uniforms dictionary

const _uniformsMap = new WeakMap();

/**
 * Generates a Prefiltered, Mipmapped Radiance Environment Map (PMREM) for
 * image-based lighting. The result is a cube render target whose mip levels
 * store GGX-filtered radiance at increasing roughness, from a mirror at level 0
 * to roughness 1. See {@link PMREMGenerator.lodToRoughness} for the mapping.
 *
 * Filtering assumes the view direction equals the surface normal. Sharp levels
 * use GGX visible normal sampling (Heitz, 2018), while rough levels integrate a
 * lower-resolution source cubemap.
 *
 * @see {@link https://jcgt.org/published/0007/04/01/ | Sampling the GGX Distribution of Visible Normals}
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

		this._computeNodes = null;

	}

	/**
	 * Generates a PMREM from a scene, optionally applying a Gaussian blur before
	 * GGX filtering.
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

		if ( renderer.hasInitialized() === false ) {

			throw new Error( 'THREE.PMREMGenerator: .fromScene() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

		}

		const pmremTarget = renderTarget || this._allocateTarget();
		const sourceTarget = this._getSourceTarget( true );

		if ( sigma > 0 ) {

			sourceTarget.texture.mipmapsAutoUpdate = false;

		}

		// Clear every captured face, independent of the application's clear settings.

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

			sourceTarget.texture.mipmapsAutoUpdate = true;
			this._blur( pmremTarget, sigma );

		}

		this._applyPMREM( pmremTarget );

		return pmremTarget;

	}

	/**
	 * Asynchronous version of {@link PMREMGenerator#fromScene}.
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
	 * @return {Promise<CubeRenderTarget>} A Promise that resolves with the PMREM.
	 * @see {@link PMREMGenerator#fromScene}
	 */
	async fromSceneAsync( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		warnOnce( 'PMREMGenerator: ".fromSceneAsync()" is deprecated. Use "await renderer.init()" instead.' ); // @deprecated r181

		await this._renderer.init();

		return this.fromScene( scene, sigma, near, far, options );

	}

	/**
	 * Generates a PMREM from an LDR or HDR equirectangular texture. The cube face
	 * size is one quarter of the image width, rounded down to a power of two and
	 * at least 256.
	 *
	 * @param {Texture} equirectangular - The equirectangular texture to be converted.
	 * @param {?CubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {CubeRenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromEquirectangularAsync}
	 */
	fromEquirectangular( equirectangular, renderTarget = null ) {

		if ( this._renderer.hasInitialized() === false ) {

			throw new Error( 'THREE.PMREMGenerator: .fromEquirectangular() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

		}

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Asynchronous version of {@link PMREMGenerator#fromEquirectangular}.
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
	 * Generates a PMREM from an LDR or HDR cubemap. The cube face size matches
	 * the input, rounded down to a power of two and at least 256.
	 *
	 * @param {Texture} cubemap - The cubemap texture to be converted.
	 * @param {?CubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {CubeRenderTarget} The resulting PMREM.
	 * @see {@link PMREMGenerator#fromCubemapAsync}
	 */
	fromCubemap( cubemap, renderTarget = null ) {

		if ( this._renderer.hasInitialized() === false ) {

			throw new Error( 'THREE.PMREMGenerator: .fromCubemap() called before the backend is initialized. Use "await renderer.init();" before using this method.' );

		}

		return this._fromTexture( cubemap, renderTarget );

	}

	/**
	 * Asynchronous version of {@link PMREMGenerator#fromCubemap}.
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
		if ( this._computeNodes !== null ) this._disposeComputeNodes();

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

			this._setSize( texture.image.length === 0 ? MIN_SIZE : ( texture.image[ 0 ].width || texture.image[ 0 ].image.width ) );

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

		// Allocate only the prefiltered mip levels without automatic mipmap generation.

		const maxLod = Math.log2( size ) - LOD_MIN;

		for ( let lod = 0; lod <= maxLod; lod ++ ) {

			pmremTarget.texture.mipmaps.push( { width: size >> lod, height: size >> lod } );

		}

		pmremTarget.texture.name = 'PMREM';
		pmremTarget.texture.isPMREMTexture = true;

		if ( this._renderer.backend.isWebGPUBackend === true ) {

			// Let compute shaders write the mip levels, see _applyPMREMCompute().

			pmremTarget.texture.isStorageTexture = true;
			pmremTarget.texture.mipmapsAutoUpdate = false;

		}

		return pmremTarget;

	}

	_getSourceTarget( depthBuffer = false ) {

		const size = this._cubeSize;
		const sourceTarget = this._sourceTarget;

		if ( sourceTarget === null || sourceTarget.width !== size || ( depthBuffer && sourceTarget.depthBuffer === false ) ) {

			if ( sourceTarget !== null ) sourceTarget.dispose();

			this._sourceTarget = _createRenderTarget( size, true, depthBuffer );

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
	 * On the WebGPU backend, PMREMs allocated by the generator are filtered with compute
	 * shaders, see {@link PMREMGenerator#_applyPMREMCompute}.
	 *
	 * @private
	 * @param {CubeRenderTarget} pmremTarget - The PMREM.
	 */
	_applyPMREM( pmremTarget ) {

		if ( pmremTarget.texture.isStorageTexture === true && this._renderer.backend.isWebGPUBackend === true ) {

			this._applyPMREMCompute( pmremTarget );
			return;

		}

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

				// For V = N, pdf( L ) = D( H ) / 4. Match the source texel solid angle to
				// 1 / ( GGX_SAMPLES * pdf ), with a half-mip bias to reduce sampling noise.
				// The shader supplies log2 of the GGX denominator.
				const lodBias = roughness > 0 ? Math.log2( size ) + 0.5 * Math.log2( 6 / ( GGX_SAMPLES * Math.pow( roughness, 4 ) ) ) + 0.5 : 0;

				ggxUniforms.roughness.value = roughness;
				ggxUniforms.lodBias.value = lodBias;

				this._renderCube( pmremTarget, lod, this._ggxMaterial );

			}

		}

	}

	/**
	 * Compute shader version of {@link PMREMGenerator#_applyPMREM} with the same filtering.
	 * Each mip level is written directly into the PMREM, and the rough levels share the
	 * integration of an output texel between the threads of a workgroup.
	 *
	 * @private
	 * @param {CubeRenderTarget} pmremTarget - The PMREM.
	 */
	_applyPMREMCompute( pmremTarget ) {

		this._renderer.initRenderTarget( pmremTarget );

		const size = this._cubeSize;
		const maxLod = pmremTarget.texture.mipmaps.length - 1;

		if ( this._computeNodes === null || this._computeNodes.length !== maxLod + 1 ) {

			if ( this._computeNodes !== null ) this._disposeComputeNodes();

			this._computeNodes = [];

			for ( let lod = 0; lod <= maxLod; lod ++ ) {

				const computeNode = lod > maxLod - INTEGRATION_LEVELS ? _getIntegrationCompute( pmremTarget.texture, lod ) : _getGGXCompute( pmremTarget.texture, lod );

				this._computeNodes.push( computeNode );

			}

		}

		for ( let lod = 0; lod <= maxLod; lod ++ ) {

			const computeNode = this._computeNodes[ lod ];
			const uniforms = _uniformsMap.get( computeNode );

			const roughness = PMREMGenerator.lodToRoughness( lod, maxLod );
			const outputSize = pmremTarget.width >> lod;

			uniforms.envMap.value = this._sourceTarget.texture;
			uniforms.outputTexture.value = pmremTarget.texture;
			uniforms.outputSize.value = outputSize;
			uniforms.roughness.value = roughness;

			if ( lod > maxLod - INTEGRATION_LEVELS ) {

				uniforms.sourceLod.value = Math.log2( size / INTEGRATION_SIZE );

				computeNode.dispatchSize = [ outputSize * outputSize, 6, 1 ];

			} else {

				// See _applyPMREM().
				uniforms.lodBias.value = roughness > 0 ? Math.log2( size ) + 0.5 * Math.log2( 6 / ( GGX_SAMPLES * Math.pow( roughness, 4 ) ) ) + 0.5 : 0;

				computeNode.dispatchSize = [ Math.ceil( outputSize / GGX_WORKGROUP_SIZE ), Math.ceil( outputSize / GGX_WORKGROUP_SIZE ), 6 ];

			}

		}

		this._renderer.compute( this._computeNodes );

	}

	/**
	 * Disposes the compute nodes of {@link PMREMGenerator#_applyPMREMCompute}.
	 *
	 * @private
	 */
	_disposeComputeNodes() {

		for ( const computeNode of this._computeNodes ) computeNode.dispose();

		this._computeNodes = null;

	}

	/**
	 * Applies the initial fromScene() blur in two passes using a golden-angle
	 * spiral kernel. Level 0 of the PMREM serves as the intermediate target.
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

		// Split the blur variance between two passes. Clamp sigma to the sphere's
		// maximum angular distance.
		uniforms.sigma.value = Math.min( sigma, Math.PI ) / Math.SQRT2;

		uniforms.envMap.value = sourceTarget.texture;
		this._renderCube( pmremTarget, 0, material );

		uniforms.envMap.value = pmremTarget.texture;
		this._renderCube( sourceTarget, 0, material );

	}

}

function _createRenderTarget( size, generateMipmaps, depthBuffer ) {

	return new CubeRenderTarget( size, {
		minFilter: LinearMipmapLinearFilter,
		generateMipmaps: generateMipmaps,
		type: HalfFloatType,
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

// The world space direction through the center of a texel of a cube face, matching
// positionWorldDirection on the faces of the cube camera. Faces are +X, -X, +Y, -Y, +Z, -Z,
// so each is a major axis and a sign, and x is mirrored like three's cube textures.
const _getFaceDirection = /*@__PURE__*/ Fn( ( [ face, texel, size ] ) => {

	const uv = vec2( texel ).add( 0.5 ).div( float( size ) ).mul( 2.0 ).sub( 1.0 ).toConst();
	const u = uv.x;
	const v = uv.y;

	const axis = face.div( 2 ).toConst();
	const sign = float( 1.0 ).sub( float( face.mod( 2 ) ).mul( 2.0 ) ).toConst();

	const isX = axis.equal( 0 );
	const isY = axis.equal( 1 );
	const isZ = axis.equal( 2 );

	const x = select( isX, 1.0, u ).mul( select( isY, 1.0, sign ) );
	const y = select( isY, sign, v.negate() );
	const z = select( isZ, sign, select( isX, u.negate(), v ).mul( sign ) );

	return vec3( x.negate(), y, z ).normalize();

} );

function _getComputeUniforms( outputTexture, lod ) {

	// The environment map has an explicit uv, so building it doesn't set up its
	// default uv, the reflect vector, which needs a camera.

	return {
		envMap: cubeTexture( undefined, vec3( 0.0 ) ),
		outputTexture: storageTexture( outputTexture ).setMipLevel( lod ),
		outputSize: uniform( 0, 'uint' ),
		roughness: uniform( 0 )
	};

}

// One thread per output texel, see _getGGXMaterial().
function _getGGXCompute( outputTexture, lod ) {

	const uniforms = {
		..._getComputeUniforms( outputTexture, lod ),
		lodBias: uniform( 0 )
	};

	const computeNode = Fn( () => {

		const { envMap, roughness, lodBias, outputTexture, outputSize } = uniforms;

		const texel = globalId.xy;
		const face = globalId.z;

		const color = ggxConvolution( {
			envMap,
			roughness,
			lodBias,
			direction: _getFaceDirection( face, texel, outputSize ),
			GGX_SAMPLES: uint( GGX_SAMPLES )
		} );

		textureStore( outputTexture.depth( face ), texel, color );

	} )().computeKernel( [ GGX_WORKGROUP_SIZE, GGX_WORKGROUP_SIZE, 1 ] ).setName( `PMREM_ggx_${ lod }` );

	_uniformsMap.set( computeNode, uniforms );

	return computeNode;

}

// One workgroup per output texel, see _getIntegrationMaterial(). The threads integrate
// interleaved source texels, then sum their results in shared memory.
function _getIntegrationCompute( outputTexture, lod ) {

	const uniforms = {
		..._getComputeUniforms( outputTexture, lod ),
		sourceLod: uniform( 0 )
	};

	const computeNode = Fn( () => {

		const { envMap, roughness, sourceLod, outputTexture, outputSize } = uniforms;

		const texel = uvec2( workgroupId.x.mod( outputSize ), workgroupId.x.div( outputSize ) );
		const face = workgroupId.y;
		const localIndex = invocationLocalIndex;

		const N = _getFaceDirection( face, texel, outputSize ).toVar();

		const alpha = roughness.mul( roughness ).toConst();
		const alpha2 = alpha.mul( alpha ).toConst();

		const texelSize = float( 2.0 / INTEGRATION_SIZE ).toConst();

		const prefilteredColor = vec4( 0.0 ).toVar();

		// Three face pairs of INTEGRATION_SIZE² texels, see ggxIntegration().
		Loop( { start: localIndex, end: uint( 3 * INTEGRATION_SIZE * INTEGRATION_SIZE ), update: INTEGRATION_WORKGROUP_SIZE }, ( { i } ) => {

			const sourceFace = i.div( INTEGRATION_SIZE * INTEGRATION_SIZE );
			const x = i.mod( INTEGRATION_SIZE );
			const y = i.div( INTEGRATION_SIZE ).mod( INTEGRATION_SIZE );

			prefilteredColor.addAssign( ggxIntegrationTexel( { N, alpha2, face: sourceFace, x, y, texelSize, sourceLod, envMap } ) );

		} );

		const sums = workgroupArray( 'vec4', INTEGRATION_WORKGROUP_SIZE );
		sums.element( localIndex ).assign( prefilteredColor );

		for ( let stride = INTEGRATION_WORKGROUP_SIZE >> 1; stride > 0; stride >>= 1 ) {

			workgroupBarrier();

			If( localIndex.lessThan( stride ), () => {

				sums.element( localIndex ).addAssign( sums.element( localIndex.add( stride ) ) );

			} );

		}

		If( localIndex.equal( 0 ), () => {

			const sum = sums.element( uint( 0 ) );

			textureStore( outputTexture.depth( face ), texel, vec4( sum.rgb.div( sum.a ), 1.0 ) );

		} );

	} )().computeKernel( [ INTEGRATION_WORKGROUP_SIZE ] ).setName( `PMREM_integration_${ lod }` );

	_uniformsMap.set( computeNode, uniforms );

	return computeNode;

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

	const fragmentNode = Fn( () => {

		// Average four subpixel samples to preserve small, bright features.
		const direction = positionWorldDirection;
		const dx = direction.dFdx().mul( 0.25 ).toConst();
		const dy = direction.dFdy().mul( 0.25 ).toConst();

		const color = uniforms.envMap.sample( equirectUV( direction.sub( dx ).sub( dy ).normalize() ) ).level( 0 ).rgb
			.add( uniforms.envMap.sample( equirectUV( direction.add( dx ).sub( dy ).normalize() ) ).level( 0 ).rgb )
			.add( uniforms.envMap.sample( equirectUV( direction.sub( dx ).add( dy ).normalize() ) ).level( 0 ).rgb )
			.add( uniforms.envMap.sample( equirectUV( direction.add( dx ).add( dy ).normalize() ) ).level( 0 ).rgb );

		return vec4( color.mul( 0.25 ), 1.0 );

	} )();

	return _getMaterial( 'equirect', uniforms, fragmentNode );

}

export default PMREMGenerator;
