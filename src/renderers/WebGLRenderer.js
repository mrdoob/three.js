/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.WebGLRenderer = function ( parameters ) {

	// Currently you can use just up to 4 directional / point lights total.
	// Chrome barfs on shader linking when there are more than 4 lights :(

	// The problem comes from shader using too many varying vectors.

	// This is not GPU limitation as the same shader works ok in Firefox
	// and Chrome with "--use-gl=desktop" flag.

	// Difference comes from Chrome on Windows using by default ANGLE,
	// thus going DirectX9 route (while FF uses OpenGL).

	// See http://code.google.com/p/chromium/issues/detail?id=63491

	var _canvas = document.createElement( 'canvas' ), _gl,
	_oldProgram = null,
	_modelViewMatrix = new THREE.Matrix4(), _normalMatrix,

	_viewMatrixArray = new Float32Array(16),
	_modelViewMatrixArray = new Float32Array(16),
	_projectionMatrixArray = new Float32Array(16),
	_normalMatrixArray = new Float32Array(9),
	_objectMatrixArray = new Float32Array(16),

	// parameters defaults
	
	antialias = true,
	clearColor = new THREE.Color( 0x000000 ),
	clearAlpha = 0;

	if ( parameters ) {
		
		if ( parameters.antialias !== undefined ) antialias = parameters.antialias;
		if ( parameters.clearColor !== undefined ) clearColor.setHex( parameters.clearColor );
		if ( parameters.clearAlpha !== undefined ) clearAlpha = parameters.clearAlpha;
		
	}
		
	this.domElement = _canvas;
	this.autoClear = true;

	initGL( antialias, clearColor, clearAlpha );

	//alert( dumpObject( getGLParams() ) );

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.setClearColor = function( hex, alpha ) {

		var color = new THREE.Color( hex );
		_gl.clearColor( color.r, color.g, color.b, alpha );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.setupLights = function ( program, lights ) {

		var l, ll, light, r = 0, g = 0, b = 0,
			color, position, intensity,
			dcolors = [], dpositions = [],
			pcolors = [], ppositions = [];


		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			color = light.color;
			position = light.position;
			intensity = light.intensity;

			if ( light instanceof THREE.AmbientLight ) {

				r += color.r;
				g += color.g;
				b += color.b;
				
			} else if ( light instanceof THREE.DirectionalLight ) {

				dcolors.push( color.r * intensity,
							  color.g * intensity,
							  color.b * intensity );

				dpositions.push( position.x,
								 position.y,
								 position.z );

			} else if( light instanceof THREE.PointLight ) {

				pcolors.push( color.r * intensity,
							  color.g * intensity,
							  color.b * intensity );

				ppositions.push( position.x,
								 position.y,
								 position.z );
				
			}

		}
		
		return { ambient: [ r, g, b ], directional: { colors: dcolors, positions: dpositions }, point: { colors: pcolors, positions: ppositions } };

	};

	this.createParticleBuffers = function( geometry ) {
		
		geometry.__webGLVertexBuffer = _gl.createBuffer();
		geometry.__webGLFaceBuffer = _gl.createBuffer();
	
	};
	
	this.createLineBuffers = function( geometry ) {
		
		geometry.__webGLVertexBuffer = _gl.createBuffer();
		geometry.__webGLLineBuffer = _gl.createBuffer();
		
	};

	this.createMeshBuffers = function( geometryChunk ) {
		
		geometryChunk.__webGLVertexBuffer = _gl.createBuffer();
		geometryChunk.__webGLNormalBuffer = _gl.createBuffer();
		geometryChunk.__webGLTangentBuffer = _gl.createBuffer();
		geometryChunk.__webGLUVBuffer = _gl.createBuffer();
		geometryChunk.__webGLFaceBuffer = _gl.createBuffer();
		geometryChunk.__webGLLineBuffer = _gl.createBuffer();
		
	};

	this.initLineBuffers = function( geometry ) {
		
		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__lineArray = new Uint16Array( nvertices );
		
		geometry.__webGLLineCount = nvertices;
	
	};
	
	this.initMeshBuffers = function( geometryChunk, object ) {
		
		var f, fl, nvertices = 0, ntris = 0, nlines = 0,
			obj_faces = object.geometry.faces, 
			chunk_faces = geometryChunk.faces;
		
		for ( f = 0, fl = chunk_faces.length; f < fl; f++ ) {
			
			fi = chunk_faces[ f ];
			face = obj_faces[ fi ];
			
			if ( face instanceof THREE.Face3 ) {
				
				nvertices += 3;
				ntris += 1;
				nlines += 3;
				
			} else if ( face instanceof THREE.Face4 ) {
				
				nvertices += 4;
				ntris += 2;
				nlines += 5;
				
			}
		
		}
		
		// TODO: only create arrays for attributes existing in the object
		
		geometryChunk.__vertexArray  = new Float32Array( nvertices * 3 );
		geometryChunk.__normalArray  = new Float32Array( nvertices * 3 );
		geometryChunk.__tangentArray = new Float32Array( nvertices * 4 );
		geometryChunk.__uvArray = new Float32Array( nvertices * 2 );
		
		geometryChunk.__faceArray = new Uint16Array( ntris * 3 );
		geometryChunk.__lineArray = new Uint16Array( nlines * 2 );
		
		geometryChunk.__needsSmoothNormals = bufferNeedsSmoothNormals ( geometryChunk, object );
		
		geometryChunk.__webGLFaceCount = ntris * 3;
		geometryChunk.__webGLLineCount = nlines * 2;
	
	};
	
	this.setMeshBuffers = function ( geometryChunk, object, hint, dirtyVertices, dirtyElements, dirtyUvs, dirtyNormals, dirtyTangents ) {

		var f, fl, fi, face, vertexNormals, faceNormal, normal, uv, v1, v2, v3, v4, t1, t2, t3, t4, m, ml, i,
			vn, uvi,
		
		vertexIndex = 0,

		offset = 0,
		offset_uv = 0,
		offset_face = 0,
		offset_normal = 0,
		offset_tangent = 0,
		offset_line = 0,
		
		vertexArray = geometryChunk.__vertexArray,
		uvArray = geometryChunk.__uvArray,
		normalArray = geometryChunk.__normalArray,
		tangentArray = geometryChunk.__tangentArray,
		
		faceArray = geometryChunk.__faceArray,
		lineArray = geometryChunk.__lineArray,
		
		needsSmoothNormals = geometryChunk.__needsSmoothNormals,
		
		geometry = object.geometry,
		vertices = geometry.vertices,
		chunk_faces = geometryChunk.faces,
		obj_faces = geometry.faces,
		obj_uvs = geometry.uvs;
		
		for ( f = 0, fl = chunk_faces.length; f < fl; f++ ) {
			
			fi = chunk_faces[ f ];
			face = obj_faces[ fi ];
			uv = obj_uvs[ fi ];
			
			vertexNormals = face.vertexNormals;
			faceNormal = face.normal;

			if ( face instanceof THREE.Face3 ) {

				if ( dirtyVertices ) {
					
					v1 = vertices[ face.a ].position;
					v2 = vertices[ face.b ].position;
					v3 = vertices[ face.c ].position;
					
					vertexArray[ offset ]     = v1.x;
					vertexArray[ offset + 1 ] = v1.y;
					vertexArray[ offset + 2 ] = v1.z;
					
					vertexArray[ offset + 3 ] = v2.x;
					vertexArray[ offset + 4 ] = v2.y;
					vertexArray[ offset + 5 ] = v2.z;

					vertexArray[ offset + 6 ] = v3.x;
					vertexArray[ offset + 7 ] = v3.y;
					vertexArray[ offset + 8 ] = v3.z;
					
					offset += 9;
					
				}

				if ( dirtyTangents && geometry.hasTangents ) {

					t1 = vertices[ face.a ].tangent;
					t2 = vertices[ face.b ].tangent;
					t3 = vertices[ face.c ].tangent;

					tangentArray[ offset_tangent ]     = t1.x;
					tangentArray[ offset_tangent + 1 ] = t1.y;
					tangentArray[ offset_tangent + 2 ] = t1.z;
					tangentArray[ offset_tangent + 3 ] = t1.w;
					
					tangentArray[ offset_tangent + 4 ] = t2.x;
					tangentArray[ offset_tangent + 5 ] = t2.y;
					tangentArray[ offset_tangent + 6 ] = t2.z;
					tangentArray[ offset_tangent + 7 ] = t2.w;
					
					tangentArray[ offset_tangent + 8 ]  = t3.x;
					tangentArray[ offset_tangent + 9 ]  = t3.y;
					tangentArray[ offset_tangent + 10 ] = t3.z;
					tangentArray[ offset_tangent + 11 ] = t3.w;
					
					offset_tangent += 12;
					
				}

				if( dirtyNormals ) {
				
					if ( vertexNormals.length == 3 && needsSmoothNormals ) {


						for ( i = 0; i < 3; i ++ ) {

							vn = vertexNormals[ i ];
							
							normalArray[ offset_normal ]     = vn.x;
							normalArray[ offset_normal + 1 ] = vn.y;
							normalArray[ offset_normal + 2 ] = vn.z;
							
							offset_normal += 3;

						}

					} else {

						for ( i = 0; i < 3; i ++ ) {

							normalArray[ offset_normal ]     = faceNormal.x;
							normalArray[ offset_normal + 1 ] = faceNormal.y;
							normalArray[ offset_normal + 2 ] = faceNormal.z;
							
							offset_normal += 3;

						}

					}
					
				}

				if ( dirtyUvs && uv ) {

					for ( i = 0; i < 3; i ++ ) {

						uvi = uv[ i ];
						
						uvArray[ offset_uv ]     = uvi.u;
						uvArray[ offset_uv + 1 ] = uvi.v;
						
						offset_uv += 2;

					}

				}

				if( dirtyElements ) {
					
					faceArray[ offset_face ] = vertexIndex;
					faceArray[ offset_face + 1 ] = vertexIndex + 1;
					faceArray[ offset_face + 2 ] = vertexIndex + 2;
					
					offset_face += 3;
				
					lineArray[ offset_line ]     = vertexIndex;
					lineArray[ offset_line + 1 ] = vertexIndex + 1;
					
					lineArray[ offset_line + 2 ] = vertexIndex;
					lineArray[ offset_line + 3 ] = vertexIndex + 2;
					
					lineArray[ offset_line + 4 ] = vertexIndex + 1;
					lineArray[ offset_line + 5 ] = vertexIndex + 2;
					
					offset_line += 6;

					vertexIndex += 3;
					
				}
				

			} else if ( face instanceof THREE.Face4 ) {

				if ( dirtyVertices ) {
					
					v1 = vertices[ face.a ].position;
					v2 = vertices[ face.b ].position;
					v3 = vertices[ face.c ].position;
					v4 = vertices[ face.d ].position;
			
					vertexArray[ offset ]     = v1.x;
					vertexArray[ offset + 1 ] = v1.y;
					vertexArray[ offset + 2 ] = v1.z;
					
					vertexArray[ offset + 3 ] = v2.x;
					vertexArray[ offset + 4 ] = v2.y;
					vertexArray[ offset + 5 ] = v2.z;

					vertexArray[ offset + 6 ] = v3.x;
					vertexArray[ offset + 7 ] = v3.y;
					vertexArray[ offset + 8 ] = v3.z;

					vertexArray[ offset + 9 ] = v4.x;
					vertexArray[ offset + 10 ] = v4.y;
					vertexArray[ offset + 11 ] = v4.z;
				
					offset += 12;
					
				}

				if ( dirtyTangents && geometry.hasTangents ) {

					t1 = vertices[ face.a ].tangent;
					t2 = vertices[ face.b ].tangent;
					t3 = vertices[ face.c ].tangent;
					t4 = vertices[ face.d ].tangent;

					tangentArray[ offset_tangent ]     = t1.x;
					tangentArray[ offset_tangent + 1 ] = t1.y;
					tangentArray[ offset_tangent + 2 ] = t1.z;
					tangentArray[ offset_tangent + 3 ] = t1.w;
					
					tangentArray[ offset_tangent + 4 ] = t2.x;
					tangentArray[ offset_tangent + 5 ] = t2.y;
					tangentArray[ offset_tangent + 6 ] = t2.z;
					tangentArray[ offset_tangent + 7 ] = t2.w;
					
					tangentArray[ offset_tangent + 8 ] = t3.x;
					tangentArray[ offset_tangent + 9 ] = t3.y;
					tangentArray[ offset_tangent + 10 ] = t3.z;
					tangentArray[ offset_tangent + 11 ] = t3.w;
					
					tangentArray[ offset_tangent + 12 ] = t4.x;
					tangentArray[ offset_tangent + 13 ] = t4.y;
					tangentArray[ offset_tangent + 14 ] = t4.z;
					tangentArray[ offset_tangent + 15 ] = t4.w;
					
					offset_tangent += 16;
					
				}
				
				if( dirtyNormals ) {
					
					if ( vertexNormals.length == 4 && needsSmoothNormals ) {

						for ( i = 0; i < 4; i ++ ) {

							vn = vertexNormals[ i ];
							
							normalArray[ offset_normal ]     = vn.x;
							normalArray[ offset_normal + 1 ] = vn.y;
							normalArray[ offset_normal + 2 ] = vn.z;
							
							offset_normal += 3;

						}

					} else {

						for ( i = 0; i < 4; i ++ ) {

							normalArray[ offset_normal ]     = faceNormal.x;
							normalArray[ offset_normal + 1 ] = faceNormal.y;
							normalArray[ offset_normal + 2 ] = faceNormal.z;
							
							offset_normal += 3;

						}

					}
					
				}

				if ( dirtyUvs && uv ) {

					for ( i = 0; i < 4; i ++ ) {

						uvi = uv[ i ];
						
						uvArray[ offset_uv ]     = uvi.u;
						uvArray[ offset_uv + 1 ] = uvi.v;
						
						offset_uv += 2;

					}

				}
		
				if( dirtyElements ) {
					
					faceArray[ offset_face ]     = vertexIndex;
					faceArray[ offset_face + 1 ] = vertexIndex + 1;
					faceArray[ offset_face + 2 ] = vertexIndex + 2;
					
					faceArray[ offset_face + 3 ] = vertexIndex;
					faceArray[ offset_face + 4 ] = vertexIndex + 2;
					faceArray[ offset_face + 5 ] = vertexIndex + 3;
					
					offset_face += 6;
					
					lineArray[ offset_line ]     = vertexIndex;
					lineArray[ offset_line + 1 ] = vertexIndex + 1;
					
					lineArray[ offset_line + 2 ] = vertexIndex;
					lineArray[ offset_line + 3 ] = vertexIndex + 2;
					
					lineArray[ offset_line + 4 ] = vertexIndex;
					lineArray[ offset_line + 5 ] = vertexIndex + 3;
					
					lineArray[ offset_line + 6 ] = vertexIndex + 1;
					lineArray[ offset_line + 7 ] = vertexIndex + 2;
					
					lineArray[ offset_line + 8 ] = vertexIndex + 2;
					lineArray[ offset_line + 9 ] = vertexIndex + 3;
					
					offset_line += 10;
					
					vertexIndex += 4;
					
				}

			}

		}

		if ( dirtyVertices ) {
		
			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );
			
		}
		
		if ( dirtyNormals ) {
		
			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLNormalBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, normalArray, hint );
			
		}

		if ( dirtyTangents && geometry.hasTangents ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLTangentBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, tangentArray, hint );
		
		}

		if ( dirtyUvs && offset_uv > 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLUVBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, uvArray, hint );

		}

		if( dirtyElements ) {
			
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLFaceBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, faceArray, hint );

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLLineBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, lineArray, hint );
			
		}

	};

	this.setLineBuffers = function( geometry, hint, dirtyVertices, dirtyElements ) {
		
		var v, vertex, offset,
			vertices = geometry.vertices,
			vl = vertices.length,
		
			vertexArray = geometry.__vertexArray, 
			lineArray = geometry.__lineArray;
		
		if ( dirtyVertices ) {
			
			for ( v = 0; v < vl; v++ ) {
				
				vertex = vertices[ v ].position;
				
				offset = v * 3;
				
				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;
				
			}

		}
		
		// yeah, this is silly as order of element indices is currently fixed
		// though this could change if some use case arises
		
		if ( dirtyElements ) {
			
			for ( v = 0; v < vl; v++ ) {
				
				lineArray[ v ] = v;
				
			}
			
		}

		_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webGLVertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );
		
		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometry.__webGLLineBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, lineArray, hint );
		
	};
	
	this.setParticleBuffers = function( geometry, hint, dirtyVertices, dirtyElements ) {
	};
	
	function setMaterialShaders( material, shaders ) {

		material.fragment_shader = shaders.fragment_shader;
		material.vertex_shader = shaders.vertex_shader;
		material.uniforms = Uniforms.clone( shaders.uniforms );

	};

	function refreshUniformsCommon( material, fog ) {
		
		// premultiply alpha
		material.uniforms.color.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );
		
		// pure color
		//material.uniforms.color.value.setHex( material.color.hex );
		
		material.uniforms.opacity.value = material.opacity;
		material.uniforms.map.texture = material.map;

		material.uniforms.env_map.texture = material.env_map;
		material.uniforms.reflectivity.value = material.reflectivity;
		material.uniforms.refraction_ratio.value = material.refraction_ratio;
		material.uniforms.combine.value = material.combine;
		material.uniforms.useRefract.value = material.env_map && material.env_map.mapping instanceof THREE.CubeRefractionMapping;

		if ( fog ) {

			material.uniforms.fogColor.value.setHex( fog.color.hex );

			if ( fog instanceof THREE.Fog ) {

				material.uniforms.fogNear.value = fog.near;
				material.uniforms.fogFar.value = fog.far;

			} else if ( fog instanceof THREE.FogExp2 ) {

				material.uniforms.fogDensity.value = fog.density;

			}

		}

	};

	function refreshUniformsLine( material, fog ) {
		
		material.uniforms.color.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );		
		material.uniforms.opacity.value = material.opacity;

		if ( fog ) {

			material.uniforms.fogColor.value.setHex( fog.color.hex );

			if ( fog instanceof THREE.Fog ) {

				material.uniforms.fogNear.value = fog.near;
				material.uniforms.fogFar.value = fog.far;

			} else if ( fog instanceof THREE.FogExp2 ) {

				material.uniforms.fogDensity.value = fog.density;

			}

		}

	};
	
	function refreshUniformsPhong( material ) {
		
		//material.uniforms.ambient.value.setHex( material.ambient.hex );
		//material.uniforms.specular.value.setHex( material.specular.hex );
		material.uniforms.ambient.value.setRGB( material.ambient.r, material.ambient.g, material.ambient.b );
		material.uniforms.specular.value.setRGB( material.specular.r, material.specular.g, material.specular.b );
		material.uniforms.shininess.value = material.shininess;
		
	};
	
	
	function refreshLights( material, lights ) {
		
		material.uniforms.enableLighting.value = lights.directional.positions.length + lights.point.positions.length;
		material.uniforms.ambientLightColor.value = lights.ambient;
		material.uniforms.directionalLightColor.value = lights.directional.colors;
		material.uniforms.directionalLightDirection.value = lights.directional.positions;
		material.uniforms.pointLightColor.value = lights.point.colors;
		material.uniforms.pointLightPosition.value = lights.point.positions;
		
	};
	
	this.renderBuffer = function ( camera, lights, fog, material, geometryChunk, object ) {

		var program, u, identifiers, attributes, parameters, vector_lights, maxLightCount, linewidth, primitives;

		if ( !material.program ) {

			if ( material instanceof THREE.MeshDepthMaterial ) {

				setMaterialShaders( material, THREE.ShaderLib[ 'depth' ] );

				material.uniforms.mNear.value = camera.near;
				material.uniforms.mFar.value = camera.far;

			} else if ( material instanceof THREE.MeshNormalMaterial ) {

				setMaterialShaders( material, THREE.ShaderLib[ 'normal' ] );

			} else if ( material instanceof THREE.MeshBasicMaterial ) {

				setMaterialShaders( material, THREE.ShaderLib[ 'basic' ] );

				refreshUniformsCommon( material, fog );
				
			} else if ( material instanceof THREE.MeshLambertMaterial ) {
				
				setMaterialShaders( material, THREE.ShaderLib[ 'lambert' ] );
				
				refreshUniformsCommon( material, fog );
				
			} else if ( material instanceof THREE.MeshPhongMaterial ) {
				
				setMaterialShaders( material, THREE.ShaderLib[ 'phong' ] );
				
				refreshUniformsCommon( material, fog );
				
			} else if ( material instanceof THREE.LineBasicMaterial ) {
				
				setMaterialShaders( material, THREE.ShaderLib[ 'basic' ] );

				refreshUniformsLine( material, fog );
				
			}

			// heuristics to create shader parameters according to lights in the scene
			// (not to blow over maxLights budget)

			maxLightCount = allocateLights( lights, 4 );

			parameters = { fog: fog, map: material.map, env_map: material.env_map, maxDirLights: maxLightCount.directional, maxPointLights: maxLightCount.point };
			material.program = buildProgram( material.fragment_shader, material.vertex_shader, parameters );

			identifiers = [ 'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'objectMatrix', 'cameraPosition' ];
			for( u in material.uniforms ) {

				identifiers.push(u);

			}

			cacheUniformLocations( material.program, identifiers );
			cacheAttributeLocations( material.program, [ "position", "normal", "uv", "tangent" ] );

		}

		program = material.program;

		if( program != _oldProgram ) {

			_gl.useProgram( program );
			_oldProgram = program;

		}

		this.loadCamera( program, camera );
		this.loadMatrices( program );

		if ( material instanceof THREE.MeshPhongMaterial || 
			 material instanceof THREE.MeshLambertMaterial ) {

			vector_lights = this.setupLights( program, lights );
			refreshLights( material, vector_lights );

		}

		if ( material instanceof THREE.MeshBasicMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshPhongMaterial ) {
			
			refreshUniformsCommon( material, fog );

		}
		
		if ( material instanceof THREE.LineBasicMaterial ) {
			
			refreshUniformsLine( material, fog );
		}
		
		if ( material instanceof THREE.MeshPhongMaterial ) {
			
			refreshUniformsPhong( material );

		}

		setUniforms( program, material.uniforms );

		attributes = program.attributes;

		// vertices

		_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLVertexBuffer );
		_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );
		_gl.enableVertexAttribArray( attributes.position );

		// normals

		if ( attributes.normal >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLNormalBuffer );
			_gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );
			_gl.enableVertexAttribArray( attributes.normal );

		}

		// tangents

		if ( attributes.tangent >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLTangentBuffer );
			_gl.vertexAttribPointer( attributes.tangent, 4, _gl.FLOAT, false, 0, 0 );
			_gl.enableVertexAttribArray( attributes.tangent );

		}

		// uvs

		if ( attributes.uv >= 0 ) {

			if ( geometryChunk.__webGLUVBuffer ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLUVBuffer );
				_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 0, 0 );

				_gl.enableVertexAttribArray( attributes.uv );

			} else {

				_gl.disableVertexAttribArray( attributes.uv );

			}

		}

		// render lines

		if ( material.wireframe || material instanceof THREE.LineBasicMaterial ) {

			linewidth = material.wireframe_linewidth !== undefined ? material.wireframe_linewidth : 
					    material.linewidth !== undefined ? material.linewidth : 1;
			
			primitives = material instanceof THREE.LineBasicMaterial && object.type == THREE.LineStrip ? _gl.LINE_STRIP : _gl.LINES;
			
			_gl.lineWidth( linewidth );
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLLineBuffer );
			_gl.drawElements( primitives, geometryChunk.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );

		// render triangles

		} else {

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLFaceBuffer );
			_gl.drawElements( _gl.TRIANGLES, geometryChunk.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );

		}

	};

	this.renderPass = function ( camera, lights, fog, object, geometryChunk, blending, transparent ) {

		var i, l, m, ml, material, meshMaterial;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = geometryChunk.materials.length; i < l; i++ ) {

					material = geometryChunk.materials[ i ];

					if ( material && material.blending == blending && ( material.opacity < 1.0 == transparent ) ) {

						this.setBlending( material.blending );
						this.renderBuffer( camera, lights, fog, material, geometryChunk, object );

					}

				}

			} else {

				material = meshMaterial;
				if ( material && material.blending == blending && ( material.opacity < 1.0 == transparent ) ) {

					this.setBlending( material.blending );
					this.renderBuffer( camera, lights, fog, material, geometryChunk, object );

				}

			}

		}

	};

	this.render = function( scene, camera ) {

		var o, ol, webGLObject, object, buffer,
			lights = scene.lights,
			fog = scene.fog;

		this.initWebGLObjects( scene );

		if ( this.autoClear ) {

			this.clear();

		}

		camera.autoUpdateMatrix && camera.updateMatrix();

		_viewMatrixArray.set( camera.matrix.flatten() );
		_projectionMatrixArray.set( camera.projectionMatrix.flatten() );
		
		// opaque pass

		for ( o = 0, ol = scene.__webGLObjects.length; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			object = webGLObject.object;
			buffer = webGLObject.buffer;

			if ( object.visible ) {

				this.setupMatrices( object, camera );
				this.renderPass( camera, lights, fog, object, buffer, THREE.NormalBlending, false );

			}

		}

		// transparent pass

		for ( o = 0, ol = scene.__webGLObjects.length; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			object = webGLObject.object;
			buffer = webGLObject.buffer;

			if ( object.visible ) {

				this.setupMatrices( object, camera );

				// opaque blended materials

				this.renderPass( camera, lights, fog, object, buffer, THREE.AdditiveBlending, false );
				this.renderPass( camera, lights, fog, object, buffer, THREE.SubtractiveBlending, false );

				// transparent blended materials

				this.renderPass( camera, lights, fog, object, buffer, THREE.AdditiveBlending, true );
				this.renderPass( camera, lights, fog, object, buffer, THREE.SubtractiveBlending, true );

				// transparent normal materials

				this.renderPass( camera, lights, fog, object, buffer, THREE.NormalBlending, true );

			}

		}

	};

	this.initWebGLObjects = function( scene ) {

		function add_buffer( objmap, id, buffer, object ) {
			
			if ( objmap[ id ] == undefined ) {

				scene.__webGLObjects.push( { buffer: buffer, object: object } );
				objmap[ id ] = 1;

			}
			
		};
		
		var o, ol, object, g, geometry, geometryChunk, objmap;

		if ( !scene.__webGLObjects ) {

			scene.__webGLObjects = [];
			scene.__webGLObjectsMap = {};

		}
		
		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];
			geometry = object.geometry;
			
			if ( scene.__webGLObjectsMap[ object.id ] == undefined ) {

				scene.__webGLObjectsMap[ object.id ] = {};

			}

			objmap = scene.__webGLObjectsMap[ object.id ];
			
			if ( object instanceof THREE.Mesh ) {
				
				// create separate VBOs per geometry chunk

				for ( g in geometry.geometryChunks ) {

					geometryChunk = geometry.geometryChunks[ g ];

					// initialise VBO on the first access

					if( ! geometryChunk.__webGLVertexBuffer ) {

						this.createMeshBuffers( geometryChunk );
						this.initMeshBuffers( geometryChunk, object );
						
						geometry.__dirtyVertices = true;
						geometry.__dirtyElements = true;
						geometry.__dirtyUvs = true;
						geometry.__dirtyNormals = true;
						geometry.__dirtyTangents = true;

					}

					if( geometry.__dirtyVertices || geometry.__dirtyElements || geometry.__dirtyUvs ) {

						this.setMeshBuffers( geometryChunk, object, _gl.DYNAMIC_DRAW,
										 geometry.__dirtyVertices, geometry.__dirtyElements, geometry.__dirtyUvs,
										 geometry.__dirtyNormals, geometry.__dirtyTangents );
						

					}

					// create separate wrapper per each use of VBO

					add_buffer( objmap, g, geometryChunk, object );

				}

				geometry.__dirtyVertices = false;
				geometry.__dirtyElements = false;
				geometry.__dirtyUvs = false;
				geometry.__dirtyNormals = false;
				geometry.__dirtyTangents = false;

			} else if ( object instanceof THREE.Line ) {
				
				
				if( ! geometry.__webGLVertexBuffer ) {
				
					this.createLineBuffers( geometry );
					this.initLineBuffers( geometry );
					
					geometry.__dirtyVertices = true;
					geometry.__dirtyElements = true;
					
				}
				
				if( geometry.__dirtyVertices ) {
					
					this.setLineBuffers( geometry, _gl.DYNAMIC_DRAW, geometry.__dirtyVertices, geometry.__dirtyElements );
					
				}
				
				add_buffer( objmap, 0, geometry, object );
				
				geometry.__dirtyVertices = false;
				geometry.__dirtyElements = false;

			} else if ( object instanceof THREE.ParticleSystem ) {

				if( ! geometry.__webGLVertexBuffer ) {
				
					this.createParticleBuffers( geometry );
					
				}
				
				add_buffer( objmap, 0, geometry, object );
				
				
			}/*else if ( object instanceof THREE.Particle ) {

			}*/

		}

	};

	this.removeObject = function ( scene, object ) {

		var o, ol, zobject;

		for ( o = scene.__webGLObjects.length - 1; o >= 0; o-- ) {

			zobject = scene.__webGLObjects[ o ].object;

			if ( object == zobject ) {

				scene.__webGLObjects.splice( o, 1 );

			}

		}

	};

	this.setupMatrices = function ( object, camera ) {

		object.autoUpdateMatrix && object.updateMatrix();

		_modelViewMatrix.multiply( camera.matrix, object.matrix );
		_modelViewMatrixArray.set( _modelViewMatrix.flatten() );

		_normalMatrix = THREE.Matrix4.makeInvert3x3( _modelViewMatrix ).transpose();
		_normalMatrixArray.set( _normalMatrix.m );

		_objectMatrixArray.set( object.matrix.flatten() );

	};

	this.loadMatrices = function ( program ) {

		_gl.uniformMatrix4fv( program.uniforms.viewMatrix, false, _viewMatrixArray );
		_gl.uniformMatrix4fv( program.uniforms.modelViewMatrix, false, _modelViewMatrixArray );
		_gl.uniformMatrix4fv( program.uniforms.projectionMatrix, false, _projectionMatrixArray );
		_gl.uniformMatrix3fv( program.uniforms.normalMatrix, false, _normalMatrixArray );
		_gl.uniformMatrix4fv( program.uniforms.objectMatrix, false, _objectMatrixArray );

	};

	this.loadCamera = function( program, camera ) {

		_gl.uniform3f( program.uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );

	};

	this.setBlending = function( blending ) {

		switch ( blending ) {

			case THREE.AdditiveBlending:

				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ONE, _gl.ONE );

				break;

			case THREE.SubtractiveBlending:

				//_gl.blendEquation( _gl.FUNC_SUBTRACT );
				_gl.blendFunc( _gl.DST_COLOR, _gl.ZERO );

				break;

			default:

				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );

				break;
		}

	};

	this.setFaceCulling = function ( cullFace, frontFace ) {

		if ( cullFace ) {

			if ( !frontFace || frontFace == "ccw" ) {

				_gl.frontFace( _gl.CCW );

			} else {

				_gl.frontFace( _gl.CW );

			}

			if( cullFace == "back" ) {

				_gl.cullFace( _gl.BACK );

			} else if( cullFace == "front" ) {

				_gl.cullFace( _gl.FRONT );

			} else {

				_gl.cullFace( _gl.FRONT_AND_BACK );

			}

			_gl.enable( _gl.CULL_FACE );

		} else {

			_gl.disable( _gl.CULL_FACE );

		}

	};

	this.supportsVertexTextures = function() {

		return maxVertexTextures() > 0;

	};

	function maxVertexTextures() {

		return _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );

	};

	function initGL( antialias, clearColor, clearAlpha ) {

		try {

			_gl = _canvas.getContext( 'experimental-webgl', { antialias: antialias } );

		} catch(e) { }

		if (!_gl) {

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
		_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );

	};
	
	function buildProgram( fragment_shader, vertex_shader, parameters ) {

		var program = _gl.createProgram(),

		prefix_fragment = [
			"#ifdef GL_ES",
			"precision highp float;",
			"#endif",
		
			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,

			parameters.fog ? "#define USE_FOG" : "",
			parameters.fog instanceof THREE.FogExp2 ? "#define FOG_EXP2" : "",

			parameters.map ? "#define USE_MAP" : "",
			parameters.env_map ? "#define USE_ENVMAP" : "",

			"uniform mat4 viewMatrix;",
			"uniform vec3 cameraPosition;",
			""
		].join("\n"),

		prefix_vertex = [
			maxVertexTextures() > 0 ? "#define VERTEX_TEXTURES" : "",

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,

			parameters.map ? "#define USE_MAP" : "",
			parameters.env_map ? "#define USE_ENVMAP" : "",

			"uniform mat4 objectMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",
			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",
			""
		].join("\n");

		_gl.attachShader( program, getShader( "fragment", prefix_fragment + fragment_shader ) );
		_gl.attachShader( program, getShader( "vertex", prefix_vertex + vertex_shader ) );

		_gl.linkProgram( program );

		if ( !_gl.getProgramParameter( program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders\n"+
					"VALIDATE_STATUS: " + _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) + ", gl error [" + _gl.getError() + "]" );
			
			//console.log( prefix_fragment + fragment_shader );
			//console.log( prefix_vertex + vertex_shader );

		}

		program.uniforms = {};
		program.attributes = {};

		return program;

	};

	function setUniforms( program, uniforms ) {

		var u, uniform, value, type, location, texture;

		for( u in uniforms ) {

			location = program.uniforms[u];
			if ( !location ) continue;
			
			uniform = uniforms[u];
			
			type = uniform.type;
			value = uniform.value;
			
			if( type == "i" ) {

				_gl.uniform1i( location, value );

			} else if( type == "f" ) {

				_gl.uniform1f( location, value );

			} else if( type == "fv" ) {

				_gl.uniform3fv( location, value );

			} else if( type == "v2" ) {

				_gl.uniform2f( location, value.x, value.y );

			} else if( type == "v3" ) {

				_gl.uniform3f( location, value.x, value.y, value.z );

			} else if( type == "c" ) {

				_gl.uniform3f( location, value.r, value.g, value.b );

			} else if( type == "t" ) {

				_gl.uniform1i( location, value );

				texture = uniform.texture;

				if ( !texture ) continue;

				if ( texture.image instanceof Array && texture.image.length == 6 ) {

					setCubeTexture( texture, value );

				} else {

					setTexture( texture, value );

				}

			}

		}

	};

	function setCubeTexture( texture, slot ) {

		if ( texture.image.length == 6 ) {

			if ( !texture.image.__webGLTextureCube &&
				 !texture.image.__cubeMapInitialized && texture.image.loadCount == 6 ) {

				texture.image.__webGLTextureCube = _gl.createTexture();

				_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webGLTextureCube );

				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );

				for ( var i = 0; i < 6; ++i ) {

					_gl.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image[ i ] );

				}

				_gl.generateMipmap( _gl.TEXTURE_CUBE_MAP );

				_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, null );

				texture.image.__cubeMapInitialized = true;

			}

			_gl.activeTexture( _gl.TEXTURE0 + slot );
			_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webGLTextureCube );

		}

	};

	function setTexture( texture, slot ) {

		if ( !texture.__webGLTexture && texture.image.loaded ) {

			texture.__webGLTexture = _gl.createTexture();
			_gl.bindTexture( _gl.TEXTURE_2D, texture.__webGLTexture );
			_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image );

			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( texture.wrap_s ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( texture.wrap_t ) );

			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( texture.mag_filter ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( texture.min_filter ) );
			_gl.generateMipmap( _gl.TEXTURE_2D );
			_gl.bindTexture( _gl.TEXTURE_2D, null );

		}

		_gl.activeTexture( _gl.TEXTURE0 + slot );
		_gl.bindTexture( _gl.TEXTURE_2D, texture.__webGLTexture );

	};

	function cacheUniformLocations( program, identifiers ) {

		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i++ ) {

			id = identifiers[ i ];
			program.uniforms[ id ] = _gl.getUniformLocation( program, id );

		}

	};

	function cacheAttributeLocations( program, identifiers ) {

		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i++ ) {

			id = identifiers[ i ];
			program.attributes[ id ] = _gl.getAttribLocation( program, id );

		}

	};

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

	};

	function materialNeedsSmoothNormals( material ) {

		return material && material.shading != undefined && material.shading == THREE.SmoothShading;

	};

	function bufferNeedsSmoothNormals( geometryChunk, object ) {

		var m, ml, i, l, meshMaterial, needsSmoothNormals = false;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = geometryChunk.materials.length; i < l; i++ ) {

					if ( materialNeedsSmoothNormals( geometryChunk.materials[ i ] ) ) {

						needsSmoothNormals = true;
						break;

					}

				}

			} else {

				if ( materialNeedsSmoothNormals( meshMaterial ) ) {

					needsSmoothNormals = true;
					break;

				}

			}

			if ( needsSmoothNormals ) break;

		}

		return needsSmoothNormals;

	};

	function allocateLights( lights, maxLights ) {

		var l, ll, light, dirLights, pointLights, maxDirLights, maxPointLights;
		dirLights = pointLights = maxDirLights = maxPointLights = 0;

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];

			if ( light instanceof THREE.DirectionalLight ) dirLights++;
			if ( light instanceof THREE.PointLight ) pointLights++;

		}

		if ( ( pointLights + dirLights ) <= maxLights ) {

			maxDirLights = dirLights;
			maxPointLights = pointLights;

		} else {

			maxDirLights = Math.ceil( maxLights * dirLights / ( pointLights + dirLights ) );
			maxPointLights = maxLights - maxDirLights;

		}

		return { 'directional' : maxDirLights, 'point' : maxPointLights };

	};

	/* DEBUG
	function getGLParams() {

		var params  = {

			'MAX_VARYING_VECTORS': _gl.getParameter( _gl.MAX_VARYING_VECTORS ),
			'MAX_VERTEX_ATTRIBS': _gl.getParameter( _gl.MAX_VERTEX_ATTRIBS ),

			'MAX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_TEXTURE_IMAGE_UNITS ),
			'MAX_VERTEX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ),
			'MAX_COMBINED_TEXTURE_IMAGE_UNITS' : _gl.getParameter( _gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS ),

			'MAX_VERTEX_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_VERTEX_UNIFORM_VECTORS ),
			'MAX_FRAGMENT_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_FRAGMENT_UNIFORM_VECTORS )
		}

		return params;
	};

	function dumpObject( obj ) {

		var p, str = "";
		for ( p in obj ) {

			str += p + ": " + obj[p] + "\n";

		}

		return str;
	}
	*/

};

