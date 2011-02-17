/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
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
	_oldFramebuffer = null,	

	// gl state cache
	
	_oldDoubleSided = null,
	_oldFlipSided = null,
	_oldBlending = null,
	
	// camera matrices caches
	
	_frustum = [ 
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()
	 ],

	_projScreenMatrix = new THREE.Matrix4(),
	_projectionMatrixArray = new Float32Array( 16 ),
	
	_viewMatrixArray = new Float32Array( 16 ),	

	_vector3 = new THREE.Vector4(),
	
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

	this.context = _gl;

	//alert( dumpObject( getGLParams() ) );

	this.lights = {

		ambient: 	 [ 0, 0, 0 ],
		directional: { length: 0, colors: new Array(), positions: new Array() },
		point: 		 { length: 0, colors: new Array(), positions: new Array() }

	};

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.setClearColorHex = function ( hex, alpha ) {

		var color = new THREE.Color( hex );
		_gl.clearColor( color.r, color.g, color.b, alpha );

	};

	this.setClearColor = function ( color, alpha ) {

		_gl.clearColor( color.r, color.g, color.b, alpha );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};


	this.setupLights = function ( program, lights ) {

		var l, ll, light, r = 0, g = 0, b = 0,
			color, position, intensity,

			zlights = this.lights,

			dcolors    = zlights.directional.colors,
			dpositions = zlights.directional.positions,

			pcolors    = zlights.point.colors,
			ppositions = zlights.point.positions,

			dlength = 0,
			plength = 0,
		
			doffset = 0,
			poffset = 0;

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

				doffset = dlength * 3;
				
				dcolors[ doffset ]     = color.r * intensity;
				dcolors[ doffset + 1 ] = color.g * intensity;
				dcolors[ doffset + 2 ] = color.b * intensity;

				dpositions[ doffset ]     = position.x;
				dpositions[ doffset + 1 ] = position.y;
				dpositions[ doffset + 2 ] = position.z;

				dlength += 1;

			} else if( light instanceof THREE.PointLight ) {

				poffset = plength * 3;
				
				pcolors[ poffset ]     = color.r * intensity;
				pcolors[ poffset + 1 ] = color.g * intensity;
				pcolors[ poffset + 2 ] = color.b * intensity;

				ppositions[ poffset ]     = position.x;
				ppositions[ poffset + 1 ] = position.y;
				ppositions[ poffset + 2 ] = position.z;

				plength += 1;

			}

		}
		
		// null eventual remains from removed lights
		// (this is to avoid if in shader)
		
		for( l = dlength * 3; l < dcolors.length; l++ ) dcolors[ l ] = 0.0;
		for( l = plength * 3; l < pcolors.length; l++ ) pcolors[ l ] = 0.0;

		zlights.point.length = plength;
		zlights.directional.length = dlength;

		zlights.ambient[ 0 ] = r;
		zlights.ambient[ 1 ] = g;
		zlights.ambient[ 2 ] = b;

	};

	function createParticleBuffers ( geometry ) {

		geometry.__webGLVertexBuffer = _gl.createBuffer();
		geometry.__webGLColorBuffer = _gl.createBuffer();

	};

	function createLineBuffers ( geometry ) {

		geometry.__webGLVertexBuffer = _gl.createBuffer();
		geometry.__webGLColorBuffer = _gl.createBuffer();

	};

	function createMeshBuffers ( geometryChunk ) {

		geometryChunk.__webGLVertexBuffer = _gl.createBuffer();
		geometryChunk.__webGLNormalBuffer = _gl.createBuffer();
		geometryChunk.__webGLTangentBuffer = _gl.createBuffer();
		geometryChunk.__webGLColorBuffer = _gl.createBuffer();
		geometryChunk.__webGLUVBuffer = _gl.createBuffer();
		geometryChunk.__webGLUV2Buffer = _gl.createBuffer();
		
		geometryChunk.__webGLFaceBuffer = _gl.createBuffer();
		geometryChunk.__webGLLineBuffer = _gl.createBuffer();

	};
	
	function initLineBuffers ( geometry ) {

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );

		geometry.__webGLLineCount = nvertices;

	};

	function initParticleBuffers ( geometry ) {

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );
		
		geometry.__sortArray = [];

		geometry.__webGLParticleCount = nvertices;

	};

	function initMeshBuffers ( geometryChunk, object ) {

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
				nlines += 4;

			}

		}

		// TODO: only create arrays for attributes existing in the object

		geometryChunk.__vertexArray  = new Float32Array( nvertices * 3 );
		geometryChunk.__normalArray  = new Float32Array( nvertices * 3 );
		geometryChunk.__tangentArray = new Float32Array( nvertices * 4 );
		geometryChunk.__colorArray = new Float32Array( nvertices * 3 );
		geometryChunk.__uvArray = new Float32Array( nvertices * 2 );
		geometryChunk.__uv2Array = new Float32Array( nvertices * 2 );

		geometryChunk.__faceArray = new Uint16Array( ntris * 3 );
		geometryChunk.__lineArray = new Uint16Array( nlines * 2 );

		geometryChunk.__needsSmoothNormals = bufferNeedsSmoothNormals ( geometryChunk, object );

		geometryChunk.__webGLFaceCount = ntris * 3;
		geometryChunk.__webGLLineCount = nlines * 2;

	};

	function setMeshBuffers ( geometryChunk, object, hint ) {

		var f, fl, fi, face, vertexNormals, faceNormal, normal, 
			uv, uv2, v1, v2, v3, v4, t1, t2, t3, t4, 
			c1, c2, c3, c4,
			m, ml, i,
			vn, uvi, uv2i,

		vertexIndex = 0,

		offset = 0,
		offset_uv = 0,
		offset_uv2 = 0,
		offset_face = 0,
		offset_normal = 0,
		offset_tangent = 0,
		offset_line = 0,
		offset_color = 0,

		vertexArray = geometryChunk.__vertexArray,
		uvArray = geometryChunk.__uvArray,
		uv2Array = geometryChunk.__uv2Array,
		normalArray = geometryChunk.__normalArray,
		tangentArray = geometryChunk.__tangentArray,
		colorArray = geometryChunk.__colorArray,

		faceArray = geometryChunk.__faceArray,
		lineArray = geometryChunk.__lineArray,

		needsSmoothNormals = geometryChunk.__needsSmoothNormals,
		
		geometry = object.geometry, // this is shared for all chunks
		
		dirtyVertices = geometry.__dirtyVertices,
		dirtyElements = geometry.__dirtyElements, 
		dirtyUvs = geometry.__dirtyUvs, 
		dirtyNormals = geometry.__dirtyNormals, 
		dirtyTangents = geometry.__dirtyTangents,
		dirtyColors = geometry.__dirtyColors,

		vertices = geometry.vertices,
		chunk_faces = geometryChunk.faces,
		obj_faces = geometry.faces,
		obj_uvs = geometry.uvs,
		obj_uvs2 = geometry.uvs2,
		obj_colors = geometry.colors;
		
		for ( f = 0, fl = chunk_faces.length; f < fl; f++ ) {

			fi = chunk_faces[ f ];
			face = obj_faces[ fi ];
			uv = obj_uvs[ fi ];
			uv2 = obj_uvs2[ fi ];

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

				if ( dirtyColors && obj_colors.length ) {
					
					c1 = obj_colors[ face.a ];
					c2 = obj_colors[ face.b ];
					c3 = obj_colors[ face.c ];

					colorArray[ offset_color ]     = c1.r;
					colorArray[ offset_color + 1 ] = c1.g;
					colorArray[ offset_color + 2 ] = c1.b;

					colorArray[ offset_color + 3 ] = c2.r;
					colorArray[ offset_color + 4 ] = c2.g;
					colorArray[ offset_color + 5 ] = c2.b;

					colorArray[ offset_color + 6 ] = c3.r;
					colorArray[ offset_color + 7 ] = c3.g;
					colorArray[ offset_color + 8 ] = c3.b;
					
					offset_color += 9;

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

				if ( dirtyUvs && uv2 ) {

					for ( i = 0; i < 3; i ++ ) {

						uv2i = uv2[ i ];

						uv2Array[ offset_uv2 ]     = uv2i.u;
						uv2Array[ offset_uv2 + 1 ] = uv2i.v;

						offset_uv2 += 2;

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
				
				if ( dirtyColors && obj_colors.length ) {

					c1 = obj_colors[ face.a ];
					c2 = obj_colors[ face.b ];
					c3 = obj_colors[ face.c ];
					c4 = obj_colors[ face.d ];

					colorArray[ offset_color ]     = c1.r;
					colorArray[ offset_color + 1 ] = c1.g;
					colorArray[ offset_color + 2 ] = c1.b;

					colorArray[ offset_color + 3 ] = c2.r;
					colorArray[ offset_color + 4 ] = c2.g;
					colorArray[ offset_color + 5 ] = c2.b;

					colorArray[ offset_color + 6 ] = c3.r;
					colorArray[ offset_color + 7 ] = c3.g;
					colorArray[ offset_color + 8 ] = c3.b;

					colorArray[ offset_color + 9 ]  = c4.r;
					colorArray[ offset_color + 10 ] = c4.g;
					colorArray[ offset_color + 11 ] = c4.b;
					
					offset_color += 12;

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
				
				if ( dirtyUvs && uv2 ) {

					for ( i = 0; i < 4; i ++ ) {

						uv2i = uv2[ i ];

						uv2Array[ offset_uv2 ]     = uv2i.u;
						uv2Array[ offset_uv2 + 1 ] = uv2i.v;

						offset_uv2 += 2;

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
					lineArray[ offset_line + 3 ] = vertexIndex + 3;

					lineArray[ offset_line + 4 ] = vertexIndex + 1;
					lineArray[ offset_line + 5 ] = vertexIndex + 2;

					lineArray[ offset_line + 6 ] = vertexIndex + 2;
					lineArray[ offset_line + 7 ] = vertexIndex + 3;

					offset_line += 8;

					vertexIndex += 4;

				}

			}

		}

		if ( dirtyVertices ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors && obj_colors.length ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );

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

		if ( dirtyUvs && offset_uv2 > 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLUV2Buffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, uv2Array, hint );

		}

		if( dirtyElements ) {

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLFaceBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, faceArray, hint );

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLLineBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, lineArray, hint );

		}

	};

	function setLineBuffers ( geometry, hint ) {

		var v, c, vertex, offset,
			vertices = geometry.vertices,
			colors = geometry.colors,
			vl = vertices.length,
			cl = colors.length,

			vertexArray = geometry.__vertexArray,
			colorArray = geometry.__colorArray,
		
			dirtyVertices = geometry.__dirtyVertices, 
			dirtyColors = geometry.__dirtyColors;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v++ ) {

				vertex = vertices[ v ].position;

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webGLVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webGLColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );

		}

	};

	function setParticleBuffers ( geometry, hint, object, camera ) {

		var v, c, vertex, offset,
			vertices = geometry.vertices,
			vl = vertices.length,

			colors = geometry.colors,
			cl = colors.length,
		
			vertexArray = geometry.__vertexArray,
			colorArray = geometry.__colorArray,
		
			sortArray = geometry.__sortArray,
		
			dirtyVertices = geometry.__dirtyVertices,
			dirtyElements = geometry.__dirtyElements,
			dirtyColors = geometry.__dirtyColors;

		if ( object.sortParticles ) {
		
			_projScreenMatrix.multiplySelf( object.matrixWorld );
			
			for ( v = 0; v < vl; v++ ) {

				vertex = vertices[ v ].position;
				
				_vector3.copy( vertex );
				_projScreenMatrix.multiplyVector3( _vector3 );
				
				sortArray[ v ] = [ _vector3.z, v ];
				
			}
			
			sortArray.sort( function(a,b) { return b[0] - a[0]; } );
			
			for ( v = 0; v < vl; v++ ) {
				
				vertex = vertices[ sortArray[v][1] ].position;
				
				offset = v * 3;
				
				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;
				
			}
			
			for ( c = 0; c < cl; c++ ) {
				
				offset = c * 3;
				
				color = colors[ sortArray[c][1] ];

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;
				
			}
			
			
		} else {
		
			if ( dirtyVertices ) {

				for ( v = 0; v < vl; v++ ) {

					vertex = vertices[ v ].position;

					offset = v * 3;

					vertexArray[ offset ]     = vertex.x;
					vertexArray[ offset + 1 ] = vertex.y;
					vertexArray[ offset + 2 ] = vertex.z;

				}

			}
			
			if ( dirtyColors ) {
				
				for ( c = 0; c < cl; c++ ) {

					color = colors[ c ];

					offset = c * 3;

					colorArray[ offset ]     = color.r;
					colorArray[ offset + 1 ] = color.g;
					colorArray[ offset + 2 ] = color.b;

				}
				
			}

		}
		
		if ( dirtyVertices || object.sortParticles ) {
		
			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webGLVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );
			
		}
		
		if ( dirtyColors || object.sortParticles ) {
			
			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webGLColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );
		
		}
		
	};

	function setMaterialShaders( material, shaders ) {

		material.fragment_shader = shaders.fragment_shader;
		material.vertex_shader = shaders.vertex_shader;
		material.uniforms = Uniforms.clone( shaders.uniforms );

	};

	function refreshUniformsCommon( uniforms, material ) {

		// premultiply alpha
		uniforms.diffuse.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );

		// pure color
		//uniforms.color.value.setHex( material.color.hex );

		uniforms.opacity.value = material.opacity;
		uniforms.map.texture = material.map;
		
		uniforms.light_map.texture = material.light_map;

		uniforms.env_map.texture = material.env_map;
		uniforms.reflectivity.value = material.reflectivity;
		uniforms.refraction_ratio.value = material.refraction_ratio;
		uniforms.combine.value = material.combine;
		uniforms.useRefract.value = material.env_map && material.env_map.mapping instanceof THREE.CubeRefractionMapping;

	};

	function refreshUniformsLine( uniforms, material ) {

		uniforms.diffuse.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );
		uniforms.opacity.value = material.opacity;

	};

	function refreshUniformsParticle( uniforms, material ) {

		uniforms.psColor.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size;
		uniforms.map.texture = material.map;

	};
	
	function refreshUniformsFog( uniforms, fog ) {
	
		uniforms.fogColor.value.setHex( fog.color.hex );

		if ( fog instanceof THREE.Fog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog instanceof THREE.FogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}
	
	};

	function refreshUniformsPhong( uniforms, material ) {

		//uniforms.ambient.value.setHex( material.ambient.hex );
		//uniforms.specular.value.setHex( material.specular.hex );
		uniforms.ambient.value.setRGB( material.ambient.r, material.ambient.g, material.ambient.b );
		uniforms.specular.value.setRGB( material.specular.r, material.specular.g, material.specular.b );
		uniforms.shininess.value = material.shininess;

	};


	function refreshUniformsLights( uniforms, lights ) {

		uniforms.enableLighting.value = lights.directional.length + lights.point.length;
		uniforms.ambientLightColor.value = lights.ambient;
		uniforms.directionalLightColor.value = lights.directional.colors;
		uniforms.directionalLightDirection.value = lights.directional.positions;
		uniforms.pointLightColor.value = lights.point.colors;
		uniforms.pointLightPosition.value = lights.point.positions;

	};

	this.initMaterial = function( material, lights, fog ) {

		var u, identifiers, parameters, maxLightCount;
		
		if ( material instanceof THREE.MeshDepthMaterial ) {

			setMaterialShaders( material, THREE.ShaderLib[ 'depth' ] );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			setMaterialShaders( material, THREE.ShaderLib[ 'normal' ] );

		} else if ( material instanceof THREE.MeshBasicMaterial ) {

			setMaterialShaders( material, THREE.ShaderLib[ 'basic' ] );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			setMaterialShaders( material, THREE.ShaderLib[ 'lambert' ] );

		} else if ( material instanceof THREE.MeshPhongMaterial ) {

			setMaterialShaders( material, THREE.ShaderLib[ 'phong' ] );

		} else if ( material instanceof THREE.LineBasicMaterial ) {

			setMaterialShaders( material, THREE.ShaderLib[ 'basic' ] );

		} else if ( material instanceof THREE.ParticleBasicMaterial ) {
			
			setMaterialShaders( material, THREE.ShaderLib[ 'particle_basic' ] );
			
		}

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		maxLightCount = allocateLights( lights, 4 );

		parameters = { fog: fog, map: material.map, env_map: material.env_map, light_map: material.light_map, vertex_colors: material.vertex_colors,
					   maxDirLights: maxLightCount.directional, maxPointLights: maxLightCount.point };
		material.program = buildProgram( material.fragment_shader, material.vertex_shader, parameters );

		identifiers = [ 'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'objectMatrix', 'cameraPosition' ];
		for( u in material.uniforms ) {

			identifiers.push(u);

		}

		cacheUniformLocations( material.program, identifiers );
		cacheAttributeLocations( material.program, [ "position", "normal", "uv", "uv2", "tangent", "color" ] );

	};
	
	this.setProgram = function( camera, lights, fog, material, object ) {
		
		if ( !material.program ) this.initMaterial( material, lights, fog );

		var program = material.program, 
			p_uniforms = program.uniforms,
			m_uniforms = material.uniforms;

		if( program != _oldProgram ) {

			_gl.useProgram( program );
			_oldProgram = program;
			
			_gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, _projectionMatrixArray );

		}
		
		// refresh uniforms common to several materials
		
		if ( fog && ( 
			 material instanceof THREE.MeshBasicMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.LineBasicMaterial ||
			 material instanceof THREE.ParticleBasicMaterial )
			) {
			
			refreshUniformsFog( m_uniforms, fog );
			
		}		

		if ( material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.MeshLambertMaterial ) {

			this.setupLights( program, lights );
			refreshUniformsLights( m_uniforms, this.lights );

		}

		if ( material instanceof THREE.MeshBasicMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshPhongMaterial ) {

			refreshUniformsCommon( m_uniforms, material );

		}

		// refresh single material specific uniforms
		
		if ( material instanceof THREE.LineBasicMaterial ) {

			refreshUniformsLine( m_uniforms, material );
			
		} else if ( material instanceof THREE.ParticleBasicMaterial ) {

			refreshUniformsParticle( m_uniforms, material );
			
		} else if ( material instanceof THREE.MeshPhongMaterial ) {

			refreshUniformsPhong( m_uniforms, material );

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			m_uniforms.mNear.value = camera.near;
			m_uniforms.mFar.value = camera.far;
			m_uniforms.opacity.value = material.opacity;
			
		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			m_uniforms.opacity.value = material.opacity;
			
		}
		
		// load common uniforms
		
		loadUniformsGeneric( program, m_uniforms );
		loadUniformsMatrices( p_uniforms, object );

		// load material specific uniforms
		// (shader material also gets them for the sake of genericity)
		
		if ( material instanceof THREE.MeshShaderMaterial ||
			 material instanceof THREE.MeshPhongMaterial ||
			 material.env_map ) {
			
			_gl.uniform3f( p_uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );
			
		}
		
		if ( material instanceof THREE.MeshShaderMaterial ||
			 material.env_map) {
				 
			_gl.uniformMatrix4fv( p_uniforms.objectMatrix, false, object._objectMatrixArray );
		
		}

		if ( material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshShaderMaterial ) {
			 
			_gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, _viewMatrixArray );
			
		}
		
		return program;
		
	};
	
	this.renderBuffer = function ( camera, lights, fog, material, geometryChunk, object ) {

		var program, attributes, linewidth, primitives;

		program = this.setProgram( camera, lights, fog, material, object );
		
		attributes = program.attributes;

		// vertices

		_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLVertexBuffer );
		_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );
		_gl.enableVertexAttribArray( attributes.position );

		// colors

		if ( attributes.color >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLColorBuffer );
			_gl.vertexAttribPointer( attributes.color, 3, _gl.FLOAT, false, 0, 0 );
			_gl.enableVertexAttribArray( attributes.color );

		}

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

		if ( attributes.uv2 >= 0 ) {

			if ( geometryChunk.__webGLUV2Buffer ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLUV2Buffer );
				_gl.vertexAttribPointer( attributes.uv2, 2, _gl.FLOAT, false, 0, 0 );

				_gl.enableVertexAttribArray( attributes.uv2 );

			} else {

				_gl.disableVertexAttribArray( attributes.uv2 );

			}

		}

		// render mesh

		if ( object instanceof THREE.Mesh ) {

			// wireframe
			
			if ( material.wireframe ) {

				_gl.lineWidth( material.wireframe_linewidth );
				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLLineBuffer );
				_gl.drawElements( _gl.LINES, geometryChunk.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );
			
			// triangles
			
			} else {
				
				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLFaceBuffer );
				_gl.drawElements( _gl.TRIANGLES, geometryChunk.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );
				
			}
		
		// render lines
		
		} else if ( object instanceof THREE.Line ) {
			
			primitives = ( object.type == THREE.LineStrip ) ? _gl.LINE_STRIP : _gl.LINES;

			_gl.lineWidth( material.linewidth );
			_gl.drawArrays( primitives, 0, geometryChunk.__webGLLineCount );
		
		// render particles
		
		} else if ( object instanceof THREE.ParticleSystem ) {
			
			_gl.drawArrays( _gl.POINTS, 0, geometryChunk.__webGLParticleCount );
			
		}

	};

	function renderBufferImmediate( object, program ) {
		
		if ( ! object.__webGLVertexBuffer ) object.__webGLVertexBuffer = _gl.createBuffer();
		if ( ! object.__webGLNormalBuffer ) object.__webGLNormalBuffer = _gl.createBuffer();
		
		if ( object.hasPos ) {
			
		  _gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLVertexBuffer );
		  _gl.bufferData( _gl.ARRAY_BUFFER, object.positionArray, _gl.DYNAMIC_DRAW );
		  _gl.enableVertexAttribArray( program.attributes.position );
		  _gl.vertexAttribPointer( program.attributes.position, 3, _gl.FLOAT, false, 0, 0 );
		
		}
		
		if ( object.hasNormal ) {
			
		  _gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLNormalBuffer );
		  _gl.bufferData( _gl.ARRAY_BUFFER, object.normalArray, _gl.DYNAMIC_DRAW );
		  _gl.enableVertexAttribArray( program.attributes.normal );
		  _gl.vertexAttribPointer( program.attributes.normal, 3, _gl.FLOAT, false, 0, 0 );
		
		}
		
		_gl.drawArrays( _gl.TRIANGLES, 0, object.count );
		
		object.count = 0;
		
	};
	
	function setObjectFaces( object ) {
		
		if ( _oldDoubleSided != object.doubleSided ) {
			
			if( object.doubleSided ) {
				
				_gl.disable( _gl.CULL_FACE );

			} else {

				_gl.enable( _gl.CULL_FACE );
			
			}
			
			_oldDoubleSided = object.doubleSided;
		
		}
		
		if ( _oldFlipSided != object.flipSided ) {
		
			if( object.flipSided ) {

				_gl.frontFace( _gl.CW );

			} else {

				_gl.frontFace( _gl.CCW );

			}
			
			_oldFlipSided = object.flipSided;

		}
		
	};
	
	function computeFrustum( m ) {

		_frustum[ 0 ].set( m.n41 - m.n11, m.n42 - m.n12, m.n43 - m.n13, m.n44 - m.n14 );
		_frustum[ 1 ].set( m.n41 + m.n11, m.n42 + m.n12, m.n43 + m.n13, m.n44 + m.n14 );
		_frustum[ 2 ].set( m.n41 + m.n21, m.n42 + m.n22, m.n43 + m.n23, m.n44 + m.n24 );
		_frustum[ 3 ].set( m.n41 - m.n21, m.n42 - m.n22, m.n43 - m.n23, m.n44 - m.n24 );
		_frustum[ 4 ].set( m.n41 - m.n31, m.n42 - m.n32, m.n43 - m.n33, m.n44 - m.n34 );
		_frustum[ 5 ].set( m.n41 + m.n31, m.n42 + m.n32, m.n43 + m.n33, m.n44 + m.n34 );

		var i, plane;
		
		for ( i = 0; i < 5; i ++ ) {

			plane = _frustum[ i ];
			plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

		}

	};
	
	function isInFrustum( object ) {

		var distance, matrix = object.matrix,
		radius = - object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) );

		for ( var i = 0; i < 6; i ++ ) {

			distance = _frustum[ i ].x * matrix.n14 + _frustum[ i ].y * matrix.n24 + _frustum[ i ].z * matrix.n34 + _frustum[ i ].w;
			if ( distance <= radius ) return false;

		}

		return true;

	};

	function addToFixedArray( where, what ) {
		
		where.list[ where.count ] = what;
		where.count += 1;
	
	};
	
	function unrollImmediateBufferMaterials( globject ) {
		
		var i, l, m, ml, material,
			object = globject.object,
			opaque = globject.opaque,
			transparent = globject.transparent;

		transparent.count = 0;
		opaque.count = 0;
		
		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			material = object.materials[ m ];
			
			if ( ( material.opacity && material.opacity < 1.0 ) || material.blending != THREE.NormalBlending )
				addToFixedArray( transparent, material );
			else
				addToFixedArray( opaque, material );
			
		}
		
	};
	
	function unrollBufferMaterials( globject ) {
		
		var i, l, m, ml, material, meshMaterial,
			object = globject.object,
			buffer = globject.buffer,
			opaque = globject.opaque,
			transparent = globject.transparent;

		transparent.count = 0;
		opaque.count = 0;
		
		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = buffer.materials.length; i < l; i++ ) {

					material = buffer.materials[ i ];
					
					if ( material ) {
						
						if ( ( material.opacity && material.opacity < 1.0 ) || material.blending != THREE.NormalBlending )
							addToFixedArray( transparent, material );
						else
							addToFixedArray( opaque, material );
						
					}

				}

			} else {

				material = meshMaterial;
				
				if ( ( material.opacity && material.opacity < 1.0 ) || material.blending != THREE.NormalBlending )
					addToFixedArray( transparent, material );
				else
					addToFixedArray( opaque, material );

			}

		}
		
	};
	
	function updateChildren( object ) {
		
		var i, l, child, children = object.children;
		
		for ( i = 0, l = children.length; i < l; i ++ ) {

			child = children[ i ];

			child.autoUpdateMatrix && child.updateMatrix();
			child.matrixWorld.multiply( object.matrixWorld, child.matrix );
			
			updateChildren( child );
		
		}
	
	};
	
	this.render = function( scene, camera, renderTarget, clear ) {

		var i, program, opaque, transparent,
			o, ol, oil, webGLObject, object, buffer,
			lights = scene.lights,
			fog = scene.fog,
			ol;
		
		camera.autoUpdateMatrix && camera.updateMatrix();
		
		camera.matrix.flattenToArray( _viewMatrixArray );
		camera.projectionMatrix.flattenToArray( _projectionMatrixArray );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrix );
		computeFrustum( _projScreenMatrix );
		
		this.initWebGLObjects( scene, camera );

		setRenderTarget( renderTarget, clear !== undefined ? clear : true );

		if ( this.autoClear ) {

			this.clear();

		}

		// set matrices
		
		ol = scene.__webGLObjects.length;
	
		for ( o = 0; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];
			object = webGLObject.object;

			if ( object.visible ) {
				
				if ( webGLObject.root ) {
			
					object.autoUpdateMatrix && object.updateMatrix();
					object.matrixWorld.copy( object.matrix );
				
					updateChildren( object );
					
				}

				if ( ! ( object instanceof THREE.Mesh ) || isInFrustum( object ) ) {
					
					object.matrixWorld.flattenToArray( object._objectMatrixArray );
					
					setupMatrices( object, camera );
					
					unrollBufferMaterials( webGLObject );
					
					webGLObject.render = true;
					
				
				} else {
					
					webGLObject.render = false;
					
				}
				
			} else {
				
				webGLObject.render = false;

			}
		
		}
		
		oil = scene.__webGLObjectsImmediate.length;
		
		for ( o = 0; o < oil; o++ ) {
		
			webGLObject = scene.__webGLObjectsImmediate[ o ];
			object = webGLObject.object;
			
			if ( object.visible ) {
			
				if( object.autoUpdateMatrix ) { 
				
					object.updateMatrix();
					object.matrixWorld.copy( object.matrix );
					object.matrixWorld.flattenToArray( object._objectMatrixArray );
				
				}
				
				setupMatrices( object, camera );
				
				unrollImmediateBufferMaterials( webGLObject );
			
			}
		
		}

		// opaque pass

		setBlending( THREE.NormalBlending );
		
		for ( o = 0; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			if ( webGLObject.render ) {
				
				object = webGLObject.object;
				buffer = webGLObject.buffer;
				opaque = webGLObject.opaque;
				
				setObjectFaces( object );
				
				for( i = 0; i < opaque.count; i++ ) {
					
					material = opaque.list[ i ];
					
					this.setDepthTest( material.depth_test );
					this.renderBuffer( camera, lights, fog, material, buffer, object );
				
				}

			}

		}

		// opaque pass (immediate simulator)
		
		for ( o = 0; o < oil; o++ ) {
			
			webGLObject = scene.__webGLObjectsImmediate[ o ];
			object = webGLObject.object;
			
			if ( object.visible ) {
			
				opaque = webGLObject.opaque;
				
				setObjectFaces( object );
				
				for( i = 0; i < opaque.count; i++ ) {
				
					material = opaque.list[ i ];
				
					this.setDepthTest( material.depth_test );
					program = this.setProgram( camera, lights, fog, material, object );
					object.render( function( object ) { renderBufferImmediate( object, program ); } );
				
				}
			
			}
			
		}

		// transparent pass

		for ( o = 0; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			if ( webGLObject.render ) {
				
				object = webGLObject.object;
				buffer = webGLObject.buffer;
				transparent = webGLObject.transparent;
				
				setObjectFaces( object );
				
				for( i = 0; i < transparent.count; i++ ) {
					
					material = transparent.list[ i ];
					
					setBlending( material.blending );
					this.setDepthTest( material.depth_test );
					this.renderBuffer( camera, lights, fog, material, buffer, object );
				
				}

			}

		}

		// transparent pass (immediate simulator)
		
		for ( o = 0; o < oil; o++ ) {
		
			webGLObject = scene.__webGLObjectsImmediate[ o ];
			object = webGLObject.object;
			
			if ( object.visible ) {
			
				transparent = webGLObject.transparent;
				
				setObjectFaces( object );
				
				for( i = 0; i < transparent.count; i++ ) {
				
					material = transparent.list[ i ];
				
					setBlending( material.blending );
					this.setDepthTest( material.depth_test );
					program = this.setProgram( camera, lights, fog, material, object );
					object.render( function( object ) { renderBufferImmediate( object, program ); } );
				
				}
			
			}
			
		}
	
		// Generate mipmap if we're using any kind of mipmap filtering

		if ( renderTarget && renderTarget.min_filter !== THREE.NearestFilter && renderTarget.min_filter !== THREE.LinearFilter ) {

			updateRenderTargetMipmap( renderTarget );

		}

	};

	function addChildren( scene, object ) {
	
		var i, l, children = object.children;
		
		for ( i = 0, l = children.length; i < l; i ++ ) {

			child = children[ i ];

			addObject( scene, child, false );
			addChildren( scene, child );
		
		}

	};

	function addObject( scene, object, root ) {
		
		var g, geometry, geometryChunk, objmap;
		
		geometry = object.geometry;
		
		if ( scene.__webGLObjectsMap[ object.id ] == undefined ) {

			scene.__webGLObjectsMap[ object.id ] = {};
				
			object._modelViewMatrix = new THREE.Matrix4();
			
			object._normalMatrixArray = new Float32Array( 9 );
			object._modelViewMatrixArray = new Float32Array( 16 );
			object._objectMatrixArray = new Float32Array( 16 );
			
			object.matrix.flattenToArray( object._objectMatrixArray );

		}

		objmap = scene.__webGLObjectsMap[ object.id ];
		objlist = scene.__webGLObjects;

		if ( object instanceof THREE.Mesh ) {

			// create separate VBOs per geometry chunk

			for ( g in geometry.geometryChunks ) {

				geometryChunk = geometry.geometryChunks[ g ];

				// initialise VBO on the first access

				if( ! geometryChunk.__webGLVertexBuffer ) {

					createMeshBuffers( geometryChunk );
					initMeshBuffers( geometryChunk, object );

					geometry.__dirtyVertices = true;
					geometry.__dirtyElements = true;
					geometry.__dirtyUvs = true;
					geometry.__dirtyNormals = true;
					geometry.__dirtyTangents = true;
					geometry.__dirtyColors = true;

				}

				if( geometry.__dirtyVertices || geometry.__dirtyElements || 
					geometry.__dirtyUvs || geometry.__dirtyNormals || 
					geometry.__dirtyColors || geometry.__dirtyTangents ) {

					setMeshBuffers( geometryChunk, object, _gl.DYNAMIC_DRAW );

				}

				// create separate wrapper per each use of VBO

				add_buffer( objlist, objmap, g, geometryChunk, object, root );

			}

			geometry.__dirtyVertices = false;
			geometry.__dirtyElements = false;
			geometry.__dirtyUvs = false;
			geometry.__dirtyNormals = false;
			geometry.__dirtyTangents = false;
			geometry.__dirtyColors = false;

		} else if ( object instanceof THREE.Line ) {

			if( ! geometry.__webGLVertexBuffer ) {

				createLineBuffers( geometry );
				initLineBuffers( geometry );

				geometry.__dirtyVertices = true;
				geometry.__dirtyColors = true;

			}

			if( geometry.__dirtyVertices ||  geometry.__dirtyColors ) {

				setLineBuffers( geometry, _gl.DYNAMIC_DRAW );

			}

			add_buffer( objlist, objmap, 0, geometry, object, root );

			geometry.__dirtyVertices = false;
			geometry.__dirtyColors = false;

		} else if ( object instanceof THREE.ParticleSystem ) {

			if( ! geometry.__webGLVertexBuffer ) {

				createParticleBuffers( geometry );
				initParticleBuffers( geometry );

				geometry.__dirtyVertices = true;
				geometry.__dirtyColors = true;
				
			}

			if( geometry.__dirtyVertices || geometry.__dirtyColors || object.sortParticles ) {

				setParticleBuffers( geometry, _gl.DYNAMIC_DRAW, object, camera );

			}

			add_buffer( objlist, objmap, 0, geometry, object, root );

			geometry.__dirtyVertices = false;
			geometry.__dirtyColors = false;

		} else if ( object instanceof THREE.MarchingCubes ) {
			
			add_buffer_immediate( scene.__webGLObjectsImmediate, objmap, 0, object, root );
			
		}/*else if ( object instanceof THREE.Particle ) {

		}*/
		
	};

	function add_buffer( objlist, objmap, id, buffer, object, root ) {

		if ( objmap[ id ] == undefined ) {

			objlist.push( { buffer: buffer, object: object, 
							opaque: { list: [], count: 0 }, 
							transparent: { list: [], count: 0 },
							root: root
						} );
			
			objmap[ id ] = 1;

		}

	};

	function add_buffer_immediate( objlist, objmap, id, object, root ) {

		if ( objmap[ id ] == undefined ) {

			objlist.push( { object: object, 
							opaque: { list: [], count: 0 }, 
							transparent: { list: [], count: 0 },
							root: root
						} );
			
			objmap[ id ] = 1;

		}

	};
	
	this.initWebGLObjects = function( scene, camera ) {

		var o, ol, object;

		if ( !scene.__webGLObjects ) {

			scene.__webGLObjects = [];
			scene.__webGLObjectsMap = {};

			scene.__webGLObjectsImmediate = [];

		}
		
		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			addObject( scene, object, true );
			addChildren( scene, object );
		
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

	function setupMatrices ( object, camera ) {

		object._modelViewMatrix.multiplyToArray( camera.matrix, object.matrixWorld, object._modelViewMatrixArray );
		object._normalMatrix = THREE.Matrix4.makeInvert3x3( object._modelViewMatrix ).transposeIntoArray( object._normalMatrixArray );

	};

	this.setDepthTest = function( test ) {
		
		if( test ) {
			
			_gl.enable( _gl.DEPTH_TEST );
			
		} else {
			
			_gl.disable( _gl.DEPTH_TEST );
			
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

		} catch(e) { console.log(e) }

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
		
		_cullEnabled = true;

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
			parameters.light_map ? "#define USE_LIGHTMAP" : "",
			parameters.vertex_colors ? "#define USE_COLOR" : "",

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
			parameters.light_map ? "#define USE_LIGHTMAP" : "",
			parameters.vertex_colors ? "#define USE_COLOR" : "",

			"uniform mat4 objectMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",
			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec3 color;",
			"attribute vec2 uv;",
			"attribute vec2 uv2;",
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
		
		//console.log( prefix_fragment + fragment_shader );
		//console.log( prefix_vertex + vertex_shader );

		program.uniforms = {};
		program.attributes = {};

		return program;

	};

	function loadUniformsMatrices( uniforms, object ) {
		
		_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object._modelViewMatrixArray );
		_gl.uniformMatrix3fv( uniforms.normalMatrix, false, object._normalMatrixArray );

	};
	
	function loadUniformsGeneric( program, uniforms ) {

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

			} else if( type == "fv1" ) {

				_gl.uniform1fv( location, value );

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

	function setBlending( blending ) {

		if ( blending != _oldBlending ) {
		
			switch ( blending ) {

				case THREE.AdditiveBlending:

					_gl.blendEquation( _gl.FUNC_ADD );
					_gl.blendFunc( _gl.ONE, _gl.ONE );

					break;

				case THREE.SubtractiveBlending:

					//_gl.blendEquation( _gl.FUNC_SUBTRACT );
					_gl.blendFunc( _gl.DST_COLOR, _gl.ZERO );

					break;

				case THREE.BillboardBlending:

					_gl.blendEquation( _gl.FUNC_ADD );
					_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);

					break;

				case THREE.ReverseSubtractiveBlending:

					_gl.blendEquation( _gl.FUNC_REVERSE_SUBTRACT );
					_gl.blendFunc( _gl.ONE, _gl.ONE );

    				break;
				default:

					_gl.blendEquation( _gl.FUNC_ADD );
					_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );

					break;
			
			}
			
			_oldBlending = blending;
		
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

	function setRenderTarget( renderTexture, clear ) {

		if ( renderTexture && !renderTexture.__webGLFramebuffer ) {

			renderTexture.__webGLFramebuffer = _gl.createFramebuffer();
			renderTexture.__webGLRenderbuffer = _gl.createRenderbuffer();
			renderTexture.__webGLTexture = _gl.createTexture();

			// Setup renderbuffer

			_gl.bindRenderbuffer( _gl.RENDERBUFFER, renderTexture.__webGLRenderbuffer );
			_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTexture.width, renderTexture.height );

			// Setup texture

			_gl.bindTexture( _gl.TEXTURE_2D, renderTexture.__webGLTexture );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( renderTexture.wrap_s ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( renderTexture.wrap_t ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( renderTexture.mag_filter ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( renderTexture.min_filter ) );
			_gl.texImage2D( _gl.TEXTURE_2D, 0, paramThreeToGL( renderTexture.format ), renderTexture.width, renderTexture.height, 0, paramThreeToGL( renderTexture.format ), paramThreeToGL( renderTexture.type ), null );

			// Setup framebuffer

			_gl.bindFramebuffer( _gl.FRAMEBUFFER, renderTexture.__webGLFramebuffer );
			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D, renderTexture.__webGLTexture, 0 );
			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderTexture.__webGLRenderbuffer );

			// Release everything

			_gl.bindTexture( _gl.TEXTURE_2D, null );
			_gl.bindRenderbuffer( _gl.RENDERBUFFER, null );
			_gl.bindFramebuffer( _gl.FRAMEBUFFER, null);

		}

		var framebuffer, width, height;

		if ( renderTexture ) {

			framebuffer = renderTexture.__webGLFramebuffer;
			width = renderTexture.width;
			height = renderTexture.height;

		} else {

			framebuffer = null;
			width = _canvas.width;
			height = _canvas.height;

		}

		if( framebuffer != _oldFramebuffer ) {

			_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
			_gl.viewport( 0, 0, width, height );

			if ( clear ) {

				_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

			}

			_oldFramebuffer = framebuffer;

		}

	};

	function updateRenderTargetMipmap( renderTarget ) {

		_gl.bindTexture( _gl.TEXTURE_2D, renderTarget.__webGLTexture );
		_gl.generateMipmap( _gl.TEXTURE_2D );
		_gl.bindTexture( _gl.TEXTURE_2D, null );

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

			case THREE.ByteType: return _gl.BYTE; break;
			case THREE.UnsignedByteType: return _gl.UNSIGNED_BYTE; break;
			case THREE.ShortType: return _gl.SHORT; break;
			case THREE.UnsignedShortType: return _gl.UNSIGNED_SHORT; break;
			case THREE.IntType: return _gl.INT; break;
			case THREE.UnsignedShortType: return _gl.UNSIGNED_INT; break;
			case THREE.FloatType: return _gl.FLOAT; break;

			case THREE.AlphaFormat: return _gl.ALPHA; break;
			case THREE.RGBFormat: return _gl.RGB; break;
			case THREE.RGBAFormat: return _gl.RGBA; break;
			case THREE.LuminanceFormat: return _gl.LUMINANCE; break;
			case THREE.LuminanceAlphaFormat: return _gl.LUMINANCE_ALPHA; break;

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

	// FOG
	
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

		"gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );",

	"#endif"

	].join("\n"),

	// ENVIRONMENT MAP
	
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

		"vec4 cubeColor = textureCube( env_map, vec3( -vReflect.x, vReflect.yz ) );",

		"if ( combine == 1 ) {",

			//"gl_FragColor = mix( gl_FragColor, cubeColor, reflectivity );",
			"gl_FragColor = vec4( mix( gl_FragColor.xyz, cubeColor.xyz, reflectivity ), opacity );",

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
	
	// COLOR MAP (particles)

	map_particle_pars_fragment: [

	"#ifdef USE_MAP",

		"uniform sampler2D map;",

	"#endif"

	].join("\n"),


	map_particle_fragment: [

	"#ifdef USE_MAP",

		"gl_FragColor = gl_FragColor * texture2D( map, gl_PointCoord );",

	"#endif"

	].join("\n"),

	// COLOR MAP (triangles)

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

		"gl_FragColor = gl_FragColor * texture2D( map, vUv );",

	"#endif"

	].join("\n"),

	map_vertex: [

	"#ifdef USE_MAP",

		"vUv = uv;",

	"#endif"

	].join("\n"),

	// LIGHT MAP
	
	lightmap_pars_fragment: [

	"#ifdef USE_LIGHTMAP",

		"varying vec2 vUv2;",
		"uniform sampler2D light_map;",

	"#endif"

	].join("\n"),
	
	lightmap_pars_vertex: [

	"#ifdef USE_LIGHTMAP",

		"varying vec2 vUv2;",

	"#endif"

	].join("\n"),
	
	lightmap_fragment: [

	"#ifdef USE_LIGHTMAP",

		"gl_FragColor = gl_FragColor * texture2D( light_map, vUv2 );",

	"#endif"

	].join("\n"),
	
	lightmap_vertex: [

	"#ifdef USE_LIGHTMAP",

		"vUv2 = uv2;",

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

	// LIGHTS
	
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
	
	"vec4 mColor = vec4( diffuse, opacity );",
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
	"#endif",
	
	"gl_FragColor = gl_FragColor * totalLight;"

	].join("\n"),
	
	// VERTEX COLORS

	color_pars_fragment: [

	"#ifdef USE_COLOR",

		"varying vec3 vColor;",

	"#endif"

	].join("\n"),


	color_fragment: [

	"#ifdef USE_COLOR",

		"gl_FragColor = gl_FragColor * vec4( vColor, opacity );",

	"#endif"

	].join("\n"),
	
	color_pars_vertex: [

	"#ifdef USE_COLOR",

		"varying vec3 vColor;",

	"#endif"

	].join("\n"),


	color_vertex: [

	"#ifdef USE_COLOR",

		"vColor = color;",

	"#endif"

	].join("\n")
	

};

