THREE.WebGLCapabilities = function ( gl, extensions, parameters ) {

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

	this.getMaxPrecision = getMaxPrecision;

	this.precision = parameters.precision !== undefined ? parameters.precision : 'highp',
	this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer !== undefined ? parameters.logarithmicDepthBuffer : false;

	this.maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
	this.maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	this.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
	this.maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

	this.maxAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
	this.maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
	this.maxVaryings = gl.getParameter( gl.MAX_VARYING_VECTORS );
	this.maxFragmentUniforms = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

	this.vertexTextures = this.maxVertexTextures > 0;
	this.floatFragmentTextures = !! extensions.get( 'OES_texture_float' );
	this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;

	this.maxSamples = gl.MAX_SAMPLES ? gl.getParameter( gl.MAX_SAMPLES ) : 0;

	var _maxPrecision = getMaxPrecision( this.precision );

	if ( _maxPrecision !== this.precision ) {

		console.warn( 'THREE.WebGLRenderer:', this.precision, 'not supported, using', _maxPrecision, 'instead.' );
		this.precision = _maxPrecision;

	}

	if ( this.logarithmicDepthBuffer ) {

		this.logarithmicDepthBuffer = !! extensions.get( 'EXT_frag_depth' );

	}

};
