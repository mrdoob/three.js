import { WebGLUtils } from '../../../../../src/renderers/webgl/WebGLUtils.js';
import {
	UnsignedByteType, ByteType, ShortType, UnsignedShortType, IntType, UnsignedIntType,
	FloatType, HalfFloatType, UnsignedShort4444Type, UnsignedShort5551Type,
	UnsignedInt5999Type, UnsignedInt101111Type, UnsignedInt248Type,
	AlphaFormat, RGBFormat, RGBAFormat, DepthFormat, DepthStencilFormat,
	RedFormat, RedIntegerFormat, RGFormat, RGIntegerFormat, RGBAIntegerFormat,
	RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format,
	RGB_PVRTC_4BPPV1_Format, RGBA_PVRTC_2BPPV1_Format,
	RGB_ETC1_Format, RGB_ETC2_Format, RGBA_ETC2_EAC_Format, R11_EAC_Format, SIGNED_RG11_EAC_Format,
	RGBA_ASTC_4x4_Format, RGBA_ASTC_12x12_Format,
	RGBA_BPTC_Format, RGB_BPTC_SIGNED_Format,
	RED_RGTC1_Format, SIGNED_RED_GREEN_RGTC2_Format,
	SRGBColorSpace, LinearSRGBColorSpace, NoColorSpace
} from '../../../../../src/constants.js';

// The subset of WebGL2 enum values convert() reads off the context. The exact
// numbers do not matter -- distinct sentinels are enough to prove the right
// branch was taken.
function mockContext() {

	return {
		UNSIGNED_BYTE: 'UNSIGNED_BYTE',
		BYTE: 'BYTE',
		SHORT: 'SHORT',
		UNSIGNED_SHORT: 'UNSIGNED_SHORT',
		INT: 'INT',
		UNSIGNED_INT: 'UNSIGNED_INT',
		FLOAT: 'FLOAT',
		HALF_FLOAT: 'HALF_FLOAT',
		UNSIGNED_SHORT_4_4_4_4: 'UNSIGNED_SHORT_4_4_4_4',
		UNSIGNED_SHORT_5_5_5_1: 'UNSIGNED_SHORT_5_5_5_1',
		UNSIGNED_INT_5_9_9_9_REV: 'UNSIGNED_INT_5_9_9_9_REV',
		UNSIGNED_INT_10F_11F_11F_REV: 'UNSIGNED_INT_10F_11F_11F_REV',
		UNSIGNED_INT_24_8: 'UNSIGNED_INT_24_8',
		ALPHA: 'ALPHA',
		RGB: 'RGB',
		RGBA: 'RGBA',
		DEPTH_COMPONENT: 'DEPTH_COMPONENT',
		DEPTH_STENCIL: 'DEPTH_STENCIL',
		RED: 'RED',
		RED_INTEGER: 'RED_INTEGER',
		RG: 'RG',
		RG_INTEGER: 'RG_INTEGER',
		RGBA_INTEGER: 'RGBA_INTEGER'
	};

}