THREE.UniformsLib = {

	common: {

	"diffuse" : { type: "c", value: new THREE.Color( 0xeeeeee ) },
	"opacity" : { type: "f", value: 1.0 },
	"map"     : { type: "t", value: 0, texture: null },

	"light_map"       : { type: "t", value: 2, texture: null },

	"env_map" 		  : { type: "t", value: 1, texture: null },
	"useRefract"	  : { type: "i", value: 0 },
	"reflectivity"    : { type: "f", value: 1.0 },
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

	},

	particle: {

	"psColor"   : { type: "c", value: new THREE.Color( 0xeeeeee ) },
	"opacity" : { type: "f", value: 1.0 },
	"size" 	  : { type: "f", value: 1.0 },
	"map"     : { type: "t", value: 0, texture: null },

	"fogDensity": { type: "f", value: 0.00025 },
	"fogNear"	: { type: "f", value: 1 },
	"fogFar"	: { type: "f", value: 2000 },
	"fogColor"	: { type: "c", value: new THREE.Color( 0xffffff ) }
	
	}
	
};

THREE.ShaderLib = {

	'depth': {

		uniforms: { "mNear": { type: "f", value: 1.0 },
					"mFar" : { type: "f", value: 2000.0 },
					"opacity" : { type: "f", value: 1.0 }
				  },

		fragment_shader: [

			"uniform float mNear;",
			"uniform float mFar;",
			"uniform float opacity;",

			"void main() {",

				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
				"float color = 1.0 - smoothstep( mNear, mFar, depth );",
				"gl_FragColor = vec4( vec3( color ), opacity );",

			"}"

		].join("\n"),

		vertex_shader: [

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n")

	},

	'normal': {

		uniforms: { "opacity" : { type: "f", value: 1.0 } },

		fragment_shader: [

			"uniform float opacity;",
			"varying vec3 vNormal;",

			"void main() {",

				"gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );",

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

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			THREE.Snippets[ "color_pars_fragment" ],
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "lightmap_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( diffuse, opacity );",
		
				THREE.Snippets[ "map_fragment" ],
				THREE.Snippets[ "lightmap_fragment" ],
				THREE.Snippets[ "color_fragment" ],
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [

			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "lightmap_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "color_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "lightmap_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				THREE.Snippets[ "color_vertex" ],

				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	},

	'lambert': {

		uniforms: Uniforms.merge( [ THREE.UniformsLib[ "common" ],
									THREE.UniformsLib[ "lights" ] ] ),

		fragment_shader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			"varying vec3 vLightWeighting;",

			THREE.Snippets[ "color_pars_fragment" ],
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "lightmap_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( diffuse, opacity );",
				"gl_FragColor = gl_FragColor * vec4( vLightWeighting, 1.0 );",

				THREE.Snippets[ "map_fragment" ],
				THREE.Snippets[ "lightmap_fragment" ],
				THREE.Snippets[ "color_fragment" ],
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [

			"varying vec3 vLightWeighting;",

			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "lightmap_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "lights_pars_vertex" ],
			THREE.Snippets[ "color_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "lightmap_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				THREE.Snippets[ "color_vertex" ],

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

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			"uniform vec3 ambient;",
			"uniform vec3 specular;",
			"uniform float shininess;",

			"varying vec3 vLightWeighting;",

			THREE.Snippets[ "color_pars_fragment" ],
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "lightmap_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
			THREE.Snippets[ "lights_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( vLightWeighting, 1.0 );",
				THREE.Snippets[ "lights_fragment" ],

				THREE.Snippets[ "map_fragment" ],
				THREE.Snippets[ "lightmap_fragment" ],
				THREE.Snippets[ "color_fragment" ],
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
			THREE.Snippets[ "lightmap_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "lights_pars_vertex" ],
			THREE.Snippets[ "color_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "lightmap_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				THREE.Snippets[ "color_vertex" ],

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

	},
	
	'particle_basic': {

		uniforms: THREE.UniformsLib[ "particle" ],

		fragment_shader: [

			"uniform vec3 psColor;",
			"uniform float opacity;",

			THREE.Snippets[ "color_pars_fragment" ],
			THREE.Snippets[ "map_particle_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( psColor, opacity );",

				THREE.Snippets[ "map_particle_fragment" ],
				THREE.Snippets[ "color_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [

			"uniform float size;",
			
			THREE.Snippets[ "color_pars_vertex" ],
			
			"void main() {",

				THREE.Snippets[ "color_vertex" ],
				
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"gl_Position = projectionMatrix * mvPosition;",
				"gl_PointSize = size;",
				//"gl_PointSize = 10.0 + 6.0 * mvPosition.z;";

			"}"

		].join("\n")

	}
	

};