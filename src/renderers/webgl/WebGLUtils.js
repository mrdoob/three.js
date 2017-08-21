/**
 * @author thespite / http://www.twitter.com/thespite
 * @author fernandojsg / http://fernandojsg.com
 */

import { MaxEquation, MinEquation, RGB_ETC1_Format, RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT5_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT1_Format, RGB_S3TC_DXT1_Format, SrcAlphaSaturateFactor, OneMinusDstColorFactor, DstColorFactor, OneMinusDstAlphaFactor, DstAlphaFactor, OneMinusSrcAlphaFactor, SrcAlphaFactor, OneMinusSrcColorFactor, SrcColorFactor, OneFactor, ZeroFactor, ReverseSubtractEquation, SubtractEquation, AddEquation, DepthFormat, DepthStencilFormat, LuminanceAlphaFormat, LuminanceFormat, RGBAFormat, RGBFormat, AlphaFormat, HalfFloatType, FloatType, UnsignedIntType, IntType, UnsignedShortType, ShortType, ByteType, UnsignedInt248Type, UnsignedShort565Type, UnsignedShort5551Type, UnsignedShort4444Type, UnsignedByteType, LinearMipMapLinearFilter, LinearMipMapNearestFilter, LinearFilter, NearestMipMapLinearFilter, NearestMipMapNearestFilter, NearestFilter, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping } from '../../constants.js';
export { WebGLConstants } from './renderers/webgl/WebGLConstants.js';

