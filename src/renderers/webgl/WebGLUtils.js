/**
 * @author thespite / http://www.twitter.com/thespite
 * @author fernandojsg / http://fernandojsg.com
 */
 /* jshint esversion: 6 */

import * as Constants from '../../constants';
import { WebGLConstants } from './WebGLConstants';

//------------------------------------------------------------------------------
// THREE TO WEBGL
//------------------------------------------------------------------------------
var THREE_TO_WEBGL = {

	[ Constants.NearestFilter ]: WebGLConstants.NEAREST,
	[ Constants.LinearFilter ]: WebGLConstants.LINEAR,
	[ Constants.NearestMipMapNearestFilter ]: WebGLConstants.NEAREST_MIPMAP_NEAREST,
	[ Constants.LinearMipMapNearestFilter ]: WebGLConstants.LINEAR_MIPMAP_NEAREST,
	[ Constants.NearestMipMapLinearFilter ]: WebGLConstants.NEAREST_MIPMAP_LINEAR,
	[ Constants.LinearMipMapLinearFilter ]: WebGLConstants.LINEAR_MIPMAP_LINEAR,

	[ Constants.RepeatWrapping ]: WebGLConstants.REPEAT,
	[ Constants.ClampToEdgeWrapping ]: WebGLConstants.CLAMP_TO_EDGE,
	[ Constants.MirroredRepeatWrapping ]: WebGLConstants.MIRRORED_REPEAT,

	[ Constants.NearestFilter ]: WebGLConstants.NEAREST,
	[ Constants.NearestMipMapNearestFilter ]: WebGLConstants.NEAREST_MIPMAP_NEAREST,
	[ Constants.NearestMipMapLinearFilter ]: WebGLConstants.NEAREST_MIPMAP_LINEAR,

	[ Constants.LinearFilter ]: WebGLConstants.LINEAR,
	[ Constants.LinearMipMapNearestFilter ]: WebGLConstants.LINEAR_MIPMAP_NEAREST,
	[ Constants.LinearMipMapLinearFilter ]: WebGLConstants.LINEAR_MIPMAP_LINEAR,

	[ Constants.UnsignedByteType ]: WebGLConstants.UNSIGNED_BYTE,
	[ Constants.UnsignedShort4444Type ]: WebGLConstants.UNSIGNED_SHORT_4_4_4_4,
	[ Constants.UnsignedShort5551Type ]: WebGLConstants.UNSIGNED_SHORT_5_5_5_1,
	[ Constants.UnsignedShort565Type ]: WebGLConstants.UNSIGNED_SHORT_5_6_5,

	[ Constants.ByteType ]: WebGLConstants.BYTE,
	[ Constants.ShortType ]: WebGLConstants.SHORT,
	[ Constants.UnsignedShortType ]: WebGLConstants.UNSIGNED_SHORT,
	[ Constants.IntType ]: WebGLConstants.INT,
	[ Constants.UnsignedIntType ]: WebGLConstants.UNSIGNED_INT,
	[ Constants.FloatType ]: WebGLConstants.FLOAT,

	[ Constants.AlphaFormat ]: WebGLConstants.ALPHA,
	[ Constants.RGBFormat ]: WebGLConstants.RGB,
	[ Constants.RGBAFormat ]: WebGLConstants.RGBA,
	[ Constants.LuminanceFormat ]: WebGLConstants.LUMINANCE,
	[ Constants.LuminanceAlphaFormat ]: WebGLConstants.LUMINANCE_ALPHA,
	[ Constants.DepthFormat ]: WebGLConstants.DEPTH_COMPONENT,
	[ Constants.DepthStencilFormat ]: WebGLConstants.DEPTH_STENCIL,

	[ Constants.AddEquation ]: WebGLConstants.FUNC_ADD,
	[ Constants.SubtractEquation ]: WebGLConstants.FUNC_SUBSTRACT,
	[ Constants.ReverseSubtractEquation ]: WebGLConstants.FUNC_REVERSE_SUBTRACT,

	[ Constants.ZeroFactor ]: WebGLConstants.ZERO,
	[ Constants.OneFactor ]: WebGLConstants.ONE,
	[ Constants.SrcColorFactor ]: WebGLConstants.SRC_COLOR,
	[ Constants.OneMinusSrcColorFactor ]: WebGLConstants.ONE_MINUS_SRC_COLOR,
	[ Constants.SrcAlphaFactor ]: WebGLConstants.SRC_ALPHA,
	[ Constants.OneMinusSrcAlphaFactor ]: WebGLConstants.ONE_MINUS_SRC_ALPHA,
	[ Constants.DstAlphaFactor ]: WebGLConstants.DST_ALPHA,
	[ Constants.OneMinusDstAlphaFactor ]: WebGLConstants.ONE_MINUS_DST_ALPHA,

	[ Constants.DstColorFactor ]: WebGLConstants.DST_COLOR,
	[ Constants.OneMinusDstColorFactor ]: WebGLConstants.ONE_MINUS_DST_COLOR,
	[ Constants.SrcAlphaSaturateFactor ]: WebGLConstants.SRC_ALPHA_SATURATE,


	// Extensions
	[ Constants.UnsignedInt248Type ]: WebGLConstants.UNSIGNED_INT_24_8_WEBGL,

	[ Constants.MinEquation ]: WebGLConstants.MIN_EXT,
	[ Constants.MaxEquation ]: WebGLConstants.MAX_EXT,

	[ Constants.HalfFloatType ]: WebGLConstants.HALF_FLOAT_OES,

	[ Constants.RGB_S3TC_DXT1_Format ]: WebGLConstants.COMPRESSED_RGB_S3TC_DXT1_EXT,
	[ Constants.RGBA_S3TC_DXT1_Format ]: WebGLConstants.COMPRESSED_RGBA_S3TC_DXT1_EXT,
	[ Constants.RGBA_S3TC_DXT3_Format ]: WebGLConstants.COMPRESSED_RGBA_S3TC_DXT3_EXT,
	[ Constants.RGBA_S3TC_DXT5_Format ]: WebGLConstants.COMPRESSED_RGBA_S3TC_DXT5_EXT,

	[ Constants.RGB_PVRTC_4BPPV1_Format ]: WebGLConstants.COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
	[ Constants.RGB_PVRTC_2BPPV1_Format ]: WebGLConstants.COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
	[ Constants.RGBA_PVRTC_4BPPV1_Format ]: WebGLConstants.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
	[ Constants.RGBA_PVRTC_2BPPV1_Format ]: WebGLConstants.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG,

	[ Constants.RGB_ETC1_Format ]: WebGLConstants.COMPRESSED_RGB_ETC1_WEBGL

}

/**
 * Convert a THREE.js constant to WEBGL
 * @param  {Number} threeConstant Three.js constant
 * @return {Number}               WebGL constant
 */
function toGL ( threeConstant ) {

	return THREE_TO_WEBGL[ threeConstant ];

}

//------------------------------------------------------------------------------
// WEBGL TO THREE
//------------------------------------------------------------------------------
var WEBGL_TO_THREE = {

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


/**
 * Convert a WEBGL constant to THREE.js
 * @param  {Number} webglConstant WebGL constant
 * @return {Number}               Three.js constant
 */
function fromGL ( webglConstant ) {

	return WEBGL_TO_THREE[ webglConstant ];

}

export { toGL, fromGL };