// Returns an `extensions` stub that resolves only the named extensions and
// reports null for everything else, mirroring WebGLExtensions.get().
function mockExtensions( available = {} ) {

	return {
		requested: [],
		get( name ) {

			this.requested.push( name );
			return Object.prototype.hasOwnProperty.call( available, name ) ? available[ name ] : null;

		}
	};

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLUtils', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes convert()', ( assert ) => {

				const utils = new WebGLUtils( mockContext(), mockExtensions() );

				assert.strictEqual( typeof utils.convert, 'function', 'convert() is exposed' );

			} );

			// convert - types
			QUnit.test( 'convert - maps the data types to their WebGL enums', ( assert ) => {

				const gl = mockContext();
				const utils = new WebGLUtils( gl, mockExtensions() );

				const expected = [
					[ UnsignedByteType, gl.UNSIGNED_BYTE ],
					[ ByteType, gl.BYTE ],
					[ ShortType, gl.SHORT ],
					[ UnsignedShortType, gl.UNSIGNED_SHORT ],
					[ IntType, gl.INT ],
					[ UnsignedIntType, gl.UNSIGNED_INT ],
					[ FloatType, gl.FLOAT ],
					[ HalfFloatType, gl.HALF_FLOAT ],
					[ UnsignedShort4444Type, gl.UNSIGNED_SHORT_4_4_4_4 ],
					[ UnsignedShort5551Type, gl.UNSIGNED_SHORT_5_5_5_1 ],
					[ UnsignedInt5999Type, gl.UNSIGNED_INT_5_9_9_9_REV ],
					[ UnsignedInt101111Type, gl.UNSIGNED_INT_10F_11F_11F_REV ],
					[ UnsignedInt248Type, gl.UNSIGNED_INT_24_8 ]
				];

				for ( const [ type, glEnum ] of expected ) {

					assert.strictEqual( utils.convert( type ), glEnum, `${ glEnum } is resolved` );

				}

			} );

			// convert - formats
			QUnit.test( 'convert - maps the uncompressed formats to their WebGL enums', ( assert ) => {

				const gl = mockContext();
				const utils = new WebGLUtils( gl, mockExtensions() );

				const expected = [
					[ AlphaFormat, gl.ALPHA ],
					[ RGBFormat, gl.RGB ],
					[ RGBAFormat, gl.RGBA ],
					[ DepthFormat, gl.DEPTH_COMPONENT ],
					[ DepthStencilFormat, gl.DEPTH_STENCIL ],
					[ RedFormat, gl.RED ],
					[ RedIntegerFormat, gl.RED_INTEGER ],
					[ RGFormat, gl.RG ],
					[ RGIntegerFormat, gl.RG_INTEGER ],
					[ RGBAIntegerFormat, gl.RGBA_INTEGER ]
				];

				for ( const [ format, glEnum ] of expected ) {

					assert.strictEqual( utils.convert( format ), glEnum, `${ glEnum } is resolved` );

				}

			} );

			QUnit.test( 'convert - ignores the color space for uncompressed formats', ( assert ) => {

				// Only the compressed formats have separate sRGB variants.
				const gl = mockContext();
				const utils = new WebGLUtils( gl, mockExtensions() );

				assert.strictEqual( utils.convert( RGBAFormat, SRGBColorSpace ), gl.RGBA, 'sRGB still resolves to RGBA' );
				assert.strictEqual( utils.convert( RGBAFormat, LinearSRGBColorSpace ), gl.RGBA, 'linear still resolves to RGBA' );

			} );

			// convert - S3TC
			QUnit.test( 'convert - resolves S3TC formats through the linear extension', ( assert ) => {

				const extensions = mockExtensions( {
					WEBGL_compressed_texture_s3tc: {
						COMPRESSED_RGB_S3TC_DXT1_EXT: 'RGB_DXT1',
						COMPRESSED_RGBA_S3TC_DXT1_EXT: 'RGBA_DXT1',
						COMPRESSED_RGBA_S3TC_DXT3_EXT: 'RGBA_DXT3',
						COMPRESSED_RGBA_S3TC_DXT5_EXT: 'RGBA_DXT5'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGB_S3TC_DXT1_Format, NoColorSpace ), 'RGB_DXT1', 'DXT1 RGB' );
				assert.strictEqual( utils.convert( RGBA_S3TC_DXT1_Format, NoColorSpace ), 'RGBA_DXT1', 'DXT1 RGBA' );
				assert.strictEqual( utils.convert( RGBA_S3TC_DXT3_Format, NoColorSpace ), 'RGBA_DXT3', 'DXT3' );
				assert.strictEqual( utils.convert( RGBA_S3TC_DXT5_Format, NoColorSpace ), 'RGBA_DXT5', 'DXT5' );
				assert.ok( extensions.requested.includes( 'WEBGL_compressed_texture_s3tc' ), 'the linear extension is the one queried' );

			} );

			QUnit.test( 'convert - resolves S3TC formats through the sRGB extension for an sRGB color space', ( assert ) => {

				const extensions = mockExtensions( {
					WEBGL_compressed_texture_s3tc_srgb: {
						COMPRESSED_SRGB_S3TC_DXT1_EXT: 'SRGB_DXT1',
						COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: 'SRGB_A_DXT5'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGB_S3TC_DXT1_Format, SRGBColorSpace ), 'SRGB_DXT1', 'the sRGB DXT1 variant is used' );
				assert.strictEqual( utils.convert( RGBA_S3TC_DXT5_Format, SRGBColorSpace ), 'SRGB_A_DXT5', 'the sRGB DXT5 variant is used' );
				assert.ok( extensions.requested.includes( 'WEBGL_compressed_texture_s3tc_srgb' ), 'the sRGB extension is the one queried' );

			} );

			QUnit.test( 'convert - returns null when the S3TC extension is unavailable', ( assert ) => {

				const utils = new WebGLUtils( mockContext(), mockExtensions() );

				assert.strictEqual( utils.convert( RGBA_S3TC_DXT5_Format, NoColorSpace ), null, 'the linear path returns null' );
				assert.strictEqual( utils.convert( RGBA_S3TC_DXT5_Format, SRGBColorSpace ), null, 'the sRGB path returns null' );

			} );

			// convert - PVRTC
			QUnit.test( 'convert - resolves PVRTC formats through their extension', ( assert ) => {

				const extensions = mockExtensions( {
					WEBGL_compressed_texture_pvrtc: {
						COMPRESSED_RGB_PVRTC_4BPPV1_IMG: 'RGB_4BPP',
						COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: 'RGBA_2BPP'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGB_PVRTC_4BPPV1_Format ), 'RGB_4BPP', '4bpp RGB' );
				assert.strictEqual( utils.convert( RGBA_PVRTC_2BPPV1_Format ), 'RGBA_2BPP', '2bpp RGBA' );

			} );

			QUnit.test( 'convert - returns null when the PVRTC extension is unavailable', ( assert ) => {

				const utils = new WebGLUtils( mockContext(), mockExtensions() );

				assert.strictEqual( utils.convert( RGB_PVRTC_4BPPV1_Format ), null, 'an unsupported format resolves to null' );

			} );

			// convert - ETC
			QUnit.test( 'convert - picks the sRGB ETC variants for an sRGB color space', ( assert ) => {

				const extensions = mockExtensions( {
					WEBGL_compressed_texture_etc: {
						COMPRESSED_RGB8_ETC2: 'RGB8_ETC2',
						COMPRESSED_SRGB8_ETC2: 'SRGB8_ETC2',
						COMPRESSED_RGBA8_ETC2_EAC: 'RGBA8_EAC',
						COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: 'SRGB8_A8_EAC',
						COMPRESSED_R11_EAC: 'R11_EAC',
						COMPRESSED_SIGNED_RG11_EAC: 'SIGNED_RG11_EAC'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGB_ETC2_Format, NoColorSpace ), 'RGB8_ETC2', 'linear ETC2 RGB' );
				assert.strictEqual( utils.convert( RGB_ETC2_Format, SRGBColorSpace ), 'SRGB8_ETC2', 'sRGB ETC2 RGB' );
				assert.strictEqual( utils.convert( RGBA_ETC2_EAC_Format, NoColorSpace ), 'RGBA8_EAC', 'linear ETC2 RGBA' );
				assert.strictEqual( utils.convert( RGBA_ETC2_EAC_Format, SRGBColorSpace ), 'SRGB8_A8_EAC', 'sRGB ETC2 RGBA' );

			} );

			QUnit.test( 'convert - maps ETC1 onto the ETC2 enums', ( assert ) => {

				// There is no separate ETC1 path -- ETC2 is backwards compatible.
				const extensions = mockExtensions( {
					WEBGL_compressed_texture_etc: { COMPRESSED_RGB8_ETC2: 'RGB8_ETC2' }
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGB_ETC1_Format, NoColorSpace ), 'RGB8_ETC2', 'ETC1 resolves to the ETC2 enum' );

			} );

			QUnit.test( 'convert - resolves the EAC single- and dual-channel formats', ( assert ) => {

				const extensions = mockExtensions( {
					WEBGL_compressed_texture_etc: {
						COMPRESSED_R11_EAC: 'R11_EAC',
						COMPRESSED_SIGNED_RG11_EAC: 'SIGNED_RG11_EAC'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( R11_EAC_Format ), 'R11_EAC', 'R11 EAC' );
				assert.strictEqual( utils.convert( SIGNED_RG11_EAC_Format ), 'SIGNED_RG11_EAC', 'signed RG11 EAC' );

			} );

			// convert - ASTC
			QUnit.test( 'convert - picks the sRGB ASTC variants for an sRGB color space', ( assert ) => {

				const extensions = mockExtensions( {
					WEBGL_compressed_texture_astc: {
						COMPRESSED_RGBA_ASTC_4x4_KHR: 'RGBA_4x4',
						COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR: 'SRGB_4x4',
						COMPRESSED_RGBA_ASTC_12x12_KHR: 'RGBA_12x12',
						COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR: 'SRGB_12x12'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGBA_ASTC_4x4_Format, NoColorSpace ), 'RGBA_4x4', 'linear 4x4' );
				assert.strictEqual( utils.convert( RGBA_ASTC_4x4_Format, SRGBColorSpace ), 'SRGB_4x4', 'sRGB 4x4' );
				assert.strictEqual( utils.convert( RGBA_ASTC_12x12_Format, NoColorSpace ), 'RGBA_12x12', 'linear 12x12' );
				assert.strictEqual( utils.convert( RGBA_ASTC_12x12_Format, SRGBColorSpace ), 'SRGB_12x12', 'sRGB 12x12' );

			} );

			// convert - BPTC
			QUnit.test( 'convert - resolves BPTC formats, with an sRGB variant only for the UNORM one', ( assert ) => {

				// The signed and unsigned float formats are HDR, so they have no
				// sRGB counterpart to switch to.
				const extensions = mockExtensions( {
					EXT_texture_compression_bptc: {
						COMPRESSED_RGBA_BPTC_UNORM_EXT: 'RGBA_UNORM',
						COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: 'SRGB_A_UNORM',
						COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT: 'RGB_SIGNED_FLOAT'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RGBA_BPTC_Format, NoColorSpace ), 'RGBA_UNORM', 'linear UNORM' );
				assert.strictEqual( utils.convert( RGBA_BPTC_Format, SRGBColorSpace ), 'SRGB_A_UNORM', 'sRGB UNORM' );
				assert.strictEqual( utils.convert( RGB_BPTC_SIGNED_Format, SRGBColorSpace ), 'RGB_SIGNED_FLOAT', 'the float format ignores the color space' );

			} );

			// convert - RGTC
			QUnit.test( 'convert - resolves RGTC formats through their extension', ( assert ) => {

				const extensions = mockExtensions( {
					EXT_texture_compression_rgtc: {
						COMPRESSED_RED_RGTC1_EXT: 'RED_RGTC1',
						COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: 'SIGNED_RG_RGTC2'
					}
				} );

				const utils = new WebGLUtils( mockContext(), extensions );

				assert.strictEqual( utils.convert( RED_RGTC1_Format ), 'RED_RGTC1', 'RGTC1' );
				assert.strictEqual( utils.convert( SIGNED_RED_GREEN_RGTC2_Format ), 'SIGNED_RG_RGTC2', 'signed RGTC2' );

			} );

			QUnit.test( 'convert - returns null when the RGTC extension is unavailable', ( assert ) => {

				const utils = new WebGLUtils( mockContext(), mockExtensions() );

				assert.strictEqual( utils.convert( RED_RGTC1_Format ), null, 'an unsupported format resolves to null' );

			} );

			// convert - fallback
			QUnit.test( 'convert - falls back to a named constant on the context', ( assert ) => {

				// Undocumented escape hatch: an unrecognised value is looked up
				// as a property name on the context, which lets applications
				// name packed formats the enum list does not cover.
				const gl = mockContext();
				gl.RGB565 = 'RGB565';

				const utils = new WebGLUtils( gl, mockExtensions() );

				assert.strictEqual( utils.convert( 'RGB565' ), 'RGB565', 'the string names a context constant' );

			} );

			QUnit.test( 'convert - returns null for an unrecognised value', ( assert ) => {

				const utils = new WebGLUtils( mockContext(), mockExtensions() );

				assert.strictEqual( utils.convert( 'NOT_A_REAL_FORMAT' ), null, 'an unknown name resolves to null' );
				assert.strictEqual( utils.convert( - 1 ), null, 'an unknown numeric constant resolves to null' );

			} );

		} );

	} );

} );
