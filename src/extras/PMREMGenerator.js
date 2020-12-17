import {
	CubeUVReflectionMapping,
	GammaEncoding,
	LinearEncoding,
	NoToneMapping,
	NearestFilter,
	NoBlending,
	RGBDEncoding,
	RGBEEncoding,
	RGBEFormat,
	RGBM16Encoding,
	RGBM7Encoding,
	UnsignedByteType,
	sRGBEncoding
} from '../constants.js';

import { BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Mesh } from '../objects/Mesh.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { RawShaderMaterial } from '../materials/RawShaderMaterial.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';
import { WebGLRenderTarget } from '../renderers/WebGLRenderTarget.js';

const LOD_MIN = 4;
const LOD_MAX = 8;
const SIZE_MAX = Math.pow( 2, LOD_MAX );

// The standard deviations (radians) associated with the extra mips. These are
// chosen to approximate a Trowbridge-Reitz distribution function times the
// geometric shadowing function. These sigma values squared must match the
// variance #defines in cube_uv_reflection_fragment.glsl.js.
const EXTRA_LOD_SIGMA = [ 0.125, 0.215, 0.35, 0.446, 0.526, 0.582 ];

const TOTAL_LODS = LOD_MAX - LOD_MIN + 1 + EXTRA_LOD_SIGMA.length;

// The maximum length of the blur for loop. Smaller sigmas will use fewer
// samples and exit early, but not recompile the shader.
const MAX_SAMPLES = 20;

const ENCODINGS = {
	[ LinearEncoding ]: 0,
	[ sRGBEncoding ]: 1,
	[ RGBEEncoding ]: 2,
	[ RGBM7Encoding ]: 3,
	[ RGBM16Encoding ]: 4,
	[ RGBDEncoding ]: 5,
	[ GammaEncoding ]: 6
};

const _flatCamera = /*@__PURE__*/ new OrthographicCamera();
const { _lodPlanes, _sizeLods, _sigmas } = /*@__PURE__*/ _createPlanes();
const _clearColor = /*@__PURE__*/ new Color();
let _oldTarget = null;

// Golden Ratio
const PHI = ( 1 + Math.sqrt( 5 ) ) / 2;
const INV_PHI = 1 / PHI;

// Vertices of a dodecahedron (except the opposites, which represent the
// same axis), used as axis directions evenly spread on a sphere.
const _axisDirections = [
	/*@__PURE__*/ new Vector3( 1, 1, 1 ),
	/*@__PURE__*/ new Vector3( - 1, 1, 1 ),
	/*@__PURE__*/ new Vector3( 1, 1, - 1 ),
	/*@__PURE__*/ new Vector3( - 1, 1, - 1 ),
	/*@__PURE__*/ new Vector3( 0, PHI, INV_PHI ),
	/*@__PURE__*/ new Vector3( 0, PHI, - INV_PHI ),
	/*@__PURE__*/ new Vector3( INV_PHI, 0, PHI ),
	/*@__PURE__*/ new Vector3( - INV_PHI, 0, PHI ),
	/*@__PURE__*/ new Vector3( PHI, INV_PHI, 0 ),
	/*@__PURE__*/ new Vector3( - PHI, INV_PHI, 0 ) ];

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
 */

class PMREMGenerator {

	constructor( renderer ) {

		this._renderer = renderer;
		this._pingPongRenderTarget = null;

		this._blurMaterial = _getBlurShader( MAX_SAMPLES );
		this._equirectShader = null;
		this._cubemapShader = null;

		this._compileMaterial( this._blurMaterial );

	}

