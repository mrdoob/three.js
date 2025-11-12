import { warnOnce } from '../../utils.js';

function WebGLExtensions( gl ) {

	const extensions = {};

	function getExtension( name ) {

		if ( extensions[ name ] !== undefined ) {

			return extensions[ name ];

		}

		const extension = gl.getExtension( name );

		extensions[ name ] = extension;

		return extension;

	}

	return {

		has: function ( name ) {

			return getExtension( name ) !== null;

		},

		init: function () {

			getExtension( 'EXT_color_buffer_float' );
			getExtension( 'WEBGL_clip_cull_distance' );
			getExtension( 'OES_texture_float_linear' );
			getExtension( 'EXT_color_buffer_half_float' );
			getExtension( 'WEBGL_multisampled_render_to_texture' );
			getExtension( 'WEBGL_render_shared_exponent' );

		},

		get: function ( name ) {

			const extension = getExtension( name );

			if ( extension === null ) {

				warnOnce( 'WebGLRenderer: ' + name + ' extension not supported.' );

			}

			return extension;

		}

	};

}


export { WebGLExtensions };
