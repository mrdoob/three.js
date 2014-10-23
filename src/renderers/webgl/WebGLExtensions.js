THREE.WebGLExtensions = function ( gl ) {

	var extensions = {};

	this.get = function ( name ) {

		if ( extensions[ name ] !== undefined ) {

			return extensions[ name ];

		}

		var extension;

		switch ( name ) {
		
			case 'OES_texture_float':
				extension = gl.getExtension( 'OES_texture_float' );
				break;

			case 'OES_texture_float_linear':
				extension = gl.getExtension( 'OES_texture_float_linear' );
				break;

			case 'OES_standard_derivatives':
				extension = gl.getExtension( 'OES_standard_derivatives' );
				break;

			case 'EXT_texture_filter_anisotropic':
				extension = gl.getExtension( 'EXT_texture_filter_anisotropic' ) || gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
				break;

			case 'WEBGL_compressed_texture_s3tc':
				extension = gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );
				break;

			case 'WEBGL_compressed_texture_pvrtc':
				extension = gl.getExtension( 'WEBGL_compressed_texture_pvrtc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );
				break;

			case 'OES_element_index_uint':
				extension = gl.getExtension( 'OES_element_index_uint' );
				break;

			case 'EXT_blend_minmax':
				extension = gl.getExtension( 'EXT_blend_minmax' );
				break;

			case 'EXT_frag_depth':
				extension = gl.getExtension( 'EXT_frag_depth' );
				break;

		}

		if ( extension === null ) {

			console.log( 'THREE.WebGLRenderer: ' + name + ' extension not supported.' );

		}

		extensions[ name ] = extension;

		return extension;

	};

};
