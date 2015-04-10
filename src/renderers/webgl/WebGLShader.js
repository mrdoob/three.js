/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.WebGLShader = function ( gl, type, source ) {

	this.id = THREE.WebGLShader._shaderIdCount++;

	this._type = type;
	this._source = source;
	this._compileMessage = '';
	this._state = THREE.WebGLShader.CompilingState;
	this._gl = gl;
	this.usedTimes = 1;

	this._shader = gl.createShader( type );
	gl.shaderSource( this._shader, this._source );
	gl.compileShader( this._shader );

};

THREE.WebGLShader.CompilingState = 0;
THREE.WebGLShader.CompileErrorState = 1;
THREE.WebGLShader.CompiledState = 2;
THREE.WebGLShader._shaderIdCount = 0;

THREE.WebGLShader.prototype = {

	constructor: THREE.WebGLShader,

	_updateCompileState: ( function () {

		function addLineNumbers( source ) {

			var lines = source.split( '\n' );

				for ( var i = 0; i < lines.length; i ++ ) {

					lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];

				}

				return lines.join( '\n' );

			}

		return function () {

			if ( this._gl.getShaderParameter( this._shader, this._gl.COMPILE_STATUS ) === false ) {

				this._compileMessage = 'THREE.WebGLShader: Shader couldn\'t compile.';
				THREE.error( this._compileMessage );
				this._state = THREE.WebGLShader.CompileErrorState;

			} else {

				this._state = THREE.WebGLShader.CompiledState;

			}

			var log = this._gl.getShaderInfoLog( this._shader );

			if ( log !== '' ) {

				var detail = ['THREE.WebGLShader: gl.getShaderInfoLog()', this._type === this._gl.VERTEX_SHADER ? 'vertex' : 'fragment', log, addLineNumbers( this._source )].join( '\n' );
				this._compileMessage += '\n' + detail;
				THREE.warn( detail );

			}

			// --enable-privileged-webgl-extension
			// THREE.log( type, gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

			// Clean up

			if ( this._state === THREE.WebGLShader.CompileErrorState ) {

				this.dispose();

			}

		};

	} )(),

	get compileMessage() {

		return this._compileMessage;

	},

	get shader() {

		return this._shader;

	},

	get source() {

		return this._source;

	},

	get state() {

		if ( this._state === THREE.WebGLShader.CompilingState ) {

			this._updateCompileState();

		}

		return this._state;

	},

	get type() {

		return this._type;

	},
	
	dispose: function () {

		this.usedTimes--;

		if ( this.usedTimes === 0 ) {

			if ( this._shader ) {

				this._gl.deleteShader( this._shader );
				this._shader = null;

			}

			this._gl = null;

		}

	}

};
