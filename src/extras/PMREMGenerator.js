import {
	CubeReflectionMapping,
	CubeRefractionMapping,
	CubeUVReflectionMapping,
	LinearFilter,
	NoToneMapping,
	NoBlending,
	RGBAFormat,
	HalfFloatType,
	BackSide,
	LinearSRGBColorSpace
} from '../constants.js';

import { BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Mesh } from '../objects/Mesh.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';
import { WebGLRenderTarget } from '../renderers/WebGLRenderTarget.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { BoxGeometry } from '../geometries/BoxGeometry.js';

const LOD_MIN = 4;

// The number of extra mips.
// Used for scene blur in fromScene() method.
const EXTRA_LODS = 6;

// The maximum length of the blur for loop. Smaller sigmas will use fewer
// samples and exit early, but not recompile the shader.
// Used for scene blur in fromScene() method.
const MAX_SAMPLES = 20;

// GGX VNDF importance sampling configuration
const GGX_SAMPLES = 256;

const _flatCamera = /*@__PURE__*/ new OrthographicCamera();
const _clearColor = /*@__PURE__*/ new Color();
let _oldTarget = null;
let _oldActiveCubeFace = 0;
let _oldActiveMipmapLevel = 0;
let _oldXrEnabled = false;

const _origin = /*@__PURE__*/ new Vector3();

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
	 * @param {WebGLRenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		this._renderer = renderer;
		this._pingPongRenderTarget = null;

		this._lodMax = 0;
		this._cubeSize = 0;
		this._sizeLods = [];
		this._lodMeshes = [];

		this._backgroundBox = null;

		this._cubemapMaterial = null;
		this._equirectMaterial = null;

		this._blurMaterial = null;
		this._ggxMaterial = null;

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
	 * @param {Vector3} [options.position=origin] - The position of the internal cube camera that renders the scene.
	 * @return {WebGLRenderTarget} The resulting PMREM.
	 */
	fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		const {
			size = 256,
			position = _origin,
		} = options;

		_oldTarget = this._renderer.getRenderTarget();
		_oldActiveCubeFace = this._renderer.getActiveCubeFace();
		_oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel();
		_oldXrEnabled = this._renderer.xr.enabled;

		this._renderer.xr.enabled = false;

		this._setSize( size );

		const cubeUVRenderTarget = this._allocateTargets();
		cubeUVRenderTarget.depthBuffer = true;

		this._sceneToCubeUV( scene, near, far, cubeUVRenderTarget, position );

		if ( sigma > 0 ) {

			this._blur( cubeUVRenderTarget, 0, 0, sigma );

		}

		this._applyPMREM( cubeUVRenderTarget );
		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512),
	 * as this matches best with the 256 x 256 cubemap output.
	 *
	 * @param {Texture} equirectangular - The equirectangular texture to be converted.
	 * @param {?WebGLRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {WebGLRenderTarget} The resulting PMREM.
	 */
	fromEquirectangular( equirectangular, renderTarget = null ) {

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Generates a PMREM from an cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256,
	 * as this matches best with the 256 x 256 cubemap output.
	 *
	 * @param {Texture} cubemap - The cubemap texture to be converted.
	 * @param {?WebGLRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {WebGLRenderTarget} The resulting PMREM.
	 */
	fromCubemap( cubemap, renderTarget = null ) {

		return this._fromTexture( cubemap, renderTarget );

	}

	/**
	 * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	compileCubemapShader() {

		if ( this._cubemapMaterial === null ) {

			this._cubemapMaterial = _getCubemapMaterial();
			this._compileMaterial( this._cubemapMaterial );

		}

	}

	/**
	 * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	compileEquirectangularShader() {

		if ( this._equirectMaterial === null ) {

			this._equirectMaterial = _getEquirectMaterial();
			this._compileMaterial( this._equirectMaterial );

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
		this._renderer.xr.enabled = _oldXrEnabled;

		outputTarget.scissorTest = false;
		_setViewport( outputTarget, 0, 0, outputTarget.width, outputTarget.height );

	}

	_fromTexture( texture, renderTarget ) {

		if ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ) {

			this._setSize( texture.image.length === 0 ? 16 : ( texture.image[ 0 ].width || texture.image[ 0 ].image.width ) );

		} else { // Equirectangular

			this._setSize( texture.image.width / 4 );

		}

		_oldTarget = this._renderer.getRenderTarget();
		_oldActiveCubeFace = this._renderer.getActiveCubeFace();
		_oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel();
		_oldXrEnabled = this._renderer.xr.enabled;

		this._renderer.xr.enabled = false;

		const cubeUVRenderTarget = renderTarget || this._allocateTargets();
		this._textureToCubeUV( texture, cubeUVRenderTarget );
		this._applyPMREM( cubeUVRenderTarget );
		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	_allocateTargets() {

		const width = 3 * Math.max( this._cubeSize, 16 * 7 );
		const height = 4 * this._cubeSize;

		const params = {
			magFilter: LinearFilter,
			minFilter: LinearFilter,
			generateMipmaps: false,
			type: HalfFloatType,
			format: RGBAFormat,
			colorSpace: LinearSRGBColorSpace,
			depthBuffer: false
		};

		const cubeUVRenderTarget = _createRenderTarget( width, height, params );

		if ( this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== width || this._pingPongRenderTarget.height !== height ) {

			if ( this._pingPongRenderTarget !== null ) {

				this._dispose();

			}

			this._pingPongRenderTarget = _createRenderTarget( width, height, params );

			const { _lodMax } = this;
			( { lodMeshes: this._lodMeshes, sizeLods: this._sizeLods } = _createPlanes( _lodMax ) );

			this._blurMaterial = _getBlurShader( _lodMax, width, height );
			this._ggxMaterial = _getGGXShader( _lodMax, width, height );

		}

		return cubeUVRenderTarget;

	}

	_compileMaterial( material ) {

		const mesh = new Mesh( new BufferGeometry(), material );
		this._renderer.compile( mesh, _flatCamera );

	}

	_sceneToCubeUV( scene, near, far, cubeUVRenderTarget, position ) {

		const fov = 90;
		const aspect = 1;
		const cubeCamera = new PerspectiveCamera( fov, aspect, near, far );
		const upSign = [ 1, - 1, 1, 1, 1, 1 ];
		const forwardSign = [ 1, 1, 1, - 1, - 1, - 1 ];
		const renderer = this._renderer;

		const originalAutoClear = renderer.autoClear;
		const toneMapping = renderer.toneMapping;
		renderer.getClearColor( _clearColor );

		renderer.toneMapping = NoToneMapping;
		renderer.autoClear = false;

		// https://github.com/mrdoob/three.js/issues/31413#issuecomment-3095966812
		const reversedDepthBuffer = renderer.state.buffers.depth.getReversed();

		if ( reversedDepthBuffer ) {

			renderer.setRenderTarget( cubeUVRenderTarget );
			renderer.clearDepth();
			renderer.setRenderTarget( null );

		}

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

			renderer.setRenderTarget( cubeUVRenderTarget );

			if ( useSolidColor ) {

				renderer.render( backgroundBox, cubeCamera );

			}

			renderer.render( scene, cubeCamera );

		}

		renderer.toneMapping = toneMapping;
		renderer.autoClear = originalAutoClear;
		scene.background = background;

	}

	_textureToCubeUV( texture, cubeUVRenderTarget ) {

		const renderer = this._renderer;

		const isCubeTexture = ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping );

		if ( isCubeTexture ) {

			if ( this._cubemapMaterial === null ) {

				this._cubemapMaterial = _getCubemapMaterial();

			}

			this._cubemapMaterial.uniforms.flipEnvMap.value = ( texture.isRenderTargetTexture === false ) ? - 1 : 1;

		} else {

			if ( this._equirectMaterial === null ) {

				this._equirectMaterial = _getEquirectMaterial();

			}

		}

		const material = isCubeTexture ? this._cubemapMaterial : this._equirectMaterial;

		const mesh = this._lodMeshes[ 0 ];
		mesh.material = material;

		const uniforms = material.uniforms;

		uniforms[ 'envMap' ].value = texture;

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
	 * @param {WebGLRenderTarget} cubeUVRenderTarget
	 * @param {number} lodIn - Source LOD level to read from
	 * @param {number} lodOut - Target LOD level to write to
	 */
	_applyGGXFilter( cubeUVRenderTarget, lodIn, lodOut ) {

		const renderer = this._renderer;
		const pingPongRenderTarget = this._pingPongRenderTarget;

		const ggxMaterial = this._ggxMaterial;
		const ggxMesh = this._lodMeshes[ lodOut ];
		ggxMesh.material = ggxMaterial;

		const ggxUniforms = ggxMaterial.uniforms;

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
		ggxUniforms[ 'envMap' ].value = cubeUVRenderTarget.texture;
		ggxUniforms[ 'roughness' ].value = adjustedRoughness;
		ggxUniforms[ 'mipInt' ].value = _lodMax - lodIn; // Sample from input LOD

		_setViewport( pingPongRenderTarget, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( pingPongRenderTarget );
		renderer.render( ggxMesh, _flatCamera );

		// Copy from pingPong back to cubeUV (simple direct copy)
		ggxUniforms[ 'envMap' ].value = pingPongRenderTarget.texture;
		ggxUniforms[ 'roughness' ].value = 0.0; // Direct copy
		ggxUniforms[ 'mipInt' ].value = _lodMax - lodOut; // Read from the level we just wrote

		_setViewport( cubeUVRenderTarget, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( cubeUVRenderTarget );
		renderer.render( ggxMesh, _flatCamera );

	}

	/**
	 * This is a two-pass Gaussian blur for a cubemap. The blur is performed using
	 * a spiral kernel (Golden Angle) to ensure good distribution of samples on the
	 * sphere. We perform two passes with split sigma to improve quality and smoothness.
	 *
	 * Used for initial scene blur in fromScene() method when sigma > 0.
	 *
	 * @private
	 * @param {WebGLRenderTarget} cubeUVRenderTarget
	 * @param {number} lodIn
	 * @param {number} lodOut
	 * @param {number} sigma
	 */
	_blur( cubeUVRenderTarget, lodIn, lodOut, sigma ) {

		const pingPongRenderTarget = this._pingPongRenderTarget;

		const blurSigma = Math.sqrt( sigma * sigma / 2.0 );

		this._blurPass(
			cubeUVRenderTarget,
			pingPongRenderTarget,
			lodIn,
			lodOut,
			blurSigma );

		this._blurPass(
			pingPongRenderTarget,
			cubeUVRenderTarget,
			lodOut,
			lodOut,
			blurSigma );

	}

	_blurPass( targetIn, targetOut, lodIn, lodOut, sigmaRadians ) {

		const renderer = this._renderer;
		const blurMaterial = this._blurMaterial;

		const blurMesh = this._lodMeshes[ lodOut ];
		blurMesh.material = blurMaterial;

		const blurUniforms = blurMaterial.uniforms;

		blurUniforms[ 'envMap' ].value = targetIn.texture;
		blurUniforms[ 'sigma' ].value = sigmaRadians;
		blurUniforms[ 'mipInt' ].value = this._lodMax - lodIn;

		const outputSize = this._sizeLods[ lodOut ];
		const x = 3 * outputSize * ( lodOut > this._lodMax - LOD_MIN ? lodOut - this._lodMax + LOD_MIN : 0 );
		const y = 4 * ( this._cubeSize - outputSize );

		_setViewport( targetOut, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( targetOut );
		renderer.render( blurMesh, _flatCamera );

	}

}



function _createPlanes( lodMax ) {

	const sizeLods = [];
	const lodMeshes = [];

	let lod = lodMax;

	const totalLods = lodMax - LOD_MIN + 1 + EXTRA_LODS;

	for ( let i = 0; i < totalLods; i ++ ) {

		const sizeLod = Math.pow( 2, lod );
		sizeLods.push( sizeLod );

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
		const outputDirection = new Float32Array( 3 * vertices * cubeFaces );

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
			position.set( coordinates, positionSize * vertices * face );
			uv.set( uv1, uvSize * vertices * face );

			for ( let i = 0; i < vertices; i ++ ) {

				const u = uv1[ i * 2 ];
				const v = uv1[ i * 2 + 1 ];
				const vec = new Vector3();

				// logic matching _getCommonVertexShader
				const x = u * 2 - 1;
				const y = v * 2 - 1;
				const z = 1;

				if ( face === 0 ) {

					vec.set( 1, y, x );

				} else if ( face === 1 ) {

					vec.set( - x, 1, - y );

				} else if ( face === 2 ) {

					vec.set( - x, y, 1 );

				} else if ( face === 3 ) {

					vec.set( - 1, y, - x );

				} else if ( face === 4 ) {

					vec.set( - x, - 1, y );

				} else {

					vec.set( x, y, - 1 );

				}

				vec.toArray( outputDirection, ( face * vertices + i ) * 3 );

			}

		}

		const planes = new BufferGeometry();
		planes.setAttribute( 'position', new BufferAttribute( position, positionSize ) );
		planes.setAttribute( 'uv', new BufferAttribute( uv, uvSize ) );
		planes.setAttribute( 'outputDirection', new BufferAttribute( outputDirection, 3 ) );
		lodMeshes.push( new Mesh( planes, null ) );

		if ( lod > LOD_MIN ) {

			lod --;

		}

	}

	return { lodMeshes, sizeLods };

}

function _createRenderTarget( width, height, params ) {

	const cubeUVRenderTarget = new WebGLRenderTarget( width, height, params );
	cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;
	cubeUVRenderTarget.texture.name = 'PMREM.cubeUv';
	cubeUVRenderTarget.scissorTest = true;
	return cubeUVRenderTarget;

}

function _setViewport( target, x, y, width, height ) {

	target.viewport.set( x, y, width, height );
	target.scissor.set( x, y, width, height );

}

function _getGGXShader( lodMax, width, height ) {

	const shaderMaterial = new ShaderMaterial( {

		name: 'PMREMGGXConvolution',

		defines: {
			'GGX_SAMPLES': GGX_SAMPLES,
			'CUBEUV_TEXEL_WIDTH': 1.0 / width,
			'CUBEUV_TEXEL_HEIGHT': 1.0 / height,
			'CUBEUV_MAX_MIP': `${lodMax}.0`,
		},

		uniforms: {
			'envMap': { value: null },
			'roughness': { value: 0.0 },
			'mipInt': { value: 0 }
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

	return shaderMaterial;

}

function _getBlurShader( lodMax, width, height ) {

	const shaderMaterial = new ShaderMaterial( {

		name: 'SphericalGaussianBlur',

		defines: {
			'n': MAX_SAMPLES,
			'CUBEUV_TEXEL_WIDTH': 1.0 / width,
			'CUBEUV_TEXEL_HEIGHT': 1.0 / height,
			'CUBEUV_MAX_MIP': `${lodMax}.0`,
		},

		uniforms: {
			'envMap': { value: null },
			'sigma': { value: 0 },
			'mipInt': { value: 0 },
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );
				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Golden angle
				float phi = 0.0;
				const float goldenAngle = 2.3999632;

				// Precompute sine/cosine of golden angle for incremental rotation
				float sinPhi = sin( goldenAngle );
				float cosPhi = cos( goldenAngle );

				// Initial rotation (phi = 0)
				float cp = 1.0;
				float sp = 0.0;

				for ( int i = 0; i < n; i ++ ) {

					// Spiral radius (0 to 1)
					float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
					
					// Map radius to theta (spread)
					// 3 sigma covers ~99.7% of the gaussian
					float theta = r * 3.0 * sigma;

					// Calculate axis of rotation in tangent plane
					// axis = -sin(phi) * tangent + cos(phi) * bitangent
					vec3 axis = - sp * tangent + cp * bitangent;

					// Rotate N around axis by theta
					// Since N is perpendicular to axis, simplified Rodrigues formula:
					// result = N * cos(theta) + cross(axis, N) * sin(theta)
					// cross(axis, N) = sin(phi) * bitangent + cos(phi) * tangent = dir
					// So result = N * cos(theta) + dir * sin(theta)
					
					// However, we can compute the offset vector directly in tangent space
					// offset = ( tangent * cp + bitangent * sp ) * sin( theta );
					
					float sinTheta = sin( theta );
					float cosTheta = cos( theta );
					
					vec3 sampleDir = outputDirection * cosTheta + ( tangent * cp + bitangent * sp ) * sinTheta;

					// Gaussian weight
					// We sample 'n' points. We assume they are area-weighted by the spiral pattern.
					// We just need the gaussian falloff.
					float w = exp( - 0.5 * ( theta * theta ) / ( sigma * sigma ) );

					accumColor += w * bilinearCubeUV( envMap, normalize( sampleDir ), mipInt );
					accumWeight += w;

					// Update phi for next sample
					float cp_next = cp * cosPhi - sp * sinPhi;
					float sp_next = sp * cosPhi + cp * sinPhi;
					cp = cp_next;
					sp = sp_next;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

	return shaderMaterial;

}

function _getEquirectMaterial() {

	return new ShaderMaterial( {

		name: 'EquirectangularToCubeUV',

		uniforms: {
			'envMap': { value: null }
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

}

function _getCubemapMaterial() {

	return new ShaderMaterial( {

		name: 'CubemapToCubeUV',

		uniforms: {
			'envMap': { value: null },
			'flipEnvMap': { value: - 1 }
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

}

function _getCommonVertexShader() {

	return /* glsl */`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`;

}

export { PMREMGenerator };
