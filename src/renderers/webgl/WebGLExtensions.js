function WebGLExtensions( gl ) {

	const extensions = {};
	const aliasses = {
		'WEBGL_depth_texture': [
			'WEBGL_depth_texture',
			'MOZ_WEBGL_depth_texture',
			'WEBKIT_WEBGL_depth_texture'
		],
		'EXT_texture_filter_anisotropic': [
			'EXT_texture_filter_anisotropic',
			'MOZ_EXT_texture_filter_anisotropic',
			'WEBKIT_EXT_texture_filter_anisotropic'
		],
		'WEBGL_compressed_texture_s3tc': [
			'WEBGL_compressed_texture_s3tc',
			'MOZ_WEBGL_compressed_texture_s3tc',
			'WEBKIT_WEBGL_compressed_texture_s3tc'
		],
		'WEBGL_compressed_texture_pvrtc': [
			'WEBGL_compressed_texture_pvrtc',
			'WEBKIT_WEBGL_compressed_texture_pvrtc'
		]
	};

	function getExtension( name ) {

		if ( extensions[ name ] !== undefined ) {

			return extensions[ name ];

		}

		let extension;

		if ( aliasses[ name ] === undefined ) {

			extension = gl.getExtension( name );

		} else {

			for ( let i = 0; i < aliasses[ name ].length; i ++ ) {

				extension = gl.getExtension( aliasses[ name ][ i ] );

				if ( extension !== null ) {

					break;

				}

			}

		}

		extensions[ name ] = extension;

		return extension;

	}

	return {

		has: function ( name ) {

			return getExtension( name ) !== null;

		},

		init: function ( capabilities ) {

			if ( capabilities.isWebGL2 ) {

				getExtension( 'EXT_color_buffer_float' );

			} else {

				getExtension( 'WEBGL_depth_texture' );
				getExtension( 'OES_texture_float' );
				getExtension( 'OES_texture_half_float' );
				getExtension( 'OES_texture_half_float_linear' );
				getExtension( 'OES_standard_derivatives' );
				getExtension( 'OES_element_index_uint' );
				getExtension( 'OES_vertex_array_object' );
				getExtension( 'ANGLE_instanced_arrays' );

			}

			getExtension( 'OES_texture_float_linear' );
			getExtension( 'EXT_color_buffer_half_float' );
			getExtension( 'WEBGL_multisampled_render_to_texture' );

		},

		get: function ( name ) {

			const extension = getExtension( name );

			if ( extension === null ) {

				console.warn( 'THREE.WebGLRenderer: ' + name + ' extension not supported.' );

			}

			return extension;

		}

	};

}


export { WebGLExtensions };
