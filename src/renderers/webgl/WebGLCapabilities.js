import { FloatType, HalfFloatType, RGBAFormat, UnsignedByteType } from '../../constants.js';

function WebGLCapabilities( gl, extensions, parameters, utils ) {

	let maxAnisotropy;

	function getMaxAnisotropy() {

		if ( maxAnisotropy !== undefined ) return maxAnisotropy;

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			const extension = extensions.get( 'EXT_texture_filter_anisotropic' );

			maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			maxAnisotropy = 0;

		}

		return maxAnisotropy;

	}

	function textureFormatReadable( textureFormat ) {

		if ( textureFormat !== RGBAFormat && utils.convert( textureFormat ) !== gl.getParameter( gl.IMPLEMENTATION_COLOR_READ_FORMAT ) ) {

			return false;

		}

		return true;

	}

	function textureTypeReadable( textureType ) {

		const halfFloatSupportedByExt = ( textureType === HalfFloatType ) && ( extensions.has( 'EXT_color_buffer_half_float' ) || extensions.has( 'EXT_color_buffer_float' ) );

		if ( textureType !== UnsignedByteType && utils.convert( textureType ) !== gl.getParameter( gl.IMPLEMENTATION_COLOR_READ_TYPE ) && // Edge and Chrome Mac < 52 (#9513)
			textureType !== FloatType && ! halfFloatSupportedByExt ) {

			return false;

		}

		return true;

	}

	function getMaxPrecision( precision ) {

		if ( precision === 'highp' ) {

			if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
				gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {

				return 'highp';

			}

			precision = 'mediump';

		}

		if ( precision === 'mediump' ) {

			if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision > 0 &&
				gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision > 0 ) {

				return 'mediump';

			}

		}

		return 'lowp';

	}

	let precision = parameters.precision !== undefined ? parameters.precision : 'highp';
	const maxPrecision = getMaxPrecision( precision );

	if ( maxPrecision !== precision ) {

		console.warn( 'THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.' );
		precision = maxPrecision;

	}

	const logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;
	const reversedDepthBuffer = parameters.reversedDepthBuffer === true && extensions.has( 'EXT_clip_control' );

	const maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
	const maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	const maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
	const maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

	const maxAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
	const maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
	const maxVaryings = gl.getParameter( gl.MAX_VARYING_VECTORS );
	const maxFragmentUniforms = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

	const vertexTextures = maxVertexTextures > 0;

	const maxSamples = gl.getParameter( gl.MAX_SAMPLES );

	return {

		isWebGL2: true, // keeping this for backwards compatibility

		getMaxAnisotropy: getMaxAnisotropy,
		getMaxPrecision: getMaxPrecision,

		textureFormatReadable: textureFormatReadable,
		textureTypeReadable: textureTypeReadable,

		precision: precision,
		logarithmicDepthBuffer: logarithmicDepthBuffer,
		reversedDepthBuffer: reversedDepthBuffer,

		maxTextures: maxTextures,
		maxVertexTextures: maxVertexTextures,
		maxTextureSize: maxTextureSize,
		maxCubemapSize: maxCubemapSize,

		maxAttributes: maxAttributes,
		maxVertexUniforms: maxVertexUniforms,
		maxVaryings: maxVaryings,
		maxFragmentUniforms: maxFragmentUniforms,

		vertexTextures: vertexTextures,

		maxSamples: maxSamples

	};

}


export { WebGLCapabilities };
