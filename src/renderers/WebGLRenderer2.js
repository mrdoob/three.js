/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer2 = function ( scene ) {

	var _canvas = document.createElement( 'canvas' ),
	_gl, _currentProgram,
	_modelViewMatrix = new THREE.Matrix4(),
	_viewMatrixArray = new Float32Array( 16 ),
	_modelViewMatrixArray = new Float32Array( 16 ),
	_projectionMatrixArray = new Float32Array( 16 ),
	_normalMatrixArray = new Float32Array( 9 ),
	_objectMatrixArray = new Float32Array( 16 );

	try {

		_gl = _canvas.getContext( 'experimental-webgl', { antialias: true } );

	} catch(e) { }

	if ( !_gl ) {

		alert("WebGL not supported");
		throw "cannot create webgl context";

	}

	_gl.clearColor( 0, 0, 0, 1 );
	_gl.clearDepth( 1 );

	_gl.enable( _gl.DEPTH_TEST );
	_gl.depthFunc( _gl.LEQUAL );

	_gl.frontFace( _gl.CCW );
	_gl.cullFace( _gl.BACK );
	_gl.enable( _gl.CULL_FACE );

	_gl.enable( _gl.BLEND );
	_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );
	_gl.clearColor( 0, 0, 0, 0 );

	this.domElement = _canvas;
	this.autoClear = true;

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.render = function( scene, camera ) {

		var o, ol;

		this.autoClear && this.clear();

		camera.autoUpdateMatrix && camera.updateMatrix();

		_viewMatrixArray.set( camera.matrix.flatten() );
		_projectionMatrixArray.set( camera.projectionMatrix.flatten() );

		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			if ( object.visible ) {

				renderObject( object );

			}

		}

		function renderObject( object ) {

			var geometry, material, m, nl,
			program, attributes;

			object.autoUpdateMatrix && object.updateMatrix();

			_objectMatrixArray.set( object.matrix.flatten() );

			_modelViewMatrix.multiply( camera.matrix, object.matrix );
			_modelViewMatrixArray.set( _modelViewMatrix.flatten() );

			if ( object instanceof THREE.Mesh ) {

				geometry = object.geometry;

				if ( geometry.__webglBuffers == undefined ) {

					if ( buildBuffers( geometry ) == false ) return;

				}

				for ( m = 0, ml = object.material.length; m < ml; m ++ ) {

					material = object.material[ m ];

					if ( material.__webglProgram == undefined ) {

						if ( createProgram( material ) == false ) continue;

					}

					program = material.__webglProgram;
					attributes = program.attributes;

					if( program != _currentProgram ) {

						_gl.useProgram( program );
						_currentProgram = program;

					}

					if ( material instanceof THREE.MeshBasicMaterial ) {

						_gl.uniform4f( program.uniforms.mColor,  material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity, material.opacity );

					}


					_gl.uniform3f( program.uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );

					_gl.uniformMatrix4fv( program.uniforms.viewMatrix, false, _viewMatrixArray );
					_gl.uniformMatrix4fv( program.uniforms.projectionMatrix, false, _projectionMatrixArray );
					_gl.uniformMatrix4fv( program.uniforms.objectMatrix, false, _objectMatrixArray );
					_gl.uniformMatrix4fv( program.uniforms.modelViewMatrix, false, _modelViewMatrixArray );

					_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglBuffers.vertexBuffer );
					_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

					if ( ! material.wireframe ) {

						_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometry.__webglBuffers.faceBuffer );
						_gl.drawElements( _gl.TRIANGLES, geometry.__webglBuffers.faceCount, _gl.UNSIGNED_SHORT, 0 );

					} else {

						_gl.lineWidth( material.wireframe_linewidth );
						_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometry.__webglBuffers.lineBuffer );
						_gl.drawElements( _gl.LINES, geometry.__webglBuffers.lineCount, _gl.UNSIGNED_SHORT, 0 );

					}

				}

			}

		}

		function buildBuffers( geometry ) {

			var f, fl, face, v1, v2, v3, verticesIndex = 0,
			verticesArray = [], facesArray = [], linesArray = [],
			buffers = {};

			for ( f = 0, fl = geometry.faces.length; f < fl; f++ ) {

				face = geometry.faces[ f ];

				if ( face instanceof THREE.Face3 ) {

					v1 = geometry.vertices[ face.a ].position;
					v2 = geometry.vertices[ face.b ].position;
					v3 = geometry.vertices[ face.c ].position;

					verticesArray.push( v1.x, v1.y, v1.z );
					verticesArray.push( v2.x, v2.y, v2.z );
					verticesArray.push( v3.x, v3.y, v3.z );

					facesArray.push( verticesIndex, verticesIndex + 1, verticesIndex + 2 );

					// TODO: don't add lines that already exist (faces sharing edge)

					linesArray.push( verticesIndex, verticesIndex + 1 );
					linesArray.push( verticesIndex, verticesIndex + 2 );
					linesArray.push( verticesIndex + 1, verticesIndex + 2 );

					verticesIndex += 3;

				} else if ( face instanceof THREE.Face4 ) {

					v1 = geometry.vertices[ face.a ].position;
					v2 = geometry.vertices[ face.b ].position;
					v3 = geometry.vertices[ face.c ].position;
					v4 = geometry.vertices[ face.d ].position;

					verticesArray.push( v1.x, v1.y, v1.z );
					verticesArray.push( v2.x, v2.y, v2.z );
					verticesArray.push( v3.x, v3.y, v3.z );
					verticesArray.push( v4.x, v4.y, v4.z );

					facesArray.push( verticesIndex, verticesIndex + 1, verticesIndex + 2 );
					facesArray.push( verticesIndex, verticesIndex + 2, verticesIndex + 3 );

					// TODO: don't add lines that already exist (faces sharing edge)

					linesArray.push( verticesIndex, verticesIndex + 1 );
					linesArray.push( verticesIndex, verticesIndex + 2 );
					linesArray.push( verticesIndex, verticesIndex + 3 );
					linesArray.push( verticesIndex + 1, verticesIndex + 2 );
					linesArray.push( verticesIndex + 2, verticesIndex + 3 );

					verticesIndex += 4;

				}

			}

			if ( !verticesArray.length ) return false;

			buffers.vertexBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.vertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( verticesArray ), _gl.STATIC_DRAW );

			buffers.faceBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffers.faceBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( facesArray ), _gl.STATIC_DRAW );

			buffers.lineBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffers.lineBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( linesArray ), _gl.STATIC_DRAW );

			buffers.faceCount = facesArray.length;
			buffers.lineCount = linesArray.length;

			geometry.__webglBuffers = buffers;

			return true;

		}

		function createProgram( material ) {

			var vs = '', fs = '',
			identifiers = [ 'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'objectMatrix', 'cameraPosition' ];

			if ( material instanceof THREE.MeshBasicMaterial ) {

				vs += 'void main() {\n';
				vs += 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n';
				vs += '}'

				fs += 'uniform vec4 mColor;\n';
				fs += 'void main() {\n';
				fs += 'gl_FragColor = mColor;\n';
				fs += '}';

				identifiers.push( 'mColor' );

			} else if ( material instanceof THREE.MeshShaderMaterial ) {

				vs = material.vertex_shader;
				fs = material.fragment_shader;

				for( uniform in material.uniforms ) {

					identifiers.push( uniform );

				}

			} else {

				return false;

			}

			material.__webglProgram = compileProgram( vs, fs );

			cacheUniformLocations( material.__webglProgram, identifiers );
			cacheAttributeLocations( material.__webglProgram, [ "position", "normal", "uv", "tangent" ] );

			return true;

		}

		function compileProgram( vertex_shader, fragment_shader ) {

			var program = _gl.createProgram(), shader

			prefix_vertex = [
				//maxVertexTextures() > 0 ? "#define VERTEX_TEXTURES" : "",

				"uniform mat4 objectMatrix;",
				"uniform mat4 modelViewMatrix;",
				"uniform mat4 projectionMatrix;",
				//"uniform mat4 viewMatrix;",
				"uniform mat3 normalMatrix;",
				"uniform vec3 cameraPosition;",
				"attribute vec3 position;",
				//"attribute vec3 normal;",
				//"attribute vec2 uv;",
				""
			].join("\n"),

			prefix_fragment = [
				"#ifdef GL_ES",
					"precision highp float;",
				"#endif",
				//"uniform mat4 viewMatrix;",
				""
			].join("\n");

			// Vertex shader

			shader = _gl.createShader( _gl.VERTEX_SHADER );
			_gl.shaderSource( shader, prefix_vertex + vertex_shader );
			_gl.compileShader( shader );
			_gl.attachShader( program, shader );

			if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {

				alert( _gl.getShaderInfoLog( shader ) );
				return null;

			}

			// Fragment Shader

			shader = _gl.createShader( _gl.FRAGMENT_SHADER );
			_gl.shaderSource( shader, prefix_fragment + fragment_shader );
			_gl.compileShader( shader );
			_gl.attachShader( program, shader );

			if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {

				alert( _gl.getShaderInfoLog( shader ) );
				return null;

			}

			_gl.linkProgram( program );

			if ( !_gl.getProgramParameter( program, _gl.LINK_STATUS ) ) {

				alert( "Could not initialise shaders\n VALIDATE_STATUS: " + _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) + ", gl error [" + _gl.getError() + "]" );

			}

			program.uniforms = {};
			program.attributes = {};

			return program;

		}

		function cacheUniformLocations( program, identifiers ) {

			var i, l, id;

			for( i = 0, l = identifiers.length; i < l; i++ ) {

				id = identifiers[ i ];
				program.uniforms[ id ] = _gl.getUniformLocation( program, id );

			}

		}

		function cacheAttributeLocations( program, identifiers ) {

			var i, l, id;

			for( i = 0, l = identifiers.length; i < l; i++ ) {

				id = identifiers[ i ];
				program.attributes[ id ] = _gl.getAttribLocation( program, id );

				if ( program.attributes[ id ] >= 0 ) {

					_gl.enableVertexAttribArray( program.attributes[ id ] );

				}

			}

		}


	};

};
