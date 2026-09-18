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
} from '../constants.js';

import { Mesh } from '../objects/Mesh.js';
import { BoxGeometry } from '../geometries/BoxGeometry.js';
import { CubeCamera } from '../cameras/CubeCamera.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { Color } from '../math/Color.js';
import { floorPowerOfTwo } from '../math/MathUtils.js';
import { Vector3 } from '../math/Vector3.js';
import { ShaderChunk } from '../renderers/shaders/ShaderChunk.js';
import { WebGLCubeRenderTarget } from '../renderers/WebGLCubeRenderTarget.js';

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
	 * @param {WebGLRenderer} renderer - The renderer.
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
	 * @return {WebGLCubeRenderTarget} The resulting PMREM.
	 */
	fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {

		const {
			size = 256,
			position = _origin,
		} = options;

		const renderer = this._renderer;

		this._setSize( size );

		const pmremTarget = this._allocateTarget();
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
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512), as this matches best
	 * with the 256 x 256 cubemap output. Smaller inputs are upsampled.
	 *
	 * @param {Texture} equirectangular - The equirectangular texture to be converted.
	 * @param {?WebGLCubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {WebGLCubeRenderTarget} The resulting PMREM.
	 */
	fromEquirectangular( equirectangular, renderTarget = null ) {

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Generates a PMREM from a cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256, as this matches best
	 * with the 256 x 256 cubemap output. Smaller inputs are upsampled.
	 *
	 * @param {Texture} cubemap - The cubemap texture to be converted.
	 * @param {?WebGLCubeRenderTarget} [renderTarget=null] - The render target to use.
	 * @return {WebGLCubeRenderTarget} The resulting PMREM.
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

	_compileMaterial( material ) {

		this._boxMesh.material = material;
		this._renderer.compile( this._boxMesh, this._cubeCamera.children[ 0 ] );

	}

	/**
	 * Renders the box mesh with the given material into all six faces of a cube render target.
	 *
	 * @private
	 * @param {WebGLCubeRenderTarget} target - The render target.
	 * @param {number} lod - The mip level to render into.
	 * @param {ShaderMaterial} material - The material.
	 */
	_renderCube( target, lod, material ) {

		const boxMesh = this._boxMesh;
		const cubeCamera = this._cubeCamera;

		boxMesh.material = material;

		cubeCamera.renderTarget = target;
		cubeCamera.activeMipmapLevel = lod;

		// the renderer takes the viewport from the render target, so it has to match the mip level

		const size = target.width >> lod;

		target.viewport.set( 0, 0, size, size );

		cubeCamera.update( this._renderer, boxMesh );

		target.viewport.set( 0, 0, target.width, target.height );

	}

	_textureToCubemap( texture ) {

		let material;

		if ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ) {

			if ( this._cubemapMaterial === null ) {

				this._cubemapMaterial = _getCubemapMaterial();

			}

			material = this._cubemapMaterial;
			material.uniforms.flipEnvMap.value = ( texture.isRenderTargetTexture === false ) ? - 1 : 1;

		} else {

			if ( this._equirectMaterial === null ) {

				this._equirectMaterial = _getEquirectMaterial();

			}

			material = this._equirectMaterial;

		}

		material.uniforms.envMap.value = texture;

		this._renderCube( this._getSourceTarget(), 0, material );

	}

	/**
	 * Prefilters the source cubemap into the mip levels of the PMREM. The sharp levels
	 * integrate the GGX lobe of their roughness with VNDF importance sampling, reading the
	 * mip level of the source that matches the solid angle of each sample. The rough
	 * levels weight every texel of a small source mip with the GGX lobe instead.
	 *
	 * @private
	 * @param {WebGLCubeRenderTarget} pmremTarget - The PMREM.
	 */
	_applyPMREM( pmremTarget ) {

		if ( this._ggxMaterial === null ) {

			this._ggxMaterial = _getGGXMaterial();
			this._integrationMaterial = _getIntegrationMaterial();

		}

		const size = this._cubeSize;
		const maxLod = pmremTarget.texture.mipmaps.length - 1;

		const ggxUniforms = this._ggxMaterial.uniforms;
		ggxUniforms[ 'envMap' ].value = this._sourceTarget.texture;

		const integrationUniforms = this._integrationMaterial.uniforms;
		integrationUniforms[ 'envMap' ].value = this._sourceTarget.texture;
		integrationUniforms[ 'sourceLod' ].value = Math.log2( size / INTEGRATION_SIZE );

		for ( let lod = 0; lod <= maxLod; lod ++ ) {

			const roughness = PMREMGenerator.lodToRoughness( lod, maxLod );

			if ( lod > maxLod - INTEGRATION_LEVELS ) {

				integrationUniforms[ 'roughness' ].value = roughness;

				this._renderCube( pmremTarget, lod, this._integrationMaterial );

			} else {

				// lod of the source mip whose texel matches a sample's solid angle 1 / ( GGX_SAMPLES * pdf ), with
				// pdf( L ) = D( H ) / 4 for V = N and half a level toward the blurrier mip to hide residual sample
				// noise. The shader only adds log2 of the GGX denominator per sample. Level 0 is a plain copy.
				const lodBias = roughness > 0 ? Math.log2( size ) + 0.5 * Math.log2( 6 / ( GGX_SAMPLES * Math.pow( roughness, 4 ) ) ) + 0.5 : 0;

				ggxUniforms[ 'roughness' ].value = roughness;
				ggxUniforms[ 'lodBias' ].value = lodBias;

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
	 * @param {WebGLCubeRenderTarget} pmremTarget - The PMREM.
	 * @param {number} sigma - The blur radius in radians.
	 */
	_blur( pmremTarget, sigma ) {

		if ( this._blurMaterial === null ) {

			this._blurMaterial = _getBlurMaterial();

		}

		const material = this._blurMaterial;
		const uniforms = material.uniforms;

		const sourceTarget = this._sourceTarget;

		// Two passes of sigma / sqrt( 2 ) compose to a blur of sigma while squaring
		// the effective sample count. Sigmas beyond PI are visually indistinguishable
		// from a uniform blur, so clamp to keep the shader math finite.
		uniforms[ 'sigma' ].value = Math.min( sigma, Math.PI ) / Math.SQRT2;

		uniforms[ 'envMap' ].value = sourceTarget.texture;
		this._renderCube( pmremTarget, 0, material );

		uniforms[ 'envMap' ].value = pmremTarget.texture;
		this._renderCube( sourceTarget, 0, material );

	}

}

function _createRenderTarget( size, generateMipmaps, depthBuffer ) {

	return new WebGLCubeRenderTarget( size, {
		magFilter: LinearFilter,
		minFilter: LinearMipmapLinearFilter,
		generateMipmaps: generateMipmaps,
		type: HalfFloatType,
		format: RGBAFormat,
		colorSpace: LinearSRGBColorSpace,
		depthBuffer: depthBuffer
	} );

}

function _getMaterial( name, uniforms, fragmentShader ) {

	return new ShaderMaterial( {

		name: name,

		uniforms: uniforms,

		vertexShader: ShaderChunk.cube_vert,
		fragmentShader: fragmentShader,

		side: BackSide,
		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

}

function _getGGXMaterial() {

	return _getMaterial( 'PMREMGGXConvolution', {
		'envMap': { value: null },
		'roughness': { value: 0 },
		'lodBias': { value: 0 }
	}, /* glsl */`

		#define GGX_SAMPLES ${ GGX_SAMPLES }u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Filtered importance sampling: read the source mip whose texel solid angle
					// matches the solid angle covered by this sample, which keeps the estimate
					// smooth even for tiny, very bright light sources. Only the GGX denominator
					// varies per sample, the rest of the lod is precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	` );

}

function _getIntegrationMaterial() {

	return _getMaterial( 'PMREMGGXIntegration', {
		'envMap': { value: null },
		'roughness': { value: 0 },
		'sourceLod': { value: 0 },
		'sourceSize': { value: INTEGRATION_SIZE } // a uniform so the loops aren't unrolled
	}, /* glsl */`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	` );

}

function _getBlurMaterial() {

	return _getMaterial( 'PMREMSphericalGaussianBlur', {
		'envMap': { value: null },
		'sigma': { value: 0 }
	}, /* glsl */`

		#define SAMPLES ${ BLUR_SAMPLES }
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	` );

}

function _getEquirectMaterial() {

	return _getMaterial( 'PMREMEquirectangularToCubemap', {
		'envMap': { value: null }
	}, /* glsl */`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	` );

}

function _getCubemapMaterial() {

	return _getMaterial( 'PMREMCubemapToCubemap', {
		'envMap': { value: null },
		'flipEnvMap': { value: - 1 }
	}, /* glsl */`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	` );

}

export { PMREMGenerator };
