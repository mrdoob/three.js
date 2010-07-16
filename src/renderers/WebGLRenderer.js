/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer = function () {

	var _canvas = document.createElement( 'canvas' ), _gl, _program,
	viewMatrix = new THREE.Matrix4();

	this.domElement = _canvas;
	this.autoClear = true;

	initGL();
	initProgram();

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.render = function ( scene, camera ) {

		var face, faceColor, object, material,
		vertexArray, faceArray, colorArray, vertexIndex,
		o, ol, f, fl, m, ml, i, v1, v2, v3, v4;

		if ( this.autoClear ) {

			this.clear();

		}

		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			if ( object instanceof THREE.Mesh ) {

				if ( !object.__webGLVertexBuffer ) {

					vertexArray = [];
					faceArray = [];
					colorArray = [];
					vertexIndex = 0;

					for ( f = 0, fl = object.geometry.faces.length; f < fl; f++ ) {

						face = object.geometry.faces[ f ];
						faceColor = face.color;

						if ( face instanceof THREE.Face3 ) {

							v1 = object.geometry.vertices[ face.a ].position;
							v2 = object.geometry.vertices[ face.b ].position;
							v3 = object.geometry.vertices[ face.c ].position;

							vertexArray.push( v1.x, v1.y, v1.z );
							vertexArray.push( v2.x, v2.y, v2.z );
							vertexArray.push( v3.x, v3.y, v3.z );

							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );

							faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );

							vertexIndex += 3;

						} else if ( face instanceof THREE.Face4 ) {

							v1 = object.geometry.vertices[ face.a ].position;
							v2 = object.geometry.vertices[ face.b ].position;
							v3 = object.geometry.vertices[ face.c ].position;
							v4 = object.geometry.vertices[ face.d ].position;

							vertexArray.push( v1.x, v1.y, v1.z );
							vertexArray.push( v2.x, v2.y, v2.z );
							vertexArray.push( v3.x, v3.y, v3.z );
							vertexArray.push( v4.x, v4.y, v4.z );

							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
							colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );

							faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
							faceArray.push( vertexIndex, vertexIndex + 2, vertexIndex + 3 );

							vertexIndex += 4;
						}
					}

					if ( !vertexArray.length ) {

						continue;

					}

					object.__webGLVertexBuffer = _gl.createBuffer();
					_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLVertexBuffer );
					_gl.bufferData( _gl.ARRAY_BUFFER, new WebGLFloatArray( vertexArray ), _gl.STATIC_DRAW );

					object.__webGLColorBuffer = _gl.createBuffer();
					_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLColorBuffer );
					_gl.bufferData( _gl.ARRAY_BUFFER, new WebGLFloatArray( colorArray ), _gl.STATIC_DRAW );

					object.__webGLFaceBuffer = _gl.createBuffer();
					_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, object.__webGLFaceBuffer );
					_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray( faceArray ), _gl.STATIC_DRAW );

					object.__webGLFaceCount = faceArray.length;

				}


				viewMatrix.multiply( camera.matrix, object.matrix );

				matrix2Array( viewMatrix, _program.viewMatrixArray );
				matrix2Array( camera.projectionMatrix, _program.projectionMatrixArray );

				_gl.uniformMatrix4fv( _program.viewMatrix, false, _program.viewMatrixArray );
				_gl.uniformMatrix4fv( _program.projectionMatrix, false, _program.projectionMatrixArray );

				_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLVertexBuffer );
				_gl.vertexAttribPointer( _program.position, 3, _gl.FLOAT, false, 0, 0 );


				for ( m = 0, ml = object.material.length; m < ml; m++ ) {

					material = object.material[ m ];

					if ( material instanceof THREE.MeshColorFillMaterial ) {

						if ( !material.__webGLColorBuffer ) {

							colorArray = [];

							for ( i = 0; i < object.__webGLFaceCount; i ++ ) {

								colorArray.push( material.color.r, material.color.g, material.color.b, material.color.a );

							}

							material.__webGLColorBuffer = _gl.createBuffer();
							_gl.bindBuffer( _gl.ARRAY_BUFFER, material.__webGLColorBuffer );
							_gl.bufferData( _gl.ARRAY_BUFFER, new WebGLFloatArray( colorArray ), _gl.STATIC_DRAW );

						}

						_gl.bindBuffer( _gl.ARRAY_BUFFER, material.__webGLColorBuffer );
						_gl.vertexAttribPointer( _program.color, 4, _gl.FLOAT, false, 0, 0 );

					} else if ( material instanceof THREE.MeshFaceColorFillMaterial ) {

						_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLColorBuffer );
						_gl.enableVertexAttribArray( _program.color );
						_gl.vertexAttribPointer( _program.color, 4, _gl.FLOAT, false, 0, 0 );

					}

				}

				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, object.__webGLFaceBuffer );
				_gl.drawElements( _gl.TRIANGLES, object.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );

			}
		}

	};

	function initGL() {

		try {

			_gl = _canvas.getContext( 'experimental-webgl' );

		} catch(e) { }

		if (!_gl) {

			alert("WebGL not supported");
			throw "cannot create webgl context";

		}

		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL );

		_gl.enable( _gl.BLEND );
		_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );
		// _gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE ); // cool!
		_gl.clearColor( 0, 0, 0, 0 );

	}

	function initProgram() {

		_program = _gl.createProgram();

		_gl.attachShader( _program, getShader( "fragment", [
								"varying vec4 vcolor;",

								"void main(){",

									"gl_FragColor = vcolor;",

								"}"].join("") ) );

		_gl.attachShader( _program, getShader( "vertex", [
								"attribute vec3 position;",
								"attribute vec4 color;",

								"uniform mat4 viewMatrix;",
								"uniform mat4 projectionMatrix;",
								"varying vec4 vcolor;",

								"void main(void) {",

									"vcolor = color;",
									"gl_Position = projectionMatrix * viewMatrix * vec4( position, 1 );",

								"}"].join("") ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

		}

		_gl.useProgram( _program );

		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.projectionMatrix = _gl.getUniformLocation( _program, "projectionMatrix" );

		_program.color = _gl.getAttribLocation( _program, "color" );
		_gl.enableVertexAttribArray( _program.color );

		_program.position = _gl.getAttribLocation( _program, "position" );
		_gl.enableVertexAttribArray( _program.position );

		_program.viewMatrixArray = new WebGLFloatArray( 16 );
		_program.projectionMatrixArray = new WebGLFloatArray( 16 );

	}

	function getShader( type, string ) {

		var shader;

		if ( type == "fragment" ) {

			shader = _gl.createShader( _gl.FRAGMENT_SHADER );

		} else if ( type == "vertex" ) {

			shader = _gl.createShader( _gl.VERTEX_SHADER );

		}

		_gl.shaderSource( shader, string );
		_gl.compileShader( shader );

		if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {

			alert( _gl.getShaderInfoLog( shader ) );
			return null;

		}

		return shader;
	}

	function matrix2Array( matrix, array ) {

		// Also flatten

		array[ 0 ] = matrix.n11; array[ 1 ] = matrix.n21; array[ 2 ] = matrix.n31; array[ 3 ] = matrix.n41;
		array[ 4 ] = matrix.n12; array[ 5 ] = matrix.n22; array[ 6 ] = matrix.n32; array[ 7 ] = matrix.n42;
		array[ 8 ] = matrix.n13; array[ 9 ] = matrix.n23; array[ 10 ] = matrix.n33; array[ 11 ] = matrix.n43;
		array[ 12 ] = matrix.n14; array[ 13 ] = matrix.n24; array[ 14 ] = matrix.n34; array[ 15 ] = matrix.n44;

	}

};
