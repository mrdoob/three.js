/**
 * @author mrdoob / http://mrdoob.com/
 */

class WebGLCapabilities {

	constructor( gl, extensions, parameters ) {

		this.gl = gl;

		this.extensions = extensions;

		this.maxAnisotropy;
		/* eslint-disable no-undef */
		this.isWebGL2 = ( typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ) ||
			( typeof WebGL2ComputeRenderingContext !== 'undefined' && gl instanceof WebGL2ComputeRenderingContext );
		/* eslint-enable no-undef */

		this.precision = parameters.precision !== undefined ? parameters.precision : 'highp';
		this.maxPrecision = this.getMaxPrecision( this.precision );

		if ( this.maxPrecision !== this.precision ) {

			console.warn( 'THREE.WebGLRenderer:', this.precision, 'not supported, using', this.maxPrecision, 'instead.' );
			this.precision = this.maxPrecision;

		}

		this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

		this.maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
		this.maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
		this.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
		this.maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

		this.maxAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
		this.maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
		this.maxVaryings = gl.getParameter( gl.MAX_VARYING_VECTORS );
		this.maxFragmentUniforms = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

		this.vertexTextures = this.maxVertexTextures > 0;
		this.floatFragmentTextures = this.isWebGL2 || !! this.extensions.get( 'OES_texture_float' );
		this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;

		this.maxSamples = this.isWebGL2 ? gl.getParameter( gl.MAX_SAMPLES ) : 0;

	}

	getMaxAnisotropy() {

		if ( this.maxAnisotropy !== undefined ) return this.maxAnisotropy;

		var extension = this.extensions.get( 'EXT_texture_filter_anisotropic' );

		if ( extension !== null ) {

			this.maxAnisotropy = this.gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			this.maxAnisotropy = 0;

		}

		return this.maxAnisotropy;

	}

	getMaxPrecision( precision ) {

		if ( precision === 'highp' ) {

			if ( this.gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
				this.gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {

				return 'highp';

			}

			precision = 'mediump';

		}

		if ( precision === 'mediump' ) {

			if ( this.gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision > 0 &&
				this.gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision > 0 ) {

				return 'mediump';

			}

		}

		return 'lowp';

	}

}


export { WebGLCapabilities };
