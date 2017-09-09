/**
 * @author thespite / http://www.twitter.com/thespite
 */

import { MaxEquation, MinEquation, RGB_ETC1_Format, RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT5_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT1_Format, RGB_S3TC_DXT1_Format, SrcAlphaSaturateFactor, OneMinusDstColorFactor, DstColorFactor, OneMinusDstAlphaFactor, DstAlphaFactor, OneMinusSrcAlphaFactor, SrcAlphaFactor, OneMinusSrcColorFactor, SrcColorFactor, OneFactor, ZeroFactor, ReverseSubtractEquation, SubtractEquation, AddEquation, DepthFormat, DepthStencilFormat, LuminanceAlphaFormat, LuminanceFormat, RGBAFormat, RGBFormat, AlphaFormat, HalfFloatType, FloatType, UnsignedIntType, IntType, UnsignedShortType, ShortType, ByteType, UnsignedInt248Type, UnsignedShort565Type, UnsignedShort5551Type, UnsignedShort4444Type, UnsignedByteType, LinearMipMapLinearFilter, LinearMipMapNearestFilter, LinearFilter, NearestMipMapLinearFilter, NearestMipMapNearestFilter, NearestFilter, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping } from '../../constants.js';

function WebGLUtils( gl, extensions ) {

	function convert( p ) {

		var extension;

		if ( p === RepeatWrapping ) return gl.REPEAT;
		if ( p === ClampToEdgeWrapping ) return gl.CLAMP_TO_EDGE;
		if ( p === MirroredRepeatWrapping ) return gl.MIRRORED_REPEAT;

		if ( p === NearestFilter ) return gl.NEAREST;
		if ( p === NearestMipMapNearestFilter ) return gl.NEAREST_MIPMAP_NEAREST;
		if ( p === NearestMipMapLinearFilter ) return gl.NEAREST_MIPMAP_LINEAR;

		if ( p === LinearFilter ) return gl.LINEAR;
		if ( p === LinearMipMapNearestFilter ) return gl.LINEAR_MIPMAP_NEAREST;
		if ( p === LinearMipMapLinearFilter ) return gl.LINEAR_MIPMAP_LINEAR;

		if ( p === UnsignedByteType ) return gl.UNSIGNED_BYTE;
		if ( p === UnsignedShort4444Type ) return gl.UNSIGNED_SHORT_4_4_4_4;
		if ( p === UnsignedShort5551Type ) return gl.UNSIGNED_SHORT_5_5_5_1;
		if ( p === UnsignedShort565Type ) return gl.UNSIGNED_SHORT_5_6_5;

		if ( p === ByteType ) return gl.BYTE;
		if ( p === ShortType ) return gl.SHORT;
		if ( p === UnsignedShortType ) return gl.UNSIGNED_SHORT;
		if ( p === IntType ) return gl.INT;
		if ( p === UnsignedIntType ) return gl.UNSIGNED_INT;
		if ( p === FloatType ) return gl.FLOAT;

		if ( p === HalfFloatType ) {

			extension = extensions.get( 'OES_texture_half_float' );

			if ( extension !== null ) return extension.HALF_FLOAT_OES;

		}

		if ( p === AlphaFormat ) return gl.ALPHA;
		if ( p === RGBFormat ) return gl.RGB;
		if ( p === RGBAFormat ) return gl.RGBA;
		if ( p === LuminanceFormat ) return gl.LUMINANCE;
		if ( p === LuminanceAlphaFormat ) return gl.LUMINANCE_ALPHA;
		if ( p === DepthFormat ) return gl.DEPTH_COMPONENT;
		if ( p === DepthStencilFormat ) return gl.DEPTH_STENCIL;

		if ( p === AddEquation ) return gl.FUNC_ADD;
		if ( p === SubtractEquation ) return gl.FUNC_SUBTRACT;
		if ( p === ReverseSubtractEquation ) return gl.FUNC_REVERSE_SUBTRACT;

		if ( p === ZeroFactor ) return gl.ZERO;
		if ( p === OneFactor ) return gl.ONE;
		if ( p === SrcColorFactor ) return gl.SRC_COLOR;
		if ( p === OneMinusSrcColorFactor ) return gl.ONE_MINUS_SRC_COLOR;
		if ( p === SrcAlphaFactor ) return gl.SRC_ALPHA;
		if ( p === OneMinusSrcAlphaFactor ) return gl.ONE_MINUS_SRC_ALPHA;
		if ( p === DstAlphaFactor ) return gl.DST_ALPHA;
		if ( p === OneMinusDstAlphaFactor ) return gl.ONE_MINUS_DST_ALPHA;

		if ( p === DstColorFactor ) return gl.DST_COLOR;
		if ( p === OneMinusDstColorFactor ) return gl.ONE_MINUS_DST_COLOR;
		if ( p === SrcAlphaSaturateFactor ) return gl.SRC_ALPHA_SATURATE;

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


export { WebGLUtils };
