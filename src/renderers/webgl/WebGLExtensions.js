/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLExtensions( gl ) {

	var extensions = {};

	return {

		get: function ( name ) {

			if ( extensions[ name ] !== undefined ) {

				return extensions[ name ];

			}

			var webgl2Support = ( typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext );

			var extension = webgl2Support ? this._get2( name ) : this._get( name );

			if ( extension === null ) {

				console.warn( 'THREE.WebGLRenderer: ' + name + ' extension not supported.' );

			}

			extensions[ name ] = extension;

			return extension;

		},

		_get: function ( name ) {

			var extension = null;

			switch ( name ) {

				case 'WEBGL_depth_texture':
					extension = gl.getExtension( 'WEBGL_depth_texture' ) || gl.getExtension( 'MOZ_WEBGL_depth_texture' ) || gl.getExtension( 'WEBKIT_WEBGL_depth_texture' );
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

				default:
					extension = gl.getExtension( name );

			}

			return extension;

		},

		_get2: function ( name ) {

			var extension = null;

			switch ( name ) {

				case 'OES_fbo_render_mipmap':
				case 'OES_texture_float':
				case 'OES_texture_float_linear':
				case 'OES_texture_half_float_linear':
				case 'EXT_shader_texture_lod':
				case 'EXT_frag_depth':
				case 'OES_element_index_uint':
					extension = {};
					break;

				case 'OES_texture_half_float':
					extension = { HALF_FLOAT_OES: gl.HALF_FLOAT };
					break;

				case 'OES_standard_derivatives':
					extension = { FRAGMENT_SHADER_DERIVATIVE_HINT_OES: gl.FRAGMENT_SHADER_DERIVATIVE_HINT };
					break;

				case 'ANGLE_instanced_arrays':
					extension = {
						VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: gl.VERTEX_ATTRIB_ARRAY_DIVISOR,

						drawArraysInstancedANGLE: function ( mode, first, count, instanceCount ) {

							gl.drawArraysInstanced( mode, first, count, instanceCount );

						},

						drawElementsInstancedANGLE: function ( mode, count, type, offset, instanceCount ) {

							gl.drawElementsInstanced( mode, count, type, offset, instanceCount );

						},

						vertexAttribDivisorANGLE: function ( index, divisor ) {

							gl.vertexAttribDivisor( index, divisor );

						}
					};
					break;

				case 'OES_vertex_array_object':
					extension = {
						VERTEX_ARRAY_BINDING_OES: gl.VERTEX_ARRAY_BINDING,

						createVertexArrayOES: function () {

							return gl.createVertexArray();

						},

						deleteVertexArrayOES: function ( arrayObject ) {

							gl.deleteVertexArray( arrayObject );

						},

						isVertexArrayOES: function ( arrayObject ) {

							return gl.isVertexArray( arrayObject );

						},

						bindVertexArrayOES: function ( arrayObject ) {

							gl.bindVertexArray( arrayObject );

						}
					};
					break;

				case 'WEBGL_depth_texture':
					extension = { UNSIGNED_INT_24_8_WEBGL: gl.UNSIGNED_INT_24_8 };
					break;

				case 'EXT_sRGB':
					extension = {
						SRGB_EXT: gl.SRGB,
						SRGB_ALPHA_EXT: gl.SRGB8_ALPHA8,
						SRGB8_ALPHA8_EXT: gl.SRGB8_ALPHA8,
						FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT: gl.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING
					};
					break;

				case 'WEBGL_draw_buffers':
					extension = {
						COLOR_ATTACHMENT0_WEBGL: gl.COLOR_ATTACHMENT0,
						COLOR_ATTACHMENT1_WEBGL: gl.COLOR_ATTACHMENT1,
						COLOR_ATTACHMENT2_WEBGL: gl.COLOR_ATTACHMENT2,
						COLOR_ATTACHMENT3_WEBGL: gl.COLOR_ATTACHMENT3,
						COLOR_ATTACHMENT4_WEBGL: gl.COLOR_ATTACHMENT4,
						COLOR_ATTACHMENT5_WEBGL: gl.COLOR_ATTACHMENT5,
						COLOR_ATTACHMENT6_WEBGL: gl.COLOR_ATTACHMENT6,
						COLOR_ATTACHMENT7_WEBGL: gl.COLOR_ATTACHMENT7,
						COLOR_ATTACHMENT8_WEBGL: gl.COLOR_ATTACHMENT8,
						COLOR_ATTACHMENT9_WEBGL: gl.COLOR_ATTACHMENT9,
						COLOR_ATTACHMENT10_WEBGL: gl.COLOR_ATTACHMENT10,
						COLOR_ATTACHMENT11_WEBGL: gl.COLOR_ATTACHMENT11,
						COLOR_ATTACHMENT12_WEBGL: gl.COLOR_ATTACHMENT12,
						COLOR_ATTACHMENT13_WEBGL: gl.COLOR_ATTACHMENT13,
						COLOR_ATTACHMENT14_WEBGL: gl.COLOR_ATTACHMENT14,
						COLOR_ATTACHMENT15_WEBGL: gl.COLOR_ATTACHMENT15,

						DRAW_BUFFER0_WEBGL: gl.DRAW_BUFFER0,
						DRAW_BUFFER1_WEBGL: gl.DRAW_BUFFER1,
						DRAW_BUFFER2_WEBGL: gl.DRAW_BUFFER2,
						DRAW_BUFFER3_WEBGL: gl.DRAW_BUFFER3,
						DRAW_BUFFER4_WEBGL: gl.DRAW_BUFFER4,
						DRAW_BUFFER5_WEBGL: gl.DRAW_BUFFER5,
						DRAW_BUFFER6_WEBGL: gl.DRAW_BUFFER6,
						DRAW_BUFFER7_WEBGL: gl.DRAW_BUFFER7,
						DRAW_BUFFER8_WEBGL: gl.DRAW_BUFFER8,
						DRAW_BUFFER9_WEBGL: gl.DRAW_BUFFER9,
						DRAW_BUFFER10_WEBGL: gl.DRAW_BUFFER10,
						DRAW_BUFFER11_WEBGL: gl.DRAW_BUFFER11,
						DRAW_BUFFER12_WEBGL: gl.DRAW_BUFFER12,
						DRAW_BUFFER13_WEBGL: gl.DRAW_BUFFER13,
						DRAW_BUFFER14_WEBGL: gl.DRAW_BUFFER14,
						DRAW_BUFFER15_WEBGL: gl.DRAW_BUFFER15,

						MAX_COLOR_ATTACHMENTS_WEBGL: gl.MAX_COLOR_ATTACHMENTS,

						MAX_DRAW_BUFFERS_WEBGL: gl.MAX_DRAW_BUFFERS,

						drawBuffersWEBGL: function ( buffers ) {

							gl.drawBuffers( buffers );

						}

					};
					break;

				default:
					extension = gl.getExtension( name );

			}

			return extension;

		}

	};

}


export { WebGLExtensions };