function WebGLUtils( gl, extensions ) {

	function convert( p ) {

		var extension;

		var glValue = toGL( p );
		if ( typeof glValue !== 'undefined' ) {

			return glValue;

		}

		if ( p === HalfFloatType ) {

			extension = extensions.get( 'OES_texture_half_float' );

			if ( extension !== null ) return extension.HALF_FLOAT_OES;

		}

		if ( p === RGB_S3TC_DXT1_Format || p === RGBA_S3TC_DXT1_Format ||
			p === RGBA_S3TC_DXT3_Format || p === RGBA_S3TC_DXT5_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_s3tc' );

			if ( extension !== null ) {

				if ( p === RGB_S3TC_DXT1_Format ) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
				if ( p === RGBA_S3TC_DXT1_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
				if ( p === RGBA_S3TC_DXT3_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
				if ( p === RGBA_S3TC_DXT5_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;

			}

		}

		if ( p === RGB_PVRTC_4BPPV1_Format || p === RGB_PVRTC_2BPPV1_Format ||
			p === RGBA_PVRTC_4BPPV1_Format || p === RGBA_PVRTC_2BPPV1_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_pvrtc' );

			if ( extension !== null ) {

				if ( p === RGB_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				if ( p === RGB_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				if ( p === RGBA_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				if ( p === RGBA_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

			}

		}

		if ( p === RGB_ETC1_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_etc1' );

			if ( extension !== null ) return extension.COMPRESSED_RGB_ETC1_WEBGL;

		}

		if ( p === MinEquation || p === MaxEquation ) {

			extension = extensions.get( 'EXT_blend_minmax' );

			if ( extension !== null ) {

				if ( p === MinEquation ) return extension.MIN_EXT;
				if ( p === MaxEquation ) return extension.MAX_EXT;

			}

		}

		if ( p === UnsignedInt248Type ) {

			extension = extensions.get( 'WEBGL_depth_texture' );

			if ( extension !== null ) return extension.UNSIGNED_INT_24_8_WEBGL;

		}

		return 0;

	}

	return { convert: convert };

}


var THREE_TO_WEBGL = {
	// @TODO Replace with computed property name [THREE.*] when available on es6
	1003: WebGLConstants.NEAREST,
	1004: WebGLConstants.LINEAR,
	1005: WebGLConstants.NEAREST_MIPMAP_NEAREST,
	1006: WebGLConstants.LINEAR_MIPMAP_NEAREST,
	1007: WebGLConstants.NEAREST_MIPMAP_LINEAR,
	1008: WebGLConstants.LINEAR_MIPMAP_LINEAR
 };

function fromGL ( webglConstant ) {

	return WEBGL_TO_THREE[ webglConstant ];

}

var WEBGL_TO_THREE = {
	// @TODO Replace with computed property name [WEBGL_CONSTANTS.*] when available on es6

	// Types
	5126: Number,
	//35674: THREE.Matrix2,
	35675: THREE.Matrix3,
	35676: THREE.Matrix4,
	35664: THREE.Vector2,
	35665: THREE.Vector3,
	35666: THREE.Vector4,
	35678: THREE.Texture,

	// Component types
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array,

	// Filters
	9728: THREE.NearestFilter, // gl.NEAREST
	9729: THREE.LinearFilter, // gl.LINEAR
	9984: THREE.NearestMipMapNearestFilter, // gl.NEAREST_MIPMAP_NEAREST
	9985: THREE.LinearMipMapNearestFilter, // gl.LINEAR_MIPMAP_NEAREST
	9986: THREE.NearestMipMapLinearFilter, // gl.NEAREST_MIPMAP_LINEAR
	9987: THREE.LinearMipMapLinearFilter, // gl.LINEAR_MIPMAP_LINEAR

	// Wrapping
	33071: THREE.ClampToEdgeWrapping, // gl.CLAMP_TO_EDGE
	33648: THREE.MirroredRepeatWrapping, // gl.MIRRORED_REPEAT
	10497: THREE.RepeatWrapping, // gl.REPEAT

	// Texture format
	6406: THREE.AlphaFormat, // gl.ALPHA
	6407: THREE.RGBFormat, // gl.RGB
	6408: THREE.RGBAFormat, // gl.RGBA
	6409: THREE.LuminanceFormat, // gl.LUMINANCE
	6410: THREE.LuminanceAlphaFormat, // gl.LUMINANCE_ALPHA
	6402: THREE.DepthFormat, // gl.DEPTH_COMPONENT
	34041: THREE.DepthStencilFormat, // gl.DEPTH_STENCIL

	// Data types
	5120: THREE.ByteType, // gl.BYTE
	5121: THREE.UnsignedByteType, // gl.UNSIGNED_BYTE
	5122: THREE.ShortType, // gl.SHORT
	5123: THREE.UnsignedShortType, // gl.UNSIGNED_SHORT
	5124: THREE.IntType, // gl.INT
	5125: THREE.UnsignedIntType, // gl.UNSIGNED_INT
	5126: THREE.FloatType, // gl.FLOAT
	32819: THREE.UnsignedShort4444Type, // gl.UNSIGNED_SHORT_4_4_4_4
	32820: THREE.UnsignedShort5551Type, // gl.UNSIGNED_SHORT_5_5_5_1
	33635: THREE.UnsignedShort565Type, // gl.UNSIGNED_SHORT_5_6_5

	// Sides
	1028: THREE.BackSide,
	1029: THREE.FrontSide,
	//1032: THREE.NoSide,

	// Depth func
	512: THREE.NeverDepth,
	513: THREE.LessDepth,
	514: THREE.EqualDepth,
	515: THREE.LessEqualDepth,
	516: THREE.GreaterEqualDepth,
	517: THREE.NotEqualDepth,
	518: THREE.GreaterEqualDepth,
	519: THREE.AlwaysDepth,

	// Blend equations
	32774: THREE.AddEquation, // gl.FUNC_ADD
	32778: THREE.SubtractEquation, // gl.FUNC_SUBTRACT
	32779: THREE.ReverseSubtractEquation, // gl.FUNC_REVERSE_SUBTRACT


	// Blend functions
	0: THREE.ZeroFactor, // gl.ZERO
	1: THREE.OneFactor, // gl.ONE
	768: THREE.SrcColorFactor, // gl.SRC_COLOR
	769: THREE.OneMinusSrcColorFactor, // gl.ONE_MINUS_SRC_COLOR
	770: THREE.SrcAlphaFactor, // gl.SRC_ALPHA
	771: THREE.OneMinusSrcAlphaFactor, // gl.ONE_MINUS_SRC_ALPHA
	772: THREE.DstAlphaFactor, // gl.DST_ALPHA
	773: THREE.OneMinusDstAlphaFactor, // gl.ONE_MINUS_DST_ALPHA
	774: THREE.DstColorFactor, // gl.DST_COLOR
	775: THREE.OneMinusDstColorFactor, // gl.ONE_MINUS_DST_COLOR
	776: THREE.SrcAlphaSaturateFactor // gl.SRC_ALPHA_SATURATE
};


function toGL ( threeConstant ) {

	return THREE_TO_WEBGL[ threeConstant ];

}

export { WebGLUtils, toGL, fromGL };
