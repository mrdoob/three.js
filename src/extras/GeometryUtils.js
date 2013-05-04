/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GeometryUtils = {

	// Merge two geometries or geometry and geometry from object (using object's transform)

	merge: function ( geometry1, object2 /* mesh | geometry */, materialIndexOffset, useWorldSpace ) {

		var matrix, normalMatrix,
		vertexOffset = geometry1.vertices.length,
		geometry2 = object2 instanceof THREE.Mesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.faceVertexUvs[ 0 ],
		uvs2 = geometry2.faceVertexUvs[ 0 ];

		if ( materialIndexOffset === undefined ) materialIndexOffset = 0;

		if ( object2 instanceof THREE.Mesh ) {
			
			if ( useWorldSpace ) {

				object2.updateMatrixWorld();

				matrix = object2.matrixWorld;
				
			}
			else {

				object2.matrixAutoUpdate && object2.updateMatrix();

				matrix = object2.matrix;
				
			}

			normalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );

		}

		// vertices

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {

			var vertex = vertices2[ i ];

			var vertexCopy = vertex.clone();

			if ( matrix ) vertexCopy.applyMatrix4( matrix );

			vertices1.push( vertexCopy );

		}

		// faces

		for ( i = 0, il = faces2.length; i < il; i ++ ) {

			var face = faces2[ i ], faceCopy, normal, color,
			faceVertexNormals = face.vertexNormals,
			faceVertexColors = face.vertexColors;

			if ( face instanceof THREE.Face3 ) {

				faceCopy = new THREE.Face3( face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset );

			} else if ( face instanceof THREE.Face4 ) {

				faceCopy = new THREE.Face4( face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset );

			}

			faceCopy.normal.copy( face.normal );

			if ( normalMatrix ) {

				faceCopy.normal.applyMatrix3( normalMatrix ).normalize();

			}

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ].clone();

				if ( normalMatrix ) {

					normal.applyMatrix3( normalMatrix ).normalize();

				}

				faceCopy.vertexNormals.push( normal );

			}

			faceCopy.color.copy( face.color );

			for ( var j = 0, jl = faceVertexColors.length; j < jl; j ++ ) {

				color = faceVertexColors[ j ];
				faceCopy.vertexColors.push( color.clone() );

			}

			faceCopy.materialIndex = face.materialIndex + materialIndexOffset;

			faceCopy.centroid.copy( face.centroid );

			if ( matrix ) {

				faceCopy.centroid.applyMatrix4( matrix );

			}

			faces1.push( faceCopy );

		}

		// uvs

		for ( i = 0, il = uvs2.length; i < il; i ++ ) {

			var uv = uvs2[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.Vector2( uv[ j ].x, uv[ j ].y ) );

			}

			uvs1.push( uvCopy );

		}

	},

	removeMaterials: function ( geometry, materialIndexArray ) {

		var materialIndexMap = {};

		for ( var i = 0, il = materialIndexArray.length; i < il; i ++ ) {

			materialIndexMap[ materialIndexArray[i] ] = true;

		}

		var face, newFaces = [];

		for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {

			face = geometry.faces[ i ];
			if ( ! ( face.materialIndex in materialIndexMap ) ) newFaces.push( face );

		}

		geometry.faces = newFaces;

	},

	// Get random point in triangle (via barycentric coordinates)
	// 	(uniform distribution)
	// 	http://www.cgafaq.info/wiki/Random_Point_In_Triangle

	randomPointInTriangle: function ( vectorA, vectorB, vectorC ) {

		var a, b, c,
			point = new THREE.Vector3(),
			tmp = THREE.GeometryUtils.__v1;

		a = THREE.GeometryUtils.random();
		b = THREE.GeometryUtils.random();

		if ( ( a + b ) > 1 ) {

			a = 1 - a;
			b = 1 - b;

		}

		c = 1 - a - b;

		point.copy( vectorA );
		point.multiplyScalar( a );

		tmp.copy( vectorB );
		tmp.multiplyScalar( b );

		point.add( tmp );

		tmp.copy( vectorC );
		tmp.multiplyScalar( c );

		point.add( tmp );

		return point;

	},

	// Get random point in face (triangle / quad)
	// (uniform distribution)

	randomPointInFace: function ( face, geometry, useCachedAreas ) {

		var vA, vB, vC, vD;

		if ( face instanceof THREE.Face3 ) {

			vA = geometry.vertices[ face.a ];
			vB = geometry.vertices[ face.b ];
			vC = geometry.vertices[ face.c ];

			return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vC );

		} else if ( face instanceof THREE.Face4 ) {

			vA = geometry.vertices[ face.a ];
			vB = geometry.vertices[ face.b ];
			vC = geometry.vertices[ face.c ];
			vD = geometry.vertices[ face.d ];

			var area1, area2;

			if ( useCachedAreas ) {

				if ( face._area1 && face._area2 ) {

					area1 = face._area1;
					area2 = face._area2;

				} else {

					area1 = THREE.GeometryUtils.triangleArea( vA, vB, vD );
					area2 = THREE.GeometryUtils.triangleArea( vB, vC, vD );

					face._area1 = area1;
					face._area2 = area2;

				}

			} else {

				area1 = THREE.GeometryUtils.triangleArea( vA, vB, vD ),
				area2 = THREE.GeometryUtils.triangleArea( vB, vC, vD );

			}

			var r = THREE.GeometryUtils.random() * ( area1 + area2 );

			if ( r < area1 ) {

				return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vD );

			} else {

				return THREE.GeometryUtils.randomPointInTriangle( vB, vC, vD );

			}

		}

	},

	// Get uniformly distributed random points in mesh
	// 	- create array with cumulative sums of face areas
	//  - pick random number from 0 to total area
	//  - find corresponding place in area array by binary search
	//	- get random point in face

	randomPointsInGeometry: function ( geometry, n ) {

		var face, i,
			faces = geometry.faces,
			vertices = geometry.vertices,
			il = faces.length,
			totalArea = 0,
			cumulativeAreas = [],
			vA, vB, vC, vD;

		// precompute face areas

		for ( i = 0; i < il; i ++ ) {

			face = faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				vA = vertices[ face.a ];
				vB = vertices[ face.b ];
				vC = vertices[ face.c ];

				face._area = THREE.GeometryUtils.triangleArea( vA, vB, vC );

			} else if ( face instanceof THREE.Face4 ) {

				vA = vertices[ face.a ];
				vB = vertices[ face.b ];
				vC = vertices[ face.c ];
				vD = vertices[ face.d ];

				face._area1 = THREE.GeometryUtils.triangleArea( vA, vB, vD );
				face._area2 = THREE.GeometryUtils.triangleArea( vB, vC, vD );

				face._area = face._area1 + face._area2;

			}

			totalArea += face._area;

			cumulativeAreas[ i ] = totalArea;

		}

		// binary search cumulative areas array

		function binarySearchIndices( value ) {

			function binarySearch( start, end ) {

				// return closest larger index
				// if exact number is not found

				if ( end < start )
					return start;

				var mid = start + Math.floor( ( end - start ) / 2 );

				if ( cumulativeAreas[ mid ] > value ) {

					return binarySearch( start, mid - 1 );

				} else if ( cumulativeAreas[ mid ] < value ) {

					return binarySearch( mid + 1, end );

				} else {

					return mid;

				}

			}

			var result = binarySearch( 0, cumulativeAreas.length - 1 )
			return result;

		}

		// pick random face weighted by face area

		var r, index,
			result = [];

		var stats = {};

		for ( i = 0; i < n; i ++ ) {

			r = THREE.GeometryUtils.random() * totalArea;

			index = binarySearchIndices( r );

			result[ i ] = THREE.GeometryUtils.randomPointInFace( faces[ index ], geometry, true );

			if ( ! stats[ index ] ) {

				stats[ index ] = 1;

			} else {

				stats[ index ] += 1;

			}

		}

		return result;

	},

	// Get triangle area (half of parallelogram)
	//	http://mathworld.wolfram.com/TriangleArea.html

	triangleArea: function ( vectorA, vectorB, vectorC ) {

		var tmp1 = THREE.GeometryUtils.__v1,
			tmp2 = THREE.GeometryUtils.__v2;

		tmp1.subVectors( vectorB, vectorA );
		tmp2.subVectors( vectorC, vectorA );
		tmp1.cross( tmp2 );

		return 0.5 * tmp1.length();

	},

	// Center geometry so that 0,0,0 is in center of bounding box

	center: function ( geometry ) {

		geometry.computeBoundingBox();

		var bb = geometry.boundingBox;

		var offset = new THREE.Vector3();

		offset.addVectors( bb.min, bb.max );
		offset.multiplyScalar( -0.5 );

		geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z ) );
		geometry.computeBoundingBox();

		return offset;

	},

	// Normalize UVs to be from <0,1>
	// (for now just the first set of UVs)

	normalizeUVs: function ( geometry ) {

		var uvSet = geometry.faceVertexUvs[ 0 ];

		for ( var i = 0, il = uvSet.length; i < il; i ++ ) {

			var uvs = uvSet[ i ];

			for ( var j = 0, jl = uvs.length; j < jl; j ++ ) {

				// texture repeat

				if( uvs[ j ].x !== 1.0 ) uvs[ j ].x = uvs[ j ].x - Math.floor( uvs[ j ].x );
				if( uvs[ j ].y !== 1.0 ) uvs[ j ].y = uvs[ j ].y - Math.floor( uvs[ j ].y );

			}

		}

	},

	triangulateQuads: function ( geometry ) {

		var i, il, j, jl;

		var faces = [];
		var faceUvs = [];
		var faceVertexUvs = [];

		for ( i = 0, il = geometry.faceUvs.length; i < il; i ++ ) {

			faceUvs[ i ] = [];

		}

		for ( i = 0, il = geometry.faceVertexUvs.length; i < il; i ++ ) {

			faceVertexUvs[ i ] = [];

		}

		for ( i = 0, il = geometry.faces.length; i < il; i ++ ) {

			var face = geometry.faces[ i ];

			if ( face instanceof THREE.Face4 ) {

				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var triA = new THREE.Face3();
				var triB = new THREE.Face3();

				triA.color.copy( face.color );
				triB.color.copy( face.color );
				
				triA.normal.copy( face.normal );
				triB.normal.copy( face.normal );

				triA.materialIndex = face.materialIndex;
				triB.materialIndex = face.materialIndex;

				triA.a = a;
				triA.b = b;
				triA.c = d;

				triB.a = b;
				triB.b = c;
				triB.c = d;

				if ( face.vertexColors.length === 4 ) {

					triA.vertexColors[ 0 ] = face.vertexColors[ 0 ].clone();
					triA.vertexColors[ 1 ] = face.vertexColors[ 1 ].clone();
					triA.vertexColors[ 2 ] = face.vertexColors[ 3 ].clone();

					triB.vertexColors[ 0 ] = face.vertexColors[ 1 ].clone();
					triB.vertexColors[ 1 ] = face.vertexColors[ 2 ].clone();
					triB.vertexColors[ 2 ] = face.vertexColors[ 3 ].clone();

				}
				
				if ( face.vertexNormals.length === 4 ) {
					
					triA.vertexNormals[ 0 ] = face.vertexNormals[ 0 ].clone();
					triA.vertexNormals[ 1 ] = face.vertexNormals[ 1 ].clone();
					triA.vertexNormals[ 2 ] = face.vertexNormals[ 3 ].clone();

					triB.vertexNormals[ 0 ] = face.vertexNormals[ 1 ].clone();
					triB.vertexNormals[ 1 ] = face.vertexNormals[ 2 ].clone();
					triB.vertexNormals[ 2 ] = face.vertexNormals[ 3 ].clone();
					
				}

				faces.push( triA, triB );

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					if ( geometry.faceVertexUvs[ j ].length ) {

						var uvs = geometry.faceVertexUvs[ j ][ i ];

						var uvA = uvs[ 0 ];
						var uvB = uvs[ 1 ];
						var uvC = uvs[ 2 ];
						var uvD = uvs[ 3 ];

						var uvsTriA = [ uvA.clone(), uvB.clone(), uvD.clone() ];
						var uvsTriB = [ uvB.clone(), uvC.clone(), uvD.clone() ];

						faceVertexUvs[ j ].push( uvsTriA, uvsTriB );

					}

				}

				for ( j = 0, jl = geometry.faceUvs.length; j < jl; j ++ ) {

					if ( geometry.faceUvs[ j ].length ) {

						var faceUv = geometry.faceUvs[ j ][ i ];

						faceUvs[ j ].push( faceUv, faceUv );

					}

				}

			} else {

				faces.push( face );

				for ( j = 0, jl = geometry.faceUvs.length; j < jl; j ++ ) {

					faceUvs[ j ].push( geometry.faceUvs[ j ][ i ] );

				}

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

				}

			}

		}

		geometry.faces = faces;
		geometry.faceUvs = faceUvs;
		geometry.faceVertexUvs = faceVertexUvs;

		geometry.computeCentroids();

		if ( geometry.hasTangents ) geometry.computeTangents();

	},

	setMaterialIndex: function ( geometry, index, startFace, endFace ){

		var faces = geometry.faces;
		var start = startFace || 0;
		var end = endFace || faces.length - 1;

		for ( var i = start; i <= end; i ++ ) {

			faces[i].materialIndex = index;

		}

    },
	
	/** Automagically convert a geometry into an array of BufferGeometries, split per face's materialIndex. */
	makeBufferGeometries: function ( geometryIn ) {

		var useNormals = null,
			useFaceNormals = null,
			useUvs = null,
			useColors = null, 
			useFaceColors = null;

		THREE.GeometryUtils.triangulateQuads( geometryIn );

		var verticesIn = geometryIn.vertices,
			facesIn = geometryIn.faces;

		var verticesOut, normalsOut, uvsOut, vertexColorsOut;

		if ( useUvs === null ) {

			//Detect if any UV coordinates specified
			useUvs = geometryIn.faceVertexUvs.length > 0 && geometryIn.faceVertexUvs[ 0 ].length > 0;

		}

		geometryIn.makeGroups( true );

		var bufferGeometriesOut = [ ];

		for ( var i = 0, l = geometryIn.geometryGroupsList.length ; i < l ; i++ ) {

			var geometryGroup = geometryIn.geometryGroupsList[ i ];

			var groupFaceIndices = geometryGroup.faces3;

			var numFaces = groupFaceIndices.length,
				numVertices = numFaces * 3;

			useNormals = null;

			if ( useNormals === null ) {

				//Detect any normals in use
				for ( var f = 0; f < numFaces ; f++ ) {

					var faceIndex = groupFaceIndices[ f ];
					var face = facesIn[ faceIndex ];

					if ( face.vertexNormals && face.vertexNormals.length > 0 ) {

						useNormals = true;
						useFaceNormals = false;
						break;

					}

					if ( face.normal.x !== 0 || face.normal.y !== 0 || face.normal.z !== 0 ) {

						useNormals = true;
						break;

					}

				}

			}

			if ( useNormals && useFaceNormals === null ) {

				//Assume using face normals
				useFaceNormals = true;

				//Look for vertex normals to prove we're not using face normals
				for ( var f = 0; f < numFaces ; f++ ) {

					var faceIndex = groupFaceIndices[ f ];
					var face = facesIn[ faceIndex ];

					if ( face.vertexNormals && face.vertexNormals.length > 0 ) {

						useFaceNormals = false;
						break;

					}

				}

			}


			if ( useColors === null ) {

				//Detect any colors in use
				for ( var f = 0; f < numFaces ; f++ ) {

					var faceIndex = groupFaceIndices[ f ];
					var face = facesIn[ faceIndex ];

					if ( face.vertexColors.length > 0 ) {

						useColors = true;
						useFaceColors = false;
						break;

					}

					if ( face.color.r !== 0 || face.color.g !== 0 || face.color.b !== 0 ) {

						useColors = true;
						break;

					}

				}

			}

			if ( useColors && useFaceColors === null ) {

				//Assume using face colors
				useFaceColors = true;

				//Look for vertex colors to prove we're not using face colors
				for ( var f = 0; f < numFaces ; f++ ) {

					var faceIndex = groupFaceIndices[ f ];
					var face = facesIn[ faceIndex ];

					if ( face.vertexColors.length > 0 ) {

						useFaceColors = false;
						break;

					}

				}

			}

			var bufferGeometryOut = new THREE.BufferGeometry();

			verticesOut = new Float32Array( numVertices * 3 );

			var uvsIn = geometryIn.faceVertexUvs[ 0 ];

			bufferGeometryOut.attributes.position = {
				itemSize: 3,
				array: verticesOut,
				numItems: verticesOut.length
			};

			if ( useNormals ) {

				normalsOut = new Float32Array( numVertices * 3 );

				bufferGeometryOut.attributes.normal = {
					itemSize: 3,
					array: normalsOut,
					numItems: normalsOut.length
				};

			}

			if ( useUvs ) {

				uvsOut = new Float32Array( numVertices * 2 );

				bufferGeometryOut.attributes.uv = {
					itemSize: 2,
					array: uvsOut,
					numItems: uvsOut.length
				};

			}

			if ( useColors ) {

				vertexColorsOut = new Float32Array( numVertices * 3 );

				bufferGeometryOut.attributes.color = {
					itemSize: 3,
					array: vertexColorsOut,
					numItems: vertexColorsOut.length
				};

			}

	//		console.log("Making geometry group with " + numFaces + " faces");

			for ( var f = 0, vi = 0, uvi = 0, ni = 0, ci = 0; f < numFaces; f++ ) {

				var faceIndex = groupFaceIndices[ f ];
				var face = facesIn[ faceIndex ];

				var va = verticesIn[ face.a ];
				var vb = verticesIn[ face.b ];
				var vc = verticesIn[ face.c ];

				verticesOut[ vi++ ] = va.x;
				verticesOut[ vi++ ] = va.y;
				verticesOut[ vi++ ] = va.z;
				verticesOut[ vi++ ] = vb.x;
				verticesOut[ vi++ ] = vb.y;
				verticesOut[ vi++ ] = vb.z;
				verticesOut[ vi++ ] = vc.x;
				verticesOut[ vi++ ] = vc.y;
				verticesOut[ vi++ ] = vc.z;

				if ( useNormals ) {

					var na,nb,nc;

					if ( useFaceNormals ) {

						na = nb = nc = face.normal;

					}
					else {

						na = face.vertexNormals[ 0 ];
						nb = face.vertexNormals[ 1 ];
						nc = face.vertexNormals[ 2 ];

					}

					normalsOut[ ni++ ] = na.x;
					normalsOut[ ni++ ] = na.y;
					normalsOut[ ni++ ] = na.z;
					normalsOut[ ni++ ] = nb.x;
					normalsOut[ ni++ ] = nb.y;
					normalsOut[ ni++ ] = nb.z;
					normalsOut[ ni++ ] = nc.x;
					normalsOut[ ni++ ] = nc.y;
					normalsOut[ ni++ ] = nc.z;

				}

				if ( useColors ) {

					var ca, cb, cc;

					if ( useFaceColors ) {

						ca = cb = cc = face.color;

					}
					else {

						ca = face.vertexColors[ 0 ];
						cb = face.vertexColors[ 1 ];
						cc = face.vertexColors[ 2 ];

					}

					vertexColorsOut[ ci++ ] = ca.r;
					vertexColorsOut[ ci++ ] = ca.g;
					vertexColorsOut[ ci++ ] = ca.b;
					vertexColorsOut[ ci++ ] = cb.r;
					vertexColorsOut[ ci++ ] = cb.g;
					vertexColorsOut[ ci++ ] = cb.b;
					vertexColorsOut[ ci++ ] = cc.r;
					vertexColorsOut[ ci++ ] = cc.g;
					vertexColorsOut[ ci++ ] = cc.b;

				}

				if ( useUvs ) {

					var faceVertexUvs = uvsIn[ faceIndex ];

					var uva = faceVertexUvs[ 0 ];
					var uvb = faceVertexUvs[ 1 ];
					var uvc = faceVertexUvs[ 2 ];

					uvsOut[ uvi++ ] = uva.x;
					uvsOut[ uvi++ ] = uva.y;
					uvsOut[ uvi++ ] = uvb.x;
					uvsOut[ uvi++ ] = uvb.y;
					uvsOut[ uvi++ ] = uvc.x;
					uvsOut[ uvi++ ] = uvc.y;

				}

			}

			bufferGeometryOut.verticesNeedUpdate = true;

			if ( useUvs ) {

				bufferGeometryOut.uvsNeedUpdate = true;

			}

			if ( useNormals ) {

				bufferGeometryOut.normalsNeedUpdate = true;

			}

			if ( useColors ) {

				bufferGeometryOut.colorsNeedUpdate = true;

			}

			bufferGeometriesOut.push( bufferGeometryOut );
		}

		return bufferGeometriesOut;
	}

};

THREE.GeometryUtils.random = THREE.Math.random16;

THREE.GeometryUtils.__v1 = new THREE.Vector3();
THREE.GeometryUtils.__v2 = new THREE.Vector3();