THREE.Snippets = {
	
	fog_pars_fragment: [

	"#ifdef USE_FOG",

		"uniform vec3 fogColor;",

		"#ifdef FOG_EXP2",
			"uniform float fogDensity;",
		"#else",
			"uniform float fogNear;",
			"uniform float fogFar;",
		"#endif",

	"#endif"

	].join("\n"),

	fog_fragment: [

	"#ifdef USE_FOG",

		"float depth = gl_FragCoord.z / gl_FragCoord.w;",

		"#ifdef FOG_EXP2",
			"const float LOG2 = 1.442695;",
			"float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );",
			"fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );",
		"#else",
			"float fogFactor = smoothstep( fogNear, fogFar, depth );",
		"#endif",

		"gl_FragColor = mix( gl_FragColor, vec4( fogColor, 1.0 ), fogFactor );",

	"#endif"
	
	].join("\n"),
	
	envmap_pars_fragment: [
	
	"#ifdef USE_ENVMAP",
	
		"varying vec3 vReflect;",
		"uniform float reflectivity;",
		"uniform samplerCube env_map;",
		"uniform int combine;",
	
	"#endif"
	
	].join("\n"),
	
	envmap_fragment: [
	
	"#ifdef USE_ENVMAP",

		"cubeColor = textureCube( env_map, vec3( -vReflect.x, vReflect.yz ) );",
		
		"if ( combine == 1 ) {",

			"gl_FragColor = mix( gl_FragColor, cubeColor, reflectivity );",

		"} else {",

			"gl_FragColor = gl_FragColor * cubeColor;",

		"}",	

	"#endif"
	
	].join("\n"),
	
	envmap_pars_vertex: [
	
	"#ifdef USE_ENVMAP",
	
		"varying vec3 vReflect;",
		"uniform float refraction_ratio;",
		"uniform bool useRefract;",
		
	"#endif"
	
	].join("\n"),

	envmap_vertex : [
	
	"#ifdef USE_ENVMAP",
	
		"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
		"vec3 nWorld = mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal;",
	
		"if ( useRefract ) {",

			"vReflect = refract( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ), refraction_ratio );",

		"} else {",

			"vReflect = reflect( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ) );",

		"}",

	"#endif"
	
	].join("\n"),
	
	map_pars_fragment: [
	
	"#ifdef USE_MAP",
		
		"varying vec2 vUv;",
		"uniform sampler2D map;",
		  
	"#endif"
	
	].join("\n"),
	
	map_pars_vertex: [
	
	"#ifdef USE_MAP",
	
		"varying vec2 vUv;",

	"#endif"
	
	].join("\n"),
	
	map_fragment: [

	"#ifdef USE_MAP",

		"mapColor = texture2D( map, vUv );",

	"#endif"
	
	].join("\n"),
	
	map_vertex: [
	
	"#ifdef USE_MAP",
	
		"vUv = uv;",
		
	"#endif"
	
	].join("\n"),
	
	lights_pars_vertex: [
	
	"uniform bool enableLighting;",
	"uniform vec3 ambientLightColor;",
	
	"#if MAX_DIR_LIGHTS > 0",
	
		"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
		
	"#endif",

	"#if MAX_POINT_LIGHTS > 0",
	
		"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
		"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
		
		"#ifdef PHONG",
			"varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];",
		"#endif",
		
	"#endif"
	
	].join("\n"),
	
	lights_vertex: [
	
	"if ( !enableLighting ) {",

		"vLightWeighting = vec3( 1.0 );",

	"} else {",

		"vLightWeighting = ambientLightColor;",

		"#if MAX_DIR_LIGHTS > 0",
		
		"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",
		
			"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
			"float directionalLightWeighting = max( dot( transformedNormal, normalize( lDirection.xyz ) ), 0.0 );",
			"vLightWeighting += directionalLightColor[ i ] * directionalLightWeighting;",
			
		"}",
		
		"#endif",

		"#if MAX_POINT_LIGHTS > 0",
		
		"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",
		
			"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
			"vec3 pointLightVector = normalize( lPosition.xyz - mvPosition.xyz );",
			"float pointLightWeighting = max( dot( transformedNormal, pointLightVector ), 0.0 );",
			"vLightWeighting += pointLightColor[ i ] * pointLightWeighting;",
			
			"#ifdef PHONG",
				"vPointLightVector[ i ] = pointLightVector;",
			"#endif",
			
		"}",
		
		"#endif",
		
	"}"
	
	].join("\n"),
	
	lights_pars_fragment: [
	
	"#if MAX_DIR_LIGHTS > 0",
		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
	"#endif",
	
	"#if MAX_POINT_LIGHTS > 0",
		"varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];",
	"#endif",
	
	"varying vec3 vViewPosition;",
	"varying vec3 vNormal;"
	
	].join("\n"),
	
	lights_fragment: [
	
	"vec3 normal = normalize( vNormal );",
	"vec3 viewPosition = normalize( vViewPosition );",
	
	"vec4 mSpecular = vec4( specular, opacity );",

	"#if MAX_POINT_LIGHTS > 0",
		
		"vec4 pointDiffuse  = vec4( 0.0 );",
		"vec4 pointSpecular = vec4( 0.0 );",

		"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

			"vec3 pointVector = normalize( vPointLightVector[ i ] );",
			"vec3 pointHalfVector = normalize( vPointLightVector[ i ] + vViewPosition );",

			"float pointDotNormalHalf = dot( normal, pointHalfVector );",
			"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

			"float pointSpecularWeight = 0.0;",
			"if ( pointDotNormalHalf >= 0.0 )",
				"pointSpecularWeight = pow( pointDotNormalHalf, shininess );",

			"pointDiffuse  += mColor * pointDiffuseWeight;",
			"pointSpecular += mSpecular * pointSpecularWeight;",

			"}",

	"#endif",
	
	"#if MAX_DIR_LIGHTS > 0",
	
		"vec4 dirDiffuse  = vec4( 0.0 );",
		"vec4 dirSpecular = vec4( 0.0 );" ,

		"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

			"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",

			"vec3 dirVector = normalize( lDirection.xyz );",
			"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );",

			"float dirDotNormalHalf = dot( normal, dirHalfVector );",

			"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

			"float dirSpecularWeight = 0.0;",
			"if ( dirDotNormalHalf >= 0.0 )",
				"dirSpecularWeight = pow( dirDotNormalHalf, shininess );",

			"dirDiffuse  += mColor * dirDiffuseWeight;",
			"dirSpecular += mSpecular * dirSpecularWeight;",

		"}",
	
	"#endif",

	"vec4 totalLight = vec4( ambient, opacity );",

	"#if MAX_DIR_LIGHTS > 0",
		"totalLight += dirDiffuse + dirSpecular;",
	"#endif",
	
	"#if MAX_POINT_LIGHTS > 0",
		"totalLight += pointDiffuse + pointSpecular;",
	"#endif"

	].join("\n")

};

