/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLCapabilities( gl, extensions, parameters ) {

	var maxAnisotropy;

	function getMaxAnisotropy() {

		if ( maxAnisotropy !== undefined ) return maxAnisotropy;

		var extension = extensions.get( 'EXT_texture_filter_anisotropic' );

		if ( extension !== null ) {

			maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			maxAnisotropy = 0;

		}

		return maxAnisotropy;

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

	var precision = parameters.precision !== undefined ? parameters.precision : 'highp';
	var maxPrecision = getMaxPrecision( precision );

	if ( maxPrecision !== precision ) {

		console.warn( 'THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.' );
		precision = maxPrecision;

	}

	var logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true && !! extensions.get( 'EXT_frag_depth' );

	return {

		getMaxAnisotropy: getMaxAnisotropy,
		getMaxPrecision: getMaxPrecision,

		precision: precision,
		logarithmicDepthBuffer: logarithmicDepthBuffer,

		maxTextures: gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS ),
		maxVertexTextures: gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ),
		maxTextureSize: gl.getParameter( gl.MAX_TEXTURE_SIZE ),
		maxCubemapSize: gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE ),

		maxAttributes: gl.getParameter( gl.MAX_VERTEX_ATTRIBS ),
		maxVertexUniforms: gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS ),
		maxVaryings: gl.getParameter( gl.MAX_VARYING_VECTORS ),
		maxFragmentUniforms: gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS ),

		vertexTextures: this.maxVertexTextures > 0,
		floatFragmentTextures: !! extensions.get( 'OES_texture_float' ),
		floatVertexTextures: this.vertexTextures && this.floatFragmentTextures

	};

}


export { WebGLCapabilities };
