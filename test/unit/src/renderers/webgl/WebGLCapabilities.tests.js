import { WebGLCapabilities } from '../../../../../src/renderers/webgl/WebGLCapabilities.js';
import { FloatType, HalfFloatType, UnsignedByteType, RGBAFormat, RedFormat } from '../../../../../src/constants.js';
import { CONSOLE_LEVEL } from '../../../utils/console-wrapper.js';

// Distinct sentinels for the pname constants, so getParameter() can be driven
// from a plain lookup table.
const GL_CONSTANTS = {
	MAX_TEXTURE_IMAGE_UNITS: 'MAX_TEXTURE_IMAGE_UNITS',
	MAX_VERTEX_TEXTURE_IMAGE_UNITS: 'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
	MAX_TEXTURE_SIZE: 'MAX_TEXTURE_SIZE',
	MAX_CUBE_MAP_TEXTURE_SIZE: 'MAX_CUBE_MAP_TEXTURE_SIZE',
	MAX_VERTEX_ATTRIBS: 'MAX_VERTEX_ATTRIBS',
	MAX_VERTEX_UNIFORM_VECTORS: 'MAX_VERTEX_UNIFORM_VECTORS',
	MAX_VARYING_VECTORS: 'MAX_VARYING_VECTORS',
	MAX_FRAGMENT_UNIFORM_VECTORS: 'MAX_FRAGMENT_UNIFORM_VECTORS',
	MAX_SAMPLES: 'MAX_SAMPLES',
	SAMPLES: 'SAMPLES',
	IMPLEMENTATION_COLOR_READ_FORMAT: 'IMPLEMENTATION_COLOR_READ_FORMAT',
	IMPLEMENTATION_COLOR_READ_TYPE: 'IMPLEMENTATION_COLOR_READ_TYPE',
	VERTEX_SHADER: 'VERTEX_SHADER',
	FRAGMENT_SHADER: 'FRAGMENT_SHADER',
	HIGH_FLOAT: 'HIGH_FLOAT',
	MEDIUM_FLOAT: 'MEDIUM_FLOAT'
};

// A context whose limits and shader precision support can be dialled in per
// test. `precisions` maps a precision constant to the reported bit count; 0
// means the hardware does not support it.
function mockContext( { parameters = {}, precisions = { HIGH_FLOAT: 23, MEDIUM_FLOAT: 10 } } = {} ) {

	const limits = {
		MAX_TEXTURE_IMAGE_UNITS: 16,
		MAX_VERTEX_TEXTURE_IMAGE_UNITS: 16,
		MAX_TEXTURE_SIZE: 4096,
		MAX_CUBE_MAP_TEXTURE_SIZE: 4096,
		MAX_VERTEX_ATTRIBS: 16,
		MAX_VERTEX_UNIFORM_VECTORS: 1024,
		MAX_VARYING_VECTORS: 15,
		MAX_FRAGMENT_UNIFORM_VECTORS: 1024,
		MAX_SAMPLES: 4,
		SAMPLES: 0,
		...parameters
	};

	return {
		...GL_CONSTANTS,
		getParameter( pname ) {

			return limits[ pname ];

		},
		getShaderPrecisionFormat( shaderType, precisionType ) {

			return { precision: precisions[ precisionType ] ?? 0 };

		}
	};

}

function mockExtensions( available = [] ) {

	return {
		has( name ) {

			return available.includes( name );

		},
		get( name ) {

			return available.includes( name ) ? { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 'MAX_ANISOTROPY' } : null;

		}
	};

}

// Stands in for WebGLUtils -- capabilities only calls convert().
function mockUtils( mapping = {} ) {

	return {
		convert( p ) {

			return mapping[ p ] !== undefined ? mapping[ p ] : p;

		}
	};

}