THREE.UniformsLib = {
	
	common: {
		
	"color"   : { type: "c", value: new THREE.Color( 0xeeeeee ) },
	"opacity" : { type: "f", value: 1 },
	"map"     : { type: "t", value: 0, texture: null },
	
	"env_map" 		  : { type: "t", value: 1, texture: null },
	"useRefract"	  : { type: "i", value: 0 },
	"reflectivity"    : { type: "f", value: 1 },
	"refraction_ratio": { type: "f", value: 0.98 },
	"combine"		  : { type: "i", value: 0 },
	
	"fogDensity": { type: "f", value: 0.00025 },
	"fogNear"	: { type: "f", value: 1 },
	"fogFar"	: { type: "f", value: 2000 },
	"fogColor"	: { type: "c", value: new THREE.Color( 0xffffff ) }
	
	},
	
	lights: {
		
	"enableLighting" 			: { type: "i", value: 1 },
	"ambientLightColor" 		: { type: "fv", value: [] },
	"directionalLightDirection" : { type: "fv", value: [] },
	"directionalLightColor" 	: { type: "fv", value: [] },
	"pointLightPosition"		: { type: "fv", value: [] },
	"pointLightColor"			: { type: "fv", value: [] }
	
	}
	
};

THREE.ShaderLib = {

	'depth': {

		uniforms: { "mNear": { type: "f", value: 1.0 },
					"mFar" : { type: "f", value: 2000.0 } },

		fragment_shader: [

			"uniform float mNear;",
			"uniform float mFar;",

			"void main() {",

				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
				"float color = 1.0 - smoothstep( mNear, mFar, depth );",
				"gl_FragColor = vec4( vec3( color ), 1.0 );",

			"}"

		].join("\n"),

		vertex_shader: [

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n")

	},

	'normal': {

		uniforms: { },

		fragment_shader: [

			"varying vec3 vNormal;",

			"void main() {",

				"gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, 1.0 );",

			"}"

		].join("\n"),

		vertex_shader: [

			"varying vec3 vNormal;",

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",

				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	},

	'basic': {
		
		uniforms: THREE.UniformsLib[ "common" ],
		
		fragment_shader: [

			"uniform vec3 color;",
			"uniform float opacity;",
			
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
				
			"void main() {",

				"vec4 mColor = vec4( color, opacity );",
				"vec4 mapColor = vec4( 1.0 );",
				"vec4 cubeColor = vec4( 1.0 );",

				THREE.Snippets[ "map_fragment" ],
				
				"gl_FragColor = mColor * mapColor;",
				
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],
				
			"}"

		].join("\n"),
		
		vertex_shader: [
			
			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			
			"void main() {",
		
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				
				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")
		
	},

	'lambert': {
		
		uniforms: Uniforms.merge( [ THREE.UniformsLib[ "common" ], 
									THREE.UniformsLib[ "lights" ] ] ),
		
		fragment_shader: [
			
			"uniform vec3 color;",
			"uniform float opacity;",
			
			"varying vec3 vLightWeighting;",
				
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
				
			"void main() {",
					
				"vec4 mColor = vec4( color, opacity );",
				"vec4 mapColor = vec4( 1.0 );",
				"vec4 cubeColor = vec4( 1.0 );",

				THREE.Snippets[ "map_fragment" ],

				"gl_FragColor =  mColor * mapColor * vec4( vLightWeighting, 1.0 );",
				
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [
		
			"varying vec3 vLightWeighting;",
			
			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "lights_pars_vertex" ],
			
			"void main() {",
		
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				
				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				
				"vec3 transformedNormal = normalize( normalMatrix * normal );",
				
				THREE.Snippets[ "lights_vertex" ],
				
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")
		
	},
	
	'phong': {
		
		uniforms: Uniforms.merge( [ THREE.UniformsLib[ "common" ], 
									THREE.UniformsLib[ "lights" ],
									
								    { "ambient"  : { type: "c", value: new THREE.Color( 0x050505 ) },
									  "specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
									  "shininess": { type: "f", value: 30 }
									}
									
								] ),
		
		fragment_shader: [
			
			"uniform vec3 color;",
			"uniform float opacity;",
			
			"uniform vec3 ambient;",
			"uniform vec3 specular;",
			"uniform float shininess;",
				
			"varying vec3 vLightWeighting;",
				
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
			THREE.Snippets[ "lights_pars_fragment" ],
				
			"void main() {",
					
				"vec4 mColor = vec4( color, opacity );",
				"vec4 mapColor = vec4( 1.0 );",
				"vec4 cubeColor = vec4( 1.0 );",

				THREE.Snippets[ "map_fragment" ],
				THREE.Snippets[ "lights_fragment" ],

				"gl_FragColor =  mapColor * totalLight * vec4( vLightWeighting, 1.0 );",
				
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [
		
			"#define PHONG",
			
			"varying vec3 vLightWeighting;",
			"varying vec3 vViewPosition;",
			"varying vec3 vNormal;",
			
			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "lights_pars_vertex" ],
			
			"void main() {",
		
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				
				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				
				"#ifndef USE_ENVMAP",
					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
				"#endif",
				
				"vViewPosition = cameraPosition - mPosition.xyz;",
				
				"vec3 transformedNormal = normalize( normalMatrix * normal );",
				"vNormal = transformedNormal;",

				THREE.Snippets[ "lights_vertex" ],
				
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")
		
	}	

};
