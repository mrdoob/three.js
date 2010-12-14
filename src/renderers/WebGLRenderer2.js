/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer2 = function () {

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

		// Setup camera matrices

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

			// Setup object matrices

			_objectMatrixArray.set( object.matrix.flatten() );

			_modelViewMatrix.multiply( camera.matrix, object.matrix );
			_modelViewMatrixArray.set( _modelViewMatrix.flatten() );

			_normalMatrix = THREE.Matrix4.makeInvert3x3( _modelViewMatrix ).transpose();
			_normalMatrixArray.set( _normalMatrix.m );

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

					if ( material instanceof THREE.MeshBasicMaterial ||
					material instanceof THREE.MeshLambertMaterial ||
					material instanceof THREE.MeshPhongMaterial ) {

						_gl.uniform3f( program.uniforms.mColor, material.color.r, material.color.g, material.color.b );
						_gl.uniform1f( program.uniforms.mOpacity, material.opacity );

						if ( material.map ) {

							setTexture( material.map, 0 );
							_gl.uniform1i( program.uniforms.tMap, 0 );

						}

					} else if ( material instanceof THREE.MeshNormalMaterial ) {

						_gl.uniform1f( program.uniforms.mOpacity, material.opacity );

					}


					_gl.uniform3f( program.uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );

					_gl.uniformMatrix4fv( program.uniforms.viewMatrix, false, _viewMatrixArray );
					_gl.uniformMatrix4fv( program.uniforms.projectionMatrix, false, _projectionMatrixArray );
					_gl.uniformMatrix4fv( program.uniforms.objectMatrix, false, _objectMatrixArray );
					_gl.uniformMatrix4fv( program.uniforms.modelViewMatrix, false, _modelViewMatrixArray );
					_gl.uniformMatrix3fv( program.uniforms.normalMatrix, false, _normalMatrixArray );

					_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglBuffers.vertexBuffer );
					_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

					if ( attributes.normal >= 0 ) {

						_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglBuffers.normalBuffer );
						_gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );

					}

					if ( attributes.uv >= 0 ) {

						if ( geometry.__webglBuffers.uvBuffer ) {

							_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglBuffers.uvBuffer );

							_gl.enableVertexAttribArray( attributes.uv );
							_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 0, 0 );

						} else {

							_gl.disableVertexAttribArray( attributes.uv );

						}

					}

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

		// Buffers

		function buildBuffers( geometry ) {

			var f, fl, face, v1, v2, v3, vertexNormals, normal, uv,
			vertexIndex = 0, verticesArray = [], facesArray = [], linesArray = [],
			normalsArray = [], uvsArray = [],
			buffers = {};

			for ( f = 0, fl = geometry.faces.length; f < fl; f++ ) {

				face = geometry.faces[ f ];
				uv = geometry.uvs[ f ];
				vertexNormals = face.vertexNormals;
				faceNormal = face.normal;

				if ( face instanceof THREE.Face3 ) {

					v1 = geometry.vertices[ face.a ].position;
					v2 = geometry.vertices[ face.b ].position;
					v3 = geometry.vertices[ face.c ].position;

					verticesArray.push( v1.x, v1.y, v1.z );
					verticesArray.push( v2.x, v2.y, v2.z );
					verticesArray.push( v3.x, v3.y, v3.z );

					if ( vertexNormals.length == 3 ) {

						for ( i = 0; i < 3; i ++ ) {

							normalsArray.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

						}

					} else {

						for ( i = 0; i < 3; i ++ ) {

							normalsArray.push( faceNormal.x, faceNormal.y, faceNormal.z );

						}

					}

					if ( uv ) {

						for ( i = 0; i < 3; i ++ ) {

							uvsArray.push( uv[ i ].u, uv[ i ].v );

						}

					}

					facesArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );

					// TODO: don't add lines that already exist (faces sharing edge)

					linesArray.push( vertexIndex, vertexIndex + 1 );
					linesArray.push( vertexIndex, vertexIndex + 2 );
					linesArray.push( vertexIndex + 1, vertexIndex + 2 );

					vertexIndex += 3;

				} else if ( face instanceof THREE.Face4 ) {

					v1 = geometry.vertices[ face.a ].position;
					v2 = geometry.vertices[ face.b ].position;
					v3 = geometry.vertices[ face.c ].position;
					v4 = geometry.vertices[ face.d ].position;

					verticesArray.push( v1.x, v1.y, v1.z );
					verticesArray.push( v2.x, v2.y, v2.z );
					verticesArray.push( v3.x, v3.y, v3.z );
					verticesArray.push( v4.x, v4.y, v4.z );

					if ( vertexNormals.length == 4 ) {

						for ( i = 0; i < 4; i ++ ) {

							normalsArray.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

						}

					} else {

						for ( i = 0; i < 4; i ++ ) {

							normalsArray.push( faceNormal.x, faceNormal.y, faceNormal.z );

						}

					}

					if ( uv ) {

						for ( i = 0; i < 4; i ++ ) {

							uvsArray.push( uv[ i ].u, uv[ i ].v );

						}

					}

					facesArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
					facesArray.push( vertexIndex, vertexIndex + 2, vertexIndex + 3 );

					// TODO: don't add lines that already exist (faces sharing edge)

					linesArray.push( vertexIndex, vertexIndex + 1 );
					linesArray.push( vertexIndex, vertexIndex + 2 );
					linesArray.push( vertexIndex, vertexIndex + 3 );
					linesArray.push( vertexIndex + 1, vertexIndex + 2 );
					linesArray.push( vertexIndex + 2, vertexIndex + 3 );

					vertexIndex += 4;

				}

			}

			if ( !verticesArray.length ) return false;

			buffers.vertexBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.vertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( verticesArray ), _gl.STATIC_DRAW );

			buffers.normalBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.normalBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( normalsArray ), _gl.STATIC_DRAW );

			if ( uvsArray.length > 0 ) {

				buffers.uvBuffer = _gl.createBuffer();
				_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.uvBuffer );
				_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( uvsArray ), _gl.STATIC_DRAW );

			}

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

		// Shaders

		function createProgram( material ) {

			var pvs = '', vs = '', pfs = '', fs = '',
			identifiers = [ 'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'objectMatrix', 'cameraPosition' ];

			if ( material instanceof THREE.MeshBasicMaterial ||
			material instanceof THREE.MeshLambertMaterial ||
			material instanceof THREE.MeshPhongMaterial ) {

				vs += 'void main() {\n';
				fs += 'void main() {\n';

				vs += 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n';

				pfs += 'uniform vec3 mColor;\n';
				pfs += 'uniform float mOpacity;\n';

				fs += 'gl_FragColor = vec4( mColor.xyz, mOpacity );\n';

				if ( material.map ) {

					pvs += 'varying vec2 vUv;\n',
					vs += 'vUv = uv;\n',

					pfs += 'uniform sampler2D tMap;\n';
					pfs += 'varying vec2 vUv;\n';
					fs += 'gl_FragColor *= texture2D( tMap, vUv );\n';

					identifiers.push( 'tMap' );

				}

				identifiers.push( 'mColor' );
				identifiers.push( 'mOpacity' );

				vs += '}';
				fs += '}';


			} else if ( material instanceof THREE.MeshNormalMaterial ) {

				vs += 'void main() {\n';
				fs += 'void main() {\n';

				pvs += 'varying vec3 vNormal;\n';
				vs += 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n';
				vs += 'vNormal = normalize( normalMatrix * normal );\n';

				pfs += 'uniform float mOpacity;\n';
				pfs += 'varying vec3 vNormal;\n';
				fs += 'gl_FragColor = vec4( ( normalize( vNormal ) + 1.0 ) * 0.5, mOpacity );\n';

				identifiers.push( 'mOpacity' );

				vs += '}';
				fs += '}';


			} else if ( material instanceof THREE.MeshShaderMaterial ) {

				vs = material.vertex_shader;
				fs = material.fragment_shader;

				for( uniform in material.uniforms ) {

					identifiers.push( uniform );

				}

			} else {

				return false;

			}

			material.__webglProgram = compileProgram( pvs + vs, pfs + fs );

			cacheUniformLocations( material.__webglProgram, identifiers );
			cacheAttributeLocations( material.__webglProgram, [ "position", "normal", "uv"/*, "tangent"*/ ] );

			return true;

		}

		function compileProgram( vertex_shader, fragment_shader ) {

			var program = _gl.createProgram(), shader

			prefix_vertex = [
				maxVertexTextures() > 0 ? "#define VERTEX_TEXTURES" : "",

				"uniform mat4 objectMatrix;",
				"uniform mat4 modelViewMatrix;",
				"uniform mat4 projectionMatrix;",
				//"uniform mat4 viewMatrix;",
				"uniform mat3 normalMatrix;",
				"uniform vec3 cameraPosition;",
				"attribute vec3 position;",
				"attribute vec3 normal;",
				"attribute vec2 uv;",
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

				alert( "Could not initialise shaders.\n" +
				"VALIDATE_STATUS: " + _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) + "\n" +
				"ERROR: " + _gl.getError() + "\n\n" +
				"Vertex Shader: \n" + prefix_vertex + vertex_shader + "\n\n" +
				"Fragment Shader: \n" + prefix_fragment + fragment_shader );

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

		// Textures

		function setTexture( texture, slot ) {

			if ( !texture.__webglTexture && texture.image.loaded ) {

				texture.__webglTexture = _gl.createTexture();
				_gl.bindTexture( _gl.TEXTURE_2D, texture.__webglTexture );
				_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image );

				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( texture.wrap_s ) );
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( texture.wrap_t ) );

				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( texture.mag_filter ) );
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( texture.min_filter ) );
				_gl.generateMipmap( _gl.TEXTURE_2D );
				_gl.bindTexture( _gl.TEXTURE_2D, null );

			}

			_gl.activeTexture( _gl.TEXTURE0 + slot );
			_gl.bindTexture( _gl.TEXTURE_2D, texture.__webglTexture );

		}

		function maxVertexTextures() {

			return _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );

		};

		function paramThreeToGL( p ) {

			switch ( p ) {

				case THREE.RepeatWrapping: return _gl.REPEAT; break;
				case THREE.ClampToEdgeWrapping: return _gl.CLAMP_TO_EDGE; break;
				case THREE.MirroredRepeatWrapping: return _gl.MIRRORED_REPEAT; break;

				case THREE.NearestFilter: return _gl.NEAREST; break;
				case THREE.NearestMipMapNearestFilter: return _gl.NEAREST_MIPMAP_NEAREST; break;
				case THREE.NearestMipMapLinearFilter: return _gl.NEAREST_MIPMAP_LINEAR; break;

				case THREE.LinearFilter: return _gl.LINEAR; break;
				case THREE.LinearMipMapNearestFilter: return _gl.LINEAR_MIPMAP_NEAREST; break;
				case THREE.LinearMipMapLinearFilter: return _gl.LINEAR_MIPMAP_LINEAR; break;

			}

			return 0;

		}


	};

};
