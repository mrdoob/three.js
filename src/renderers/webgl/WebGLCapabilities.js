THREE.WebGLCapabilities = function( gl, extensions, parameters ){
    
    this.getMaxPrecision = function ( precision ) {
    
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
    
    };

	// GPU capabilities
	this.precision = parameters.precision !== undefined ? parameters.precision : 'highp',
	this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer !== undefined ? parameters.logarithmicDepthBuffer : false;

	this.maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
	this.maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	this.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
	this.maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

	this.supportsVertexTextures = this.maxVertexTextures > 0;
	this.supportsBoneTextures = this.supportsVertexTextures && extensions.get( 'OES_texture_float' );
	

	var _maxPrecision = this.getMaxPrecision( this.precision );

	if ( _maxPrecision !== this.precision ) {

		console.warn( 'THREE.WebGLRenderer:', this.precision, 'not supported, using', _maxPrecision, 'instead.' );
		this.precision = _maxPrecision;

	}
    
    
    
};
