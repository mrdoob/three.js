/**
 * @author mrdoob / http://mrdoob.com/
 */

var THREE = { REVISION: '78' };

//

if ( typeof define === 'function' && define.amd ) {

	define( 'three', THREE );

} else if ( 'undefined' !== typeof exports && 'undefined' !== typeof module ) {

	module.exports = THREE;

}

// Polyfills

if ( Number.EPSILON === undefined ) {

	Number.EPSILON = Math.pow( 2, - 52 );

}

//

if ( Math.sign === undefined ) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

	Math.sign = function ( x ) {

		return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;

	};

}

if ( Function.prototype.name === undefined ) {

	// Missing in IE9-11.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

	Object.defineProperty( Function.prototype, 'name', {

		get: function () {

			return this.toString().match( /^\s*function\s*(\S*)\s*\(/ )[ 1 ];

		}

	} );

}

if ( Object.assign === undefined ) {

	// Missing in IE.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

	( function () {

		Object.assign = function ( target ) {

			'use strict';

			if ( target === undefined || target === null ) {

				throw new TypeError( 'Cannot convert undefined or null to object' );

			}

			var output = Object( target );

			for ( var index = 1; index < arguments.length; index ++ ) {

				var source = arguments[ index ];

				if ( source !== undefined && source !== null ) {

					for ( var nextKey in source ) {

						if ( Object.prototype.hasOwnProperty.call( source, nextKey ) ) {

							output[ nextKey ] = source[ nextKey ];

						}

					}

				}

			}

			return output;

		};

	} )();

}

//

Object.assign( THREE, {

	// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.button

	MOUSE: { LEFT: 0, MIDDLE: 1, RIGHT: 2 },

	// GL STATE CONSTANTS

	CullFaceNone: 0,
	CullFaceBack: 1,
	CullFaceFront: 2,
	CullFaceFrontBack: 3,

	FrontFaceDirectionCW: 0,
	FrontFaceDirectionCCW: 1,

	// SHADOWING TYPES

	BasicShadowMap: 0,
	PCFShadowMap: 1,
	PCFSoftShadowMap: 2,

	// MATERIAL CONSTANTS

	// side

	FrontSide: 0,
	BackSide: 1,
	DoubleSide: 2,

	// shading

	FlatShading: 1,
	SmoothShading: 2,

	// colors

	NoColors: 0,
	FaceColors: 1,
	VertexColors: 2,

	// blending modes

	NoBlending: 0,
	NormalBlending: 1,
	AdditiveBlending: 2,
	SubtractiveBlending: 3,
	MultiplyBlending: 4,
	CustomBlending: 5,

	// custom blending equations
	// (numbers start from 100 not to clash with other
	// mappings to OpenGL constants defined in Texture.js)

	AddEquation: 100,
	SubtractEquation: 101,
	ReverseSubtractEquation: 102,
	MinEquation: 103,
	MaxEquation: 104,

	// custom blending destination factors

	ZeroFactor: 200,
	OneFactor: 201,
	SrcColorFactor: 202,
	OneMinusSrcColorFactor: 203,
	SrcAlphaFactor: 204,
	OneMinusSrcAlphaFactor: 205,
	DstAlphaFactor: 206,
	OneMinusDstAlphaFactor: 207,

	// custom blending source factors

	//ZeroFactor: 200,
	//OneFactor: 201,
	//SrcAlphaFactor: 204,
	//OneMinusSrcAlphaFactor: 205,
	//DstAlphaFactor: 206,
	//OneMinusDstAlphaFactor: 207,
	DstColorFactor: 208,
	OneMinusDstColorFactor: 209,
	SrcAlphaSaturateFactor: 210,

	// depth modes

	NeverDepth: 0,
	AlwaysDepth: 1,
	LessDepth: 2,
	LessEqualDepth: 3,
	EqualDepth: 4,
	GreaterEqualDepth: 5,
	GreaterDepth: 6,
	NotEqualDepth: 7,


	// TEXTURE CONSTANTS

	MultiplyOperation: 0,
	MixOperation: 1,
	AddOperation: 2,

	// Tone Mapping modes

	NoToneMapping: 0, // do not do any tone mapping, not even exposure (required for special purpose passes.)
	LinearToneMapping: 1, // only apply exposure.
	ReinhardToneMapping: 2,
	Uncharted2ToneMapping: 3, // John Hable
	CineonToneMapping: 4, // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson

	// Mapping modes

	UVMapping: 300,

	CubeReflectionMapping: 301,
	CubeRefractionMapping: 302,

	EquirectangularReflectionMapping: 303,
	EquirectangularRefractionMapping: 304,

	SphericalReflectionMapping: 305,
	CubeUVReflectionMapping: 306,
	CubeUVRefractionMapping: 307,

	// Wrapping modes

	RepeatWrapping: 1000,
	ClampToEdgeWrapping: 1001,
	MirroredRepeatWrapping: 1002,

	// Filters

	NearestFilter: 1003,
	NearestMipMapNearestFilter: 1004,
	NearestMipMapLinearFilter: 1005,
	LinearFilter: 1006,
	LinearMipMapNearestFilter: 1007,
	LinearMipMapLinearFilter: 1008,

	// Data types

	UnsignedByteType: 1009,
	ByteType: 1010,
	ShortType: 1011,
	UnsignedShortType: 1012,
	IntType: 1013,
	UnsignedIntType: 1014,
	FloatType: 1015,
	HalfFloatType: 1025,

	// Pixel types

	//UnsignedByteType: 1009,
	UnsignedShort4444Type: 1016,
	UnsignedShort5551Type: 1017,
	UnsignedShort565Type: 1018,

	// Pixel formats

	AlphaFormat: 1019,
	RGBFormat: 1020,
	RGBAFormat: 1021,
	LuminanceFormat: 1022,
	LuminanceAlphaFormat: 1023,
	// THREE.RGBEFormat handled as THREE.RGBAFormat in shaders
	RGBEFormat: THREE.RGBAFormat, //1024;
	DepthFormat: 1026,

	// DDS / ST3C Compressed texture formats

	RGB_S3TC_DXT1_Format: 2001,
	RGBA_S3TC_DXT1_Format: 2002,
	RGBA_S3TC_DXT3_Format: 2003,
	RGBA_S3TC_DXT5_Format: 2004,

	// PVRTC compressed texture formats

	RGB_PVRTC_4BPPV1_Format: 2100,
	RGB_PVRTC_2BPPV1_Format: 2101,
	RGBA_PVRTC_4BPPV1_Format: 2102,
	RGBA_PVRTC_2BPPV1_Format: 2103,

	// ETC compressed texture formats

	RGB_ETC1_Format: 2151,

	// Loop styles for AnimationAction

	LoopOnce: 2200,
	LoopRepeat: 2201,
	LoopPingPong: 2202,

	// Interpolation

	InterpolateDiscrete: 2300,
	InterpolateLinear: 2301,
	InterpolateSmooth: 2302,

	// Interpolant ending modes

	ZeroCurvatureEnding: 2400,
	ZeroSlopeEnding: 2401,
	WrapAroundEnding: 2402,

	// Triangle Draw modes

	TrianglesDrawMode: 0,
	TriangleStripDrawMode: 1,
	TriangleFanDrawMode: 2,

	// Texture Encodings

	LinearEncoding: 3000, // No encoding at all.
	sRGBEncoding: 3001,
	GammaEncoding: 3007, // uses GAMMA_FACTOR, for backwards compatibility with WebGLRenderer.gammaInput/gammaOutput

	// The following Texture Encodings are for RGB-only (no alpha) HDR light emission sources.
	// These encodings should not specified as output encodings except in rare situations.
	RGBEEncoding: 3002, // AKA Radiance.
	LogLuvEncoding: 3003,
	RGBM7Encoding: 3004,
	RGBM16Encoding: 3005,
	RGBDEncoding: 3006, // MaxRange is 256.

	// Depth packing strategies

	BasicDepthPacking: 3200, // for writing to float textures for high precision or for visualizing results in RGB buffers
	RGBADepthPacking: 3201 // for packing into RGBA buffers.

} );