function create( { parameters = {}, precisions, extensions = [], utils = mockUtils(), glParameters = {} } = {} ) {

	return new WebGLCapabilities(
		mockContext( { parameters: glParameters, precisions } ),
		mockExtensions( extensions ),
		parameters,
		utils
	);

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLCapabilities', ( hooks ) => {

			// Several tests below suppress the expected precision/extension
			// warnings by lowering console.level. That is a process-global set by
			// the console wrapper, so restoring it inline would be skipped if the
			// code under test threw first, silently muting warnings for the rest
			// of the suite. Resetting here runs on both success and failure.
			hooks.afterEach( () => {

				console.level = CONSOLE_LEVEL.DEFAULT;

			} );

			// INSTANCING
			QUnit.test( 'Instancing - reads the driver limits off the context', ( assert ) => {

				const capabilities = create( {
					glParameters: {
						MAX_TEXTURE_IMAGE_UNITS: 32,
						MAX_VERTEX_TEXTURE_IMAGE_UNITS: 16,
						MAX_TEXTURE_SIZE: 8192,
						MAX_CUBE_MAP_TEXTURE_SIZE: 2048,
						MAX_VERTEX_ATTRIBS: 24,
						MAX_VERTEX_UNIFORM_VECTORS: 512,
						MAX_VARYING_VECTORS: 31,
						MAX_FRAGMENT_UNIFORM_VECTORS: 256,
						MAX_SAMPLES: 8,
						SAMPLES: 4
					}
				} );

				assert.strictEqual( capabilities.maxTextures, 32, 'maxTextures' );
				assert.strictEqual( capabilities.maxVertexTextures, 16, 'maxVertexTextures' );
				assert.strictEqual( capabilities.maxTextureSize, 8192, 'maxTextureSize' );
				assert.strictEqual( capabilities.maxCubemapSize, 2048, 'maxCubemapSize' );
				assert.strictEqual( capabilities.maxAttributes, 24, 'maxAttributes' );
				assert.strictEqual( capabilities.maxVertexUniforms, 512, 'maxVertexUniforms' );
				assert.strictEqual( capabilities.maxVaryings, 31, 'maxVaryings' );
				assert.strictEqual( capabilities.maxFragmentUniforms, 256, 'maxFragmentUniforms' );
				assert.strictEqual( capabilities.maxSamples, 8, 'maxSamples' );
				assert.strictEqual( capabilities.samples, 4, 'samples' );

			} );

			QUnit.test( 'Instancing - always reports isWebGL2', ( assert ) => {

				// Kept as a constant for backwards compatibility now that WebGL 1
				// is no longer supported.
				assert.strictEqual( create().isWebGL2, true, 'isWebGL2 is true' );

			} );

			// precision
			QUnit.test( 'Instancing - defaults to highp', ( assert ) => {

				assert.strictEqual( create().precision, 'highp', 'highp is the default when the driver supports it' );

			} );

			QUnit.test( 'Instancing - honours a requested precision', ( assert ) => {

				assert.strictEqual( create( { parameters: { precision: 'mediump' } } ).precision, 'mediump', 'the requested precision is used' );

			} );

			QUnit.test( 'Instancing - falls back when the requested precision is unsupported', ( assert ) => {

				console.level = CONSOLE_LEVEL.ERROR;

				const noHighp = create( { precisions: { HIGH_FLOAT: 0, MEDIUM_FLOAT: 10 } } );
				assert.strictEqual( noHighp.precision, 'mediump', 'highp falls back to mediump' );

				const noFloat = create( { precisions: { HIGH_FLOAT: 0, MEDIUM_FLOAT: 0 } } );
				assert.strictEqual( noFloat.precision, 'lowp', 'with neither available it falls back to lowp' );


			} );

			// getMaxPrecision
			QUnit.test( 'getMaxPrecision - reports the best precision at or below the request', ( assert ) => {

				const capabilities = create();

				assert.strictEqual( capabilities.getMaxPrecision( 'highp' ), 'highp', 'highp is available' );
				assert.strictEqual( capabilities.getMaxPrecision( 'mediump' ), 'mediump', 'mediump is available' );

			} );

			QUnit.test( 'getMaxPrecision - never upgrades a request', ( assert ) => {

				// Asking for lowp gets lowp even on hardware that supports more.
				assert.strictEqual( create().getMaxPrecision( 'lowp' ), 'lowp', 'lowp stays lowp' );

			} );

			QUnit.test( 'getMaxPrecision - degrades when the driver reports no support', ( assert ) => {

				console.level = CONSOLE_LEVEL.ERROR;

				const capabilities = create( { precisions: { HIGH_FLOAT: 0, MEDIUM_FLOAT: 0 } } );

				assert.strictEqual( capabilities.getMaxPrecision( 'highp' ), 'lowp', 'highp degrades all the way to lowp' );
				assert.strictEqual( capabilities.getMaxPrecision( 'mediump' ), 'lowp', 'mediump degrades to lowp' );


			} );

			// logarithmicDepthBuffer / reversedDepthBuffer
			QUnit.test( 'Instancing - reflects the logarithmicDepthBuffer parameter', ( assert ) => {

				assert.strictEqual( create().logarithmicDepthBuffer, false, 'it is off by default' );
				assert.strictEqual( create( { parameters: { logarithmicDepthBuffer: true } } ).logarithmicDepthBuffer, true, 'it can be turned on' );

			} );

			QUnit.test( 'Instancing - enables reversedDepthBuffer only with EXT_clip_control', ( assert ) => {

				console.level = CONSOLE_LEVEL.ERROR;

				const withExtension = create( { parameters: { reversedDepthBuffer: true }, extensions: [ 'EXT_clip_control' ] } );
				assert.strictEqual( withExtension.reversedDepthBuffer, true, 'the extension enables it' );

				const withoutExtension = create( { parameters: { reversedDepthBuffer: true } } );
				assert.strictEqual( withoutExtension.reversedDepthBuffer, false, 'without the extension it stays off' );


				assert.strictEqual( create( { extensions: [ 'EXT_clip_control' ] } ).reversedDepthBuffer, false, 'it is off unless requested' );

			} );

			// getMaxAnisotropy
			QUnit.test( 'getMaxAnisotropy - reads the limit from the extension', ( assert ) => {

				const capabilities = create( {
					extensions: [ 'EXT_texture_filter_anisotropic' ],
					glParameters: { MAX_ANISOTROPY: 16 }
				} );

				assert.strictEqual( capabilities.getMaxAnisotropy(), 16, 'the driver limit is reported' );

			} );

			QUnit.test( 'getMaxAnisotropy - reports zero without the extension', ( assert ) => {

				assert.strictEqual( create().getMaxAnisotropy(), 0, 'anisotropic filtering is unavailable' );

			} );

			QUnit.test( 'getMaxAnisotropy - caches the queried value', ( assert ) => {

				// The lookup is memoised, so a context that starts reporting a
				// different value is not picked up again.
				let queries = 0;

				const gl = mockContext();
				const originalGetParameter = gl.getParameter;
				gl.getParameter = function ( pname ) {

					if ( pname === 'MAX_ANISOTROPY' ) {

						queries ++;
						return 16;

					}

					return originalGetParameter.call( gl, pname );

				};

				const capabilities = new WebGLCapabilities( gl, mockExtensions( [ 'EXT_texture_filter_anisotropic' ] ), {}, mockUtils() );

				capabilities.getMaxAnisotropy();
				capabilities.getMaxAnisotropy();

				assert.strictEqual( queries, 1, 'the extension is only queried once' );

			} );

			// textureFormatReadable
			QUnit.test( 'textureFormatReadable - always accepts RGBA', ( assert ) => {

				// RGBA is guaranteed readable, so it short-circuits before the
				// implementation-defined format is consulted.
				const capabilities = create( {
					glParameters: { IMPLEMENTATION_COLOR_READ_FORMAT: 'SOMETHING_ELSE' }
				} );

				assert.strictEqual( capabilities.textureFormatReadable( RGBAFormat ), true, 'RGBA is readable' );

			} );

			QUnit.test( 'textureFormatReadable - accepts a format matching the implementation format', ( assert ) => {

				const capabilities = create( {
					utils: mockUtils( { [ RedFormat ]: 'GL_RED' } ),
					glParameters: { IMPLEMENTATION_COLOR_READ_FORMAT: 'GL_RED' }
				} );

				assert.strictEqual( capabilities.textureFormatReadable( RedFormat ), true, 'the matching format is readable' );

			} );

			QUnit.test( 'textureFormatReadable - rejects any other format', ( assert ) => {

				const capabilities = create( {
					utils: mockUtils( { [ RedFormat ]: 'GL_RED' } ),
					glParameters: { IMPLEMENTATION_COLOR_READ_FORMAT: 'GL_RGBA' }
				} );

				assert.strictEqual( capabilities.textureFormatReadable( RedFormat ), false, 'a mismatched format is not readable' );

			} );

			// textureTypeReadable
			QUnit.test( 'textureTypeReadable - always accepts the guaranteed types', ( assert ) => {

				const capabilities = create( {
					glParameters: { IMPLEMENTATION_COLOR_READ_TYPE: 'SOMETHING_ELSE' }
				} );

				assert.strictEqual( capabilities.textureTypeReadable( UnsignedByteType ), true, 'unsigned byte is readable' );
				assert.strictEqual( capabilities.textureTypeReadable( FloatType ), true, 'float is readable' );

			} );

			QUnit.test( 'textureTypeReadable - accepts half float when a color buffer extension is present', ( assert ) => {

				const glParameters = { IMPLEMENTATION_COLOR_READ_TYPE: 'SOMETHING_ELSE' };

				for ( const extension of [ 'EXT_color_buffer_half_float', 'EXT_color_buffer_float' ] ) {

					const capabilities = create( { extensions: [ extension ], glParameters } );

					assert.strictEqual( capabilities.textureTypeReadable( HalfFloatType ), true, `${ extension } makes half float readable` );

				}

			} );

			QUnit.test( 'textureTypeReadable - rejects half float without either extension', ( assert ) => {

				const capabilities = create( {
					utils: mockUtils( { [ HalfFloatType ]: 'GL_HALF_FLOAT' } ),
					glParameters: { IMPLEMENTATION_COLOR_READ_TYPE: 'GL_UNSIGNED_BYTE' }
				} );

				assert.strictEqual( capabilities.textureTypeReadable( HalfFloatType ), false, 'half float is not readable' );

			} );

			QUnit.test( 'textureTypeReadable - accepts a type matching the implementation type', ( assert ) => {

				const capabilities = create( {
					utils: mockUtils( { 9999: 'GL_SOME_TYPE' } ),
					glParameters: { IMPLEMENTATION_COLOR_READ_TYPE: 'GL_SOME_TYPE' }
				} );

				assert.strictEqual( capabilities.textureTypeReadable( 9999 ), true, 'the matching type is readable' );

			} );

		} );

	} );

} );
