/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLBuffers = function ( gl, info, extensions, getBufferMaterial ) {

	function initCustomAttributes( object ) {

		var geometry = object.geometry;
		var material = object.material;

		var nvertices = geometry.vertices.length;

		if ( material.attributes ) {

			if ( geometry.__webglCustomAttributesList === undefined ) {

				geometry.__webglCustomAttributesList = [];

			}

			for ( var name in material.attributes ) {

				var attribute = material.attributes[ name ];

				if ( ! attribute.__webglInitialized || attribute.createUniqueBuffers ) {

					attribute.__webglInitialized = true;

					var size = 1;   // "f" and "i"

					if ( attribute.type === 'v2' ) size = 2;
					else if ( attribute.type === 'v3' ) size = 3;
					else if ( attribute.type === 'v4' ) size = 4;
					else if ( attribute.type === 'c'  ) size = 3;

					attribute.size = size;

					attribute.array = new Float32Array( nvertices * size );

					attribute.buffer = gl.createBuffer();
					attribute.buffer.belongsToAttribute = name;

					attribute.needsUpdate = true;

				}

				geometry.__webglCustomAttributesList.push( attribute );

			}

		}

	};

	this.initPointCloudBuffers = function ( geometry, object ) {

		if ( geometry.__webglVertexBuffer !== undefined ) return;

		geometry.__webglVertexBuffer = gl.createBuffer();
		geometry.__webglColorBuffer = gl.createBuffer();

		info.memory.geometries ++;

		//

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );

		geometry.__webglParticleCount = nvertices;

		initCustomAttributes( object );

		geometry.verticesNeedUpdate = true;
		geometry.colorsNeedUpdate = true;

	};

	this.initLineBuffers = function ( geometry, object ) {

		if ( geometry.__webglVertexBuffer !== undefined ) return;

		geometry.__webglVertexBuffer = gl.createBuffer();
		geometry.__webglColorBuffer = gl.createBuffer();
		geometry.__webglLineDistanceBuffer = gl.createBuffer();

		info.memory.geometries ++;

		//

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );
		geometry.__lineDistanceArray = new Float32Array( nvertices * 1 );

		geometry.__webglLineCount = nvertices;

		initCustomAttributes( object );

		geometry.verticesNeedUpdate = true;
		geometry.colorsNeedUpdate = true;
		geometry.lineDistancesNeedUpdate = true;

	};

	this.initMeshBuffers = function ( geometryGroup, object ) {

		geometryGroup.__webglVertexBuffer = gl.createBuffer();
		geometryGroup.__webglNormalBuffer = gl.createBuffer();
		geometryGroup.__webglTangentBuffer = gl.createBuffer();
		geometryGroup.__webglColorBuffer = gl.createBuffer();
		geometryGroup.__webglUVBuffer = gl.createBuffer();
		geometryGroup.__webglUV2Buffer = gl.createBuffer();

		geometryGroup.__webglSkinIndicesBuffer = gl.createBuffer();
		geometryGroup.__webglSkinWeightsBuffer = gl.createBuffer();

		geometryGroup.__webglFaceBuffer = gl.createBuffer();
		geometryGroup.__webglLineBuffer = gl.createBuffer();

		var numMorphTargets = geometryGroup.numMorphTargets;

		if ( numMorphTargets ) {

			geometryGroup.__webglMorphTargetsBuffers = [];

			for ( var m = 0, ml = numMorphTargets; m < ml; m ++ ) {

				geometryGroup.__webglMorphTargetsBuffers.push( gl.createBuffer() );

			}

		}

		var numMorphNormals = geometryGroup.numMorphNormals;

		if ( numMorphNormals ) {

			geometryGroup.__webglMorphNormalsBuffers = [];

			for ( var m = 0, ml = numMorphNormals; m < ml; m ++ ) {

				geometryGroup.__webglMorphNormalsBuffers.push( gl.createBuffer() );

			}

		}

		info.memory.geometries ++;

		//

		var geometry = object.geometry,
			faces = geometryGroup.faces,

			nvertices = faces.length * 3,
			ntris     = faces.length * 1,
			nlines    = faces.length * 3,

			material = getBufferMaterial( object, geometryGroup );

		geometryGroup.__vertexArray = new Float32Array( nvertices * 3 );
		geometryGroup.__normalArray = new Float32Array( nvertices * 3 );
		geometryGroup.__colorArray = new Float32Array( nvertices * 3 );
		geometryGroup.__uvArray = new Float32Array( nvertices * 2 );

		if ( geometry.faceVertexUvs.length > 1 ) {

			geometryGroup.__uv2Array = new Float32Array( nvertices * 2 );

		}

		if ( geometry.hasTangents ) {

			geometryGroup.__tangentArray = new Float32Array( nvertices * 4 );

		}

		if ( object.geometry.skinWeights.length && object.geometry.skinIndices.length ) {

			geometryGroup.__skinIndexArray = new Float32Array( nvertices * 4 );
			geometryGroup.__skinWeightArray = new Float32Array( nvertices * 4 );

		}

		var UintArray = extensions.get( 'OES_element_index_uint' ) !== null && ntris > 21845 ? Uint32Array : Uint16Array; // 65535 / 3

		geometryGroup.__typeArray = UintArray;
		geometryGroup.__faceArray = new UintArray( ntris * 3 );
		geometryGroup.__lineArray = new UintArray( nlines * 2 );

		if ( numMorphTargets ) {

			geometryGroup.__morphTargetsArrays = [];

			for ( var m = 0, ml = numMorphTargets; m < ml; m ++ ) {

				geometryGroup.__morphTargetsArrays.push( new Float32Array( nvertices * 3 ) );

			}

		}

		if ( numMorphNormals ) {

			geometryGroup.__morphNormalsArrays = [];

			for ( var m = 0, ml = numMorphNormals; m < ml; m ++ ) {

				geometryGroup.__morphNormalsArrays.push( new Float32Array( nvertices * 3 ) );

			}

		}

		geometryGroup.__webglFaceCount = ntris * 3;
		geometryGroup.__webglLineCount = nlines * 2;


		// custom attributes

		if ( material.attributes ) {

			if ( geometryGroup.__webglCustomAttributesList === undefined ) {

				geometryGroup.__webglCustomAttributesList = [];

			}

			for ( var name in material.attributes ) {

				// Do a shallow copy of the attribute object so different geometryGroup chunks use different
				// attribute buffers which are correctly indexed in the setMeshBuffers function

				var originalAttribute = material.attributes[ name ];

				var attribute = {};

				for ( var property in originalAttribute ) {

					attribute[ property ] = originalAttribute[ property ];

				}

				if ( ! attribute.__webglInitialized || attribute.createUniqueBuffers ) {

					attribute.__webglInitialized = true;

					var size = 1;   // "f" and "i"

					if ( attribute.type === 'v2' ) size = 2;
					else if ( attribute.type === 'v3' ) size = 3;
					else if ( attribute.type === 'v4' ) size = 4;
					else if ( attribute.type === 'c'  ) size = 3;

					attribute.size = size;

					attribute.array = new Float32Array( nvertices * size );

					attribute.buffer = gl.createBuffer();
					attribute.buffer.belongsToAttribute = name;

					originalAttribute.needsUpdate = true;
					attribute.__original = originalAttribute;

				}

				geometryGroup.__webglCustomAttributesList.push( attribute );

			}

		}

		geometryGroup.__inittedArrays = true;

	};

	// Buffer setting

	this.setPointCloudBuffers = function ( geometry, hint, object ) {

		var v, c, vertex, offset, color,

		vertices = geometry.vertices,
		vl = vertices.length,

		colors = geometry.colors,
		cl = colors.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,

		customAttributes = geometry.__webglCustomAttributesList,
		i, il,
		ca, cal, value,
		customAttribute;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v ++ ) {

				vertex = vertices[ v ];

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			gl.bindBuffer( gl.ARRAY_BUFFER, geometry.__webglVertexBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c ++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			gl.bindBuffer( gl.ARRAY_BUFFER, geometry.__webglColorBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, colorArray, hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( customAttribute.needsUpdate && ( customAttribute.boundTo === undefined ||  customAttribute.boundTo === 'vertices' ) ) {

					cal = customAttribute.value.length;

					offset = 0;

					if ( customAttribute.size === 1 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							customAttribute.array[ ca ] = customAttribute.value[ ca ];

						}

					} else if ( customAttribute.size === 2 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ]   = value.x;
							customAttribute.array[ offset + 1 ] = value.y;

							offset += 2;

						}

					} else if ( customAttribute.size === 3 ) {

						if ( customAttribute.type === 'c' ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ]   = value.r;
								customAttribute.array[ offset + 1 ] = value.g;
								customAttribute.array[ offset + 2 ] = value.b;

								offset += 3;

							}

						} else {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ]   = value.x;
								customAttribute.array[ offset + 1 ] = value.y;
								customAttribute.array[ offset + 2 ] = value.z;

								offset += 3;

							}

						}

					} else if ( customAttribute.size === 4 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ]      = value.x;
							customAttribute.array[ offset + 1  ] = value.y;
							customAttribute.array[ offset + 2  ] = value.z;
							customAttribute.array[ offset + 3  ] = value.w;

							offset += 4;

						}

					}

				}

				gl.bindBuffer( gl.ARRAY_BUFFER, customAttribute.buffer );
				gl.bufferData( gl.ARRAY_BUFFER, customAttribute.array, hint );

				customAttribute.needsUpdate = false;

			}

		}

	}

	this.setLineBuffers = function ( geometry, hint ) {

		var v, c, d, vertex, offset, color,

		vertices = geometry.vertices,
		colors = geometry.colors,
		lineDistances = geometry.lineDistances,

		vl = vertices.length,
		cl = colors.length,
		dl = lineDistances.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,
		lineDistanceArray = geometry.__lineDistanceArray,

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,
		dirtyLineDistances = geometry.lineDistancesNeedUpdate,

		customAttributes = geometry.__webglCustomAttributesList,

		i, il,
		ca, cal, value,
		customAttribute;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v ++ ) {

				vertex = vertices[ v ];

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			gl.bindBuffer( gl.ARRAY_BUFFER, geometry.__webglVertexBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c ++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			gl.bindBuffer( gl.ARRAY_BUFFER, geometry.__webglColorBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, colorArray, hint );

		}

		if ( dirtyLineDistances ) {

			for ( d = 0; d < dl; d ++ ) {

				lineDistanceArray[ d ] = lineDistances[ d ];

			}

			gl.bindBuffer( gl.ARRAY_BUFFER, geometry.__webglLineDistanceBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, lineDistanceArray, hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( customAttribute.needsUpdate && ( customAttribute.boundTo === undefined || customAttribute.boundTo === 'vertices' ) ) {

					offset = 0;

					cal = customAttribute.value.length;

					if ( customAttribute.size === 1 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							customAttribute.array[ ca ] = customAttribute.value[ ca ];

						}

					} else if ( customAttribute.size === 2 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ]   = value.x;
							customAttribute.array[ offset + 1 ] = value.y;

							offset += 2;

						}

					} else if ( customAttribute.size === 3 ) {

						if ( customAttribute.type === 'c' ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ]   = value.r;
								customAttribute.array[ offset + 1 ] = value.g;
								customAttribute.array[ offset + 2 ] = value.b;

								offset += 3;

							}

						} else {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ]   = value.x;
								customAttribute.array[ offset + 1 ] = value.y;
								customAttribute.array[ offset + 2 ] = value.z;

								offset += 3;

							}

						}

					} else if ( customAttribute.size === 4 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ]    = value.x;
							customAttribute.array[ offset + 1  ] = value.y;
							customAttribute.array[ offset + 2  ] = value.z;
							customAttribute.array[ offset + 3  ] = value.w;

							offset += 4;

						}

					}

					gl.bindBuffer( gl.ARRAY_BUFFER, customAttribute.buffer );
					gl.bufferData( gl.ARRAY_BUFFER, customAttribute.array, hint );

					customAttribute.needsUpdate = false;

				}

			}

		}

	}

	function materialNeedsFaceNormals ( material ) {

		return material instanceof THREE.MeshPhongMaterial === false && material.shading === THREE.FlatShading;

	}

	this.setMeshBuffers = function ( geometryGroup, object, hint, dispose, material ) {

		if ( ! geometryGroup.__inittedArrays ) {

			return;

		}

		var needsFaceNormals = materialNeedsFaceNormals( material );

		var f, fl, fi, face,
		vertexNormals, faceNormal,
		vertexColors, faceColor,
		vertexTangents,
		uv, uv2, v1, v2, v3, t1, t2, t3, n1, n2, n3,
		c1, c2, c3,
		sw1, sw2, sw3,
		si1, si2, si3,
		i, il,
		vn, uvi, uv2i,
		vk, vkl, vka,
		nka, chf, faceVertexNormals,

		vertexIndex = 0,

		offset = 0,
		offset_uv = 0,
		offset_uv2 = 0,
		offset_face = 0,
		offset_normal = 0,
		offset_tangent = 0,
		offset_line = 0,
		offset_color = 0,
		offset_skin = 0,
		offset_morphTarget = 0,
		offset_custom = 0,

		value,

		vertexArray = geometryGroup.__vertexArray,
		uvArray = geometryGroup.__uvArray,
		uv2Array = geometryGroup.__uv2Array,
		normalArray = geometryGroup.__normalArray,
		tangentArray = geometryGroup.__tangentArray,
		colorArray = geometryGroup.__colorArray,

		skinIndexArray = geometryGroup.__skinIndexArray,
		skinWeightArray = geometryGroup.__skinWeightArray,

		morphTargetsArrays = geometryGroup.__morphTargetsArrays,
		morphNormalsArrays = geometryGroup.__morphNormalsArrays,

		customAttributes = geometryGroup.__webglCustomAttributesList,
		customAttribute,

		faceArray = geometryGroup.__faceArray,
		lineArray = geometryGroup.__lineArray,

		geometry = object.geometry, // this is shared for all chunks

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyElements = geometry.elementsNeedUpdate,
		dirtyUvs = geometry.uvsNeedUpdate,
		dirtyNormals = geometry.normalsNeedUpdate,
		dirtyTangents = geometry.tangentsNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,
		dirtyMorphTargets = geometry.morphTargetsNeedUpdate,

		vertices = geometry.vertices,
		chunk_faces = geometryGroup.faces,
		obj_faces = geometry.faces,

		obj_uvs  = geometry.faceVertexUvs[ 0 ],
		obj_uvs2 = geometry.faceVertexUvs[ 1 ],

		obj_skinIndices = geometry.skinIndices,
		obj_skinWeights = geometry.skinWeights,

		morphTargets = geometry.morphTargets,
		morphNormals = geometry.morphNormals;

		if ( dirtyVertices ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces[ f ] ];

				v1 = vertices[ face.a ];
				v2 = vertices[ face.b ];
				v3 = vertices[ face.c ];

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

			gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyMorphTargets ) {

			for ( vk = 0, vkl = morphTargets.length; vk < vkl; vk ++ ) {

				offset_morphTarget = 0;

				for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

					chf = chunk_faces[ f ];
					face = obj_faces[ chf ];

					// morph positions

					v1 = morphTargets[ vk ].vertices[ face.a ];
					v2 = morphTargets[ vk ].vertices[ face.b ];
					v3 = morphTargets[ vk ].vertices[ face.c ];

					vka = morphTargetsArrays[ vk ];

					vka[ offset_morphTarget ]     = v1.x;
					vka[ offset_morphTarget + 1 ] = v1.y;
					vka[ offset_morphTarget + 2 ] = v1.z;

					vka[ offset_morphTarget + 3 ] = v2.x;
					vka[ offset_morphTarget + 4 ] = v2.y;
					vka[ offset_morphTarget + 5 ] = v2.z;

					vka[ offset_morphTarget + 6 ] = v3.x;
					vka[ offset_morphTarget + 7 ] = v3.y;
					vka[ offset_morphTarget + 8 ] = v3.z;

					// morph normals

					if ( material.morphNormals ) {

						if ( needsFaceNormals ) {

							n1 = morphNormals[ vk ].faceNormals[ chf ];
							n2 = n1;
							n3 = n1;

						} else {

							faceVertexNormals = morphNormals[ vk ].vertexNormals[ chf ];

							n1 = faceVertexNormals.a;
							n2 = faceVertexNormals.b;
							n3 = faceVertexNormals.c;

						}

						nka = morphNormalsArrays[ vk ];

						nka[ offset_morphTarget ]     = n1.x;
						nka[ offset_morphTarget + 1 ] = n1.y;
						nka[ offset_morphTarget + 2 ] = n1.z;

						nka[ offset_morphTarget + 3 ] = n2.x;
						nka[ offset_morphTarget + 4 ] = n2.y;
						nka[ offset_morphTarget + 5 ] = n2.z;

						nka[ offset_morphTarget + 6 ] = n3.x;
						nka[ offset_morphTarget + 7 ] = n3.y;
						nka[ offset_morphTarget + 8 ] = n3.z;

					}

					//

					offset_morphTarget += 9;

				}

				gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ vk ] );
				gl.bufferData( gl.ARRAY_BUFFER, morphTargetsArrays[ vk ], hint );

				if ( material.morphNormals ) {

					gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglMorphNormalsBuffers[ vk ] );
					gl.bufferData( gl.ARRAY_BUFFER, morphNormalsArrays[ vk ], hint );

				}

			}

		}

		if ( obj_skinWeights.length ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces[ f ] ];

				// weights

				sw1 = obj_skinWeights[ face.a ];
				sw2 = obj_skinWeights[ face.b ];
				sw3 = obj_skinWeights[ face.c ];

				skinWeightArray[ offset_skin ]     = sw1.x;
				skinWeightArray[ offset_skin + 1 ] = sw1.y;
				skinWeightArray[ offset_skin + 2 ] = sw1.z;
				skinWeightArray[ offset_skin + 3 ] = sw1.w;

				skinWeightArray[ offset_skin + 4 ] = sw2.x;
				skinWeightArray[ offset_skin + 5 ] = sw2.y;
				skinWeightArray[ offset_skin + 6 ] = sw2.z;
				skinWeightArray[ offset_skin + 7 ] = sw2.w;

				skinWeightArray[ offset_skin + 8 ]  = sw3.x;
				skinWeightArray[ offset_skin + 9 ]  = sw3.y;
				skinWeightArray[ offset_skin + 10 ] = sw3.z;
				skinWeightArray[ offset_skin + 11 ] = sw3.w;

				// indices

				si1 = obj_skinIndices[ face.a ];
				si2 = obj_skinIndices[ face.b ];
				si3 = obj_skinIndices[ face.c ];

				skinIndexArray[ offset_skin ]     = si1.x;
				skinIndexArray[ offset_skin + 1 ] = si1.y;
				skinIndexArray[ offset_skin + 2 ] = si1.z;
				skinIndexArray[ offset_skin + 3 ] = si1.w;

				skinIndexArray[ offset_skin + 4 ] = si2.x;
				skinIndexArray[ offset_skin + 5 ] = si2.y;
				skinIndexArray[ offset_skin + 6 ] = si2.z;
				skinIndexArray[ offset_skin + 7 ] = si2.w;

				skinIndexArray[ offset_skin + 8 ]  = si3.x;
				skinIndexArray[ offset_skin + 9 ]  = si3.y;
				skinIndexArray[ offset_skin + 10 ] = si3.z;
				skinIndexArray[ offset_skin + 11 ] = si3.w;

				offset_skin += 12;

			}

			if ( offset_skin > 0 ) {

				gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglSkinIndicesBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, skinIndexArray, hint );

				gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglSkinWeightsBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, skinWeightArray, hint );

			}

		}

		if ( dirtyColors ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces[ f ] ];

				vertexColors = face.vertexColors;
				faceColor = face.color;

				if ( vertexColors.length === 3 && material.vertexColors === THREE.VertexColors ) {

					c1 = vertexColors[ 0 ];
					c2 = vertexColors[ 1 ];
					c3 = vertexColors[ 2 ];

				} else {

					c1 = faceColor;
					c2 = faceColor;
					c3 = faceColor;

				}

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

			if ( offset_color > 0 ) {

				gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglColorBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, colorArray, hint );

			}

		}

		if ( dirtyTangents && geometry.hasTangents ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces[ f ] ];

				vertexTangents = face.vertexTangents;

				t1 = vertexTangents[ 0 ];
				t2 = vertexTangents[ 1 ];
				t3 = vertexTangents[ 2 ];

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

			gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglTangentBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, tangentArray, hint );

		}

		if ( dirtyNormals ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces[ f ] ];

				vertexNormals = face.vertexNormals;
				faceNormal = face.normal;

				if ( vertexNormals.length === 3 && needsFaceNormals === false ) {

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

			gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglNormalBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, normalArray, hint );

		}

		if ( dirtyUvs && obj_uvs ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				fi = chunk_faces[ f ];

				uv = obj_uvs[ fi ];

				if ( uv === undefined ) continue;

				for ( i = 0; i < 3; i ++ ) {

					uvi = uv[ i ];

					uvArray[ offset_uv ]     = uvi.x;
					uvArray[ offset_uv + 1 ] = uvi.y;

					offset_uv += 2;

				}

			}

			if ( offset_uv > 0 ) {

				gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglUVBuffer );
				gl.bufferData( gl.ARRAY_BUFFER, uvArray, hint );

			}

		}

		if ( dirtyUvs && obj_uvs2 ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				fi = chunk_faces[ f ];

				uv2 = obj_uvs2[ fi ];

				if ( uv2 === undefined ) continue;

				for ( i = 0; i < 3; i ++ ) {

					uv2i = uv2[ i ];

					uv2Array[ offset_uv2 ]     = uv2i.x;
					uv2Array[ offset_uv2 + 1 ] = uv2i.y;

					offset_uv2 += 2;

				}

			}

			if ( offset_uv2 > 0 ) {

				gl.bindBuffer( gl.ARRAY_BUFFER, geometryGroup.__webglUV2Buffer );
				gl.bufferData( gl.ARRAY_BUFFER, uv2Array, hint );

			}

		}

		if ( dirtyElements ) {

			for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

				faceArray[ offset_face ]   = vertexIndex;
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

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
			gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, faceArray, hint );

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
			gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, lineArray, hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( ! customAttribute.__original.needsUpdate ) continue;

				offset_custom = 0;

				if ( customAttribute.size === 1 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === 'vertices' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces[ f ] ];

							customAttribute.array[ offset_custom ]     = customAttribute.value[ face.a ];
							customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ face.b ];
							customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ face.c ];

							offset_custom += 3;

						}

					} else if ( customAttribute.boundTo === 'faces' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces[ f ] ];

							customAttribute.array[ offset_custom ]     = value;
							customAttribute.array[ offset_custom + 1 ] = value;
							customAttribute.array[ offset_custom + 2 ] = value;

							offset_custom += 3;

						}

					}

				} else if ( customAttribute.size === 2 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === 'vertices' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces[ f ] ];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom ]     = v1.x;
							customAttribute.array[ offset_custom + 1 ] = v1.y;

							customAttribute.array[ offset_custom + 2 ] = v2.x;
							customAttribute.array[ offset_custom + 3 ] = v2.y;

							customAttribute.array[ offset_custom + 4 ] = v3.x;
							customAttribute.array[ offset_custom + 5 ] = v3.y;

							offset_custom += 6;

						}

					} else if ( customAttribute.boundTo === 'faces' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom ]     = v1.x;
							customAttribute.array[ offset_custom + 1 ] = v1.y;

							customAttribute.array[ offset_custom + 2 ] = v2.x;
							customAttribute.array[ offset_custom + 3 ] = v2.y;

							customAttribute.array[ offset_custom + 4 ] = v3.x;
							customAttribute.array[ offset_custom + 5 ] = v3.y;

							offset_custom += 6;

						}

					}

				} else if ( customAttribute.size === 3 ) {

					var pp;

					if ( customAttribute.type === 'c' ) {

						pp = [ 'r', 'g', 'b' ];

					} else {

						pp = [ 'x', 'y', 'z' ];

					}

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === 'vertices' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces[ f ] ];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom ]     = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					} else if ( customAttribute.boundTo === 'faces' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom ]     = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					} else if ( customAttribute.boundTo === 'faceVertices' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces[ f ] ];

							v1 = value[ 0 ];
							v2 = value[ 1 ];
							v3 = value[ 2 ];

							customAttribute.array[ offset_custom ]     = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					}

				} else if ( customAttribute.size === 4 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === 'vertices' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces[ f ] ];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom  ]   = v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					} else if ( customAttribute.boundTo === 'faces' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom  ]   = v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					} else if ( customAttribute.boundTo === 'faceVertices' ) {

						for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces[ f ] ];

							v1 = value[ 0 ];
							v2 = value[ 1 ];
							v3 = value[ 2 ];

							customAttribute.array[ offset_custom  ]   = v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					}

				}

				gl.bindBuffer( gl.ARRAY_BUFFER, customAttribute.buffer );
				gl.bufferData( gl.ARRAY_BUFFER, customAttribute.array, hint );

			}

		}

		if ( dispose ) {

			delete geometryGroup.__inittedArrays;
			delete geometryGroup.__colorArray;
			delete geometryGroup.__normalArray;
			delete geometryGroup.__tangentArray;
			delete geometryGroup.__uvArray;
			delete geometryGroup.__uv2Array;
			delete geometryGroup.__faceArray;
			delete geometryGroup.__vertexArray;
			delete geometryGroup.__lineArray;
			delete geometryGroup.__skinIndexArray;
			delete geometryGroup.__skinWeightArray;

		}

	};

	this.delete = function ( geometry ) {

		var buffers = [
			'__webglVertexBuffer',
			'__webglNormalBuffer',
			'__webglTangentBuffer',
			'__webglColorBuffer',
			'__webglUVBuffer',
			'__webglUV2Buffer',

			'__webglSkinIndicesBuffer',
			'__webglSkinWeightsBuffer',

			'__webglFaceBuffer',
			'__webglLineBuffer',

			'__webglLineDistanceBuffer'
		];

		for ( var i = 0, l = buffers.length; i < l; i ++ ) {

			var name = buffers[ i ];

			if ( geometry[ name ] !== undefined ) {

				gl.deleteBuffer( geometry[ name ] );

				delete geometry[ name ];

			}

		}

		// custom attributes

		if ( geometry.__webglCustomAttributesList !== undefined ) {

			for ( var name in geometry.__webglCustomAttributesList ) {

				gl.deleteBuffer( geometry.__webglCustomAttributesList[ name ].buffer );

			}

			delete geometry.__webglCustomAttributesList;

		}

		info.memory.geometries --;

	};

};
