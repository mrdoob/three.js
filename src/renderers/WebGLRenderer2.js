/**
 * @author mrdoob / http://mrdoob.com/
 *
 * Based on code by:
 * @author alteredq / http://alteredqualia.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 */

THREE.WebGLRenderer2 = function ( antialias ) {

	var _renderList = null,
	_projector = new THREE.Projector(),

	_canvas = document.createElement( 'canvas' ),

	_clearColor = new THREE.Color( 0x000000 ),
	_clearOpacity = 0,

	_gl, _currentProgram,

	_modelViewMatrix = new THREE.Matrix4(),
	_normalMatrix = new THREE.Matrix4(),
	_viewMatrixArray = new Float32Array( 16 ),
	_modelViewMatrixArray = new Float32Array( 16 ),
	_projectionMatrixArray = new Float32Array( 16 ),
	_normalMatrixArray = new Float32Array( 9 ),
	_objectMatrixArray = new Float32Array( 16 );

	try {

		antialias = antialias !== undefined ? antialias : true;
		_gl = _canvas.getContext( 'experimental-webgl', { antialias: antialias } );

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
	_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearOpacity );

	this.domElement = _canvas;

	this.autoClear = true;
	this.sortObjects = true;

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.setClearColor = function( color, opacity ) {

		_clearColor = color;
		_clearOpacity = opacity;

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearOpacity );

	};

	this.setClearColorHex = function( hex, opacity ) {

		_clearColor.setHex( hex );
		_clearOpacity = opacity;

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearOpacity );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.render = function( scene, camera ) {

		var o, ol;

		this.autoClear && this.clear();

		camera.matrixAutoUpdate && camera.updateMatrix();

		// Setup camera matrices

		_viewMatrixArray.set( camera.matrix.flatten() );
		_projectionMatrixArray.set( camera.projectionMatrix.flatten() );

		_currentProgram = null;

		/*
		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			renderObject( scene.objects[ o ] );

		}
		*/

		_renderList = _projector.projectObjects( scene, camera, this.sortObjects );

		for ( o = 0, ol = _renderList.length; o < ol; o++ ) {

			renderObject( _renderList[ o ].object );

		}

		function renderObject( object ) {

			var geometry, material, m, ml,
			program, uniforms, attributes;

			object.matrixAutoUpdate && object.updateMatrix();

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

				for ( m = 0, ml = object.materials.length; m < ml; m ++ ) {

					material = object.materials[ m ];

					if ( material.__webglProgram == undefined ) {

						if ( createProgram( material ) == false ) continue;

					}

					program = material.__webglProgram;
					uniforms = program.uniforms;
					attributes = program.attributes;

					if( program != _currentProgram ) {

						_currentProgram = program;

						_gl.useProgram( program );

						// scene

						if ( scene.fog ) {

							_gl.uniform1f( uniforms.fog, 1 );
							_gl.uniform1f( uniforms.fogNear, scene.fog.near );
							_gl.uniform1f( uniforms.fogFar, scene.fog.far );
							_gl.uniform3f( uniforms.fogColor, scene.fog.color.r, scene.fog.color.g, scene.fog.color.b );

						} else {

							_gl.uniform1f( uniforms.fog, 0 );

						}

						// material

						if ( material instanceof THREE.MeshBasicMaterial ||
						material instanceof THREE.MeshLambertMaterial ||
						material instanceof THREE.MeshPhongMaterial ) {

							_gl.uniform3f( uniforms.mColor, material.color.r, material.color.g, material.color.b );
							_gl.uniform1f( uniforms.mOpacity, material.opacity );

							if ( material.map ) {

								setTexture( material.map, 0 );
								_gl.uniform1i( uniforms.tMap, 0 );

							}

							if ( material.env_map ) {

								setTexture( material.env_map, 1 );
								_gl.uniform1i( uniforms.tSpherical, 1 );

							}

						} else if ( material instanceof THREE.MeshNormalMaterial ) {

							_gl.uniform1f( uniforms.mOpacity, material.opacity );

						} else if ( material instanceof THREE.MeshDepthMaterial ) {

							_gl.uniform1f( uniforms.mNear, camera.near );
							_gl.uniform1f( uniforms.mFar, camera.far );
							_gl.uniform1f( uniforms.mOpacity, material.opacity );

						}

						_gl.uniform3f( uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );
						_gl.uniformMatrix4fv( uniforms.viewMatrix, false, _viewMatrixArray );
						_gl.uniformMatrix4fv( uniforms.projectionMatrix, false, _projectionMatrixArray );

					}

					_gl.uniformMatrix4fv( uniforms.objectMatrix, false, _objectMatrixArray );
					_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, _modelViewMatrixArray );
					_gl.uniformMatrix3fv( uniforms.normalMatrix, false, _normalMatrixArray );

					var buffer, buffers = geometry.__webglBuffers;

					for ( var i = 0, l = buffers.length; i < l; i ++ ) {

						buffer = buffers[ i ];

						// vertices

						_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.vertices );
						_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );
						_gl.enableVertexAttribArray( attributes.position );

						// normals

						if ( attributes.normal >= 0 ) {

							_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.normals );
							_gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );
							_gl.enableVertexAttribArray( attributes.normal );

						}

						// uvs

						if ( attributes.uv >= 0 ) {

							if ( buffer.uvs ) {

								_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.uvs );
								_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 0, 0 );
								_gl.enableVertexAttribArray( attributes.uv );

							} else {

								_gl.disableVertexAttribArray( attributes.uv );

							}

						}

						// render triangles

						if ( ! material.wireframe ) {

							_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer.faces );
							_gl.drawElements( _gl.TRIANGLES, buffer.faceCount, _gl.UNSIGNED_SHORT, 0 );

						// render lines

						} else {

							_gl.lineWidth( material.wireframe_linewidth );
							_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer.lines );
							_gl.drawElements( _gl.LINES, buffer.lineCount, _gl.UNSIGNED_SHORT, 0 );

						}

					}

				}

			} else if ( object instanceof THREE.Line ) {



			} else if ( object instanceof THREE.Particle ) {



			}

		}

		// Buffers

		function buildBuffers( geometry ) {

			var itemCount = 0, vertexIndex, group,
			f, fl, face, v1, v2, v3, v4, vertexNormals, faceNormal, normal, uv,
			vertexGroups = [], faceGroups = [], lineGroups = [], normalGroups = [], uvGroups = [],
			vertices, faces, lines, normals, uvs;

			for ( f = 0, fl = geometry.faces.length; f < fl; f++ ) {

				face = geometry.faces[ f ];
				uv = geometry.uvs[ f ];
				vertexNormals = face.vertexNormals;
				faceNormal = face.normal;

				if ( face instanceof THREE.Face3 ) {

					itemCount += 3;
					group = Math.floor( itemCount / 65535 );

					if ( !vertexGroups[ group ] ) {

						vertexIndex = 0;
						vertices = vertexGroups[ group ] = [];
						normals = normalGroups[ group ] = [];
						uvs = uvGroups[ group ] = [];
						faces = faceGroups[ group ] = [];
						lines = lineGroups[ group ] = [];

					}

					v1 = geometry.vertices[ face.a ].position;
					v2 = geometry.vertices[ face.b ].position;
					v3 = geometry.vertices[ face.c ].position;

					vertices.push( v1.x, v1.y, v1.z );
					vertices.push( v2.x, v2.y, v2.z );
					vertices.push( v3.x, v3.y, v3.z );

					if ( vertexNormals.length == 3 ) {

						for ( i = 0; i < 3; i ++ ) {

							normals.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

						}

					} else {

						for ( i = 0; i < 3; i ++ ) {

							normals.push( faceNormal.x, faceNormal.y, faceNormal.z );

						}

					}

					if ( uv ) {

						for ( i = 0; i < 3; i ++ ) {

							uvs.push( uv[ i ].u, uv[ i ].v );

						}

					}

					faces.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );

					// TODO: don't add lines that already exist (faces sharing edge)

					lines.push( vertexIndex, vertexIndex + 1 );
					lines.push( vertexIndex, vertexIndex + 2 );
					lines.push( vertexIndex + 1, vertexIndex + 2 );

					vertexIndex += 3;

				} else if ( face instanceof THREE.Face4 ) {

					itemCount += 4;
					group = Math.floor( itemCount / 65535 );

					if ( !vertexGroups[ group ] ) {

						vertexIndex = 0;
						vertices = vertexGroups[ group ] = [];
						normals = normalGroups[ group ] = [];
						uvs = uvGroups[ group ] = [];
						faces = faceGroups[ group ] = [];
						lines = lineGroups[ group ] = [];

					}

					v1 = geometry.vertices[ face.a ].position;
					v2 = geometry.vertices[ face.b ].position;
					v3 = geometry.vertices[ face.c ].position;
					v4 = geometry.vertices[ face.d ].position;

					vertices.push( v1.x, v1.y, v1.z );
					vertices.push( v2.x, v2.y, v2.z );
					vertices.push( v3.x, v3.y, v3.z );
					vertices.push( v4.x, v4.y, v4.z );

					if ( vertexNormals.length == 4 ) {

						for ( i = 0; i < 4; i ++ ) {

							normals.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

						}

					} else {

						for ( i = 0; i < 4; i ++ ) {

							normals.push( faceNormal.x, faceNormal.y, faceNormal.z );

						}

					}

					if ( uv ) {

						for ( i = 0; i < 4; i ++ ) {

							uvs.push( uv[ i ].u, uv[ i ].v );

						}

					}

					faces.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
					faces.push( vertexIndex, vertexIndex + 2, vertexIndex + 3 );

					// TODO: don't add lines that already exist (faces sharing edge)

					lines.push( vertexIndex, vertexIndex + 1 );
					lines.push( vertexIndex, vertexIndex + 3 );
					lines.push( vertexIndex + 1, vertexIndex + 2 );
					lines.push( vertexIndex + 2, vertexIndex + 3 );

					vertexIndex += 4;

				}

			}

			if ( !vertices.length ) return false;

			var buffer, buffers = [];

			for ( var i = 0, l = group; i <= l; i ++ ) {

				buffer = {

					vertices: null,
					faces: null,
					faceCount: faceGroups[ i ].length,
					normals: null,
					lines: null,
					lineCount: lineGroups[ i ].length,
					uvs: null

				};

				buffer.vertices = _gl.createBuffer();
				_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.vertices );
				_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertexGroups[ i ] ), _gl.STATIC_DRAW );

				buffer.normals = _gl.createBuffer();
				_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.normals );
				_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( normalGroups[ i ] ), _gl.STATIC_DRAW );

				if ( uvs.length > 0 ) {

					buffer.uvs = _gl.createBuffer();
					_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer.uvs );
					_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( uvGroups[ i ] ), _gl.STATIC_DRAW );

				}

				buffer.faces = _gl.createBuffer();
				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer.faces );
				_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( faceGroups[ i ] ), _gl.STATIC_DRAW );

				buffer.lines = _gl.createBuffer();
				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, buffer.lines );
				_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( lineGroups[ i ] ), _gl.STATIC_DRAW );

				buffers.push( buffer );

			}

			geometry.__webglBuffers = buffers;

			return true;

		}

		// Shaders

		function createProgram( material ) {

			var vs, fs, identifiers = [ 'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'objectMatrix', 'cameraPosition' ];

			if ( material instanceof THREE.MeshBasicMaterial ||
			material instanceof THREE.MeshLambertMaterial ||
			material instanceof THREE.MeshPhongMaterial ) {

				vs = [
					material.map ? 'varying vec2 vUv;' : null,
					material.env_map ? 'varying vec2 vSpherical;' : null,

					'void main() {',
						'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

						material.map ? 'vUv = uv;' : null,

						material.env_map ? 'vec3 u = normalize( modelViewMatrix * vec4( position, 1.0 ) ).xyz;' : null,
						material.env_map ? 'vec3 n = normalize( normalMatrix * normal );' : null,
						material.env_map ? 'vec3 r = reflect( u, n );' : null,
						material.env_map ? 'float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z + 1.0 ) );' : null,
						material.env_map ? 'vSpherical.x = r.x / m + 0.5;' : null,
						material.env_map ? 'vSpherical.y = - r.y / m + 0.5;' : null,

					'}'
				].filter( removeNull ).join( '\n' );

				fs = [
					'uniform vec3 mColor;',
					'uniform float mOpacity;',

					material.map ? 'uniform sampler2D tMap;' : null,
					material.map ? 'varying vec2 vUv;' : null,

					material.env_map ? 'uniform sampler2D tSpherical;' : null,
					material.env_map ? 'varying vec2 vSpherical;' : null,

					material.fog ? 'uniform float fog;' : null,
					material.fog ? 'uniform float fogNear;' : null,
					material.fog ? 'uniform float fogFar;' : null,
					material.fog ? 'uniform vec3 fogColor;' : null,

					'void main() {',
						'gl_FragColor = vec4( mColor.xyz, mOpacity );',

						/* Premultiply alpha
						material.map ? 'vec4 mapColor = texture2D( tMap, vUv );' : null,
						material.map ? 'mapColor.xyz *= mapColor.w;' : null,
						*/

						material.map ? 'gl_FragColor *= texture2D( tMap, vUv );' : null,

						material.env_map ? 'gl_FragColor += texture2D( tSpherical, vSpherical );' : null,

						material.fog ? 'float depth = gl_FragCoord.z / gl_FragCoord.w;' : null,
						material.fog ? 'float fogFactor = fog * smoothstep( fogNear, fogFar, depth );' : null,
						material.fog ? 'gl_FragColor = mix( gl_FragColor, vec4( fogColor, 1.0 ), fogFactor );' : null,
					'}'
				].filter( removeNull ).join( '\n' );

				identifiers.push( 'mColor', 'mOpacity' );

				if ( material.map ) identifiers.push( 'tMap' );
				if ( material.env_map ) identifiers.push( 'tSpherical' );
				if ( material.fog ) identifiers.push( 'fog', 'fogColor', 'fogNear', 'fogFar' );


			} else if ( material instanceof THREE.MeshNormalMaterial ) {

				vs = [
					'varying vec3 vNormal;',

					'void main() {',
						'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
						'vNormal = normalize( normalMatrix * normal );',
					'}'
				].join( '\n' );

				fs = [
					'uniform float mOpacity;',
					'varying vec3 vNormal;',

					'void main() {',
						'gl_FragColor = vec4( ( normalize( vNormal ) + 1.0 ) * 0.5, mOpacity );',
					'}'
				].join( '\n' );

				identifiers.push( 'mOpacity' );

			} else if ( material instanceof THREE.MeshDepthMaterial ) {

				vs = [
					'void main() {',
						'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
					'}'

				].join( '\n' );

				fs = [
					'uniform float mNear;',
					'uniform float mFar;',
					'uniform float mOpacity;',

					'void main() {',
						'float depth = gl_FragCoord.z / gl_FragCoord.w;',
						'float color = 1.0 - smoothstep( mNear, mFar, depth );',
						'gl_FragColor = vec4( vec3( color ), 1.0 );',
					'}'
				].join( '\n' );

				identifiers.push( 'mNear', 'mFar', 'mOpacity' );

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
			cacheAttributeLocations( material.__webglProgram, [ "position", "normal", "uv"/*, "tangent"*/ ] );

			return true;

		}

		function compileProgram( vertex_shader, fragment_shader ) {

			var program = _gl.createProgram(), shader, prefix_vertex, prefix_fragment;

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
				"- Vertex Shader -\n" + prefix_vertex + vertex_shader + "\n\n" +
				"- Fragment Shader -\n" + prefix_fragment + fragment_shader );

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

		function removeNull( element ) {

			return element !== null;

		}


	};

};
