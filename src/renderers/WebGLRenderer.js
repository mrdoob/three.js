/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer = function () {

	var _canvas = document.createElement( 'canvas' ), _gl, _program,
	viewMatrix = new THREE.Matrix4(), normalMatrix;

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

		var face, faceColor, object, material, normal, lightColor, lightDirection, light,
		vertexArray, faceArray, colorArray, normalArray, vertexIndex,
		o, ol, f, fl, m, ml, i, v1, v2, v3, v4,
		l, ll;

		if ( this.autoClear ) {

			this.clear();

		}

		//lighting
		_gl.uniform1i( _program.enableLighting, scene.lights.length );
    
    for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {
      
      light = scene.lights[ l ];
      
      if ( light instanceof THREE.AmbientLight ) {
        
        lightColor = light.color;
        _gl.uniform3f( _program.ambientColor, lightColor.r, lightColor.g, lightColor.b );
        
      } else if( light instanceof THREE.DirectionalLight ) {
        
        lightColor = light.color;
        lightDirection = light.direction;
        _gl.uniform3f( _program.lightingDirection, lightDirection.x, lightDirection.y, lightDirection.z );
        _gl.uniform3f( _program.directionalColor, lightColor.r, lightColor.g, lightColor.b );
        
      }
      
    }

    for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			if ( object instanceof THREE.Mesh ) {

				if ( !object.__webGLVertexBuffer ) {

					vertexArray = [];
					faceArray = [];
					colorArray = [];
					normalArray = [];
					vertexIndex = 0;

					for ( f = 0, fl = object.geometry.faces.length; f < fl; f++ ) {

						face = object.geometry.faces[ f ];
						faceColor = face.color;
						normal = face.normal;

						if ( face instanceof THREE.Face3 ) {

							v1 = object.geometry.vertices[ face.a ].position;
							v2 = object.geometry.vertices[ face.b ].position;
							v3 = object.geometry.vertices[ face.c ].position;

							vertexArray.push( v1.x, v1.y, v1.z );
							vertexArray.push( v2.x, v2.y, v2.z );
							vertexArray.push( v3.x, v3.y, v3.z );

              normalArray.push( n.x, n.y, n.z );
              normalArray.push( n.x, n.y, n.z );
              normalArray.push( n.x, n.y, n.z );

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

              normalArray.push( n.x, n.y, n.z );
              normalArray.push( n.x, n.y, n.z );
              normalArray.push( n.x, n.y, n.z );
              normalArray.push( n.x, n.y, n.z );

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
					_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertexArray ), _gl.STATIC_DRAW );

          object.__webGLNormalBuffer = _gl.createBuffer();
          _gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLNormalBuffer );
          _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( normalArray ), _gl.STATIC_DRAW );

					object.__webGLColorBuffer = _gl.createBuffer();
					_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLColorBuffer );
					_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( colorArray ), _gl.STATIC_DRAW );

					object.__webGLFaceBuffer = _gl.createBuffer();
					_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, object.__webGLFaceBuffer );
					_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( faceArray ), _gl.STATIC_DRAW );

					object.__webGLFaceCount = faceArray.length;

				}


				viewMatrix.multiply( camera.matrix, object.matrix );

				_program.viewMatrixArray = new Float32Array( viewMatrix.flatten() );
				_program.projectionMatrixArray = new Float32Array( camera.projectionMatrix.flatten() );

		    normalMatrix = Matrix4.makeInvert(viewMatrix).transpose();
		    _program.normalMatrixArray = new Float32Array( normalMatrix.flatten() );
		    
				_gl.uniformMatrix4fv( _program.viewMatrix, false, _program.viewMatrixArray );
				_gl.uniformMatrix4fv( _program.projectionMatrix, false, _program.projectionMatrixArray );
				_gl.uniformMatrix4fv( _program.normalMatrix, false, _program.normalMatrixArray );

				_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLVertexBuffer );
				_gl.vertexAttribPointer( _program.position, 3, _gl.FLOAT, false, 0, 0 );

        _gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLNormalBuffer );
        _gl.vertexAttribPointer( _program.normal, 3, _gl.FLOAT, false, 0, 0 );

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
							_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( colorArray ), _gl.STATIC_DRAW );

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
								"#ifdef GL_ES",
								"precision highp float;",
								"#endif",
								
							  "varying vec4 vcolor;",
							  "varying vec3 lightWeighting;",
							  
							  "void main(){",
							  
							    "gl_FragColor = vec4(vcolor.rgb * lightWeighting, vcolor.a);",
							  
							  "}"
							  ].join("\n") ) );

		_gl.attachShader( _program, getShader( "vertex", [
								"attribute vec3 position;",
                "attribute vec3 normal;",
								"attribute vec4 color;",

							  "uniform bool enableLighting;",
							  "uniform vec3 ambientColor;",
							  "uniform vec3 directionalColor;",
							  "uniform vec3 lightingDirection;",
							  
								"uniform mat4 viewMatrix;",
								"uniform mat4 projectionMatrix;",
                "uniform mat4 normalMatrix;",
								"varying vec4 vcolor;",
							  "varying vec3 lightWeighting;",

								"void main(void) {",
							  
  						    "if(!enableLighting) {",
  						      "lightWeighting = vec3(1.0, 1.0, 1.0);",
  						    "} else {",
  						      "vec4 transformedNormal = normalMatrix * vec4(normal, 1.0);",
  						      "float directionalLightWeighting = max(dot(transformedNormal.xyz, lightingDirection), 0.0);",
  						      "lightWeighting = ambientColor + directionalColor * directionalLightWeighting;",
  						    "}",

									"vcolor = color;",
									"gl_Position = projectionMatrix * viewMatrix * vec4( position, 1.0 );",

								"}"].join("\n") ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

		}

		_gl.useProgram( _program );

		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.projectionMatrix = _gl.getUniformLocation( _program, "projectionMatrix" );
		_program.normalMatrix = _gl.getUniformLocation( _program, "normalMatrix" );

    _program.enableLighting = _gl.getUniformLocation(program, 'enableLighting');
    _program.ambientColor = _gl.getUniformLocation(program, 'ambientColor');
    _program.directionalColor = _gl.getUniformLocation(program, 'directionalColor');
    _program.lightingDirection = _gl.getUniformLocation(program, 'lightingDirection');
    
		_program.color = _gl.getAttribLocation( _program, "color" );
		_gl.enableVertexAttribArray( _program.color );

		_program.position = _gl.getAttribLocation( _program, "position" );
		_gl.enableVertexAttribArray( _program.position );

    _program.normal = _gl.getAttribLocation( _program, "normal" );
    _gl.enableVertexAttribArray( _program.normal );

		_program.viewMatrixArray = new Float32Array(16);
		_program.projectionMatrixArray = new Float32Array(16);

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

};