	/**
	 * Generates a PMREM from a supplied Scene, which can be faster than using an
	 * image if networking bandwidth is low. Optional sigma specifies a blur radius
	 * in radians to be applied to the scene before PMREM generation. Optional near
	 * and far planes ensure the scene is rendered in its entirety (the cubeCamera
	 * is placed at the origin).
	 */
	fromScene( scene, sigma = 0, near = 0.1, far = 100 ) {

		_oldTarget = this._renderer.getRenderTarget();
		const cubeUVRenderTarget = this._allocateTargets();

		this._sceneToCubeUV( scene, near, far, cubeUVRenderTarget );
		if ( sigma > 0 ) {

			this._blur( cubeUVRenderTarget, 0, 0, sigma );

		}

		this._applyPMREM( cubeUVRenderTarget );
		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * (RGBFormat) or HDR (RGBEFormat). The ideal input image size is 1k (1024 x 512),
	 * as this matches best with the 256 x 256 cubemap output.
	 */
	fromEquirectangular( equirectangular ) {

		return this._fromTexture( equirectangular );

	}

	/**
	 * Generates a PMREM from an cubemap texture, which can be either LDR
	 * (RGBFormat) or HDR (RGBEFormat). The ideal input cube size is 256 x 256,
	 * as this matches best with the 256 x 256 cubemap output.
	 */
	fromCubemap( cubemap ) {

		return this._fromTexture( cubemap );

	}

	/**
	 * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	compileCubemapShader() {

		if ( this._cubemapShader === null ) {

			this._cubemapShader = _getCubemapShader();
			this._compileMaterial( this._cubemapShader );

		}

	}

	/**
	 * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	compileEquirectangularShader() {

		if ( this._equirectShader === null ) {

			this._equirectShader = _getEquirectShader();
			this._compileMaterial( this._equirectShader );

		}

	}

	/**
	 * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
	 * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
	 * one of them will cause any others to also become unusable.
	 */
	dispose() {

		this._blurMaterial.dispose();

		if ( this._cubemapShader !== null ) this._cubemapShader.dispose();
		if ( this._equirectShader !== null ) this._equirectShader.dispose();

		for ( let i = 0; i < _lodPlanes.length; i ++ ) {

			_lodPlanes[ i ].dispose();

		}

	}

	// private interface

	_cleanup( outputTarget ) {

		this._pingPongRenderTarget.dispose();
		this._renderer.setRenderTarget( _oldTarget );
		outputTarget.scissorTest = false;
		_setViewport( outputTarget, 0, 0, outputTarget.width, outputTarget.height );

	}

	_fromTexture( texture ) {

		_oldTarget = this._renderer.getRenderTarget();
		const cubeUVRenderTarget = this._allocateTargets( texture );
		this._textureToCubeUV( texture, cubeUVRenderTarget );
		this._applyPMREM( cubeUVRenderTarget );
		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	_allocateTargets( texture ) { // warning: null texture is valid

		const params = {
			magFilter: NearestFilter,
			minFilter: NearestFilter,
			generateMipmaps: false,
			type: UnsignedByteType,
			format: RGBEFormat,
			encoding: _isLDR( texture ) ? texture.encoding : RGBEEncoding,
			depthBuffer: false
		};

		const cubeUVRenderTarget = _createRenderTarget( params );
		cubeUVRenderTarget.depthBuffer = texture ? false : true;
		this._pingPongRenderTarget = _createRenderTarget( params );
		return cubeUVRenderTarget;

	}

	_compileMaterial( material ) {

		const tmpMesh = new Mesh( _lodPlanes[ 0 ], material );
		this._renderer.compile( tmpMesh, _flatCamera );

	}

	_sceneToCubeUV( scene, near, far, cubeUVRenderTarget ) {

		const fov = 90;
		const aspect = 1;
		const cubeCamera = new PerspectiveCamera( fov, aspect, near, far );
		const upSign = [ 1, - 1, 1, 1, 1, 1 ];
		const forwardSign = [ 1, 1, 1, - 1, - 1, - 1 ];
		const renderer = this._renderer;

		const outputEncoding = renderer.outputEncoding;
		const toneMapping = renderer.toneMapping;
		renderer.getClearColor( _clearColor );
		const clearAlpha = renderer.getClearAlpha();

		renderer.toneMapping = NoToneMapping;
		renderer.outputEncoding = LinearEncoding;

		let background = scene.background;
		if ( background && background.isColor ) {

			background.convertSRGBToLinear();
			// Convert linear to RGBE
			const maxComponent = Math.max( background.r, background.g, background.b );
			const fExp = Math.min( Math.max( Math.ceil( Math.log2( maxComponent ) ), - 128.0 ), 127.0 );
			background = background.multiplyScalar( Math.pow( 2.0, - fExp ) );
			const alpha = ( fExp + 128.0 ) / 255.0;
			renderer.setClearColor( background, alpha );
			scene.background = null;

		}

		for ( let i = 0; i < 6; i ++ ) {

			const col = i % 3;
			if ( col == 0 ) {

				cubeCamera.up.set( 0, upSign[ i ], 0 );
				cubeCamera.lookAt( forwardSign[ i ], 0, 0 );

			} else if ( col == 1 ) {

				cubeCamera.up.set( 0, 0, upSign[ i ] );
				cubeCamera.lookAt( 0, forwardSign[ i ], 0 );

			} else {

				cubeCamera.up.set( 0, upSign[ i ], 0 );
				cubeCamera.lookAt( 0, 0, forwardSign[ i ] );

			}

			_setViewport( cubeUVRenderTarget,
				col * SIZE_MAX, i > 2 ? SIZE_MAX : 0, SIZE_MAX, SIZE_MAX );
			renderer.setRenderTarget( cubeUVRenderTarget );
			renderer.render( scene, cubeCamera );

		}

		renderer.toneMapping = toneMapping;
		renderer.outputEncoding = outputEncoding;
		renderer.setClearColor( _clearColor, clearAlpha );

	}

	_textureToCubeUV( texture, cubeUVRenderTarget ) {

		const renderer = this._renderer;

		if ( texture.isCubeTexture ) {

			if ( this._cubemapShader == null ) {

				this._cubemapShader = _getCubemapShader();

			}

		} else {

			if ( this._equirectShader == null ) {

				this._equirectShader = _getEquirectShader();

			}

		}

		const material = texture.isCubeTexture ? this._cubemapShader : this._equirectShader;
		const mesh = new Mesh( _lodPlanes[ 0 ], material );

		const uniforms = material.uniforms;

		uniforms[ 'envMap' ].value = texture;

		if ( ! texture.isCubeTexture ) {

			uniforms[ 'texelSize' ].value.set( 1.0 / texture.image.width, 1.0 / texture.image.height );

		}

		uniforms[ 'inputEncoding' ].value = ENCODINGS[ texture.encoding ];
		uniforms[ 'outputEncoding' ].value = ENCODINGS[ cubeUVRenderTarget.texture.encoding ];

		_setViewport( cubeUVRenderTarget, 0, 0, 3 * SIZE_MAX, 2 * SIZE_MAX );

		renderer.setRenderTarget( cubeUVRenderTarget );
		renderer.render( mesh, _flatCamera );

	}

	_applyPMREM( cubeUVRenderTarget ) {

		const renderer = this._renderer;
		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		for ( let i = 1; i < TOTAL_LODS; i ++ ) {

			const sigma = Math.sqrt( _sigmas[ i ] * _sigmas[ i ] - _sigmas[ i - 1 ] * _sigmas[ i - 1 ] );

			const poleAxis = _axisDirections[ ( i - 1 ) % _axisDirections.length ];

			this._blur( cubeUVRenderTarget, i - 1, i, sigma, poleAxis );

		}

		renderer.autoClear = autoClear;

	}

	/**
	 * This is a two-pass Gaussian blur for a cubemap. Normally this is done
	 * vertically and horizontally, but this breaks down on a cube. Here we apply
	 * the blur latitudinally (around the poles), and then longitudinally (towards
	 * the poles) to approximate the orthogonally-separable blur. It is least
	 * accurate at the poles, but still does a decent job.
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

			console.error(
				'blur direction must be either latitudinal or longitudinal!' );

		}

		// Number of standard deviations at which to cut off the discrete approximation.
		const STANDARD_DEVIATIONS = 3;

		const blurMesh = new Mesh( _lodPlanes[ lodOut ], blurMaterial );
		const blurUniforms = blurMaterial.uniforms;

		const pixels = _sizeLods[ lodIn ] - 1;
		const radiansPerPixel = isFinite( sigmaRadians ) ? Math.PI / ( 2 * pixels ) : 2 * Math.PI / ( 2 * MAX_SAMPLES - 1 );
		const sigmaPixels = sigmaRadians / radiansPerPixel;
		const samples = isFinite( sigmaRadians ) ? 1 + Math.floor( STANDARD_DEVIATIONS * sigmaPixels ) : MAX_SAMPLES;

		if ( samples > MAX_SAMPLES ) {

			console.warn( `sigmaRadians, ${
				sigmaRadians}, is too large and will clip, as it requested ${
				samples} samples when the maximum is set to ${MAX_SAMPLES}` );

		}

		const weights = [];
		let sum = 0;

		for ( let i = 0; i < MAX_SAMPLES; ++ i ) {

			const x = i / sigmaPixels;
			const weight = Math.exp( - x * x / 2 );
			weights.push( weight );

			if ( i == 0 ) {

				sum += weight;

			} else if ( i < samples ) {

				sum += 2 * weight;

			}

		}

		for ( let i = 0; i < weights.length; i ++ ) {

			weights[ i ] = weights[ i ] / sum;

		}

		blurUniforms[ 'envMap' ].value = targetIn.texture;
		blurUniforms[ 'samples' ].value = samples;
		blurUniforms[ 'weights' ].value = weights;
		blurUniforms[ 'latitudinal' ].value = direction === 'latitudinal';

		if ( poleAxis ) {

			blurUniforms[ 'poleAxis' ].value = poleAxis;

		}

		blurUniforms[ 'dTheta' ].value = radiansPerPixel;
		blurUniforms[ 'mipInt' ].value = LOD_MAX - lodIn;
		blurUniforms[ 'inputEncoding' ].value = ENCODINGS[ targetIn.texture.encoding ];
		blurUniforms[ 'outputEncoding' ].value = ENCODINGS[ targetIn.texture.encoding ];

		const outputSize = _sizeLods[ lodOut ];
		const x = 3 * Math.max( 0, SIZE_MAX - 2 * outputSize );
		const y = ( lodOut === 0 ? 0 : 2 * SIZE_MAX ) + 2 * outputSize * ( lodOut > LOD_MAX - LOD_MIN ? lodOut - LOD_MAX + LOD_MIN : 0 );

		_setViewport( targetOut, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( targetOut );
		renderer.render( blurMesh, _flatCamera );

	}

}

function _isLDR( texture ) {

	if ( texture === undefined || texture.type !== UnsignedByteType ) return false;

	return texture.encoding === LinearEncoding || texture.encoding === sRGBEncoding || texture.encoding === GammaEncoding;

}

function _createPlanes() {

	const _lodPlanes = [];
	const _sizeLods = [];
	const _sigmas = [];

	let lod = LOD_MAX;

	for ( let i = 0; i < TOTAL_LODS; i ++ ) {

		const sizeLod = Math.pow( 2, lod );
		_sizeLods.push( sizeLod );
		let sigma = 1.0 / sizeLod;

		if ( i > LOD_MAX - LOD_MIN ) {

			sigma = EXTRA_LOD_SIGMA[ i - LOD_MAX + LOD_MIN - 1 ];

		} else if ( i == 0 ) {

			sigma = 0;

		}

		_sigmas.push( sigma );

		const texelSize = 1.0 / ( sizeLod - 1 );
		const min = - texelSize / 2;
		const max = 1 + texelSize / 2;
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
			position.set( coordinates, positionSize * vertices * face );
			uv.set( uv1, uvSize * vertices * face );
			const fill = [ face, face, face, face, face, face ];
			faceIndex.set( fill, faceIndexSize * vertices * face );

		}

		const planes = new BufferGeometry();
		planes.setAttribute( 'position', new BufferAttribute( position, positionSize ) );
		planes.setAttribute( 'uv', new BufferAttribute( uv, uvSize ) );
		planes.setAttribute( 'faceIndex', new BufferAttribute( faceIndex, faceIndexSize ) );
		_lodPlanes.push( planes );

		if ( lod > LOD_MIN ) {

			lod --;

		}

	}

	return { _lodPlanes, _sizeLods, _sigmas };

}

function _createRenderTarget( params ) {

	const cubeUVRenderTarget = new WebGLRenderTarget( 3 * SIZE_MAX, 3 * SIZE_MAX, params );
	cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;
	cubeUVRenderTarget.texture.name = 'PMREM.cubeUv';
	cubeUVRenderTarget.scissorTest = true;
	return cubeUVRenderTarget;

}

function _setViewport( target, x, y, width, height ) {

	target.viewport.set( x, y, width, height );
	target.scissor.set( x, y, width, height );

}

function _getBlurShader( maxSamples ) {

	const weights = new Float32Array( maxSamples );
	const poleAxis = new Vector3( 0, 1, 0 );
	const shaderMaterial = new RawShaderMaterial( {

		name: 'SphericalGaussianBlur',

		defines: { 'n': maxSamples },

		uniforms: {
			'envMap': { value: null },
			'samples': { value: 1 },
			'weights': { value: weights },
			'latitudinal': { value: false },
			'dTheta': { value: 0 },
			'mipInt': { value: 0 },
			'poleAxis': { value: poleAxis },
			'inputEncoding': { value: ENCODINGS[ LinearEncoding ] },
			'outputEncoding': { value: ENCODINGS[ LinearEncoding ] }
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			${ _getEncodings() }

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

				gl_FragColor = linearToOutputTexel( gl_FragColor );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

	return shaderMaterial;

}

function _getEquirectShader() {

	const texelSize = new Vector2( 1, 1 );
	const shaderMaterial = new RawShaderMaterial( {

		name: 'EquirectangularToCubeUV',

		uniforms: {
			'envMap': { value: null },
			'texelSize': { value: texelSize },
			'inputEncoding': { value: ENCODINGS[ LinearEncoding ] },
			'outputEncoding': { value: ENCODINGS[ LinearEncoding ] }
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform vec2 texelSize;

			${ _getEncodings() }

			#include <common>

			void main() {

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				vec2 f = fract( uv / texelSize - 0.5 );
				uv -= f * texelSize;
				vec3 tl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.x += texelSize.x;
				vec3 tr = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.y += texelSize.y;
				vec3 br = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.x -= texelSize.x;
				vec3 bl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;

				vec3 tm = mix( tl, tr, f.x );
				vec3 bm = mix( bl, br, f.x );
				gl_FragColor.rgb = mix( tm, bm, f.y );

				gl_FragColor = linearToOutputTexel( gl_FragColor );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

	return shaderMaterial;

}

function _getCubemapShader() {

	const shaderMaterial = new RawShaderMaterial( {

		name: 'CubemapToCubeUV',

		uniforms: {
			'envMap': { value: null },
			'inputEncoding': { value: ENCODINGS[ LinearEncoding ] },
			'outputEncoding': { value: ENCODINGS[ LinearEncoding ] }
		},

		vertexShader: _getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			${ _getEncodings() }

			void main() {

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb = envMapTexelToLinear( textureCube( envMap, vec3( - vOutputDirection.x, vOutputDirection.yz ) ) ).rgb;
				gl_FragColor = linearToOutputTexel( gl_FragColor );

			}
		`,

		blending: NoBlending,
		depthTest: false,
		depthWrite: false

	} );

	return shaderMaterial;

}

function _getCommonVertexShader() {

	return /* glsl */`

		precision mediump float;
		precision mediump int;

		attribute vec3 position;
		attribute vec2 uv;
		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;

}

function _getEncodings() {

	return /* glsl */`

		uniform int inputEncoding;
		uniform int outputEncoding;

		#include <encodings_pars_fragment>

		vec4 inputTexelToLinear( vec4 value ) {

			if ( inputEncoding == 0 ) {

				return value;

			} else if ( inputEncoding == 1 ) {

				return sRGBToLinear( value );

			} else if ( inputEncoding == 2 ) {

				return RGBEToLinear( value );

			} else if ( inputEncoding == 3 ) {

				return RGBMToLinear( value, 7.0 );

			} else if ( inputEncoding == 4 ) {

				return RGBMToLinear( value, 16.0 );

			} else if ( inputEncoding == 5 ) {

				return RGBDToLinear( value, 256.0 );

			} else {

				return GammaToLinear( value, 2.2 );

			}

		}

		vec4 linearToOutputTexel( vec4 value ) {

			if ( outputEncoding == 0 ) {

				return value;

			} else if ( outputEncoding == 1 ) {

				return LinearTosRGB( value );

			} else if ( outputEncoding == 2 ) {

				return LinearToRGBE( value );

			} else if ( outputEncoding == 3 ) {

				return LinearToRGBM( value, 7.0 );

			} else if ( outputEncoding == 4 ) {

				return LinearToRGBM( value, 16.0 );

			} else if ( outputEncoding == 5 ) {

				return LinearToRGBD( value, 256.0 );

			} else {

				return LinearToGamma( value, 2.2 );

			}

		}

		vec4 envMapTexelToLinear( vec4 color ) {

			return inputTexelToLinear( color );

		}
	`;

}

export { PMREMGenerator };
