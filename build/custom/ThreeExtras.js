<<<<<<< HEAD
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ColorUtils = {

	adjustHSV : function ( color, h, s, v ) {

		var hsv = THREE.ColorUtils.__hsv;

		THREE.ColorUtils.rgbToHsv( color, hsv );

		hsv.h = THREE.Math.clamp( hsv.h + h, 0, 1 );
		hsv.s = THREE.Math.clamp( hsv.s + s, 0, 1 );
		hsv.v = THREE.Math.clamp( hsv.v + v, 0, 1 );

		color.setHSV( hsv.h, hsv.s, hsv.v );

	},

	// based on MochiKit implementation by Bob Ippolito

	rgbToHsv : function ( color, hsv ) {

		var r = color.r;
		var g = color.g;
		var b = color.b;

		var max = Math.max( Math.max( r, g ), b );
		var min = Math.min( Math.min( r, g ), b );

		var hue;
		var saturation;
		var value = max;

		if ( min === max )	{

			hue = 0;
			saturation = 0;

		} else {

			var delta = ( max - min );
			saturation = delta / max;

			if ( r === max ) {

				hue = ( g - b ) / delta;

			} else if ( g === max ) {

				hue = 2 + ( ( b - r ) / delta );

			} else	{

				hue = 4 + ( ( r - g ) / delta );
			}

			hue /= 6;

			if ( hue < 0 ) {

				hue += 1;

			}

			if ( hue > 1 ) {

				hue -= 1;

			}

		}

		if ( hsv === undefined ) {

			hsv = { h: 0, s: 0, v: 0 };

		}

		hsv.h = hue;
		hsv.s = saturation;
		hsv.v = value;

		return hsv;

	}

};

THREE.ColorUtils.__hsv = { h: 0, s: 0, v: 0 };/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GeometryUtils = {

	// Merge two geometries or geometry and geometry from object (using object's transform)

	merge: function ( geometry1, object2 /* mesh | geometry */ ) {

		var matrix, matrixRotation,
		vertexOffset = geometry1.vertices.length,
		uvPosition = geometry1.faceVertexUvs[ 0 ].length,
		geometry2 = object2 instanceof THREE.Mesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.faceVertexUvs[ 0 ],
		uvs2 = geometry2.faceVertexUvs[ 0 ];

		var geo1MaterialsMap = {};

		for ( var i = 0; i < geometry1.materials.length; i ++ ) {

			var id = geometry1.materials[ i ].id;

			geo1MaterialsMap[ id ] = i;

		}

		if ( object2 instanceof THREE.Mesh ) {

			object2.matrixAutoUpdate && object2.updateMatrix();

			matrix = object2.matrix;
			matrixRotation = new THREE.Matrix4();
			matrixRotation.extractRotation( matrix, object2.scale );

		}

		// vertices

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {

			var vertex = vertices2[ i ];

			var vertexCopy = vertex.clone();

			if ( matrix ) matrix.multiplyVector3( vertexCopy );

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

			if ( matrixRotation ) matrixRotation.multiplyVector3( faceCopy.normal );

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ].clone();

				if ( matrixRotation ) matrixRotation.multiplyVector3( normal );

				faceCopy.vertexNormals.push( normal );

			}

			faceCopy.color.copy( face.color );

			for ( var j = 0, jl = faceVertexColors.length; j < jl; j ++ ) {

				color = faceVertexColors[ j ];
				faceCopy.vertexColors.push( color.clone() );

			}

			if ( face.materialIndex !== undefined ) {

				var material2 = geometry2.materials[ face.materialIndex ];
				var materialId2 = material2.id;

				var materialIndex = geo1MaterialsMap[ materialId2 ];

				if ( materialIndex === undefined ) {

					materialIndex = geometry1.materials.length;
					geo1MaterialsMap[ materialId2 ] = materialIndex;

					geometry1.materials.push( material2 );

				}

				faceCopy.materialIndex = materialIndex;

			}

			faceCopy.centroid.copy( face.centroid );
			if ( matrix ) matrix.multiplyVector3( faceCopy.centroid );

			faces1.push( faceCopy );

		}

		// uvs

		for ( i = 0, il = uvs2.length; i < il; i ++ ) {

			var uv = uvs2[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			uvs1.push( uvCopy );

		}

	},

	clone: function ( geometry ) {

		var cloneGeo = new THREE.Geometry();

		var i, il;

		var vertices = geometry.vertices,
			faces = geometry.faces,
			uvs = geometry.faceVertexUvs[ 0 ];

		// materials

		if ( geometry.materials ) {

			cloneGeo.materials = geometry.materials.slice();

		}

		// vertices

		for ( i = 0, il = vertices.length; i < il; i ++ ) {

			var vertex = vertices[ i ];

			cloneGeo.vertices.push( vertex.clone() );

		}

		// faces

		for ( i = 0, il = faces.length; i < il; i ++ ) {

			var face = faces[ i ];

			cloneGeo.faces.push( face.clone() );

		}

		// uvs

		for ( i = 0, il = uvs.length; i < il; i ++ ) {

			var uv = uvs[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			cloneGeo.faceVertexUvs[ 0 ].push( uvCopy );

		}

		return cloneGeo;

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

		point.addSelf( tmp );

		tmp.copy( vectorC );
		tmp.multiplyScalar( c );

		point.addSelf( tmp );

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

	// Get triangle area (by Heron's formula)
	// 	http://en.wikipedia.org/wiki/Heron%27s_formula

	triangleArea: function ( vectorA, vectorB, vectorC ) {

		var s, a, b, c,
			tmp = THREE.GeometryUtils.__v1;

		tmp.sub( vectorA, vectorB );
		a = tmp.length();

		tmp.sub( vectorA, vectorC );
		b = tmp.length();

		tmp.sub( vectorB, vectorC );
		c = tmp.length();

		s = 0.5 * ( a + b + c );

		return Math.sqrt( s * ( s - a ) * ( s - b ) * ( s - c ) );

	},

	// Center geometry so that 0,0,0 is in center of bounding box

	center: function ( geometry ) {

		geometry.computeBoundingBox();

		var bb = geometry.boundingBox;

		var offset = new THREE.Vector3();

		offset.add( bb.min, bb.max );
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

				if( uvs[ j ].u !== 1.0 ) uvs[ j ].u = uvs[ j ].u - Math.floor( uvs[ j ].u );
				if( uvs[ j ].v !== 1.0 ) uvs[ j ].v = uvs[ j ].v - Math.floor( uvs[ j ].v );

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

					faceUvs[ j ].push( geometry.faceUvs[ j ] );

				}

				for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

					faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ] );

				}

			}

		}

		geometry.faces = faces;
		geometry.faceUvs = faceUvs;
		geometry.faceVertexUvs = faceVertexUvs;

		geometry.computeCentroids();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		if ( geometry.hasTangents ) geometry.computeTangents();

	},

	// Make all faces use unique vertices
	// so that each face can be separated from others

	explode: function( geometry ) {

		var vertices = [];

		for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {

			var n = vertices.length;

			var face = geometry.faces[ i ];

			if ( face instanceof THREE.Face4 ) {

				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var va = geometry.vertices[ a ];
				var vb = geometry.vertices[ b ];
				var vc = geometry.vertices[ c ];
				var vd = geometry.vertices[ d ];

				vertices.push( va.clone() );
				vertices.push( vb.clone() );
				vertices.push( vc.clone() );
				vertices.push( vd.clone() );

				face.a = n;
				face.b = n + 1;
				face.c = n + 2;
				face.d = n + 3;

			} else {

				var a = face.a;
				var b = face.b;
				var c = face.c;

				var va = geometry.vertices[ a ];
				var vb = geometry.vertices[ b ];
				var vc = geometry.vertices[ c ];

				vertices.push( va.clone() );
				vertices.push( vb.clone() );
				vertices.push( vc.clone() );

				face.a = n;
				face.b = n + 1;
				face.c = n + 2;

			}

		}

		geometry.vertices = vertices;
		delete geometry.__tmpVertices;

	},

	// Break faces with edges longer than maxEdgeLength
	// - not recursive

	tessellate: function ( geometry, maxEdgeLength ) {

		var i, il, face,
		a, b, c, d,
		va, vb, vc, vd,
		dab, dbc, dac, dcd, dad,
		m, m1, m2,
		vm, vm1, vm2,
		vnm, vnm1, vnm2,
		vcm, vcm1, vcm2,
		triA, triB,
		quadA, quadB,
		edge;

		var faces = [];
		var faceVertexUvs = [];

		for ( i = 0, il = geometry.faceVertexUvs.length; i < il; i ++ ) {

			faceVertexUvs[ i ] = [];

		}

		for ( i = 0, il = geometry.faces.length; i < il; i ++ ) {

			face = geometry.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				a = face.a;
				b = face.b;
				c = face.c;

				va = geometry.vertices[ a ];
				vb = geometry.vertices[ b ];
				vc = geometry.vertices[ c ];

				dab = va.distanceTo( vb );
				dbc = vb.distanceTo( vc );
				dac = va.distanceTo( vc );

				if ( dab > maxEdgeLength || dbc > maxEdgeLength || dac > maxEdgeLength ) {

					m = geometry.vertices.length;

					triA = face.clone();
					triB = face.clone();

					if ( dab >= dbc && dab >= dac ) {

						vm = va.clone();
						vm.lerpSelf( vb, 0.5 );

						triA.a = a;
						triA.b = m;
						triA.c = c;

						triB.a = m;
						triB.b = b;
						triB.c = c;

						if ( face.vertexNormals.length === 3 ) {

							vnm = face.vertexNormals[ 0 ].clone();
							vnm.lerpSelf( face.vertexNormals[ 1 ], 0.5 );

							triA.vertexNormals[ 1 ].copy( vnm );
							triB.vertexNormals[ 0 ].copy( vnm );

						}

						if ( face.vertexColors.length === 3 ) {

							vcm = face.vertexColors[ 0 ].clone();
							vcm.lerpSelf( face.vertexColors[ 1 ], 0.5 );

							triA.vertexColors[ 1 ].copy( vcm );
							triB.vertexColors[ 0 ].copy( vcm );

						}

						edge = 0;

					} else if ( dbc >= dab && dbc >= dac ) {

						vm = vb.clone();
						vm.lerpSelf( vc, 0.5 );

						triA.a = a;
						triA.b = b;
						triA.c = m;

						triB.a = m;
						triB.b = c;
						triB.c = a;

						if ( face.vertexNormals.length === 3 ) {

							vnm = face.vertexNormals[ 1 ].clone();
							vnm.lerpSelf( face.vertexNormals[ 2 ], 0.5 );

							triA.vertexNormals[ 2 ].copy( vnm );

							triB.vertexNormals[ 0 ].copy( vnm );
							triB.vertexNormals[ 1 ].copy( face.vertexNormals[ 2 ] );
							triB.vertexNormals[ 2 ].copy( face.vertexNormals[ 0 ] );

						}

						if ( face.vertexColors.length === 3 ) {

							vcm = face.vertexColors[ 1 ].clone();
							vcm.lerpSelf( face.vertexColors[ 2 ], 0.5 );

							triA.vertexColors[ 2 ].copy( vcm );

							triB.vertexColors[ 0 ].copy( vcm );
							triB.vertexColors[ 1 ].copy( face.vertexColors[ 2 ] );
							triB.vertexColors[ 2 ].copy( face.vertexColors[ 0 ] );

						}

						edge = 1;

					} else {

						vm = va.clone();
						vm.lerpSelf( vc, 0.5 );

						triA.a = a;
						triA.b = b;
						triA.c = m;

						triB.a = m;
						triB.b = b;
						triB.c = c;

						if ( face.vertexNormals.length === 3 ) {

							vnm = face.vertexNormals[ 0 ].clone();
							vnm.lerpSelf( face.vertexNormals[ 2 ], 0.5 );

							triA.vertexNormals[ 2 ].copy( vnm );
							triB.vertexNormals[ 0 ].copy( vnm );

						}

						if ( face.vertexColors.length === 3 ) {

							vcm = face.vertexColors[ 0 ].clone();
							vcm.lerpSelf( face.vertexColors[ 2 ], 0.5 );

							triA.vertexColors[ 2 ].copy( vcm );
							triB.vertexColors[ 0 ].copy( vcm );

						}

						edge = 2;

					}

					faces.push( triA, triB );
					geometry.vertices.push( vm );

					var j, jl, uvs, uvA, uvB, uvC, uvM, uvsTriA, uvsTriB;

					for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

						if ( geometry.faceVertexUvs[ j ].length ) {

							uvs = geometry.faceVertexUvs[ j ][ i ];

							uvA = uvs[ 0 ];
							uvB = uvs[ 1 ];
							uvC = uvs[ 2 ];

							// AB

							if ( edge === 0 ) {

								uvM = uvA.clone();
								uvM.lerpSelf( uvB, 0.5 );

								uvsTriA = [ uvA.clone(), uvM.clone(), uvC.clone() ];
								uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

							// BC

							} else if ( edge === 1 ) {

								uvM = uvB.clone();
								uvM.lerpSelf( uvC, 0.5 );

								uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
								uvsTriB = [ uvM.clone(), uvC.clone(), uvA.clone() ];

							// AC

							} else {

								uvM = uvA.clone();
								uvM.lerpSelf( uvC, 0.5 );

								uvsTriA = [ uvA.clone(), uvB.clone(), uvM.clone() ];
								uvsTriB = [ uvM.clone(), uvB.clone(), uvC.clone() ];

							}

							faceVertexUvs[ j ].push( uvsTriA, uvsTriB );

						}

					}

				} else {

					faces.push( face );

					for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

						faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

					}

				}

			} else {

				a = face.a;
				b = face.b;
				c = face.c;
				d = face.d;

				va = geometry.vertices[ a ];
				vb = geometry.vertices[ b ];
				vc = geometry.vertices[ c ];
				vd = geometry.vertices[ d ];

				dab = va.distanceTo( vb );
				dbc = vb.distanceTo( vc );
				dcd = vc.distanceTo( vd );
				dad = va.distanceTo( vd );

				if ( dab > maxEdgeLength || dbc > maxEdgeLength || dcd > maxEdgeLength || dad > maxEdgeLength ) {

					m1 = geometry.vertices.length;
					m2 = geometry.vertices.length + 1;

					quadA = face.clone();
					quadB = face.clone();

					if ( ( dab >= dbc && dab >= dcd && dab >= dad ) || ( dcd >= dbc && dcd >= dab && dcd >= dad ) ) {

						vm1 = va.clone();
						vm1.lerpSelf( vb, 0.5 );

						vm2 = vc.clone();
						vm2.lerpSelf( vd, 0.5 );

						quadA.a = a;
						quadA.b = m1;
						quadA.c = m2;
						quadA.d = d;

						quadB.a = m1;
						quadB.b = b;
						quadB.c = c;
						quadB.d = m2;

						if ( face.vertexNormals.length === 4 ) {

							vnm1 = face.vertexNormals[ 0 ].clone();
							vnm1.lerpSelf( face.vertexNormals[ 1 ], 0.5 );

							vnm2 = face.vertexNormals[ 2 ].clone();
							vnm2.lerpSelf( face.vertexNormals[ 3 ], 0.5 );

							quadA.vertexNormals[ 1 ].copy( vnm1 );
							quadA.vertexNormals[ 2 ].copy( vnm2 );

							quadB.vertexNormals[ 0 ].copy( vnm1 );
							quadB.vertexNormals[ 3 ].copy( vnm2 );

						}

						if ( face.vertexColors.length === 4 ) {

							vcm1 = face.vertexColors[ 0 ].clone();
							vcm1.lerpSelf( face.vertexColors[ 1 ], 0.5 );

							vcm2 = face.vertexColors[ 2 ].clone();
							vcm2.lerpSelf( face.vertexColors[ 3 ], 0.5 );

							quadA.vertexColors[ 1 ].copy( vcm1 );
							quadA.vertexColors[ 2 ].copy( vcm2 );

							quadB.vertexColors[ 0 ].copy( vcm1 );
							quadB.vertexColors[ 3 ].copy( vcm2 );

						}

						edge = 0;

					} else {

						vm1 = vb.clone();
						vm1.lerpSelf( vc, 0.5 );

						vm2 = vd.clone();
						vm2.lerpSelf( va, 0.5 );

						quadA.a = a;
						quadA.b = b;
						quadA.c = m1;
						quadA.d = m2;

						quadB.a = m2;
						quadB.b = m1;
						quadB.c = c;
						quadB.d = d;

						if ( face.vertexNormals.length === 4 ) {

							vnm1 = face.vertexNormals[ 1 ].clone();
							vnm1.lerpSelf( face.vertexNormals[ 2 ], 0.5 );

							vnm2 = face.vertexNormals[ 3 ].clone();
							vnm2.lerpSelf( face.vertexNormals[ 0 ], 0.5 );

							quadA.vertexNormals[ 2 ].copy( vnm1 );
							quadA.vertexNormals[ 3 ].copy( vnm2 );

							quadB.vertexNormals[ 0 ].copy( vnm2 );
							quadB.vertexNormals[ 1 ].copy( vnm1 );

						}

						if ( face.vertexColors.length === 4 ) {

							vcm1 = face.vertexColors[ 1 ].clone();
							vcm1.lerpSelf( face.vertexColors[ 2 ], 0.5 );

							vcm2 = face.vertexColors[ 3 ].clone();
							vcm2.lerpSelf( face.vertexColors[ 0 ], 0.5 );

							quadA.vertexColors[ 2 ].copy( vcm1 );
							quadA.vertexColors[ 3 ].copy( vcm2 );

							quadB.vertexColors[ 0 ].copy( vcm2 );
							quadB.vertexColors[ 1 ].copy( vcm1 );

						}

						edge = 1;

					}

					faces.push( quadA, quadB );
					geometry.vertices.push( vm1, vm2 );

					var j, jl, uvs, uvA, uvB, uvC, uvD, uvM1, uvM2, uvsQuadA, uvsQuadB;

					for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

						if ( geometry.faceVertexUvs[ j ].length ) {

							uvs = geometry.faceVertexUvs[ j ][ i ];

							uvA = uvs[ 0 ];
							uvB = uvs[ 1 ];
							uvC = uvs[ 2 ];
							uvD = uvs[ 3 ];

							// AB + CD

							if ( edge === 0 ) {

								uvM1 = uvA.clone();
								uvM1.lerpSelf( uvB, 0.5 );

								uvM2 = uvC.clone();
								uvM2.lerpSelf( uvD, 0.5 );

								uvsQuadA = [ uvA.clone(), uvM1.clone(), uvM2.clone(), uvD.clone() ];
								uvsQuadB = [ uvM1.clone(), uvB.clone(), uvC.clone(), uvM2.clone() ];

							// BC + AD

							} else {

								uvM1 = uvB.clone();
								uvM1.lerpSelf( uvC, 0.5 );

								uvM2 = uvD.clone();
								uvM2.lerpSelf( uvA, 0.5 );

								uvsQuadA = [ uvA.clone(), uvB.clone(), uvM1.clone(), uvM2.clone() ];
								uvsQuadB = [ uvM2.clone(), uvM1.clone(), uvC.clone(), uvD.clone() ];

							}

							faceVertexUvs[ j ].push( uvsQuadA, uvsQuadB );

						}

					}

				} else {

					faces.push( face );

					for ( j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {

						faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ][ i ] );

					}

				}

			}

		}

		geometry.faces = faces;
		geometry.faceVertexUvs = faceVertexUvs;

	}

};

THREE.GeometryUtils.random = THREE.Math.random16;

THREE.GeometryUtils.__v1 = new THREE.Vector3();
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageUtils = {

	crossOrigin: 'anonymous',

	loadTexture: function ( path, mapping, callback ) {

		var image = new Image(), texture = new THREE.Texture( image, mapping );

		image.onload = function () { texture.needsUpdate = true; if ( callback ) callback( this ); };
		image.crossOrigin = this.crossOrigin;
		image.src = path;

		return texture;

	},

	loadTextureCube: function ( array, mapping, callback ) {

		var i, l, images = [], texture = new THREE.Texture( images, mapping );

		images.loadCount = 0;

		for ( i = 0, l = array.length; i < l; ++ i ) {

			images[ i ] = new Image();
			images[ i ].onload = function () {

				images.loadCount += 1;
				if ( images.loadCount === 6 ) texture.needsUpdate = true;
				if ( callback ) callback( this );

			};

			images[ i ].crossOrigin = this.crossOrigin;
			images[ i ].src = array[ i ];

		}

		return texture;

	},

	getNormalMap: function ( image, depth ) {

		// Adapted from http://www.paulbrunt.co.uk/lab/heightnormal/

		var cross = function ( a, b ) {

			return [ a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ], a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ], a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ] ];

		}

		var subtract = function ( a, b ) {

			return [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ], a[ 2 ] - b[ 2 ] ];

		}

		var normalize = function ( a ) {

			var l = Math.sqrt( a[ 0 ] * a[ 0 ] + a[ 1 ] * a[ 1 ] + a[ 2 ] * a[ 2 ] );
			return [ a[ 0 ] / l, a[ 1 ] / l, a[ 2 ] / l ];

		}

		depth = depth | 1;

		var width = image.width;
		var height = image.height;

		var canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0 );

		var data = context.getImageData( 0, 0, width, height ).data;
		var imageData = context.createImageData( width, height );
		var output = imageData.data;

		for ( var x = 0; x < width; x ++ ) {

			for ( var y = 1; y < height; y ++ ) {

				var ly = y - 1 < 0 ? height - 1 : y - 1;
				var uy = ( y + 1 ) % height;
				var lx = x - 1 < 0 ? width - 1 : x - 1;
				var ux = ( x + 1 ) % width;

				var points = [];
				var origin = [ 0, 0, data[ ( y * width + x ) * 4 ] / 255 * depth ];
				points.push( [ - 1, 0, data[ ( y * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, - 1, data[ ( ly * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ 0, - 1, data[ ( ly * width + x ) * 4 ] / 255 * depth ] );
				points.push( [  1, - 1, data[ ( ly * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 0, data[ ( y * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 1, data[ ( uy * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 0, 1, data[ ( uy * width + x ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, 1, data[ ( uy * width + lx ) * 4 ] / 255 * depth ] );

				var normals = [];
				var num_points = points.length;

				for ( var i = 0; i < num_points; i ++ ) {

					var v1 = points[ i ];
					var v2 = points[ ( i + 1 ) % num_points ];
					v1 = subtract( v1, origin );
					v2 = subtract( v2, origin );
					normals.push( normalize( cross( v1, v2 ) ) );

				}

				var normal = [ 0, 0, 0 ];

				for ( var i = 0; i < normals.length; i ++ ) {

					normal[ 0 ] += normals[ i ][ 0 ];
					normal[ 1 ] += normals[ i ][ 1 ];
					normal[ 2 ] += normals[ i ][ 2 ];

				}

				normal[ 0 ] /= normals.length;
				normal[ 1 ] /= normals.length;
				normal[ 2 ] /= normals.length;

				var idx = ( y * width + x ) * 4;

				output[ idx ] = ( ( normal[ 0 ] + 1.0 ) / 2.0 * 255 ) | 0;
				output[ idx + 1 ] = ( ( normal[ 1 ] + 1.0 / 2.0 ) * 255 ) | 0;
				output[ idx + 2 ] = ( normal[ 2 ] * 255 ) | 0;
				output[ idx + 3 ] = 255;

			}

		}

		context.putImageData( imageData, 0, 0 );

		return canvas;

	},

	generateDataTexture: function ( width, height, color ) {

		var size = width * height;
		var data = new Uint8Array( 3 * size );

		var r = Math.floor( color.r * 255 );
		var g = Math.floor( color.g * 255 );
		var b = Math.floor( color.b * 255 );

		for ( var i = 0; i < size; i ++ ) {

			data[ i * 3 ] 	  = r;
			data[ i * 3 + 1 ] = g;
			data[ i * 3 + 2 ] = b;

		}

		var texture = new THREE.DataTexture( data, width, height, THREE.RGBFormat );
		texture.needsUpdate = true;

		return texture;

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {

	showHierarchy : function ( root, visible ) {

		THREE.SceneUtils.traverseHierarchy( root, function( node ) { node.visible = visible; } );

	},

	traverseHierarchy : function ( root, callback ) {

		var n, i, l = root.children.length;

		for ( i = 0; i < l; i ++ ) {

			n = root.children[ i ];

			callback( n );

			THREE.SceneUtils.traverseHierarchy( n, callback );

		}

	},

	createMultiMaterialObject : function ( geometry, materials ) {

		var i, il = materials.length,
			group = new THREE.Object3D();

		for ( i = 0; i < il; i ++ ) {

			var object = new THREE.Mesh( geometry, materials[ i ] );
			group.add( object );

		}

		return group;

	},

	cloneObject: function ( source ) {

		var object;

		// subclass specific properties
		// (must process in order from more specific subclasses to more abstract classes)

		if ( source instanceof THREE.MorphAnimMesh ) {

			object = new THREE.MorphAnimMesh( source.geometry, source.material );

			object.duration = source.duration;
			object.mirroredLoop = source.mirroredLoop;
			object.time = source.time;

			object.lastKeyframe = source.lastKeyframe;
			object.currentKeyframe = source.currentKeyframe;

			object.direction = source.direction;
			object.directionBackwards = source.directionBackwards;

		} else if ( source instanceof THREE.SkinnedMesh ) {

			object = new THREE.SkinnedMesh( source.geometry, source.material );

		} else if ( source instanceof THREE.Mesh ) {

			object = new THREE.Mesh( source.geometry, source.material );

		} else if ( source instanceof THREE.Line ) {

			object = new THREE.Line( source.geometry, source.material, source.type );

		} else if ( source instanceof THREE.Ribbon ) {

			object = new THREE.Ribbon( source.geometry, source.material );

		} else if ( source instanceof THREE.ParticleSystem ) {

			object = new THREE.ParticleSystem( source.geometry, source.material );
			object.sortParticles = source.sortParticles;

		} else if ( source instanceof THREE.Particle ) {

			object = new THREE.Particle( source.material );

		} else if ( source instanceof THREE.Sprite ) {

			object = new THREE.Sprite( {} );

			object.color.copy( source.color );
			object.map = source.map;
			object.blending = source.blending;

			object.useScreenCoordinates = source.useScreenCoordinates;
			object.mergeWith3D = source.mergeWith3D;
			object.affectedByDistance = source.affectedByDistance;
			object.scaleByViewport = source.scaleByViewport;
			object.alignment = source.alignment;

			object.rotation3d.copy( source.rotation3d );
			object.rotation = source.rotation;
			object.opacity = source.opacity;

			object.uvOffset.copy( source.uvOffset );
			object.uvScale.copy( source.uvScale);

		} else if ( source instanceof THREE.LOD ) {

			object = new THREE.LOD();

		} else if ( source instanceof THREE.MarchingCubes ) {

			object = new THREE.MarchingCubes( source.resolution, source.material );
			object.field.set( source.field );
			object.isolation = source.isolation;

		} else if ( source instanceof THREE.Object3D ) {

			object = new THREE.Object3D();

		}

		// base class properties

		object.name = source.name;

		object.parent = source.parent;

		object.up.copy( source.up );

		object.position.copy( source.position );

		// because of Sprite madness

		if ( object.rotation instanceof THREE.Vector3 )
			object.rotation.copy( source.rotation );

		object.eulerOrder = source.eulerOrder;

		object.scale.copy( source.scale );

		object.dynamic = source.dynamic;

		object.doubleSided = source.doubleSided;
		object.flipSided = source.flipSided;

		object.renderDepth = source.renderDepth;

		object.rotationAutoUpdate = source.rotationAutoUpdate;

		object.matrix.copy( source.matrix );
		object.matrixWorld.copy( source.matrixWorld );
		object.matrixRotationWorld.copy( source.matrixRotationWorld );

		object.matrixAutoUpdate = source.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		object.quaternion.copy( source.quaternion );
		object.useQuaternion = source.useQuaternion;

		object.boundRadius = source.boundRadius;
		object.boundRadiusScale = source.boundRadiusScale;

		object.visible = source.visible;

		object.castShadow = source.castShadow;
		object.receiveShadow = source.receiveShadow;

		object.frustumCulled = source.frustumCulled;

		// children

		for ( var i = 0; i < source.children.length; i ++ ) {

			var child = THREE.SceneUtils.cloneObject( source.children[ i ] );
			object.children[ i ] = child;

			child.parent = object;

		}

		// LODs need to be patched separately to use cloned children

		if ( source instanceof THREE.LOD ) {

			for ( var i = 0; i < source.LODs.length; i ++ ) {

				var lod = source.LODs[ i ];
				object.LODs[ i ] = { visibleAtDistance: lod.visibleAtDistance, object3D: object.children[ i ] };

			}

		}

		return object;

	},

	detach : function ( child, parent, scene ) {

		child.applyMatrix( parent.matrixWorld );
		parent.remove( child );
		scene.add( child );

	},

	attach: function ( child, scene, parent ) {

		var matrixWorldInverse = new THREE.Matrix4();
		matrixWorldInverse.getInverse( parent.matrixWorld );
		child.applyMatrix( matrixWorldInverse );

		scene.remove( child );
		parent.add( child );

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 *
 * ShaderUtils currently contains:
 *
 *	fresnel
 *	normal
 * 	cube
 *
 */

if ( THREE.WebGLRenderer ) {

THREE.ShaderUtils = {

	lib: {

		/* -------------------------------------------------------------------------
		//	Fresnel shader
		//	- based on Nvidia Cg tutorial
		 ------------------------------------------------------------------------- */

		'fresnel': {

			uniforms: {

				"mRefractionRatio": { type: "f", value: 1.02 },
				"mFresnelBias": { type: "f", value: 0.1 },
				"mFresnelPower": { type: "f", value: 2.0 },
				"mFresnelScale": { type: "f", value: 1.0 },
				"tCube": { type: "t", value: 1, texture: null }

			},

			fragmentShader: [

				"uniform samplerCube tCube;",

				"varying vec3 vReflect;",
				"varying vec3 vRefract[3];",
				"varying float vReflectionFactor;",

				"void main() {",

					"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
					"vec4 refractedColor = vec4( 1.0, 1.0, 1.0, 1.0 );",

					"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
					"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
					"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",
					"refractedColor.a = 1.0;",

					"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

				"}"

			].join("\n"),

			vertexShader: [

				"uniform float mRefractionRatio;",
				"uniform float mFresnelBias;",
				"uniform float mFresnelScale;",
				"uniform float mFresnelPower;",

				"varying vec3 vReflect;",
				"varying vec3 vRefract[3];",
				"varying float vReflectionFactor;",

				"void main() {",

					"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",

					"vec3 nWorld = normalize ( mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal );",

					"vec3 I = mPosition.xyz - cameraPosition;",

					"vReflect = reflect( I, nWorld );",
					"vRefract[0] = refract( normalize( I ), nWorld, mRefractionRatio );",
					"vRefract[1] = refract( normalize( I ), nWorld, mRefractionRatio * 0.99 );",
					"vRefract[2] = refract( normalize( I ), nWorld, mRefractionRatio * 0.98 );",
					"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), nWorld ), mFresnelPower );",

					"gl_Position = projectionMatrix * mvPosition;",

				"}"

			].join("\n")

		},

		/* -------------------------------------------------------------------------
		//	Normal map shader
		//		- Blinn-Phong
		//		- normal + diffuse + specular + AO + displacement + reflection + shadow maps
		//		- point and directional lights (use with "lights: true" material option)
		 ------------------------------------------------------------------------- */

		'normal' : {

			uniforms: THREE.UniformsUtils.merge( [

				THREE.UniformsLib[ "fog" ],
				THREE.UniformsLib[ "lights" ],
				THREE.UniformsLib[ "shadowmap" ],

				{

				"enableAO"		  : { type: "i", value: 0 },
				"enableDiffuse"	  : { type: "i", value: 0 },
				"enableSpecular"  : { type: "i", value: 0 },
				"enableReflection": { type: "i", value: 0 },

				"tDiffuse"	   : { type: "t", value: 0, texture: null },
				"tCube"		   : { type: "t", value: 1, texture: null },
				"tNormal"	   : { type: "t", value: 2, texture: null },
				"tSpecular"	   : { type: "t", value: 3, texture: null },
				"tAO"		   : { type: "t", value: 4, texture: null },
				"tDisplacement": { type: "t", value: 5, texture: null },

				"uNormalScale": { type: "f", value: 1.0 },

				"uDisplacementBias": { type: "f", value: 0.0 },
				"uDisplacementScale": { type: "f", value: 1.0 },

				"uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
				"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
				"uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
				"uShininess": { type: "f", value: 30 },
				"uOpacity": { type: "f", value: 1 },

				"uReflectivity": { type: "f", value: 0.5 },

				"uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
				"uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

				"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

				}

			] ),

			fragmentShader: [

				"uniform vec3 uAmbientColor;",
				"uniform vec3 uDiffuseColor;",
				"uniform vec3 uSpecularColor;",
				"uniform float uShininess;",
				"uniform float uOpacity;",

				"uniform bool enableDiffuse;",
				"uniform bool enableSpecular;",
				"uniform bool enableAO;",
				"uniform bool enableReflection;",

				"uniform sampler2D tDiffuse;",
				"uniform sampler2D tNormal;",
				"uniform sampler2D tSpecular;",
				"uniform sampler2D tAO;",

				"uniform samplerCube tCube;",

				"uniform float uNormalScale;",
				"uniform float uReflectivity;",

				"varying vec3 vTangent;",
				"varying vec3 vBinormal;",
				"varying vec3 vNormal;",
				"varying vec2 vUv;",

				"uniform vec3 ambientLightColor;",

				"#if MAX_DIR_LIGHTS > 0",
					"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
					"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
				"#endif",

				"#if MAX_POINT_LIGHTS > 0",
					"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
					"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
				"#endif",

				"#ifdef WRAP_AROUND",
					"uniform vec3 wrapRGB;",
				"#endif",

				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],

				"void main() {",

					"gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",

					"vec3 specularTex = vec3( 1.0 );",

					"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
					"normalTex.xy *= uNormalScale;",
					"normalTex = normalize( normalTex );",

					"if( enableDiffuse ) {",

						"#ifdef GAMMA_INPUT",

							"vec4 texelColor = texture2D( tDiffuse, vUv );",
							"texelColor.xyz *= texelColor.xyz;",

							"gl_FragColor = gl_FragColor * texelColor;",

						"#else",

							"gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );",

						"#endif",

					"}",

					"if( enableAO ) {",

						"#ifdef GAMMA_INPUT",

							"vec4 aoColor = texture2D( tAO, vUv );",
							"aoColor.xyz *= aoColor.xyz;",

							"gl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;",

						"#else",

							"gl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;",

						"#endif",

					"}",

					"if( enableSpecular )",
						"specularTex = texture2D( tSpecular, vUv ).xyz;",

					"mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
					"vec3 finalNormal = tsb * normalTex;",

					"vec3 normal = normalize( finalNormal );",
					"vec3 viewPosition = normalize( vViewPosition );",

					// point lights

					"#if MAX_POINT_LIGHTS > 0",

						"vec3 pointDiffuse = vec3( 0.0 );",
						"vec3 pointSpecular = vec3( 0.0 );",

						"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

							"vec3 pointVector = normalize( vPointLight[ i ].xyz );",
							"float pointDistance = vPointLight[ i ].w;",

							// diffuse

							"#ifdef WRAP_AROUND",

								"float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );",
								"float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );",

								"vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

							"#else",

								"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

							"#endif",

							"pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",

							// specular

							"vec3 pointHalfVector = normalize( pointVector + viewPosition );",
							"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
							"float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );",
								"pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",

							"#else",

								"pointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// directional lights

					"#if MAX_DIR_LIGHTS > 0",

						"vec3 dirDiffuse = vec3( 0.0 );",
						"vec3 dirSpecular = vec3( 0.0 );",

						"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

							"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
							"vec3 dirVector = normalize( lDirection.xyz );",

							// diffuse

							"#ifdef WRAP_AROUND",

								"float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );",
								"float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",

								"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",

							"#else",

								"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

							"#endif",

							"dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;",

							// specular

							"vec3 dirHalfVector = normalize( dirVector + viewPosition );",
							"float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
							"float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );",
								"dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",

							"#else",

								"dirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// all lights contribution summation

					"vec3 totalDiffuse = vec3( 0.0 );",
					"vec3 totalSpecular = vec3( 0.0 );",

					"#if MAX_DIR_LIGHTS > 0",

						"totalDiffuse += dirDiffuse;",
						"totalSpecular += dirSpecular;",

					"#endif",

					"#if MAX_POINT_LIGHTS > 0",

						"totalDiffuse += pointDiffuse;",
						"totalSpecular += pointSpecular;",

					"#endif",

					"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;",

					"if ( enableReflection ) {",

						"vec3 wPos = cameraPosition - vViewPosition;",
						"vec3 vReflect = reflect( normalize( wPos ), normal );",

						"vec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",

						"#ifdef GAMMA_INPUT",

							"cubeColor.xyz *= cubeColor.xyz;",

						"#endif",

						"gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );",

					"}",

					THREE.ShaderChunk[ "shadowmap_fragment" ],
					THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
					THREE.ShaderChunk[ "fog_fragment" ],

				"}"

			].join("\n"),

			vertexShader: [

				"attribute vec4 tangent;",

				"uniform vec2 uOffset;",
				"uniform vec2 uRepeat;",

				"#ifdef VERTEX_TEXTURES",

					"uniform sampler2D tDisplacement;",
					"uniform float uDisplacementScale;",
					"uniform float uDisplacementBias;",

				"#endif",

				"varying vec3 vTangent;",
				"varying vec3 vBinormal;",
				"varying vec3 vNormal;",
				"varying vec2 vUv;",

				"#if MAX_POINT_LIGHTS > 0",

					"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
					"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

					"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",

				"#endif",

				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

				"void main() {",

					"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

					"vViewPosition = -mvPosition.xyz;",

					// normal, tangent and binormal vectors

					"vNormal = normalMatrix * normal;",
					"vTangent = normalMatrix * tangent.xyz;",
					"vBinormal = cross( vNormal, vTangent ) * tangent.w;",

					"vUv = uv * uRepeat + uOffset;",

					// point lights

					"#if MAX_POINT_LIGHTS > 0",

						"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

							"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
							"vec3 lVector = lPosition.xyz - mvPosition.xyz;",

							"float lDistance = 1.0;",
							"if ( pointLightDistance[ i ] > 0.0 )",
								"lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

							"lVector = normalize( lVector );",

							"vPointLight[ i ] = vec4( lVector, lDistance );",

						"}",

					"#endif",

					// displacement mapping

					"#ifdef VERTEX_TEXTURES",

						"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
						"float df = uDisplacementScale * dv.x + uDisplacementBias;",
						"vec4 displacedPosition = vec4( normalize( vNormal.xyz ) * df, 0.0 ) + mvPosition;",
						"gl_Position = projectionMatrix * displacedPosition;",

					"#else",

						"gl_Position = projectionMatrix * mvPosition;",

					"#endif",

					THREE.ShaderChunk[ "shadowmap_vertex" ],

				"}"

			].join("\n")

		},

		/* -------------------------------------------------------------------------
		//	Cube map shader
		 ------------------------------------------------------------------------- */

		'cube': {

			uniforms: { "tCube": { type: "t", value: 1, texture: null },
						"tFlip": { type: "f", value: -1 } },

			vertexShader: [

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
					"vViewPosition = cameraPosition - mPosition.xyz;",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragmentShader: [

				"uniform samplerCube tCube;",
				"uniform float tFlip;",

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec3 wPos = cameraPosition - vViewPosition;",
					"gl_FragColor = textureCube( tCube, vec3( tFlip * wPos.x, wPos.yz ) );",

				"}"

			].join("\n")

		}

	}

};

};/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BufferGeometry = function () {

	this.id = THREE.GeometryCount ++;

	// GL buffers

	this.vertexIndexBuffer = null;
	this.vertexPositionBuffer = null;
	this.vertexNormalBuffer = null;
	this.vertexUvBuffer = null;
	this.vertexColorBuffer = null;

	// typed arrays (kept only if dynamic flag is set)

	this.vertexIndexArray = null;
	this.vertexPositionArray = null;
	this.vertexNormalArray = null;
	this.vertexUvArray = null;
	this.vertexColorArray = null;

	this.dynamic = false;

	// boundings

	this.boundingBox = null;
	this.boundingSphere = null;

	// for compatibility

	this.morphTargets = [];

};

THREE.BufferGeometry.prototype = {

	constructor : THREE.BufferGeometry,

	// for compatibility

	computeBoundingBox: function () {

	},

	// for compatibility

	computeBoundingSphere: function () {

	}


};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
 * 
 * Some common of Curve methods
 * .getPoint(t), getTangent(t)
 * .getPointAt(u), getTagentAt(u)
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This file contains following classes:
 *
 * -- 2d classes --
 * THREE.Curve
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.CubicBezierCurve
 * THREE.SplineCurve
 * THREE.ArcCurve
 *
 * -- 3d classes --
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 * THREE.CubicBezierCurve3
 * THREE.SplineCurve3
 * THREE.ClosedSplineCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath
 *
 **/

/**************************************************************
 *	Abstract Curve base class
 **************************************************************/

THREE.Curve = function () {

};

// Virtual base class method to overwrite and implement in subclasses
//	- t [0 .. 1]

THREE.Curve.prototype.getPoint = function ( t ) {

	console.log( "Warning, getPoint() not implemented!" );
	return null;

};

// Get point at relative position in curve according to arc length
// - u [0 .. 1]

THREE.Curve.prototype.getPointAt = function ( u ) {

	var t = this.getUtoTmapping( u );
	return this.getPoint( t );

};

// Get sequence of points using getPoint( t )

THREE.Curve.prototype.getPoints = function ( divisions ) {

	if ( !divisions ) divisions = 5;

	var d, pts = [];

	for ( d = 0; d <= divisions; d ++ ) {

		pts.push( this.getPoint( d / divisions ) );

	}

	return pts;

};

// Get sequence of points using getPointAt( u )

THREE.Curve.prototype.getSpacedPoints = function ( divisions ) {

	if ( !divisions ) divisions = 5;

	var d, pts = [];

	for ( d = 0; d <= divisions; d ++ ) {

		pts.push( this.getPointAt( d / divisions ) );

	}

	return pts;

};

// Get total curve arc length

THREE.Curve.prototype.getLength = function () {

	var lengths = this.getLengths();
	return lengths[ lengths.length - 1 ];

};

// Get list of cumulative segment lengths

THREE.Curve.prototype.getLengths = function ( divisions ) {

	if ( !divisions ) divisions = (this.__arcLengthDivisions) ? (this.__arcLengthDivisions): 200;

	if ( this.cacheArcLengths 
		&& ( this.cacheArcLengths.length == divisions + 1 ) 
		&& !this.needsUpdate) {

		//console.log( "cached", this.cacheArcLengths );
		return this.cacheArcLengths;

	}

	this.needsUpdate = false;

	var cache = [];
	var current, last = this.getPoint( 0 );
	var p, sum = 0;

	cache.push( 0 );

	for ( p = 1; p <= divisions; p ++ ) {

		current = this.getPoint ( p / divisions );
		sum += current.distanceTo( last );
		cache.push( sum );
		last = current;

	}

	this.cacheArcLengths = cache;

	return cache; // { sums: cache, sum:sum }; Sum is in the last element.

};


THREE.Curve.prototype.updateArcLengths = function() {
	this.needsUpdate = true;
	this.getLengths();
};

// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equi distance

THREE.Curve.prototype.getUtoTmapping = function ( u, distance ) {

	var arcLengths = this.getLengths();

	var i = 0, il = arcLengths.length;

	var targetArcLength; // The targeted u distance value to get

	if ( distance ) {

		targetArcLength = distance;

	} else {

		targetArcLength = u * arcLengths[ il - 1 ];

	}

	//var time = Date.now();

	// binary search for the index with largest value smaller than target u distance

	var low = 0, high = il - 1, comparison;

	while ( low <= high ) {

		i = Math.floor( low + ( high - low ) / 2 ); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

		comparison = arcLengths[ i ] - targetArcLength;

		if ( comparison < 0 ) {

			low = i + 1;
			continue;

		} else if ( comparison > 0 ) {

			high = i - 1;
			continue;

		} else {

			high = i;
			break;

			// DONE

		}

	}

	i = high;

	//console.log('b' , i, low, high, Date.now()- time);

	if ( arcLengths[ i ] == targetArcLength ) {

		var t = i / ( il - 1 );
		return t;

	}

	// we could get finer grain at lengths, or use simple interpolatation between two points

	var lengthBefore = arcLengths[ i ];
    var lengthAfter = arcLengths[ i + 1 ];

    var segmentLength = lengthAfter - lengthBefore;

    // determine where we are between the 'before' and 'after' points

    var segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

    // add that fractional amount to t

    var t = ( i + segmentFraction ) / ( il -1 );

	return t;

};


// In 2D space, there are actually 2 normal vectors,
// and in 3D space, infinte
// TODO this should be depreciated.
THREE.Curve.prototype.getNormalVector = function( t ) {

	var vec = this.getTangent( t );

	return new THREE.Vector2( -vec.y , vec.x );

};

// Returns a unit vector tangent at t
// In case any sub curve does not implement its tangent / normal finding,
// we get 2 points with a small delta and find a gradient of the 2 points
// which seems to make a reasonable approximation

THREE.Curve.prototype.getTangent = function( t ) {

	var delta = 0.0001;
	var t1 = t - delta;
	var t2 = t + delta;

	// Capping in case of danger

	if ( t1 < 0 ) t1 = 0;
	if ( t2 > 1 ) t2 = 1;

	var pt1 = this.getPoint( t1 );
	var pt2 = this.getPoint( t2 );
	
	var vec = pt2.clone().subSelf(pt1);
	return vec.normalize();

};


THREE.Curve.prototype.getTangentAt = function ( u ) {

	var t = this.getUtoTmapping( u );
	return this.getTangent( t );

};

/**************************************************************
 *	Line
 **************************************************************/

THREE.LineCurve = function ( v1, v2 ) {

	this.v1 = v1;
	this.v2 = v2;

};

THREE.LineCurve.prototype = new THREE.Curve();
THREE.LineCurve.prototype.constructor = THREE.LineCurve;

THREE.LineCurve.prototype.getPoint = function ( t ) {

	var point = this.v2.clone().subSelf(this.v1);
	point.multiplyScalar( t ).addSelf( this.v1 );

	return point;

};

// Line curve is linear, so we can overwrite default getPointAt

THREE.LineCurve.prototype.getPointAt = function ( u ) {

	return this.getPoint( u );

};

THREE.LineCurve.prototype.getTangent = function( t ) {

	var tangent = this.v2.clone().subSelf(this.v1);

	return tangent.normalize();

};

/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/


THREE.QuadraticBezierCurve = function ( v0, v1, v2 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;

};

THREE.QuadraticBezierCurve.prototype = new THREE.Curve();
THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve;


THREE.QuadraticBezierCurve.prototype.getPoint = function ( t ) {

	var tx, ty;

	tx = THREE.Shape.Utils.b2( t, this.v0.x, this.v1.x, this.v2.x );
	ty = THREE.Shape.Utils.b2( t, this.v0.y, this.v1.y, this.v2.y );

	return new THREE.Vector2( tx, ty );

};


THREE.QuadraticBezierCurve.prototype.getTangent = function( t ) {

	var tx, ty;

	tx = THREE.Curve.Utils.tangentQuadraticBezier( t, this.v0.x, this.v1.x, this.v2.x );
	ty = THREE.Curve.Utils.tangentQuadraticBezier( t, this.v0.y, this.v1.y, this.v2.y );

	// returns unit vector

	var tangent = new THREE.Vector2( tx, ty );
	tangent.normalize();

	return tangent;

};


/**************************************************************
 *	Cubic Bezier curve
 **************************************************************/

THREE.CubicBezierCurve = function ( v0, v1, v2, v3 ) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;

};

THREE.CubicBezierCurve.prototype = new THREE.Curve();
THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve;

THREE.CubicBezierCurve.prototype.getPoint = function ( t ) {

	var tx, ty;

	tx = THREE.Shape.Utils.b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x );
	ty = THREE.Shape.Utils.b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y );

	return new THREE.Vector2( tx, ty );

};

THREE.CubicBezierCurve.prototype.getTangent = function( t ) {

	var tx, ty;

	tx = THREE.Curve.Utils.tangentCubicBezier( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x );
	ty = THREE.Curve.Utils.tangentCubicBezier( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y );

	var tangent = new THREE.Vector2( tx, ty );
	tangent.normalize();

	return tangent;

};


/**************************************************************
 *	Spline curve
 **************************************************************/

THREE.SplineCurve = function ( points /* array of Vector2 */ ) {

	this.points = (points == undefined) ? [] : points;

};

THREE.SplineCurve.prototype = new THREE.Curve();
THREE.SplineCurve.prototype.constructor = THREE.SplineCurve;

THREE.SplineCurve.prototype.getPoint = function ( t ) {

	var v = new THREE.Vector2();
	var c = [];
	var points = this.points, point, intPoint, weight;
	point = ( points.length - 1 ) * t;

	intPoint = Math.floor( point );
	weight = point - intPoint;

	c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
	c[ 1 ] = intPoint;
	c[ 2 ] = intPoint  > points.length - 2 ? points.length -1 : intPoint + 1;
	c[ 3 ] = intPoint  > points.length - 3 ? points.length -1 : intPoint + 2;

	v.x = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].x, points[ c[ 1 ] ].x, points[ c[ 2 ] ].x, points[ c[ 3 ] ].x, weight );
	v.y = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].y, points[ c[ 1 ] ].y, points[ c[ 2 ] ].y, points[ c[ 3 ] ].y, weight );

	return v;

};

/**************************************************************
 *	Arc curve
 **************************************************************/

THREE.ArcCurve = function ( aX, aY, aRadius,
							aStartAngle, aEndAngle,
							aClockwise ) {

	this.aX = aX;
	this.aY = aY;

	this.aRadius = aRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;

};

THREE.ArcCurve.prototype = new THREE.Curve();
THREE.ArcCurve.prototype.constructor = THREE.ArcCurve;

THREE.ArcCurve.prototype.getPoint = function ( t ) {

	var deltaAngle = this.aEndAngle - this.aStartAngle;

	if ( !this.aClockwise ) {

		t = 1 - t;

	}

	var angle = this.aStartAngle + t * deltaAngle;

	var tx = this.aX + this.aRadius * Math.cos( angle );
	var ty = this.aY + this.aRadius * Math.sin( angle );

	return new THREE.Vector2( tx, ty );

};

/**************************************************************
 *	Utils
 **************************************************************/

THREE.Curve.Utils = {

	tangentQuadraticBezier: function ( t, p0, p1, p2 ) {

		return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 );

	},

	// Puay Bing, thanks for helping with this derivative!

	tangentCubicBezier: function (t, p0, p1, p2, p3 ) {

		return -3 * p0 * (1 - t) * (1 - t)  +
			3 * p1 * (1 - t) * (1-t) - 6 *t *p1 * (1-t) +
			6 * t *  p2 * (1-t) - 3 * t * t * p2 +
			3 * t * t * p3;
	},


	tangentSpline: function ( t, p0, p1, p2, p3 ) {

		// To check if my formulas are correct

		var h00 = 6 * t * t - 6 * t; 	// derived from 2t^3 − 3t^2 + 1
		var h10 = 3 * t * t - 4 * t + 1; // t^3 − 2t^2 + t
		var h01 = -6 * t * t + 6 * t; 	// − 2t3 + 3t2
		var h11 = 3 * t * t - 2 * t;	// t3 − t2

		return h00 + h10 + h01 + h11;

	},

	// Catmull-Rom

	interpolate: function( p0, p1, p2, p3, t ) {

		var v0 = ( p2 - p0 ) * 0.5;
		var v1 = ( p3 - p1 ) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	}

};


// TODO: Transformation for Curves?

/**************************************************************
 *	3D Curves
 **************************************************************/

// A Factory method for creating new curve subclasses

THREE.Curve.create = function( constructor, getPointFunc ) {

    var subClass = constructor;

	subClass.prototype = new THREE.Curve();

	subClass.prototype.constructor = constructor;
    subClass.prototype.getPoint = getPointFunc;

	return subClass;

};


/**************************************************************
 *	Line3D
 **************************************************************/

THREE.LineCurve3 = THREE.Curve.create(

	function ( v1, v2 ) {

		this.v1 = v1;
		this.v2 = v2;

	},

	function ( t ) {

		var r = new THREE.Vector3();


		r.sub( this.v2, this.v1 ); // diff
		r.multiplyScalar( t );
		r.addSelf( this.v1 );

		return r;

	}

);


/**************************************************************
 *	Quadratic Bezier 3D curve
 **************************************************************/

THREE.QuadraticBezierCurve3 = THREE.Curve.create(

	function ( v0, v1, v2 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

	},

	function ( t ) {

		var tx, ty, tz;

		tx = THREE.Shape.Utils.b2( t, this.v0.x, this.v1.x, this.v2.x );
		ty = THREE.Shape.Utils.b2( t, this.v0.y, this.v1.y, this.v2.y );
		tz = THREE.Shape.Utils.b2( t, this.v0.z, this.v1.z, this.v2.z );

		return new THREE.Vector3( tx, ty, tz );

	}

);



/**************************************************************
 *	Cubic Bezier 3D curve
 **************************************************************/

THREE.CubicBezierCurve3 = THREE.Curve.create(

	function ( v0, v1, v2, v3 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

	},

	function ( t ) {

		var tx, ty, tz;

		tx = THREE.Shape.Utils.b3( t, this.v0.x, this.v1.x, this.v2.x, this.v3.x );
		ty = THREE.Shape.Utils.b3( t, this.v0.y, this.v1.y, this.v2.y, this.v3.y );
		tz = THREE.Shape.Utils.b3( t, this.v0.z, this.v1.z, this.v2.z, this.v3.z );

		return new THREE.Vector3( tx, ty, tz );

	}

);



/**************************************************************
 *	Spline 3D curve
 **************************************************************/


THREE.SplineCurve3 = THREE.Curve.create(

	function ( points /* array of Vector3 */) {

		this.points = (points == undefined) ? [] : points;

	},

	function ( t ) {

		var v = new THREE.Vector3();
		var c = [];
		var points = this.points, point, intPoint, weight;
		point = ( points.length - 1 ) * t;

		intPoint = Math.floor( point );
		weight = point - intPoint;

		c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint  > points.length - 2 ? points.length - 1 : intPoint + 1;
		c[ 3 ] = intPoint  > points.length - 3 ? points.length - 1 : intPoint + 2;

		var pt0 = points[ c[0] ],
			pt1 = points[ c[1] ],
			pt2 = points[ c[2] ],
			pt3 = points[ c[3] ];

		v.x = THREE.Curve.Utils.interpolate(pt0.x, pt1.x, pt2.x, pt3.x, weight);
		v.y = THREE.Curve.Utils.interpolate(pt0.y, pt1.y, pt2.y, pt3.y, weight);
		v.z = THREE.Curve.Utils.interpolate(pt0.z, pt1.z, pt2.z, pt3.z, weight);

		return v;

	}

);


// THREE.SplineCurve3.prototype.getTangent = function(t) {
// 		var v = new THREE.Vector3();
// 		var c = [];
// 		var points = this.points, point, intPoint, weight;
// 		point = ( points.length - 1 ) * t;

// 		intPoint = Math.floor( point );
// 		weight = point - intPoint;

// 		c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
// 		c[ 1 ] = intPoint;
// 		c[ 2 ] = intPoint  > points.length - 2 ? points.length - 1 : intPoint + 1;
// 		c[ 3 ] = intPoint  > points.length - 3 ? points.length - 1 : intPoint + 2;

// 		var pt0 = points[ c[0] ],
// 			pt1 = points[ c[1] ],
// 			pt2 = points[ c[2] ],
// 			pt3 = points[ c[3] ];

// 	// t = weight;
// 	v.x = THREE.Curve.Utils.tangentSpline( t, pt0.x, pt1.x, pt2.x, pt3.x );
// 	v.y = THREE.Curve.Utils.tangentSpline( t, pt0.y, pt1.y, pt2.y, pt3.y );
// 	v.z = THREE.Curve.Utils.tangentSpline( t, pt0.z, pt1.z, pt2.z, pt3.z );

// 	return v;
		
// }

/**************************************************************
 *	Closed Spline 3D curve
 **************************************************************/


THREE.ClosedSplineCurve3 = THREE.Curve.create(

	function ( points /* array of Vector3 */) {

		this.points = (points == undefined) ? [] : points;

	},

    function ( t ) {

        var v = new THREE.Vector3();
        var c = [];
        var points = this.points, point, intPoint, weight;
        point = ( points.length - 0 ) * t;
            // This needs to be from 0-length +1

        intPoint = Math.floor( point );
        weight = point - intPoint;
            
        intPoint += intPoint > 0 ? 0 : ( Math.floor( Math.abs( intPoint ) / points.length ) + 1 ) * points.length;
        c[ 0 ] = ( intPoint - 1 ) % points.length;
        c[ 1 ] = ( intPoint ) % points.length;
        c[ 2 ] = ( intPoint + 1 ) % points.length;
        c[ 3 ] = ( intPoint + 2 ) % points.length;

        v.x = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].x, points[ c[ 1 ] ].x, points[ c[ 2 ] ].x, points[ c[ 3 ] ].x, weight );
        v.y = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].y, points[ c[ 1 ] ].y, points[ c[ 2 ] ].y, points[ c[ 3 ] ].y, weight );
        v.z = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].z, points[ c[ 1 ] ].z, points[ c[ 2 ] ].z, points[ c[ 3 ] ].z, weight );
        
        return v;

    }

);/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 **/

/**************************************************************
 *	Curved Path - a curve path is simply a array of connected
 *  curves, but retains the api of a curve
 **************************************************************/

THREE.CurvePath = function () {

	this.curves = [];
	this.bends = [];
	
	this.autoClose = false; // Automatically closes the path
};

THREE.CurvePath.prototype = new THREE.Curve();
THREE.CurvePath.prototype.constructor = THREE.CurvePath;

THREE.CurvePath.prototype.add = function ( curve ) {

	this.curves.push( curve );

};

THREE.CurvePath.prototype.checkConnection = function() {
	// TODO
	// If the ending of curve is not connected to the starting
	// or the next curve, then, this is not a real path
};

THREE.CurvePath.prototype.closePath = function() {
	// TODO Test
	// and verify for vector3 (needs to implement equals)
	// Add a line curve if start and end of lines are not connected
	var startPoint = this.curves[0].getPoint(0);
	var endPoint = this.curves[this.curves.length-1].getPoint(1);
	
	if (!startPoint.equals(endPoint)) {
		this.curves.push( new THREE.LineCurve(endPoint, startPoint) );
	}
	
};

// To get accurate point with reference to
// entire path distance at time t,
// following has to be done:

// 1. Length of each sub path have to be known
// 2. Locate and identify type of curve
// 3. Get t for the curve
// 4. Return curve.getPointAt(t')

THREE.CurvePath.prototype.getPoint = function( t ) {

	var d = t * this.getLength();
	var curveLengths = this.getCurveLengths();
	var i = 0, diff, curve;

	// To think about boundaries points.

	while ( i < curveLengths.length ) {

		if ( curveLengths[ i ] >= d ) {

			diff = curveLengths[ i ] - d;
			curve = this.curves[ i ];

			var u = 1 - diff / curve.getLength();

			return curve.getPointAt( u );

			break;
		}

		i ++;

	}

	return null;

	// loop where sum != 0, sum > d , sum+1 <d

};

/*
THREE.CurvePath.prototype.getTangent = function( t ) {
};*/


// We cannot use the default THREE.Curve getPoint() with getLength() because in
// THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
// getPoint() depends on getLength

THREE.CurvePath.prototype.getLength = function() {

	var lens = this.getCurveLengths();
	return lens[ lens.length - 1 ];

};

// Compute lengths and cache them
// We cannot overwrite getLengths() because UtoT mapping uses it.

THREE.CurvePath.prototype.getCurveLengths = function() {

	// We use cache values if curves and cache array are same length

	if ( this.cacheLengths && this.cacheLengths.length == this.curves.length ) {

		return this.cacheLengths;

	};

	// Get length of subsurve
	// Push sums into cached array

	var lengths = [], sums = 0;
	var i, il = this.curves.length;

	for ( i = 0; i < il; i ++ ) {

		sums += this.curves[ i ].getLength();
		lengths.push( sums );

	}

	this.cacheLengths = lengths;

	return lengths;

};



// Returns min and max coordinates, as well as centroid

THREE.CurvePath.prototype.getBoundingBox = function () {

	var points = this.getPoints();

	var maxX, maxY;
	var minX, minY;

	maxX = maxY = Number.NEGATIVE_INFINITY;
	minX = minY = Number.POSITIVE_INFINITY;

	var p, i, il, sum;

	sum = new THREE.Vector2();

	for ( i = 0, il = points.length; i < il; i ++ ) {

		p = points[ i ];

		if ( p.x > maxX ) maxX = p.x;
		else if ( p.x < minX ) minX = p.x;

		if ( p.y > maxY ) maxY = p.y;
		else if ( p.y < maxY ) minY = p.y;

		sum.addSelf( p.x, p.y );

	}

	return {

		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY,
		centroid: sum.divideScalar( il )

	};

};

/**************************************************************
 *	Create Geometries Helpers
 **************************************************************/

/// Generate geometry from path points (for Line or ParticleSystem objects)

THREE.CurvePath.prototype.createPointsGeometry = function( divisions ) {

	var pts = this.getPoints( divisions, true );
	return this.createGeometry( pts );

};

// Generate geometry from equidistance sampling along the path

THREE.CurvePath.prototype.createSpacedPointsGeometry = function( divisions ) {

	var pts = this.getSpacedPoints( divisions, true );
	return this.createGeometry( pts );

};

THREE.CurvePath.prototype.createGeometry = function( points ) {

	var geometry = new THREE.Geometry();

	for ( var i = 0; i < points.length; i ++ ) {

		geometry.vertices.push( new THREE.Vector3( points[ i ].x, points[ i ].y, 0 ) );

	}

	return geometry;

};


/**************************************************************
 *	Bend / Wrap Helper Methods
 **************************************************************/

// Wrap path / Bend modifiers?

THREE.CurvePath.prototype.addWrapPath = function ( bendpath ) {

	this.bends.push( bendpath );

};

THREE.CurvePath.prototype.getTransformedPoints = function( segments, bends ) {

	var oldPts = this.getPoints( segments ); // getPoints getSpacedPoints
	var i, il;

	if ( !bends ) {

		bends = this.bends;

	}

	for ( i = 0, il = bends.length; i < il; i ++ ) {

		oldPts = this.getWrapPoints( oldPts, bends[ i ] );

	}

	return oldPts;

};

THREE.CurvePath.prototype.getTransformedSpacedPoints = function( segments, bends ) {

	var oldPts = this.getSpacedPoints( segments );

	var i, il;

	if ( !bends ) {

		bends = this.bends;

	}

	for ( i = 0, il = bends.length; i < il; i ++ ) {

		oldPts = this.getWrapPoints( oldPts, bends[ i ] );

	}

	return oldPts;

};

// This returns getPoints() bend/wrapped around the contour of a path.
// Read http://www.planetclegg.com/projects/WarpingTextToSplines.html

THREE.CurvePath.prototype.getWrapPoints = function ( oldPts, path ) {

	var bounds = this.getBoundingBox();

	var i, il, p, oldX, oldY, xNorm;

	for ( i = 0, il = oldPts.length; i < il; i ++ ) {

		p = oldPts[ i ];

		oldX = p.x;
		oldY = p.y;

		xNorm = oldX / bounds.maxX;

		// If using actual distance, for length > path, requires line extrusions
		//xNorm = path.getUtoTmapping(xNorm, oldX); // 3 styles. 1) wrap stretched. 2) wrap stretch by arc length 3) warp by actual distance

		xNorm = path.getUtoTmapping( xNorm, oldX );

		// check for out of bounds?

		var pathPt = path.getPoint( xNorm );
		var normal = path.getNormalVector( xNorm ).multiplyScalar( oldY );

		p.x = pathPt.x + normal.x;
		p.y = pathPt.y + normal.y;

	}

	return oldPts;

};

/**
 * https://github.com/mrdoob/eventtarget.js/
 */

THREE.EventTarget = function () {

	var listeners = {};

	this.addEventListener = function ( type, listener ) {

		if ( listeners[ type ] == undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	};

	this.dispatchEvent = function ( event ) {

		for ( var listener in listeners[ event.type ] ) {

			listeners[ event.type ][ listener ]( event );

		}

	};

	this.removeEventListener = function ( type, listener ) {

		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	};

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Gyroscope = function () {

	THREE.Object3D.call( this );

};


THREE.Gyroscope.prototype = new THREE.Object3D();
THREE.Gyroscope.prototype.constructor = THREE.Gyroscope;

THREE.Gyroscope.prototype.updateMatrixWorld = function ( force ) {

	this.matrixAutoUpdate && this.updateMatrix();

	// update matrixWorld

	if ( this.matrixWorldNeedsUpdate || force ) {

		if ( this.parent ) {

			this.matrixWorld.multiply( this.parent.matrixWorld, this.matrix );

			this.matrixWorld.decompose( this.translationWorld, this.rotationWorld, this.scaleWorld );
			this.matrix.decompose( this.translationObject, this.rotationObject, this.scaleObject );

			this.matrixWorld.compose( this.translationWorld, this.rotationObject, this.scaleWorld );


		} else {

			this.matrixWorld.copy( this.matrix );

		}


		this.matrixWorldNeedsUpdate = false;

		force = true;

	}

	// update children

	for ( var i = 0, l = this.children.length; i < l; i ++ ) {

		this.children[ i ].updateMatrixWorld( force );

	}

};

THREE.Gyroscope.prototype.translationWorld = new THREE.Vector3();
THREE.Gyroscope.prototype.translationObject = new THREE.Vector3();
THREE.Gyroscope.prototype.rotationWorld = new THREE.Quaternion();
THREE.Gyroscope.prototype.rotationObject = new THREE.Quaternion();
THREE.Gyroscope.prototype.scaleWorld = new THREE.Vector3();
THREE.Gyroscope.prototype.scaleObject = new THREE.Vector3();

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 *
 **/

THREE.Path = function ( points ) {

	THREE.CurvePath.call(this);

	this.actions = [];

	if ( points ) {

		this.fromPoints( points );

	}

};

THREE.Path.prototype = new THREE.CurvePath();
THREE.Path.prototype.constructor = THREE.Path;


THREE.PathActions = {

	MOVE_TO: 'moveTo',
	LINE_TO: 'lineTo',
	QUADRATIC_CURVE_TO: 'quadraticCurveTo', // Bezier quadratic curve
	BEZIER_CURVE_TO: 'bezierCurveTo', 		// Bezier cubic curve
	CSPLINE_THRU: 'splineThru',				// Catmull-rom spline
	ARC: 'arc'								// Circle

};

// TODO Clean up PATH API

// Create path using straight lines to connect all points
// - vectors: array of Vector2

THREE.Path.prototype.fromPoints = function ( vectors ) {

	this.moveTo( vectors[ 0 ].x, vectors[ 0 ].y );

	for ( var v = 1, vlen = vectors.length; v < vlen; v ++ ) {

		this.lineTo( vectors[ v ].x, vectors[ v ].y );

	};

};

// startPath() endPath()?

THREE.Path.prototype.moveTo = function ( x, y ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.MOVE_TO, args: args } );

};

THREE.Path.prototype.lineTo = function ( x, y ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.LineCurve( new THREE.Vector2( x0, y0 ), new THREE.Vector2( x, y ) );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.LINE_TO, args: args } );

};

THREE.Path.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.QuadraticBezierCurve( new THREE.Vector2( x0, y0 ),
												new THREE.Vector2( aCPx, aCPy ),
												new THREE.Vector2( aX, aY ) );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.QUADRATIC_CURVE_TO, args: args } );

};

THREE.Path.prototype.bezierCurveTo = function( aCP1x, aCP1y,
                                               aCP2x, aCP2y,
                                               aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.CubicBezierCurve( new THREE.Vector2( x0, y0 ),
											new THREE.Vector2( aCP1x, aCP1y ),
											new THREE.Vector2( aCP2x, aCP2y ),
											new THREE.Vector2( aX, aY ) );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.BEZIER_CURVE_TO, args: args } );

};

THREE.Path.prototype.splineThru = function( pts /*Array of Vector*/ ) {

	var args = Array.prototype.slice.call( arguments );
	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];
//---
	var npts = [ new THREE.Vector2( x0, y0 ) ];
	Array.prototype.push.apply( npts, pts );

	var curve = new THREE.SplineCurve( npts );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.CSPLINE_THRU, args: args } );

};

// FUTURE: Change the API or follow canvas API?
// TODO ARC ( x, y, x - radius, y - radius, startAngle, endAngle )

THREE.Path.prototype.arc = function ( aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var args = Array.prototype.slice.call( arguments );

	var laste = this.actions[ this.actions.length - 1];

	var curve = new THREE.ArcCurve( laste.x + aX, laste.y + aY, aRadius,
									aStartAngle, aEndAngle, aClockwise );
	this.curves.push( curve );

	// All of the other actions look to the last two elements in the list to
	// find the ending point, so we need to append them.
	var lastPoint = curve.getPoint(aClockwise ? 1 : 0);
	args.push(lastPoint.x);
	args.push(lastPoint.y);

	this.actions.push( { action: THREE.PathActions.ARC, args: args } );

 };

THREE.Path.prototype.absarc = function ( aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var args = Array.prototype.slice.call( arguments );

	var curve = new THREE.ArcCurve( aX, aY, aRadius,
									aStartAngle, aEndAngle, aClockwise );
	this.curves.push( curve );

	// console.log( 'arc', args );

        // All of the other actions look to the last two elements in the list to
        // find the ending point, so we need to append them.
        var lastPoint = curve.getPoint(aClockwise ? 1 : 0);
        args.push(lastPoint.x);
        args.push(lastPoint.y);

	this.actions.push( { action: THREE.PathActions.ARC, args: args } );

 };


THREE.Path.prototype.getSpacedPoints = function ( divisions, closedPath ) {

	if ( ! divisions ) divisions = 40;

	var points = [];

	for ( var i = 0; i < divisions; i ++ ) {

		points.push( this.getPoint( i / divisions ) );

		//if( !this.getPoint( i / divisions ) ) throw "DIE";

	}

	// if ( closedPath ) {
	//
	// 	points.push( points[ 0 ] );
	//
	// }

	return points;

};

/* Return an array of vectors based on contour of the path */

THREE.Path.prototype.getPoints = function( divisions, closedPath ) {

	if (this.useSpacedPoints) {
		console.log('tata');
		return this.getSpacedPoints( divisions, closedPath );
	}

	divisions = divisions || 12;

	var points = [];

	var i, il, item, action, args;
	var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
		laste, j,
		t, tx, ty;

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		action = item.action;
		args = item.args;

		switch( action ) {

		case THREE.PathActions.MOVE_TO:

			points.push( new THREE.Vector2( args[ 0 ], args[ 1 ] ) );

			break;

		case THREE.PathActions.LINE_TO:

			points.push( new THREE.Vector2( args[ 0 ], args[ 1 ] ) );

			break;

		case THREE.PathActions.QUADRATIC_CURVE_TO:

			cpx  = args[ 2 ];
			cpy  = args[ 3 ];

			cpx1 = args[ 0 ];
			cpy1 = args[ 1 ];

			if ( points.length > 0 ) {

				laste = points[ points.length - 1 ];

				cpx0 = laste.x;
				cpy0 = laste.y;

			} else {

				laste = this.actions[ i - 1 ].args;

				cpx0 = laste[ laste.length - 2 ];
				cpy0 = laste[ laste.length - 1 ];

			}

			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = THREE.Shape.Utils.b2( t, cpx0, cpx1, cpx );
				ty = THREE.Shape.Utils.b2( t, cpy0, cpy1, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

		  	}

			break;

		case THREE.PathActions.BEZIER_CURVE_TO:

			cpx  = args[ 4 ];
			cpy  = args[ 5 ];

			cpx1 = args[ 0 ];
			cpy1 = args[ 1 ];

			cpx2 = args[ 2 ];
			cpy2 = args[ 3 ];

			if ( points.length > 0 ) {

				laste = points[ points.length - 1 ];

				cpx0 = laste.x;
				cpy0 = laste.y;

			} else {

				laste = this.actions[ i - 1 ].args;

				cpx0 = laste[ laste.length - 2 ];
				cpy0 = laste[ laste.length - 1 ];

			}


			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = THREE.Shape.Utils.b3( t, cpx0, cpx1, cpx2, cpx );
				ty = THREE.Shape.Utils.b3( t, cpy0, cpy1, cpy2, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

			}

			break;

		case THREE.PathActions.CSPLINE_THRU:

			laste = this.actions[ i - 1 ].args;

			var last = new THREE.Vector2( laste[ laste.length - 2 ], laste[ laste.length - 1 ] );
			var spts = [ last ];

			var n = divisions * args[ 0 ].length;

			spts = spts.concat( args[ 0 ] );

			var spline = new THREE.SplineCurve( spts );

			for ( j = 1; j <= n; j ++ ) {

				points.push( spline.getPointAt( j / n ) ) ;

			}

			break;

		case THREE.PathActions.ARC:

			laste = this.actions[ i - 1 ].args;

			var aX = args[ 0 ], aY = args[ 1 ],
				aRadius = args[ 2 ],
				aStartAngle = args[ 3 ], aEndAngle = args[ 4 ],
				aClockwise = !!args[ 5 ];


			var deltaAngle = aEndAngle - aStartAngle;
			var angle;
			var tdivisions = divisions * 2;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + aRadius * Math.cos( angle );
				ty = aY + aRadius * Math.sin( angle );

				//console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);

				points.push( new THREE.Vector2( tx, ty ) );

			}

			//console.log(points);

		  break;

		} // end switch

	}



	// Normalize to remove the closing point by default.
	var lastPoint = points[ points.length - 1];
	var EPSILON = 0.0000000001;
	if ( Math.abs(lastPoint.x - points[ 0 ].x) < EPSILON &&
             Math.abs(lastPoint.y - points[ 0 ].y) < EPSILON)
		points.splice( points.length - 1, 1);
	if ( closedPath ) {

		points.push( points[ 0 ] );

	}

	return points;

};



// This was used for testing purposes. Should be removed soon.

THREE.Path.prototype.transform = function( path, segments ) {

	var bounds = this.getBoundingBox();
	var oldPts = this.getPoints( segments ); // getPoints getSpacedPoints

	//console.log( path.cacheArcLengths() );
	//path.getLengths(400);
	//segments = 40;

	return this.getWrapPoints( oldPts, path );

};

// Read http://www.tinaja.com/glib/nonlingr.pdf
// nonlinear transforms

THREE.Path.prototype.nltransform = function( a, b, c, d, e, f ) {

	// a - horizontal size
	// b - lean
	// c - x offset
	// d - vertical size
	// e - climb
	// f - y offset

	var oldPts = this.getPoints();

	var i, il, p, oldX, oldY;

	for ( i = 0, il = oldPts.length; i < il; i ++ ) {

		p = oldPts[i];

		oldX = p.x;
		oldY = p.y;

		p.x = a * oldX + b * oldY + c;
		p.y = d * oldY + e * oldX + f;

	}

	return oldPts;

};


// FUTURE Export JSON Format

/* Draws this path onto a 2d canvas easily */

THREE.Path.prototype.debug = function( canvas ) {

	var bounds = this.getBoundingBox();

	if ( !canvas ) {

		canvas = document.createElement( "canvas" );

		canvas.setAttribute( 'width',  bounds.maxX + 100 );
		canvas.setAttribute( 'height', bounds.maxY + 100 );

		document.body.appendChild( canvas );

	}

	var ctx = canvas.getContext( "2d" );
	ctx.fillStyle = "white";
	ctx.fillRect( 0, 0, canvas.width, canvas.height );

	ctx.strokeStyle = "black";
	ctx.beginPath();

	var i, il, item, action, args;

	// Debug Path

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		args = item.args;
		action = item.action;

		// Short hand for now

		if ( action != THREE.PathActions.CSPLINE_THRU ) {

			ctx[ action ].apply( ctx, args );

		}

		/*
		switch ( action ) {

			case THREE.PathActions.MOVE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ] );
				break;

			case THREE.PathActions.LINE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ] );
				break;

			case THREE.PathActions.QUADRATIC_CURVE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ] );
				break;

			case THREE.PathActions.CUBIC_CURVE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ], args[ 5 ] );
				break;

		}
		*/

	}

	ctx.stroke();
	ctx.closePath();

	// Debug Points

	ctx.strokeStyle = "red";

	/* TO CLEAN UP */

	var p, points = this.getPoints();

	for ( i = 0, il = points.length; i < il; i ++ ) {

		p = points[ i ];

		ctx.beginPath();
		ctx.arc( p.x, p.y, 1.5, 0, Math.PI * 2, false );
		ctx.stroke();
		ctx.closePath();

	}

};

// Breaks path into shapes

THREE.Path.prototype.toShapes = function() {

	var i, il, item, action, args;

	var subPaths = [], lastPath = new THREE.Path();

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		args = item.args;
		action = item.action;

		if ( action == THREE.PathActions.MOVE_TO ) {

			if ( lastPath.actions.length != 0 ) {

				subPaths.push( lastPath );
				lastPath = new THREE.Path();

			}

		}

		lastPath[ action ].apply( lastPath, args );

	}

	if ( lastPath.actions.length != 0 ) {

		subPaths.push( lastPath );

	}

	// console.log(subPaths);

	if ( subPaths.length == 0 ) return [];

	var tmpPath, tmpShape, shapes = [];

	var holesFirst = !THREE.Shape.Utils.isClockWise( subPaths[ 0 ].getPoints() );
	// console.log("Holes first", holesFirst);

	if ( subPaths.length == 1) {
		tmpPath = subPaths[0];
		tmpShape = new THREE.Shape();
		tmpShape.actions = tmpPath.actions;
		tmpShape.curves = tmpPath.curves;
		shapes.push( tmpShape );
		return shapes;
	};

	if ( holesFirst ) {

		tmpShape = new THREE.Shape();

		for ( i = 0, il = subPaths.length; i < il; i ++ ) {

			tmpPath = subPaths[ i ];

			if ( THREE.Shape.Utils.isClockWise( tmpPath.getPoints() ) ) {

				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;

				shapes.push( tmpShape );
				tmpShape = new THREE.Shape();

				//console.log('cw', i);

			} else {

				tmpShape.holes.push( tmpPath );

				//console.log('ccw', i);

			}

		}

	} else {

		// Shapes first

		for ( i = 0, il = subPaths.length; i < il; i ++ ) {

			tmpPath = subPaths[ i ];

			if ( THREE.Shape.Utils.isClockWise( tmpPath.getPoints() ) ) {


				if ( tmpShape ) shapes.push( tmpShape );

				tmpShape = new THREE.Shape();
				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;

			} else {

				tmpShape.holes.push( tmpPath );

			}

		}

		shapes.push( tmpShape );

	}

	//console.log("shape", shapes);

	return shapes;

};
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Defines a 2d shape plane using paths.
 **/

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 ExtrudeGeometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate each shape, add faces.

THREE.Shape = function ( ) {

	THREE.Path.apply( this, arguments );
	this.holes = [];

};

THREE.Shape.prototype = new THREE.Path();
THREE.Shape.prototype.constructor = THREE.Path;

// Convenience method to return ExtrudeGeometry

THREE.Shape.prototype.extrude = function ( options ) {

	var extruded = new THREE.ExtrudeGeometry( this, options );
	return extruded;

};

// Get points of holes

THREE.Shape.prototype.getPointsHoles = function ( divisions ) {

	var i, il = this.holes.length, holesPts = [];

	for ( i = 0; i < il; i ++ ) {

		holesPts[ i ] = this.holes[ i ].getTransformedPoints( divisions, this.bends );

	}

	return holesPts;

};

// Get points of holes (spaced by regular distance)

THREE.Shape.prototype.getSpacedPointsHoles = function ( divisions ) {

	var i, il = this.holes.length, holesPts = [];

	for ( i = 0; i < il; i ++ ) {

		holesPts[ i ] = this.holes[ i ].getTransformedSpacedPoints( divisions, this.bends );

	}

	return holesPts;

};


// Get points of shape and holes (keypoints based on segments parameter)

THREE.Shape.prototype.extractAllPoints = function ( divisions ) {

	return {

		shape: this.getTransformedPoints( divisions ),
		holes: this.getPointsHoles( divisions )

	};

};

THREE.Shape.prototype.extractPoints = function ( divisions ) {

	if (this.useSpacedPoints) {
		return this.extractAllSpacedPoints(divisions);
	}

	return this.extractAllPoints(divisions);

};

//
// THREE.Shape.prototype.extractAllPointsWithBend = function ( divisions, bend ) {
//
// 	return {
//
// 		shape: this.transform( bend, divisions ),
// 		holes: this.getPointsHoles( divisions, bend )
//
// 	};
//
// };

// Get points of shape and holes (spaced by regular distance)

THREE.Shape.prototype.extractAllSpacedPoints = function ( divisions ) {

	return {

		shape: this.getTransformedSpacedPoints( divisions ),
		holes: this.getSpacedPointsHoles( divisions )

	};

};

/**************************************************************
 *	Utils
 **************************************************************/

THREE.Shape.Utils = {

	/*
		contour - array of vector2 for contour
		holes   - array of array of vector2
	*/

	removeHoles: function ( contour, holes ) {

		var shape = contour.concat(); // work on this shape
		var allpoints = shape.concat();

		/* For each isolated shape, find the closest points and break to the hole to allow triangulation */


		var prevShapeVert, nextShapeVert,
			prevHoleVert, nextHoleVert,
			holeIndex, shapeIndex,
			shapeId, shapeGroup,
			h, h2,
			hole, shortest, d,
			p, pts1, pts2,
			tmpShape1, tmpShape2,
			tmpHole1, tmpHole2,
			verts = [];

		for ( h = 0; h < holes.length; h ++ ) {

			hole = holes[ h ];

			/*
			shapeholes[ h ].concat(); // preserves original
			holes.push( hole );
			*/

			Array.prototype.push.apply( allpoints, hole );

			shortest = Number.POSITIVE_INFINITY;


			// Find the shortest pair of pts between shape and hole

			// Note: Actually, I'm not sure now if we could optimize this to be faster than O(m*n)
			// Using distanceToSquared() intead of distanceTo() should speed a little
			// since running square roots operations are reduced.

			for ( h2 = 0; h2 < hole.length; h2 ++ ) {

				pts1 = hole[ h2 ];
				var dist = [];

				for ( p = 0; p < shape.length; p++ ) {

					pts2 = shape[ p ];
					d = pts1.distanceToSquared( pts2 );
					dist.push( d );

					if ( d < shortest ) {

						shortest = d;
						holeIndex = h2;
						shapeIndex = p;

					}

				}

			}

			//console.log("shortest", shortest, dist);

			prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
			prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;

			var areaapts = [

				hole[ holeIndex ],
				shape[ shapeIndex ],
				shape[ prevShapeVert ]

			];

			var areaa = THREE.FontUtils.Triangulate.area( areaapts );

			var areabpts = [

				hole[ holeIndex ],
				hole[ prevHoleVert ],
				shape[ shapeIndex ]

			];

			var areab = THREE.FontUtils.Triangulate.area( areabpts );

			var shapeOffset = 1;
			var holeOffset = -1;

			var oldShapeIndex = shapeIndex, oldHoleIndex = holeIndex;
			shapeIndex += shapeOffset;
			holeIndex += holeOffset;

			if ( shapeIndex < 0 ) { shapeIndex += shape.length;  }
			shapeIndex %= shape.length;

			if ( holeIndex < 0 ) { holeIndex += hole.length;  }
			holeIndex %= hole.length;

			prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
			prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;

			areaapts = [

				hole[ holeIndex ],
				shape[ shapeIndex ],
				shape[ prevShapeVert ]

			];

			var areaa2 = THREE.FontUtils.Triangulate.area( areaapts );

			areabpts = [

				hole[ holeIndex ],
				hole[ prevHoleVert ],
				shape[ shapeIndex ]

			];

			var areab2 = THREE.FontUtils.Triangulate.area( areabpts );
			//console.log(areaa,areab ,areaa2,areab2, ( areaa + areab ),  ( areaa2 + areab2 ));

			if ( ( areaa + areab ) > ( areaa2 + areab2 ) ) {

				// In case areas are not correct.
				//console.log("USE THIS");

				shapeIndex = oldShapeIndex;
				holeIndex = oldHoleIndex ;

				if ( shapeIndex < 0 ) { shapeIndex += shape.length;  }
				shapeIndex %= shape.length;

				if ( holeIndex < 0 ) { holeIndex += hole.length;  }
				holeIndex %= hole.length;

				prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
				prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;

			} else {

				//console.log("USE THAT ")

			}

			tmpShape1 = shape.slice( 0, shapeIndex );
			tmpShape2 = shape.slice( shapeIndex );
			tmpHole1 = hole.slice( holeIndex );
			tmpHole2 = hole.slice( 0, holeIndex );

			// Should check orders here again?

			var trianglea = [

				hole[ holeIndex ],
				shape[ shapeIndex ],
				shape[ prevShapeVert ]

			];

			var triangleb = [

				hole[ holeIndex ] ,
				hole[ prevHoleVert ],
				shape[ shapeIndex ]

			];

			verts.push( trianglea );
			verts.push( triangleb );

			shape = tmpShape1.concat( tmpHole1 ).concat( tmpHole2 ).concat( tmpShape2 );

		}

		return {

			shape:shape, 		/* shape with no holes */
			isolatedPts: verts, /* isolated faces */
			allpoints: allpoints

		}


	},

	triangulateShape: function ( contour, holes ) {

		var shapeWithoutHoles = THREE.Shape.Utils.removeHoles( contour, holes );

		var shape = shapeWithoutHoles.shape,
			allpoints = shapeWithoutHoles.allpoints,
			isolatedPts = shapeWithoutHoles.isolatedPts;

		var triangles = THREE.FontUtils.Triangulate( shape, false ); // True returns indices for points of spooled shape

		// To maintain reference to old shape, one must match coordinates, or offset the indices from original arrays. It's probably easier to do the first.

		//console.log( "triangles",triangles, triangles.length );
		//console.log( "allpoints",allpoints, allpoints.length );

		var i, il, f, face,
			key, index,
			allPointsMap = {},
			isolatedPointsMap = {};

		// prepare all points map

		for ( i = 0, il = allpoints.length; i < il; i ++ ) {

			key = allpoints[ i ].x + ":" + allpoints[ i ].y;

			if ( allPointsMap[ key ] !== undefined ) {

				console.log( "Duplicate point", key );

			}

			allPointsMap[ key ] = i;

		}

		// check all face vertices against all points map

		for ( i = 0, il = triangles.length; i < il; i ++ ) {

			face = triangles[ i ];

			for ( f = 0; f < 3; f ++ ) {

				key = face[ f ].x + ":" + face[ f ].y;

				index = allPointsMap[ key ];

				if ( index !== undefined ) {

					face[ f ] = index;

				}

			}

		}

		// check isolated points vertices against all points map

		for ( i = 0, il = isolatedPts.length; i < il; i ++ ) {

			face = isolatedPts[ i ];

			for ( f = 0; f < 3; f ++ ) {

				key = face[ f ].x + ":" + face[ f ].y;

				index = allPointsMap[ key ];

				if ( index !== undefined ) {

					face[ f ] = index;

				}

			}

		}

		return triangles.concat( isolatedPts );

	}, // end triangulate shapes

	/*
	triangulate2 : function( pts, holes ) {

		// For use with Poly2Tri.js

		var allpts = pts.concat();
		var shape = [];
		for (var p in pts) {
			shape.push(new js.poly2tri.Point(pts[p].x, pts[p].y));
		}

		var swctx = new js.poly2tri.SweepContext(shape);

		for (var h in holes) {
			var aHole = holes[h];
			var newHole = []
			for (i in aHole) {
				newHole.push(new js.poly2tri.Point(aHole[i].x, aHole[i].y));
				allpts.push(aHole[i]);
			}
			swctx.AddHole(newHole);
		}

		var find;
		var findIndexForPt = function (pt) {
			find = new THREE.Vector2(pt.x, pt.y);
			var p;
			for (p=0, pl = allpts.length; p<pl; p++) {
				if (allpts[p].equals(find)) return p;
			}
			return -1;
		};

		// triangulate
		js.poly2tri.sweep.Triangulate(swctx);

		var triangles =  swctx.GetTriangles();
		var tr ;
		var facesPts = [];
		for (var t in triangles) {
			tr =  triangles[t];
			facesPts.push([
				findIndexForPt(tr.GetPoint(0)),
				findIndexForPt(tr.GetPoint(1)),
				findIndexForPt(tr.GetPoint(2))
					]);
		}


	//	console.log(facesPts);
	//	console.log("triangles", triangles.length, triangles);

		// Returns array of faces with 3 element each
	return facesPts;
	},
*/

	isClockWise: function ( pts ) {

		return THREE.FontUtils.Triangulate.area( pts ) < 0;

	},

	// Bezier Curves formulas obtained from
	// http://en.wikipedia.org/wiki/B%C3%A9zier_curve

	// Quad Bezier Functions

	b2p0: function ( t, p ) {

		var k = 1 - t;
		return k * k * p;

	},

	b2p1: function ( t, p ) {

		return 2 * ( 1 - t ) * t * p;

	},

	b2p2: function ( t, p ) {

		return t * t * p;

	},

	b2: function ( t, p0, p1, p2 ) {

		return this.b2p0( t, p0 ) + this.b2p1( t, p1 ) + this.b2p2( t, p2 );

	},

	// Cubic Bezier Functions

	b3p0: function ( t, p ) {

		var k = 1 - t;
		return k * k * k * p;

	},

	b3p1: function ( t, p ) {

		var k = 1 - t;
		return 3 * k * k * t * p;

	},

	b3p2: function ( t, p ) {

		var k = 1 - t;
		return 3 * k * t * t * p;

	},

	b3p3: function ( t, p ) {

		return t * t * t * p;

	},

	b3: function ( t, p0, p1, p2, p3 ) {

		return this.b3p0( t, p0 ) + this.b3p1( t, p1 ) + this.b3p2( t, p2 ) +  this.b3p3( t, p3 );

	}

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * TextPath
 *
 **/

THREE.TextPath = function ( text, parameters ) {

	THREE.Path.call( this );

	this.parameters = parameters || {};

	this.set( text );

};

THREE.TextPath.prototype.set = function ( text, parameters ) {

	parameters = parameters || this.parameters;

	this.text = text;

	var size = parameters.size !== undefined ? parameters.size : 100;
	var curveSegments = parameters.curveSegments !== undefined ? parameters.curveSegments: 4;

	var font = parameters.font !== undefined ? parameters.font : "helvetiker";
	var weight = parameters.weight !== undefined ? parameters.weight : "normal";
	var style = parameters.style !== undefined ? parameters.style : "normal";

	THREE.FontUtils.size = size;
	THREE.FontUtils.divisions = curveSegments;

	THREE.FontUtils.face = font;
	THREE.FontUtils.weight = weight;
	THREE.FontUtils.style = style;

};



THREE.TextPath.prototype.toShapes = function () {

	// Get a Font data json object

	var data = THREE.FontUtils.drawText( this.text );

	var paths = data.paths;
	var shapes = [];

	for ( var p = 0, pl = paths.length; p < pl; p ++ ) {

		Array.prototype.push.apply( shapes, paths[ p ].toShapes() );

	}

	return shapes;

	//console.log(path);
	//console.log(fontShapes);

	// Either find actions or curves.

	//var text3d = new THREE.ExtrudeGeometry( shapes , { amount: 20, bevelEnabled:true, bevelThickness:3	} );

	//return text3d;

};
/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.AnimationHandler = (function() {

	var playing = [];
	var library = {};
	var that    = {};


	//--- update ---

	that.update = function( deltaTimeMS ) {

		for( var i = 0; i < playing.length; i++ )
			playing[ i ].update( deltaTimeMS );

	};


	//--- add ---

	that.addToUpdate = function( animation ) {

		if( playing.indexOf( animation ) === -1 )
			playing.push( animation );

	};


	//--- remove ---

	that.removeFromUpdate = function( animation ) {

		var index = playing.indexOf( animation );

		if( index !== -1 )
			playing.splice( index, 1 );

	};


	//--- add ---

	that.add = function( data ) {

		if( library[ data.name ] !== undefined )
			console.log( "THREE.AnimationHandler.add: Warning! " + data.name + " already exists in library. Overwriting." );

		library[ data.name ] = data;
		initData( data );

	};


	//--- get ---

	that.get = function( name ) {

		if( typeof name === "string" ) {

			if( library[ name ] ) {

				return library[ name ];

			} else {

				console.log( "THREE.AnimationHandler.get: Couldn't find animation " + name );
				return null;

			}

		} else {

			// todo: add simple tween library

		}

	};

	//--- parse ---

	that.parse = function( root ) {

		// setup hierarchy

		var hierarchy = [];

		if ( root instanceof THREE.SkinnedMesh ) {

			for( var b = 0; b < root.bones.length; b++ ) {

				hierarchy.push( root.bones[ b ] );

			}

		} else {

			parseRecurseHierarchy( root, hierarchy );

		}

		return hierarchy;

	};

	var parseRecurseHierarchy = function( root, hierarchy ) {

		hierarchy.push( root );

		for( var c = 0; c < root.children.length; c++ )
			parseRecurseHierarchy( root.children[ c ], hierarchy );

	}


	//--- init data ---

	var initData = function( data ) {

		if( data.initialized === true )
			return;


		// loop through all keys

		for( var h = 0; h < data.hierarchy.length; h ++ ) {

			for( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				// remove minus times

				if( data.hierarchy[ h ].keys[ k ].time < 0 )
					data.hierarchy[ h ].keys[ k ].time = 0;


				// create quaternions

				if( data.hierarchy[ h ].keys[ k ].rot !== undefined &&
				 !( data.hierarchy[ h ].keys[ k ].rot instanceof THREE.Quaternion ) ) {

					var quat = data.hierarchy[ h ].keys[ k ].rot;
					data.hierarchy[ h ].keys[ k ].rot = new THREE.Quaternion( quat[0], quat[1], quat[2], quat[3] );

				}
			}


			// prepare morph target keys

			if( data.hierarchy[h].keys.length && data.hierarchy[ h ].keys[ 0 ].morphTargets !== undefined ) {

				// get all used

				var usedMorphTargets = {};

				for( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					for( var m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

						var morphTargetName = data.hierarchy[ h ].keys[ k ].morphTargets[ m ];
						usedMorphTargets[ morphTargetName ] = -1;

					}

				}

				data.hierarchy[ h ].usedMorphTargets = usedMorphTargets;


				// set all used on all frames

				for( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					var influences = {};

					for( var morphTargetName in usedMorphTargets ) {

						for( var m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

							if( data.hierarchy[ h ].keys[ k ].morphTargets[ m ] === morphTargetName ) {

								influences[ morphTargetName ] = data.hierarchy[ h ].keys[ k ].morphTargetsInfluences[ m ];
								break;

							}

						}

						if( m === data.hierarchy[ h ].keys[ k ].morphTargets.length ) {

							influences[ morphTargetName ] = 0;

						}

					}

					data.hierarchy[ h ].keys[ k ].morphTargetsInfluences = influences;

				}

			}


			// remove all keys that are on the same time

			for( var k = 1; k < data.hierarchy[ h ].keys.length; k ++ ) {

				if( data.hierarchy[ h ].keys[ k ].time === data.hierarchy[ h ].keys[ k - 1 ].time ) {

					data.hierarchy[ h ].keys.splice( k, 1 );
					k --;

				}

			}


			// set index

			for( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				data.hierarchy[ h ].keys[ k ].index = k;

			}

		}


		// JIT

		var lengthInFrames = parseInt( data.length * data.fps, 10 );

		data.JIT = {};
		data.JIT.hierarchy = [];

		for( var h = 0; h < data.hierarchy.length; h ++ )
			data.JIT.hierarchy.push( new Array( lengthInFrames ) );


		// done

		data.initialized = true;

	};


	// interpolation types

	that.LINEAR = 0;
	that.CATMULLROM = 1;
	that.CATMULLROM_FORWARD = 2;

	return that;

}());
/**
 * @author mikael emtinger / http://gomo.se/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Animation = function( root, data, interpolationType, JITCompile ) {

	this.root = root;
	this.data = THREE.AnimationHandler.get( data );
	this.hierarchy = THREE.AnimationHandler.parse( root );
	this.currentTime = 0;
	this.timeScale = 1;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;
	this.interpolationType = interpolationType !== undefined ? interpolationType : THREE.AnimationHandler.LINEAR;
	this.JITCompile = JITCompile !== undefined ? JITCompile : true;

	this.points = [];
	this.target = new THREE.Vector3();

};

// Play

THREE.Animation.prototype.play = function( loop, startTimeMS ) {

	if( !this.isPlaying ) {

		this.isPlaying = true;
		this.loop = loop !== undefined ? loop : true;
		this.currentTime = startTimeMS !== undefined ? startTimeMS : 0;


		// reset key cache

		var h, hl = this.hierarchy.length,
			object;

		for ( h = 0; h < hl; h++ ) {

			object = this.hierarchy[ h ];

			if ( this.interpolationType !== THREE.AnimationHandler.CATMULLROM_FORWARD ) {

				object.useQuaternion = true;

			}

			object.matrixAutoUpdate = true;

			if ( object.animationCache === undefined ) {

				object.animationCache = {};
				object.animationCache.prevKey = { pos: 0, rot: 0, scl: 0 };
				object.animationCache.nextKey = { pos: 0, rot: 0, scl: 0 };
				object.animationCache.originalMatrix = object instanceof THREE.Bone ? object.skinMatrix : object.matrix;

			}

			var prevKey = object.animationCache.prevKey;
			var nextKey = object.animationCache.nextKey;

			prevKey.pos = this.data.hierarchy[ h ].keys[ 0 ];
			prevKey.rot = this.data.hierarchy[ h ].keys[ 0 ];
			prevKey.scl = this.data.hierarchy[ h ].keys[ 0 ];

			nextKey.pos = this.getNextKeyWith( "pos", h, 1 );
			nextKey.rot = this.getNextKeyWith( "rot", h, 1 );
			nextKey.scl = this.getNextKeyWith( "scl", h, 1 );

		}

		this.update( 0 );

	}

	this.isPaused = false;

	THREE.AnimationHandler.addToUpdate( this );

};



// Pause

THREE.Animation.prototype.pause = function() {

	if( this.isPaused ) {

		THREE.AnimationHandler.addToUpdate( this );

	} else {

		THREE.AnimationHandler.removeFromUpdate( this );

	}

	this.isPaused = !this.isPaused;

};


// Stop

THREE.Animation.prototype.stop = function() {

	this.isPlaying = false;
	this.isPaused  = false;
	THREE.AnimationHandler.removeFromUpdate( this );


	// reset JIT matrix and remove cache

	for ( var h = 0; h < this.hierarchy.length; h++ ) {

		if ( this.hierarchy[ h ].animationCache !== undefined ) {

			if( this.hierarchy[ h ] instanceof THREE.Bone ) {

				this.hierarchy[ h ].skinMatrix = this.hierarchy[ h ].animationCache.originalMatrix;

			} else {

				this.hierarchy[ h ].matrix = this.hierarchy[ h ].animationCache.originalMatrix;

			}


			delete this.hierarchy[ h ].animationCache;

		}

	}

};


// Update

THREE.Animation.prototype.update = function( deltaTimeMS ) {

	// early out

	if( !this.isPlaying ) return;


	// vars

	var types = [ "pos", "rot", "scl" ];
	var type;
	var scale;
	var vector;
	var prevXYZ, nextXYZ;
	var prevKey, nextKey;
	var object;
	var animationCache;
	var frame;
	var JIThierarchy = this.data.JIT.hierarchy;
	var currentTime, unloopedCurrentTime;
	var currentPoint, forwardPoint, angle;


	// update

	this.currentTime += deltaTimeMS * this.timeScale;

	unloopedCurrentTime = this.currentTime;
	currentTime         = this.currentTime = this.currentTime % this.data.length;
	frame               = parseInt( Math.min( currentTime * this.data.fps, this.data.length * this.data.fps ), 10 );


	// update

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h++ ) {

		object = this.hierarchy[ h ];
		animationCache = object.animationCache;

		// use JIT?

		if ( this.JITCompile && JIThierarchy[ h ][ frame ] !== undefined ) {

			if( object instanceof THREE.Bone ) {

				object.skinMatrix = JIThierarchy[ h ][ frame ];

				object.matrixAutoUpdate = false;
				object.matrixWorldNeedsUpdate = false;

			} else {

				object.matrix = JIThierarchy[ h ][ frame ];

				object.matrixAutoUpdate = false;
				object.matrixWorldNeedsUpdate = true;

			}

		// use interpolation

		} else {

			// make sure so original matrix and not JIT matrix is set

			if ( this.JITCompile ) {

				if( object instanceof THREE.Bone ) {

					object.skinMatrix = object.animationCache.originalMatrix;

				} else {

					object.matrix = object.animationCache.originalMatrix;

				}

			}


			// loop through pos/rot/scl

			for ( var t = 0; t < 3; t++ ) {

				// get keys

				type    = types[ t ];
				prevKey = animationCache.prevKey[ type ];
				nextKey = animationCache.nextKey[ type ];

				// switch keys?

				if ( nextKey.time <= unloopedCurrentTime ) {

					// did we loop?

					if ( currentTime < unloopedCurrentTime ) {

						if ( this.loop ) {

							prevKey = this.data.hierarchy[ h ].keys[ 0 ];
							nextKey = this.getNextKeyWith( type, h, 1 );

							while( nextKey.time < currentTime ) {

								prevKey = nextKey;
								nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );

							}

						} else {

							this.stop();
							return;

						}

					} else {

						do {

							prevKey = nextKey;
							nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );

						} while( nextKey.time < currentTime )

					}

					animationCache.prevKey[ type ] = prevKey;
					animationCache.nextKey[ type ] = nextKey;

				}


				object.matrixAutoUpdate = true;
				object.matrixWorldNeedsUpdate = true;

				scale = ( currentTime - prevKey.time ) / ( nextKey.time - prevKey.time );
				prevXYZ = prevKey[ type ];
				nextXYZ = nextKey[ type ];


				// check scale error

				if ( scale < 0 || scale > 1 ) {

					console.log( "THREE.Animation.update: Warning! Scale out of bounds:" + scale + " on bone " + h );
					scale = scale < 0 ? 0 : 1;

				}

				// interpolate

				if ( type === "pos" ) {

					vector = object.position;

					if( this.interpolationType === THREE.AnimationHandler.LINEAR ) {

						vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
						vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
						vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

					} else if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
							    this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

						this.points[ 0 ] = this.getPrevKeyWith( "pos", h, prevKey.index - 1 )[ "pos" ];
						this.points[ 1 ] = prevXYZ;
						this.points[ 2 ] = nextXYZ;
						this.points[ 3 ] = this.getNextKeyWith( "pos", h, nextKey.index + 1 )[ "pos" ];

						scale = scale * 0.33 + 0.33;

						currentPoint = this.interpolateCatmullRom( this.points, scale );

						vector.x = currentPoint[ 0 ];
						vector.y = currentPoint[ 1 ];
						vector.z = currentPoint[ 2 ];

						if( this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

							forwardPoint = this.interpolateCatmullRom( this.points, scale * 1.01 );

							this.target.set( forwardPoint[ 0 ], forwardPoint[ 1 ], forwardPoint[ 2 ] );
							this.target.subSelf( vector );
							this.target.y = 0;
							this.target.normalize();

							angle = Math.atan2( this.target.x, this.target.z );
							object.rotation.set( 0, angle, 0 );

						}

					}

				} else if ( type === "rot" ) {

					THREE.Quaternion.slerp( prevXYZ, nextXYZ, object.quaternion, scale );

				} else if( type === "scl" ) {

					vector = object.scale;

					vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
					vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
					vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

				}

			}

		}

	}

	// update JIT?

	if ( this.JITCompile ) {

		if ( JIThierarchy[ 0 ][ frame ] === undefined ) {

			this.hierarchy[ 0 ].updateMatrixWorld( true );

			for ( var h = 0; h < this.hierarchy.length; h++ ) {

				if( this.hierarchy[ h ] instanceof THREE.Bone ) {

					JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].skinMatrix.clone();

				} else {

					JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].matrix.clone();

				}

			}

		}

	}

};

// Catmull-Rom spline

THREE.Animation.prototype.interpolateCatmullRom = function ( points, scale ) {

	var c = [], v3 = [],
	point, intPoint, weight, w2, w3,
	pa, pb, pc, pd;

	point = ( points.length - 1 ) * scale;
	intPoint = Math.floor( point );
	weight = point - intPoint;

	c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
	c[ 1 ] = intPoint;
	c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
	c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

	pa = points[ c[ 0 ] ];
	pb = points[ c[ 1 ] ];
	pc = points[ c[ 2 ] ];
	pd = points[ c[ 3 ] ];

	w2 = weight * weight;
	w3 = weight * w2;

	v3[ 0 ] = this.interpolate( pa[ 0 ], pb[ 0 ], pc[ 0 ], pd[ 0 ], weight, w2, w3 );
	v3[ 1 ] = this.interpolate( pa[ 1 ], pb[ 1 ], pc[ 1 ], pd[ 1 ], weight, w2, w3 );
	v3[ 2 ] = this.interpolate( pa[ 2 ], pb[ 2 ], pc[ 2 ], pd[ 2 ], weight, w2, w3 );

	return v3;

};

THREE.Animation.prototype.interpolate = function( p0, p1, p2, p3, t, t2, t3 ) {

	var v0 = ( p2 - p0 ) * 0.5,
		v1 = ( p3 - p1 ) * 0.5;

	return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;

};



// Get next key with

THREE.Animation.prototype.getNextKeyWith = function( type, h, key ) {

	var keys = this.data.hierarchy[ h ].keys;

	if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
		 this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

		key = key < keys.length - 1 ? key : keys.length - 1;

	} else {

		key = key % keys.length;

	}

	for ( ; key < keys.length; key++ ) {

		if ( keys[ key ][ type ] !== undefined ) {

			return keys[ key ];

		}

	}

	return this.data.hierarchy[ h ].keys[ 0 ];

};

// Get previous key with

THREE.Animation.prototype.getPrevKeyWith = function( type, h, key ) {

	var keys = this.data.hierarchy[ h ].keys;

	if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
		 this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

		key = key > 0 ? key : 0;

	} else {

		key = key >= 0 ? key : key + keys.length;

	}


	for ( ; key >= 0; key-- ) {

		if ( keys[ key ][ type ] !== undefined ) {

			return keys[ key ];

		}

	}

	return this.data.hierarchy[ h ].keys[ keys.length - 1 ];

};/**
 * @author mikael emtinger / http://gomo.se/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author khang duong
 * @author erik kitson
 */

THREE.KeyFrameAnimation = function( root, data, JITCompile ) {

	this.root = root;
	this.data = THREE.AnimationHandler.get( data );
	this.hierarchy = THREE.AnimationHandler.parse( root );
	this.currentTime = 0;
	this.timeScale = 0.001;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;
	this.JITCompile = JITCompile !== undefined ? JITCompile : true;

	// initialize to first keyframes

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h++ ) {

		var keys = this.data.hierarchy[h].keys,
			sids = this.data.hierarchy[h].sids,
			obj = this.hierarchy[h];

		if ( keys.length && sids ) {

			for ( var s = 0; s < sids.length; s++ ) {

				var sid = sids[ s ],
					next = this.getNextKeyWith( sid, h, 0 );

				if ( next ) {

					next.apply( sid );

				}

			}

			obj.matrixAutoUpdate = false;
			this.data.hierarchy[h].node.updateMatrix();
			obj.matrixWorldNeedsUpdate = true;

		}

	}

};

// Play

THREE.KeyFrameAnimation.prototype.play = function( loop, startTimeMS ) {

	if( !this.isPlaying ) {

		this.isPlaying = true;
		this.loop = loop !== undefined ? loop : true;
		this.currentTime = startTimeMS !== undefined ? startTimeMS : 0;
		this.startTimeMs = startTimeMS;
		this.startTime = 10000000;
		this.endTime = -this.startTime;


		// reset key cache

		var h, hl = this.hierarchy.length,
			object,
			node;

		for ( h = 0; h < hl; h++ ) {

			object = this.hierarchy[ h ];
			node = this.data.hierarchy[ h ];
			object.useQuaternion = true;

			if ( node.animationCache === undefined ) {

				node.animationCache = {};
				node.animationCache.prevKey = null;
				node.animationCache.nextKey = null;
				node.animationCache.originalMatrix = object instanceof THREE.Bone ? object.skinMatrix : object.matrix;

			}

			var keys = this.data.hierarchy[h].keys;

			if (keys.length) {

				node.animationCache.prevKey = keys[ 0 ];
				node.animationCache.nextKey = keys[ 1 ];

				this.startTime = Math.min( keys[0].time, this.startTime );
				this.endTime = Math.max( keys[keys.length - 1].time, this.endTime );

			}

		}

		this.update( 0 );

	}

	this.isPaused = false;

	THREE.AnimationHandler.addToUpdate( this );

};



// Pause

THREE.KeyFrameAnimation.prototype.pause = function() {

	if( this.isPaused ) {

		THREE.AnimationHandler.addToUpdate( this );

	} else {

		THREE.AnimationHandler.removeFromUpdate( this );

	}

	this.isPaused = !this.isPaused;

};


// Stop

THREE.KeyFrameAnimation.prototype.stop = function() {

	this.isPlaying = false;
	this.isPaused  = false;
	THREE.AnimationHandler.removeFromUpdate( this );


	// reset JIT matrix and remove cache

	for ( var h = 0; h < this.data.hierarchy.length; h++ ) {
        
        var obj = this.hierarchy[ h ];
		var node = this.data.hierarchy[ h ];

		if ( node.animationCache !== undefined ) {

			var original = node.animationCache.originalMatrix;

			if( obj instanceof THREE.Bone ) {

				original.copy( obj.skinMatrix );
				obj.skinMatrix = original;

			} else {

				original.copy( obj.matrix );
				obj.matrix = original;

			}

			delete node.animationCache;

		}

	}

};


// Update

THREE.KeyFrameAnimation.prototype.update = function( deltaTimeMS ) {

	// early out

	if( !this.isPlaying ) return;


	// vars

	var prevKey, nextKey;
	var object;
	var node;
	var frame;
	var JIThierarchy = this.data.JIT.hierarchy;
	var currentTime, unloopedCurrentTime;
	var looped;


	// update

	this.currentTime += deltaTimeMS * this.timeScale;

	unloopedCurrentTime = this.currentTime;
	currentTime         = this.currentTime = this.currentTime % this.data.length;

	// if looped around, the current time should be based on the startTime
	if ( currentTime < this.startTimeMs ) {

		currentTime = this.currentTime = this.startTimeMs + currentTime;

	}

	frame               = parseInt( Math.min( currentTime * this.data.fps, this.data.length * this.data.fps ), 10 );
	looped 				= currentTime < unloopedCurrentTime;

	if ( looped && !this.loop ) {

		// Set the animation to the last keyframes and stop
		for ( var h = 0, hl = this.hierarchy.length; h < hl; h++ ) {

			var keys = this.data.hierarchy[h].keys,
				sids = this.data.hierarchy[h].sids,
				end = keys.length-1,
				obj = this.hierarchy[h];

			if ( keys.length ) {

				for ( var s = 0; s < sids.length; s++ ) {

					var sid = sids[ s ],
						prev = this.getPrevKeyWith( sid, h, end );

					if ( prev ) {
						prev.apply( sid );

					}

				}

				this.data.hierarchy[h].node.updateMatrix();
				obj.matrixWorldNeedsUpdate = true;

			}

		}

		this.stop();
		return;

	}

	// check pre-infinity
	if ( currentTime < this.startTime ) {

		return;

	}

	// update

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h++ ) {

		object = this.hierarchy[ h ];
		node = this.data.hierarchy[ h ];

		var keys = node.keys,
			animationCache = node.animationCache;

		// use JIT?

		if ( this.JITCompile && JIThierarchy[ h ][ frame ] !== undefined ) {

			if( object instanceof THREE.Bone ) {

				object.skinMatrix = JIThierarchy[ h ][ frame ];
				object.matrixWorldNeedsUpdate = false;

			} else {

				object.matrix = JIThierarchy[ h ][ frame ];
				object.matrixWorldNeedsUpdate = true;

			}

		// use interpolation

		} else if ( keys.length ) {

			// make sure so original matrix and not JIT matrix is set

			if ( this.JITCompile && animationCache ) {

				if( object instanceof THREE.Bone ) {

					object.skinMatrix = animationCache.originalMatrix;

				} else {

					object.matrix = animationCache.originalMatrix;

				}

			}

			prevKey = animationCache.prevKey;
			nextKey = animationCache.nextKey;

			if ( prevKey && nextKey ) {

				// switch keys?

				if ( nextKey.time <= unloopedCurrentTime ) {

					// did we loop?

					if ( looped && this.loop ) {

						prevKey = keys[ 0 ];
						nextKey = keys[ 1 ];

						while ( nextKey.time < currentTime ) {

							prevKey = nextKey;
							nextKey = keys[ prevKey.index + 1 ];

						}

					} else if ( !looped ) {

						var lastIndex = keys.length - 1;

						while ( nextKey.time < currentTime && nextKey.index !== lastIndex ) {

							prevKey = nextKey;
							nextKey = keys[ prevKey.index + 1 ];

						}

					}

					animationCache.prevKey = prevKey;
					animationCache.nextKey = nextKey;

				}
                if(nextKey.time >= currentTime)
                    prevKey.interpolate( nextKey, currentTime );
                else
                    prevKey.interpolate( nextKey, nextKey.time);

			}

			this.data.hierarchy[h].node.updateMatrix();
			object.matrixWorldNeedsUpdate = true;

		}

	}

	// update JIT?

	if ( this.JITCompile ) {

		if ( JIThierarchy[ 0 ][ frame ] === undefined ) {

			this.hierarchy[ 0 ].updateMatrixWorld( true );

			for ( var h = 0; h < this.hierarchy.length; h++ ) {

				if( this.hierarchy[ h ] instanceof THREE.Bone ) {

					JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].skinMatrix.clone();

				} else {

					JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].matrix.clone();

				}

			}

		}

	}

};

// Get next key with

THREE.KeyFrameAnimation.prototype.getNextKeyWith = function( sid, h, key ) {

	var keys = this.data.hierarchy[ h ].keys;
	key = key % keys.length;

	for ( ; key < keys.length; key++ ) {

		if ( keys[ key ].hasTarget( sid ) ) {

			return keys[ key ];

		}

	}

	return keys[ 0 ];

};

// Get previous key with

THREE.KeyFrameAnimation.prototype.getPrevKeyWith = function( sid, h, key ) {

	var keys = this.data.hierarchy[ h ].keys;
	key = key >= 0 ? key : key + keys.length;

	for ( ; key >= 0; key-- ) {

		if ( keys[ key ].hasTarget( sid ) ) {

			return keys[ key ];

		}

	}

	return keys[ keys.length - 1 ];

};
/**
 * Camera for rendering cube maps
 *	- renders scene into axis-aligned cube
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CubeCamera = function ( near, far, cubeResolution ) {

	THREE.Object3D.call( this );

	var fov = 90, aspect = 1;

	var cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPX.up.set( 0, -1, 0 );
	cameraPX.lookAt( new THREE.Vector3( 1, 0, 0 ) );
	this.add( cameraPX );

	var cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNX.up.set( 0, -1, 0 );
	cameraNX.lookAt( new THREE.Vector3( -1, 0, 0 ) );
	this.add( cameraNX );

	var cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPY.up.set( 0, 0, 1 );
	cameraPY.lookAt( new THREE.Vector3( 0, 1, 0 ) );
	this.add( cameraPY );

	var cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNY.up.set( 0, 0, -1 );
	cameraNY.lookAt( new THREE.Vector3( 0, -1, 0 ) );
	this.add( cameraNY );

	var cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPZ.up.set( 0, -1, 0 );
	cameraPZ.lookAt( new THREE.Vector3( 0, 0, 1 ) );
	this.add( cameraPZ );

	var cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNZ.up.set( 0, -1, 0 );
	cameraNZ.lookAt( new THREE.Vector3( 0, 0, -1 ) );
	this.add( cameraNZ );

	this.renderTarget = new THREE.WebGLRenderTargetCube( cubeResolution, cubeResolution, { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );

	this.updateCubeMap = function ( renderer, scene ) {

		var renderTarget = this.renderTarget;
		var generateMipmaps = renderTarget.generateMipmaps;

		renderTarget.generateMipmaps = false;

		renderTarget.activeCubeFace = 0;
		renderer.render( scene, cameraPX, renderTarget );

		renderTarget.activeCubeFace = 1;
		renderer.render( scene, cameraNX, renderTarget );

		renderTarget.activeCubeFace = 2;
		renderer.render( scene, cameraPY, renderTarget );

		renderTarget.activeCubeFace = 3;
		renderer.render( scene, cameraNY, renderTarget );

		renderTarget.activeCubeFace = 4;
		renderer.render( scene, cameraPZ, renderTarget );

		renderTarget.generateMipmaps = generateMipmaps;

		renderTarget.activeCubeFace = 5;
		renderer.render( scene, cameraNZ, renderTarget );

	};

};

THREE.CubeCamera.prototype = new THREE.Object3D();
THREE.CubeCamera.prototype.constructor = THREE.CubeCamera;
/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 * 
 *	A general perpose camera, for setting FOV, Lens Focal Length,  
 *		and switching between perspective and orthographic views easily.
 *		Use this only if you do not wish to manage 
 *		both a Orthographic and Perspective Camera
 *
 */


THREE.CombinedCamera = function ( width, height, fov, near, far, orthonear, orthofar ) {

	THREE.Camera.call( this );

	this.fov = fov;
	
	this.left = -width / 2;
	this.right = width / 2
	this.top = height / 2;
	this.bottom = -height / 2;
	
	// We could also handle the projectionMatrix internally, but just wanted to test nested camera objects
	this.cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 	orthonear, orthofar );
	this.cameraP = new THREE.PerspectiveCamera( fov, width/height, near, far );

	this.zoom = 1;
	
	this.toPerspective();
	
	
	var aspect = width/height;
	
	


};

THREE.CombinedCamera.prototype = new THREE.Camera();
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {
	// Switches to the Perspective Camera

	this.near = this.cameraP.near;
	this.far = this.cameraP.far;
	this.cameraP.fov =  this.fov / this.zoom ;
	this.cameraP.updateProjectionMatrix();
	this.projectionMatrix = this.cameraP.projectionMatrix;
	
	this.inPersepectiveMode = true;
	this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

	// Switches to the Orthographic camera estimating viewport from Perspective
	var fov = this.fov;
	var aspect = this.cameraP.aspect;
	var near = this.cameraP.near;
	var far = this.cameraP.far;
	
	
	// The size that we set is the mid plane of the viewing frustum
	var hyperfocus = ( near + far ) / 2; 
	
	var halfHeight = Math.tan( fov / 2 ) * hyperfocus;
	var planeHeight = 2 * halfHeight;
	var planeWidth = planeHeight * aspect;
	var halfWidth = planeWidth / 2;
	
	halfHeight /= this.zoom;
	halfWidth /= this.zoom;
	
	this.cameraO.left = -halfWidth;
	this.cameraO.right = halfWidth;
	this.cameraO.top = halfHeight;
	this.cameraO.bottom = -halfHeight;
	
	// this.cameraO.left = -farHalfWidth;
	// this.cameraO.right = farHalfWidth;
	// this.cameraO.top = farHalfHeight;
	// this.cameraO.bottom = -farHalfHeight;

	// this.cameraO.left = this.left / this.zoom;
	// this.cameraO.right = this.right / this.zoom;
	// this.cameraO.top = this.top / this.zoom;
	// this.cameraO.bottom = this.bottom / this.zoom;
	
	this.cameraO.updateProjectionMatrix();

	this.near = this.cameraO.near;
	this.far = this.cameraO.far;
	this.projectionMatrix = this.cameraO.projectionMatrix;
	
	this.inPersepectiveMode = false;
	this.inOrthographicMode = true;

};

	
THREE.CombinedCamera.prototype.setSize = function(width, height) {

	this.cameraP.aspect = width / height;
	this.left = -width / 2;
	this.right = width / 2
	this.top = height / 2;
	this.bottom = -height / 2;

}


THREE.CombinedCamera.prototype.setFov = function(fov) {	
	this.fov = fov;
	
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
		this.toOrthographic();
	}

};

// For mantaining similar API with PerspectiveCamera
THREE.CombinedCamera.prototype.updateProjectionMatrix = function() {
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
		this.toPerspective();
		this.toOrthographic();
	}
};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (fullframe) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	frameHeight = frameHeight !== undefined ? frameHeight : 24;

	var fov = 2 * Math.atan( frameHeight / ( focalLength * 2 ) ) * ( 180 / Math.PI );

	this.setFov( fov );

	return fov;
};


THREE.CombinedCamera.prototype.setZoom = function(zoom) {

	this.zoom = zoom;
	
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
		this.toOrthographic();
	}
	

};

THREE.CombinedCamera.prototype.toFrontView = function() {
	this.rotation.x = 0;
	this.rotation.y = 0;
	this.rotation.z = 0;
	// should we be modifing the matrix instead?
	this.rotationAutoUpdate = false;
};

THREE.CombinedCamera.prototype.toBackView = function() {
	this.rotation.x = 0;
	this.rotation.y = Math.PI;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};
	
THREE.CombinedCamera.prototype.toLeftView = function() {
	this.rotation.x = 0;
	this.rotation.y = - Math.PI / 2;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

THREE.CombinedCamera.prototype.toRightView = function() {
	this.rotation.x = 0;
	this.rotation.y = Math.PI / 2;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

THREE.CombinedCamera.prototype.toTopView = function() {
	this.rotation.x = - Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

THREE.CombinedCamera.prototype.toBottomView = function() {
	this.rotation.x = Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( object, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.noFly = false;
	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	if ( this.domElement === document ) {

		this.viewHalfX = window.innerWidth / 2;
		this.viewHalfY = window.innerHeight / 2;

	} else {

		this.viewHalfX = this.domElement.offsetWidth / 2;
		this.viewHalfY = this.domElement.offsetHeight / 2;
		this.domElement.setAttribute( 'tabindex', -1 );

	}

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;

			}

		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	this.onKeyDown = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta ) {
		var actualMoveSpeed = 0;
		
		if ( this.freeze ) {
			
			return;
			
		} else {

			if ( this.heightSpeed ) {

				var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
				var heightDelta = y - this.heightMin;

				this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

			} else {

				this.autoSpeedFactor = 0.0;

			}

			actualMoveSpeed = delta * this.movementSpeed;

			if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

			if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

			if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
			if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

			var actualLookSpeed = delta * this.lookSpeed;

			if ( !this.activeLook ) {

				actualLookSpeed = 0;

			}

			this.lon += this.mouseX * actualLookSpeed;
			if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed;

			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			this.phi = ( 90 - this.lat ) * Math.PI / 180;
			this.theta = this.lon * Math.PI / 180;

			var targetPosition = this.target,
				position = this.object.position;

			targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
			targetPosition.y = position.y + 100 * Math.cos( this.phi );
			targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;

		this.theta = this.lon * Math.PI / 180;

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.PathControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.id = "PathControls" + THREE.PathControlsIdCounter ++;

	// API

	this.duration = 10 * 1000; // milliseconds
	this.waypoints = [];

	this.useConstantSpeed = true;
	this.resamplingCoef = 50;

	this.debugPath = new THREE.Object3D();
	this.debugDummy = new THREE.Object3D();

	this.animationParent = new THREE.Object3D();

	this.lookSpeed = 0.005;
	this.lookVertical = true;
	this.lookHorizontal = true;
	this.verticalAngleMap   = { srcRange: [ 0, 2 * Math.PI ], dstRange: [ 0, 2 * Math.PI ] };
	this.horizontalAngleMap = { srcRange: [ 0, 2 * Math.PI ], dstRange: [ 0, 2 * Math.PI ] };

	// internals

	this.target = new THREE.Object3D();

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;

	this.phi = 0;
	this.theta = 0;

	if ( this.domElement === document ) {

		this.viewHalfX = window.innerWidth / 2;
		this.viewHalfY = window.innerHeight / 2;

	} else {

		this.viewHalfX = this.domElement.offsetWidth / 2;
		this.viewHalfY = this.domElement.offsetHeight / 2;
		this.domElement.setAttribute( 'tabindex', -1 );

	}

	var PI2 = Math.PI * 2,
		PI180 = Math.PI / 180;

	// methods

	this.update = function ( delta ) {

		var srcRange, dstRange;

		if( this.lookHorizontal ) this.lon += this.mouseX * this.lookSpeed * delta;
		if( this.lookVertical )   this.lat -= this.mouseY * this.lookSpeed * delta;

		this.lon = Math.max( 0, Math.min( 360, this.lon ) );
		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );

		this.phi = ( 90 - this.lat ) * PI180;
		this.theta = this.lon * PI180;

		this.phi = normalize_angle_rad( this.phi );

		// constrain vertical look angle

		srcRange = this.verticalAngleMap.srcRange;
		dstRange = this.verticalAngleMap.dstRange;

		var tmpPhi = THREE.Math.mapLinear( this.phi, srcRange[ 0 ], srcRange[ 1 ], dstRange[ 0 ], dstRange[ 1 ] );
		var tmpPhiFullRange = dstRange[ 1 ] - dstRange[ 0 ];
		var tmpPhiNormalized = ( tmpPhi - dstRange[ 0 ] ) / tmpPhiFullRange;

		this.phi = QuadraticEaseInOut( tmpPhiNormalized ) * tmpPhiFullRange + dstRange[ 0 ];

		// constrain horizontal look angle

		srcRange = this.horizontalAngleMap.srcRange;
		dstRange = this.horizontalAngleMap.dstRange;

		var tmpTheta = THREE.Math.mapLinear( this.theta, srcRange[ 0 ], srcRange[ 1 ], dstRange[ 0 ], dstRange[ 1 ] );
		var tmpThetaFullRange = dstRange[ 1 ] - dstRange[ 0 ];
		var tmpThetaNormalized = ( tmpTheta - dstRange[ 0 ] ) / tmpThetaFullRange;

		this.theta = QuadraticEaseInOut( tmpThetaNormalized ) * tmpThetaFullRange + dstRange[ 0 ];

		var targetPosition = this.target.position,
			position = this.object.position;

		targetPosition.x = 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = 100 * Math.cos( this.phi );
		targetPosition.z = 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( this.target.position );

	};

	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	// utils

	function normalize_angle_rad( a ) {

		var b = a % PI2;
		return b >= 0 ? b : b + PI2;

	};

	function distance( a, b ) {

		var dx = a[ 0 ] - b[ 0 ],
			dy = a[ 1 ] - b[ 1 ],
			dz = a[ 2 ] - b[ 2 ];

		return Math.sqrt( dx * dx + dy * dy + dz * dz );

	};

	function QuadraticEaseInOut ( k ) {

		if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
		return - 0.5 * ( --k * ( k - 2 ) - 1 );

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	function initAnimationPath( parent, spline, name, duration ) {

		var animationData = {

		   name: name,
		   fps: 0.6,
		   length: duration,

		   hierarchy: []

		};

		var i,
			parentAnimation, childAnimation,
			path = spline.getControlPointsArray(),
			sl = spline.getLength(),
			pl = path.length,
			t = 0,
			first = 0,
			last  = pl - 1;

		parentAnimation = { parent: -1, keys: [] };
		parentAnimation.keys[ first ] = { time: 0,        pos: path[ first ], rot: [ 0, 0, 0, 1 ], scl: [ 1, 1, 1 ] };
		parentAnimation.keys[ last  ] = { time: duration, pos: path[ last ],  rot: [ 0, 0, 0, 1 ], scl: [ 1, 1, 1 ] };

		for ( i = 1; i < pl - 1; i++ ) {

			// real distance (approximation via linear segments)

			t = duration * sl.chunks[ i ] / sl.total;

			// equal distance

			//t = duration * ( i / pl );

			// linear distance

			//t += duration * distance( path[ i ], path[ i - 1 ] ) / sl.total;

			parentAnimation.keys[ i ] = { time: t, pos: path[ i ] };

		}

		animationData.hierarchy[ 0 ] = parentAnimation;

		THREE.AnimationHandler.add( animationData );

		return new THREE.Animation( parent, name, THREE.AnimationHandler.CATMULLROM_FORWARD, false );

	};


	function createSplineGeometry( spline, n_sub ) {

		var i, index, position,
			geometry = new THREE.Geometry();

		for ( i = 0; i < spline.points.length * n_sub; i ++ ) {

			index = i / ( spline.points.length * n_sub );
			position = spline.getPoint( index );

			geometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );

		}

		return geometry;

	};

	function createPath( parent, spline ) {

		var lineGeo = createSplineGeometry( spline, 10 ),
			particleGeo = createSplineGeometry( spline, 10 ),
			lineMat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 3 } ),
			lineObj = new THREE.Line( lineGeo, lineMat ),
			particleObj = new THREE.ParticleSystem( particleGeo, new THREE.ParticleBasicMaterial( { color: 0xffaa00, size: 3 } ) );

		lineObj.scale.set( 1, 1, 1 );
		parent.add( lineObj );

		particleObj.scale.set( 1, 1, 1 );
		parent.add( particleObj );

		var waypoint,
			geo = new THREE.SphereGeometry( 1, 16, 8 ),
			mat = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

		for ( var i = 0; i < spline.points.length; i ++ ) {

			waypoint = new THREE.Mesh( geo, mat );
			waypoint.position.copy( spline.points[ i ] );
			parent.add( waypoint );

		}

	};

	this.init = function ( ) {

		// constructor

		this.spline = new THREE.Spline();
		this.spline.initFromArray( this.waypoints );

		if ( this.useConstantSpeed ) {

			this.spline.reparametrizeByArcLength( this.resamplingCoef );

		}

		if ( this.createDebugDummy ) {

			var dummyParentMaterial = new THREE.MeshLambertMaterial( { color: 0x0077ff } ),
			dummyChildMaterial  = new THREE.MeshLambertMaterial( { color: 0x00ff00 } ),
			dummyParentGeo = new THREE.CubeGeometry( 10, 10, 20 ),
			dummyChildGeo  = new THREE.CubeGeometry( 2, 2, 10 );

			this.animationParent = new THREE.Mesh( dummyParentGeo, dummyParentMaterial );

			var dummyChild = new THREE.Mesh( dummyChildGeo, dummyChildMaterial );
			dummyChild.position.set( 0, 10, 0 );

			this.animation = initAnimationPath( this.animationParent, this.spline, this.id, this.duration );

			this.animationParent.add( this.object );
			this.animationParent.add( this.target );
			this.animationParent.add( dummyChild );

		} else {

			this.animation = initAnimationPath( this.animationParent, this.spline, this.id, this.duration );
			this.animationParent.add( this.target );
			this.animationParent.add( this.object );

		}

		if ( this.createDebugPath ) {

			createPath( this.debugPath, this.spline );

		}

		this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );

	};

};

THREE.PathControlsIdCounter = 0;
/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', -1 );

	// API

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;

	this.dragToLook = false;
	this.autoForward = false;

	// disable default target object behavior

	this.object.useQuaternion = true;

	// internals

	this.tmpQuaternion = new THREE.Quaternion();

	this.mouseStatus = 0;

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new THREE.Vector3( 0, 0, 0 );
	this.rotationVector = new THREE.Vector3( 0, 0, 0 );

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.keydown = function( event ) {

		if ( event.altKey ) {

			return;

		}

		switch( event.keyCode ) {

			case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

			case 87: /*W*/ this.moveState.forward = 1; break;
			case 83: /*S*/ this.moveState.back = 1; break;

			case 65: /*A*/ this.moveState.left = 1; break;
			case 68: /*D*/ this.moveState.right = 1; break;

			case 82: /*R*/ this.moveState.up = 1; break;
			case 70: /*F*/ this.moveState.down = 1; break;

			case 38: /*up*/ this.moveState.pitchUp = 1; break;
			case 40: /*down*/ this.moveState.pitchDown = 1; break;

			case 37: /*left*/ this.moveState.yawLeft = 1; break;
			case 39: /*right*/ this.moveState.yawRight = 1; break;

			case 81: /*Q*/ this.moveState.rollLeft = 1; break;
			case 69: /*E*/ this.moveState.rollRight = 1; break;

		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.keyup = function( event ) {

		switch( event.keyCode ) {

			case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

			case 87: /*W*/ this.moveState.forward = 0; break;
			case 83: /*S*/ this.moveState.back = 0; break;

			case 65: /*A*/ this.moveState.left = 0; break;
			case 68: /*D*/ this.moveState.right = 0; break;

			case 82: /*R*/ this.moveState.up = 0; break;
			case 70: /*F*/ this.moveState.down = 0; break;

			case 38: /*up*/ this.moveState.pitchUp = 0; break;
			case 40: /*down*/ this.moveState.pitchDown = 0; break;

			case 37: /*left*/ this.moveState.yawLeft = 0; break;
			case 39: /*right*/ this.moveState.yawRight = 0; break;

			case 81: /*Q*/ this.moveState.rollLeft = 0; break;
			case 69: /*E*/ this.moveState.rollRight = 0; break;

		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.mousedown = function( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {

			this.mouseStatus ++;

		} else {

			switch ( event.button ) {

				case 0: this.object.moveForward = true; break;
				case 2: this.object.moveBackward = true; break;

			}

		}

	};

	this.mousemove = function( event ) {

		if ( !this.dragToLook || this.mouseStatus > 0 ) {

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			this.updateRotationVector();

		}

	};

	this.mouseup = function( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {

			this.mouseStatus --;

			this.moveState.yawLeft = this.moveState.pitchDown = 0;

		} else {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.updateRotationVector();

	};

	this.update = function( delta ) {

		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;

		this.object.translateX( this.moveVector.x * moveMult );
		this.object.translateY( this.moveVector.y * moveMult );
		this.object.translateZ( this.moveVector.z * moveMult );

		this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
		this.object.quaternion.multiplySelf( this.tmpQuaternion );

		this.object.matrix.setPosition( this.object.position );
		this.object.matrix.setRotationFromQuaternion( this.object.quaternion );
		this.object.matrixWorldNeedsUpdate = true;


	};

	this.updateMovementVector = function() {

		var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;

		this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
		this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
		this.moveVector.z = ( -forward + this.moveState.back );

		//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

	};

	this.updateRotationVector = function() {

		this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
		this.rotationVector.y = ( -this.moveState.yawRight  + this.moveState.yawLeft );
		this.rotationVector.z = ( -this.moveState.rollRight + this.moveState.rollLeft );

		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

	};

	this.getContainerDimensions = function() {

		if ( this.domElement != document ) {

			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};

		} else {

			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};

		}

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.domElement.addEventListener( 'mousemove', bind( this, this.mousemove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.mousedown ), false );
	this.domElement.addEventListener( 'mouseup',   bind( this, this.mouseup ), false );

	this.domElement.addEventListener( 'keydown', bind( this, this.keydown ), false );
	this.domElement.addEventListener( 'keyup',   bind( this, this.keyup ), false );

	this.updateMovementVector();
	this.updateRotationVector();

};
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RollControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.mouseLook = true;
	this.autoForward = false;

	this.lookSpeed = 1;
	this.movementSpeed = 1;
	this.rollSpeed = 1;

	this.constrainVertical = [ -0.9, 0.9 ];

	// disable default target object behavior

	this.object.matrixAutoUpdate = false;

	// internals

	this.forward = new THREE.Vector3( 0, 0, 1 );
	this.roll = 0;

	var xTemp = new THREE.Vector3();
	var yTemp = new THREE.Vector3();
	var zTemp = new THREE.Vector3();
	var rollMatrix = new THREE.Matrix4();

	var doRoll = false, rollDirection = 1, forwardSpeed = 0, sideSpeed = 0, upSpeed = 0;

	var mouseX = 0, mouseY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	// custom update

	this.update = function ( delta ) {

		if ( this.mouseLook ) {

			var actualLookSpeed = delta * this.lookSpeed;

			this.rotateHorizontally( actualLookSpeed * mouseX );
			this.rotateVertically( actualLookSpeed * mouseY );

		}

		var actualSpeed = delta * this.movementSpeed;
		var forwardOrAuto = ( forwardSpeed > 0 || ( this.autoForward && ! ( forwardSpeed < 0 ) ) ) ? 1 : forwardSpeed;

		this.object.translateZ( -actualSpeed * forwardOrAuto );
		this.object.translateX( actualSpeed * sideSpeed );
		this.object.translateY( actualSpeed * upSpeed );

		if( doRoll ) {

			this.roll += this.rollSpeed * delta * rollDirection;

		}

		// cap forward up / down

		if( this.forward.y > this.constrainVertical[ 1 ] ) {

			this.forward.y = this.constrainVertical[ 1 ];
			this.forward.normalize();

		} else if( this.forward.y < this.constrainVertical[ 0 ] ) {

			this.forward.y = this.constrainVertical[ 0 ];
			this.forward.normalize();

		}


		// construct unrolled camera matrix

		zTemp.copy( this.forward );
		yTemp.set( 0, 1, 0 );

		xTemp.cross( yTemp, zTemp ).normalize();
		yTemp.cross( zTemp, xTemp ).normalize();

		this.object.matrix.elements[0] = xTemp.x; this.object.matrix.elements[4] = yTemp.x; this.object.matrix.elements[8] = zTemp.x;
		this.object.matrix.elements[1] = xTemp.y; this.object.matrix.elements[5] = yTemp.y; this.object.matrix.elements[9] = zTemp.y;
		this.object.matrix.elements[2] = xTemp.z; this.object.matrix.elements[6] = yTemp.z; this.object.matrix.elements[10] = zTemp.z;

		// calculate roll matrix

		rollMatrix.identity();
		rollMatrix.elements[0] = Math.cos( this.roll ); rollMatrix.elements[4] = -Math.sin( this.roll );
		rollMatrix.elements[1] = Math.sin( this.roll ); rollMatrix.elements[5] =  Math.cos( this.roll );

		// multiply camera with roll

		this.object.matrix.multiplySelf( rollMatrix );
		this.object.matrixWorldNeedsUpdate = true;

		// set position

		this.object.matrix.elements[12] = this.object.position.x;
		this.object.matrix.elements[13] = this.object.position.y;
		this.object.matrix.elements[14] = this.object.position.z;


	};

	this.translateX = function ( distance ) {

		this.object.position.x += this.object.matrix.elements[0] * distance;
		this.object.position.y += this.object.matrix.elements[1] * distance;
		this.object.position.z += this.object.matrix.elements[2] * distance;

	};

	this.translateY = function ( distance ) {

		this.object.position.x += this.object.matrix.elements[4] * distance;
		this.object.position.y += this.object.matrix.elements[5] * distance;
		this.object.position.z += this.object.matrix.elements[6] * distance;

	};

	this.translateZ = function ( distance ) {

		this.object.position.x -= this.object.matrix.elements[8] * distance;
		this.object.position.y -= this.object.matrix.elements[9] * distance;
		this.object.position.z -= this.object.matrix.elements[10] * distance;

	};


	this.rotateHorizontally = function ( amount ) {

		// please note that the amount is NOT degrees, but a scale value

		xTemp.set( this.object.matrix.elements[0], this.object.matrix.elements[1], this.object.matrix.elements[2] );
		xTemp.multiplyScalar( amount );

		this.forward.subSelf( xTemp );
		this.forward.normalize();

	};

	this.rotateVertically = function ( amount ) {

		// please note that the amount is NOT degrees, but a scale value

		yTemp.set( this.object.matrix.elements[4], this.object.matrix.elements[5], this.object.matrix.elements[6] );
		yTemp.multiplyScalar( amount );

		this.forward.addSelf( yTemp );
		this.forward.normalize();

	};

	function onKeyDown( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ forwardSpeed = 1; break;

			case 37: /*left*/
			case 65: /*A*/ sideSpeed = -1; break;

			case 40: /*down*/
			case 83: /*S*/ forwardSpeed = -1; break;

			case 39: /*right*/
			case 68: /*D*/ sideSpeed = 1; break;

			case 81: /*Q*/ doRoll = true; rollDirection = 1; break;
			case 69: /*E*/ doRoll = true; rollDirection = -1; break;

			case 82: /*R*/ upSpeed = 1; break;
			case 70: /*F*/ upSpeed = -1; break;

		}

	};

	function onKeyUp( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ forwardSpeed = 0; break;

			case 37: /*left*/
			case 65: /*A*/ sideSpeed = 0; break;

			case 40: /*down*/
			case 83: /*S*/ forwardSpeed = 0; break;

			case 39: /*right*/
			case 68: /*D*/ sideSpeed = 0; break;

			case 81: /*Q*/ doRoll = false; break;
			case 69: /*E*/ doRoll = false; break;

			case 82: /*R*/ upSpeed = 0; break;
			case 70: /*F*/ upSpeed = 0; break;

		}

	};

	function onMouseMove( event ) {

		mouseX = ( event.clientX - windowHalfX ) / window.innerWidth;
		mouseY = ( event.clientY - windowHalfY ) / window.innerHeight;

	};

	function onMouseDown ( event ) {

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: forwardSpeed = 1; break;
			case 2: forwardSpeed = -1; break;

		}

	};

	function onMouseUp ( event ) {

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: forwardSpeed = 0; break;
			case 2: forwardSpeed = 0; break;

		}

	};

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'keydown', onKeyDown, false );
	this.domElement.addEventListener( 'keyup', onKeyUp, false );

};
/**
 * @author Eberhard Graether / http://egraether.com/
 */

THREE.TrackballControls = function ( object, domElement ) {

	THREE.EventTarget.call( this );

	var _this = this,
	STATE = { NONE : -1, ROTATE : 0, ZOOM : 1, PAN : 2 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { width: window.innerWidth, height: window.innerHeight, offsetLeft: 0, offsetTop: 0 };
	this.radius = ( this.screen.width + this.screen.height ) / 4;

	this.rotateSpeed = 1.0;
	this.zoomSpeed = 1.2;
	this.panSpeed = 0.3;

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;

	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	// internals

	this.target = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();

	var _keyPressed = false,
	_state = STATE.NONE,

	_eye = new THREE.Vector3(),

	_rotateStart = new THREE.Vector3(),
	_rotateEnd = new THREE.Vector3(),

	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),

	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();

	// events

	var changeEvent = { type: 'change' };


	// methods

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.getMouseOnScreen = function ( clientX, clientY ) {

		return new THREE.Vector2(
			( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
			( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
		);

	};

	this.getMouseProjectionOnBall = function ( clientX, clientY ) {

		var mouseOnBall = new THREE.Vector3(
			( clientX - _this.screen.width * 0.5 - _this.screen.offsetLeft ) / _this.radius,
			( _this.screen.height * 0.5 + _this.screen.offsetTop - clientY ) / _this.radius,
			0.0
		);

		var length = mouseOnBall.length();

		if ( length > 1.0 ) {

			mouseOnBall.normalize();

		} else {

			mouseOnBall.z = Math.sqrt( 1.0 - length * length );

		}

		_eye.copy( _this.object.position ).subSelf( _this.target );

		var projection = _this.object.up.clone().setLength( mouseOnBall.y );
		projection.addSelf( _this.object.up.clone().crossSelf( _eye ).setLength( mouseOnBall.x ) );
		projection.addSelf( _eye.setLength( mouseOnBall.z ) );

		return projection;

	};

	this.rotateCamera = function () {

		var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

		if ( angle ) {

			var axis = ( new THREE.Vector3() ).cross( _rotateStart, _rotateEnd ).normalize(),
				quaternion = new THREE.Quaternion();

			angle *= _this.rotateSpeed;

			quaternion.setFromAxisAngle( axis, -angle );

			quaternion.multiplyVector3( _eye );
			quaternion.multiplyVector3( _this.object.up );

			quaternion.multiplyVector3( _rotateEnd );

			if ( _this.staticMoving ) {

				_rotateStart = _rotateEnd;

			} else {

				quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
				quaternion.multiplyVector3( _rotateStart );

			}

		}

	};

	this.zoomCamera = function () {

		var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

		if ( factor !== 1.0 && factor > 0.0 ) {

			_eye.multiplyScalar( factor );

			if ( _this.staticMoving ) {

				_zoomStart = _zoomEnd;

			} else {

				_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	};

	this.panCamera = function () {

		var mouseChange = _panEnd.clone().subSelf( _panStart );

		if ( mouseChange.lengthSq() ) {

			mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

			var pan = _eye.clone().crossSelf( _this.object.up ).setLength( mouseChange.x );
			pan.addSelf( _this.object.up.clone().setLength( mouseChange.y ) );

			_this.object.position.addSelf( pan );
			_this.target.addSelf( pan );

			if ( _this.staticMoving ) {

				_panStart = _panEnd;

			} else {

				_panStart.addSelf( mouseChange.sub( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

			}

		}

	};

	this.checkDistances = function () {

		if ( !_this.noZoom || !_this.noPan ) {

			if ( _this.object.position.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.object.position.setLength( _this.maxDistance );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.object.position.add( _this.target, _eye.setLength( _this.minDistance ) );

			}

		}

	};

	this.update = function () {

		_eye.copy( _this.object.position ).subSelf( _this.target );

		if ( !_this.noRotate ) {

			_this.rotateCamera();

		}
		
		if ( !_this.noZoom ) {

			_this.zoomCamera();

		}

		if ( !_this.noPan ) {

			_this.panCamera();

		}

		_this.object.position.add( _this.target, _eye );

		_this.checkDistances();

		_this.object.lookAt( _this.target );

		if ( lastPosition.distanceTo( _this.object.position ) > 0 ) {
			
			_this.dispatchEvent( changeEvent );

			lastPosition.copy( _this.object.position );

		}

	};

	// listeners

	function keydown( event ) {

		if ( ! _this.enabled ) return;

		if ( _state !== STATE.NONE ) {

			return;

		} else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

			_state = STATE.ROTATE;

		} else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

			_state = STATE.ZOOM;

		} else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

			_state = STATE.PAN;

		}

		if ( _state !== STATE.NONE ) {

			_keyPressed = true;

		}

	};

	function keyup( event ) {

		if ( ! _this.enabled ) return;

		if ( _state !== STATE.NONE ) {

			_state = STATE.NONE;

		}

	};

	function mousedown( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;

			if ( _state === STATE.ROTATE && !_this.noRotate ) {

				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

			} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

				_zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

			} else if ( !this.noPan ) {

				_panStart = _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

			}

		}

	};

	function mousemove( event ) {

		if ( ! _this.enabled ) return;

		if ( _keyPressed ) {

			_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );
			_zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
			_panStart = _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

			_keyPressed = false;

		}

		if ( _state === STATE.NONE ) {

			return;

		} else if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

		}

	};

	function mouseup( event ) {

		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

	};

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', mousemove, false );
	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'mouseup', mouseup, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

};
/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */

THREE.CubeGeometry = function ( width, height, depth, segmentsWidth, segmentsHeight, segmentsDepth, materials, sides ) {

	THREE.Geometry.call( this );

	var scope = this,
	width_half = width / 2,
	height_half = height / 2,
	depth_half = depth / 2;

	var mpx, mpy, mpz, mnx, mny, mnz;

	if ( materials !== undefined ) {

		if ( materials instanceof Array ) {

			this.materials = materials;

		} else {

			this.materials = [];

			for ( var i = 0; i < 6; i ++ ) {

				this.materials.push( materials );

			}

		}

		mpx = 0; mnx = 1; mpy = 2; mny = 3; mpz = 4; mnz = 5;

	} else {

		this.materials = [];

	}

	this.sides = { px: true, nx: true, py: true, ny: true, pz: true, nz: true };

	if ( sides != undefined ) {

		for ( var s in sides ) {

			if ( this.sides[ s ] !== undefined ) {

				this.sides[ s ] = sides[ s ];

			}

		}

	}

	this.sides.px && buildPlane( 'z', 'y', - 1, - 1, depth, height, width_half, mpx ); // px
	this.sides.nx && buildPlane( 'z', 'y',   1, - 1, depth, height, - width_half, mnx ); // nx
	this.sides.py && buildPlane( 'x', 'z',   1,   1, width, depth, height_half, mpy ); // py
	this.sides.ny && buildPlane( 'x', 'z',   1, - 1, width, depth, - height_half, mny ); // ny
	this.sides.pz && buildPlane( 'x', 'y',   1, - 1, width, height, depth_half, mpz ); // pz
	this.sides.nz && buildPlane( 'x', 'y', - 1, - 1, width, height, - depth_half, mnz ); // nz

	function buildPlane( u, v, udir, vdir, width, height, depth, material ) {

		var w, ix, iy,
		gridX = segmentsWidth || 1,
		gridY = segmentsHeight || 1,
		width_half = width / 2,
		height_half = height / 2,
		offset = scope.vertices.length;

		if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

			w = 'z';

		} else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

			w = 'y';
			gridY = segmentsDepth || 1;

		} else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

			w = 'x';
			gridX = segmentsDepth || 1;

		}

		var gridX1 = gridX + 1,
		gridY1 = gridY + 1,
		segment_width = width / gridX,
		segment_height = height / gridY,
		normal = new THREE.Vector3();

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				var vector = new THREE.Vector3();
				vector[ u ] = ( ix * segment_width - width_half ) * udir;
				vector[ v ] = ( iy * segment_height - height_half ) * vdir;
				vector[ w ] = depth;

				scope.vertices.push( vector );

			}

		}

		for ( iy = 0; iy < gridY; iy++ ) {

			for ( ix = 0; ix < gridX; ix++ ) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;

				var face = new THREE.Face4( a + offset, b + offset, c + offset, d + offset );
				face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = material;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [
							new THREE.UV( ix / gridX, iy / gridY ),
							new THREE.UV( ix / gridX, ( iy + 1 ) / gridY ),
							new THREE.UV( ( ix + 1 ) / gridX, ( iy + 1 ) / gridY ),
							new THREE.UV( ( ix + 1 ) / gridX, iy / gridY )
						] );

			}

		}

	}

	this.computeCentroids();
	this.mergeVertices();

};

THREE.CubeGeometry.prototype = new THREE.Geometry();
THREE.CubeGeometry.prototype.constructor = THREE.CubeGeometry;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CylinderGeometry = function ( radiusTop, radiusBottom, height, segmentsRadius, segmentsHeight, openEnded ) {

	THREE.Geometry.call( this );

	radiusTop = radiusTop !== undefined ? radiusTop : 20;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
	height = height !== undefined ? height : 100;

	var heightHalf = height / 2;
	var segmentsX = segmentsRadius || 8;
	var segmentsY = segmentsHeight || 1;

	var x, y, vertices = [], uvs = [];

	for ( y = 0; y <= segmentsY; y ++ ) {

		var verticesRow = [];
		var uvsRow = [];

		var v = y / segmentsY;
		var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

		for ( x = 0; x <= segmentsX; x ++ ) {

			var u = x / segmentsX;

			var vertex = new THREE.Vector3();
			vertex.x = radius * Math.sin( u * Math.PI * 2 );
			vertex.y = - v * height + heightHalf;
			vertex.z = radius * Math.cos( u * Math.PI * 2 );

			this.vertices.push( vertex );

			verticesRow.push( this.vertices.length - 1 );
			uvsRow.push( new THREE.UV( u, v ) );

		}

		vertices.push( verticesRow );
		uvs.push( uvsRow );

	}

	for ( y = 0; y < segmentsY; y ++ ) {

		for ( x = 0; x < segmentsX; x ++ ) {

			var v1 = vertices[ y ][ x ];
			var v2 = vertices[ y + 1 ][ x ];
			var v3 = vertices[ y + 1 ][ x + 1 ];
			var v4 = vertices[ y ][ x + 1 ];

			// FIXME: These normals aren't right for cones.

			var n1 = this.vertices[ v1 ].clone().setY( 0 ).normalize();
			var n2 = this.vertices[ v2 ].clone().setY( 0 ).normalize();
			var n3 = this.vertices[ v3 ].clone().setY( 0 ).normalize();
			var n4 = this.vertices[ v4 ].clone().setY( 0 ).normalize();

			var uv1 = uvs[ y ][ x ].clone();
			var uv2 = uvs[ y + 1 ][ x ].clone();
			var uv3 = uvs[ y + 1 ][ x + 1 ].clone();
			var uv4 = uvs[ y ][ x + 1 ].clone();

			this.faces.push( new THREE.Face4( v1, v2, v3, v4, [ n1, n2, n3, n4 ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3, uv4 ] );

		}

	}

	// top cap

	if ( !openEnded && radiusTop > 0 ) {

		this.vertices.push( new THREE.Vector3( 0, heightHalf, 0 ) );

		for ( x = 0; x < segmentsX; x ++ ) {

			var v1 = vertices[ 0 ][ x ];
			var v2 = vertices[ 0 ][ x + 1 ];
			var v3 = this.vertices.length - 1;

			var n1 = new THREE.Vector3( 0, 1, 0 );
			var n2 = new THREE.Vector3( 0, 1, 0 );
			var n3 = new THREE.Vector3( 0, 1, 0 );

			var uv1 = uvs[ 0 ][ x ].clone();
			var uv2 = uvs[ 0 ][ x + 1 ].clone();
			var uv3 = new THREE.UV( uv2.u, 0 );

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

		}

	}

	// bottom cap

	if ( !openEnded && radiusBottom > 0 ) {

		this.vertices.push( new THREE.Vector3( 0, - heightHalf, 0 ) );

		for ( x = 0; x < segmentsX; x ++ ) {

			var v1 = vertices[ y ][ x + 1 ];
			var v2 = vertices[ y ][ x ];
			var v3 = this.vertices.length - 1;

			var n1 = new THREE.Vector3( 0, - 1, 0 );
			var n2 = new THREE.Vector3( 0, - 1, 0 );
			var n3 = new THREE.Vector3( 0, - 1, 0 );

			var uv1 = uvs[ y ][ x + 1 ].clone();
			var uv2 = uvs[ y ][ x ].clone();
			var uv3 = new THREE.UV( uv2.u, 1 );

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();

}
THREE.CylinderGeometry.prototype = new THREE.Geometry();
THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry;
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Creates extruded geometry from a path shape.
 *
 * parameters = {
 *
 *  size: 			<float>, 	// size of the text
 *  height: 		<float>, 	// thickness to extrude text
 *  curveSegments: 	<int>,		// number of points on the curves
 *  steps: 			<int>,		// number of points for z-side extrusions / used for subdividing segements of extrude spline too
 	amount: <int>,	// Amount 
 *
 *  bevelEnabled:	<bool>,			// turn on bevel
 *  bevelThickness: <float>, 		// how deep into text bevel goes
 *  bevelSize:		<float>, 		// how far from text outline is bevel
 *  bevelSegments:	<int>, 			// number of bevel layers
 *
 *  extrudePath:	<THREE.CurvePath>	// 2d/3d spline path to extrude shape orthogonality to
 *  bendPath:		<THREE.CurvePath> 	// 2d path for bend the shape around x/y plane
 *
 *  material:		 <int>	// material index for front and back faces
 *  extrudeMaterial: <int>	// material index for extrusion and beveled faces
 *
 *  }
  **/


THREE.ExtrudeGeometry = function( shapes, options ) {

	if ( typeof( shapes ) === "undefined" ) {
		shapes = [];
		return;
	}

	THREE.Geometry.call( this );

	shapes = shapes instanceof Array ? shapes : [ shapes ];

	this.shapebb = shapes[ shapes.length - 1 ].getBoundingBox();

	this.addShapeList( shapes, options );

	this.computeCentroids();
	this.computeFaceNormals();

	// can't really use automatic vertex normals
	// as then front and back sides get smoothed too
	// should do separate smoothing just for sides

	//this.computeVertexNormals();

	//console.log( "took", ( Date.now() - startTime ) );

};

THREE.ExtrudeGeometry.prototype = new THREE.Geometry();
THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry;

THREE.ExtrudeGeometry.prototype.addShapeList = function(shapes, options) {
	var sl = shapes.length;
	
	for ( var s = 0; s < sl; s ++ ) {
		var shape = shapes[ s ];
		this.addShape( shape, options );
	}
};

THREE.ExtrudeGeometry.prototype.addShape = function( shape, options ) {

	var amount = options.amount !== undefined ? options.amount : 100;

	var bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6; // 10
	var bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 2; // 8
	var bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

	var bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true; // false

	var curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;

	var steps = options.steps !== undefined ? options.steps : 1;

	var bendPath = options.bendPath;

	var extrudePath = options.extrudePath;
	var extrudePts, extrudeByPath = false;

	var material = options.material;
	var extrudeMaterial = options.extrudeMaterial;

	var shapebb = this.shapebb;
	//shapebb = shape.getBoundingBox();



	var splineTube, binormal, normal, position2;
	if ( extrudePath ) {

		extrudePts = extrudePath.getSpacedPoints( steps );

		extrudeByPath = true;
		bevelEnabled = false; // bevels not supported for path extrusion

		// SETUP TNB variables

		// Reuse TNB from TubeGeomtry for now.
		// TODO1 - have a .isClosed in spline?
		splineTube = new THREE.TubeGeometry.FrenetFrames(extrudePath, steps, false);

		// console.log(splineTube, 'splineTube', splineTube.normals.length, 'steps', steps, 'extrudePts', extrudePts.length);

		binormal = new THREE.Vector3();
		normal = new THREE.Vector3();
		position2 = new THREE.Vector3();

	}

	// Safeguards if bevels are not enabled

	if ( ! bevelEnabled ) {

		bevelSegments = 0;
		bevelThickness = 0;
		bevelSize = 0;

	}

	// Variables initalization

	var ahole, h, hl; // looping of holes
	var scope = this;
	var bevelPoints = [];

	var shapesOffset = this.vertices.length;

	if ( bendPath ) {

		shape.addWrapPath( bendPath );

	}

	var shapePoints = shape.extractPoints();

    var vertices = shapePoints.shape;
	var holes = shapePoints.holes;

	var reverse = !THREE.Shape.Utils.isClockWise( vertices ) ;

	if ( reverse ) {

		vertices = vertices.reverse();

		// Maybe we should also check if holes are in the opposite direction, just to be safe ...

		for ( h = 0, hl = holes.length; h < hl; h ++ ) {

			ahole = holes[ h ];

			if ( THREE.Shape.Utils.isClockWise( ahole ) ) {

				holes[ h ] = ahole.reverse();

			}

		}

		reverse = false; // If vertices are in order now, we shouldn't need to worry about them again (hopefully)!

	}


	var faces = THREE.Shape.Utils.triangulateShape ( vertices, holes );
	//var faces = THREE.Shape.Utils.triangulate2( vertices, holes );

	// Would it be better to move points after triangulation?
	// shapePoints = shape.extractAllPointsWithBend( curveSegments, bendPath );
	// 	vertices = shapePoints.shape;
	// 	holes = shapePoints.holes;

	//console.log(faces);

	////
	///   Handle Vertices
	////

	var contour = vertices; // vertices has all points but contour has only points of circumference

	for ( h = 0, hl = holes.length;  h < hl; h ++ ) {

		ahole = holes[ h ];

		vertices = vertices.concat( ahole );

	}


	function scalePt2 ( pt, vec, size ) {

		if ( !vec ) console.log( "die" );

		return vec.clone().multiplyScalar( size ).addSelf( pt );

	}

	var b, bs, t, z,
		vert, vlen = vertices.length,
		face, flen = faces.length,
		cont, clen = contour.length;


	//------
	// Find directions for point movement
	//

	var RAD_TO_DEGREES = 180 / Math.PI;


	function getBevelVec( pt_i, pt_j, pt_k ) {

		// Algorithm 2

		return getBevelVec2( pt_i, pt_j, pt_k );

	}

	function getBevelVec1( pt_i, pt_j, pt_k ) {

		var anglea = Math.atan2( pt_j.y - pt_i.y, pt_j.x - pt_i.x );
		var angleb = Math.atan2( pt_k.y - pt_i.y, pt_k.x - pt_i.x );

		if ( anglea > angleb ) {

			angleb += Math.PI * 2;

		}

		var anglec = ( anglea + angleb ) / 2;


		//console.log('angle1', anglea * RAD_TO_DEGREES,'angle2', angleb * RAD_TO_DEGREES, 'anglec', anglec *RAD_TO_DEGREES);

		var x = - Math.cos( anglec );
		var y = - Math.sin( anglec );

		var vec = new THREE.Vector2( x, y ); //.normalize();

		return vec;

	}

	function getBevelVec2( pt_i, pt_j, pt_k ) {

		var a = THREE.ExtrudeGeometry.__v1,
			b = THREE.ExtrudeGeometry.__v2,
			v_hat = THREE.ExtrudeGeometry.__v3,
			w_hat = THREE.ExtrudeGeometry.__v4,
			p = THREE.ExtrudeGeometry.__v5,
			q = THREE.ExtrudeGeometry.__v6,
			v, w,
			v_dot_w_hat, q_sub_p_dot_w_hat,
			s, intersection;

		// good reading for line-line intersection
		// http://sputsoft.com/blog/2010/03/line-line-intersection.html

		// define a as vector j->i
		// define b as vectot k->i

		a.set( pt_i.x - pt_j.x, pt_i.y - pt_j.y );
		b.set( pt_i.x - pt_k.x, pt_i.y - pt_k.y );

		// get unit vectors

		v = a.normalize();
		w = b.normalize();

		// normals from pt i

		v_hat.set( -v.y, v.x );
		w_hat.set( w.y, -w.x );

		// pts from i

		p.copy( pt_i ).addSelf( v_hat );
		q.copy( pt_i ).addSelf( w_hat );

		if ( p.equals( q ) ) {

			//console.log("Warning: lines are straight");
			return w_hat.clone();

		}

		// Points from j, k. helps prevents points cross overover most of the time

		p.copy( pt_j ).addSelf( v_hat );
		q.copy( pt_k ).addSelf( w_hat );

		v_dot_w_hat = v.dot( w_hat );
		q_sub_p_dot_w_hat = q.subSelf( p ).dot( w_hat );

		// We should not reach these conditions

		if ( v_dot_w_hat === 0 ) {

			console.log( "Either infinite or no solutions!" );

			if ( q_sub_p_dot_w_hat === 0 ) {

				console.log( "Its finite solutions." );

			} else {

				console.log( "Too bad, no solutions." );

			}

		}

		s = q_sub_p_dot_w_hat / v_dot_w_hat;

		if ( s < 0 ) {

			// in case of emergecy, revert to algorithm 1.

			return getBevelVec1( pt_i, pt_j, pt_k );

		}

		intersection = v.multiplyScalar( s ).addSelf( p );

		return intersection.subSelf( pt_i ).clone(); // Don't normalize!, otherwise sharp corners become ugly

	}

	var contourMovements = [];

	for ( var i = 0, il = contour.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

		if ( j === il ) j = 0;
		if ( k === il ) k = 0;

		//  (j)---(i)---(k)
		// console.log('i,j,k', i, j , k)

		var pt_i = contour[ i ];
		var pt_j = contour[ j ];
		var pt_k = contour[ k ];

		contourMovements[ i ]= getBevelVec( contour[ i ], contour[ j ], contour[ k ] );

	}

	var holesMovements = [], oneHoleMovements, verticesMovements = contourMovements.concat();

	for ( h = 0, hl = holes.length; h < hl; h ++ ) {

		ahole = holes[ h ];

		oneHoleMovements = [];

		for ( i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

			if ( j === il ) j = 0;
			if ( k === il ) k = 0;

			//  (j)---(i)---(k)
			oneHoleMovements[ i ]= getBevelVec( ahole[ i ], ahole[ j ], ahole[ k ] );

		}

		holesMovements.push( oneHoleMovements );
		verticesMovements = verticesMovements.concat( oneHoleMovements );

	}


	// Loop bevelSegments, 1 for the front, 1 for the back

	for ( b = 0; b < bevelSegments; b ++ ) {
	//for ( b = bevelSegments; b > 0; b -- ) {

		t = b / bevelSegments;
		z = bevelThickness * ( 1 - t );

		//z = bevelThickness * t;
		bs = bevelSize * ( Math.sin ( t * Math.PI/2 ) ) ; // curved
		//bs = bevelSize * t ; // linear

		// contract shape

		for ( i = 0, il = contour.length; i < il; i ++ ) {

			vert = scalePt2( contour[ i ], contourMovements[ i ], bs );
			//vert = scalePt( contour[ i ], contourCentroid, bs, false );
			v( vert.x, vert.y,  - z );

		}

		// expand holes

		for ( h = 0, hl = holes.length; h < hl; h++ ) {

			ahole = holes[ h ];
			oneHoleMovements = holesMovements[ h ];

			for ( i = 0, il = ahole.length; i < il; i++ ) {

				vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );
				//vert = scalePt( ahole[ i ], holesCentroids[ h ], bs, true );

				v( vert.x, vert.y,  -z );

			}

		}

	}

	bs = bevelSize;

	// Back facing vertices

	for ( i = 0; i < vlen; i ++ ) {

		vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

		if ( !extrudeByPath ) {

			v( vert.x, vert.y, 0 );

		} else {

			// v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

			normal.copy(splineTube.normals[0]).multiplyScalar(vert.x);
			binormal.copy(splineTube.binormals[0]).multiplyScalar(vert.y);

			position2.copy(extrudePts[0]).addSelf(normal).addSelf(binormal);
			
			v(position2.x, position2.y, position2.z);

		}

	}

	// Add stepped vertices...
	// Including front facing vertices

	var s;

	for ( s = 1; s <= steps; s ++ ) {

		for ( i = 0; i < vlen; i ++ ) {

			vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

			if ( !extrudeByPath ) {

				v( vert.x, vert.y, amount / steps * s );

			} else {

				// v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );

				normal.copy(splineTube.normals[s]).multiplyScalar(vert.x);
				binormal.copy(splineTube.binormals[s]).multiplyScalar(vert.y);

				position2.copy(extrudePts[s]).addSelf(normal).addSelf(binormal);

				v(position2.x, position2.y, position2.z );

			}

		}

	}


	// Add bevel segments planes

	//for ( b = 1; b <= bevelSegments; b ++ ) {
	for ( b = bevelSegments - 1; b >= 0; b -- ) {

		t = b / bevelSegments;
		z = bevelThickness * ( 1 - t );
		//bs = bevelSize * ( 1-Math.sin ( ( 1 - t ) * Math.PI/2 ) );
		bs = bevelSize * Math.sin ( t * Math.PI/2 ) ;

		// contract shape

		for ( i = 0, il = contour.length; i < il; i ++ ) {

			vert = scalePt2( contour[ i ], contourMovements[ i ], bs );
			v( vert.x, vert.y,  amount + z );

		}

		// expand holes

		for ( h = 0, hl = holes.length; h < hl; h ++ ) {

			ahole = holes[ h ];
			oneHoleMovements = holesMovements[ h ];

			for ( i = 0, il = ahole.length; i < il; i++ ) {

				vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

				if ( !extrudeByPath ) {

					v( vert.x, vert.y,  amount + z );

				} else {

					v( vert.x, vert.y + extrudePts[ steps - 1 ].y, extrudePts[ steps - 1 ].x + z );

				}

			}

		}

	}

	// set UV generator
	var uvgen = THREE.ExtrudeGeometry.WorldUVGenerator;

	////
	///   Handle Faces
	////

	// Top and bottom faces
	buildLidFaces();

	// Sides faces
	buildSideFaces();


	/////  Internal functions

	function buildLidFaces() {
		if ( bevelEnabled ) {

			var layer = 0 ; // steps + 1
			var offset = vlen * layer;

			// Bottom faces
			
			for ( i = 0; i < flen; i ++ ) {

				face = faces[ i ];
				f3( face[ 2 ]+ offset, face[ 1 ]+ offset, face[ 0 ] + offset, true );

			}

			layer = steps + bevelSegments * 2;
			offset = vlen * layer;

			// Top faces

			for ( i = 0; i < flen; i ++ ) {
				face = faces[ i ];
				f3( face[ 0 ] + offset, face[ 1 ] + offset, face[ 2 ] + offset, false );
			}
		} else {
		
			// Bottom faces

			for ( i = 0; i < flen; i++ ) {
				face = faces[ i ];
				f3( face[ 2 ], face[ 1 ], face[ 0 ], true );
			}

			// Top faces

			for ( i = 0; i < flen; i ++ ) {
				face = faces[ i ];
				f3( face[ 0 ] + vlen * steps, face[ 1 ] + vlen * steps, face[ 2 ] + vlen * steps, false );
			}
		}
	}

	// Create faces for the z-sides of the shape

	function buildSideFaces() {
		var layeroffset = 0;
		sidewalls( contour, layeroffset );
		layeroffset += contour.length;

		for ( h = 0, hl = holes.length;  h < hl; h ++ ) {
			ahole = holes[ h ];
			sidewalls( ahole, layeroffset );

			//, true
			layeroffset += ahole.length;
		}
	}

	function sidewalls( contour, layeroffset ) {
		var j, k;
		i = contour.length;

		while ( --i >= 0 ) {
			j = i;
			k = i - 1;
			if ( k < 0 ) k = contour.length - 1;

			//console.log('b', i,j, i-1, k,vertices.length);

			var s = 0, sl = steps  + bevelSegments * 2;

			for ( s = 0; s < sl; s ++ ) {
				var slen1 = vlen * s;
				var slen2 = vlen * ( s + 1 );
				var a = layeroffset + j + slen1,
					b = layeroffset + k + slen1,
					c = layeroffset + k + slen2,
					d = layeroffset + j + slen2;

				f4( a, b, c, d, contour, s, sl );
			}
		}
	}


	function v( x, y, z ) {
		scope.vertices.push( new THREE.Vector3( x, y, z ) );
	}

	function f3( a, b, c, isBottom ) {
		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;

		// normal, color, material
		scope.faces.push( new THREE.Face3( a, b, c, null, null, material ) );

		var uvs = isBottom ? uvgen.generateBottomUV( scope, shape, options, a, b, c)
		                   : uvgen.generateTopUV( scope, shape, options, a, b, c);

 		scope.faceVertexUvs[ 0 ].push(uvs);
	}

	function f4( a, b, c, d, wallContour, stepIndex, stepsLength ) {
		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;
		d += shapesOffset;

 		scope.faces.push( new THREE.Face4( a, b, c, d, null, null, extrudeMaterial ) );
 
 		var uvs = uvgen.generateSideWallUV( scope, shape, wallContour, options, a, b, c, d, stepIndex, stepsLength);
 		scope.faceVertexUvs[ 0 ].push(uvs);
	}

};



THREE.ExtrudeGeometry.WorldUVGenerator = {
	generateTopUV: function( geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		var ax = geometry.vertices[ indexA ].x,
			ay = geometry.vertices[ indexA ].y,

			bx = geometry.vertices[ indexB ].x,
			by = geometry.vertices[ indexB ].y,

			cx = geometry.vertices[ indexC ].x,
			cy = geometry.vertices[ indexC ].y;
			
		return [
			new THREE.UV( ax, 1 - ay ),
			new THREE.UV( bx, 1 - by ),
			new THREE.UV( cx, 1 - cy )
		];
	},

	generateBottomUV: function( geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		return this.generateTopUV( geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC );
	},

	generateSideWallUV: function( geometry, extrudedShape, wallContour, extrudeOptions,
	                              indexA, indexB, indexC, indexD, stepIndex, stepsLength) {
		var ax = geometry.vertices[ indexA ].x,
			ay = geometry.vertices[ indexA ].y,
			az = geometry.vertices[ indexA ].z,

			bx = geometry.vertices[ indexB ].x,
			by = geometry.vertices[ indexB ].y,
			bz = geometry.vertices[ indexB ].z,

			cx = geometry.vertices[ indexC ].x,
			cy = geometry.vertices[ indexC ].y,
			cz = geometry.vertices[ indexC ].z,

			dx = geometry.vertices[ indexD ].x,
			dy = geometry.vertices[ indexD ].y,
			dz = geometry.vertices[ indexD ].z;
		
		if ( Math.abs( ay - by ) < 0.01 ) {
			return [
				new THREE.UV( ax, az ),
				new THREE.UV( bx, bz ),
				new THREE.UV( cx, cz ),
				new THREE.UV( dx, dz )
			];
		} else {
			return [
				new THREE.UV( ay, az ),
				new THREE.UV( by, bz ),
				new THREE.UV( cy, cz ),
				new THREE.UV( dy, dz )
			];
		}
	}
};

THREE.ExtrudeGeometry.__v1 = new THREE.Vector2();
THREE.ExtrudeGeometry.__v2 = new THREE.Vector2();
THREE.ExtrudeGeometry.__v3 = new THREE.Vector2();
THREE.ExtrudeGeometry.__v4 = new THREE.Vector2();
THREE.ExtrudeGeometry.__v5 = new THREE.Vector2();
THREE.ExtrudeGeometry.__v6 = new THREE.Vector2();
/**
 * @author astrodud / http://astrodud.isgreat.org/
 * @author zz85 / https://github.com/zz85
 */

THREE.LatheGeometry = function ( points, steps, angle ) {

	THREE.Geometry.call( this );

	var _steps = steps || 12;
	var _angle = angle || 2 * Math.PI;

	var _newV = [];
	var _matrix = new THREE.Matrix4().makeRotationZ( _angle / _steps );

	for ( var j = 0; j < points.length; j ++ ) {

		_newV[ j ] = points[ j ].clone();
		this.vertices.push( _newV[ j ] );

	}

	var i, il = _steps + 1;

	for ( i = 0; i < il; i ++ ) {

		for ( var j = 0; j < _newV.length; j ++ ) {

			_newV[ j ] = _matrix.multiplyVector3( _newV[ j ].clone() );
			this.vertices.push( _newV[ j ] );

		}

	}

	for ( i = 0; i < _steps; i ++ ) {

		for ( var k = 0, kl = points.length; k < kl - 1; k ++ ) {

			var a = i * kl + k;
			var b = ( ( i + 1 ) % il ) * kl + k;
			var c = ( ( i + 1 ) % il ) * kl + ( k + 1 ) % kl;
			var d = i * kl + ( k + 1 ) % kl;

			this.faces.push( new THREE.Face4( a, b, c, d ) );

			this.faceVertexUvs[ 0 ].push( [

				new THREE.UV( 1 - i / _steps, k / kl ),
				new THREE.UV( 1 - ( i + 1 ) / _steps, k / kl ),
				new THREE.UV( 1 - ( i + 1 ) / _steps, ( k + 1 ) / kl ),
				new THREE.UV( 1 - i / _steps, ( k + 1 ) / kl )
				
			] );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.LatheGeometry.prototype = new THREE.Geometry();
THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry;
/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry = function ( width, depth, segmentsWidth, segmentsDepth ) {

	THREE.Geometry.call( this );

	var ix, iz,
	width_half = width / 2,
	depth_half = depth / 2,
	gridX = segmentsWidth || 1,
	gridZ = segmentsDepth || 1,
	gridX1 = gridX + 1,
	gridZ1 = gridZ + 1,
	segment_width = width / gridX,
	segment_depth = depth / gridZ,
	normal = new THREE.Vector3( 0, 1, 0 );

	for ( iz = 0; iz < gridZ1; iz ++ ) {

		for ( ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * segment_width - width_half;
			var z = iz * segment_depth - depth_half;

			this.vertices.push( new THREE.Vector3( x, 0, z ) );

		}

	}

	for ( iz = 0; iz < gridZ; iz ++ ) {

		for ( ix = 0; ix < gridX; ix ++ ) {

			var a = ix + gridX1 * iz;
			var b = ix + gridX1 * ( iz + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iz + 1 );
			var d = ( ix + 1 ) + gridX1 * iz;

			var face = new THREE.Face4( a, b, c, d );
			face.normal.copy( normal );
			face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );

			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [
				new THREE.UV( ix / gridX, iz / gridZ ),
				new THREE.UV( ix / gridX, ( iz + 1 ) / gridZ ),
				new THREE.UV( ( ix + 1 ) / gridX, ( iz + 1 ) / gridZ ),
				new THREE.UV( ( ix + 1 ) / gridX, iz / gridZ )
			] );

		}

	}

	this.computeCentroids();

};

THREE.PlaneGeometry.prototype = new THREE.Geometry();
THREE.PlaneGeometry.prototype.constructor = THREE.PlaneGeometry;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SphereGeometry = function ( radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	radius = radius || 50;

	phiStart = phiStart !== undefined ? phiStart : 0;
	phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

	var segmentsX = Math.max( 3, Math.floor( segmentsWidth ) || 8 );
	var segmentsY = Math.max( 2, Math.floor( segmentsHeight ) || 6 );

	var x, y, vertices = [], uvs = [];

	for ( y = 0; y <= segmentsY; y ++ ) {

		var verticesRow = [];
		var uvsRow = [];

		for ( x = 0; x <= segmentsX; x ++ ) {

			var u = x / segmentsX;
			var v = y / segmentsY;

			var vertex = new THREE.Vector3();
			vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
			vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			this.vertices.push( vertex );

			verticesRow.push( this.vertices.length - 1 );
			uvsRow.push( new THREE.UV( u, v ) );

		}

		vertices.push( verticesRow );
		uvs.push( uvsRow );

	}

	for ( y = 0; y < segmentsY; y ++ ) {

		for ( x = 0; x < segmentsX; x ++ ) {

			var v1 = vertices[ y ][ x + 1 ];
			var v2 = vertices[ y ][ x ];
			var v3 = vertices[ y + 1 ][ x ];
			var v4 = vertices[ y + 1 ][ x + 1 ];

			var n1 = this.vertices[ v1 ].clone().normalize();
			var n2 = this.vertices[ v2 ].clone().normalize();
			var n3 = this.vertices[ v3 ].clone().normalize();
			var n4 = this.vertices[ v4 ].clone().normalize();

			var uv1 = uvs[ y ][ x + 1 ].clone();
			var uv2 = uvs[ y ][ x ].clone();
			var uv3 = uvs[ y + 1 ][ x ].clone();
			var uv4 = uvs[ y + 1 ][ x + 1 ].clone();

			if ( Math.abs( this.vertices[ v1 ].y ) == radius ) {

				this.faces.push( new THREE.Face3( v1, v3, v4, [ n1, n3, n4 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv3, uv4 ] );

			} else if ( Math.abs( this.vertices[ v3 ].y ) ==  radius ) {

				this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

			} else {

				this.faces.push( new THREE.Face4( v1, v2, v3, v4, [ n1, n2, n3, n4 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3, uv4 ] );

			}

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();

	this.boundingSphere = { radius: radius };

};

THREE.SphereGeometry.prototype = new THREE.Geometry();
THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry;
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author alteredq / http://alteredqualia.com/
 *
 * For creating 3D text geometry in three.js
 *
 * Text = 3D Text
 *
 * parameters = {
 *  size: 			<float>, 	// size of the text
 *  height: 		<float>, 	// thickness to extrude text
 *  curveSegments: 	<int>,		// number of points on the curves
 *
 *  font: 			<string>,		// font name
 *  weight: 		<string>,		// font weight (normal, bold)
 *  style: 			<string>,		// font style  (normal, italics)
 *
 *  bevelEnabled:	<bool>,			// turn on bevel
 *  bevelThickness: <float>, 		// how deep into text bevel goes
 *  bevelSize:		<float>, 		// how far from text outline is bevel
 *
 *  bend:			<bool>			// bend according to hardcoded curve (generates bendPath)
 *  bendPath:       <curve>         // wraps text according to bend Path
 *  }
 *
 * It uses techniques used in:
 *
 * 	typeface.js and canvastext
 * 		For converting fonts and rendering with javascript
 *		http://typeface.neocracy.org
 *
 *	Triangulation ported from AS3
 *		Simple Polygon Triangulation
 *		http://actionsnippet.com/?p=1462
 *
 * 	A Method to triangulate shapes with holes
 *		http://www.sakri.net/blog/2009/06/12/an-approach-to-triangulating-polygons-with-holes/
 *
 */
/*	Usage Examples
	
	// TextGeometry wrapper

	var text3d = new TextGeometry( text, options );

	// Complete manner

	var textPath = new THREE.TextPath( text, options );
	var textShapes = textPath.toShapes();
	var text3d = new ExtrudeGeometry( textShapes, options );
	
*/


THREE.TextGeometry = function ( text, parameters ) {

	var textPath = new THREE.TextPath( text, parameters );
	var textShapes = textPath.toShapes();

	// translate parameters to ExtrudeGeometry API

	parameters.amount = parameters.height !== undefined ? parameters.height : 50;

	// defaults

	if ( parameters.bevelThickness === undefined ) parameters.bevelThickness = 10;
	if ( parameters.bevelSize === undefined ) parameters.bevelSize = 8;
	if ( parameters.bevelEnabled === undefined ) parameters.bevelEnabled = false;

	if ( parameters.bend ) {

		var b = textShapes[ textShapes.length - 1 ].getBoundingBox();
		var max = b.maxX;

		parameters.bendPath = new THREE.QuadraticBezierCurve( new THREE.Vector2( 0, 0 ),
															  new THREE.Vector2( max / 2, 120 ),
															  new THREE.Vector2( max, 0 ) );

	}

	THREE.ExtrudeGeometry.call( this, textShapes, parameters );

};

THREE.TextGeometry.prototype = new THREE.ExtrudeGeometry();
THREE.TextGeometry.prototype.constructor = THREE.TextGeometry;


THREE.FontUtils = {

	faces : {},

	// Just for now. face[weight][style]

	face : "helvetiker",
	weight: "normal",
	style : "normal",
	size : 150,
	divisions : 10,

	getFace : function() {

		return this.faces[ this.face ][ this.weight ][ this.style ];

	},

	loadFace : function( data ) {

		var family = data.familyName.toLowerCase();

		var ThreeFont = this;

		ThreeFont.faces[ family ] = ThreeFont.faces[ family ] || {};

		ThreeFont.faces[ family ][ data.cssFontWeight ] = ThreeFont.faces[ family ][ data.cssFontWeight ] || {};
		ThreeFont.faces[ family ][ data.cssFontWeight ][ data.cssFontStyle ] = data;

		var face = ThreeFont.faces[ family ][ data.cssFontWeight ][ data.cssFontStyle ] = data;

		return data;

	},

	drawText : function( text ) {

		var characterPts = [], allPts = [];

		// RenderText

		var i, p,
			face = this.getFace(),
			scale = this.size / face.resolution,
			offset = 0,
			chars = String( text ).split( '' ),
			length = chars.length;

		var fontPaths = [];

		for ( i = 0; i < length; i ++ ) {

			var path = new THREE.Path();

			var ret = this.extractGlyphPoints( chars[ i ], face, scale, offset, path );
			offset += ret.offset;
			//characterPts.push( ret.points );
			//allPts = allPts.concat( ret.points );
			fontPaths.push( ret.path );

		}

		// get the width

		var width = offset / 2;
		//
		// for ( p = 0; p < allPts.length; p++ ) {
		//
		// 	allPts[ p ].x -= width;
		//
		// }

		//var extract = this.extractPoints( allPts, characterPts );
		//extract.contour = allPts;

		//extract.paths = fontPaths;
		//extract.offset = width;

		return { paths : fontPaths, offset : width };

	},




	extractGlyphPoints : function( c, face, scale, offset, path ) {

		var pts = [];

		var i, i2, divisions,
			outline, action, length,
			scaleX, scaleY,
			x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2,
			laste,
			glyph = face.glyphs[ c ] || face.glyphs[ '?' ];

		if ( !glyph ) return;

		if ( glyph.o ) {

			outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );
			length = outline.length;

			scaleX = scale;
			scaleY = scale;

			for ( i = 0; i < length; ) {

				action = outline[ i ++ ];

				//console.log( action );

				switch( action ) {

				case 'm':

					// Move To

					x = outline[ i++ ] * scaleX + offset;
					y = outline[ i++ ] * scaleY;

					pts.push( new THREE.Vector2( x, y ) );

					path.moveTo( x, y );
					break;

				case 'l':

					// Line To

					x = outline[ i++ ] * scaleX + offset;
					y = outline[ i++ ] * scaleY;
					pts.push( new THREE.Vector2( x, y ) );
					path.lineTo(x,y);
					break;

				case 'q':

					// QuadraticCurveTo

					cpx  = outline[ i++ ] * scaleX + offset;
					cpy  = outline[ i++ ] * scaleY;
					cpx1 = outline[ i++ ] * scaleX + offset;
					cpy1 = outline[ i++ ] * scaleY;

					path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);

					laste = pts[ pts.length - 1 ];

					if ( laste ) {

						cpx0 = laste.x;
						cpy0 = laste.y;

						for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2 ++ ) {

							var t = i2 / divisions;
							var tx = THREE.Shape.Utils.b2( t, cpx0, cpx1, cpx );
							var ty = THREE.Shape.Utils.b2( t, cpy0, cpy1, cpy );
							pts.push( new THREE.Vector2( tx, ty ) );

					  }

				  }

				  break;

				case 'b':

					// Cubic Bezier Curve

					cpx  = outline[ i++ ] *  scaleX + offset;
					cpy  = outline[ i++ ] *  scaleY;
					cpx1 = outline[ i++ ] *  scaleX + offset;
					cpy1 = outline[ i++ ] * -scaleY;
					cpx2 = outline[ i++ ] *  scaleX + offset;
					cpy2 = outline[ i++ ] * -scaleY;

					path.bezierCurveTo( cpx, cpy, cpx1, cpy1, cpx2, cpy2 );

					laste = pts[ pts.length - 1 ];

					if ( laste ) {

						cpx0 = laste.x;
						cpy0 = laste.y;

						for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2 ++ ) {

							var t = i2 / divisions;
							var tx = THREE.Shape.Utils.b3( t, cpx0, cpx1, cpx2, cpx );
							var ty = THREE.Shape.Utils.b3( t, cpy0, cpy1, cpy2, cpy );
							pts.push( new THREE.Vector2( tx, ty ) );

						}

					}

					break;

				}

			}
		}



		return { offset: glyph.ha*scale, points:pts, path:path};
	}

};



/**
 * This code is a quick port of code written in C++ which was submitted to
 * flipcode.com by John W. Ratcliff  // July 22, 2000
 * See original code and more information here:
 * http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
 *
 * ported to actionscript by Zevan Rosser
 * www.actionsnippet.com
 *
 * ported to javascript by Joshua Koo
 * http://www.lab4games.net/zz85/blog
 *
 */


( function( namespace ) {

	var EPSILON = 0.0000000001;

	// takes in an contour array and returns

	var process = function( contour, indices ) {

		var n = contour.length;

		if ( n < 3 ) return null;

		var result = [],
			verts = [],
			vertIndices = [];

		/* we want a counter-clockwise polygon in verts */

		var u, v, w;

		if ( area( contour ) > 0.0 ) {

			for ( v = 0; v < n; v++ ) verts[ v ] = v;

		} else {

			for ( v = 0; v < n; v++ ) verts[ v ] = ( n - 1 ) - v;

		}

		var nv = n;

		/*  remove nv - 2 vertices, creating 1 triangle every time */

		var count = 2 * nv;   /* error detection */

		for( v = nv - 1; nv > 2; ) {

			/* if we loop, it is probably a non-simple polygon */

			if ( ( count-- ) <= 0 ) {

				//** Triangulate: ERROR - probable bad polygon!

				//throw ( "Warning, unable to triangulate polygon!" );
				//return null;
				// Sometimes warning is fine, especially polygons are triangulated in reverse.
				console.log( "Warning, unable to triangulate polygon!" );

				if ( indices ) return vertIndices;
				return result;

			}

			/* three consecutive vertices in current polygon, <u,v,w> */

			u = v; 	 	if ( nv <= u ) u = 0;     /* previous */
			v = u + 1;  if ( nv <= v ) v = 0;     /* new v    */
			w = v + 1;  if ( nv <= w ) w = 0;     /* next     */

			if ( snip( contour, u, v, w, nv, verts ) ) {

				var a, b, c, s, t;

				/* true names of the vertices */

				a = verts[ u ];
				b = verts[ v ];
				c = verts[ w ];

				/* output Triangle */

				/*
				result.push( contour[ a ] );
				result.push( contour[ b ] );
				result.push( contour[ c ] );
				*/
				result.push( [ contour[ a ],
					contour[ b ],
					contour[ c ] ] );


				vertIndices.push( [ verts[ u ], verts[ v ], verts[ w ] ] );

				/* remove v from the remaining polygon */

				for( s = v, t = v + 1; t < nv; s++, t++ ) {

					verts[ s ] = verts[ t ];

				}

				nv--;

				/* reset error detection counter */

				count = 2 * nv;

			}

		}

		if ( indices ) return vertIndices;
		return result;

	};

	// calculate area of the contour polygon

	var area = function ( contour ) {

		var n = contour.length;
		var a = 0.0;

		for( var p = n - 1, q = 0; q < n; p = q++ ) {

			a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

		}

		return a * 0.5;

	};

	// see if p is inside triangle abc

	var insideTriangle = function( ax, ay,
								   bx, by,
								   cx, cy,
								   px, py ) {

		  var aX, aY, bX, bY;
		  var cX, cY, apx, apy;
		  var bpx, bpy, cpx, cpy;
		  var cCROSSap, bCROSScp, aCROSSbp;

		  aX = cx - bx;  aY = cy - by;
		  bX = ax - cx;  bY = ay - cy;
		  cX = bx - ax;  cY = by - ay;
		  apx= px  -ax;  apy= py - ay;
		  bpx= px - bx;  bpy= py - by;
		  cpx= px - cx;  cpy= py - cy;

		  aCROSSbp = aX*bpy - aY*bpx;
		  cCROSSap = cX*apy - cY*apx;
		  bCROSScp = bX*cpy - bY*cpx;

		  return ( (aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0) );

	};


	var snip = function ( contour, u, v, w, n, verts ) {

		var p;
		var ax, ay, bx, by;
		var cx, cy, px, py;

		ax = contour[ verts[ u ] ].x;
		ay = contour[ verts[ u ] ].y;

		bx = contour[ verts[ v ] ].x;
		by = contour[ verts[ v ] ].y;

		cx = contour[ verts[ w ] ].x;
		cy = contour[ verts[ w ] ].y;

		if ( EPSILON > (((bx-ax)*(cy-ay)) - ((by-ay)*(cx-ax))) ) return false;

			for ( p = 0; p < n; p++ ) {

				if( (p == u) || (p == v) || (p == w) ) continue;

				px = contour[ verts[ p ] ].x
				py = contour[ verts[ p ] ].y

				if ( insideTriangle( ax, ay, bx, by, cx, cy, px, py ) ) return false;

		  }

		  return true;

	};


	namespace.Triangulate = process;
	namespace.Triangulate.area = area;

	return namespace;

})(THREE.FontUtils);

// To use the typeface.js face files, hook up the API
self._typeface_js = { faces: THREE.FontUtils.faces, loadFace: THREE.FontUtils.loadFace };
/**
 * @author oosmoxiecode
 * @author mr.doob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 */

THREE.TorusGeometry = function ( radius, tube, segmentsR, segmentsT, arc ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 100;
	this.tube = tube || 40;
	this.segmentsR = segmentsR || 8;
	this.segmentsT = segmentsT || 6;
	this.arc = arc || Math.PI * 2;

	var center = new THREE.Vector3(), uvs = [], normals = [];

	for ( var j = 0; j <= this.segmentsR; j ++ ) {

		for ( var i = 0; i <= this.segmentsT; i ++ ) {

			var u = i / this.segmentsT * this.arc;
			var v = j / this.segmentsR * Math.PI * 2;

			center.x = this.radius * Math.cos( u );
			center.y = this.radius * Math.sin( u );

			var vertex = new THREE.Vector3();
			vertex.x = ( this.radius + this.tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( this.radius + this.tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = this.tube * Math.sin( v );

			this.vertices.push( vertex );

			uvs.push( new THREE.UV( i / this.segmentsT, 1 - j / this.segmentsR ) );
			normals.push( vertex.clone().subSelf( center ).normalize() );

		}
	}


	for ( var j = 1; j <= this.segmentsR; j ++ ) {

		for ( var i = 1; i <= this.segmentsT; i ++ ) {

			var a = ( this.segmentsT + 1 ) * j + i - 1;
			var b = ( this.segmentsT + 1 ) * ( j - 1 ) + i - 1;
			var c = ( this.segmentsT + 1 ) * ( j - 1 ) + i;
			var d = ( this.segmentsT + 1 ) * j + i;

			var face = new THREE.Face4( a, b, c, d, [ normals[ a ], normals[ b ], normals[ c ], normals[ d ] ] );
			face.normal.addSelf( normals[ a ] );
			face.normal.addSelf( normals[ b ] );
			face.normal.addSelf( normals[ c ] );
			face.normal.addSelf( normals[ d ] );
			face.normal.normalize();

			this.faces.push( face );

			this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );
		}

	}

	this.computeCentroids();

};

THREE.TorusGeometry.prototype = new THREE.Geometry();
THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry;
/**
 * @author oosmoxiecode
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3D/src/away3d/primitives/TorusKnot.as?spec=svn2473&r=2473
 */

THREE.TorusKnotGeometry = function ( radius, tube, segmentsR, segmentsT, p, q, heightScale ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 200;
	this.tube = tube || 40;
	this.segmentsR = segmentsR || 64;
	this.segmentsT = segmentsT || 8;
	this.p = p || 2;
	this.q = q || 3;
	this.heightScale = heightScale || 1;
	this.grid = new Array(this.segmentsR);

	var tang = new THREE.Vector3();
	var n = new THREE.Vector3();
	var bitan = new THREE.Vector3();

	for ( var i = 0; i < this.segmentsR; ++ i ) {

		this.grid[ i ] = new Array( this.segmentsT );

		for ( var j = 0; j < this.segmentsT; ++ j ) {

			var u = i / this.segmentsR * 2 * this.p * Math.PI;
			var v = j / this.segmentsT * 2 * Math.PI;
			var p1 = getPos( u, v, this.q, this.p, this.radius, this.heightScale );
			var p2 = getPos( u + 0.01, v, this.q, this.p, this.radius, this.heightScale );
			var cx, cy;

			tang.sub( p2, p1 );
			n.add( p2, p1 );

			bitan.cross( tang, n );
			n.cross( bitan, tang );
			bitan.normalize();
			n.normalize();

			cx = - this.tube * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			cy = this.tube * Math.sin( v );

			p1.x += cx * n.x + cy * bitan.x;
			p1.y += cx * n.y + cy * bitan.y;
			p1.z += cx * n.z + cy * bitan.z;

			this.grid[ i ][ j ] = vert( p1.x, p1.y, p1.z );

		}

	}

	for ( var i = 0; i < this.segmentsR; ++ i ) {

		for ( var j = 0; j < this.segmentsT; ++ j ) {

			var ip = ( i + 1 ) % this.segmentsR;
			var jp = ( j + 1 ) % this.segmentsT;

			var a = this.grid[ i ][ j ];
			var b = this.grid[ ip ][ j ];
			var c = this.grid[ ip ][ jp ];
			var d = this.grid[ i ][ jp ];

			var uva = new THREE.UV( i / this.segmentsR, j / this.segmentsT );
			var uvb = new THREE.UV( ( i + 1 ) / this.segmentsR, j / this.segmentsT );
			var uvc = new THREE.UV( ( i + 1 ) / this.segmentsR, ( j + 1 ) / this.segmentsT );
			var uvd = new THREE.UV( i / this.segmentsR, ( j + 1 ) / this.segmentsT );

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva,uvb,uvc, uvd ] );

		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vector3( x, y, z ) ) - 1;

	}

	function getPos( u, v, in_q, in_p, radius, heightScale ) {

		var cu = Math.cos( u );
		var cv = Math.cos( v );
		var su = Math.sin( u );
		var quOverP = in_q / in_p * u;
		var cs = Math.cos( quOverP );

		var tx = radius * ( 2 + cs ) * 0.5 * cu;
		var ty = radius * ( 2 + cs ) * su * 0.5;
		var tz = heightScale * radius * Math.sin( quOverP ) * 0.5;

		return new THREE.Vector3( tx, ty, tz );

	}

};

THREE.TorusKnotGeometry.prototype = new THREE.Geometry();
THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry;
/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 *
 * Modified from the TorusKnotGeometry by @oosmoxiecode
 *
 * Creates a tube which extrudes along a 3d spline
 *
 * Uses parallel transport frames as described in
 * http://www.cs.indiana.edu/pub/techreports/TR425.pdf
 */

THREE.TubeGeometry = function( path, segments, radius, segmentsRadius, closed, debug ) {

	THREE.Geometry.call( this );

	this.path = path;
	this.segments = segments || 64;
	this.radius = radius || 1;
	this.segmentsRadius = segmentsRadius || 8;
	this.closed = closed || false;
	if ( debug ) this.debug = new THREE.Object3D();

	this.grid = [];

	var scope = this,

		tangent,
		normal,
		binormal,

		numpoints = this.segments + 1,
		
		x, y, z,
		tx, ty, tz,
		u, v,

		cx, cy,
		pos, pos2 = new THREE.Vector3(),
		i, j,
		ip, jp,
		a, b, c, d,
		uva, uvb, uvc, uvd;

	var frames = new THREE.TubeGeometry.FrenetFrames(path, segments, closed),
		tangents = frames.tangents,
		normals = frames.normals,
		binormals = frames.binormals;

	// proxy internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	
	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vector3( x, y, z ) ) - 1;

	}




	// consruct the grid

	for ( i = 0; i < numpoints; i++ ) {

		this.grid[ i ] = [];

		u = i / ( numpoints - 1 );

		pos = path.getPointAt( u );

		tangent = tangents[ i ];
		normal = normals[ i ];
		binormal = binormals[ i ];

		if ( this.debug ) {

			this.debug.add(new THREE.ArrowHelper(tangent, pos, radius, 0x0000ff));	
			this.debug.add(new THREE.ArrowHelper(normal, pos, radius, 0xff0000));
			this.debug.add(new THREE.ArrowHelper(binormal, pos, radius, 0x00ff00));

		}

		for ( j = 0; j < this.segmentsRadius; j++ ) {

			v = j / this.segmentsRadius * 2 * Math.PI;

			cx = -this.radius * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			cy = this.radius * Math.sin( v );

            pos2.copy( pos );
            pos2.x += cx * normal.x + cy * binormal.x;
            pos2.y += cx * normal.y + cy * binormal.y;
            pos2.z += cx * normal.z + cy * binormal.z;

            this.grid[ i ][ j ] = vert( pos2.x, pos2.y, pos2.z );

		}
	}


	// construct the mesh

	for ( i = 0; i < this.segments; i++ ) {

		for ( j = 0; j < this.segmentsRadius; j++ ) {

			ip = ( closed ) ? (i + 1) % this.segments : i + 1;
			jp = (j + 1) % this.segmentsRadius;

			a = this.grid[ i ][ j ];		// *** NOT NECESSARILY PLANAR ! ***
			b = this.grid[ ip ][ j ];
			c = this.grid[ ip ][ jp ];
			d = this.grid[ i ][ jp ];

			uva = new THREE.UV( i / this.segments, j / this.segmentsRadius );
			uvb = new THREE.UV( ( i + 1 ) / this.segments, j / this.segmentsRadius );
			uvc = new THREE.UV( ( i + 1 ) / this.segments, ( j + 1 ) / this.segmentsRadius );
			uvd = new THREE.UV( i / this.segments, ( j + 1 ) / this.segmentsRadius );

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc, uvd ] );

		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.TubeGeometry.prototype = new THREE.Geometry();
THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry;


// For computing of Frenet frames, exposing the tangents, normals and binormals the spline
THREE.TubeGeometry.FrenetFrames = function(path, segments, closed) {

	var 
		tangent = new THREE.Vector3(),
		normal = new THREE.Vector3(),
		binormal = new THREE.Vector3(),

		tangents = [],
		normals = [],
		binormals = [],

		vec = new THREE.Vector3(),
		mat = new THREE.Matrix4(),

		numpoints = segments + 1,
		theta,
		epsilon = 0.0001,
		smallest,

		tx, ty, tz,
		i, u, v;


	// expose internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	// compute the tangent vectors for each segment on the path

	for ( i = 0; i < numpoints; i++ ) {

		u = i / ( numpoints - 1 );

		tangents[ i ] = path.getTangentAt( u );
		tangents[ i ].normalize();

	}

	initialNormal3();

	function initialNormal1(lastBinormal) {
		// fixed start binormal. Has dangers of 0 vectors
		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		if (lastBinormal===undefined) lastBinormal = new THREE.Vector3( 0, 0, 1 );
		normals[ 0 ].cross( lastBinormal, tangents[ 0 ] ).normalize();
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] ).normalize();
	}

	function initialNormal2() {

		// This uses the Frenet-Serret formula for deriving binormal
		var t2 = path.getTangentAt( epsilon );

		normals[ 0 ] = new THREE.Vector3().sub( t2, tangents[ 0 ] ).normalize();
		binormals[ 0 ] = new THREE.Vector3().cross( tangents[ 0 ], normals[ 0 ] );

		normals[ 0 ].cross( binormals[ 0 ], tangents[ 0 ] ).normalize(); // last binormal x tangent
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] ).normalize();

	}

	function initialNormal3() {
		// select an initial normal vector perpenicular to the first tangent vector,
		// and in the direction of the smallest tangent xyz component

		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		smallest = Number.MAX_VALUE;
		tx = Math.abs( tangents[ 0 ].x );
		ty = Math.abs( tangents[ 0 ].y );
		tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= smallest ) {
			smallest = tx;
			normal.set( 1, 0, 0 );
		}

		if ( ty <= smallest ) {
			smallest = ty;
			normal.set( 0, 1, 0 );
		}

		if ( tz <= smallest ) {
			normal.set( 0, 0, 1 );
		}

		vec.cross( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].cross( tangents[ 0 ], vec );
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] );
	}


	// compute the slowly-varying normal and binormal vectors for each segment on the path

	for ( i = 1; i < numpoints; i++ ) {

		normals[ i ] = normals[ i-1 ].clone();

		binormals[ i ] = binormals[ i-1 ].clone();

		vec.cross( tangents[ i-1 ], tangents[ i ] );

		if ( vec.length() > epsilon ) {

			vec.normalize();

			theta = Math.acos( tangents[ i-1 ].dot( tangents[ i ] ) );

			mat.makeRotationAxis( vec, theta ).multiplyVector3( normals[ i ] );

		}

		binormals[ i ].cross( tangents[ i ], normals[ i ] );

	}


	// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

	if ( closed ) {

		theta = Math.acos( normals[ 0 ].dot( normals[ numpoints-1 ] ) );
		theta /= ( numpoints - 1 );

		if ( tangents[ 0 ].dot( vec.cross( normals[ 0 ], normals[ numpoints-1 ] ) ) > 0 ) {

			theta = -theta;

		}

		for ( i = 1; i < numpoints; i++ ) {

			// twist a little...
			mat.makeRotationAxis( tangents[ i ], theta * i ).multiplyVector3( normals[ i ] );
			binormals[ i ].cross( tangents[ i ], normals[ i ] );

		}

	}
};
/**
 * @author clockworkgeek / https://github.com/clockworkgeek
 * @author timothypratley / https://github.com/timothypratley
 */

THREE.PolyhedronGeometry = function ( vertices, faces, radius, detail ) {

	THREE.Geometry.call( this );

	radius = radius || 1;
	detail = detail || 0;

	var that = this;

	for ( var i = 0, l = vertices.length; i < l; i ++ ) {

		prepare( new THREE.Vector3( vertices[ i ][ 0 ], vertices[ i ][ 1 ], vertices[ i ][ 2 ] ) );

	}

	var midpoints = [], p = this.vertices;

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		make( p[ faces[ i ][ 0 ] ], p[ faces[ i ][ 1 ] ], p[ faces[ i ][ 2 ] ], detail );

	}

	this.mergeVertices();

	// Apply radius

	for ( var i = 0, l = this.vertices.length; i < l; i ++ ) {

		this.vertices[ i ].multiplyScalar( radius );

	}

	/**
	 * Project vector onto sphere's surface
	 */
	function prepare( vector ) {

		var vertex = vector.normalize().clone();
		vertex.index = that.vertices.push( vertex ) - 1;

		// Texture coords are equivalent to map coords, calculate angle and convert to fraction of a circle.
		var u = azimuth( vector ) / 2 / Math.PI + 0.5;
		var v = inclination( vector ) / Math.PI + 0.5;
		vertex.uv = new THREE.UV( u, v );

		return vertex;

	}

	/**
	 * Approximate a curved face with recursively sub-divided triangles.
	 */
	function make( v1, v2, v3, detail ) {

		if ( detail < 1 ) {

			var face = new THREE.Face3( v1.index, v2.index, v3.index, [ v1.clone(), v2.clone(), v3.clone() ] );
			face.centroid.addSelf( v1 ).addSelf( v2 ).addSelf( v3 ).divideScalar( 3 );
			face.normal = face.centroid.clone().normalize();
			that.faces.push( face );

			var azi = azimuth( face.centroid );
			that.faceVertexUvs[ 0 ].push( [ 
				correctUV( v1.uv, v1, azi ),
				correctUV( v2.uv, v2, azi ),
				correctUV( v3.uv, v3, azi )
			] );

		}
		else {

			detail -= 1;
			// split triangle into 4 smaller triangles
			make( v1, midpoint( v1, v2 ), midpoint( v1, v3 ), detail ); // top quadrant
			make( midpoint( v1, v2 ), v2, midpoint( v2, v3 ), detail ); // left quadrant
			make( midpoint( v1, v3 ), midpoint( v2, v3 ), v3, detail ); // right quadrant
			make( midpoint( v1, v2 ), midpoint( v2, v3 ), midpoint( v1, v3 ), detail ); // center quadrant

		}

	}

	function midpoint( v1, v2 ) {

		if ( !midpoints[ v1.index ] ) midpoints[ v1.index ] = [];
		if ( !midpoints[ v2.index ] ) midpoints[ v2.index ] = [];
		var mid = midpoints[ v1.index ][ v2.index ];
		if ( mid === undefined ) {
			// generate mean point and project to surface with prepare()
			midpoints[ v1.index ][ v2.index ] = midpoints[ v2.index ][ v1.index ] = mid = prepare( 
				new THREE.Vector3().add( v1, v2 ).divideScalar( 2 )
			);
		}
		return mid;

	}

	/**
	 * Angle around the Y axis, counter-clockwise when looking from above.
	 */
	function azimuth( vector ) {

		return Math.atan2( vector.z, -vector.x );

	}

	/**
	 * Angle above the XZ plane.
	 */
	function inclination( vector ) {

		return Math.atan2( -vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );

	}

	/**
	 * Texture fixing helper. Spheres have some odd behaviours.
	 */
	function correctUV( uv, vector, azimuth ) {

		if ( (azimuth < 0) && (uv.u === 1) ) uv = new THREE.UV( uv.u - 1, uv.v );
		if ( (vector.x === 0) && (vector.z === 0) ) uv = new THREE.UV( azimuth / 2 / Math.PI + 0.5, uv.v );
		return uv;

	}

	this.computeCentroids();

	this.boundingSphere = { radius: radius };

};

THREE.PolyhedronGeometry.prototype = new THREE.Geometry();
THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry;
/**
 * @author timothypratley / https://github.com/timothypratley
 */

THREE.IcosahedronGeometry = function ( radius, detail ) {

	var t = ( 1 + Math.sqrt( 5 ) ) / 2;

	var vertices = [
		[ -1,  t,  0 ], [  1, t, 0 ], [ -1, -t,  0 ], [  1, -t,  0 ],
		[  0, -1,  t ], [  0, 1, t ], [  0, -1, -t ], [  0,  1, -t ],
		[  t,  0, -1 ], [  t, 0, 1 ], [ -t,  0, -1 ], [ -t,  0,  1 ]
	];

	var faces = [
		[ 0, 11,  5 ], [ 0,  5,  1 ], [  0,  1,  7 ], [  0,  7, 10 ], [  0, 10, 11 ],
		[ 1,  5,  9 ], [ 5, 11,  4 ], [ 11, 10,  2 ], [ 10,  7,  6 ], [  7,  1,  8 ],
		[ 3,  9,  4 ], [ 3,  4,  2 ], [  3,  2,  6 ], [  3,  6,  8 ], [  3,  8,  9 ],
		[ 4,  9,  5 ], [ 2,  4, 11 ], [  6,  2, 10 ], [  8,  6,  7 ], [  9,  8,  1 ]
	];

	THREE.PolyhedronGeometry.call( this, vertices, faces, radius, detail );

};
THREE.IcosahedronGeometry.prototype = new THREE.Geometry();
THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry;
/**
 * @author timothypratley / https://github.com/timothypratley
 */

THREE.OctahedronGeometry = function ( radius, detail ) {

	var vertices = [
		[ 1, 0, 0 ], [ -1, 0, 0 ], [ 0, 1, 0 ], [ 0, -1, 0 ], [ 0, 0, 1 ], [ 0, 0, -1 ]
	];

	var faces = [
		[ 0, 2, 4 ], [ 0, 4, 3 ], [ 0, 3, 5 ], [ 0, 5, 2 ], [ 1, 2, 5 ], [ 1, 5, 3 ], [ 1, 3, 4 ], [ 1, 4, 2 ]
	];

	THREE.PolyhedronGeometry.call( this, vertices, faces, radius, detail );
};
THREE.OctahedronGeometry.prototype = new THREE.Geometry();
THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry;
/**
 * @author timothypratley / https://github.com/timothypratley
 */

THREE.TetrahedronGeometry = function ( radius, detail ) {

	var vertices = [
		[ 1,  1,  1 ], [ -1, -1, 1 ], [ -1, 1, -1 ], [ 1, -1, -1 ]
	];

	var faces = [
		[ 2, 1, 0 ], [ 0, 3, 2 ], [ 1, 3, 0 ], [ 2, 3, 1 ]
	];

	THREE.PolyhedronGeometry.call( this, vertices, faces, radius, detail );

};
THREE.TetrahedronGeometry.prototype = new THREE.Geometry();
THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry;
/**
 * @author sroucheray / http://sroucheray.org/
 * @author mr.doob / http://mrdoob.com/
 */

THREE.AxisHelper = function () {

	THREE.Object3D.call( this );

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3() );
	lineGeometry.vertices.push( new THREE.Vector3( 0, 100, 0 ) );

	var coneGeometry = new THREE.CylinderGeometry( 0, 5, 25, 5, 1 );

	var line, cone;

	// x

	line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0xff0000 } ) );
	line.rotation.z = - Math.PI / 2;
	this.add( line );

	cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : 0xff0000 } ) );
	cone.position.x = 100;
	cone.rotation.z = - Math.PI / 2;
	this.add( cone );

	// y

	line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0x00ff00 } ) );
	this.add( line );

	cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : 0x00ff00 } ) );
	cone.position.y = 100;
	this.add( cone );

	// z

	line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : 0x0000ff } ) );
	line.rotation.x = Math.PI / 2;
	this.add( line );

	cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : 0x0000ff } ) );
	cone.position.z = 100;
	cone.rotation.x = Math.PI / 2;
	this.add( cone );

};

THREE.AxisHelper.prototype = new THREE.Object3D();
THREE.AxisHelper.prototype.constructor = THREE.AxisHelper;
/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 *
 * Creates an arrow for visualizing directions
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  hex - color in hex value
 */

THREE.ArrowHelper = function ( dir, origin, length, hex ) {

	THREE.Object3D.call( this );

	if ( hex === undefined ) hex = 0xffff00;
	if ( length === undefined ) length = 20;

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	lineGeometry.vertices.push( new THREE.Vector3( 0, 1, 0 ) );

	this.line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: hex } ) );
	this.add( this.line );

	var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );

	this.cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color: hex } ) );
	this.cone.position.set( 0, 1, 0 );
	this.add( this.cone );

	if ( origin instanceof THREE.Vector3 ) this.position = origin;

	this.setDirection( dir );
	this.setLength( length );

};

THREE.ArrowHelper.prototype = new THREE.Object3D();
THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper;

THREE.ArrowHelper.prototype.setDirection = function ( dir ) {

	var axis = new THREE.Vector3( 0, 1, 0 ).crossSelf( dir );

	var radians = Math.acos( new THREE.Vector3( 0, 1, 0 ).dot( dir.clone().normalize() ) );

	this.matrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );

	this.rotation.getRotationFromMatrix( this.matrix, this.scale );

};

THREE.ArrowHelper.prototype.setLength = function ( length ) {

	this.scale.set( length, length, length );

};

THREE.ArrowHelper.prototype.setColor = function ( hex ) {

	this.line.material.color.setHex( hex );
	this.cone.material.color.setHex( hex );

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows frustum, line of sight and up of the camera
 *	- suitable for fast updates
 * 	- based on frustum visualization in lightgl.js shadowmap example
 *		http://evanw.github.com/lightgl.js/tests/shadowmap.html
 */

THREE.CameraHelper = function ( camera ) {

	THREE.Object3D.call( this );

	var _this = this;

	this.lineGeometry = new THREE.Geometry();
	this.lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );

	this.pointMap = {};

	// colors

	var hexFrustum = 0xffaa00,
	hexCone	   	   = 0xff0000,
	hexUp	   	   = 0x00aaff,
	hexTarget  	   = 0xffffff,
	hexCross   	   = 0x333333;

	// near

	addLine( "n1", "n2", hexFrustum );
	addLine( "n2", "n4", hexFrustum );
	addLine( "n4", "n3", hexFrustum );
	addLine( "n3", "n1", hexFrustum );

	// far

	addLine( "f1", "f2", hexFrustum );
	addLine( "f2", "f4", hexFrustum );
	addLine( "f4", "f3", hexFrustum );
	addLine( "f3", "f1", hexFrustum );

	// sides

	addLine( "n1", "f1", hexFrustum );
	addLine( "n2", "f2", hexFrustum );
	addLine( "n3", "f3", hexFrustum );
	addLine( "n4", "f4", hexFrustum );

	// cone

	addLine( "p", "n1", hexCone );
	addLine( "p", "n2", hexCone );
	addLine( "p", "n3", hexCone );
	addLine( "p", "n4", hexCone );

	// up

	addLine( "u1", "u2", hexUp );
	addLine( "u2", "u3", hexUp );
	addLine( "u3", "u1", hexUp );

	// target

	addLine( "c", "t", hexTarget );
	addLine( "p", "c", hexCross );

	// cross

	addLine( "cn1", "cn2", hexCross );
	addLine( "cn3", "cn4", hexCross );

	addLine( "cf1", "cf2", hexCross );
	addLine( "cf3", "cf4", hexCross );

	this.camera = camera;

	function addLine( a, b, hex ) {

		addPoint( a, hex );
		addPoint( b, hex );

	}

	function addPoint( id, hex ) {

		_this.lineGeometry.vertices.push( new THREE.Vector3() );
		_this.lineGeometry.colors.push( new THREE.Color( hex ) );

		if ( _this.pointMap[ id ] === undefined ) _this.pointMap[ id ] = [];
		_this.pointMap[ id ].push( _this.lineGeometry.vertices.length - 1 );

	}

	this.update( camera );

	this.lines = new THREE.Line( this.lineGeometry, this.lineMaterial, THREE.LinePieces );
	this.add( this.lines );

};

THREE.CameraHelper.prototype = new THREE.Object3D();
THREE.CameraHelper.prototype.constructor = THREE.CameraHelper;

THREE.CameraHelper.prototype.update = function () {

	var camera = this.camera;

	var w = 1;
	var h = 1;

	var _this = this;

	// we need just camera projection matrix
	// world matrix must be identity

	THREE.CameraHelper.__c.projectionMatrix.copy( camera.projectionMatrix );

	// center / target

	setPoint( "c", 0, 0, -1 );
	setPoint( "t", 0, 0,  1 );

	// near

	setPoint( "n1", -w, -h, -1 );
	setPoint( "n2",  w, -h, -1 );
	setPoint( "n3", -w,  h, -1 );
	setPoint( "n4",  w,  h, -1 );

	// far

	setPoint( "f1", -w, -h, 1 );
	setPoint( "f2",  w, -h, 1 );
	setPoint( "f3", -w,  h, 1 );
	setPoint( "f4",  w,  h, 1 );

	// up

	setPoint( "u1",  w * 0.7, h * 1.1, -1 );
	setPoint( "u2", -w * 0.7, h * 1.1, -1 );
	setPoint( "u3",        0, h * 2,   -1 );

	// cross

	setPoint( "cf1", -w,  0, 1 );
	setPoint( "cf2",  w,  0, 1 );
	setPoint( "cf3",  0, -h, 1 );
	setPoint( "cf4",  0,  h, 1 );

	setPoint( "cn1", -w,  0, -1 );
	setPoint( "cn2",  w,  0, -1 );
	setPoint( "cn3",  0, -h, -1 );
	setPoint( "cn4",  0,  h, -1 );

	function setPoint( point, x, y, z ) {

		THREE.CameraHelper.__v.set( x, y, z );
		THREE.CameraHelper.__projector.unprojectVector( THREE.CameraHelper.__v, THREE.CameraHelper.__c );

		var points = _this.pointMap[ point ];

		if ( points !== undefined ) {

			for ( var i = 0, il = points.length; i < il; i ++ ) {

				var j = points[ i ];
				_this.lineGeometry.vertices[ j ].copy( THREE.CameraHelper.__v );

			}

		}

	}

	this.lineGeometry.__dirtyVertices = true;

};

THREE.CameraHelper.__projector = new THREE.Projector();
THREE.CameraHelper.__v = new THREE.Vector3();
THREE.CameraHelper.__c = new THREE.Camera();

/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 * 
 *	Subdivision Geometry Modifier 
 *		using Catmull-Clark Subdivision Surfaces
 *		for creating smooth geometry meshes
 *
 *	Note: a modifier modifies vertices and faces of geometry,
 *		so use THREE.GeometryUtils.clone() if orignal geoemtry needs to be retained
 * 
 *	Readings: 
 *		http://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *		http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
 *		http://xrt.wikidot.com/blog:31
 *		"Subdivision Surfaces in Character Animation"
 *
 *	Supports:
 *		Closed and Open geometries.
 *
 *	TODO: 
 *		crease vertex and "semi-sharp" features
 *		selective subdivision
 */

THREE.SubdivisionModifier = function( subdivisions ) {
	
	this.subdivisions = (subdivisions === undefined ) ? 1 : subdivisions;
	
	// Settings
	this.useOldVertexColors = false;
	this.supportUVs = true;
	this.debug = false;
	
};

//THREE.SubdivisionModifier.prototype = new THREE.Modifier();

THREE.SubdivisionModifier.prototype.constructor = THREE.SubdivisionModifier;

// Applies the "modify" pattern
THREE.SubdivisionModifier.prototype.modify = function ( geometry ) {
	
	var repeats = this.subdivisions;
	
	while ( repeats-- > 0 ) {
		this.smooth( geometry );
	}
	
};

// Performs an iteration of Catmull-Clark Subdivision
THREE.SubdivisionModifier.prototype.smooth = function ( oldGeometry ) {
	
	//debug( 'running smooth' );
	
	// New set of vertices, faces and uvs
	var newVertices = [], newFaces = [], newUVs = [];
	
	function v( x, y, z ) {
		newVertices.push( new THREE.Vector3( x, y, z ) );
	}
	
	var scope = this;

	function debug() {
		if (scope.debug) console.log.apply(console, arguments);
	}

	function warn() {
		if (console)
		console.log.apply(console, arguments);
	}

	function f4( a, b, c, d, oldFace, orders, facei ) {
		
		// TODO move vertex selection over here!
		
		var newFace = new THREE.Face4( a, b, c, d, null, oldFace.color, oldFace.material );
		
		if (scope.useOldVertexColors) {
			
			newFace.vertexColors = []; 
			
			var color, tmpColor, order;
			for (var i=0;i<4;i++) {
				order = orders[i];
				
				color = new THREE.Color(),
				color.setRGB(0,0,0);
				
				for (var j=0, jl=0; j<order.length;j++) {
					tmpColor = oldFace.vertexColors[order[j]-1];
					color.r += tmpColor.r;
					color.g += tmpColor.g;
					color.b += tmpColor.b;
				}
				
				color.r /= order.length;
				color.g /= order.length;
				color.b /= order.length;
				
				newFace.vertexColors[i] = color;
				
			}
			
		}
		
		newFaces.push( newFace );

		if (scope.supportUVs) {

			var aUv = [
				getUV(a, ''),
				getUV(b, facei),
				getUV(c, facei),
				getUV(d, facei)
			];
			
			if (!aUv[0]) debug('a :( ', a+':'+facei);
			else if (!aUv[1]) debug('b :( ', b+':'+facei);
			else if (!aUv[2]) debug('c :( ', c+':'+facei);
			else if (!aUv[3]) debug('d :( ', d+':'+facei);
			else 
				newUVs.push( aUv );

		}
	}
	
	function edge_hash( a, b ) {

		return Math.min( a, b ) + "_" + Math.max( a, b );

	}
	
	function computeEdgeFaces( geometry ) {

		var i, il, v1, v2, j, k,
			face, faceIndices, faceIndex,
			edge,
			hash,
			edgeFaceMap = {};

		function mapEdgeHash( hash, i ) {
			
			if ( edgeFaceMap[ hash ] === undefined ) {

				edgeFaceMap[ hash ] = [];
				
			}
			
			edgeFaceMap[ hash ].push( i );
		}


		// construct vertex -> face map

		for( i = 0, il = geometry.faces.length; i < il; i ++ ) {

			face = geometry.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				hash = edge_hash( face.a, face.b );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.b, face.c );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.c, face.a );
				mapEdgeHash( hash, i );

			} else if ( face instanceof THREE.Face4 ) {

				hash = edge_hash( face.a, face.b );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.b, face.c );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.c, face.d );
				mapEdgeHash( hash, i );
				
				hash = edge_hash( face.d, face.a );
				mapEdgeHash( hash, i );

			}

		}

		// extract faces
		
		// var edges = [];
		// 
		// var numOfEdges = 0;
		// for (i in edgeFaceMap) {
		// 	numOfEdges++;
		// 	
		// 	edge = edgeFaceMap[i];
		// 	edges.push(edge);
		// 	
		// }
		
		//debug('edgeFaceMap', edgeFaceMap, 'geometry.edges',geometry.edges, 'numOfEdges', numOfEdges);

		return edgeFaceMap;

	}
	
	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	
	var newPoints = originalPoints.concat(); // Vertices
		
	var facePoints = [], edgePoints = {};
	
	var sharpEdges = {}, sharpVertices = [], sharpFaces = [];
	
	var uvForVertices = {}; // Stored in {vertex}:{old face} format

	var originalVerticesLength = originalPoints.length;

	function getUV(vertexNo, oldFaceNo) {
		var j,jl;

		var key = vertexNo+':'+oldFaceNo;
		var theUV = uvForVertices[key];

		if (!theUV) {
			if (vertexNo>=originalVerticesLength && vertexNo < (originalVerticesLength + originalFaces.length)) {
				debug('face pt');
			} else {
				debug('edge pt');
			}

			warn('warning, UV not found for', key);

			return null;
		}

		return theUV;
 
		// Original faces -> Vertex Nos. 
		// new Facepoint -> Vertex Nos.
		// edge Points

	}

	function addUV(vertexNo, oldFaceNo, value) {

		var key = vertexNo+':'+oldFaceNo;
		if (!(key in uvForVertices)) {
			uvForVertices[key] = value;
		} else {
			warn('dup vertexNo', vertexNo, 'oldFaceNo', oldFaceNo, 'value', value, 'key', key, uvForVertices[key]);
		}
	}
	
	// Step 1
	//	For each face, add a face point
	//	Set each face point to be the centroid of all original points for the respective face.
	// debug(oldGeometry);
	var i, il, j, jl, face;
	
	// For Uvs
	var uvs = oldGeometry.faceVertexUvs[0];
	var abcd = 'abcd', vertice;

	debug('originalFaces, uvs, originalVerticesLength', originalFaces.length, uvs.length, originalVerticesLength);
	if (scope.supportUVs)
	for (i=0, il = uvs.length; i<il; i++ ) {
		for (j=0,jl=uvs[i].length;j<jl;j++) {
			vertice = originalFaces[i][abcd.charAt(j)];
			
			addUV(vertice, i, uvs[i][j]);
			
		}
	}

	if (uvs.length == 0) scope.supportUVs = false;

	// Additional UVs check, if we index original 
	var uvCount = 0;
	for (var u in uvForVertices) {
		uvCount++;
	}
	if (!uvCount) {
		scope.supportUVs = false;
		debug('no uvs');
	}

	debug('-- Original Faces + Vertices UVs completed', uvForVertices, 'vs', uvs.length);
			
	var avgUv ;
	for (i=0, il = originalFaces.length; i<il ;i++) {
		face = originalFaces[ i ];
		facePoints.push( face.centroid );
		newPoints.push( face.centroid );
		
		
		if (!scope.supportUVs) continue;
		
		// Prepare subdivided uv
		
		avgUv = new THREE.UV();
		
		if ( face instanceof THREE.Face3 ) {
			avgUv.u = getUV( face.a, i ).u + getUV( face.b, i ).u + getUV( face.c, i ).u;
			avgUv.v = getUV( face.a, i ).v + getUV( face.b, i ).v + getUV( face.c, i ).v;
			avgUv.u /= 3;
			avgUv.v /= 3;
			
		} else if ( face instanceof THREE.Face4 ) {
			avgUv.u = getUV( face.a, i ).u + getUV( face.b, i ).u + getUV( face.c, i ).u + getUV( face.d, i ).u;
			avgUv.v = getUV( face.a, i ).v + getUV( face.b, i ).v + getUV( face.c, i ).v + getUV( face.d, i ).v;
			avgUv.u /= 4;
			avgUv.v /= 4;
		}

		addUV(originalVerticesLength + i, '', avgUv);

	}

	debug('-- added UVs for new Faces', uvForVertices);

	// Step 2
	//	For each edge, add an edge point.
	//	Set each edge point to be the average of the two neighbouring face points and its two original endpoints.
	
	var edgeFaceMap = computeEdgeFaces ( oldGeometry ); // Edge Hash -> Faces Index
	var edge, faceIndexA, faceIndexB, avg;
	
	// debug('edgeFaceMap', edgeFaceMap);

	var edgeCount = 0;

	var edgeVertex, edgeVertexA, edgeVertexB;
	
	////
	
	var vertexEdgeMap = {}; // Gives edges connecting from each vertex
	var vertexFaceMap = {}; // Gives faces connecting from each vertex
	
	function addVertexEdgeMap(vertex, edge) {
		if (vertexEdgeMap[vertex]===undefined) {
			vertexEdgeMap[vertex] = [];
		}
		
		vertexEdgeMap[vertex].push(edge);
	}
	
	function addVertexFaceMap(vertex, face, edge) {
		if (vertexFaceMap[vertex]===undefined) {
			vertexFaceMap[vertex] = {};
		}
		
		vertexFaceMap[vertex][face] = edge;
		// vertexFaceMap[vertex][face] = null;
	}
	
	// Prepares vertexEdgeMap and vertexFaceMap
	for (i in edgeFaceMap) { // This is for every edge
		edge = edgeFaceMap[i];
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		// Maps an edgeVertex to connecting edges
		addVertexEdgeMap(edgeVertexA, [edgeVertexA, edgeVertexB] );
		addVertexEdgeMap(edgeVertexB, [edgeVertexA, edgeVertexB] );
		
		
		for (j=0,jl=edge.length;j<jl;j++) {
			face = edge[j];
			
			addVertexFaceMap(edgeVertexA, face, i);
			addVertexFaceMap(edgeVertexB, face, i);
		}
		
		if (edge.length < 2) {
			// edge is "sharp";
			sharpEdges[i] = true;
			sharpVertices[edgeVertexA] = true;
			sharpVertices[edgeVertexB] = true;
			
		}
		
	}
	
	debug('vertexEdgeMap',vertexEdgeMap, 'vertexFaceMap', vertexFaceMap);
	
	
	for (i in edgeFaceMap) {
		edge = edgeFaceMap[i];
		
		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		
		avg = new THREE.Vector3();
		
		//debug(i, faceIndexB,facePoints[faceIndexB]);
		
		if (sharpEdges[i]) {
			//debug('warning, ', i, 'edge has only 1 connecting face', edge);
			
			// For a sharp edge, average the edge end points.
			avg.addSelf(originalPoints[edgeVertexA]);
			avg.addSelf(originalPoints[edgeVertexB]);
			
			avg.multiplyScalar(0.5);
			
			sharpVertices[newPoints.length] = true;
			
		} else {
		
			avg.addSelf(facePoints[faceIndexA]);
			avg.addSelf(facePoints[faceIndexB]);
		
			avg.addSelf(originalPoints[edgeVertexA]);
			avg.addSelf(originalPoints[edgeVertexB]);
		
			avg.multiplyScalar(0.25);
		
		}
		
		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;
		
		newPoints.push( avg );
	
		edgeCount ++;
		
		if (!scope.supportUVs) {
			continue;
		}

		// debug('faceIndexAB', faceIndexA, faceIndexB, sharpEdges[i]);

		// Prepare subdivided uv
		
		avgUv = new THREE.UV();
		
		avgUv.u = getUV(edgeVertexA, faceIndexA).u + getUV(edgeVertexB, faceIndexA).u;
		avgUv.v = getUV(edgeVertexA, faceIndexA).v + getUV(edgeVertexB, faceIndexA).v;
		avgUv.u /= 2;
		avgUv.v /= 2;

		addUV(edgePoints[i], faceIndexA, avgUv);

		if (!sharpEdges[i]) {
		avgUv = new THREE.UV();
		
		avgUv.u = getUV(edgeVertexA, faceIndexB).u + getUV(edgeVertexB, faceIndexB).u;
		avgUv.v = getUV(edgeVertexA, faceIndexB).v + getUV(edgeVertexB, faceIndexB).v;
		avgUv.u /= 2;
		avgUv.v /= 2;
		
		addUV(edgePoints[i], faceIndexB, avgUv);
		}
		
	}

	debug('-- Step 2 done');

	// Step 3
	//	For each face point, add an edge for every edge of the face, 
	//	connecting the face point to each edge point for the face.
	
	
	var facePt, currentVerticeIndex;
	
	var hashAB, hashBC, hashCD, hashDA, hashCA;
	
	var abc123 = ['123', '12', '2', '23'];
	var bca123 = ['123', '23', '3', '31'];
	var cab123 = ['123', '31', '1', '12'];
	var abc1234 = ['1234', '12', '2', '23'];
	var bcd1234 = ['1234', '23', '3', '34'];
	var cda1234 = ['1234', '34', '4', '41'];
	var dab1234 = ['1234', '41', '1', '12'];
	
	
	for (i=0, il = facePoints.length; i<il ;i++) { // for every face
		facePt = facePoints[i];
		face = originalFaces[i];
		currentVerticeIndex = originalVerticesLength+ i;
		
		if ( face instanceof THREE.Face3 ) {
			
			// create 3 face4s
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCA = edge_hash( face.c, face.a );
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc123, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA], face, bca123, i );
			f4( currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB], face, cab123, i );
			
		} else if ( face instanceof THREE.Face4 ) {
			// create 4 face4s
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCD = edge_hash( face.c, face.d );
			hashDA = edge_hash( face.d, face.a );
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc1234, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD], face, bcd1234, i );
			f4( currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA], face, cda1234, i );
			f4( currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB], face, dab1234, i );

				
		} else {
			debug('face should be a face!', face);
		}
	}
	
	newVertices = newPoints;
	
	// debug('original ', oldGeometry.vertices.length, oldGeometry.faces.length );
	// debug('new points', newPoints.length, 'faces', newFaces.length );
	
	// Step 4
	
	//	For each original point P, 
	//		take the average F of all n face points for faces touching P, 
	//		and take the average R of all n edge midpoints for edges touching P, 
	//		where each edge midpoint is the average of its two endpoint vertices. 
	//	Move each original point to the point

	
	var F = new THREE.Vector3();
	var R = new THREE.Vector3();

	var n;
	for (i=0, il = originalPoints.length; i<il; i++) {
		// (F + 2R + (n-3)P) / n
		
		if (vertexEdgeMap[i]===undefined) continue;
		
		F.set(0,0,0);
		R.set(0,0,0);
		var newPos =  new THREE.Vector3(0,0,0);
		
		var f =0;
		for (j in vertexFaceMap[i]) {
			F.addSelf(facePoints[j]);
			f++;
		}
		
		var sharpEdgeCount = 0;
		
		n = vertexEdgeMap[i].length;
		
		for (j=0;j<n;j++) {
			if (
				sharpEdges[
					edge_hash(vertexEdgeMap[i][j][0],vertexEdgeMap[i][j][1])
				]) {
					sharpEdgeCount++;
				}
		}
		
		if ( sharpEdgeCount==2 ) {
			continue;
			// Do not move vertex if there's 2 connecting sharp edges.
		}

		/*
		if (sharpEdgeCount>2) {
			// TODO
		}
		*/
		
		F.divideScalar(f);
		
		
		
		for (j=0; j<n;j++) {
			edge = vertexEdgeMap[i][j];
			var midPt = originalPoints[edge[0]].clone().addSelf(originalPoints[edge[1]]).divideScalar(2);
			R.addSelf(midPt);
			// R.addSelf(originalPoints[edge[0]]);
			// R.addSelf(originalPoints[edge[1]]);
		}
		
		R.divideScalar(n);
		
		newPos.addSelf(originalPoints[i]);
		newPos.multiplyScalar(n - 3);
		
		newPos.addSelf(F);
		newPos.addSelf(R.multiplyScalar(2));
		newPos.divideScalar(n);
		
		newVertices[i] = newPos;
		
		
	}
	
	var newGeometry = oldGeometry; // Let's pretend the old geometry is now new :P
	
	newGeometry.vertices = newVertices;
	newGeometry.faces = newFaces;
	newGeometry.faceVertexUvs[ 0 ] = newUVs;
	
	delete newGeometry.__tmpVertices; // makes __tmpVertices undefined :P
	
	newGeometry.computeCentroids();
	newGeometry.computeFaceNormals();
	newGeometry.computeVertexNormals();
	
};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Loader = function ( showStatus ) {

	this.showStatus = showStatus;
	this.statusDomElement = showStatus ? THREE.Loader.prototype.addStatusElement() : null;

	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};

};

THREE.Loader.prototype = {

	constructor: THREE.Loader,

	crossOrigin: 'anonymous',

	addStatusElement: function () {

		var e = document.createElement( "div" );

		e.style.position = "absolute";
		e.style.right = "0px";
		e.style.top = "0px";
		e.style.fontSize = "0.8em";
		e.style.textAlign = "left";
		e.style.background = "rgba(0,0,0,0.25)";
		e.style.color = "#fff";
		e.style.width = "120px";
		e.style.padding = "0.5em 0.5em 0.5em 0.5em";
		e.style.zIndex = 1000;

		e.innerHTML = "Loading ...";

		return e;

	},

	updateProgress: function ( progress ) {

		var message = "Loaded ";

		if ( progress.total ) {

			message += ( 100 * progress.loaded / progress.total ).toFixed(0) + "%";


		} else {

			message += ( progress.loaded / 1000 ).toFixed(2) + " KB";

		}

		this.statusDomElement.innerHTML = message;

	},

	extractUrlBase: function ( url ) {

		var parts = url.split( '/' );
		parts.pop();
		return ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

	},

	initMaterials: function ( scope, materials, texturePath ) {

		scope.materials = [];

		for ( var i = 0; i < materials.length; ++ i ) {

			scope.materials[ i ] = THREE.Loader.prototype.createMaterial( materials[ i ], texturePath );

		}

	},

	hasNormals: function ( scope ) {

		var m, i, il = scope.materials.length;

		for( i = 0; i < il; i ++ ) {

			m = scope.materials[ i ];

			if ( m instanceof THREE.ShaderMaterial ) return true;

		}

		return false;

	},

	createMaterial: function ( m, texturePath ) {

		var _this = this;

		function is_pow2( n ) {

			var l = Math.log( n ) / Math.LN2;
			return Math.floor( l ) == l;

		}

		function nearest_pow2( n ) {

			var l = Math.log( n ) / Math.LN2;
			return Math.pow( 2, Math.round(  l ) );

		}

		function load_image( where, url ) {

			var image = new Image();
			image.onload = function () {

				if ( !is_pow2( this.width ) || !is_pow2( this.height ) ) {

					var width = nearest_pow2( this.width );
					var height = nearest_pow2( this.height );

					where.image.width = width;
					where.image.height = height;
					where.image.getContext( '2d' ).drawImage( this, 0, 0, width, height );

				} else {

					where.image = this;

				}

				where.needsUpdate = true;

			};
			image.crossOrigin = _this.crossOrigin;
			image.src = url;

		}

		function create_texture( where, name, sourceFile, repeat, offset, wrap ) {

			var texture = document.createElement( 'canvas' );

			where[ name ] = new THREE.Texture( texture );
			where[ name ].sourceFile = sourceFile;

			if( repeat ) {

				where[ name ].repeat.set( repeat[ 0 ], repeat[ 1 ] );

				if ( repeat[ 0 ] != 1 ) where[ name ].wrapS = THREE.RepeatWrapping;
				if ( repeat[ 1 ] != 1 ) where[ name ].wrapT = THREE.RepeatWrapping;

			}

			if ( offset ) {

				where[ name ].offset.set( offset[ 0 ], offset[ 1 ] );

			}

			if ( wrap ) {

				var wrapMap = {
					"repeat" 	: THREE.RepeatWrapping,
					"mirror"	: THREE.MirroredRepeatWrapping
				}

				if ( wrapMap[ wrap[ 0 ] ] !== undefined ) where[ name ].wrapS = wrapMap[ wrap[ 0 ] ];
				if ( wrapMap[ wrap[ 1 ] ] !== undefined ) where[ name ].wrapT = wrapMap[ wrap[ 1 ] ];

			}

			load_image( where[ name ], texturePath + "/" + sourceFile );

		}

		function rgb2hex( rgb ) {

			return ( rgb[ 0 ] * 255 << 16 ) + ( rgb[ 1 ] * 255 << 8 ) + rgb[ 2 ] * 255;

		}

		// defaults

		var mtype = "MeshLambertMaterial";
		var mpars = { color: 0xeeeeee, opacity: 1.0, map: null, lightMap: null, normalMap: null, wireframe: m.wireframe };

		// parameters from model file

		if ( m.shading ) {

			var shading = m.shading.toLowerCase();

			if ( shading === "phong" ) mtype = "MeshPhongMaterial";
			else if ( shading === "basic" ) mtype = "MeshBasicMaterial";

		}

		if ( m.blending !== undefined && THREE[ m.blending ] !== undefined ) {

			mpars.blending = THREE[ m.blending ];

		}

		if ( m.transparent !== undefined || m.opacity < 1.0 ) {

			mpars.transparent = m.transparent;

		}

		if ( m.depthTest !== undefined ) {

			mpars.depthTest = m.depthTest;

		}

		if ( m.depthWrite !== undefined ) {

			mpars.depthWrite = m.depthWrite;

		}

		if ( m.vertexColors !== undefined ) {

			if ( m.vertexColors == "face" ) {

				mpars.vertexColors = THREE.FaceColors;

			} else if ( m.vertexColors ) {

				mpars.vertexColors = THREE.VertexColors;

			}

		}

		// colors

		if ( m.colorDiffuse ) {

			mpars.color = rgb2hex( m.colorDiffuse );

		} else if ( m.DbgColor ) {

			mpars.color = m.DbgColor;

		}

		if ( m.colorSpecular ) {

			mpars.specular = rgb2hex( m.colorSpecular );

		}

		if ( m.colorAmbient ) {

			mpars.ambient = rgb2hex( m.colorAmbient );

		}

		// modifiers

		if ( m.transparency ) {

			mpars.opacity = m.transparency;

		}

		if ( m.specularCoef ) {

			mpars.shininess = m.specularCoef;

		}

		// textures

		if ( m.mapDiffuse && texturePath ) {

			create_texture( mpars, "map", m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap );

		}

		if ( m.mapLight && texturePath ) {

			create_texture( mpars, "lightMap", m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap );

		}

		if ( m.mapNormal && texturePath ) {

			create_texture( mpars, "normalMap", m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap );

		}

		if ( m.mapSpecular && texturePath ) {

			create_texture( mpars, "specularMap", m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap );

		}

		// special case for normal mapped material

		if ( m.mapNormal ) {

			var shader = THREE.ShaderUtils.lib[ "normal" ];
			var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			uniforms[ "tNormal" ].texture = mpars.normalMap;

			if ( m.mapNormalFactor ) {

				uniforms[ "uNormalScale" ].value = m.mapNormalFactor;

			}

			if ( mpars.map ) {

				uniforms[ "tDiffuse" ].texture = mpars.map;
				uniforms[ "enableDiffuse" ].value = true;

			}

			if ( mpars.specularMap ) {

				uniforms[ "tSpecular" ].texture = mpars.specularMap;
				uniforms[ "enableSpecular" ].value = true;

			}

			if ( mpars.lightMap ) {

				uniforms[ "tAO" ].texture = mpars.lightMap;
				uniforms[ "enableAO" ].value = true;

			}

			// for the moment don't handle displacement texture

			uniforms[ "uDiffuseColor" ].value.setHex( mpars.color );
			uniforms[ "uSpecularColor" ].value.setHex( mpars.specular );
			uniforms[ "uAmbientColor" ].value.setHex( mpars.ambient );

			uniforms[ "uShininess" ].value = mpars.shininess;

			if ( mpars.opacity !== undefined ) {

				uniforms[ "uOpacity" ].value = mpars.opacity;

			}

			var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };
			var material = new THREE.ShaderMaterial( parameters );

		} else {

			var material = new THREE[ mtype ]( mpars );

		}

		if ( m.DbgName !== undefined ) material.name = m.DbgName;

		return material;

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BinaryLoader = function ( showStatus ) {

	THREE.Loader.call( this, showStatus );

};

THREE.BinaryLoader.prototype = new THREE.Loader();
THREE.BinaryLoader.prototype.constructor = THREE.BinaryLoader;
THREE.BinaryLoader.prototype.supr = THREE.Loader.prototype;


// Load models generated by slim OBJ converter with BINARY option (converter_obj_three_slim.py -t binary)
//  - binary models consist of two files: JS and BIN
//  - parameters
//		- url (required)
//		- callback (required)
//		- texturePath (optional: if not specified, textures will be assumed to be in the same folder as JS model file)
//		- binaryPath (optional: if not specified, binary file will be assumed to be in the same folder as JS model file)

THREE.BinaryLoader.prototype.load = function( url, callback, texturePath, binaryPath ) {

	texturePath = texturePath ? texturePath : this.extractUrlBase( url );
	binaryPath = binaryPath ? binaryPath : this.extractUrlBase( url );

	var callbackProgress = this.showProgress ? THREE.Loader.prototype.updateProgress : null;

	this.onLoadStart();

	// #1 load JS part via web worker

	this.loadAjaxJSON( this, url, callback, texturePath, binaryPath, callbackProgress );

};

THREE.BinaryLoader.prototype.loadAjaxJSON = function ( context, url, callback, texturePath, binaryPath, callbackProgress ) {

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				var json = JSON.parse( xhr.responseText );
				context.loadAjaxBuffers( json, callback, binaryPath, texturePath, callbackProgress );

			} else {

				console.error( "THREE.BinaryLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		}

	};

	xhr.open( "GET", url, true );
	if ( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );

};

THREE.BinaryLoader.prototype.loadAjaxBuffers = function ( json, callback, binaryPath, texturePath, callbackProgress ) {

	var xhr = new XMLHttpRequest(),
		url = binaryPath + "/" + json.buffers;

	var length = 0;

	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				THREE.BinaryLoader.prototype.createBinModel( xhr.response, callback, texturePath, json.materials );

			} else {

				console.error( "THREE.BinaryLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState == 3 ) {

			if ( callbackProgress ) {

				if ( length == 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState == 2 ) {

			length = xhr.getResponseHeader( "Content-Length" );

		}

	};

	xhr.open( "GET", url, true );
	xhr.responseType = "arraybuffer";
	xhr.send( null );

};

// Binary AJAX parser

THREE.BinaryLoader.prototype.createBinModel = function ( data, callback, texturePath, materials ) {

	var Model = function ( texturePath ) {

		var scope = this,
			currentOffset = 0,
			md,
			normals = [],
			uvs = [],
			start_tri_flat, start_tri_smooth, start_tri_flat_uv, start_tri_smooth_uv,
			start_quad_flat, start_quad_smooth, start_quad_flat_uv, start_quad_smooth_uv,
			tri_size, quad_size,
			len_tri_flat, len_tri_smooth, len_tri_flat_uv, len_tri_smooth_uv,
			len_quad_flat, len_quad_smooth, len_quad_flat_uv, len_quad_smooth_uv;


		THREE.Geometry.call( this );

		THREE.Loader.prototype.initMaterials( scope, materials, texturePath );

		md = parseMetaData( data, currentOffset );

		currentOffset += md.header_bytes;
/*
		md.vertex_index_bytes = Uint32Array.BYTES_PER_ELEMENT;
		md.material_index_bytes = Uint16Array.BYTES_PER_ELEMENT;
		md.normal_index_bytes = Uint32Array.BYTES_PER_ELEMENT;
		md.uv_index_bytes = Uint32Array.BYTES_PER_ELEMENT;
*/
		// buffers sizes

		tri_size =  md.vertex_index_bytes * 3 + md.material_index_bytes;
		quad_size = md.vertex_index_bytes * 4 + md.material_index_bytes;

		len_tri_flat      = md.ntri_flat      * ( tri_size );
		len_tri_smooth    = md.ntri_smooth    * ( tri_size + md.normal_index_bytes * 3 );
		len_tri_flat_uv   = md.ntri_flat_uv   * ( tri_size + md.uv_index_bytes * 3 );
		len_tri_smooth_uv = md.ntri_smooth_uv * ( tri_size + md.normal_index_bytes * 3 + md.uv_index_bytes * 3 );

		len_quad_flat      = md.nquad_flat      * ( quad_size );
		len_quad_smooth    = md.nquad_smooth    * ( quad_size + md.normal_index_bytes * 4 );
		len_quad_flat_uv   = md.nquad_flat_uv   * ( quad_size + md.uv_index_bytes * 4 );
		len_quad_smooth_uv = md.nquad_smooth_uv * ( quad_size + md.normal_index_bytes * 4 + md.uv_index_bytes * 4 );

		// read buffers

		currentOffset += init_vertices( currentOffset );

		currentOffset += init_normals( currentOffset );
		currentOffset += handlePadding( md.nnormals * 3 );

		currentOffset += init_uvs( currentOffset );

		start_tri_flat 		= currentOffset;
		start_tri_smooth    = start_tri_flat    + len_tri_flat    + handlePadding( md.ntri_flat * 2 );
		start_tri_flat_uv   = start_tri_smooth  + len_tri_smooth  + handlePadding( md.ntri_smooth * 2 );
		start_tri_smooth_uv = start_tri_flat_uv + len_tri_flat_uv + handlePadding( md.ntri_flat_uv * 2 );

		start_quad_flat     = start_tri_smooth_uv + len_tri_smooth_uv  + handlePadding( md.ntri_smooth_uv * 2 );
		start_quad_smooth   = start_quad_flat     + len_quad_flat	   + handlePadding( md.nquad_flat * 2 );
		start_quad_flat_uv  = start_quad_smooth   + len_quad_smooth    + handlePadding( md.nquad_smooth * 2 );
		start_quad_smooth_uv= start_quad_flat_uv  + len_quad_flat_uv   + handlePadding( md.nquad_flat_uv * 2 );

		// have to first process faces with uvs
		// so that face and uv indices match

		init_triangles_flat_uv( start_tri_flat_uv );
		init_triangles_smooth_uv( start_tri_smooth_uv );

		init_quads_flat_uv( start_quad_flat_uv );
		init_quads_smooth_uv( start_quad_smooth_uv );

		// now we can process untextured faces

		init_triangles_flat( start_tri_flat );
		init_triangles_smooth( start_tri_smooth );

		init_quads_flat( start_quad_flat );
		init_quads_smooth( start_quad_smooth );

		this.computeCentroids();
		this.computeFaceNormals();

		if ( THREE.Loader.prototype.hasNormals( this ) ) this.computeTangents();

		function handlePadding( n ) {

			return ( n % 4 ) ? ( 4 - n % 4 ) : 0;

		};

		function parseMetaData( data, offset ) {

			var metaData = {

				'signature'               :parseString( data, offset,  12 ),
				'header_bytes'            :parseUChar8( data, offset + 12 ),

				'vertex_coordinate_bytes' :parseUChar8( data, offset + 13 ),
				'normal_coordinate_bytes' :parseUChar8( data, offset + 14 ),
				'uv_coordinate_bytes'     :parseUChar8( data, offset + 15 ),

				'vertex_index_bytes'      :parseUChar8( data, offset + 16 ),
				'normal_index_bytes'      :parseUChar8( data, offset + 17 ),
				'uv_index_bytes'          :parseUChar8( data, offset + 18 ),
				'material_index_bytes'    :parseUChar8( data, offset + 19 ),

				'nvertices'    :parseUInt32( data, offset + 20 ),
				'nnormals'     :parseUInt32( data, offset + 20 + 4*1 ),
				'nuvs'         :parseUInt32( data, offset + 20 + 4*2 ),

				'ntri_flat'      :parseUInt32( data, offset + 20 + 4*3 ),
				'ntri_smooth'    :parseUInt32( data, offset + 20 + 4*4 ),
				'ntri_flat_uv'   :parseUInt32( data, offset + 20 + 4*5 ),
				'ntri_smooth_uv' :parseUInt32( data, offset + 20 + 4*6 ),

				'nquad_flat'      :parseUInt32( data, offset + 20 + 4*7 ),
				'nquad_smooth'    :parseUInt32( data, offset + 20 + 4*8 ),
				'nquad_flat_uv'   :parseUInt32( data, offset + 20 + 4*9 ),
				'nquad_smooth_uv' :parseUInt32( data, offset + 20 + 4*10 )

			};
/*
			console.log( "signature: " + metaData.signature );

			console.log( "header_bytes: " + metaData.header_bytes );
			console.log( "vertex_coordinate_bytes: " + metaData.vertex_coordinate_bytes );
			console.log( "normal_coordinate_bytes: " + metaData.normal_coordinate_bytes );
			console.log( "uv_coordinate_bytes: " + metaData.uv_coordinate_bytes );

			console.log( "vertex_index_bytes: " + metaData.vertex_index_bytes );
			console.log( "normal_index_bytes: " + metaData.normal_index_bytes );
			console.log( "uv_index_bytes: " + metaData.uv_index_bytes );
			console.log( "material_index_bytes: " + metaData.material_index_bytes );

			console.log( "nvertices: " + metaData.nvertices );
			console.log( "nnormals: " + metaData.nnormals );
			console.log( "nuvs: " + metaData.nuvs );

			console.log( "ntri_flat: " + metaData.ntri_flat );
			console.log( "ntri_smooth: " + metaData.ntri_smooth );
			console.log( "ntri_flat_uv: " + metaData.ntri_flat_uv );
			console.log( "ntri_smooth_uv: " + metaData.ntri_smooth_uv );

			console.log( "nquad_flat: " + metaData.nquad_flat );
			console.log( "nquad_smooth: " + metaData.nquad_smooth );
			console.log( "nquad_flat_uv: " + metaData.nquad_flat_uv );
			console.log( "nquad_smooth_uv: " + metaData.nquad_smooth_uv );

			var total = metaData.header_bytes
					  + metaData.nvertices * metaData.vertex_coordinate_bytes * 3
					  + metaData.nnormals * metaData.normal_coordinate_bytes * 3
					  + metaData.nuvs * metaData.uv_coordinate_bytes * 2
					  + metaData.ntri_flat * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes )
					  + metaData.ntri_smooth * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes + metaData.normal_index_bytes*3 )
					  + metaData.ntri_flat_uv * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes + metaData.uv_index_bytes*3 )
					  + metaData.ntri_smooth_uv * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes + metaData.normal_index_bytes*3 + metaData.uv_index_bytes*3 )
					  + metaData.nquad_flat * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes )
					  + metaData.nquad_smooth * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes + metaData.normal_index_bytes*4 )
					  + metaData.nquad_flat_uv * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes + metaData.uv_index_bytes*4 )
					  + metaData.nquad_smooth_uv * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes + metaData.normal_index_bytes*4 + metaData.uv_index_bytes*4 );
			console.log( "total bytes: " + total );
*/

			return metaData;

		};

		function parseString( data, offset, length ) {

			var charArray = new Uint8Array( data, offset, length );

			var text = "";

			for ( var i = 0; i < length; i ++ ) {

				text += String.fromCharCode( charArray[ offset + i ] );

			}

			return text;

		};

		function parseUChar8( data, offset ) {

			var charArray = new Uint8Array( data, offset, 1 );

			return charArray[ 0 ];

		};

		function parseUInt32( data, offset ) {

			var intArray = new Uint32Array( data, offset, 1 );

			return intArray[ 0 ];

		};

		function init_vertices( start ) {

			var nElements = md.nvertices;

			var coordArray = new Float32Array( data, start, nElements * 3 );

			var i, x, y, z;

			for( i = 0; i < nElements; i ++ ) {

				x = coordArray[ i * 3 ];
				y = coordArray[ i * 3 + 1 ];
				z = coordArray[ i * 3 + 2 ];

				vertex( scope, x, y, z );

			}

			return nElements * 3 * Float32Array.BYTES_PER_ELEMENT;

		};

		function init_normals( start ) {

			var nElements = md.nnormals;

			if ( nElements ) {

				var normalArray = new Int8Array( data, start, nElements * 3 );

				var i, x, y, z;

				for( i = 0; i < nElements; i ++ ) {

					x = normalArray[ i * 3 ];
					y = normalArray[ i * 3 + 1 ];
					z = normalArray[ i * 3 + 2 ];

					normals.push( x/127, y/127, z/127 );

				}

			}

			return nElements * 3 * Int8Array.BYTES_PER_ELEMENT;

		};

		function init_uvs( start ) {

			var nElements = md.nuvs;

			if ( nElements ) {

				var uvArray = new Float32Array( data, start, nElements * 2 );

				var i, u, v;

				for( i = 0; i < nElements; i ++ ) {

					u = uvArray[ i * 2 ];
					v = uvArray[ i * 2 + 1 ];

					uvs.push( u, v );

				}

			}

			return nElements * 2 * Float32Array.BYTES_PER_ELEMENT;

		};

		function init_uvs3( nElements, offset ) {

			var i, uva, uvb, uvc, u1, u2, u3, v1, v2, v3;

			var uvIndexBuffer = new Uint32Array( data, offset, 3 * nElements );

			for( i = 0; i < nElements; i ++ ) {

				uva = uvIndexBuffer[ i * 3 ];
				uvb = uvIndexBuffer[ i * 3 + 1 ];
				uvc = uvIndexBuffer[ i * 3 + 2 ];

				u1 = uvs[ uva*2 ];
				v1 = uvs[ uva*2 + 1 ];

				u2 = uvs[ uvb*2 ];
				v2 = uvs[ uvb*2 + 1 ];

				u3 = uvs[ uvc*2 ];
				v3 = uvs[ uvc*2 + 1 ];

				uv3( scope.faceVertexUvs[ 0 ], u1, v1, u2, v2, u3, v3 );

			}

		};

		function init_uvs4( nElements, offset ) {

			var i, uva, uvb, uvc, uvd, u1, u2, u3, u4, v1, v2, v3, v4;

			var uvIndexBuffer = new Uint32Array( data, offset, 4 * nElements );

			for( i = 0; i < nElements; i ++ ) {

				uva = uvIndexBuffer[ i * 4 ];
				uvb = uvIndexBuffer[ i * 4 + 1 ];
				uvc = uvIndexBuffer[ i * 4 + 2 ];
				uvd = uvIndexBuffer[ i * 4 + 3 ];

				u1 = uvs[ uva*2 ];
				v1 = uvs[ uva*2 + 1 ];

				u2 = uvs[ uvb*2 ];
				v2 = uvs[ uvb*2 + 1 ];

				u3 = uvs[ uvc*2 ];
				v3 = uvs[ uvc*2 + 1 ];

				u4 = uvs[ uvd*2 ];
				v4 = uvs[ uvd*2 + 1 ];

				uv4( scope.faceVertexUvs[ 0 ], u1, v1, u2, v2, u3, v3, u4, v4 );

			}

		};

		function init_faces3_flat( nElements, offsetVertices, offsetMaterials ) {

			var i, a, b, c, m;

			var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 3 * nElements );
			var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

			for( i = 0; i < nElements; i ++ ) {

				a = vertexIndexBuffer[ i * 3 ];
				b = vertexIndexBuffer[ i * 3 + 1 ];
				c = vertexIndexBuffer[ i * 3 + 2 ];

				m = materialIndexBuffer[ i ];

				f3( scope, a, b, c, m );

			}

		};

		function init_faces4_flat( nElements, offsetVertices, offsetMaterials ) {

			var i, a, b, c, d, m;

			var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 4 * nElements );
			var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

			for( i = 0; i < nElements; i ++ ) {

				a = vertexIndexBuffer[ i * 4 ];
				b = vertexIndexBuffer[ i * 4 + 1 ];
				c = vertexIndexBuffer[ i * 4 + 2 ];
				d = vertexIndexBuffer[ i * 4 + 3 ];

				m = materialIndexBuffer[ i ];

				f4( scope, a, b, c, d, m );

			}

		};

		function init_faces3_smooth( nElements, offsetVertices, offsetNormals, offsetMaterials ) {

			var i, a, b, c, m;
			var na, nb, nc;

			var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 3 * nElements );
			var normalIndexBuffer = new Uint32Array( data, offsetNormals, 3 * nElements );
			var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

			for( i = 0; i < nElements; i ++ ) {

				a = vertexIndexBuffer[ i * 3 ];
				b = vertexIndexBuffer[ i * 3 + 1 ];
				c = vertexIndexBuffer[ i * 3 + 2 ];

				na = normalIndexBuffer[ i * 3 ];
				nb = normalIndexBuffer[ i * 3 + 1 ];
				nc = normalIndexBuffer[ i * 3 + 2 ];

				m = materialIndexBuffer[ i ];

				f3n( scope, normals, a, b, c, m, na, nb, nc );

			}

		};

		function init_faces4_smooth( nElements, offsetVertices, offsetNormals, offsetMaterials ) {

			var i, a, b, c, d, m;
			var na, nb, nc, nd;

			var vertexIndexBuffer = new Uint32Array( data, offsetVertices, 4 * nElements );
			var normalIndexBuffer = new Uint32Array( data, offsetNormals, 4 * nElements );
			var materialIndexBuffer = new Uint16Array( data, offsetMaterials, nElements );

			for( i = 0; i < nElements; i ++ ) {

				a = vertexIndexBuffer[ i * 4 ];
				b = vertexIndexBuffer[ i * 4 + 1 ];
				c = vertexIndexBuffer[ i * 4 + 2 ];
				d = vertexIndexBuffer[ i * 4 + 3 ];

				na = normalIndexBuffer[ i * 4 ];
				nb = normalIndexBuffer[ i * 4 + 1 ];
				nc = normalIndexBuffer[ i * 4 + 2 ];
				nd = normalIndexBuffer[ i * 4 + 3 ];

				m = materialIndexBuffer[ i ];

				f4n( scope, normals, a, b, c, d, m, na, nb, nc, nd );

			}

		};

		function init_triangles_flat( start ) {

			var nElements = md.ntri_flat;

			if ( nElements ) {

				var offsetMaterials = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
				init_faces3_flat( nElements, start, offsetMaterials );

			}

		};

		function init_triangles_flat_uv( start ) {

			var nElements = md.ntri_flat_uv;

			if ( nElements ) {

				var offsetUvs = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
				var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

				init_faces3_flat( nElements, start, offsetMaterials );
				init_uvs3( nElements, offsetUvs );

			}

		};

		function init_triangles_smooth( start ) {

			var nElements = md.ntri_smooth;

			if ( nElements ) {

				var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
				var offsetMaterials = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

				init_faces3_smooth( nElements, start, offsetNormals, offsetMaterials );

			}

		};

		function init_triangles_smooth_uv( start ) {

			var nElements = md.ntri_smooth_uv;

			if ( nElements ) {

				var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
				var offsetUvs = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;
				var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 3;

				init_faces3_smooth( nElements, start, offsetNormals, offsetMaterials );
				init_uvs3( nElements, offsetUvs );

			}

		};

		function init_quads_flat( start ) {

			var nElements = md.nquad_flat;

			if ( nElements ) {

				var offsetMaterials = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
				init_faces4_flat( nElements, start, offsetMaterials );

			}

		};

		function init_quads_flat_uv( start ) {

			var nElements = md.nquad_flat_uv;

			if ( nElements ) {

				var offsetUvs = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
				var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

				init_faces4_flat( nElements, start, offsetMaterials );
				init_uvs4( nElements, offsetUvs );

			}

		};

		function init_quads_smooth( start ) {

			var nElements = md.nquad_smooth;

			if ( nElements ) {

				var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
				var offsetMaterials = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

				init_faces4_smooth( nElements, start, offsetNormals, offsetMaterials );

			}

		};

		function init_quads_smooth_uv( start ) {

			var nElements = md.nquad_smooth_uv;

			if ( nElements ) {

				var offsetNormals = start + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
				var offsetUvs = offsetNormals + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;
				var offsetMaterials = offsetUvs + nElements * Uint32Array.BYTES_PER_ELEMENT * 4;

				init_faces4_smooth( nElements, start, offsetNormals, offsetMaterials );
				init_uvs4( nElements, offsetUvs );

			}

		};

	};

	function vertex ( scope, x, y, z ) {

		scope.vertices.push( new THREE.Vector3( x, y, z ) );

	};

	function f3 ( scope, a, b, c, mi ) {

		scope.faces.push( new THREE.Face3( a, b, c, null, null, mi ) );

	};

	function f4 ( scope, a, b, c, d, mi ) {

		scope.faces.push( new THREE.Face4( a, b, c, d, null, null, mi ) );

	};

	function f3n ( scope, normals, a, b, c, mi, na, nb, nc ) {

		var nax = normals[ na*3     ],
			nay = normals[ na*3 + 1 ],
			naz = normals[ na*3 + 2 ],

			nbx = normals[ nb*3     ],
			nby = normals[ nb*3 + 1 ],
			nbz = normals[ nb*3 + 2 ],

			ncx = normals[ nc*3     ],
			ncy = normals[ nc*3 + 1 ],
			ncz = normals[ nc*3 + 2 ];

		scope.faces.push( new THREE.Face3( a, b, c,
						  [new THREE.Vector3( nax, nay, naz ),
						   new THREE.Vector3( nbx, nby, nbz ),
						   new THREE.Vector3( ncx, ncy, ncz )],
						  null,
						  mi ) );

	};

	function f4n ( scope, normals, a, b, c, d, mi, na, nb, nc, nd ) {

		var nax = normals[ na*3     ],
			nay = normals[ na*3 + 1 ],
			naz = normals[ na*3 + 2 ],

			nbx = normals[ nb*3     ],
			nby = normals[ nb*3 + 1 ],
			nbz = normals[ nb*3 + 2 ],

			ncx = normals[ nc*3     ],
			ncy = normals[ nc*3 + 1 ],
			ncz = normals[ nc*3 + 2 ],

			ndx = normals[ nd*3     ],
			ndy = normals[ nd*3 + 1 ],
			ndz = normals[ nd*3 + 2 ];

		scope.faces.push( new THREE.Face4( a, b, c, d,
						  [new THREE.Vector3( nax, nay, naz ),
						   new THREE.Vector3( nbx, nby, nbz ),
						   new THREE.Vector3( ncx, ncy, ncz ),
						   new THREE.Vector3( ndx, ndy, ndz )],
						  null,
						  mi ) );

	};

	function uv3 ( where, u1, v1, u2, v2, u3, v3 ) {

		var uv = [];
		uv.push( new THREE.UV( u1, v1 ) );
		uv.push( new THREE.UV( u2, v2 ) );
		uv.push( new THREE.UV( u3, v3 ) );
		where.push( uv );

	};

	function uv4 ( where, u1, v1, u2, v2, u3, v3, u4, v4 ) {

		var uv = [];
		uv.push( new THREE.UV( u1, v1 ) );
		uv.push( new THREE.UV( u2, v2 ) );
		uv.push( new THREE.UV( u3, v3 ) );
		uv.push( new THREE.UV( u4, v4 ) );
		where.push( uv );

	};

	Model.prototype = new THREE.Geometry();
	Model.prototype.constructor = Model;

	callback( new Model( texturePath ) );

};
/**
 * @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
 */

THREE.ColladaLoader = function () {

	var COLLADA = null;
	var scene = null;
	var daeScene;

	var readyCallbackFunc = null;

 	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};

	var animData;
	var visualScenes;
	var baseUrl;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y'
	};

	// TODO: support unit conversion as well
	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;

	var TO_RADIANS = Math.PI / 180;

	function load ( url, readyCallback, progressCallback ) {

		var length = 0;

		if ( document.implementation && document.implementation.createDocument ) {

			var req = new XMLHttpRequest();

			if ( req.overrideMimeType ) req.overrideMimeType( "text/xml" );

			req.onreadystatechange = function() {

				if( req.readyState == 4 ) {

					if( req.status == 0 || req.status == 200 ) {


						if ( req.responseXML ) {

							readyCallbackFunc = readyCallback;
							parse( req.responseXML, undefined, url );

						} else {

							console.error( "ColladaLoader: Empty or non-existing file (" + url + ")" );

						}

					}

				} else if ( req.readyState == 3 ) {

					if ( progressCallback ) {

						if ( length == 0 ) {

							length = req.getResponseHeader( "Content-Length" );

						}

						progressCallback( { total: length, loaded: req.responseText.length } );

					}

				}

			}

			req.open( "GET", url, true );
			req.send( null );

		} else {

			alert( "Don't know how to parse XML!" );

		}

	};

	function parse( doc, callBack, url ) {

		COLLADA = doc;
		callBack = callBack || readyCallbackFunc;

		if ( url !== undefined ) {

			var parts = url.split( '/' );
			parts.pop();
			baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		parseAsset();
		setUpConversion();
		images = parseLib( "//dae:library_images/dae:image", _Image, "image" );
		materials = parseLib( "//dae:library_materials/dae:material", Material, "material") ;
		effects = parseLib( "//dae:library_effects/dae:effect", Effect, "effect" );
		geometries = parseLib( "//dae:library_geometries/dae:geometry", Geometry, "geometry" );
		cameras = parseLib( ".//dae:library_cameras/dae:camera", Camera, "camera" );
		controllers = parseLib( "//dae:library_controllers/dae:controller", Controller, "controller" );
		animations = parseLib( "//dae:library_animations/dae:animation", Animation, "animation" );
		visualScenes = parseLib( ".//dae:library_visual_scenes/dae:visual_scene", VisualScene, "visual_scene" );

		morphs = [];
		skins = [];

		daeScene = parseScene();
		scene = new THREE.Object3D();

		for ( var i = 0; i < daeScene.nodes.length; i ++ ) {

			scene.add( createSceneGraph( daeScene.nodes[ i ] ) );

		}

		createAnimations();

		var result = {

			scene: scene,
			morphs: morphs,
			skins: skins,
			animations: animData,
			dae: {
				images: images,
				materials: materials,
				cameras: cameras,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				scene: daeScene
			}

		};

		if ( callBack ) {

			callBack( result );

		}

		return result;

	};

	function setPreferredShading ( shading ) {

		preferredShading = shading;

	};

	function parseAsset () {

		var elements = COLLADA.evaluate( '//dae:asset', COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

		var element = elements.iterateNext();

		if ( element && element.childNodes ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'unit':

						var meter = child.getAttribute( 'meter' );

						if ( meter ) {

							colladaUnit = parseFloat( meter );

						}

						break;

					case 'up_axis':

						colladaUp = child.textContent.charAt(0);
						break;

				}

			}

		}

	};

	function parseLib ( q, classSpec, prefix ) {

		var elements = COLLADA.evaluate(q, COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null) ;

		var lib = {};
		var element = elements.iterateNext();
		var i = 0;

		while ( element ) {

			var daeElement = ( new classSpec() ).parse( element );
			if ( !daeElement.id || daeElement.id.length == 0 ) daeElement.id = prefix + ( i ++ );
			lib[ daeElement.id ] = daeElement;

			element = elements.iterateNext();

		}

		return lib;

	};

	function parseScene() {

		var sceneElement = COLLADA.evaluate( './/dae:scene/dae:instance_visual_scene', COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null ).iterateNext();

		if ( sceneElement ) {

			var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
			return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

		} else {

			return null;

		}

	};

	function createAnimations() {

		animData = [];

		// fill in the keys
		recurseHierarchy( scene );

	};

	function recurseHierarchy( node ) {

		var n = daeScene.getChildById( node.name, true ),
			newData = null;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push(newData);

			for ( var i = 0, il = n.keys.length; i < il; i++ ) {

				newData.length = Math.max( newData.length, n.keys[i].time );

			}

		} else  {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			}

		}

		for ( var i = 0, il = node.children.length; i < il; i++ ) {

			var d = recurseHierarchy( node.children[i] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	};

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;

		for ( var id in animations ) {

			var animation = animations[ id ];

			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];
				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start:start, end:end, frames:frames };

	};

	function createMorph ( geometry, ctrl ) {

		var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

		if ( !morphCtrl || !morphCtrl.morph ) {

			console.log("could not find morph controller!");
			return;

		}

		var morph = morphCtrl.morph;

		for ( var i = 0; i < morph.targets.length; i ++ ) {

			var target_id = morph.targets[ i ];
			var daeGeometry = geometries[ target_id ];

			if ( !daeGeometry.mesh ||
				 !daeGeometry.mesh.primitives ||
				 !daeGeometry.mesh.primitives.length ) {
				 continue;
			}

			var target = daeGeometry.mesh.primitives[ 0 ].geometry;

			if ( target.vertices.length === geometry.vertices.length ) {

				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

			}

		}

		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

	};

	function createSkin ( geometry, ctrl, applyBindShape ) {

		var skinCtrl = controllers[ ctrl.url ];

		if ( !skinCtrl || !skinCtrl.skin ) {

			console.log( "could not find skin controller!" );
			return;

		}

		if ( !ctrl.skeleton || !ctrl.skeleton.length ) {

			console.log( "could not find the skeleton for the skin!" );
			return;

		}

		var skin = skinCtrl.skin;
		var skeleton = daeScene.getChildById( ctrl.skeleton[ 0 ] );
		var hierarchy = [];

		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
		//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/

		if ( applyBindShape ) {

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				skin.bindShapeMatrix.multiplyVector3( geometry.vertices[ i ] );

			}

		}

	};

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.world.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );

			}

		}

		if ( parent ) {

			node.world.multiply( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	};

	function setupSkinningMatrices ( bones, skin ) {

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = -1;

			if ( bone.type != 'JOINT' ) continue;

			for ( var j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid == skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiply(bone.world, inv); // (IBMi * JMi)

				bone.weights = [];

				for ( var j = 0; j < skin.weights.length; j ++ ) {

					for (var k = 0; k < skin.weights[ j ].length; k ++) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint == found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				throw 'ColladaLoader: Could not find joint \'' + bone.sid + '\'.';

			}

		}

	};

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];

		frame = frame !== undefined ? frame : 40;

		if ( !skinController || !skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( !instanceCtrl.skeleton || !instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = daeScene.getChildById( instanceCtrl.skeleton[0], true ) ||
					   daeScene.getChildBySid( instanceCtrl.skeleton[0], true );

		var i, j, w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape

		for ( i = 0; i < geometry.vertices.length; i ++ ) {

			skinController.skin.bindShapeMatrix.multiplyVector3( geometry.vertices[i] );

		}

		// process animation, or simply pose the rig if no animation

		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];

			// zero skinned vertices

			for ( i = 0; i < geometry.vertices.length; i++ ) {

				skinned.push( new THREE.Vector3() );

			}

			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			// skin 'm

			for ( i = 0; i < bones.length; i ++ ) {

				if ( bones[ i ].type != 'JOINT' ) continue;

				for ( j = 0; j < bones[ i ].weights.length; j ++ ) {

					w = bones[ i ].weights[ j ];
					vidx = w.index;
					weight = w.weight;

					o = geometry.vertices[vidx];
					s = skinned[vidx];

					v.x = o.x;
					v.y = o.y;
					v.z = o.z;

					bones[i].skinningMatrix.multiplyVector3(v);

					s.x += (v.x * weight);
					s.y += (v.y * weight);
					s.z += (v.z * weight);

				}

			}

			geometry.morphTargets.push( { name: "target_" + frame, vertices: skinned } );

		}

	};

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
					//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							var inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

				default:
					break;

			}

		}

		// FIXME: multi-material mesh?
		// geometries

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[instance_geometry.url];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( !geometry.mesh || !geometry.mesh.primitives )
					continue;

				if ( obj.name.length == 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;

						shader.material.opacity = !shader.material.opacity ? 1 : shader.material.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( shader.material )
						first_material = shader.material;
						first_material.name = mat.name == null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MeshFaceMaterial();
					geom.materials = used_materials_array;

					for ( j = 0; j < geom.faces.length; j ++ ) {

						var face = geom.faces[ j ];
						face.materialIndex = used_materials[ face.daeMaterial ]

					}

				}

				if ( skinController !== undefined) {

					applySkin( geom, skinController );

					material.morphTargets = true;

					mesh = new THREE.SkinnedMesh( geom, material );
					mesh.skeleton = skinController.skeleton;
					mesh.skinController = controllers[ skinController.url ];
					mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;

					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					mesh = new THREE.Mesh( geom, material );
					// mesh.geom.name = geometry.id;

				}

				node.geometries.length > 1 ? obj.add( mesh ) : obj = mesh;

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[i];
			var cparams = cameras[instance_camera.url];

			obj = new THREE.PerspectiveCamera(cparams.fov, cparams.aspect_ratio, cparams.znear, cparams.zfar);

		}

		obj.name = node.id || "";
		obj.matrix = node.matrix;
		var props = node.matrix.decompose();
		obj.position = props[ 0 ];
		obj.quaternion = props[ 1 ];
		obj.useQuaternion = true;
		obj.scale = props[ 2 ];

		if ( options.centerGeometry && obj.geometry ) {

			var delta = THREE.GeometryUtils.center( obj.geometry );
			obj.quaternion.multiplyVector3( delta.multiplySelf( obj.scale ) );
			obj.position.subSelf( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[i], node ) );

		}

		return obj;

	};

	function getJointId( skin, id ) {

		for ( var i = 0; i < skin.joints.length; i ++ ) {

			if ( skin.joints[ i ] == id ) {

				return i;

			}

		}

	};

	function getLibraryNode( id ) {

		return COLLADA.evaluate( './/dae:library_nodes//dae:node[@id=\'' + id + '\']', COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null ).iterateNext();

	};

	function getChannelsForNode (node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		for ( var id in animations ) {

			var animation = animations[id];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var id = channel.target.split('/')[0];

				if ( id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	};

	function calcFrameDuration( node ) {

		var minT = 10000000;

		for ( var i = 0; i < node.channels.length; i ++ ) {

			var sampler = node.channels[i].sampler;

			for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

				var t0 = sampler.input[ j ];
				var t1 = sampler.input[ j + 1 ];
				minT = Math.min( minT, t1 - t0 );

			}
		}

		return minT;

	};

	function calcMatrixAt( node, t ) {

		var animated = {};

		var i, j;

		for ( i = 0; i < node.channels.length; i ++ ) {

			var channel = node.channels[ i ];
			animated[ channel.sid ] = channel;

		}

		var matrix = new THREE.Matrix4();

		for ( i = 0; i < node.transforms.length; i ++ ) {

			var transform = node.transforms[ i ];
			var channel = animated[ transform.sid ];

			if ( channel !== undefined ) {

				var sampler = channel.sampler;
				var value;

				for ( j = 0; j < sampler.input.length - 1; j ++ ) {

					if ( sampler.input[ j + 1 ] > t ) {

						value = sampler.output[ j ];
						//console.log(value.flatten)
						break;

					}

				}

				if ( value !== undefined ) {

					if ( value instanceof THREE.Matrix4 ) {

						matrix = matrix.multiply( matrix, value );

					} else {

						// FIXME: handle other types

						matrix = matrix.multiply( matrix, transform.matrix );

					}

				} else {

					matrix = matrix.multiply( matrix, transform.matrix );

				}

			} else {

				matrix = matrix.multiply( matrix, transform.matrix );

			}

		}

		return matrix;

	};

	function bakeAnimations ( node ) {

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( var i = 0, il = node.channels.length; i < il; i++ ) {

				var channel = node.channels[i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( var j = 0, jl = channel.arrIndices.length; j < jl; j++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === -1 ) {

						sids.push( fullSid );

					}

					for ( var j = 0, jl = input.length; j < jl; j++ ) {

						var time = input[j],
							data = sampler.getData( transform.type, j ),
							key = findKey( keys, time );

						if ( !key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx == -1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( var i = 0; i < sids.length; i++ ) {

				var sid = sids[ i ];

				for ( var j = 0; j < keys.length; j++ ) {

					var key = keys[ j ];

					if ( !key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	};

	function findKey ( keys, time) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal == null; i++ ) {

			var key = keys[i];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	};

	function findTimeNdx ( keys, time) {

		var ndx = -1;

		for ( var i = 0, il = keys.length; i < il && ndx == -1; i++ ) {

			var key = keys[i];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	};

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx-1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx+1 );

		if ( prevKey && nextKey ) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	};

	// Get next key with given sid

	function getNextKeyWith( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	};

	// Get previous key with given sid

	function getPrevKeyWith( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx-- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	};

	function _Image() {

		this.id = "";
		this.init_from = "";

	};

	_Image.prototype.parse = function(element) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName == 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	};

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;

				default:
					break;

			}
		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	};

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					var source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			var source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}
		}

		return this;

	};

	Morph.prototype.parseInputs = function(element) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( (new Input()).parse(child) );
					break;

				default:
					break;
			}
		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	};

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats(child.textContent);
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse(child);
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}
		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic == 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic == 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( var i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[i];
			var vertex_weights = [];

			for ( var j = 0; j < numBones; j++ ) {

				var influence = {};

				for ( var k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;
			}

			for ( var j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Object3D();

	};

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	};

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split("(");
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid == transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id == id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid == sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid == sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');

		this.type = this.type == 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode )) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	};

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = this.data[3] * TO_RADIANS;

			case 'translate':

				fixCoords( this.data, -1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function ( matrix ) {

		switch ( this.type ) {

			case 'matrix':

				matrix.multiplySelf( this.obj );
				break;

			case 'translate':

				matrix.translate( this.obj );
				break;

			case 'rotate':

				matrix.rotateByAxis( this.obj, this.angle );
				break;

			case 'scale':

				matrix.scale( this.obj );
				break;

		}

	};

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;
					
				} else {

					console.log('Incorrect addressing of matrix in transform.');

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = data * TO_RADIANS;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = data[ 3 ] * TO_RADIANS;
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	};

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace(/^#/, '') );
					break;

				case 'bind_material':

					var instances = COLLADA.evaluate( './/dae:instance_material', child, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

					if ( instances ) {

						var instance = instances.iterateNext();

						while ( instance ) {

							this.instance_material.push((new InstanceMaterial()).parse(instance));
							instance = instances.iterateNext();

						}

					}

					break;

				case 'extra':
					break;

				default:
					break;

			}
		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	};

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	};

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName == 'bind_material' ) {

				var instances = COLLADA.evaluate( './/dae:instance_material', child, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

				if ( instances ) {

					var instance = instances.iterateNext();

					while ( instance ) {

						this.instance_material.push( (new InstanceMaterial()).parse(instance) );
						instance = instances.iterateNext();

					}

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	};

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = (new Mesh(this)).parse(child);
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}
		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	};

	Mesh.prototype.parse = function( element ) {

		this.primitives = [];

		var i, j;

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		var vertexData = sources[ this.vertices.input['POSITION'].source ].data;

		for ( i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		this.geometry3js.computeCentroids();
		this.geometry3js.computeFaceNormals();
		
		if ( this.geometry3js.calcNormals ) {
			
			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;
			
		}
		
		this.geometry3js.computeBoundingBox();

		return this;

	};

	Mesh.prototype.handlePrimitive = function( primitive, geom ) {

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];
			var offset = input.offset + 1;
			maxOffset = (maxOffset < offset)? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++pCount ) {

			var p = pList[pCount], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = {};
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.UV( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:
								break;

						}

					}

				}


				var face = null, faces = [], uv, uvArr;

				if ( ns.length == 0 ) {
					// check the vertices source
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					}
					else {
						geom.calcNormals = true;
					}

				}

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[2], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {
					faces.push( new THREE.Face4( vs[0], vs[1], vs[2], vs[3], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s
					for ( k = 1; k < vcount-1; ) {

						// FIXME: normals don't seem to be quite right
						faces.push( new THREE.Face3( vs[0], vs[k], vs[k+1], [ ns[0], ns[k++], ns[k] ],  clr ) );

					}

				}

				if ( faces.length ) {

					for (var ndx = 0, len = faces.length; ndx < len; ndx++) {

						face = faces[ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k++ ) {

							uv = ts[ texture_sets[k] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[0], uv[ndx+1], uv[ndx+2] ];

							} else if ( vcount === 4 ) {

								uvArr = [ uv[0], uv[1], uv[2], uv[3] ];

							} else {

								uvArr = [ uv[0], uv[1], uv[2] ];

							}

							if ( !geom.faceVertexUvs[k] ) {

								geom.faceVertexUvs[k] = [];

							}

							geom.faceVertexUvs[k].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}
		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	};

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source == vertices.id ) {

				this.inputs[ i ].source = vertices.input[ 'POSITION' ].source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	};

	Polylist.prototype = new Polygons();
	Polylist.prototype.constructor = Polylist;

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	};

	Triangles.prototype = new Polygons();
	Triangles.prototype.constructor = Triangles;

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	};

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName == 'param' ) {

				var param = {};
				param[ 'name' ] = child.getAttribute( 'name' );
				param[ 'type' ] = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	};

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[i].nodeName == 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	};

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);

		if ( this.semantic == 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	};

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName == 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}
					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

			var param = this.accessor.params[ 0 ];

			//console.log(param.name + " " + param.type);

			switch ( param.type ) {

				case 'IDREF':
				case 'Name': case 'name':
				case 'float':

					return this.data;

				case 'float4x4':

					for ( var j = 0; j < this.data.length; j += 16 ) {

						var s = this.data.slice( j, j + 16 );
						var m = getConvertedMat4( s );
						result.push( m );
					}

					break;

				default:

					console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
					break;

			}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	};

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName == 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color( 0 );
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	};

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture == null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture != null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color(0);
					this.color.setRGB( rgba[0], rgba[1], rgba[2] );
					this.color.a = rgba[3];
					break;

				case 'texture':

					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1,
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[1] && element.childNodes[1].nodeName === 'extra' ) {

			element = element.childNodes[1];

			if ( element.childNodes[1] && element.childNodes[1].nodeName === 'technique' ) {

				element = element.childNodes[1];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );
					break;

				case 'wrapU':
				case 'wrapV':

					this.texOpts[ child.nodeName ] = parseInt( child.textContent );
					break;

				default:
					this.texOpts[ child.nodeName ] = child.textContent;
					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	};

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'shininess':
				case 'reflectivity':
				case 'transparency':

					var f = evaluateXPath( child, './/dae:float' );

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};
		var transparent = ( this['transparency'] !== undefined && this['transparency'] < 1.0 );

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':

					var cot = this[prop];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							if ( this.effect.sampler && this.effect.surface ) {

								if ( this.effect.sampler.source == this.effect.surface.sid ) {

									var image = images[this.effect.surface.init_from];

									if ( image ) {

										var texture = THREE.ImageUtils.loadTexture(baseUrl + image.init_from);
										texture.wrapS = cot.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.wrapT = cot.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										props['map'] = texture;

										// Texture with baked lighting?
										if ( prop == 'emission' ) props[ 'emissive' ] = 0xffffff;

									}

								}

							}

						} else if ( prop == 'diffuse' || !transparent ) {

							if ( prop == 'emission' ) {

								props[ 'emissive' ] = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':
				case 'reflectivity':

					props[ prop ] = this[ prop ];
					break;

				case 'transparency':

					if ( transparent ) {

						props[ 'transparent' ] = true;
						props[ 'opacity' ] = this[ prop ];
						transparent = true;

					}

					break;

				default:
					break;

			}

		}

		props[ 'shading' ] = preferredShading;

		switch ( this.type ) {

			case 'constant':

				props.color = props.emission;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				props.color = props.diffuse;
				this.material = new THREE.MeshPhongMaterial( props );
				break;

			case 'lambert':
			default:

				props.color = props.diffuse;
				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	};

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	};

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = null;
		this.sampler = null;

	};

	Effect.prototype.create = function () {

		if ( this.shader == null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface = ( new Surface( this ) ).parse( child );
					this.surface.sid = sid;
					break;

				case 'sampler2D':

					this.sampler = ( new Sampler2D( this ) ).parse( child );
					this.sampler.sid = sid;
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique= function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;

				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	};

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	};

	Animation.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( var src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					var src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	};

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf(".") >= 0 );
		var arrSyntax = ( sid.indexOf("(") >= 0 );

		if ( dotSyntax ) {

			parts = sid.split(".");
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split("(");
			this.sid = arrIndices.shift();

			for (var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[j] = parseInt( arrIndices[j].replace(/\)/, '') );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	};

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( (new Input()).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log(input.semantic);
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 100000000;
			this.endTime = -100000000;

			for ( var i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, -1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, -1 );

			}

		} else {

			data = this.output[ ndx ];

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	};

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			var target = this.targets[ i ];

			if ( !opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				// check scale error

				if ( scale < 0 || scale > 1 ) {

					console.log( "Key.interpolate: Warning! Scale out of bounds:" + scale );
					scale = scale < 0 ? 0 : 1;

				}

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	};

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName == 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( var j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique == 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( var k = 0; k < perspective.childNodes.length; k ++ ) {

							var param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique == 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( var k = 0; k < orthographic.childNodes.length; k ++ ) {

							var param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}
				
			}

		}
		
		return this;

	};

	function InstanceCamera() {

		this.url = "";

	};

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] != undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source(id )).parse( element );
		return sources[ id ];

	};

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix == "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	};

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( (raw[i] == 'true' || raw[i] == '1') ? true : false );

		}

		return data;

	};

	function _floats( str ) {

		var raw = _strings(str);
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	};

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	};

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	};

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	};

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	};

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10) ;

		} else {

			return defaultValue;

		}

	};

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	};

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	};

	function evaluateXPath( node, query ) {

		var instances = COLLADA.evaluate( query, node, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

		var inst = instances.iterateNext();
		var result = [];

		while ( inst ) {

			result.push( inst );
			inst = instances.iterateNext();

		}

		return result;

	};

	// Up axis conversion

	function setUpConversion() {

		if ( !options.convertUpAxis || colladaUp === options.upAxis ) {

			upConversion = null;

		} else {

			switch ( colladaUp ) {

				case 'X':

					upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
					break;

				case 'Y':

					upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
					break;

				case 'Z':

					upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
					break;

			}

		}

	};

	function fixCoords( data, sign ) {

		if ( !options.convertUpAxis || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				var tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				var tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				var tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				var tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	};

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, -1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	};

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, -1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, -1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, -1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4(
			data[0], data[1], data[2], data[3],
			data[4], data[5], data[6], data[7],
			data[8], data[9], data[10], data[11],
			data[12], data[13], data[14], data[15]
			);

	};

	function getConvertedIndex( index ) {

		if ( index > -1 && index < 3 ) {

			var members = ['X', 'Y', 'Z'],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;
		
	};

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	};

	return {

		load: load,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometries : geometries,
		options: options

	};

};
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.JSONLoader = function ( showStatus ) {

	THREE.Loader.call( this, showStatus );

};

THREE.JSONLoader.prototype = new THREE.Loader();
THREE.JSONLoader.prototype.constructor = THREE.JSONLoader;
THREE.JSONLoader.prototype.supr = THREE.Loader.prototype;

THREE.JSONLoader.prototype.load = function ( url, callback, texturePath ) {

	var worker, scope = this;

	texturePath = texturePath ? texturePath : this.extractUrlBase( url );

	this.onLoadStart();
	this.loadAjaxJSON( this, url, callback, texturePath );

};

THREE.JSONLoader.prototype.loadAjaxJSON = function ( context, url, callback, texturePath, callbackProgress ) {

	var xhr = new XMLHttpRequest();

	var length = 0;

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === xhr.DONE ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				if ( xhr.responseText ) {

					var json = JSON.parse( xhr.responseText );
					context.createModel( json, callback, texturePath );

				} else {

					console.warn( "THREE.JSONLoader: [" + url + "] seems to be unreachable or file there is empty" );

				}

				// in context of more complex asset initialization
				// do not block on single failed file
				// maybe should go even one more level up

				context.onLoadComplete();

			} else {

				console.error( "THREE.JSONLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState === xhr.LOADING ) {

			if ( callbackProgress ) {

				if ( length === 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

			length = xhr.getResponseHeader( "Content-Length" );

		}

	};

	xhr.open( "GET", url, true );
	if ( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );

};

THREE.JSONLoader.prototype.createModel = function ( json, callback, texturePath ) {

	var scope = this,
	geometry = new THREE.Geometry(),
	scale = ( json.scale !== undefined ) ? 1.0 / json.scale : 1.0;

	this.initMaterials( geometry, json.materials, texturePath );

	parseModel( scale );

	parseSkin();
	parseMorphing( scale );

	geometry.computeCentroids();
	geometry.computeFaceNormals();

	if ( this.hasNormals( geometry ) ) geometry.computeTangents();


	function parseModel( scale ) {

		function isBitSet( value, position ) {

			return value & ( 1 << position );

		}

		var i, j, fi,

		offset, zLength, nVertices,

		colorIndex, normalIndex, uvIndex, materialIndex,

		type,
		isQuad,
		hasMaterial,
		hasFaceUv, hasFaceVertexUv,
		hasFaceNormal, hasFaceVertexNormal,
		hasFaceColor, hasFaceVertexColor,

		vertex, face, color, normal,

		uvLayer, uvs, u, v,

		faces = json.faces,
		vertices = json.vertices,
		normals = json.normals,
		colors = json.colors,

		nUvLayers = 0;

		// disregard empty arrays

		for ( i = 0; i < json.uvs.length; i++ ) {

			if ( json.uvs[ i ].length ) nUvLayers ++;

		}

		for ( i = 0; i < nUvLayers; i++ ) {

			geometry.faceUvs[ i ] = [];
			geometry.faceVertexUvs[ i ] = [];

		}

		offset = 0;
		zLength = vertices.length;

		while ( offset < zLength ) {

			vertex = new THREE.Vector3();

			vertex.x = vertices[ offset ++ ] * scale;
			vertex.y = vertices[ offset ++ ] * scale;
			vertex.z = vertices[ offset ++ ] * scale;

			geometry.vertices.push( vertex );

		}

		offset = 0;
		zLength = faces.length;

		while ( offset < zLength ) {

			type = faces[ offset ++ ];


			isQuad          	= isBitSet( type, 0 );
			hasMaterial         = isBitSet( type, 1 );
			hasFaceUv           = isBitSet( type, 2 );
			hasFaceVertexUv     = isBitSet( type, 3 );
			hasFaceNormal       = isBitSet( type, 4 );
			hasFaceVertexNormal = isBitSet( type, 5 );
			hasFaceColor	    = isBitSet( type, 6 );
			hasFaceVertexColor  = isBitSet( type, 7 );

			//console.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);

			if ( isQuad ) {

				face = new THREE.Face4();

				face.a = faces[ offset ++ ];
				face.b = faces[ offset ++ ];
				face.c = faces[ offset ++ ];
				face.d = faces[ offset ++ ];

				nVertices = 4;

			} else {

				face = new THREE.Face3();

				face.a = faces[ offset ++ ];
				face.b = faces[ offset ++ ];
				face.c = faces[ offset ++ ];

				nVertices = 3;

			}

			if ( hasMaterial ) {

				materialIndex = faces[ offset ++ ];
				face.materialIndex = materialIndex;

			}

			// to get face <=> uv index correspondence

			fi = geometry.faces.length;

			if ( hasFaceUv ) {

				for ( i = 0; i < nUvLayers; i++ ) {

					uvLayer = json.uvs[ i ];

					uvIndex = faces[ offset ++ ];

					u = uvLayer[ uvIndex * 2 ];
					v = uvLayer[ uvIndex * 2 + 1 ];

					geometry.faceUvs[ i ][ fi ] = new THREE.UV( u, v );

				}

			}

			if ( hasFaceVertexUv ) {

				for ( i = 0; i < nUvLayers; i++ ) {

					uvLayer = json.uvs[ i ];

					uvs = [];

					for ( j = 0; j < nVertices; j ++ ) {

						uvIndex = faces[ offset ++ ];

						u = uvLayer[ uvIndex * 2 ];
						v = uvLayer[ uvIndex * 2 + 1 ];

						uvs[ j ] = new THREE.UV( u, v );

					}

					geometry.faceVertexUvs[ i ][ fi ] = uvs;

				}

			}

			if ( hasFaceNormal ) {

				normalIndex = faces[ offset ++ ] * 3;

				normal = new THREE.Vector3();

				normal.x = normals[ normalIndex ++ ];
				normal.y = normals[ normalIndex ++ ];
				normal.z = normals[ normalIndex ];

				face.normal = normal;

			}

			if ( hasFaceVertexNormal ) {

				for ( i = 0; i < nVertices; i++ ) {

					normalIndex = faces[ offset ++ ] * 3;

					normal = new THREE.Vector3();

					normal.x = normals[ normalIndex ++ ];
					normal.y = normals[ normalIndex ++ ];
					normal.z = normals[ normalIndex ];

					face.vertexNormals.push( normal );

				}

			}


			if ( hasFaceColor ) {

				colorIndex = faces[ offset ++ ];

				color = new THREE.Color( colors[ colorIndex ] );
				face.color = color;

			}


			if ( hasFaceVertexColor ) {

				for ( i = 0; i < nVertices; i++ ) {

					colorIndex = faces[ offset ++ ];

					color = new THREE.Color( colors[ colorIndex ] );
					face.vertexColors.push( color );

				}

			}

			geometry.faces.push( face );

		}

	};

	function parseSkin() {

		var i, l, x, y, z, w, a, b, c, d;

		if ( json.skinWeights ) {

			for ( i = 0, l = json.skinWeights.length; i < l; i += 2 ) {

				x = json.skinWeights[ i     ];
				y = json.skinWeights[ i + 1 ];
				z = 0;
				w = 0;

				geometry.skinWeights.push( new THREE.Vector4( x, y, z, w ) );

			}

		}

		if ( json.skinIndices ) {

			for ( i = 0, l = json.skinIndices.length; i < l; i += 2 ) {

				a = json.skinIndices[ i     ];
				b = json.skinIndices[ i + 1 ];
				c = 0;
				d = 0;

				geometry.skinIndices.push( new THREE.Vector4( a, b, c, d ) );

			}

		}

		geometry.bones = json.bones;
		geometry.animation = json.animation;

	};

	function parseMorphing( scale ) {

		if ( json.morphTargets !== undefined ) {

			var i, l, v, vl, dstVertices, srcVertices;

			for ( i = 0, l = json.morphTargets.length; i < l; i ++ ) {

				geometry.morphTargets[ i ] = {};
				geometry.morphTargets[ i ].name = json.morphTargets[ i ].name;
				geometry.morphTargets[ i ].vertices = [];

				dstVertices = geometry.morphTargets[ i ].vertices;
				srcVertices = json.morphTargets [ i ].vertices;

				for( v = 0, vl = srcVertices.length; v < vl; v += 3 ) {

					var vertex = new THREE.Vector3();
					vertex.x = srcVertices[ v ] * scale;
					vertex.y = srcVertices[ v + 1 ] * scale;
					vertex.z = srcVertices[ v + 2 ] * scale;

					dstVertices.push( vertex );

				}

			}

		}

		if ( json.morphColors !== undefined ) {

			var i, l, c, cl, dstColors, srcColors, color;

			for ( i = 0, l = json.morphColors.length; i < l; i++ ) {

				geometry.morphColors[ i ] = {};
				geometry.morphColors[ i ].name = json.morphColors[ i ].name;
				geometry.morphColors[ i ].colors = [];

				dstColors = geometry.morphColors[ i ].colors;
				srcColors = json.morphColors [ i ].colors;

				for ( c = 0, cl = srcColors.length; c < cl; c += 3 ) {

					color = new THREE.Color( 0xffaa00 );
					color.setRGB( srcColors[ c ], srcColors[ c + 1 ], srcColors[ c + 2 ] );
					dstColors.push( color );

				}

			}

		}

	};

	callback( geometry );

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneLoader = function () {

	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};

	this.callbackSync = function () {};
	this.callbackProgress = function () {};

};

THREE.SceneLoader.prototype.constructor = THREE.SceneLoader;

THREE.SceneLoader.prototype.load = function( url, callbackFinished ) {

	var context = this;

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				var json = JSON.parse( xhr.responseText );
				context.createScene( json, callbackFinished, url );

			} else {

				console.error( "THREE.SceneLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		}

	};

	xhr.open( "GET", url, true );
	if ( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
	xhr.setRequestHeader( "Content-Type", "text/plain" );
	xhr.send( null );

};

THREE.SceneLoader.prototype.createScene = function ( json, callbackFinished, url ) {

	var scope = this;

	var urlBase = THREE.Loader.prototype.extractUrlBase( url );

	var dg, dm, dd, dl, dc, df, dt,
		g, o, m, l, d, p, r, q, s, c, t, f, tt, pp, u,
		geometry, material, camera, fog,
		texture, images,
		light,
		data, binLoader, jsonLoader,
		counter_models, counter_textures,
		total_models, total_textures,
		result;

	data = json;

	binLoader = new THREE.BinaryLoader();
	jsonLoader = new THREE.JSONLoader();

	counter_models = 0;
	counter_textures = 0;

	result = {

		scene: new THREE.Scene(),
		geometries: {},
		materials: {},
		textures: {},
		objects: {},
		cameras: {},
		lights: {},
		fogs: {},
		empties: {}

	};

	if ( data.transform ) {

		var position = data.transform.position,
			rotation = data.transform.rotation,
			scale = data.transform.scale;

		if ( position )
			result.scene.position.set( position[ 0 ], position[ 1 ], position [ 2 ] );

		if ( rotation )
			result.scene.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation [ 2 ] );

		if ( scale )
			result.scene.scale.set( scale[ 0 ], scale[ 1 ], scale [ 2 ] );

		if ( position || rotation || scale ) {

			result.scene.updateMatrix();
			result.scene.updateMatrixWorld();

		}

	}

	function get_url( source_url, url_type ) {

		if ( url_type == "relativeToHTML" ) {

			return source_url;

		} else {

			return urlBase + "/" + source_url;

		}

	};

	function handle_objects() {

		var object;

		for( dd in data.objects ) {

			if ( !result.objects[ dd ] ) {

				o = data.objects[ dd ];

				if ( o.geometry !== undefined ) {

					geometry = result.geometries[ o.geometry ];

					// geometry already loaded

					if ( geometry ) {

						var hasNormals = false;

						// not anymore support for multiple materials
						// shouldn't really be array

						material = result.materials[ o.materials[ 0 ] ];
						hasNormals = material instanceof THREE.ShaderMaterial;

						if ( hasNormals ) {

							geometry.computeTangents();

						}

						p = o.position;
						r = o.rotation;
						q = o.quaternion;
						s = o.scale;
						m = o.matrix;

						// turn off quaternions, for the moment

						q = 0;

						if ( o.materials.length == 0 ) {

							material = new THREE.MeshFaceMaterial();

						}

						// dirty hack to handle meshes with multiple materials
						// just use face materials defined in model

						if ( o.materials.length > 1 ) {

							material = new THREE.MeshFaceMaterial();

						}

						object = new THREE.Mesh( geometry, material );
						object.name = dd;
						
						if ( m ) {
							
							object.matrixAutoUpdate = false;
							object.matrix.set( m[0], m[1], m[2], m[3],
											   m[4], m[5], m[6], m[7],
											   m[8], m[9], m[10], m[11],
											   m[12], m[13], m[14], m[15]);
							
						} else {
							
							object.position.set( p[0], p[1], p[2] );
	
							if ( q ) {
	
								object.quaternion.set( q[0], q[1], q[2], q[3] );
								object.useQuaternion = true;
	
							} else {
	
								object.rotation.set( r[0], r[1], r[2] );
	
							}
	
							object.scale.set( s[0], s[1], s[2] );
							
						}

						object.visible = o.visible;
						object.doubleSided = o.doubleSided;
						object.castShadow = o.castShadow;
						object.receiveShadow = o.receiveShadow;

						result.scene.add( object );

						result.objects[ dd ] = object;

					}

				// pure Object3D

				} else {

					p = o.position;
					r = o.rotation;
					q = o.quaternion;
					s = o.scale;

					// turn off quaternions, for the moment

					q = 0;

					object = new THREE.Object3D();
					object.name = dd;
					object.position.set( p[0], p[1], p[2] );

					if ( q ) {

						object.quaternion.set( q[0], q[1], q[2], q[3] );
						object.useQuaternion = true;

					} else {

						object.rotation.set( r[0], r[1], r[2] );

					}

					object.scale.set( s[0], s[1], s[2] );
					object.visible = ( o.visible !== undefined ) ? o.visible : false;

					result.scene.add( object );

					result.objects[ dd ] = object;
					result.empties[ dd ] = object;

				}

			}

		}

	};

	function handle_mesh( geo, id ) {

		result.geometries[ id ] = geo;
		handle_objects();

	};

	function create_callback( id ) {

		return function( geo ) {

			handle_mesh( geo, id );

			counter_models -= 1;

			scope.onLoadComplete();

			async_callback_gate();

		}

	};

	function create_callback_embed( id ) {

		return function( geo ) {

			result.geometries[ id ] = geo;

		}

	};

	function async_callback_gate() {

		var progress = {

			totalModels		: total_models,
			totalTextures	: total_textures,
			loadedModels	: total_models - counter_models,
			loadedTextures	: total_textures - counter_textures

		};

		scope.callbackProgress( progress, result );

		scope.onLoadProgress();

		if( counter_models == 0 && counter_textures == 0 ) {

			callbackFinished( result );

		}

	};

	var callbackTexture = function( images ) {

		counter_textures -= 1;
		async_callback_gate();

		scope.onLoadComplete();

	};

	// first go synchronous elements

	// cameras

	for( dc in data.cameras ) {

		c = data.cameras[ dc ];

		if ( c.type == "perspective" ) {

			camera = new THREE.PerspectiveCamera( c.fov, c.aspect, c.near, c.far );

		} else if ( c.type == "ortho" ) {

			camera = new THREE.OrthographicCamera( c.left, c.right, c.top, c.bottom, c.near, c.far );

		}

		p = c.position;
		t = c.target;
		u = c.up;

		camera.position.set( p[0], p[1], p[2] );
		camera.target = new THREE.Vector3( t[0], t[1], t[2] );
		if ( u ) camera.up.set( u[0], u[1], u[2] );

		result.cameras[ dc ] = camera;

	}

	// lights

	var hex, intensity;

	for ( dl in data.lights ) {

		l = data.lights[ dl ];

		hex = ( l.color !== undefined ) ? l.color : 0xffffff;
		intensity = ( l.intensity !== undefined ) ? l.intensity : 1;

		if ( l.type == "directional" ) {

			p = l.direction;

			light = new THREE.DirectionalLight( hex, intensity );
			light.position.set( p[0], p[1], p[2] );
			light.position.normalize();

		} else if ( l.type == "point" ) {

			p = l.position;
			d = l.distance;

			light = new THREE.PointLight( hex, intensity, d );
			light.position.set( p[0], p[1], p[2] );

		} else if ( l.type == "ambient" ) {

			light = new THREE.AmbientLight( hex );

		}

		result.scene.add( light );

		result.lights[ dl ] = light;

	}

	// fogs

	for( df in data.fogs ) {

		f = data.fogs[ df ];

		if ( f.type == "linear" ) {

			fog = new THREE.Fog( 0x000000, f.near, f.far );

		} else if ( f.type == "exp2" ) {

			fog = new THREE.FogExp2( 0x000000, f.density );

		}

		c = f.color;
		fog.color.setRGB( c[0], c[1], c[2] );

		result.fogs[ df ] = fog;

	}

	// defaults

	if ( result.cameras && data.defaults.camera ) {

		result.currentCamera = result.cameras[ data.defaults.camera ];

	}

	if ( result.fogs && data.defaults.fog ) {

		result.scene.fog = result.fogs[ data.defaults.fog ];

	}

	c = data.defaults.bgcolor;
	result.bgColor = new THREE.Color();
	result.bgColor.setRGB( c[0], c[1], c[2] );

	result.bgColorAlpha = data.defaults.bgalpha;

	// now come potentially asynchronous elements

	// geometries

	// count how many models will be loaded asynchronously

	for( dg in data.geometries ) {

		g = data.geometries[ dg ];

		if ( g.type == "bin_mesh" || g.type == "ascii_mesh" ) {

			counter_models += 1;

			scope.onLoadStart();

		}

	}

	total_models = counter_models;

	for ( dg in data.geometries ) {

		g = data.geometries[ dg ];

		if ( g.type == "cube" ) {

			geometry = new THREE.CubeGeometry( g.width, g.height, g.depth, g.segmentsWidth, g.segmentsHeight, g.segmentsDepth, null, g.flipped, g.sides );
			result.geometries[ dg ] = geometry;

		} else if ( g.type == "plane" ) {

			geometry = new THREE.PlaneGeometry( g.width, g.height, g.segmentsWidth, g.segmentsHeight );
			result.geometries[ dg ] = geometry;

		} else if ( g.type == "sphere" ) {

			geometry = new THREE.SphereGeometry( g.radius, g.segmentsWidth, g.segmentsHeight );
			result.geometries[ dg ] = geometry;

		} else if ( g.type == "cylinder" ) {

			geometry = new THREE.CylinderGeometry( g.topRad, g.botRad, g.height, g.radSegs, g.heightSegs );
			result.geometries[ dg ] = geometry;

		} else if ( g.type == "torus" ) {

			geometry = new THREE.TorusGeometry( g.radius, g.tube, g.segmentsR, g.segmentsT );
			result.geometries[ dg ] = geometry;

		} else if ( g.type == "icosahedron" ) {

			geometry = new THREE.IcosahedronGeometry( g.radius, g.subdivisions );
			result.geometries[ dg ] = geometry;

		} else if ( g.type == "bin_mesh" ) {

			binLoader.load( get_url( g.url, data.urlBaseType ), create_callback( dg ) );

		} else if ( g.type == "ascii_mesh" ) {

			jsonLoader.load( get_url( g.url, data.urlBaseType ), create_callback( dg ) );

		} else if ( g.type == "embedded_mesh" ) {

			var modelJson = data.embeds[ g.id ],
				texture_path = "";

			// Pass metadata along to jsonLoader so it knows the format version.
			modelJson.metadata = data.metadata;

			if ( modelJson ) {

				jsonLoader.createModel( modelJson, create_callback_embed( dg ), texture_path );

			}

		}

	}

	// textures

	// count how many textures will be loaded asynchronously

	for( dt in data.textures ) {

		tt = data.textures[ dt ];

		if( tt.url instanceof Array ) {

			counter_textures += tt.url.length;

			for( var n = 0; n < tt.url.length; n ++ ) {

				scope.onLoadStart();

			}

		} else {

			counter_textures += 1;

			scope.onLoadStart();

		}

	}

	total_textures = counter_textures;

	for( dt in data.textures ) {

		tt = data.textures[ dt ];

		if ( tt.mapping != undefined && THREE[ tt.mapping ] != undefined  ) {

			tt.mapping = new THREE[ tt.mapping ]();

		}

		if( tt.url instanceof Array ) {

			var url_array = [];

			for( var i = 0; i < tt.url.length; i ++ ) {

				url_array[ i ] = get_url( tt.url[ i ], data.urlBaseType );

			}

			texture = THREE.ImageUtils.loadTextureCube( url_array, tt.mapping, callbackTexture );

		} else {

			texture = THREE.ImageUtils.loadTexture( get_url( tt.url, data.urlBaseType ), tt.mapping, callbackTexture );

			if ( THREE[ tt.minFilter ] != undefined )
				texture.minFilter = THREE[ tt.minFilter ];

			if ( THREE[ tt.magFilter ] != undefined )
				texture.magFilter = THREE[ tt.magFilter ];


			if ( tt.repeat ) {

				texture.repeat.set( tt.repeat[ 0 ], tt.repeat[ 1 ] );

				if ( tt.repeat[ 0 ] != 1 ) texture.wrapS = THREE.RepeatWrapping;
				if ( tt.repeat[ 1 ] != 1 ) texture.wrapT = THREE.RepeatWrapping;

			}

			if ( tt.offset ) {

				texture.offset.set( tt.offset[ 0 ], tt.offset[ 1 ] );

			}

			// handle wrap after repeat so that default repeat can be overriden

			if ( tt.wrap ) {

				var wrapMap = {
				"repeat" 	: THREE.RepeatWrapping,
				"mirror"	: THREE.MirroredRepeatWrapping
				}

				if ( wrapMap[ tt.wrap[ 0 ] ] !== undefined ) texture.wrapS = wrapMap[ tt.wrap[ 0 ] ];
				if ( wrapMap[ tt.wrap[ 1 ] ] !== undefined ) texture.wrapT = wrapMap[ tt.wrap[ 1 ] ];

			}

		}

		result.textures[ dt ] = texture;

	}

	// materials

	for ( dm in data.materials ) {

		m = data.materials[ dm ];

		for ( pp in m.parameters ) {

			if ( pp == "envMap" || pp == "map" || pp == "lightMap" ) {

				m.parameters[ pp ] = result.textures[ m.parameters[ pp ] ];

			} else if ( pp == "shading" ) {

				m.parameters[ pp ] = ( m.parameters[ pp ] == "flat" ) ? THREE.FlatShading : THREE.SmoothShading;

			} else if ( pp == "blending" ) {

				m.parameters[ pp ] = THREE[ m.parameters[ pp ] ] ? THREE[ m.parameters[ pp ] ] : THREE.NormalBlending;

			} else if ( pp == "combine" ) {

				m.parameters[ pp ] = ( m.parameters[ pp ] == "MixOperation" ) ? THREE.MixOperation : THREE.MultiplyOperation;

			} else if ( pp == "vertexColors" ) {

				if ( m.parameters[ pp ] == "face" ) {

					m.parameters[ pp ] = THREE.FaceColors;

				// default to vertex colors if "vertexColors" is anything else face colors or 0 / null / false

				} else if ( m.parameters[ pp ] )   {

					m.parameters[ pp ] = THREE.VertexColors;

				}

			}

		}

		if ( m.parameters.opacity !== undefined && m.parameters.opacity < 1.0 ) {

			m.parameters.transparent = true;

		}

		if ( m.parameters.normalMap ) {

			var shader = THREE.ShaderUtils.lib[ "normal" ];
			var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			var diffuse = m.parameters.color;
			var specular = m.parameters.specular;
			var ambient = m.parameters.ambient;
			var shininess = m.parameters.shininess;

			uniforms[ "tNormal" ].texture = result.textures[ m.parameters.normalMap ];

			if ( m.parameters.normalMapFactor ) {

				uniforms[ "uNormalScale" ].value = m.parameters.normalMapFactor;

			}

			if ( m.parameters.map ) {

				uniforms[ "tDiffuse" ].texture = m.parameters.map;
				uniforms[ "enableDiffuse" ].value = true;

			}

			if ( m.parameters.lightMap ) {

				uniforms[ "tAO" ].texture = m.parameters.lightMap;
				uniforms[ "enableAO" ].value = true;

			}

			if ( m.parameters.specularMap ) {

				uniforms[ "tSpecular" ].texture = result.textures[ m.parameters.specularMap ];
				uniforms[ "enableSpecular" ].value = true;

			}

			uniforms[ "uDiffuseColor" ].value.setHex( diffuse );
			uniforms[ "uSpecularColor" ].value.setHex( specular );
			uniforms[ "uAmbientColor" ].value.setHex( ambient );

			uniforms[ "uShininess" ].value = shininess;

			if ( m.parameters.opacity ) {

				uniforms[ "uOpacity" ].value = m.parameters.opacity;

			}

			var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };

			material = new THREE.ShaderMaterial( parameters );

		} else {

			material = new THREE[ m.type ]( m.parameters );

		}

		result.materials[ dm ] = material;

	}

	// objects ( synchronous init of procedural primitives )

	handle_objects();

	// synchronous callback

	scope.callbackSync( result );

	// just in case there are no async elements:
	async_callback_gate();


};
/**
 * Loader for UTF8 encoded models generated by:
 *	http://code.google.com/p/webgl-loader/
 *
 * Limitations:
 *  - number of vertices < 65536 (this is after optimizations in compressor, input OBJ may have even less)
 *	- models must have normals and texture coordinates
 *  - texture coordinates must be only from <0,1>
 *  - no materials support yet
 *  - models are scaled and offset (copy numbers from compressor and use them as parameters in UTF8Loader.load() )
 *
 * @author alteredq / http://alteredqualia.com/
 * @author won3d / http://twitter.com/won3d
 */

THREE.UTF8Loader = function () {};

THREE.UTF8Loader.prototype.load = function ( url, callback, metadata ) {

	var xhr = new XMLHttpRequest(),
		callbackProgress = null,

		scale = metadata.scale !== undefined ? metadata.scale : 1,
		offsetX = metadata.offsetX !== undefined ? metadata.offsetX : 0,
		offsetY = metadata.offsetY !== undefined ? metadata.offsetY : 0,
		offsetZ = metadata.offsetZ !== undefined ? metadata.offsetZ : 0;

	var length = 0;

	xhr.onreadystatechange = function() {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				THREE.UTF8Loader.prototype.createModel( xhr.responseText, callback, scale, offsetX, offsetY, offsetZ );

			} else {

				console.error( "THREE.UTF8Loader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState == 3 ) {

			if ( callbackProgress ) {

				if ( length == 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState == 2 ) {

			length = xhr.getResponseHeader( "Content-Length" );

		}

	}

	xhr.open( "GET", url, true );
	xhr.send( null );

};

// UTF-8 decoder from webgl-loader
// http://code.google.com/p/webgl-loader/

// Copyright 2011 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License. You
// may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

THREE.UTF8Loader.prototype.decompressMesh = function ( str ) {

	var num_verts = str.charCodeAt( 0 );

	if ( num_verts >= 0xE000 ) {

		num_verts -= 0x0800;

	}

	num_verts ++;

	var attribs_out = new Float32Array( 8 * num_verts );

	var offset = 1;

	for ( var i = 0; i < 8; i ++ ) {

		var prev_attrib = 0;

		for ( var j = 0; j < num_verts; ++ j ) {

			var code = str.charCodeAt( j + offset );

			prev_attrib += ( code >> 1 ) ^ ( - ( code & 1 ) );

			attribs_out[ 8 * j + i ] = prev_attrib;

		}

		offset += num_verts;

	}

	var num_indices = str.length - offset;

	var indices_out = new Uint16Array( num_indices );

	var index_high_water_mark = 0;

	for ( var i = 0; i < num_indices; i ++ ) {

		var code = str.charCodeAt( i + offset );

		indices_out[ i ] = index_high_water_mark - code;

		if ( code == 0 ) {

			index_high_water_mark ++;

		}

	}

	return [ attribs_out, indices_out ];

};

THREE.UTF8Loader.prototype.createModel = function ( data, callback, scale, offsetX, offsetY, offsetZ ) {

	var Model = function ( texture_path ) {

		//var s = (new Date).getTime();

		var scope = this;

		scope.materials = [];

		THREE.Geometry.call( this );

		var buffers = THREE.UTF8Loader.prototype.decompressMesh( data );

		var normals = [],
			uvs = [];

		init_vertices( buffers[ 0 ], 8, 0 );
		init_uvs( buffers[ 0 ], 8, 3 );
		init_normals( buffers[ 0 ], 8, 5 );

		init_faces( buffers[ 1 ] );

		this.computeCentroids();
		this.computeFaceNormals();
		//this.computeTangents();

		//var e = (new Date).getTime();

		//console.log( "utf8 data parse time: " + (e-s) + " ms" );

		function init_vertices( data, stride, offset ) {

			var i, x, y, z,
				end = data.length;

			for( i = offset; i < end; i += stride ) {

				x = data[ i ];
				y = data[ i + 1 ];
				z = data[ i + 2 ];

				// fix scale and offsets

				x = ( x / 16383 ) * scale;
				y = ( y / 16383 ) * scale;
				z = ( z / 16383 ) * scale;

				x += offsetX;
				y += offsetY;
				z += offsetZ;

				vertex( scope, x, y, z );

			}

		};

		function init_normals( data, stride, offset ) {

			var i, x, y, z,
				end = data.length;

			for( i = offset; i < end; i += stride ) {

				x = data[ i ];
				y = data[ i + 1 ];
				z = data[ i + 2 ];

				// normalize to <-1,1>

				x = ( x - 512 ) / 511;
				y = ( y - 512 ) / 511;
				z = ( z - 512 ) / 511;

				normals.push( x, y, z );

			}

		};

		function init_uvs( data, stride, offset ) {

			var i, u, v,
				end = data.length;

			for( i = offset; i < end; i += stride ) {

				u = data[ i ];
				v = data[ i + 1 ];

				// normalize to <0,1>

				u /= 1023;
				v /= 1023;

				uvs.push( u, 1 - v );

			}

		};

		function init_faces( indices ) {

			var i,
				a, b, c,
				u1, v1, u2, v2, u3, v3,
				m,
				end = indices.length;

			m = 0; // all faces defaulting to material 0

			for( i = 0; i < end; i += 3 ) {

				a = indices[ i ];
				b = indices[ i + 1 ];
				c = indices[ i + 2 ];

				f3n( scope, normals, a, b, c, m, a, b, c );

				u1 = uvs[ a * 2 ];
				v1 = uvs[ a * 2 + 1 ];

				u2 = uvs[ b * 2 ];
				v2 = uvs[ b * 2 + 1 ];

				u3 = uvs[ c * 2 ];
				v3 = uvs[ c * 2 + 1 ];

				uv3( scope.faceVertexUvs[ 0 ], u1, v1, u2, v2, u3, v3 );

			}


		}

	};

	function vertex ( scope, x, y, z ) {

		scope.vertices.push( new THREE.Vector3( x, y, z ) );

	};

	function f3n ( scope, normals, a, b, c, mi, nai, nbi, nci ) {

		var nax = normals[ nai * 3     ],
			nay = normals[ nai * 3 + 1 ],
			naz = normals[ nai * 3 + 2 ],

			nbx = normals[ nbi * 3     ],
			nby = normals[ nbi * 3 + 1 ],
			nbz = normals[ nbi * 3 + 2 ],

			ncx = normals[ nci * 3     ],
			ncy = normals[ nci * 3 + 1 ],
			ncz = normals[ nci * 3 + 2 ];

		var na = new THREE.Vector3( nax, nay, naz ),
			nb = new THREE.Vector3( nbx, nby, nbz ),
			nc = new THREE.Vector3( ncx, ncy, ncz );

		scope.faces.push( new THREE.Face3( a, b, c, [ na, nb, nc ], null, mi ) );

	};

	function uv3 ( where, u1, v1, u2, v2, u3, v3 ) {

		var uv = [];
		uv.push( new THREE.UV( u1, v1 ) );
		uv.push( new THREE.UV( u2, v2 ) );
		uv.push( new THREE.UV( u3, v3 ) );
		where.push( uv );

	};


	Model.prototype = new THREE.Geometry();
	Model.prototype.constructor = Model;

	callback( new Model() );

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ImmediateRenderObject = function ( ) {

	THREE.Object3D.call( this );

	this.render = function( renderCallback ) {
	};

};

THREE.ImmediateRenderObject.prototype = new THREE.Object3D();
THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject;

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.LensFlare = function ( texture, size, distance, blending, color ) {

	THREE.Object3D.call( this );

	this.lensFlares = [];

	this.positionScreen = new THREE.Vector3();
	this.customUpdateCallback = undefined;

	if( texture !== undefined ) {

		this.add( texture, size, distance, blending, color );

	}

};

THREE.LensFlare.prototype = new THREE.Object3D();
THREE.LensFlare.prototype.constructor = THREE.LensFlare;
THREE.LensFlare.prototype.supr = THREE.Object3D.prototype;


/*
 * Add: adds another flare
 */

THREE.LensFlare.prototype.add = function ( texture, size, distance, blending, color, opacity ) {

	if( size === undefined ) size = -1;
	if( distance === undefined ) distance = 0;
	if( opacity === undefined ) opacity = 1;
	if( color === undefined ) color = new THREE.Color( 0xffffff );
	if( blending === undefined ) blending = THREE.NormalBlending;

	distance = Math.min( distance, Math.max( 0, distance ) );

	this.lensFlares.push( { texture: texture, 			// THREE.Texture
		                    size: size, 				// size in pixels (-1 = use texture.width)
		                    distance: distance, 		// distance (0-1) from light source (0=at light source)
		                    x: 0, y: 0, z: 0,			// screen position (-1 => 1) z = 0 is ontop z = 1 is back
		                    scale: 1, 					// scale
		                    rotation: 1, 				// rotation
		                    opacity: opacity,			// opacity
							color: color,				// color
		                    blending: blending } );		// blending

};


/*
 * Update lens flares update positions on all flares based on the screen position
 * Set myLensFlare.customUpdateCallback to alter the flares in your project specific way.
 */

THREE.LensFlare.prototype.updateLensFlares = function () {

	var f, fl = this.lensFlares.length;
	var flare;
	var vecX = -this.positionScreen.x * 2;
	var vecY = -this.positionScreen.y * 2;

	for( f = 0; f < fl; f ++ ) {

		flare = this.lensFlares[ f ];

		flare.x = this.positionScreen.x + vecX * flare.distance;
		flare.y = this.positionScreen.y + vecY * flare.distance;

		flare.wantedRotation = flare.x * Math.PI * 0.25;
		flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

	}

};












/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MorphBlendMesh = function( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.animationsMap = {};
	this.animationsList = [];

	// prepare default animation
	// (all frames played together in 1 second)

	var numFrames = this.geometry.morphTargets.length;

	var name = "__default";

	var startFrame = 0;
	var endFrame = numFrames - 1;

	var fps = numFrames / 1;

	this.createAnimation( name, startFrame, endFrame, fps );
	this.setAnimationWeight( name, 1 );

};

THREE.MorphBlendMesh.prototype = new THREE.Mesh();
THREE.MorphBlendMesh.prototype.constructor = THREE.MorphBlendMesh;

THREE.MorphBlendMesh.prototype.createAnimation = function ( name, start, end, fps ) {

	var animation = {

		startFrame: start,
		endFrame: end,

		length: end - start + 1,

		fps: fps,
		duration: ( end - start ) / fps,

		lastFrame: 0,
		currentFrame: 0,

		active: false,

		time: 0,
		direction: 1,
		weight: 1,

		directionBackwards: false,
		mirroredLoop: false

	};

	this.animationsMap[ name ] = animation;
	this.animationsList.push( animation );

};

THREE.MorphBlendMesh.prototype.autoCreateAnimations = function ( fps ) {

	var pattern = /([a-z]+)(\d+)/;

	var firstAnimation, frameRanges = {};

	var geometry = this.geometry;

	for ( var i = 0, il = geometry.morphTargets.length; i < il; i ++ ) {

		var morph = geometry.morphTargets[ i ];
		var chunks = morph.name.match( pattern );

		if ( chunks && chunks.length > 1 ) {

			var name = chunks[ 1 ];
			var num = chunks[ 2 ];

			if ( ! frameRanges[ name ] ) frameRanges[ name ] = { start: Infinity, end: -Infinity };

			var range = frameRanges[ name ];

			if ( i < range.start ) range.start = i;
			if ( i > range.end ) range.end = i;

			if ( ! firstAnimation ) firstAnimation = name;

		}

	}

	for ( var name in frameRanges ) {

		var range = frameRanges[ name ];
		this.createAnimation( name, range.start, range.end, fps );

	}

	this.firstAnimation = firstAnimation;

};

THREE.MorphBlendMesh.prototype.setAnimationDirectionForward = function ( name ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.direction = 1;
		animation.directionBackwards = false;

	}

};

THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward = function ( name ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.direction = -1;
		animation.directionBackwards = true;

	}

};

THREE.MorphBlendMesh.prototype.setAnimationFPS = function ( name, fps ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.fps = fps;
		animation.duration = ( animation.end - animation.start ) / animation.fps;

	}

};

THREE.MorphBlendMesh.prototype.setAnimationDuration = function ( name, duration ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.duration = duration;
		animation.fps = ( animation.end - animation.start ) / animation.duration;

	}

};

THREE.MorphBlendMesh.prototype.setAnimationWeight = function ( name, weight ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.weight = weight;

	}

};

THREE.MorphBlendMesh.prototype.setAnimationTime = function ( name, time ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.time = time;

	}

};

THREE.MorphBlendMesh.prototype.getAnimationTime = function ( name ) {

	var time = 0;

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		time = animation.time;

	}

	return time;

};

THREE.MorphBlendMesh.prototype.getAnimationDuration = function ( name ) {

	var duration = -1;

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		duration = animation.duration;

	}

	return duration;

};

THREE.MorphBlendMesh.prototype.playAnimation = function ( name ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.time = 0;
		animation.active = true;

	} else {

		console.warn( "animation[" + name + "] undefined" );

	}

};

THREE.MorphBlendMesh.prototype.stopAnimation = function ( name ) {

	var animation = this.animationsMap[ name ];

	if ( animation ) {

		animation.active = false;

	}

};

THREE.MorphBlendMesh.prototype.update = function ( delta ) {

	for ( var i = 0, il = this.animationsList.length; i < il; i ++ ) {

		var animation = this.animationsList[ i ];

		if ( ! animation.active ) continue;

		var frameTime = animation.duration / animation.length;

		animation.time += animation.direction * delta;

		if ( animation.mirroredLoop ) {

			if ( animation.time > animation.duration || animation.time < 0 ) {

				animation.direction *= -1;

				if ( animation.time > animation.duration ) {

					animation.time = animation.duration;
					animation.directionBackwards = true;

				}

				if ( animation.time < 0 ) {

					animation.time = 0;
					animation.directionBackwards = false;

				}

			}

		} else {

			animation.time = animation.time % animation.duration;

			if ( animation.time < 0 ) animation.time += animation.duration;

		}

		var keyframe = animation.startFrame + THREE.Math.clamp( Math.floor( animation.time / frameTime ), 0, animation.length - 1 );
		var weight = animation.weight;

		if ( keyframe !== animation.currentFrame ) {

			this.morphTargetInfluences[ animation.lastFrame ] = 0;
			this.morphTargetInfluences[ animation.currentFrame ] = 1 * weight;

			this.morphTargetInfluences[ keyframe ] = 0;

			animation.lastFrame = animation.currentFrame;
			animation.currentFrame = keyframe;

		}

		var mix = ( animation.time % frameTime ) / frameTime;

		if ( animation.directionBackwards ) mix = 1 - mix;

		this.morphTargetInfluences[ animation.currentFrame ] = mix * weight;
		this.morphTargetInfluences[ animation.lastFrame ] = ( 1 - mix ) * weight;

	}

};
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.LensFlarePlugin = function ( ) {

	var _gl, _renderer, _lensFlare = {};

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		_lensFlare.vertices = new Float32Array( 8 + 8 );
		_lensFlare.faces = new Uint16Array( 6 );

		var i = 0;
		_lensFlare.vertices[ i++ ] = -1; _lensFlare.vertices[ i++ ] = -1;	// vertex
		_lensFlare.vertices[ i++ ] = 0;  _lensFlare.vertices[ i++ ] = 0;	// uv... etc.

		_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = -1;
		_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = 0;

		_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = 1;
		_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = 1;

		_lensFlare.vertices[ i++ ] = -1; _lensFlare.vertices[ i++ ] = 1;
		_lensFlare.vertices[ i++ ] = 0;  _lensFlare.vertices[ i++ ] = 1;

		i = 0;
		_lensFlare.faces[ i++ ] = 0; _lensFlare.faces[ i++ ] = 1; _lensFlare.faces[ i++ ] = 2;
		_lensFlare.faces[ i++ ] = 0; _lensFlare.faces[ i++ ] = 2; _lensFlare.faces[ i++ ] = 3;

		// buffers

		_lensFlare.vertexBuffer     = _gl.createBuffer();
		_lensFlare.elementBuffer    = _gl.createBuffer();

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _lensFlare.vertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, _lensFlare.vertices, _gl.STATIC_DRAW );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _lensFlare.elementBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _lensFlare.faces, _gl.STATIC_DRAW );

		// textures

		_lensFlare.tempTexture      = _gl.createTexture();
		_lensFlare.occlusionTexture = _gl.createTexture();

		_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.tempTexture );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, 16, 16, 0, _gl.RGB, _gl.UNSIGNED_BYTE, null );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST );

		_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.occlusionTexture );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, 16, 16, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, null );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST );

		if ( _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) <= 0 ) {

			_lensFlare.hasVertexTexture = false;
			_lensFlare.program = createProgram( THREE.ShaderFlares[ "lensFlare" ] );

		} else {

			_lensFlare.hasVertexTexture = true;
			_lensFlare.program = createProgram( THREE.ShaderFlares[ "lensFlareVertexTexture" ] );

		}

		_lensFlare.attributes = {};
		_lensFlare.uniforms = {};

		_lensFlare.attributes.vertex       = _gl.getAttribLocation ( _lensFlare.program, "position" );
		_lensFlare.attributes.uv           = _gl.getAttribLocation ( _lensFlare.program, "uv" );

		_lensFlare.uniforms.renderType     = _gl.getUniformLocation( _lensFlare.program, "renderType" );
		_lensFlare.uniforms.map            = _gl.getUniformLocation( _lensFlare.program, "map" );
		_lensFlare.uniforms.occlusionMap   = _gl.getUniformLocation( _lensFlare.program, "occlusionMap" );
		_lensFlare.uniforms.opacity        = _gl.getUniformLocation( _lensFlare.program, "opacity" );
		_lensFlare.uniforms.color          = _gl.getUniformLocation( _lensFlare.program, "color" );
		_lensFlare.uniforms.scale          = _gl.getUniformLocation( _lensFlare.program, "scale" );
		_lensFlare.uniforms.rotation       = _gl.getUniformLocation( _lensFlare.program, "rotation" );
		_lensFlare.uniforms.screenPosition = _gl.getUniformLocation( _lensFlare.program, "screenPosition" );

		_lensFlare.attributesEnabled = false;

	};


	/*
	 * Render lens flares
	 * Method: renders 16x16 0xff00ff-colored points scattered over the light source area,
	 *         reads these back and calculates occlusion.
	 *         Then _lensFlare.update_lensFlares() is called to re-position and
	 *         update transparency of flares. Then they are rendered.
	 *
	 */

	this.render = function ( scene, camera, viewportWidth, viewportHeight ) {

		var flares = scene.__webglFlares,
			nFlares = flares.length;

		if ( ! nFlares ) return;

		var tempPosition = new THREE.Vector3();

		var invAspect = viewportHeight / viewportWidth,
			halfViewportWidth = viewportWidth * 0.5,
			halfViewportHeight = viewportHeight * 0.5;

		var size = 16 / viewportHeight,
			scale = new THREE.Vector2( size * invAspect, size );

		var screenPosition = new THREE.Vector3( 1, 1, 0 ),
			screenPositionPixels = new THREE.Vector2( 1, 1 );

		var uniforms = _lensFlare.uniforms,
			attributes = _lensFlare.attributes;

		// set _lensFlare program and reset blending

		_gl.useProgram( _lensFlare.program );

		if ( ! _lensFlare.attributesEnabled ) {

			_gl.enableVertexAttribArray( _lensFlare.attributes.vertex );
			_gl.enableVertexAttribArray( _lensFlare.attributes.uv );

			_lensFlare.attributesEnabled = true;

		}

		// loop through all lens flares to update their occlusion and positions
		// setup gl and common used attribs/unforms

		_gl.uniform1i( uniforms.occlusionMap, 0 );
		_gl.uniform1i( uniforms.map, 1 );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _lensFlare.vertexBuffer );
		_gl.vertexAttribPointer( attributes.vertex, 2, _gl.FLOAT, false, 2 * 8, 0 );
		_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 2 * 8, 8 );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _lensFlare.elementBuffer );

		_gl.disable( _gl.CULL_FACE );
		_gl.depthMask( false );

		var i, j, jl, flare, sprite;

		for ( i = 0; i < nFlares; i ++ ) {

			size = 16 / viewportHeight;
			scale.set( size * invAspect, size );

			// calc object screen position

			flare = flares[ i ];

			tempPosition.set( flare.matrixWorld.elements[12], flare.matrixWorld.elements[13], flare.matrixWorld.elements[14] );

			camera.matrixWorldInverse.multiplyVector3( tempPosition );
			camera.projectionMatrix.multiplyVector3( tempPosition );

			// setup arrays for gl programs

			screenPosition.copy( tempPosition )

			screenPositionPixels.x = screenPosition.x * halfViewportWidth + halfViewportWidth;
			screenPositionPixels.y = screenPosition.y * halfViewportHeight + halfViewportHeight;

			// screen cull

			if ( _lensFlare.hasVertexTexture || (
				screenPositionPixels.x > 0 &&
				screenPositionPixels.x < viewportWidth &&
				screenPositionPixels.y > 0 &&
				screenPositionPixels.y < viewportHeight ) ) {

				// save current RGB to temp texture

				_gl.activeTexture( _gl.TEXTURE1 );
				_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.tempTexture );
				_gl.copyTexImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, screenPositionPixels.x - 8, screenPositionPixels.y - 8, 16, 16, 0 );


				// render pink quad

				_gl.uniform1i( uniforms.renderType, 0 );
				_gl.uniform2f( uniforms.scale, scale.x, scale.y );
				_gl.uniform3f( uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z );

				_gl.disable( _gl.BLEND );
				_gl.enable( _gl.DEPTH_TEST );

				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


				// copy result to occlusionMap

				_gl.activeTexture( _gl.TEXTURE0 );
				_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.occlusionTexture );
				_gl.copyTexImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, screenPositionPixels.x - 8, screenPositionPixels.y - 8, 16, 16, 0 );


				// restore graphics

				_gl.uniform1i( uniforms.renderType, 1 );
				_gl.disable( _gl.DEPTH_TEST );

				_gl.activeTexture( _gl.TEXTURE1 );
				_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.tempTexture );
				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


				// update object positions

				flare.positionScreen.copy( screenPosition )

				if ( flare.customUpdateCallback ) {

					flare.customUpdateCallback( flare );

				} else {

					flare.updateLensFlares();

				}

				// render flares

				_gl.uniform1i( uniforms.renderType, 2 );
				_gl.enable( _gl.BLEND );

				for ( j = 0, jl = flare.lensFlares.length; j < jl; j ++ ) {

					sprite = flare.lensFlares[ j ];

					if ( sprite.opacity > 0.001 && sprite.scale > 0.001 ) {

						screenPosition.x = sprite.x;
						screenPosition.y = sprite.y;
						screenPosition.z = sprite.z;

						size = sprite.size * sprite.scale / viewportHeight;

						scale.x = size * invAspect;
						scale.y = size;

						_gl.uniform3f( uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z );
						_gl.uniform2f( uniforms.scale, scale.x, scale.y );
						_gl.uniform1f( uniforms.rotation, sprite.rotation );

						_gl.uniform1f( uniforms.opacity, sprite.opacity );
						_gl.uniform3f( uniforms.color, sprite.color.r, sprite.color.g, sprite.color.b );

						_renderer.setBlending( sprite.blending, sprite.blendEquation, sprite.blendSrc, sprite.blendDst );
						_renderer.setTexture( sprite.texture, 1 );

						_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );

					}

				}

			}

		}

		// restore gl

		_gl.enable( _gl.CULL_FACE );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( true );

	};

	function createProgram ( shader ) {

		var program = _gl.createProgram();

		var fragmentShader = _gl.createShader( _gl.FRAGMENT_SHADER );
		var vertexShader = _gl.createShader( _gl.VERTEX_SHADER );

		_gl.shaderSource( fragmentShader, shader.fragmentShader );
		_gl.shaderSource( vertexShader, shader.vertexShader );

		_gl.compileShader( fragmentShader );
		_gl.compileShader( vertexShader );

		_gl.attachShader( program, fragmentShader );
		_gl.attachShader( program, vertexShader );

		_gl.linkProgram( program );

		return program;

	};

};/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShadowMapPlugin = function ( ) {

	var _gl,
	_renderer,
	_depthMaterial, _depthMaterialMorph,

	_frustum = new THREE.Frustum(),
	_projScreenMatrix = new THREE.Matrix4(),

	_min = new THREE.Vector3(),
	_max = new THREE.Vector3();

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		var depthShader = THREE.ShaderLib[ "depthRGBA" ];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

		_depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
		_depthMaterialMorph = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true } );

		_depthMaterial._shadowPass = true;
		_depthMaterialMorph._shadowPass = true;

	};

	this.render = function ( scene, camera ) {

		if ( ! ( _renderer.shadowMapEnabled && _renderer.shadowMapAutoUpdate ) ) return;

		this.update( scene, camera );

	};

	this.update = function ( scene, camera ) {

		var i, il, j, jl, n,

		shadowMap, shadowMatrix, shadowCamera,
		program, buffer, material,
		webglObject, object, light,
		renderList,

		lights = [],
		k = 0,

		fog = null;

		// set GL state for depth map

		_gl.clearColor( 1, 1, 1, 1 );
		_gl.disable( _gl.BLEND );
		if ( _renderer.shadowMapCullFrontFaces ) _gl.cullFace( _gl.FRONT );

		_renderer.setDepthTest( true );

		// preprocess lights
		// 	- skip lights that are not casting shadows
		//	- create virtual lights for cascaded shadow maps

		for ( i = 0, il = scene.__lights.length; i < il; i ++ ) {

			light = scene.__lights[ i ];

			if ( ! light.castShadow ) continue;

			if ( ( light instanceof THREE.DirectionalLight ) && light.shadowCascade ) {

				for ( n = 0; n < light.shadowCascadeCount; n ++ ) {

					var virtualLight;

					if ( ! light.shadowCascadeArray[ n ] ) {

						virtualLight = createVirtualLight( light, n );
						virtualLight.originalCamera = camera;

						var gyro = new THREE.Gyroscope();
						gyro.position = light.shadowCascadeOffset;

						gyro.add( virtualLight );
						gyro.add( virtualLight.target );

						camera.add( gyro );

						light.shadowCascadeArray[ n ] = virtualLight;

						console.log( "Created virtualLight", virtualLight );

					} else {

						virtualLight = light.shadowCascadeArray[ n ];

					}

					updateVirtualLight( light, n );

					lights[ k ] = virtualLight;
					k ++;

				}

			} else {

				lights[ k ] = light;
				k ++;

			}

		}

		// render depth map

		for ( i = 0, il = lights.length; i < il; i ++ ) {

			light = lights[ i ];

			if ( ! light.shadowMap ) {

				var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

				light.shadowMap = new THREE.WebGLRenderTarget( light.shadowMapWidth, light.shadowMapHeight, pars );
				light.shadowMapSize = new THREE.Vector2( light.shadowMapWidth, light.shadowMapHeight );

				light.shadowMatrix = new THREE.Matrix4();

			}

			if ( ! light.shadowCamera ) {

				if ( light instanceof THREE.SpotLight ) {

					light.shadowCamera = new THREE.PerspectiveCamera( light.shadowCameraFov, light.shadowMapWidth / light.shadowMapHeight, light.shadowCameraNear, light.shadowCameraFar );

				} else if ( light instanceof THREE.DirectionalLight ) {

					light.shadowCamera = new THREE.OrthographicCamera( light.shadowCameraLeft, light.shadowCameraRight, light.shadowCameraTop, light.shadowCameraBottom, light.shadowCameraNear, light.shadowCameraFar );

				} else {

					console.error( "Unsupported light type for shadow" );
					continue;

				}

				scene.add( light.shadowCamera );

				if ( _renderer.autoUpdateScene ) scene.updateMatrixWorld();

			}

			if ( light.shadowCameraVisible && ! light.cameraHelper ) {

				light.cameraHelper = new THREE.CameraHelper( light.shadowCamera );
				light.shadowCamera.add( light.cameraHelper );

			}

			if ( light.isVirtual && virtualLight.originalCamera == camera ) {

				updateShadowCamera( camera, light );

			}

			shadowMap = light.shadowMap;
			shadowMatrix = light.shadowMatrix;
			shadowCamera = light.shadowCamera;

			shadowCamera.position.copy( light.matrixWorld.getPosition() );
			shadowCamera.lookAt( light.target.matrixWorld.getPosition() );
			shadowCamera.updateMatrixWorld();

			shadowCamera.matrixWorldInverse.getInverse( shadowCamera.matrixWorld );

			if ( light.cameraHelper ) light.cameraHelper.lines.visible = light.shadowCameraVisible;
			if ( light.shadowCameraVisible ) light.cameraHelper.update();

			// compute shadow matrix

			shadowMatrix.set( 0.5, 0.0, 0.0, 0.5,
							  0.0, 0.5, 0.0, 0.5,
							  0.0, 0.0, 0.5, 0.5,
							  0.0, 0.0, 0.0, 1.0 );

			shadowMatrix.multiplySelf( shadowCamera.projectionMatrix );
			shadowMatrix.multiplySelf( shadowCamera.matrixWorldInverse );

			// update camera matrices and frustum

			if ( ! shadowCamera._viewMatrixArray ) shadowCamera._viewMatrixArray = new Float32Array( 16 );
			if ( ! shadowCamera._projectionMatrixArray ) shadowCamera._projectionMatrixArray = new Float32Array( 16 );

			shadowCamera.matrixWorldInverse.flattenToArray( shadowCamera._viewMatrixArray );
			shadowCamera.projectionMatrix.flattenToArray( shadowCamera._projectionMatrixArray );

			_projScreenMatrix.multiply( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
			_frustum.setFromMatrix( _projScreenMatrix );

			// render shadow map

			_renderer.setRenderTarget( shadowMap );
			_renderer.clear();

			// set object matrices & frustum culling

			renderList = scene.__webglObjects;

			for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

				webglObject = renderList[ j ];
				object = webglObject.object;

				webglObject.render = false;

				if ( object.visible && object.castShadow ) {

					if ( ! ( object instanceof THREE.Mesh ) || ! ( object.frustumCulled ) || _frustum.contains( object ) ) {

						//object.matrixWorld.flattenToArray( object._objectMatrixArray );
						object._modelViewMatrix.multiply( shadowCamera.matrixWorldInverse, object.matrixWorld);

						webglObject.render = true;

					}

				}

			}

			// render regular objects

			for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

				webglObject = renderList[ j ];

				if ( webglObject.render ) {

					object = webglObject.object;
					buffer = webglObject.buffer;

					_renderer.setObjectFaces( object );

					if ( object.customDepthMaterial ) {

						material = object.customDepthMaterial;

					} else if ( object.geometry.morphTargets.length ) {

						material = _depthMaterialMorph;

					} else {

						material = _depthMaterial;

					}

					if ( buffer instanceof THREE.BufferGeometry ) {

						_renderer.renderBufferDirect( shadowCamera, scene.__lights, fog, material, buffer, object );

					} else {

						_renderer.renderBuffer( shadowCamera, scene.__lights, fog, material, buffer, object );

					}

				}

			}

			// set matrices and render immediate objects

			renderList = scene.__webglObjectsImmediate;

			for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

				webglObject = renderList[ j ];
				object = webglObject.object;

				if ( object.visible && object.castShadow ) {

					/*
					if ( object.matrixAutoUpdate ) {

						object.matrixWorld.flattenToArray( object._objectMatrixArray );

					}
					*/

					object._modelViewMatrix.multiply( shadowCamera.matrixWorldInverse, object.matrixWorld);

					_renderer.renderImmediateObject( shadowCamera, scene.__lights, fog, _depthMaterial, object );

				}

			}

		}

		// restore GL state

		var clearColor = _renderer.getClearColor(),
		clearAlpha = _renderer.getClearAlpha();

		_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );
		_gl.enable( _gl.BLEND );
		if ( _renderer.shadowMapCullFrontFaces ) _gl.cullFace( _gl.BACK );

	};

	function createVirtualLight( light, cascade ) {

		var virtualLight = new THREE.DirectionalLight();

		virtualLight.isVirtual = true;

		virtualLight.onlyShadow = true;
		virtualLight.castShadow = true;

		virtualLight.shadowCameraNear = light.shadowCameraNear;
		virtualLight.shadowCameraFar = light.shadowCameraFar;

		virtualLight.shadowCameraLeft = light.shadowCameraLeft;
		virtualLight.shadowCameraRight = light.shadowCameraRight;
		virtualLight.shadowCameraBottom = light.shadowCameraBottom;
		virtualLight.shadowCameraTop = light.shadowCameraTop;

		virtualLight.shadowCameraVisible = light.shadowCameraVisible;

		virtualLight.shadowDarkness = light.shadowDarkness;

		virtualLight.shadowBias = light.shadowCascadeBias[ cascade ];
		virtualLight.shadowMapWidth = light.shadowCascadeWidth[ cascade ];
		virtualLight.shadowMapHeight = light.shadowCascadeHeight[ cascade ];

		virtualLight.pointsWorld = [];
		virtualLight.pointsFrustum = [];

		var pointsWorld = virtualLight.pointsWorld,
			pointsFrustum = virtualLight.pointsFrustum;

		for ( var i = 0; i < 8; i ++ ) {

			pointsWorld[ i ] = new THREE.Vector3();
			pointsFrustum[ i ] = new THREE.Vector3();

		}

		var nearZ = light.shadowCascadeNearZ[ cascade ];
		var farZ = light.shadowCascadeFarZ[ cascade ];

		pointsFrustum[ 0 ].set( -1, -1, nearZ );
		pointsFrustum[ 1 ].set(  1, -1, nearZ );
		pointsFrustum[ 2 ].set( -1,  1, nearZ );
		pointsFrustum[ 3 ].set(  1,  1, nearZ );

		pointsFrustum[ 4 ].set( -1, -1, farZ );
		pointsFrustum[ 5 ].set(  1, -1, farZ );
		pointsFrustum[ 6 ].set( -1,  1, farZ );
		pointsFrustum[ 7 ].set(  1,  1, farZ );

		return virtualLight;

	}

	// Synchronize virtual light with the original light

	function updateVirtualLight( light, cascade ) {

		var virtualLight = light.shadowCascadeArray[ cascade ];

		virtualLight.position.copy( light.position );
		virtualLight.target.position.copy( light.target.position );
		virtualLight.lookAt( virtualLight.target );

		virtualLight.shadowCameraVisible = light.shadowCameraVisible;
		virtualLight.shadowDarkness = light.shadowDarkness;

		virtualLight.shadowBias = light.shadowCascadeBias[ cascade ];

		var nearZ = light.shadowCascadeNearZ[ cascade ];
		var farZ = light.shadowCascadeFarZ[ cascade ];

		var pointsFrustum = virtualLight.pointsFrustum;

		pointsFrustum[ 0 ].z = nearZ;
		pointsFrustum[ 1 ].z = nearZ;
		pointsFrustum[ 2 ].z = nearZ;
		pointsFrustum[ 3 ].z = nearZ;

		pointsFrustum[ 4 ].z = farZ;
		pointsFrustum[ 5 ].z = farZ;
		pointsFrustum[ 6 ].z = farZ;
		pointsFrustum[ 7 ].z = farZ;

	}

	// Fit shadow camera's ortho frustum to camera frustum

	function updateShadowCamera( camera, light ) {

		var shadowCamera = light.shadowCamera,
			pointsFrustum = light.pointsFrustum,
			pointsWorld = light.pointsWorld;

		_min.set( Infinity, Infinity, Infinity );
		_max.set( -Infinity, -Infinity, -Infinity );

		for ( var i = 0; i < 8; i ++ ) {

			var p = pointsWorld[ i ];

			p.copy( pointsFrustum[ i ] );
			THREE.ShadowMapPlugin.__projector.unprojectVector( p, camera );

			shadowCamera.matrixWorldInverse.multiplyVector3( p );

			if ( p.x < _min.x ) _min.x = p.x;
			if ( p.x > _max.x ) _max.x = p.x;

			if ( p.y < _min.y ) _min.y = p.y;
			if ( p.y > _max.y ) _max.y = p.y;

			if ( p.z < _min.z ) _min.z = p.z;
			if ( p.z > _max.z ) _max.z = p.z;

		}

		shadowCamera.left = _min.x;
		shadowCamera.right = _max.x;
		shadowCamera.top = _max.y;
		shadowCamera.bottom = _min.y;

		// can't really fit near/far
		//shadowCamera.near = _min.z;
		//shadowCamera.far = _max.z;

		shadowCamera.updateProjectionMatrix();

	}

};

THREE.ShadowMapPlugin.__projector = new THREE.Projector();
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpritePlugin = function ( ) {

	var _gl, _renderer, _sprite = {};

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		_sprite.vertices = new Float32Array( 8 + 8 );
		_sprite.faces    = new Uint16Array( 6 );

		var i = 0;

		_sprite.vertices[ i++ ] = -1; _sprite.vertices[ i++ ] = -1;	// vertex 0
		_sprite.vertices[ i++ ] = 0;  _sprite.vertices[ i++ ] = 1;	// uv 0

		_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = -1;	// vertex 1
		_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = 1;	// uv 1

		_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = 1;	// vertex 2
		_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = 0;	// uv 2

		_sprite.vertices[ i++ ] = -1; _sprite.vertices[ i++ ] = 1;	// vertex 3
		_sprite.vertices[ i++ ] = 0;  _sprite.vertices[ i++ ] = 0;	// uv 3

		i = 0;

		_sprite.faces[ i++ ] = 0; _sprite.faces[ i++ ] = 1; _sprite.faces[ i++ ] = 2;
		_sprite.faces[ i++ ] = 0; _sprite.faces[ i++ ] = 2; _sprite.faces[ i++ ] = 3;

		_sprite.vertexBuffer  = _gl.createBuffer();
		_sprite.elementBuffer = _gl.createBuffer();

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _sprite.vertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, _sprite.vertices, _gl.STATIC_DRAW );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _sprite.elementBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _sprite.faces, _gl.STATIC_DRAW );

		_sprite.program = createProgram( THREE.ShaderSprite[ "sprite" ] );

		_sprite.attributes = {};
		_sprite.uniforms = {};

		_sprite.attributes.position           = _gl.getAttribLocation ( _sprite.program, "position" );
		_sprite.attributes.uv                 = _gl.getAttribLocation ( _sprite.program, "uv" );

		_sprite.uniforms.uvOffset             = _gl.getUniformLocation( _sprite.program, "uvOffset" );
		_sprite.uniforms.uvScale              = _gl.getUniformLocation( _sprite.program, "uvScale" );

		_sprite.uniforms.rotation             = _gl.getUniformLocation( _sprite.program, "rotation" );
		_sprite.uniforms.scale                = _gl.getUniformLocation( _sprite.program, "scale" );
		_sprite.uniforms.alignment            = _gl.getUniformLocation( _sprite.program, "alignment" );

		_sprite.uniforms.color                = _gl.getUniformLocation( _sprite.program, "color" );
		_sprite.uniforms.map                  = _gl.getUniformLocation( _sprite.program, "map" );
		_sprite.uniforms.opacity              = _gl.getUniformLocation( _sprite.program, "opacity" );

		_sprite.uniforms.useScreenCoordinates = _gl.getUniformLocation( _sprite.program, "useScreenCoordinates" );
		_sprite.uniforms.affectedByDistance   = _gl.getUniformLocation( _sprite.program, "affectedByDistance" );
		_sprite.uniforms.screenPosition    	  = _gl.getUniformLocation( _sprite.program, "screenPosition" );
		_sprite.uniforms.modelViewMatrix      = _gl.getUniformLocation( _sprite.program, "modelViewMatrix" );
		_sprite.uniforms.projectionMatrix     = _gl.getUniformLocation( _sprite.program, "projectionMatrix" );

		_sprite.attributesEnabled = false;

	};

	this.render = function ( scene, camera, viewportWidth, viewportHeight ) {

		var sprites = scene.__webglSprites,
			nSprites = sprites.length;

		if ( ! nSprites ) return;

		var attributes = _sprite.attributes,
			uniforms = _sprite.uniforms;

		var invAspect = viewportHeight / viewportWidth;

		var halfViewportWidth = viewportWidth * 0.5,
			halfViewportHeight = viewportHeight * 0.5;

		var mergeWith3D = true;

		// setup gl

		_gl.useProgram( _sprite.program );

		if ( ! _sprite.attributesEnabled ) {

			_gl.enableVertexAttribArray( attributes.position );
			_gl.enableVertexAttribArray( attributes.uv );

			_sprite.attributesEnabled = true;

		}

		_gl.disable( _gl.CULL_FACE );
		_gl.enable( _gl.BLEND );
		_gl.depthMask( true );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _sprite.vertexBuffer );
		_gl.vertexAttribPointer( attributes.position, 2, _gl.FLOAT, false, 2 * 8, 0 );
		_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 2 * 8, 8 );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _sprite.elementBuffer );

		_gl.uniformMatrix4fv( uniforms.projectionMatrix, false, camera._projectionMatrixArray );

		_gl.activeTexture( _gl.TEXTURE0 );
		_gl.uniform1i( uniforms.map, 0 );

		// update positions and sort

		var i, sprite, screenPosition, size, scale = [];

		for( i = 0; i < nSprites; i ++ ) {

			sprite = sprites[ i ];

			if ( ! sprite.visible || sprite.opacity === 0 ) continue;

			if( ! sprite.useScreenCoordinates ) {

				sprite._modelViewMatrix.multiply( camera.matrixWorldInverse, sprite.matrixWorld);
				sprite.z = - sprite._modelViewMatrix.elements[14];

			} else {

				sprite.z = - sprite.position.z;

			}

		}

		sprites.sort( painterSort );

		// render all sprites

		for( i = 0; i < nSprites; i ++ ) {

			sprite = sprites[ i ];

			if ( ! sprite.visible || sprite.opacity === 0 ) continue;

			if ( sprite.map && sprite.map.image && sprite.map.image.width ) {

				if ( sprite.useScreenCoordinates ) {

					_gl.uniform1i( uniforms.useScreenCoordinates, 1 );
					_gl.uniform3f( uniforms.screenPosition, ( sprite.position.x - halfViewportWidth  ) / halfViewportWidth,
															( halfViewportHeight - sprite.position.y ) / halfViewportHeight,
															  Math.max( 0, Math.min( 1, sprite.position.z ) ) );

				} else {

					_gl.uniform1i( uniforms.useScreenCoordinates, 0 );
					_gl.uniform1i( uniforms.affectedByDistance, sprite.affectedByDistance ? 1 : 0 );
					_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, sprite._modelViewMatrix.elements);

				}

				size = sprite.map.image.width / ( sprite.scaleByViewport ? viewportHeight : 1 );

				scale[ 0 ] = size * invAspect * sprite.scale.x;
				scale[ 1 ] = size * sprite.scale.y;

				_gl.uniform2f( uniforms.uvScale, sprite.uvScale.x, sprite.uvScale.y );
				_gl.uniform2f( uniforms.uvOffset, sprite.uvOffset.x, sprite.uvOffset.y );
				_gl.uniform2f( uniforms.alignment, sprite.alignment.x, sprite.alignment.y );

				_gl.uniform1f( uniforms.opacity, sprite.opacity );
				_gl.uniform3f( uniforms.color, sprite.color.r, sprite.color.g, sprite.color.b );

				_gl.uniform1f( uniforms.rotation, sprite.rotation );
				_gl.uniform2fv( uniforms.scale, scale );

				if ( sprite.mergeWith3D && !mergeWith3D ) {

					_gl.enable( _gl.DEPTH_TEST );
					mergeWith3D = true;

				} else if ( ! sprite.mergeWith3D && mergeWith3D ) {

					_gl.disable( _gl.DEPTH_TEST );
					mergeWith3D = false;

				}

				_renderer.setBlending( sprite.blending, sprite.blendEquation, sprite.blendSrc, sprite.blendDst );
				_renderer.setTexture( sprite.map, 0 );

				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );

			}

		}

		// restore gl

		_gl.enable( _gl.CULL_FACE );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( true );

	};

	function createProgram ( shader ) {

		var program = _gl.createProgram();

		var fragmentShader = _gl.createShader( _gl.FRAGMENT_SHADER );
		var vertexShader = _gl.createShader( _gl.VERTEX_SHADER );

		_gl.shaderSource( fragmentShader, shader.fragmentShader );
		_gl.shaderSource( vertexShader, shader.vertexShader );

		_gl.compileShader( fragmentShader );
		_gl.compileShader( vertexShader );

		_gl.attachShader( program, fragmentShader );
		_gl.attachShader( program, vertexShader );

		_gl.linkProgram( program );

		return program;

	};

	function painterSort ( a, b ) {

		return b.z - a.z;

	};

};/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DepthPassPlugin = function ( ) {

	this.enabled = false;
	this.renderTarget = null;

	var _gl,
	_renderer,
	_depthMaterial, _depthMaterialMorph,

	_frustum = new THREE.Frustum(),
	_projScreenMatrix = new THREE.Matrix4();

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		var depthShader = THREE.ShaderLib[ "depthRGBA" ];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

		_depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
		_depthMaterialMorph = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, morphTargets: true } );

		_depthMaterial._shadowPass = true;
		_depthMaterialMorph._shadowPass = true;

	};

	this.render = function ( scene, camera ) {

		if ( ! this.enabled ) return;

		this.update( scene, camera );

	};

	this.update = function ( scene, camera ) {

		var i, il, j, jl, n,

		program, buffer, material,
		webglObject, object, light,
		renderList,

		fog = null;

		// set GL state for depth map

		_gl.clearColor( 1, 1, 1, 1 );
		_gl.disable( _gl.BLEND );

		_renderer.setDepthTest( true );

		// update scene

		if ( _renderer.autoUpdateScene ) scene.updateMatrixWorld();

		// update camera matrices and frustum

		if ( ! camera._viewMatrixArray ) camera._viewMatrixArray = new Float32Array( 16 );
		if ( ! camera._projectionMatrixArray ) camera._projectionMatrixArray = new Float32Array( 16 );

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		camera.matrixWorldInverse.flattenToArray( camera._viewMatrixArray );
		camera.projectionMatrix.flattenToArray( camera._projectionMatrixArray );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromMatrix( _projScreenMatrix );

		// render depth map

		_renderer.setRenderTarget( this.renderTarget );
		_renderer.clear();

		// set object matrices & frustum culling

		renderList = scene.__webglObjects;

		for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

			webglObject = renderList[ j ];
			object = webglObject.object;

			webglObject.render = false;

			if ( object.visible ) {

				if ( ! ( object instanceof THREE.Mesh ) || ! ( object.frustumCulled ) || _frustum.contains( object ) ) {

					//object.matrixWorld.flattenToArray( object._objectMatrixArray );
					object._modelViewMatrix.multiply( camera.matrixWorldInverse, object.matrixWorld);

					webglObject.render = true;

				}

			}

		}

		// render regular objects

		for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

			webglObject = renderList[ j ];

			if ( webglObject.render ) {

				object = webglObject.object;
				buffer = webglObject.buffer;

				_renderer.setObjectFaces( object );

				if ( object.customDepthMaterial ) {

					material = object.customDepthMaterial;

				} else if ( object.geometry.morphTargets.length ) {

					material = _depthMaterialMorph;

				} else {

					material = _depthMaterial;

				}

				if ( buffer instanceof THREE.BufferGeometry ) {

					_renderer.renderBufferDirect( camera, scene.__lights, fog, material, buffer, object );

				} else {

					_renderer.renderBuffer( camera, scene.__lights, fog, material, buffer, object );

				}

			}

		}

		// set matrices and render immediate objects

		renderList = scene.__webglObjectsImmediate;

		for ( j = 0, jl = renderList.length; j < jl; j ++ ) {

			webglObject = renderList[ j ];
			object = webglObject.object;

			if ( object.visible && object.castShadow ) {

				/*
				if ( object.matrixAutoUpdate ) {

					object.matrixWorld.flattenToArray( object._objectMatrixArray );

				}
				*/

				object._modelViewMatrix.multiply( camera.matrixWorldInverse, object.matrixWorld);

				_renderer.renderImmediateObject( camera, scene.__lights, fog, _depthMaterial, object );

			}

		}

		// restore GL state

		var clearColor = _renderer.getClearColor(),
		clearAlpha = _renderer.getClearAlpha();

		_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );
		_gl.enable( _gl.BLEND );

	};

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 */

if ( THREE.WebGLRenderer ) {

	THREE.AnaglyphWebGLRenderer = function ( parameters ) {

		THREE.WebGLRenderer.call( this, parameters );

		this.autoUpdateScene = false;

		var _this = this, _setSize = this.setSize, _render = this.render;

		var _cameraL = new THREE.PerspectiveCamera(),
			_cameraR = new THREE.PerspectiveCamera();

		var eyeRight = new THREE.Matrix4(),
			eyeLeft = new THREE.Matrix4(),
			focalLength = 125,
			_aspect, _near, _far, _fov;

		_cameraL.matrixAutoUpdate = _cameraR.matrixAutoUpdate = false;

		var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

		var _renderTargetL = new THREE.WebGLRenderTarget( 512, 512, _params ),
			_renderTargetR = new THREE.WebGLRenderTarget( 512, 512, _params );

		var _camera = new THREE.PerspectiveCamera( 53, 1, 1, 10000 );
		_camera.position.z = 2;

		var _material = new THREE.ShaderMaterial( {

			uniforms: {

				"mapLeft": { type: "t", value: 0, texture: _renderTargetL },
				"mapRight": { type: "t", value: 1, texture: _renderTargetR }

			},

			vertexShader: [

				"varying vec2 vUv;",

				"void main() {",

					"vUv = vec2( uv.x, 1.0 - uv.y );",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragmentShader: [

				"uniform sampler2D mapLeft;",
				"uniform sampler2D mapRight;",
				"varying vec2 vUv;",

				"void main() {",

					"vec4 colorL, colorR;",
					"vec2 uv = vUv;",

					"colorL = texture2D( mapLeft, uv );",
					"colorR = texture2D( mapRight, uv );",

					// http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx

					"gl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;",

				"}"

				].join("\n")

		} );

		var _scene = new THREE.Scene();

		var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), _material );
		mesh.rotation.x = Math.PI / 2;

		_scene.add( mesh );

		_scene.add( _camera );

		this.setSize = function ( width, height ) {

			_setSize.call( _this, width, height );

			_renderTargetL.width = width;
			_renderTargetL.height = height;

			_renderTargetR.width = width;
			_renderTargetR.height = height;

		};

		/*
		 * Renderer now uses an asymmetric perspective projection (http://paulbourke.net/miscellaneous/stereographics/stereorender/).
		 * Each camera is offset by the eye seperation and its projection matrix is also skewed asymetrically back to converge on the same
		 * projection plane. Added a focal length parameter to, this is where the parallax is equal to 0.
		 */

		this.render = function ( scene, camera, renderTarget, forceClear ) {

			scene.updateMatrixWorld();

			var hasCameraChanged = ( _aspect !== camera.aspect ) || ( _near !== camera.near ) || ( _far !== camera.far ) || ( _fov !== camera.fov );

			if( hasCameraChanged ) {

				_aspect = camera.aspect;
				_near = camera.near;
				_far = camera.far;
				_fov = camera.fov;

				var projectionMatrix = camera.projectionMatrix.clone(),
					eyeSep = focalLength / 30 * 0.5,
					eyeSepOnProjection = eyeSep * _near / focalLength,
					ymax = _near * Math.tan( _fov * Math.PI / 360 ),
					xmin, xmax;

				// translate xOffset

				eyeRight.elements[12] = eyeSep;
				eyeLeft.elements[12] = -eyeSep;

				// for left eye

				xmin = -ymax * _aspect + eyeSepOnProjection;
				xmax = ymax * _aspect + eyeSepOnProjection;

				projectionMatrix.elements[0] = 2 * _near / ( xmax - xmin );
				projectionMatrix.elements[8] = ( xmax + xmin ) / ( xmax - xmin );

				_cameraL.projectionMatrix.copy( projectionMatrix );

				// for right eye

				xmin = -ymax * _aspect - eyeSepOnProjection;
				xmax = ymax * _aspect - eyeSepOnProjection;

				projectionMatrix.elements[0] = 2 * _near / ( xmax - xmin );
				projectionMatrix.elements[8] = ( xmax + xmin ) / ( xmax - xmin );

				_cameraR.projectionMatrix.copy( projectionMatrix );

			}

			_cameraL.matrixWorld.copy( camera.matrixWorld ).multiplySelf( eyeLeft );
			_cameraL.position.copy( camera.position );
			_cameraL.near = camera.near;
			_cameraL.far = camera.far;

			_render.call( _this, scene, _cameraL, _renderTargetL, true );

			_cameraR.matrixWorld.copy( camera.matrixWorld ).multiplySelf( eyeRight );
			_cameraR.position.copy( camera.position );
			_cameraR.near = camera.near;
			_cameraR.far = camera.far;

			_render.call( _this, scene, _cameraR, _renderTargetR, true );

			_scene.updateMatrixWorld();
			_render.call( _this, _scene, _camera );

		};

	};

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

if ( THREE.WebGLRenderer ) {

	THREE.CrosseyedWebGLRenderer = function ( parameters ) {

		THREE.WebGLRenderer.call( this, parameters );

		this.autoClear = false;

		var _this = this, _setSize = this.setSize, _render = this.render;

		var _width, _height;

		var _cameraL = new THREE.PerspectiveCamera();
		_cameraL.target = new THREE.Vector3( 0, 0, 0 );

		var _cameraR = new THREE.PerspectiveCamera();
		_cameraR.target = new THREE.Vector3( 0, 0, 0 );

		_this.separation = 10;
		if ( parameters && parameters.separation !== undefined ) _this.separation = parameters.separation;

		var SCREEN_WIDTH  = window.innerWidth;
		var SCREEN_HEIGHT = window.innerHeight;
		var HALF_WIDTH = SCREEN_WIDTH / 2;

		this.setSize = function ( width, height ) {

			_setSize.call( _this, width, height );

			_width = width/2;
			_height = height;

		};

		this.render = function ( scene, camera, renderTarget, forceClear ) {

			this.clear();

			_cameraL.fov = camera.fov;
			_cameraL.aspect = 0.5 * camera.aspect;
			_cameraL.near = camera.near;
			_cameraL.far = camera.far;
			_cameraL.updateProjectionMatrix();

			_cameraL.position.copy( camera.position );
			_cameraL.target.copy( camera.target );
			_cameraL.translateX( _this.separation );
			_cameraL.lookAt( _cameraL.target );

			_cameraR.projectionMatrix = _cameraL.projectionMatrix;

			_cameraR.position.copy( camera.position );
			_cameraR.target.copy( camera.target );
			_cameraR.translateX( - _this.separation );
			_cameraR.lookAt( _cameraR.target );

			this.setViewport( 0, 0, _width, _height );
			_render.call( _this, scene, _cameraL );

			this.setViewport( _width, 0, _width, _height );
			_render.call( _this, scene, _cameraR, false );

		};

	};

}
/**
 * @author mikael emtinger / http://gomo.se/
 *
 */

THREE.ShaderFlares = {

	'lensFlareVertexTexture': {

		vertexShader: [

			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"uniform float rotation;",
			"uniform int renderType;",

			"uniform sampler2D occlusionMap;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",
			"varying float vVisibility;",

			"void main() {",

				"vUV = uv;",

				"vec2 pos = position;",

				"if( renderType == 2 ) {",

					"vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.5, 0.1 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.9, 0.1 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.9, 0.5 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.9, 0.9 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.5, 0.9 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.1, 0.9 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.1, 0.5 ) ) +",
									  "texture2D( occlusionMap, vec2( 0.5, 0.5 ) );",

					"vVisibility = (       visibility.r / 9.0 ) *",
								  "( 1.0 - visibility.g / 9.0 ) *",
								  "(       visibility.b / 9.0 ) *",
								  "( 1.0 - visibility.a / 9.0 );",

					"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
					"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",

				"}",

				"gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"precision mediump float;",

			"uniform sampler2D map;",
			"uniform float opacity;",
			"uniform int renderType;",
			"uniform vec3 color;",

			"varying vec2 vUV;",
			"varying float vVisibility;",

			"void main() {",

				// pink square

				"if( renderType == 0 ) {",

					"gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );",

				// restore

				"} else if( renderType == 1 ) {",

					"gl_FragColor = texture2D( map, vUV );",

				// flare

				"} else {",

					"vec4 texture = texture2D( map, vUV );",
					"texture.a *= opacity * vVisibility;",
					"gl_FragColor = texture;",
					"gl_FragColor.rgb *= color;",

				"}",

			"}"
		].join( "\n" )

	},


	'lensFlare': {

		vertexShader: [

			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"uniform float rotation;",
			"uniform int renderType;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",

			"void main() {",

				"vUV = uv;",

				"vec2 pos = position;",

				"if( renderType == 2 ) {",

					"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
					"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",

				"}",

				"gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"precision mediump float;",

			"uniform sampler2D map;",
			"uniform sampler2D occlusionMap;",
			"uniform float opacity;",
			"uniform int renderType;",
			"uniform vec3 color;",

			"varying vec2 vUV;",

			"void main() {",

				// pink square

				"if( renderType == 0 ) {",

					"gl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );",

				// restore

				"} else if( renderType == 1 ) {",

					"gl_FragColor = texture2D( map, vUV );",

				// flare

				"} else {",

					"float visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a +",
									   "texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a +",
									   "texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a +",
									   "texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;",

					"visibility = ( 1.0 - visibility / 4.0 );",

					"vec4 texture = texture2D( map, vUV );",
					"texture.a *= opacity * visibility;",
					"gl_FragColor = texture;",
					"gl_FragColor.rgb *= color;",

				"}",

			"}"

		].join( "\n" )

	}

};
/**
 * @author mikael emtinger / http://gomo.se/
 *
 */

THREE.ShaderSprite = {

	'sprite': {

		vertexShader: [

			"uniform int useScreenCoordinates;",
			"uniform int affectedByDistance;",
			"uniform vec3 screenPosition;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform float rotation;",
			"uniform vec2 scale;",
			"uniform vec2 alignment;",
			"uniform vec2 uvOffset;",
			"uniform vec2 uvScale;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",

			"void main() {",

				"vUV = uvOffset + uv * uvScale;",

				"vec2 alignedPosition = position + alignment;",

				"vec2 rotatedPosition;",
				"rotatedPosition.x = ( cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y ) * scale.x;",
				"rotatedPosition.y = ( sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y ) * scale.y;",

				"vec4 finalPosition;",

				"if( useScreenCoordinates != 0 ) {",

					"finalPosition = vec4( screenPosition.xy + rotatedPosition, screenPosition.z, 1.0 );",

				"} else {",

					"finalPosition = projectionMatrix * modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );",
					"finalPosition.xy += rotatedPosition * ( affectedByDistance == 1 ? 1.0 : finalPosition.z );",

				"}",

				"gl_Position = finalPosition;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"precision mediump float;",

			"uniform vec3 color;",
			"uniform sampler2D map;",
			"uniform float opacity;",

			"varying vec2 vUV;",

			"void main() {",

				"vec4 texture = texture2D( map, vUV );",
				"gl_FragColor = vec4( color * texture.xyz, texture.a * opacity );",

			"}"

		].join( "\n" )

	}

};
=======
// ThreeExtras.js - http://github.com/mrdoob/three.js
'use strict';THREE.ColorUtils={adjustHSV:function(b,a,c,d){var e=THREE.ColorUtils.__hsv;THREE.ColorUtils.rgbToHsv(b,e);e.h=THREE.Math.clamp(e.h+a,0,1);e.s=THREE.Math.clamp(e.s+c,0,1);e.v=THREE.Math.clamp(e.v+d,0,1);b.setHSV(e.h,e.s,e.v)},rgbToHsv:function(b,a){var c=b.r,d=b.g,e=b.b,f=Math.max(Math.max(c,d),e),g=Math.min(Math.min(c,d),e);if(g===f)g=c=0;else{var h=f-g,g=h/f,c=(c===f?(d-e)/h:d===f?2+(e-c)/h:4+(c-d)/h)/6;0>c&&(c+=1);1<c&&(c-=1)}void 0===a&&(a={h:0,s:0,v:0});a.h=c;a.s=g;a.v=f;return a}};
THREE.ColorUtils.__hsv={h:0,s:0,v:0};
THREE.GeometryUtils={merge:function(b,a){for(var c,d,e=b.vertices.length,f=a instanceof THREE.Mesh?a.geometry:a,g=b.vertices,h=f.vertices,i=b.faces,j=f.faces,l=b.faceVertexUvs[0],n=f.faceVertexUvs[0],k={},m=0;m<b.materials.length;m++)k[b.materials[m].id]=m;a instanceof THREE.Mesh&&(a.matrixAutoUpdate&&a.updateMatrix(),c=a.matrix,d=new THREE.Matrix4,d.extractRotation(c,a.scale));for(var m=0,p=h.length;m<p;m++){var q=h[m].clone();c&&c.multiplyVector3(q);g.push(q)}m=0;for(p=j.length;m<p;m++){var g=j[m],
r,u,s=g.vertexNormals,t=g.vertexColors;g instanceof THREE.Face3?r=new THREE.Face3(g.a+e,g.b+e,g.c+e):g instanceof THREE.Face4&&(r=new THREE.Face4(g.a+e,g.b+e,g.c+e,g.d+e));r.normal.copy(g.normal);d&&d.multiplyVector3(r.normal);h=0;for(q=s.length;h<q;h++)u=s[h].clone(),d&&d.multiplyVector3(u),r.vertexNormals.push(u);r.color.copy(g.color);h=0;for(q=t.length;h<q;h++)u=t[h],r.vertexColors.push(u.clone());void 0!==g.materialIndex&&(h=f.materials[g.materialIndex],q=h.id,t=k[q],void 0===t&&(t=b.materials.length,
k[q]=t,b.materials.push(h)),r.materialIndex=t);r.centroid.copy(g.centroid);c&&c.multiplyVector3(r.centroid);i.push(r)}m=0;for(p=n.length;m<p;m++){c=n[m];d=[];h=0;for(q=c.length;h<q;h++)d.push(new THREE.UV(c[h].u,c[h].v));l.push(d)}},clone:function(b){var a=new THREE.Geometry,c,d=b.vertices,e=b.faces,f=b.faceVertexUvs[0];b.materials&&(a.materials=b.materials.slice());b=0;for(c=d.length;b<c;b++)a.vertices.push(d[b].clone());b=0;for(c=e.length;b<c;b++)a.faces.push(e[b].clone());b=0;for(c=f.length;b<
c;b++){for(var d=f[b],e=[],g=0,h=d.length;g<h;g++)e.push(new THREE.UV(d[g].u,d[g].v));a.faceVertexUvs[0].push(e)}return a},randomPointInTriangle:function(b,a,c){var d,e,f,g=new THREE.Vector3,h=THREE.GeometryUtils.__v1;d=THREE.GeometryUtils.random();e=THREE.GeometryUtils.random();1<d+e&&(d=1-d,e=1-e);f=1-d-e;g.copy(b);g.multiplyScalar(d);h.copy(a);h.multiplyScalar(e);g.addSelf(h);h.copy(c);h.multiplyScalar(f);g.addSelf(h);return g},randomPointInFace:function(b,a,c){var d,e,f;if(b instanceof THREE.Face3)return d=
a.vertices[b.a],e=a.vertices[b.b],f=a.vertices[b.c],THREE.GeometryUtils.randomPointInTriangle(d,e,f);if(b instanceof THREE.Face4){d=a.vertices[b.a];e=a.vertices[b.b];f=a.vertices[b.c];var a=a.vertices[b.d],g;c?b._area1&&b._area2?(c=b._area1,g=b._area2):(c=THREE.GeometryUtils.triangleArea(d,e,a),g=THREE.GeometryUtils.triangleArea(e,f,a),b._area1=c,b._area2=g):(c=THREE.GeometryUtils.triangleArea(d,e,a),g=THREE.GeometryUtils.triangleArea(e,f,a));return THREE.GeometryUtils.random()*(c+g)<c?THREE.GeometryUtils.randomPointInTriangle(d,
e,a):THREE.GeometryUtils.randomPointInTriangle(e,f,a)}},randomPointsInGeometry:function(b,a){function c(a){function b(c,d){if(d<c)return c;var e=c+Math.floor((d-c)/2);return j[e]>a?b(c,e-1):j[e]<a?b(e+1,d):e}return b(0,j.length-1)}var d,e,f=b.faces,g=b.vertices,h=f.length,i=0,j=[],l,n,k,m;for(e=0;e<h;e++)d=f[e],d instanceof THREE.Face3?(l=g[d.a],n=g[d.b],k=g[d.c],d._area=THREE.GeometryUtils.triangleArea(l,n,k)):d instanceof THREE.Face4&&(l=g[d.a],n=g[d.b],k=g[d.c],m=g[d.d],d._area1=THREE.GeometryUtils.triangleArea(l,
n,m),d._area2=THREE.GeometryUtils.triangleArea(n,k,m),d._area=d._area1+d._area2),i+=d._area,j[e]=i;d=[];for(e=0;e<a;e++)g=THREE.GeometryUtils.random()*i,g=c(g),d[e]=THREE.GeometryUtils.randomPointInFace(f[g],b,!0);return d},triangleArea:function(b,a,c){var d,e=THREE.GeometryUtils.__v1;e.sub(b,a);d=e.length();e.sub(b,c);b=e.length();e.sub(a,c);c=e.length();a=0.5*(d+b+c);return Math.sqrt(a*(a-d)*(a-b)*(a-c))},center:function(b){b.computeBoundingBox();var a=b.boundingBox,c=new THREE.Vector3;c.add(a.min,
a.max);c.multiplyScalar(-0.5);b.applyMatrix((new THREE.Matrix4).makeTranslation(c.x,c.y,c.z));b.computeBoundingBox();return c},normalizeUVs:function(b){for(var b=b.faceVertexUvs[0],a=0,c=b.length;a<c;a++)for(var d=b[a],e=0,f=d.length;e<f;e++)if(1!==d[e].u&&(d[e].u-=Math.floor(d[e].u)),1!==d[e].v)d[e].v-=Math.floor(d[e].v)},triangulateQuads:function(b){var a,c,d,e,f=[],g=[],h=[];a=0;for(c=b.faceUvs.length;a<c;a++)g[a]=[];a=0;for(c=b.faceVertexUvs.length;a<c;a++)h[a]=[];a=0;for(c=b.faces.length;a<c;a++)if(d=
b.faces[a],d instanceof THREE.Face4){e=d.a;var i=d.b,j=d.c,l=d.d,n=new THREE.Face3,k=new THREE.Face3;n.color.copy(d.color);k.color.copy(d.color);n.materialIndex=d.materialIndex;k.materialIndex=d.materialIndex;n.a=e;n.b=i;n.c=l;k.a=i;k.b=j;k.c=l;4===d.vertexColors.length&&(n.vertexColors[0]=d.vertexColors[0].clone(),n.vertexColors[1]=d.vertexColors[1].clone(),n.vertexColors[2]=d.vertexColors[3].clone(),k.vertexColors[0]=d.vertexColors[1].clone(),k.vertexColors[1]=d.vertexColors[2].clone(),k.vertexColors[2]=
d.vertexColors[3].clone());f.push(n,k);d=0;for(e=b.faceVertexUvs.length;d<e;d++)b.faceVertexUvs[d].length&&(n=b.faceVertexUvs[d][a],i=n[1],j=n[2],l=n[3],n=[n[0].clone(),i.clone(),l.clone()],i=[i.clone(),j.clone(),l.clone()],h[d].push(n,i));d=0;for(e=b.faceUvs.length;d<e;d++)b.faceUvs[d].length&&(i=b.faceUvs[d][a],g[d].push(i,i))}else{f.push(d);d=0;for(e=b.faceUvs.length;d<e;d++)g[d].push(b.faceUvs[d]);d=0;for(e=b.faceVertexUvs.length;d<e;d++)h[d].push(b.faceVertexUvs[d])}b.faces=f;b.faceUvs=g;b.faceVertexUvs=
h;b.computeCentroids();b.computeFaceNormals();b.computeVertexNormals();b.hasTangents&&b.computeTangents()},explode:function(b){for(var a=[],c=0,d=b.faces.length;c<d;c++){var e=a.length,f=b.faces[c];if(f instanceof THREE.Face4){var g=f.a,h=f.b,i=f.c,g=b.vertices[g],h=b.vertices[h],i=b.vertices[i],j=b.vertices[f.d];a.push(g.clone());a.push(h.clone());a.push(i.clone());a.push(j.clone());f.a=e;f.b=e+1;f.c=e+2;f.d=e+3}else g=f.a,h=f.b,i=f.c,g=b.vertices[g],h=b.vertices[h],i=b.vertices[i],a.push(g.clone()),
a.push(h.clone()),a.push(i.clone()),f.a=e,f.b=e+1,f.c=e+2}b.vertices=a;delete b.__tmpVertices},tessellate:function(b,a){var c,d,e,f,g,h,i,j,l,n,k,m,p,q,r,u,s,t,o,x=[],z=[];c=0;for(d=b.faceVertexUvs.length;c<d;c++)z[c]=[];c=0;for(d=b.faces.length;c<d;c++)if(e=b.faces[c],e instanceof THREE.Face3)if(f=e.a,g=e.b,h=e.c,j=b.vertices[f],l=b.vertices[g],n=b.vertices[h],m=j.distanceTo(l),p=l.distanceTo(n),k=j.distanceTo(n),m>a||p>a||k>a){i=b.vertices.length;t=e.clone();o=e.clone();m>=p&&m>=k?(j=j.clone(),
j.lerpSelf(l,0.5),t.a=f,t.b=i,t.c=h,o.a=i,o.b=g,o.c=h,3===e.vertexNormals.length&&(f=e.vertexNormals[0].clone(),f.lerpSelf(e.vertexNormals[1],0.5),t.vertexNormals[1].copy(f),o.vertexNormals[0].copy(f)),3===e.vertexColors.length&&(f=e.vertexColors[0].clone(),f.lerpSelf(e.vertexColors[1],0.5),t.vertexColors[1].copy(f),o.vertexColors[0].copy(f)),e=0):p>=m&&p>=k?(j=l.clone(),j.lerpSelf(n,0.5),t.a=f,t.b=g,t.c=i,o.a=i,o.b=h,o.c=f,3===e.vertexNormals.length&&(f=e.vertexNormals[1].clone(),f.lerpSelf(e.vertexNormals[2],
0.5),t.vertexNormals[2].copy(f),o.vertexNormals[0].copy(f),o.vertexNormals[1].copy(e.vertexNormals[2]),o.vertexNormals[2].copy(e.vertexNormals[0])),3===e.vertexColors.length&&(f=e.vertexColors[1].clone(),f.lerpSelf(e.vertexColors[2],0.5),t.vertexColors[2].copy(f),o.vertexColors[0].copy(f),o.vertexColors[1].copy(e.vertexColors[2]),o.vertexColors[2].copy(e.vertexColors[0])),e=1):(j=j.clone(),j.lerpSelf(n,0.5),t.a=f,t.b=g,t.c=i,o.a=i,o.b=g,o.c=h,3===e.vertexNormals.length&&(f=e.vertexNormals[0].clone(),
f.lerpSelf(e.vertexNormals[2],0.5),t.vertexNormals[2].copy(f),o.vertexNormals[0].copy(f)),3===e.vertexColors.length&&(f=e.vertexColors[0].clone(),f.lerpSelf(e.vertexColors[2],0.5),t.vertexColors[2].copy(f),o.vertexColors[0].copy(f)),e=2);x.push(t,o);b.vertices.push(j);f=0;for(g=b.faceVertexUvs.length;f<g;f++)b.faceVertexUvs[f].length&&(j=b.faceVertexUvs[f][c],o=j[0],h=j[1],t=j[2],0===e?(l=o.clone(),l.lerpSelf(h,0.5),j=[o.clone(),l.clone(),t.clone()],h=[l.clone(),h.clone(),t.clone()]):1===e?(l=h.clone(),
l.lerpSelf(t,0.5),j=[o.clone(),h.clone(),l.clone()],h=[l.clone(),t.clone(),o.clone()]):(l=o.clone(),l.lerpSelf(t,0.5),j=[o.clone(),h.clone(),l.clone()],h=[l.clone(),h.clone(),t.clone()]),z[f].push(j,h))}else{x.push(e);f=0;for(g=b.faceVertexUvs.length;f<g;f++)z[f].push(b.faceVertexUvs[f][c])}else if(f=e.a,g=e.b,h=e.c,i=e.d,j=b.vertices[f],l=b.vertices[g],n=b.vertices[h],k=b.vertices[i],m=j.distanceTo(l),p=l.distanceTo(n),q=n.distanceTo(k),r=j.distanceTo(k),m>a||p>a||q>a||r>a){u=b.vertices.length;s=
b.vertices.length+1;t=e.clone();o=e.clone();m>=p&&m>=q&&m>=r||q>=p&&q>=m&&q>=r?(m=j.clone(),m.lerpSelf(l,0.5),l=n.clone(),l.lerpSelf(k,0.5),t.a=f,t.b=u,t.c=s,t.d=i,o.a=u,o.b=g,o.c=h,o.d=s,4===e.vertexNormals.length&&(f=e.vertexNormals[0].clone(),f.lerpSelf(e.vertexNormals[1],0.5),g=e.vertexNormals[2].clone(),g.lerpSelf(e.vertexNormals[3],0.5),t.vertexNormals[1].copy(f),t.vertexNormals[2].copy(g),o.vertexNormals[0].copy(f),o.vertexNormals[3].copy(g)),4===e.vertexColors.length&&(f=e.vertexColors[0].clone(),
f.lerpSelf(e.vertexColors[1],0.5),g=e.vertexColors[2].clone(),g.lerpSelf(e.vertexColors[3],0.5),t.vertexColors[1].copy(f),t.vertexColors[2].copy(g),o.vertexColors[0].copy(f),o.vertexColors[3].copy(g)),e=0):(m=l.clone(),m.lerpSelf(n,0.5),l=k.clone(),l.lerpSelf(j,0.5),t.a=f,t.b=g,t.c=u,t.d=s,o.a=s,o.b=u,o.c=h,o.d=i,4===e.vertexNormals.length&&(f=e.vertexNormals[1].clone(),f.lerpSelf(e.vertexNormals[2],0.5),g=e.vertexNormals[3].clone(),g.lerpSelf(e.vertexNormals[0],0.5),t.vertexNormals[2].copy(f),t.vertexNormals[3].copy(g),
o.vertexNormals[0].copy(g),o.vertexNormals[1].copy(f)),4===e.vertexColors.length&&(f=e.vertexColors[1].clone(),f.lerpSelf(e.vertexColors[2],0.5),g=e.vertexColors[3].clone(),g.lerpSelf(e.vertexColors[0],0.5),t.vertexColors[2].copy(f),t.vertexColors[3].copy(g),o.vertexColors[0].copy(g),o.vertexColors[1].copy(f)),e=1);x.push(t,o);b.vertices.push(m,l);f=0;for(g=b.faceVertexUvs.length;f<g;f++)b.faceVertexUvs[f].length&&(j=b.faceVertexUvs[f][c],o=j[0],h=j[1],t=j[2],j=j[3],0===e?(l=o.clone(),l.lerpSelf(h,
0.5),n=t.clone(),n.lerpSelf(j,0.5),o=[o.clone(),l.clone(),n.clone(),j.clone()],h=[l.clone(),h.clone(),t.clone(),n.clone()]):(l=h.clone(),l.lerpSelf(t,0.5),n=j.clone(),n.lerpSelf(o,0.5),o=[o.clone(),h.clone(),l.clone(),n.clone()],h=[n.clone(),l.clone(),t.clone(),j.clone()]),z[f].push(o,h))}else{x.push(e);f=0;for(g=b.faceVertexUvs.length;f<g;f++)z[f].push(b.faceVertexUvs[f][c])}b.faces=x;b.faceVertexUvs=z}};THREE.GeometryUtils.random=THREE.Math.random16;THREE.GeometryUtils.__v1=new THREE.Vector3;
THREE.ImageUtils={crossOrigin:"anonymous",loadTexture:function(b,a,c){var d=new Image,e=new THREE.Texture(d,a);d.onload=function(){e.needsUpdate=!0;c&&c(this)};d.crossOrigin=this.crossOrigin;d.src=b;return e},loadTextureCube:function(b,a,c){var d,e=[],f=new THREE.Texture(e,a),a=e.loadCount=0;for(d=b.length;a<d;++a)e[a]=new Image,e[a].onload=function(){e.loadCount+=1;6===e.loadCount&&(f.needsUpdate=!0);c&&c(this)},e[a].crossOrigin=this.crossOrigin,e[a].src=b[a];return f},getNormalMap:function(b,a){var c=
function(a){var b=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);return[a[0]/b,a[1]/b,a[2]/b]},a=a|1,d=b.width,e=b.height,f=document.createElement("canvas");f.width=d;f.height=e;var g=f.getContext("2d");g.drawImage(b,0,0);for(var h=g.getImageData(0,0,d,e).data,i=g.createImageData(d,e),j=i.data,l=0;l<d;l++)for(var n=1;n<e;n++){var k=0>n-1?e-1:n-1,m=(n+1)%e,p=0>l-1?d-1:l-1,q=(l+1)%d,r=[],u=[0,0,h[4*(n*d+l)]/255*a];r.push([-1,0,h[4*(n*d+p)]/255*a]);r.push([-1,-1,h[4*(k*d+p)]/255*a]);r.push([0,-1,h[4*(k*d+
l)]/255*a]);r.push([1,-1,h[4*(k*d+q)]/255*a]);r.push([1,0,h[4*(n*d+q)]/255*a]);r.push([1,1,h[4*(m*d+q)]/255*a]);r.push([0,1,h[4*(m*d+l)]/255*a]);r.push([-1,1,h[4*(m*d+p)]/255*a]);k=[];p=r.length;for(m=0;m<p;m++){var q=r[m],s=r[(m+1)%p],q=[q[0]-u[0],q[1]-u[1],q[2]-u[2]],s=[s[0]-u[0],s[1]-u[1],s[2]-u[2]];k.push(c([q[1]*s[2]-q[2]*s[1],q[2]*s[0]-q[0]*s[2],q[0]*s[1]-q[1]*s[0]]))}r=[0,0,0];for(m=0;m<k.length;m++)r[0]+=k[m][0],r[1]+=k[m][1],r[2]+=k[m][2];r[0]/=k.length;r[1]/=k.length;r[2]/=k.length;u=4*
(n*d+l);j[u]=255*((r[0]+1)/2)|0;j[u+1]=255*(r[1]+0.5)|0;j[u+2]=255*r[2]|0;j[u+3]=255}g.putImageData(i,0,0);return f},generateDataTexture:function(b,a,c){for(var d=b*a,e=new Uint8Array(3*d),f=Math.floor(255*c.r),g=Math.floor(255*c.g),c=Math.floor(255*c.b),h=0;h<d;h++)e[3*h]=f,e[3*h+1]=g,e[3*h+2]=c;b=new THREE.DataTexture(e,b,a,THREE.RGBFormat);b.needsUpdate=!0;return b}};
THREE.SceneUtils={showHierarchy:function(b,a){THREE.SceneUtils.traverseHierarchy(b,function(b){b.visible=a})},traverseHierarchy:function(b,a){var c,d,e=b.children.length;for(d=0;d<e;d++)c=b.children[d],a(c),THREE.SceneUtils.traverseHierarchy(c,a)},createMultiMaterialObject:function(b,a){var c,d=a.length,e=new THREE.Object3D;for(c=0;c<d;c++){var f=new THREE.Mesh(b,a[c]);e.add(f)}return e},cloneObject:function(b){var a;b instanceof THREE.MorphAnimMesh?(a=new THREE.MorphAnimMesh(b.geometry,b.material),
a.duration=b.duration,a.mirroredLoop=b.mirroredLoop,a.time=b.time,a.lastKeyframe=b.lastKeyframe,a.currentKeyframe=b.currentKeyframe,a.direction=b.direction,a.directionBackwards=b.directionBackwards):b instanceof THREE.SkinnedMesh?a=new THREE.SkinnedMesh(b.geometry,b.material):b instanceof THREE.Mesh?a=new THREE.Mesh(b.geometry,b.material):b instanceof THREE.Line?a=new THREE.Line(b.geometry,b.material,b.type):b instanceof THREE.Ribbon?a=new THREE.Ribbon(b.geometry,b.material):b instanceof THREE.ParticleSystem?
(a=new THREE.ParticleSystem(b.geometry,b.material),a.sortParticles=b.sortParticles):b instanceof THREE.Particle?a=new THREE.Particle(b.material):b instanceof THREE.Sprite?(a=new THREE.Sprite({}),a.color.copy(b.color),a.map=b.map,a.blending=b.blending,a.useScreenCoordinates=b.useScreenCoordinates,a.mergeWith3D=b.mergeWith3D,a.affectedByDistance=b.affectedByDistance,a.scaleByViewport=b.scaleByViewport,a.alignment=b.alignment,a.rotation3d.copy(b.rotation3d),a.rotation=b.rotation,a.opacity=b.opacity,
a.uvOffset.copy(b.uvOffset),a.uvScale.copy(b.uvScale)):b instanceof THREE.LOD?a=new THREE.LOD:b instanceof THREE.MarchingCubes?(a=new THREE.MarchingCubes(b.resolution,b.material),a.field.set(b.field),a.isolation=b.isolation):b instanceof THREE.Object3D&&(a=new THREE.Object3D);a.name=b.name;a.parent=b.parent;a.up.copy(b.up);a.position.copy(b.position);a.rotation instanceof THREE.Vector3&&a.rotation.copy(b.rotation);a.eulerOrder=b.eulerOrder;a.scale.copy(b.scale);a.dynamic=b.dynamic;a.doubleSided=b.doubleSided;
a.flipSided=b.flipSided;a.renderDepth=b.renderDepth;a.rotationAutoUpdate=b.rotationAutoUpdate;a.matrix.copy(b.matrix);a.matrixWorld.copy(b.matrixWorld);a.matrixRotationWorld.copy(b.matrixRotationWorld);a.matrixAutoUpdate=b.matrixAutoUpdate;a.matrixWorldNeedsUpdate=b.matrixWorldNeedsUpdate;a.quaternion.copy(b.quaternion);a.useQuaternion=b.useQuaternion;a.boundRadius=b.boundRadius;a.boundRadiusScale=b.boundRadiusScale;a.visible=b.visible;a.castShadow=b.castShadow;a.receiveShadow=b.receiveShadow;a.frustumCulled=
b.frustumCulled;for(var c=0;c<b.children.length;c++){var d=THREE.SceneUtils.cloneObject(b.children[c]);a.children[c]=d;d.parent=a}if(b instanceof THREE.LOD)for(c=0;c<b.LODs.length;c++)a.LODs[c]={visibleAtDistance:b.LODs[c].visibleAtDistance,object3D:a.children[c]};return a},detach:function(b,a,c){b.applyMatrix(a.matrixWorld);a.remove(b);c.add(b)},attach:function(b,a,c){var d=new THREE.Matrix4;d.getInverse(c.matrixWorld);b.applyMatrix(d);a.remove(b);c.add(b)}};
THREE.WebGLRenderer&&(THREE.ShaderUtils={lib:{fresnel:{uniforms:{mRefractionRatio:{type:"f",value:1.02},mFresnelBias:{type:"f",value:0.1},mFresnelPower:{type:"f",value:2},mFresnelScale:{type:"f",value:1},tCube:{type:"t",value:1,texture:null}},fragmentShader:"uniform samplerCube tCube;\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\nvoid main() {\nvec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );\nvec4 refractedColor = vec4( 1.0, 1.0, 1.0, 1.0 );\nrefractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;\nrefractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;\nrefractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;\nrefractedColor.a = 1.0;\ngl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );\n}",
vertexShader:"uniform float mRefractionRatio;\nuniform float mFresnelBias;\nuniform float mFresnelScale;\nuniform float mFresnelPower;\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\nvoid main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvec4 mPosition = objectMatrix * vec4( position, 1.0 );\nvec3 nWorld = normalize ( mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal );\nvec3 I = mPosition.xyz - cameraPosition;\nvReflect = reflect( I, nWorld );\nvRefract[0] = refract( normalize( I ), nWorld, mRefractionRatio );\nvRefract[1] = refract( normalize( I ), nWorld, mRefractionRatio * 0.99 );\nvRefract[2] = refract( normalize( I ), nWorld, mRefractionRatio * 0.98 );\nvReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), nWorld ), mFresnelPower );\ngl_Position = projectionMatrix * mvPosition;\n}"},
normal:{uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,THREE.UniformsLib.lights,THREE.UniformsLib.shadowmap,{enableAO:{type:"i",value:0},enableDiffuse:{type:"i",value:0},enableSpecular:{type:"i",value:0},enableReflection:{type:"i",value:0},tDiffuse:{type:"t",value:0,texture:null},tCube:{type:"t",value:1,texture:null},tNormal:{type:"t",value:2,texture:null},tSpecular:{type:"t",value:3,texture:null},tAO:{type:"t",value:4,texture:null},tDisplacement:{type:"t",value:5,texture:null},uNormalScale:{type:"f",
value:1},uDisplacementBias:{type:"f",value:0},uDisplacementScale:{type:"f",value:1},uDiffuseColor:{type:"c",value:new THREE.Color(16777215)},uSpecularColor:{type:"c",value:new THREE.Color(1118481)},uAmbientColor:{type:"c",value:new THREE.Color(16777215)},uShininess:{type:"f",value:30},uOpacity:{type:"f",value:1},uReflectivity:{type:"f",value:0.5},uOffset:{type:"v2",value:new THREE.Vector2(0,0)},uRepeat:{type:"v2",value:new THREE.Vector2(1,1)},wrapRGB:{type:"v3",value:new THREE.Vector3(1,1,1)}}]),
fragmentShader:["uniform vec3 uAmbientColor;\nuniform vec3 uDiffuseColor;\nuniform vec3 uSpecularColor;\nuniform float uShininess;\nuniform float uOpacity;\nuniform bool enableDiffuse;\nuniform bool enableSpecular;\nuniform bool enableAO;\nuniform bool enableReflection;\nuniform sampler2D tDiffuse;\nuniform sampler2D tNormal;\nuniform sampler2D tSpecular;\nuniform sampler2D tAO;\nuniform samplerCube tCube;\nuniform float uNormalScale;\nuniform float uReflectivity;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nuniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif\nvarying vec3 vViewPosition;",
THREE.ShaderChunk.shadowmap_pars_fragment,THREE.ShaderChunk.fog_pars_fragment,"void main() {\ngl_FragColor = vec4( vec3( 1.0 ), uOpacity );\nvec3 specularTex = vec3( 1.0 );\nvec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;\nnormalTex.xy *= uNormalScale;\nnormalTex = normalize( normalTex );\nif( enableDiffuse ) {\n#ifdef GAMMA_INPUT\nvec4 texelColor = texture2D( tDiffuse, vUv );\ntexelColor.xyz *= texelColor.xyz;\ngl_FragColor = gl_FragColor * texelColor;\n#else\ngl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );\n#endif\n}\nif( enableAO ) {\n#ifdef GAMMA_INPUT\nvec4 aoColor = texture2D( tAO, vUv );\naoColor.xyz *= aoColor.xyz;\ngl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;\n#else\ngl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;\n#endif\n}\nif( enableSpecular )\nspecularTex = texture2D( tSpecular, vUv ).xyz;\nmat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );\nvec3 finalNormal = tsb * normalTex;\nvec3 normal = normalize( finalNormal );\nvec3 viewPosition = normalize( vViewPosition );\n#if MAX_POINT_LIGHTS > 0\nvec3 pointDiffuse = vec3( 0.0 );\nvec3 pointSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec3 pointVector = normalize( vPointLight[ i ].xyz );\nfloat pointDistance = vPointLight[ i ].w;\n#ifdef WRAP_AROUND\nfloat pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );\nfloat pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );\nvec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n#else\nfloat pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );\n#endif\npointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;\nvec3 pointHalfVector = normalize( pointVector + viewPosition );\nfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\nfloat pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( uShininess + 2.0001 ) / 8.0;\nvec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );\npointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;\n#else\npointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;\n#endif\n}\n#endif\n#if MAX_DIR_LIGHTS > 0\nvec3 dirDiffuse = vec3( 0.0 );\nvec3 dirSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\n#ifdef WRAP_AROUND\nfloat directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );\nfloat directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );\nvec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );\n#else\nfloat dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );\n#endif\ndirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;\nvec3 dirHalfVector = normalize( dirVector + viewPosition );\nfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\nfloat dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nfloat specularNormalization = ( uShininess + 2.0001 ) / 8.0;\nvec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );\ndirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;\n#else\ndirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;\n#endif\n}\n#endif\nvec3 totalDiffuse = vec3( 0.0 );\nvec3 totalSpecular = vec3( 0.0 );\n#if MAX_DIR_LIGHTS > 0\ntotalDiffuse += dirDiffuse;\ntotalSpecular += dirSpecular;\n#endif\n#if MAX_POINT_LIGHTS > 0\ntotalDiffuse += pointDiffuse;\ntotalSpecular += pointSpecular;\n#endif\ngl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;\nif ( enableReflection ) {\nvec3 wPos = cameraPosition - vViewPosition;\nvec3 vReflect = reflect( normalize( wPos ), normal );\nvec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );\n#ifdef GAMMA_INPUT\ncubeColor.xyz *= cubeColor.xyz;\n#endif\ngl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );\n}",
THREE.ShaderChunk.shadowmap_fragment,THREE.ShaderChunk.linear_to_gamma_fragment,THREE.ShaderChunk.fog_fragment,"}"].join("\n"),vertexShader:["attribute vec4 tangent;\nuniform vec2 uOffset;\nuniform vec2 uRepeat;\n#ifdef VERTEX_TEXTURES\nuniform sampler2D tDisplacement;\nuniform float uDisplacementScale;\nuniform float uDisplacementBias;\n#endif\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\nvarying vec3 vViewPosition;",
THREE.ShaderChunk.shadowmap_pars_vertex,"void main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvViewPosition = -mvPosition.xyz;\nvNormal = normalMatrix * normal;\nvTangent = normalMatrix * tangent.xyz;\nvBinormal = cross( vNormal, vTangent ) * tangent.w;\nvUv = uv * uRepeat + uOffset;\n#if MAX_POINT_LIGHTS > 0\nfor( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\nvPointLight[ i ] = vec4( lVector, lDistance );\n}\n#endif\n#ifdef VERTEX_TEXTURES\nvec3 dv = texture2D( tDisplacement, uv ).xyz;\nfloat df = uDisplacementScale * dv.x + uDisplacementBias;\nvec4 displacedPosition = vec4( normalize( vNormal.xyz ) * df, 0.0 ) + mvPosition;\ngl_Position = projectionMatrix * displacedPosition;\n#else\ngl_Position = projectionMatrix * mvPosition;\n#endif",
THREE.ShaderChunk.shadowmap_vertex,"}"].join("\n")},cube:{uniforms:{tCube:{type:"t",value:1,texture:null},tFlip:{type:"f",value:-1}},vertexShader:"varying vec3 vViewPosition;\nvoid main() {\nvec4 mPosition = objectMatrix * vec4( position, 1.0 );\nvViewPosition = cameraPosition - mPosition.xyz;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",fragmentShader:"uniform samplerCube tCube;\nuniform float tFlip;\nvarying vec3 vViewPosition;\nvoid main() {\nvec3 wPos = cameraPosition - vViewPosition;\ngl_FragColor = textureCube( tCube, vec3( tFlip * wPos.x, wPos.yz ) );\n}"}}});
THREE.BufferGeometry=function(){this.id=THREE.GeometryCount++;this.vertexColorArray=this.vertexUvArray=this.vertexNormalArray=this.vertexPositionArray=this.vertexIndexArray=this.vertexColorBuffer=this.vertexUvBuffer=this.vertexNormalBuffer=this.vertexPositionBuffer=this.vertexIndexBuffer=null;this.dynamic=false;this.boundingSphere=this.boundingBox=null;this.morphTargets=[]};THREE.BufferGeometry.prototype={constructor:THREE.BufferGeometry,computeBoundingBox:function(){},computeBoundingSphere:function(){}};
THREE.Curve=function(){};THREE.Curve.prototype.getPoint=function(){console.log("Warning, getPoint() not implemented!");return null};THREE.Curve.prototype.getPointAt=function(b){return this.getPoint(this.getUtoTmapping(b))};THREE.Curve.prototype.getPoints=function(b){b||(b=5);var a,c=[];for(a=0;a<=b;a++)c.push(this.getPoint(a/b));return c};THREE.Curve.prototype.getSpacedPoints=function(b){b||(b=5);var a,c=[];for(a=0;a<=b;a++)c.push(this.getPointAt(a/b));return c};
THREE.Curve.prototype.getLength=function(){var b=this.getLengths();return b[b.length-1]};THREE.Curve.prototype.getLengths=function(b){b||(b=this.__arcLengthDivisions?this.__arcLengthDivisions:200);if(this.cacheArcLengths&&this.cacheArcLengths.length==b+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=false;var a=[],c,d=this.getPoint(0),e,f=0;a.push(0);for(e=1;e<=b;e++){c=this.getPoint(e/b);f=f+c.distanceTo(d);a.push(f);d=c}return this.cacheArcLengths=a};
THREE.Curve.prototype.updateArcLengths=function(){this.needsUpdate=true;this.getLengths()};THREE.Curve.prototype.getUtoTmapping=function(b,a){var c=this.getLengths(),d=0,e=c.length,f;f=a?a:b*c[e-1];for(var g=0,h=e-1,i;g<=h;){d=Math.floor(g+(h-g)/2);i=c[d]-f;if(i<0)g=d+1;else if(i>0)h=d-1;else{h=d;break}}d=h;if(c[d]==f)return d/(e-1);g=c[d];return c=(d+(f-g)/(c[d+1]-g))/(e-1)};THREE.Curve.prototype.getNormalVector=function(b){b=this.getTangent(b);return new THREE.Vector2(-b.y,b.x)};
THREE.Curve.prototype.getTangent=function(b){var a=b-1.0E-4,b=b+1.0E-4;a<0&&(a=0);b>1&&(b=1);a=this.getPoint(a);return this.getPoint(b).clone().subSelf(a).normalize()};THREE.Curve.prototype.getTangentAt=function(b){return this.getTangent(this.getUtoTmapping(b))};THREE.LineCurve=function(b,a){this.v1=b;this.v2=a};THREE.LineCurve.prototype=new THREE.Curve;THREE.LineCurve.prototype.constructor=THREE.LineCurve;
THREE.LineCurve.prototype.getPoint=function(b){var a=this.v2.clone().subSelf(this.v1);a.multiplyScalar(b).addSelf(this.v1);return a};THREE.LineCurve.prototype.getPointAt=function(b){return this.getPoint(b)};THREE.LineCurve.prototype.getTangent=function(){return this.v2.clone().subSelf(this.v1).normalize()};THREE.QuadraticBezierCurve=function(b,a,c){this.v0=b;this.v1=a;this.v2=c};THREE.QuadraticBezierCurve.prototype=new THREE.Curve;THREE.QuadraticBezierCurve.prototype.constructor=THREE.QuadraticBezierCurve;
THREE.QuadraticBezierCurve.prototype.getPoint=function(b){var a;a=THREE.Shape.Utils.b2(b,this.v0.x,this.v1.x,this.v2.x);b=THREE.Shape.Utils.b2(b,this.v0.y,this.v1.y,this.v2.y);return new THREE.Vector2(a,b)};THREE.QuadraticBezierCurve.prototype.getTangent=function(b){var a;a=THREE.Curve.Utils.tangentQuadraticBezier(b,this.v0.x,this.v1.x,this.v2.x);b=THREE.Curve.Utils.tangentQuadraticBezier(b,this.v0.y,this.v1.y,this.v2.y);a=new THREE.Vector2(a,b);a.normalize();return a};
THREE.CubicBezierCurve=function(b,a,c,d){this.v0=b;this.v1=a;this.v2=c;this.v3=d};THREE.CubicBezierCurve.prototype=new THREE.Curve;THREE.CubicBezierCurve.prototype.constructor=THREE.CubicBezierCurve;THREE.CubicBezierCurve.prototype.getPoint=function(b){var a;a=THREE.Shape.Utils.b3(b,this.v0.x,this.v1.x,this.v2.x,this.v3.x);b=THREE.Shape.Utils.b3(b,this.v0.y,this.v1.y,this.v2.y,this.v3.y);return new THREE.Vector2(a,b)};
THREE.CubicBezierCurve.prototype.getTangent=function(b){var a;a=THREE.Curve.Utils.tangentCubicBezier(b,this.v0.x,this.v1.x,this.v2.x,this.v3.x);b=THREE.Curve.Utils.tangentCubicBezier(b,this.v0.y,this.v1.y,this.v2.y,this.v3.y);a=new THREE.Vector2(a,b);a.normalize();return a};THREE.SplineCurve=function(b){this.points=b==void 0?[]:b};THREE.SplineCurve.prototype=new THREE.Curve;THREE.SplineCurve.prototype.constructor=THREE.SplineCurve;
THREE.SplineCurve.prototype.getPoint=function(b){var a=new THREE.Vector2,c=[],d=this.points,e;e=(d.length-1)*b;b=Math.floor(e);e=e-b;c[0]=b==0?b:b-1;c[1]=b;c[2]=b>d.length-2?d.length-1:b+1;c[3]=b>d.length-3?d.length-1:b+2;a.x=THREE.Curve.Utils.interpolate(d[c[0]].x,d[c[1]].x,d[c[2]].x,d[c[3]].x,e);a.y=THREE.Curve.Utils.interpolate(d[c[0]].y,d[c[1]].y,d[c[2]].y,d[c[3]].y,e);return a};
THREE.ArcCurve=function(b,a,c,d,e,f){this.aX=b;this.aY=a;this.aRadius=c;this.aStartAngle=d;this.aEndAngle=e;this.aClockwise=f};THREE.ArcCurve.prototype=new THREE.Curve;THREE.ArcCurve.prototype.constructor=THREE.ArcCurve;THREE.ArcCurve.prototype.getPoint=function(b){var a=this.aEndAngle-this.aStartAngle;this.aClockwise||(b=1-b);a=this.aStartAngle+b*a;b=this.aX+this.aRadius*Math.cos(a);a=this.aY+this.aRadius*Math.sin(a);return new THREE.Vector2(b,a)};
THREE.Curve.Utils={tangentQuadraticBezier:function(b,a,c,d){return 2*(1-b)*(c-a)+2*b*(d-c)},tangentCubicBezier:function(b,a,c,d,e){return-3*a*(1-b)*(1-b)+3*c*(1-b)*(1-b)-6*b*c*(1-b)+6*b*d*(1-b)-3*b*b*d+3*b*b*e},tangentSpline:function(b){return 6*b*b-6*b+(3*b*b-4*b+1)+(-6*b*b+6*b)+(3*b*b-2*b)},interpolate:function(b,a,c,d,e){var b=(c-b)*0.5,d=(d-a)*0.5,f=e*e;return(2*a-2*c+b+d)*e*f+(-3*a+3*c-2*b-d)*f+b*e+a}};
THREE.Curve.create=function(b,a){b.prototype=new THREE.Curve;b.prototype.constructor=b;b.prototype.getPoint=a;return b};THREE.LineCurve3=THREE.Curve.create(function(b,a){this.v1=b;this.v2=a},function(b){var a=new THREE.Vector3;a.sub(this.v2,this.v1);a.multiplyScalar(b);a.addSelf(this.v1);return a});
THREE.QuadraticBezierCurve3=THREE.Curve.create(function(b,a,c){this.v0=b;this.v1=a;this.v2=c},function(b){var a,c;a=THREE.Shape.Utils.b2(b,this.v0.x,this.v1.x,this.v2.x);c=THREE.Shape.Utils.b2(b,this.v0.y,this.v1.y,this.v2.y);b=THREE.Shape.Utils.b2(b,this.v0.z,this.v1.z,this.v2.z);return new THREE.Vector3(a,c,b)});
THREE.CubicBezierCurve3=THREE.Curve.create(function(b,a,c,d){this.v0=b;this.v1=a;this.v2=c;this.v3=d},function(b){var a,c;a=THREE.Shape.Utils.b3(b,this.v0.x,this.v1.x,this.v2.x,this.v3.x);c=THREE.Shape.Utils.b3(b,this.v0.y,this.v1.y,this.v2.y,this.v3.y);b=THREE.Shape.Utils.b3(b,this.v0.z,this.v1.z,this.v2.z,this.v3.z);return new THREE.Vector3(a,c,b)});
THREE.SplineCurve3=THREE.Curve.create(function(b){this.points=b==void 0?[]:b},function(b){var a=new THREE.Vector3,c=[],d=this.points,e,b=(d.length-1)*b;e=Math.floor(b);b=b-e;c[0]=e==0?e:e-1;c[1]=e;c[2]=e>d.length-2?d.length-1:e+1;c[3]=e>d.length-3?d.length-1:e+2;e=d[c[0]];var f=d[c[1]],g=d[c[2]],c=d[c[3]];a.x=THREE.Curve.Utils.interpolate(e.x,f.x,g.x,c.x,b);a.y=THREE.Curve.Utils.interpolate(e.y,f.y,g.y,c.y,b);a.z=THREE.Curve.Utils.interpolate(e.z,f.z,g.z,c.z,b);return a});
THREE.ClosedSplineCurve3=THREE.Curve.create(function(b){this.points=b==void 0?[]:b},function(b){var a=new THREE.Vector3,c=[],d=this.points,e;e=(d.length-0)*b;b=Math.floor(e);e=e-b;b=b+(b>0?0:(Math.floor(Math.abs(b)/d.length)+1)*d.length);c[0]=(b-1)%d.length;c[1]=b%d.length;c[2]=(b+1)%d.length;c[3]=(b+2)%d.length;a.x=THREE.Curve.Utils.interpolate(d[c[0]].x,d[c[1]].x,d[c[2]].x,d[c[3]].x,e);a.y=THREE.Curve.Utils.interpolate(d[c[0]].y,d[c[1]].y,d[c[2]].y,d[c[3]].y,e);a.z=THREE.Curve.Utils.interpolate(d[c[0]].z,
d[c[1]].z,d[c[2]].z,d[c[3]].z,e);return a});THREE.CurvePath=function(){this.curves=[];this.bends=[];this.autoClose=false};THREE.CurvePath.prototype=new THREE.Curve;THREE.CurvePath.prototype.constructor=THREE.CurvePath;THREE.CurvePath.prototype.add=function(b){this.curves.push(b)};THREE.CurvePath.prototype.checkConnection=function(){};
THREE.CurvePath.prototype.closePath=function(){var b=this.curves[0].getPoint(0),a=this.curves[this.curves.length-1].getPoint(1);b.equals(a)||this.curves.push(new THREE.LineCurve(a,b))};THREE.CurvePath.prototype.getPoint=function(b){for(var a=b*this.getLength(),c=this.getCurveLengths(),b=0;b<c.length;){if(c[b]>=a){a=c[b]-a;b=this.curves[b];a=1-a/b.getLength();return b.getPointAt(a)}b++}return null};THREE.CurvePath.prototype.getLength=function(){var b=this.getCurveLengths();return b[b.length-1]};
THREE.CurvePath.prototype.getCurveLengths=function(){if(this.cacheLengths&&this.cacheLengths.length==this.curves.length)return this.cacheLengths;var b=[],a=0,c,d=this.curves.length;for(c=0;c<d;c++){a=a+this.curves[c].getLength();b.push(a)}return this.cacheLengths=b};
THREE.CurvePath.prototype.getBoundingBox=function(){var b=this.getPoints(),a,c,d,e;a=c=Number.NEGATIVE_INFINITY;d=e=Number.POSITIVE_INFINITY;var f,g,h,i;i=new THREE.Vector2;g=0;for(h=b.length;g<h;g++){f=b[g];if(f.x>a)a=f.x;else if(f.x<d)d=f.x;if(f.y>c)c=f.y;else if(f.y<c)e=f.y;i.addSelf(f.x,f.y)}return{minX:d,minY:e,maxX:a,maxY:c,centroid:i.divideScalar(h)}};THREE.CurvePath.prototype.createPointsGeometry=function(b){return this.createGeometry(this.getPoints(b,true))};
THREE.CurvePath.prototype.createSpacedPointsGeometry=function(b){return this.createGeometry(this.getSpacedPoints(b,true))};THREE.CurvePath.prototype.createGeometry=function(b){for(var a=new THREE.Geometry,c=0;c<b.length;c++)a.vertices.push(new THREE.Vector3(b[c].x,b[c].y,0));return a};THREE.CurvePath.prototype.addWrapPath=function(b){this.bends.push(b)};
THREE.CurvePath.prototype.getTransformedPoints=function(b,a){var c=this.getPoints(b),d,e;if(!a)a=this.bends;d=0;for(e=a.length;d<e;d++)c=this.getWrapPoints(c,a[d]);return c};THREE.CurvePath.prototype.getTransformedSpacedPoints=function(b,a){var c=this.getSpacedPoints(b),d,e;if(!a)a=this.bends;d=0;for(e=a.length;d<e;d++)c=this.getWrapPoints(c,a[d]);return c};
THREE.CurvePath.prototype.getWrapPoints=function(b,a){var c=this.getBoundingBox(),d,e,f,g,h,i;d=0;for(e=b.length;d<e;d++){f=b[d];g=f.x;h=f.y;i=g/c.maxX;i=a.getUtoTmapping(i,g);g=a.getPoint(i);h=a.getNormalVector(i).multiplyScalar(h);f.x=g.x+h.x;f.y=g.y+h.y}return b};
THREE.EventTarget=function(){var b={};this.addEventListener=function(a,c){b[a]==void 0&&(b[a]=[]);b[a].indexOf(c)===-1&&b[a].push(c)};this.dispatchEvent=function(a){for(var c in b[a.type])b[a.type][c](a)};this.removeEventListener=function(a,c){var d=b[a].indexOf(c);d!==-1&&b[a].splice(d,1)}};THREE.Gyroscope=function(){THREE.Object3D.call(this)};THREE.Gyroscope.prototype=new THREE.Object3D;THREE.Gyroscope.prototype.constructor=THREE.Gyroscope;
THREE.Gyroscope.prototype.updateMatrixWorld=function(b){this.matrixAutoUpdate&&this.updateMatrix();if(this.matrixWorldNeedsUpdate||b){if(this.parent){this.matrixWorld.multiply(this.parent.matrixWorld,this.matrix);this.matrixWorld.decompose(this.translationWorld,this.rotationWorld,this.scaleWorld);this.matrix.decompose(this.translationObject,this.rotationObject,this.scaleObject);this.matrixWorld.compose(this.translationWorld,this.rotationObject,this.scaleWorld)}else this.matrixWorld.copy(this.matrix);
this.matrixWorldNeedsUpdate=false;b=true}for(var a=0,c=this.children.length;a<c;a++)this.children[a].updateMatrixWorld(b)};THREE.Gyroscope.prototype.translationWorld=new THREE.Vector3;THREE.Gyroscope.prototype.translationObject=new THREE.Vector3;THREE.Gyroscope.prototype.rotationWorld=new THREE.Quaternion;THREE.Gyroscope.prototype.rotationObject=new THREE.Quaternion;THREE.Gyroscope.prototype.scaleWorld=new THREE.Vector3;THREE.Gyroscope.prototype.scaleObject=new THREE.Vector3;
THREE.Path=function(b){THREE.CurvePath.call(this);this.actions=[];b&&this.fromPoints(b)};THREE.Path.prototype=new THREE.CurvePath;THREE.Path.prototype.constructor=THREE.Path;THREE.PathActions={MOVE_TO:"moveTo",LINE_TO:"lineTo",QUADRATIC_CURVE_TO:"quadraticCurveTo",BEZIER_CURVE_TO:"bezierCurveTo",CSPLINE_THRU:"splineThru",ARC:"arc"};THREE.Path.prototype.fromPoints=function(b){this.moveTo(b[0].x,b[0].y);for(var a=1,c=b.length;a<c;a++)this.lineTo(b[a].x,b[a].y)};
THREE.Path.prototype.moveTo=function(b,a){var c=Array.prototype.slice.call(arguments);this.actions.push({action:THREE.PathActions.MOVE_TO,args:c})};THREE.Path.prototype.lineTo=function(b,a){var c=Array.prototype.slice.call(arguments),d=this.actions[this.actions.length-1].args;this.curves.push(new THREE.LineCurve(new THREE.Vector2(d[d.length-2],d[d.length-1]),new THREE.Vector2(b,a)));this.actions.push({action:THREE.PathActions.LINE_TO,args:c})};
THREE.Path.prototype.quadraticCurveTo=function(b,a,c,d){var e=Array.prototype.slice.call(arguments),f=this.actions[this.actions.length-1].args;this.curves.push(new THREE.QuadraticBezierCurve(new THREE.Vector2(f[f.length-2],f[f.length-1]),new THREE.Vector2(b,a),new THREE.Vector2(c,d)));this.actions.push({action:THREE.PathActions.QUADRATIC_CURVE_TO,args:e})};
THREE.Path.prototype.bezierCurveTo=function(b,a,c,d,e,f){var g=Array.prototype.slice.call(arguments),h=this.actions[this.actions.length-1].args;this.curves.push(new THREE.CubicBezierCurve(new THREE.Vector2(h[h.length-2],h[h.length-1]),new THREE.Vector2(b,a),new THREE.Vector2(c,d),new THREE.Vector2(e,f)));this.actions.push({action:THREE.PathActions.BEZIER_CURVE_TO,args:g})};
THREE.Path.prototype.splineThru=function(b){var a=Array.prototype.slice.call(arguments),c=this.actions[this.actions.length-1].args,c=[new THREE.Vector2(c[c.length-2],c[c.length-1])];Array.prototype.push.apply(c,b);this.curves.push(new THREE.SplineCurve(c));this.actions.push({action:THREE.PathActions.CSPLINE_THRU,args:a})};
THREE.Path.prototype.arc=function(b,a,c,d,e,f){var g=Array.prototype.slice.call(arguments),h=this.actions[this.actions.length-1],h=new THREE.ArcCurve(h.x+b,h.y+a,c,d,e,f);this.curves.push(h);h=h.getPoint(f?1:0);g.push(h.x);g.push(h.y);this.actions.push({action:THREE.PathActions.ARC,args:g})};
THREE.Path.prototype.absarc=function(b,a,c,d,e,f){var g=Array.prototype.slice.call(arguments),h=new THREE.ArcCurve(b,a,c,d,e,f);this.curves.push(h);h=h.getPoint(f?1:0);g.push(h.x);g.push(h.y);this.actions.push({action:THREE.PathActions.ARC,args:g})};THREE.Path.prototype.getSpacedPoints=function(b){b||(b=40);for(var a=[],c=0;c<b;c++)a.push(this.getPoint(c/b));return a};
THREE.Path.prototype.getPoints=function(b,a){if(this.useSpacedPoints){console.log("tata");return this.getSpacedPoints(b,a)}var b=b||12,c=[],d,e,f,g,h,i,j,l,n,k,m,p,q;d=0;for(e=this.actions.length;d<e;d++){f=this.actions[d];g=f.action;f=f.args;switch(g){case THREE.PathActions.MOVE_TO:c.push(new THREE.Vector2(f[0],f[1]));break;case THREE.PathActions.LINE_TO:c.push(new THREE.Vector2(f[0],f[1]));break;case THREE.PathActions.QUADRATIC_CURVE_TO:h=f[2];i=f[3];n=f[0];k=f[1];if(c.length>0){g=c[c.length-1];
m=g.x;p=g.y}else{g=this.actions[d-1].args;m=g[g.length-2];p=g[g.length-1]}for(f=1;f<=b;f++){q=f/b;g=THREE.Shape.Utils.b2(q,m,n,h);q=THREE.Shape.Utils.b2(q,p,k,i);c.push(new THREE.Vector2(g,q))}break;case THREE.PathActions.BEZIER_CURVE_TO:h=f[4];i=f[5];n=f[0];k=f[1];j=f[2];l=f[3];if(c.length>0){g=c[c.length-1];m=g.x;p=g.y}else{g=this.actions[d-1].args;m=g[g.length-2];p=g[g.length-1]}for(f=1;f<=b;f++){q=f/b;g=THREE.Shape.Utils.b3(q,m,n,j,h);q=THREE.Shape.Utils.b3(q,p,k,l,i);c.push(new THREE.Vector2(g,
q))}break;case THREE.PathActions.CSPLINE_THRU:g=this.actions[d-1].args;q=[new THREE.Vector2(g[g.length-2],g[g.length-1])];g=b*f[0].length;q=q.concat(f[0]);q=new THREE.SplineCurve(q);for(f=1;f<=g;f++)c.push(q.getPointAt(f/g));break;case THREE.PathActions.ARC:h=f[0];i=f[1];j=f[2];n=f[3];k=!!f[5];l=f[4]-n;m=b*2;for(f=1;f<=m;f++){q=f/m;k||(q=1-q);q=n+q*l;g=h+j*Math.cos(q);q=i+j*Math.sin(q);c.push(new THREE.Vector2(g,q))}}}d=c[c.length-1];Math.abs(d.x-c[0].x)<1.0E-10&&Math.abs(d.y-c[0].y)<1.0E-10&&c.splice(c.length-
1,1);a&&c.push(c[0]);return c};THREE.Path.prototype.transform=function(b,a){this.getBoundingBox();return this.getWrapPoints(this.getPoints(a),b)};THREE.Path.prototype.nltransform=function(b,a,c,d,e,f){var g=this.getPoints(),h,i,j,l,n;h=0;for(i=g.length;h<i;h++){j=g[h];l=j.x;n=j.y;j.x=b*l+a*n+c;j.y=d*n+e*l+f}return g};
THREE.Path.prototype.debug=function(b){var a=this.getBoundingBox();if(!b){b=document.createElement("canvas");b.setAttribute("width",a.maxX+100);b.setAttribute("height",a.maxY+100);document.body.appendChild(b)}a=b.getContext("2d");a.fillStyle="white";a.fillRect(0,0,b.width,b.height);a.strokeStyle="black";a.beginPath();var c,d,e,b=0;for(c=this.actions.length;b<c;b++){d=this.actions[b];e=d.args;d=d.action;d!=THREE.PathActions.CSPLINE_THRU&&a[d].apply(a,e)}a.stroke();a.closePath();a.strokeStyle="red";
d=this.getPoints();b=0;for(c=d.length;b<c;b++){e=d[b];a.beginPath();a.arc(e.x,e.y,1.5,0,Math.PI*2,false);a.stroke();a.closePath()}};
THREE.Path.prototype.toShapes=function(){var b,a,c,d,e=[],f=new THREE.Path;b=0;for(a=this.actions.length;b<a;b++){c=this.actions[b];d=c.args;c=c.action;if(c==THREE.PathActions.MOVE_TO&&f.actions.length!=0){e.push(f);f=new THREE.Path}f[c].apply(f,d)}f.actions.length!=0&&e.push(f);if(e.length==0)return[];var g;d=[];b=!THREE.Shape.Utils.isClockWise(e[0].getPoints());if(e.length==1){f=e[0];g=new THREE.Shape;g.actions=f.actions;g.curves=f.curves;d.push(g);return d}if(b){g=new THREE.Shape;b=0;for(a=e.length;b<
a;b++){f=e[b];if(THREE.Shape.Utils.isClockWise(f.getPoints())){g.actions=f.actions;g.curves=f.curves;d.push(g);g=new THREE.Shape}else g.holes.push(f)}}else{b=0;for(a=e.length;b<a;b++){f=e[b];if(THREE.Shape.Utils.isClockWise(f.getPoints())){g&&d.push(g);g=new THREE.Shape;g.actions=f.actions;g.curves=f.curves}else g.holes.push(f)}d.push(g)}return d};THREE.Shape=function(){THREE.Path.apply(this,arguments);this.holes=[]};THREE.Shape.prototype=new THREE.Path;THREE.Shape.prototype.constructor=THREE.Path;
THREE.Shape.prototype.extrude=function(b){return new THREE.ExtrudeGeometry(this,b)};THREE.Shape.prototype.getPointsHoles=function(b){var a,c=this.holes.length,d=[];for(a=0;a<c;a++)d[a]=this.holes[a].getTransformedPoints(b,this.bends);return d};THREE.Shape.prototype.getSpacedPointsHoles=function(b){var a,c=this.holes.length,d=[];for(a=0;a<c;a++)d[a]=this.holes[a].getTransformedSpacedPoints(b,this.bends);return d};
THREE.Shape.prototype.extractAllPoints=function(b){return{shape:this.getTransformedPoints(b),holes:this.getPointsHoles(b)}};THREE.Shape.prototype.extractPoints=function(b){return this.useSpacedPoints?this.extractAllSpacedPoints(b):this.extractAllPoints(b)};THREE.Shape.prototype.extractAllSpacedPoints=function(b){return{shape:this.getTransformedSpacedPoints(b),holes:this.getSpacedPointsHoles(b)}};
THREE.Shape.Utils={removeHoles:function(b,a){var c=b.concat(),d=c.concat(),e,f,g,h,i,j,l,n,k,m,p=[];for(i=0;i<a.length;i++){j=a[i];Array.prototype.push.apply(d,j);f=Number.POSITIVE_INFINITY;for(e=0;e<j.length;e++){k=j[e];m=[];for(n=0;n<c.length;n++){l=c[n];l=k.distanceToSquared(l);m.push(l);if(l<f){f=l;g=e;h=n}}}e=h-1>=0?h-1:c.length-1;f=g-1>=0?g-1:j.length-1;var q=[j[g],c[h],c[e]];n=THREE.FontUtils.Triangulate.area(q);var r=[j[g],j[f],c[h]];k=THREE.FontUtils.Triangulate.area(r);m=h;l=g;h=h+1;g=g+
-1;h<0&&(h=h+c.length);h=h%c.length;g<0&&(g=g+j.length);g=g%j.length;e=h-1>=0?h-1:c.length-1;f=g-1>=0?g-1:j.length-1;q=[j[g],c[h],c[e]];q=THREE.FontUtils.Triangulate.area(q);r=[j[g],j[f],c[h]];r=THREE.FontUtils.Triangulate.area(r);if(n+k>q+r){h=m;g=l;h<0&&(h=h+c.length);h=h%c.length;g<0&&(g=g+j.length);g=g%j.length;e=h-1>=0?h-1:c.length-1;f=g-1>=0?g-1:j.length-1}n=c.slice(0,h);k=c.slice(h);m=j.slice(g);l=j.slice(0,g);f=[j[g],j[f],c[h]];p.push([j[g],c[h],c[e]]);p.push(f);c=n.concat(m).concat(l).concat(k)}return{shape:c,
isolatedPts:p,allpoints:d}},triangulateShape:function(b,a){var c=THREE.Shape.Utils.removeHoles(b,a),d=c.allpoints,e=c.isolatedPts,c=THREE.FontUtils.Triangulate(c.shape,false),f,g,h,i,j={};f=0;for(g=d.length;f<g;f++){i=d[f].x+":"+d[f].y;j[i]!==void 0&&console.log("Duplicate point",i);j[i]=f}f=0;for(g=c.length;f<g;f++){h=c[f];for(d=0;d<3;d++){i=h[d].x+":"+h[d].y;i=j[i];i!==void 0&&(h[d]=i)}}f=0;for(g=e.length;f<g;f++){h=e[f];for(d=0;d<3;d++){i=h[d].x+":"+h[d].y;i=j[i];i!==void 0&&(h[d]=i)}}return c.concat(e)},
isClockWise:function(b){return THREE.FontUtils.Triangulate.area(b)<0},b2p0:function(b,a){var c=1-b;return c*c*a},b2p1:function(b,a){return 2*(1-b)*b*a},b2p2:function(b,a){return b*b*a},b2:function(b,a,c,d){return this.b2p0(b,a)+this.b2p1(b,c)+this.b2p2(b,d)},b3p0:function(b,a){var c=1-b;return c*c*c*a},b3p1:function(b,a){var c=1-b;return 3*c*c*b*a},b3p2:function(b,a){return 3*(1-b)*b*b*a},b3p3:function(b,a){return b*b*b*a},b3:function(b,a,c,d,e){return this.b3p0(b,a)+this.b3p1(b,c)+this.b3p2(b,d)+
this.b3p3(b,e)}};THREE.TextPath=function(b,a){THREE.Path.call(this);this.parameters=a||{};this.set(b)};THREE.TextPath.prototype.set=function(b,a){a=a||this.parameters;this.text=b;var c=a.curveSegments!==void 0?a.curveSegments:4,d=a.font!==void 0?a.font:"helvetiker",e=a.weight!==void 0?a.weight:"normal",f=a.style!==void 0?a.style:"normal";THREE.FontUtils.size=a.size!==void 0?a.size:100;THREE.FontUtils.divisions=c;THREE.FontUtils.face=d;THREE.FontUtils.weight=e;THREE.FontUtils.style=f};
THREE.TextPath.prototype.toShapes=function(){for(var b=THREE.FontUtils.drawText(this.text).paths,a=[],c=0,d=b.length;c<d;c++)Array.prototype.push.apply(a,b[c].toShapes());return a};
THREE.AnimationHandler=function(){var b=[],a={},c={update:function(a){for(var c=0;c<b.length;c++)b[c].update(a)},addToUpdate:function(a){b.indexOf(a)===-1&&b.push(a)},removeFromUpdate:function(a){a=b.indexOf(a);a!==-1&&b.splice(a,1)},add:function(b){a[b.name]!==void 0&&console.log("THREE.AnimationHandler.add: Warning! "+b.name+" already exists in library. Overwriting.");a[b.name]=b;if(b.initialized!==true){for(var c=0;c<b.hierarchy.length;c++){for(var d=0;d<b.hierarchy[c].keys.length;d++){if(b.hierarchy[c].keys[d].time<
0)b.hierarchy[c].keys[d].time=0;if(b.hierarchy[c].keys[d].rot!==void 0&&!(b.hierarchy[c].keys[d].rot instanceof THREE.Quaternion)){var h=b.hierarchy[c].keys[d].rot;b.hierarchy[c].keys[d].rot=new THREE.Quaternion(h[0],h[1],h[2],h[3])}}if(b.hierarchy[c].keys.length&&b.hierarchy[c].keys[0].morphTargets!==void 0){h={};for(d=0;d<b.hierarchy[c].keys.length;d++)for(var i=0;i<b.hierarchy[c].keys[d].morphTargets.length;i++){var j=b.hierarchy[c].keys[d].morphTargets[i];h[j]=-1}b.hierarchy[c].usedMorphTargets=
h;for(d=0;d<b.hierarchy[c].keys.length;d++){var l={};for(j in h){for(i=0;i<b.hierarchy[c].keys[d].morphTargets.length;i++)if(b.hierarchy[c].keys[d].morphTargets[i]===j){l[j]=b.hierarchy[c].keys[d].morphTargetsInfluences[i];break}i===b.hierarchy[c].keys[d].morphTargets.length&&(l[j]=0)}b.hierarchy[c].keys[d].morphTargetsInfluences=l}}for(d=1;d<b.hierarchy[c].keys.length;d++)if(b.hierarchy[c].keys[d].time===b.hierarchy[c].keys[d-1].time){b.hierarchy[c].keys.splice(d,1);d--}for(d=0;d<b.hierarchy[c].keys.length;d++)b.hierarchy[c].keys[d].index=
d}d=parseInt(b.length*b.fps,10);b.JIT={};b.JIT.hierarchy=[];for(c=0;c<b.hierarchy.length;c++)b.JIT.hierarchy.push(Array(d));b.initialized=true}},get:function(b){if(typeof b==="string"){if(a[b])return a[b];console.log("THREE.AnimationHandler.get: Couldn't find animation "+b);return null}},parse:function(a){var b=[];if(a instanceof THREE.SkinnedMesh)for(var c=0;c<a.bones.length;c++)b.push(a.bones[c]);else d(a,b);return b}},d=function(a,b){b.push(a);for(var c=0;c<a.children.length;c++)d(a.children[c],
b)};c.LINEAR=0;c.CATMULLROM=1;c.CATMULLROM_FORWARD=2;return c}();THREE.Animation=function(b,a,c,d){this.root=b;this.data=THREE.AnimationHandler.get(a);this.hierarchy=THREE.AnimationHandler.parse(b);this.currentTime=0;this.timeScale=1;this.isPlaying=false;this.loop=this.isPaused=true;this.interpolationType=c!==void 0?c:THREE.AnimationHandler.LINEAR;this.JITCompile=d!==void 0?d:true;this.points=[];this.target=new THREE.Vector3};
THREE.Animation.prototype.play=function(b,a){if(!this.isPlaying){this.isPlaying=true;this.loop=b!==void 0?b:true;this.currentTime=a!==void 0?a:0;var c,d=this.hierarchy.length,e;for(c=0;c<d;c++){e=this.hierarchy[c];if(this.interpolationType!==THREE.AnimationHandler.CATMULLROM_FORWARD)e.useQuaternion=true;e.matrixAutoUpdate=true;if(e.animationCache===void 0){e.animationCache={};e.animationCache.prevKey={pos:0,rot:0,scl:0};e.animationCache.nextKey={pos:0,rot:0,scl:0};e.animationCache.originalMatrix=
e instanceof THREE.Bone?e.skinMatrix:e.matrix}var f=e.animationCache.prevKey;e=e.animationCache.nextKey;f.pos=this.data.hierarchy[c].keys[0];f.rot=this.data.hierarchy[c].keys[0];f.scl=this.data.hierarchy[c].keys[0];e.pos=this.getNextKeyWith("pos",c,1);e.rot=this.getNextKeyWith("rot",c,1);e.scl=this.getNextKeyWith("scl",c,1)}this.update(0)}this.isPaused=false;THREE.AnimationHandler.addToUpdate(this)};
THREE.Animation.prototype.pause=function(){this.isPaused?THREE.AnimationHandler.addToUpdate(this):THREE.AnimationHandler.removeFromUpdate(this);this.isPaused=!this.isPaused};
THREE.Animation.prototype.stop=function(){this.isPaused=this.isPlaying=false;THREE.AnimationHandler.removeFromUpdate(this);for(var b=0;b<this.hierarchy.length;b++)if(this.hierarchy[b].animationCache!==void 0){this.hierarchy[b]instanceof THREE.Bone?this.hierarchy[b].skinMatrix=this.hierarchy[b].animationCache.originalMatrix:this.hierarchy[b].matrix=this.hierarchy[b].animationCache.originalMatrix;delete this.hierarchy[b].animationCache}};
THREE.Animation.prototype.update=function(b){if(this.isPlaying){var a=["pos","rot","scl"],c,d,e,f,g,h,i,j,l=this.data.JIT.hierarchy,n,k;k=this.currentTime=this.currentTime+b*this.timeScale;n=this.currentTime=this.currentTime%this.data.length;j=parseInt(Math.min(n*this.data.fps,this.data.length*this.data.fps),10);for(var m=0,p=this.hierarchy.length;m<p;m++){b=this.hierarchy[m];i=b.animationCache;if(this.JITCompile&&l[m][j]!==void 0)if(b instanceof THREE.Bone){b.skinMatrix=l[m][j];b.matrixAutoUpdate=
false;b.matrixWorldNeedsUpdate=false}else{b.matrix=l[m][j];b.matrixAutoUpdate=false;b.matrixWorldNeedsUpdate=true}else{if(this.JITCompile)b instanceof THREE.Bone?b.skinMatrix=b.animationCache.originalMatrix:b.matrix=b.animationCache.originalMatrix;for(var q=0;q<3;q++){c=a[q];g=i.prevKey[c];h=i.nextKey[c];if(h.time<=k){if(n<k)if(this.loop){g=this.data.hierarchy[m].keys[0];for(h=this.getNextKeyWith(c,m,1);h.time<n;){g=h;h=this.getNextKeyWith(c,m,h.index+1)}}else{this.stop();return}else{do{g=h;h=this.getNextKeyWith(c,
m,h.index+1)}while(h.time<n)}i.prevKey[c]=g;i.nextKey[c]=h}b.matrixAutoUpdate=true;b.matrixWorldNeedsUpdate=true;d=(n-g.time)/(h.time-g.time);e=g[c];f=h[c];if(d<0||d>1){console.log("THREE.Animation.update: Warning! Scale out of bounds:"+d+" on bone "+m);d=d<0?0:1}if(c==="pos"){c=b.position;if(this.interpolationType===THREE.AnimationHandler.LINEAR){c.x=e[0]+(f[0]-e[0])*d;c.y=e[1]+(f[1]-e[1])*d;c.z=e[2]+(f[2]-e[2])*d}else if(this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===
THREE.AnimationHandler.CATMULLROM_FORWARD){this.points[0]=this.getPrevKeyWith("pos",m,g.index-1).pos;this.points[1]=e;this.points[2]=f;this.points[3]=this.getNextKeyWith("pos",m,h.index+1).pos;d=d*0.33+0.33;e=this.interpolateCatmullRom(this.points,d);c.x=e[0];c.y=e[1];c.z=e[2];if(this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD){d=this.interpolateCatmullRom(this.points,d*1.01);this.target.set(d[0],d[1],d[2]);this.target.subSelf(c);this.target.y=0;this.target.normalize();d=Math.atan2(this.target.x,
this.target.z);b.rotation.set(0,d,0)}}}else if(c==="rot")THREE.Quaternion.slerp(e,f,b.quaternion,d);else if(c==="scl"){c=b.scale;c.x=e[0]+(f[0]-e[0])*d;c.y=e[1]+(f[1]-e[1])*d;c.z=e[2]+(f[2]-e[2])*d}}}}if(this.JITCompile&&l[0][j]===void 0){this.hierarchy[0].updateMatrixWorld(true);for(m=0;m<this.hierarchy.length;m++)l[m][j]=this.hierarchy[m]instanceof THREE.Bone?this.hierarchy[m].skinMatrix.clone():this.hierarchy[m].matrix.clone()}}};
THREE.Animation.prototype.interpolateCatmullRom=function(b,a){var c=[],d=[],e,f,g,h,i,j;e=(b.length-1)*a;f=Math.floor(e);e=e-f;c[0]=f===0?f:f-1;c[1]=f;c[2]=f>b.length-2?f:f+1;c[3]=f>b.length-3?f:f+2;f=b[c[0]];h=b[c[1]];i=b[c[2]];j=b[c[3]];c=e*e;g=e*c;d[0]=this.interpolate(f[0],h[0],i[0],j[0],e,c,g);d[1]=this.interpolate(f[1],h[1],i[1],j[1],e,c,g);d[2]=this.interpolate(f[2],h[2],i[2],j[2],e,c,g);return d};
THREE.Animation.prototype.interpolate=function(b,a,c,d,e,f,g){b=(c-b)*0.5;d=(d-a)*0.5;return(2*(a-c)+b+d)*g+(-3*(a-c)-2*b-d)*f+b*e+a};THREE.Animation.prototype.getNextKeyWith=function(b,a,c){for(var d=this.data.hierarchy[a].keys,c=this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD?c<d.length-1?c:d.length-1:c%d.length;c<d.length;c++)if(d[c][b]!==void 0)return d[c];return this.data.hierarchy[a].keys[0]};
THREE.Animation.prototype.getPrevKeyWith=function(b,a,c){for(var d=this.data.hierarchy[a].keys,c=this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD?c>0?c:0:c>=0?c:c+d.length;c>=0;c--)if(d[c][b]!==void 0)return d[c];return this.data.hierarchy[a].keys[d.length-1]};
THREE.KeyFrameAnimation=function(b,a,c){this.root=b;this.data=THREE.AnimationHandler.get(a);this.hierarchy=THREE.AnimationHandler.parse(b);this.currentTime=0;this.timeScale=0.001;this.isPlaying=false;this.loop=this.isPaused=true;this.JITCompile=c!==void 0?c:true;b=0;for(a=this.hierarchy.length;b<a;b++){var c=this.data.hierarchy[b].sids,d=this.hierarchy[b];if(this.data.hierarchy[b].keys.length&&c){for(var e=0;e<c.length;e++){var f=c[e],g=this.getNextKeyWith(f,b,0);g&&g.apply(f)}d.matrixAutoUpdate=
false;this.data.hierarchy[b].node.updateMatrix();d.matrixWorldNeedsUpdate=true}}};
THREE.KeyFrameAnimation.prototype.play=function(b,a){if(!this.isPlaying){this.isPlaying=true;this.loop=b!==void 0?b:true;this.currentTime=a!==void 0?a:0;this.startTimeMs=a;this.startTime=1E7;this.endTime=-this.startTime;var c,d=this.hierarchy.length,e,f;for(c=0;c<d;c++){e=this.hierarchy[c];f=this.data.hierarchy[c];e.useQuaternion=true;if(f.animationCache===void 0){f.animationCache={};f.animationCache.prevKey=null;f.animationCache.nextKey=null;f.animationCache.originalMatrix=e instanceof THREE.Bone?
e.skinMatrix:e.matrix}e=this.data.hierarchy[c].keys;if(e.length){f.animationCache.prevKey=e[0];f.animationCache.nextKey=e[1];this.startTime=Math.min(e[0].time,this.startTime);this.endTime=Math.max(e[e.length-1].time,this.endTime)}}this.update(0)}this.isPaused=false;THREE.AnimationHandler.addToUpdate(this)};THREE.KeyFrameAnimation.prototype.pause=function(){this.isPaused?THREE.AnimationHandler.addToUpdate(this):THREE.AnimationHandler.removeFromUpdate(this);this.isPaused=!this.isPaused};
THREE.KeyFrameAnimation.prototype.stop=function(){this.isPaused=this.isPlaying=false;THREE.AnimationHandler.removeFromUpdate(this);for(var b=0;b<this.data.hierarchy.length;b++){var a=this.hierarchy[b],c=this.data.hierarchy[b];if(c.animationCache!==void 0){var d=c.animationCache.originalMatrix;if(a instanceof THREE.Bone){d.copy(a.skinMatrix);a.skinMatrix=d}else{d.copy(a.matrix);a.matrix=d}delete c.animationCache}}};
THREE.KeyFrameAnimation.prototype.update=function(b){if(this.isPlaying){var a,c,d,e,f=this.data.JIT.hierarchy,g,h,i;h=this.currentTime=this.currentTime+b*this.timeScale;g=this.currentTime=this.currentTime%this.data.length;if(g<this.startTimeMs)g=this.currentTime=this.startTimeMs+g;e=parseInt(Math.min(g*this.data.fps,this.data.length*this.data.fps),10);if((i=g<h)&&!this.loop){for(var b=0,j=this.hierarchy.length;b<j;b++){var l=this.data.hierarchy[b].keys,f=this.data.hierarchy[b].sids;d=l.length-1;e=
this.hierarchy[b];if(l.length){for(l=0;l<f.length;l++){g=f[l];(h=this.getPrevKeyWith(g,b,d))&&h.apply(g)}this.data.hierarchy[b].node.updateMatrix();e.matrixWorldNeedsUpdate=true}}this.stop()}else if(!(g<this.startTime)){b=0;for(j=this.hierarchy.length;b<j;b++){d=this.hierarchy[b];a=this.data.hierarchy[b];var l=a.keys,n=a.animationCache;if(this.JITCompile&&f[b][e]!==void 0)if(d instanceof THREE.Bone){d.skinMatrix=f[b][e];d.matrixWorldNeedsUpdate=false}else{d.matrix=f[b][e];d.matrixWorldNeedsUpdate=
true}else if(l.length){if(this.JITCompile&&n)d instanceof THREE.Bone?d.skinMatrix=n.originalMatrix:d.matrix=n.originalMatrix;a=n.prevKey;c=n.nextKey;if(a&&c){if(c.time<=h){if(i&&this.loop){a=l[0];for(c=l[1];c.time<g;){a=c;c=l[a.index+1]}}else if(!i)for(var k=l.length-1;c.time<g&&c.index!==k;){a=c;c=l[a.index+1]}n.prevKey=a;n.nextKey=c}c.time>=g?a.interpolate(c,g):a.interpolate(c,c.time)}this.data.hierarchy[b].node.updateMatrix();d.matrixWorldNeedsUpdate=true}}if(this.JITCompile&&f[0][e]===void 0){this.hierarchy[0].updateMatrixWorld(true);
for(b=0;b<this.hierarchy.length;b++)f[b][e]=this.hierarchy[b]instanceof THREE.Bone?this.hierarchy[b].skinMatrix.clone():this.hierarchy[b].matrix.clone()}}}};THREE.KeyFrameAnimation.prototype.getNextKeyWith=function(b,a,c){a=this.data.hierarchy[a].keys;for(c=c%a.length;c<a.length;c++)if(a[c].hasTarget(b))return a[c];return a[0]};
THREE.KeyFrameAnimation.prototype.getPrevKeyWith=function(b,a,c){a=this.data.hierarchy[a].keys;for(c=c>=0?c:c+a.length;c>=0;c--)if(a[c].hasTarget(b))return a[c];return a[a.length-1]};
THREE.CubeCamera=function(b,a,c){THREE.Object3D.call(this);var d=new THREE.PerspectiveCamera(90,1,b,a);d.up.set(0,-1,0);d.lookAt(new THREE.Vector3(1,0,0));this.add(d);var e=new THREE.PerspectiveCamera(90,1,b,a);e.up.set(0,-1,0);e.lookAt(new THREE.Vector3(-1,0,0));this.add(e);var f=new THREE.PerspectiveCamera(90,1,b,a);f.up.set(0,0,1);f.lookAt(new THREE.Vector3(0,1,0));this.add(f);var g=new THREE.PerspectiveCamera(90,1,b,a);g.up.set(0,0,-1);g.lookAt(new THREE.Vector3(0,-1,0));this.add(g);var h=new THREE.PerspectiveCamera(90,
1,b,a);h.up.set(0,-1,0);h.lookAt(new THREE.Vector3(0,0,1));this.add(h);var i=new THREE.PerspectiveCamera(90,1,b,a);i.up.set(0,-1,0);i.lookAt(new THREE.Vector3(0,0,-1));this.add(i);this.renderTarget=new THREE.WebGLRenderTargetCube(c,c,{format:THREE.RGBFormat,magFilter:THREE.LinearFilter,minFilter:THREE.LinearFilter});this.updateCubeMap=function(a,b){var c=this.renderTarget,k=c.generateMipmaps;c.generateMipmaps=false;c.activeCubeFace=0;a.render(b,d,c);c.activeCubeFace=1;a.render(b,e,c);c.activeCubeFace=
2;a.render(b,f,c);c.activeCubeFace=3;a.render(b,g,c);c.activeCubeFace=4;a.render(b,h,c);c.generateMipmaps=k;c.activeCubeFace=5;a.render(b,i,c)}};THREE.CubeCamera.prototype=new THREE.Object3D;THREE.CubeCamera.prototype.constructor=THREE.CubeCamera;
THREE.CombinedCamera=function(b,a,c,d,e,f,g){THREE.Camera.call(this);this.fov=c;this.left=-b/2;this.right=b/2;this.top=a/2;this.bottom=-a/2;this.cameraO=new THREE.OrthographicCamera(b/-2,b/2,a/2,a/-2,f,g);this.cameraP=new THREE.PerspectiveCamera(c,b/a,d,e);this.zoom=1;this.toPerspective()};THREE.CombinedCamera.prototype=new THREE.Camera;THREE.CombinedCamera.prototype.constructor=THREE.CombinedCamera;
THREE.CombinedCamera.prototype.toPerspective=function(){this.near=this.cameraP.near;this.far=this.cameraP.far;this.cameraP.fov=this.fov/this.zoom;this.cameraP.updateProjectionMatrix();this.projectionMatrix=this.cameraP.projectionMatrix;this.inPersepectiveMode=true;this.inOrthographicMode=false};
THREE.CombinedCamera.prototype.toOrthographic=function(){var b=this.cameraP.aspect,a=(this.cameraP.near+this.cameraP.far)/2,a=Math.tan(this.fov/2)*a,b=2*a*b/2,a=a/this.zoom,b=b/this.zoom;this.cameraO.left=-b;this.cameraO.right=b;this.cameraO.top=a;this.cameraO.bottom=-a;this.cameraO.updateProjectionMatrix();this.near=this.cameraO.near;this.far=this.cameraO.far;this.projectionMatrix=this.cameraO.projectionMatrix;this.inPersepectiveMode=false;this.inOrthographicMode=true};
THREE.CombinedCamera.prototype.setSize=function(b,a){this.cameraP.aspect=b/a;this.left=-b/2;this.right=b/2;this.top=a/2;this.bottom=-a/2};THREE.CombinedCamera.prototype.setFov=function(b){this.fov=b;this.inPersepectiveMode?this.toPerspective():this.toOrthographic()};THREE.CombinedCamera.prototype.updateProjectionMatrix=function(){if(this.inPersepectiveMode)this.toPerspective();else{this.toPerspective();this.toOrthographic()}};
THREE.CombinedCamera.prototype.setLens=function(b,a){var c=2*Math.atan((a!==void 0?a:24)/(b*2))*(180/Math.PI);this.setFov(c);return c};THREE.CombinedCamera.prototype.setZoom=function(b){this.zoom=b;this.inPersepectiveMode?this.toPerspective():this.toOrthographic()};THREE.CombinedCamera.prototype.toFrontView=function(){this.rotation.x=0;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=false};
THREE.CombinedCamera.prototype.toBackView=function(){this.rotation.x=0;this.rotation.y=Math.PI;this.rotation.z=0;this.rotationAutoUpdate=false};THREE.CombinedCamera.prototype.toLeftView=function(){this.rotation.x=0;this.rotation.y=-Math.PI/2;this.rotation.z=0;this.rotationAutoUpdate=false};THREE.CombinedCamera.prototype.toRightView=function(){this.rotation.x=0;this.rotation.y=Math.PI/2;this.rotation.z=0;this.rotationAutoUpdate=false};
THREE.CombinedCamera.prototype.toTopView=function(){this.rotation.x=-Math.PI/2;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=false};THREE.CombinedCamera.prototype.toBottomView=function(){this.rotation.x=Math.PI/2;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=false};
THREE.FirstPersonControls=function(b,a){function c(a,b){return function(){b.apply(a,arguments)}}this.object=b;this.target=new THREE.Vector3(0,0,0);this.domElement=a!==void 0?a:document;this.movementSpeed=1;this.lookSpeed=0.005;this.noFly=false;this.lookVertical=true;this.autoForward=false;this.activeLook=true;this.heightSpeed=false;this.heightCoef=1;this.heightMin=0;this.constrainVertical=false;this.verticalMin=0;this.verticalMax=Math.PI;this.theta=this.phi=this.lon=this.lat=this.mouseY=this.mouseX=
this.autoSpeedFactor=0;this.mouseDragOn=this.freeze=this.moveRight=this.moveLeft=this.moveBackward=this.moveForward=false;if(this.domElement===document){this.viewHalfX=window.innerWidth/2;this.viewHalfY=window.innerHeight/2}else{this.viewHalfX=this.domElement.offsetWidth/2;this.viewHalfY=this.domElement.offsetHeight/2;this.domElement.setAttribute("tabindex",-1)}this.onMouseDown=function(a){this.domElement!==document&&this.domElement.focus();a.preventDefault();a.stopPropagation();if(this.activeLook)switch(a.button){case 0:this.moveForward=
true;break;case 2:this.moveBackward=true}this.mouseDragOn=true};this.onMouseUp=function(a){a.preventDefault();a.stopPropagation();if(this.activeLook)switch(a.button){case 0:this.moveForward=false;break;case 2:this.moveBackward=false}this.mouseDragOn=false};this.onMouseMove=function(a){if(this.domElement===document){this.mouseX=a.pageX-this.viewHalfX;this.mouseY=a.pageY-this.viewHalfY}else{this.mouseX=a.pageX-this.domElement.offsetLeft-this.viewHalfX;this.mouseY=a.pageY-this.domElement.offsetTop-this.viewHalfY}};
this.onKeyDown=function(a){switch(a.keyCode){case 38:case 87:this.moveForward=true;break;case 37:case 65:this.moveLeft=true;break;case 40:case 83:this.moveBackward=true;break;case 39:case 68:this.moveRight=true;break;case 82:this.moveUp=true;break;case 70:this.moveDown=true;break;case 81:this.freeze=!this.freeze}};this.onKeyUp=function(a){switch(a.keyCode){case 38:case 87:this.moveForward=false;break;case 37:case 65:this.moveLeft=false;break;case 40:case 83:this.moveBackward=false;break;case 39:case 68:this.moveRight=
false;break;case 82:this.moveUp=false;break;case 70:this.moveDown=false}};this.update=function(a){var b=0;if(!this.freeze){if(this.heightSpeed){b=THREE.Math.clamp(this.object.position.y,this.heightMin,this.heightMax)-this.heightMin;this.autoSpeedFactor=a*b*this.heightCoef}else this.autoSpeedFactor=0;b=a*this.movementSpeed;(this.moveForward||this.autoForward&&!this.moveBackward)&&this.object.translateZ(-(b+this.autoSpeedFactor));this.moveBackward&&this.object.translateZ(b);this.moveLeft&&this.object.translateX(-b);
this.moveRight&&this.object.translateX(b);this.moveUp&&this.object.translateY(b);this.moveDown&&this.object.translateY(-b);a=a*this.lookSpeed;this.activeLook||(a=0);this.lon=this.lon+this.mouseX*a;if(this.lookVertical)this.lat=this.lat-this.mouseY*a;this.lat=Math.max(-85,Math.min(85,this.lat));this.phi=(90-this.lat)*Math.PI/180;this.theta=this.lon*Math.PI/180;var b=this.target,c=this.object.position;b.x=c.x+100*Math.sin(this.phi)*Math.cos(this.theta);b.y=c.y+100*Math.cos(this.phi);b.z=c.z+100*Math.sin(this.phi)*
Math.sin(this.theta);b=1;this.constrainVertical&&(b=Math.PI/(this.verticalMax-this.verticalMin));this.lon=this.lon+this.mouseX*a;if(this.lookVertical)this.lat=this.lat-this.mouseY*a*b;this.lat=Math.max(-85,Math.min(85,this.lat));this.phi=(90-this.lat)*Math.PI/180;this.theta=this.lon*Math.PI/180;if(this.constrainVertical)this.phi=THREE.Math.mapLinear(this.phi,0,Math.PI,this.verticalMin,this.verticalMax);b=this.target;c=this.object.position;b.x=c.x+100*Math.sin(this.phi)*Math.cos(this.theta);b.y=c.y+
100*Math.cos(this.phi);b.z=c.z+100*Math.sin(this.phi)*Math.sin(this.theta);this.object.lookAt(b)}};this.domElement.addEventListener("contextmenu",function(a){a.preventDefault()},false);this.domElement.addEventListener("mousemove",c(this,this.onMouseMove),false);this.domElement.addEventListener("mousedown",c(this,this.onMouseDown),false);this.domElement.addEventListener("mouseup",c(this,this.onMouseUp),false);this.domElement.addEventListener("keydown",c(this,this.onKeyDown),false);this.domElement.addEventListener("keyup",
c(this,this.onKeyUp),false)};
THREE.PathControls=function(b,a){function c(a){return(a=a*2)<1?0.5*a*a:-0.5*(--a*(a-2)-1)}function d(a,b){return function(){b.apply(a,arguments)}}function e(a,b,c,d){var e={name:c,fps:0.6,length:d,hierarchy:[]},f,g=b.getControlPointsArray(),h=b.getLength(),r=g.length,u=0;f=r-1;b={parent:-1,keys:[]};b.keys[0]={time:0,pos:g[0],rot:[0,0,0,1],scl:[1,1,1]};b.keys[f]={time:d,pos:g[f],rot:[0,0,0,1],scl:[1,1,1]};for(f=1;f<r-1;f++){u=d*h.chunks[f]/h.total;b.keys[f]={time:u,pos:g[f]}}e.hierarchy[0]=b;THREE.AnimationHandler.add(e);
return new THREE.Animation(a,c,THREE.AnimationHandler.CATMULLROM_FORWARD,false)}function f(a,b){var c,d,e=new THREE.Geometry;for(c=0;c<a.points.length*b;c++){d=c/(a.points.length*b);d=a.getPoint(d);e.vertices[c]=new THREE.Vector3(d.x,d.y,d.z)}return e}this.object=b;this.domElement=a!==void 0?a:document;this.id="PathControls"+THREE.PathControlsIdCounter++;this.duration=1E4;this.waypoints=[];this.useConstantSpeed=true;this.resamplingCoef=50;this.debugPath=new THREE.Object3D;this.debugDummy=new THREE.Object3D;
this.animationParent=new THREE.Object3D;this.lookSpeed=0.005;this.lookHorizontal=this.lookVertical=true;this.verticalAngleMap={srcRange:[0,2*Math.PI],dstRange:[0,2*Math.PI]};this.horizontalAngleMap={srcRange:[0,2*Math.PI],dstRange:[0,2*Math.PI]};this.target=new THREE.Object3D;this.theta=this.phi=this.lon=this.lat=this.mouseY=this.mouseX=0;if(this.domElement===document){this.viewHalfX=window.innerWidth/2;this.viewHalfY=window.innerHeight/2}else{this.viewHalfX=this.domElement.offsetWidth/2;this.viewHalfY=
this.domElement.offsetHeight/2;this.domElement.setAttribute("tabindex",-1)}var g=Math.PI*2,h=Math.PI/180;this.update=function(a){var b;if(this.lookHorizontal)this.lon=this.lon+this.mouseX*this.lookSpeed*a;if(this.lookVertical)this.lat=this.lat-this.mouseY*this.lookSpeed*a;this.lon=Math.max(0,Math.min(360,this.lon));this.lat=Math.max(-85,Math.min(85,this.lat));this.phi=(90-this.lat)*h;this.theta=this.lon*h;a=this.phi%g;this.phi=a>=0?a:a+g;b=this.verticalAngleMap.srcRange;a=this.verticalAngleMap.dstRange;
b=THREE.Math.mapLinear(this.phi,b[0],b[1],a[0],a[1]);var d=a[1]-a[0];this.phi=c((b-a[0])/d)*d+a[0];b=this.horizontalAngleMap.srcRange;a=this.horizontalAngleMap.dstRange;b=THREE.Math.mapLinear(this.theta,b[0],b[1],a[0],a[1]);d=a[1]-a[0];this.theta=c((b-a[0])/d)*d+a[0];a=this.target.position;a.x=100*Math.sin(this.phi)*Math.cos(this.theta);a.y=100*Math.cos(this.phi);a.z=100*Math.sin(this.phi)*Math.sin(this.theta);this.object.lookAt(this.target.position)};this.onMouseMove=function(a){if(this.domElement===
document){this.mouseX=a.pageX-this.viewHalfX;this.mouseY=a.pageY-this.viewHalfY}else{this.mouseX=a.pageX-this.domElement.offsetLeft-this.viewHalfX;this.mouseY=a.pageY-this.domElement.offsetTop-this.viewHalfY}};this.init=function(){this.spline=new THREE.Spline;this.spline.initFromArray(this.waypoints);this.useConstantSpeed&&this.spline.reparametrizeByArcLength(this.resamplingCoef);if(this.createDebugDummy){var a=new THREE.MeshLambertMaterial({color:30719}),b=new THREE.MeshLambertMaterial({color:65280}),
c=new THREE.CubeGeometry(10,10,20),g=new THREE.CubeGeometry(2,2,10);this.animationParent=new THREE.Mesh(c,a);a=new THREE.Mesh(g,b);a.position.set(0,10,0);this.animation=e(this.animationParent,this.spline,this.id,this.duration);this.animationParent.add(this.object);this.animationParent.add(this.target);this.animationParent.add(a)}else{this.animation=e(this.animationParent,this.spline,this.id,this.duration);this.animationParent.add(this.target);this.animationParent.add(this.object)}if(this.createDebugPath){var a=
this.debugPath,b=this.spline,g=f(b,10),c=f(b,10),h=new THREE.LineBasicMaterial({color:16711680,linewidth:3}),g=new THREE.Line(g,h),c=new THREE.ParticleSystem(c,new THREE.ParticleBasicMaterial({color:16755200,size:3}));g.scale.set(1,1,1);a.add(g);c.scale.set(1,1,1);a.add(c);for(var g=new THREE.SphereGeometry(1,16,8),h=new THREE.MeshBasicMaterial({color:65280}),m=0;m<b.points.length;m++){c=new THREE.Mesh(g,h);c.position.copy(b.points[m]);a.add(c)}}this.domElement.addEventListener("mousemove",d(this,
this.onMouseMove),false)}};THREE.PathControlsIdCounter=0;
THREE.FlyControls=function(b,a){function c(a,b){return function(){b.apply(a,arguments)}}this.object=b;this.domElement=a!==void 0?a:document;a&&this.domElement.setAttribute("tabindex",-1);this.movementSpeed=1;this.rollSpeed=0.005;this.autoForward=this.dragToLook=false;this.object.useQuaternion=true;this.tmpQuaternion=new THREE.Quaternion;this.mouseStatus=0;this.moveState={up:0,down:0,left:0,right:0,forward:0,back:0,pitchUp:0,pitchDown:0,yawLeft:0,yawRight:0,rollLeft:0,rollRight:0};this.moveVector=
new THREE.Vector3(0,0,0);this.rotationVector=new THREE.Vector3(0,0,0);this.handleEvent=function(a){if(typeof this[a.type]=="function")this[a.type](a)};this.keydown=function(a){if(!a.altKey){switch(a.keyCode){case 16:this.movementSpeedMultiplier=0.1;break;case 87:this.moveState.forward=1;break;case 83:this.moveState.back=1;break;case 65:this.moveState.left=1;break;case 68:this.moveState.right=1;break;case 82:this.moveState.up=1;break;case 70:this.moveState.down=1;break;case 38:this.moveState.pitchUp=
1;break;case 40:this.moveState.pitchDown=1;break;case 37:this.moveState.yawLeft=1;break;case 39:this.moveState.yawRight=1;break;case 81:this.moveState.rollLeft=1;break;case 69:this.moveState.rollRight=1}this.updateMovementVector();this.updateRotationVector()}};this.keyup=function(a){switch(a.keyCode){case 16:this.movementSpeedMultiplier=1;break;case 87:this.moveState.forward=0;break;case 83:this.moveState.back=0;break;case 65:this.moveState.left=0;break;case 68:this.moveState.right=0;break;case 82:this.moveState.up=
0;break;case 70:this.moveState.down=0;break;case 38:this.moveState.pitchUp=0;break;case 40:this.moveState.pitchDown=0;break;case 37:this.moveState.yawLeft=0;break;case 39:this.moveState.yawRight=0;break;case 81:this.moveState.rollLeft=0;break;case 69:this.moveState.rollRight=0}this.updateMovementVector();this.updateRotationVector()};this.mousedown=function(a){this.domElement!==document&&this.domElement.focus();a.preventDefault();a.stopPropagation();if(this.dragToLook)this.mouseStatus++;else switch(a.button){case 0:this.object.moveForward=
true;break;case 2:this.object.moveBackward=true}};this.mousemove=function(a){if(!this.dragToLook||this.mouseStatus>0){var b=this.getContainerDimensions(),c=b.size[0]/2,g=b.size[1]/2;this.moveState.yawLeft=-(a.pageX-b.offset[0]-c)/c;this.moveState.pitchDown=(a.pageY-b.offset[1]-g)/g;this.updateRotationVector()}};this.mouseup=function(a){a.preventDefault();a.stopPropagation();if(this.dragToLook){this.mouseStatus--;this.moveState.yawLeft=this.moveState.pitchDown=0}else switch(a.button){case 0:this.moveForward=
false;break;case 2:this.moveBackward=false}this.updateRotationVector()};this.update=function(a){var b=a*this.movementSpeed,a=a*this.rollSpeed;this.object.translateX(this.moveVector.x*b);this.object.translateY(this.moveVector.y*b);this.object.translateZ(this.moveVector.z*b);this.tmpQuaternion.set(this.rotationVector.x*a,this.rotationVector.y*a,this.rotationVector.z*a,1).normalize();this.object.quaternion.multiplySelf(this.tmpQuaternion);this.object.matrix.setPosition(this.object.position);this.object.matrix.setRotationFromQuaternion(this.object.quaternion);
this.object.matrixWorldNeedsUpdate=true};this.updateMovementVector=function(){var a=this.moveState.forward||this.autoForward&&!this.moveState.back?1:0;this.moveVector.x=-this.moveState.left+this.moveState.right;this.moveVector.y=-this.moveState.down+this.moveState.up;this.moveVector.z=-a+this.moveState.back};this.updateRotationVector=function(){this.rotationVector.x=-this.moveState.pitchDown+this.moveState.pitchUp;this.rotationVector.y=-this.moveState.yawRight+this.moveState.yawLeft;this.rotationVector.z=
-this.moveState.rollRight+this.moveState.rollLeft};this.getContainerDimensions=function(){return this.domElement!=document?{size:[this.domElement.offsetWidth,this.domElement.offsetHeight],offset:[this.domElement.offsetLeft,this.domElement.offsetTop]}:{size:[window.innerWidth,window.innerHeight],offset:[0,0]}};this.domElement.addEventListener("mousemove",c(this,this.mousemove),false);this.domElement.addEventListener("mousedown",c(this,this.mousedown),false);this.domElement.addEventListener("mouseup",
c(this,this.mouseup),false);this.domElement.addEventListener("keydown",c(this,this.keydown),false);this.domElement.addEventListener("keyup",c(this,this.keyup),false);this.updateMovementVector();this.updateRotationVector()};
THREE.RollControls=function(b,a){this.object=b;this.domElement=a!==void 0?a:document;this.mouseLook=true;this.autoForward=false;this.rollSpeed=this.movementSpeed=this.lookSpeed=1;this.constrainVertical=[-0.9,0.9];this.object.matrixAutoUpdate=false;this.forward=new THREE.Vector3(0,0,1);this.roll=0;var c=new THREE.Vector3,d=new THREE.Vector3,e=new THREE.Vector3,f=new THREE.Matrix4,g=false,h=1,i=0,j=0,l=0,n=0,k=0,m=window.innerWidth/2,p=window.innerHeight/2;this.update=function(a){if(this.mouseLook){var b=
a*this.lookSpeed;this.rotateHorizontally(b*n);this.rotateVertically(b*k)}b=a*this.movementSpeed;this.object.translateZ(-b*(i>0||this.autoForward&&!(i<0)?1:i));this.object.translateX(b*j);this.object.translateY(b*l);if(g)this.roll=this.roll+this.rollSpeed*a*h;if(this.forward.y>this.constrainVertical[1]){this.forward.y=this.constrainVertical[1];this.forward.normalize()}else if(this.forward.y<this.constrainVertical[0]){this.forward.y=this.constrainVertical[0];this.forward.normalize()}e.copy(this.forward);
d.set(0,1,0);c.cross(d,e).normalize();d.cross(e,c).normalize();this.object.matrix.elements[0]=c.x;this.object.matrix.elements[4]=d.x;this.object.matrix.elements[8]=e.x;this.object.matrix.elements[1]=c.y;this.object.matrix.elements[5]=d.y;this.object.matrix.elements[9]=e.y;this.object.matrix.elements[2]=c.z;this.object.matrix.elements[6]=d.z;this.object.matrix.elements[10]=e.z;f.identity();f.elements[0]=Math.cos(this.roll);f.elements[4]=-Math.sin(this.roll);f.elements[1]=Math.sin(this.roll);f.elements[5]=
Math.cos(this.roll);this.object.matrix.multiplySelf(f);this.object.matrixWorldNeedsUpdate=true;this.object.matrix.elements[12]=this.object.position.x;this.object.matrix.elements[13]=this.object.position.y;this.object.matrix.elements[14]=this.object.position.z};this.translateX=function(a){this.object.position.x=this.object.position.x+this.object.matrix.elements[0]*a;this.object.position.y=this.object.position.y+this.object.matrix.elements[1]*a;this.object.position.z=this.object.position.z+this.object.matrix.elements[2]*
a};this.translateY=function(a){this.object.position.x=this.object.position.x+this.object.matrix.elements[4]*a;this.object.position.y=this.object.position.y+this.object.matrix.elements[5]*a;this.object.position.z=this.object.position.z+this.object.matrix.elements[6]*a};this.translateZ=function(a){this.object.position.x=this.object.position.x-this.object.matrix.elements[8]*a;this.object.position.y=this.object.position.y-this.object.matrix.elements[9]*a;this.object.position.z=this.object.position.z-
this.object.matrix.elements[10]*a};this.rotateHorizontally=function(a){c.set(this.object.matrix.elements[0],this.object.matrix.elements[1],this.object.matrix.elements[2]);c.multiplyScalar(a);this.forward.subSelf(c);this.forward.normalize()};this.rotateVertically=function(a){d.set(this.object.matrix.elements[4],this.object.matrix.elements[5],this.object.matrix.elements[6]);d.multiplyScalar(a);this.forward.addSelf(d);this.forward.normalize()};this.domElement.addEventListener("contextmenu",function(a){a.preventDefault()},
false);this.domElement.addEventListener("mousemove",function(a){n=(a.clientX-m)/window.innerWidth;k=(a.clientY-p)/window.innerHeight},false);this.domElement.addEventListener("mousedown",function(a){a.preventDefault();a.stopPropagation();switch(a.button){case 0:i=1;break;case 2:i=-1}},false);this.domElement.addEventListener("mouseup",function(a){a.preventDefault();a.stopPropagation();switch(a.button){case 0:i=0;break;case 2:i=0}},false);this.domElement.addEventListener("keydown",function(a){switch(a.keyCode){case 38:case 87:i=
1;break;case 37:case 65:j=-1;break;case 40:case 83:i=-1;break;case 39:case 68:j=1;break;case 81:g=true;h=1;break;case 69:g=true;h=-1;break;case 82:l=1;break;case 70:l=-1}},false);this.domElement.addEventListener("keyup",function(a){switch(a.keyCode){case 38:case 87:i=0;break;case 37:case 65:j=0;break;case 40:case 83:i=0;break;case 39:case 68:j=0;break;case 81:g=false;break;case 69:g=false;break;case 82:l=0;break;case 70:l=0}},false)};
THREE.TrackballControls=function(b,a){THREE.EventTarget.call(this);var c=this;this.object=b;this.domElement=a!==void 0?a:document;this.enabled=true;this.screen={width:window.innerWidth,height:window.innerHeight,offsetLeft:0,offsetTop:0};this.radius=(this.screen.width+this.screen.height)/4;this.rotateSpeed=1;this.zoomSpeed=1.2;this.panSpeed=0.3;this.staticMoving=this.noPan=this.noZoom=this.noRotate=false;this.dynamicDampingFactor=0.2;this.minDistance=0;this.maxDistance=Infinity;this.keys=[65,83,68];
this.target=new THREE.Vector3;var d=new THREE.Vector3,e=false,f=-1,g=new THREE.Vector3,h=new THREE.Vector3,i=new THREE.Vector3,j=new THREE.Vector2,l=new THREE.Vector2,n=new THREE.Vector2,k=new THREE.Vector2,m={type:"change"};this.handleEvent=function(a){if(typeof this[a.type]=="function")this[a.type](a)};this.getMouseOnScreen=function(a,b){return new THREE.Vector2((a-c.screen.offsetLeft)/c.radius*0.5,(b-c.screen.offsetTop)/c.radius*0.5)};this.getMouseProjectionOnBall=function(a,b){var d=new THREE.Vector3((a-
c.screen.width*0.5-c.screen.offsetLeft)/c.radius,(c.screen.height*0.5+c.screen.offsetTop-b)/c.radius,0),e=d.length();e>1?d.normalize():d.z=Math.sqrt(1-e*e);g.copy(c.object.position).subSelf(c.target);e=c.object.up.clone().setLength(d.y);e.addSelf(c.object.up.clone().crossSelf(g).setLength(d.x));e.addSelf(g.setLength(d.z));return e};this.rotateCamera=function(){var a=Math.acos(h.dot(i)/h.length()/i.length());if(a){var b=(new THREE.Vector3).cross(h,i).normalize(),d=new THREE.Quaternion,a=a*c.rotateSpeed;
d.setFromAxisAngle(b,-a);d.multiplyVector3(g);d.multiplyVector3(c.object.up);d.multiplyVector3(i);if(c.staticMoving)h=i;else{d.setFromAxisAngle(b,a*(c.dynamicDampingFactor-1));d.multiplyVector3(h)}}};this.zoomCamera=function(){var a=1+(l.y-j.y)*c.zoomSpeed;if(a!==1&&a>0){g.multiplyScalar(a);c.staticMoving?j=l:j.y=j.y+(l.y-j.y)*this.dynamicDampingFactor}};this.panCamera=function(){var a=k.clone().subSelf(n);if(a.lengthSq()){a.multiplyScalar(g.length()*c.panSpeed);var b=g.clone().crossSelf(c.object.up).setLength(a.x);
b.addSelf(c.object.up.clone().setLength(a.y));c.object.position.addSelf(b);c.target.addSelf(b);c.staticMoving?n=k:n.addSelf(a.sub(k,n).multiplyScalar(c.dynamicDampingFactor))}};this.checkDistances=function(){if(!c.noZoom||!c.noPan){c.object.position.lengthSq()>c.maxDistance*c.maxDistance&&c.object.position.setLength(c.maxDistance);g.lengthSq()<c.minDistance*c.minDistance&&c.object.position.add(c.target,g.setLength(c.minDistance))}};this.update=function(){g.copy(c.object.position).subSelf(c.target);
c.noRotate||c.rotateCamera();c.noZoom||c.zoomCamera();c.noPan||c.panCamera();c.object.position.add(c.target,g);c.checkDistances();c.object.lookAt(c.target);if(d.distanceTo(c.object.position)>0){c.dispatchEvent(m);d.copy(c.object.position)}};this.domElement.addEventListener("contextmenu",function(a){a.preventDefault()},false);this.domElement.addEventListener("mousemove",function(a){if(c.enabled){if(e){h=i=c.getMouseProjectionOnBall(a.clientX,a.clientY);j=l=c.getMouseOnScreen(a.clientX,a.clientY);n=
k=c.getMouseOnScreen(a.clientX,a.clientY);e=false}f!==-1&&(f===0&&!c.noRotate?i=c.getMouseProjectionOnBall(a.clientX,a.clientY):f===1&&!c.noZoom?l=c.getMouseOnScreen(a.clientX,a.clientY):f===2&&!c.noPan&&(k=c.getMouseOnScreen(a.clientX,a.clientY)))}},false);this.domElement.addEventListener("mousedown",function(a){if(c.enabled){a.preventDefault();a.stopPropagation();if(f===-1){f=a.button;f===0&&!c.noRotate?h=i=c.getMouseProjectionOnBall(a.clientX,a.clientY):f===1&&!c.noZoom?j=l=c.getMouseOnScreen(a.clientX,
a.clientY):this.noPan||(n=k=c.getMouseOnScreen(a.clientX,a.clientY))}}},false);this.domElement.addEventListener("mouseup",function(a){if(c.enabled){a.preventDefault();a.stopPropagation();f=-1}},false);window.addEventListener("keydown",function(a){if(c.enabled&&f===-1){a.keyCode===c.keys[0]&&!c.noRotate?f=0:a.keyCode===c.keys[1]&&!c.noZoom?f=1:a.keyCode===c.keys[2]&&!c.noPan&&(f=2);f!==-1&&(e=true)}},false);window.addEventListener("keyup",function(){c.enabled&&f!==-1&&(f=-1)},false)};
THREE.CubeGeometry=function(b,a,c,d,e,f,g,h){function i(a,b,c,g,h,i,k,l){var m,n=d||1,p=e||1,q=h/2,r=i/2,u=j.vertices.length;if(a==="x"&&b==="y"||a==="y"&&b==="x")m="z";else if(a==="x"&&b==="z"||a==="z"&&b==="x"){m="y";p=f||1}else if(a==="z"&&b==="y"||a==="y"&&b==="z"){m="x";n=f||1}var s=n+1,t=p+1,L=h/n,J=i/p,M=new THREE.Vector3;M[m]=k>0?1:-1;for(h=0;h<t;h++)for(i=0;i<s;i++){var y=new THREE.Vector3;y[a]=(i*L-q)*c;y[b]=(h*J-r)*g;y[m]=k;j.vertices.push(y)}for(h=0;h<p;h++)for(i=0;i<n;i++){a=new THREE.Face4(i+
s*h+u,i+s*(h+1)+u,i+1+s*(h+1)+u,i+1+s*h+u);a.normal.copy(M);a.vertexNormals.push(M.clone(),M.clone(),M.clone(),M.clone());a.materialIndex=l;j.faces.push(a);j.faceVertexUvs[0].push([new THREE.UV(i/n,h/p),new THREE.UV(i/n,(h+1)/p),new THREE.UV((i+1)/n,(h+1)/p),new THREE.UV((i+1)/n,h/p)])}}THREE.Geometry.call(this);var j=this,l=b/2,n=a/2,k=c/2,m,p,q,r,u,s;if(g!==void 0){if(g instanceof Array)this.materials=g;else{this.materials=[];for(m=0;m<6;m++)this.materials.push(g)}m=0;r=1;p=2;u=3;q=4;s=5}else this.materials=
[];this.sides={px:true,nx:true,py:true,ny:true,pz:true,nz:true};if(h!=void 0)for(var t in h)this.sides[t]!==void 0&&(this.sides[t]=h[t]);this.sides.px&&i("z","y",-1,-1,c,a,l,m);this.sides.nx&&i("z","y",1,-1,c,a,-l,r);this.sides.py&&i("x","z",1,1,b,c,n,p);this.sides.ny&&i("x","z",1,-1,b,c,-n,u);this.sides.pz&&i("x","y",1,-1,b,a,k,q);this.sides.nz&&i("x","y",-1,-1,b,a,-k,s);this.computeCentroids();this.mergeVertices()};THREE.CubeGeometry.prototype=new THREE.Geometry;
THREE.CubeGeometry.prototype.constructor=THREE.CubeGeometry;
THREE.CylinderGeometry=function(b,a,c,d,e,f){THREE.Geometry.call(this);var b=b!==void 0?b:20,a=a!==void 0?a:20,c=c!==void 0?c:100,g=c/2,d=d||8,e=e||1,h,i,j=[],l=[];for(i=0;i<=e;i++){var n=[],k=[],m=i/e,p=m*(a-b)+b;for(h=0;h<=d;h++){var q=h/d,r=new THREE.Vector3;r.x=p*Math.sin(q*Math.PI*2);r.y=-m*c+g;r.z=p*Math.cos(q*Math.PI*2);this.vertices.push(r);n.push(this.vertices.length-1);k.push(new THREE.UV(q,m))}j.push(n);l.push(k)}for(i=0;i<e;i++)for(h=0;h<d;h++){var c=j[i][h],n=j[i+1][h],k=j[i+1][h+1],
m=j[i][h+1],p=this.vertices[c].clone().setY(0).normalize(),q=this.vertices[n].clone().setY(0).normalize(),r=this.vertices[k].clone().setY(0).normalize(),u=this.vertices[m].clone().setY(0).normalize(),s=l[i][h].clone(),t=l[i+1][h].clone(),o=l[i+1][h+1].clone(),x=l[i][h+1].clone();this.faces.push(new THREE.Face4(c,n,k,m,[p,q,r,u]));this.faceVertexUvs[0].push([s,t,o,x])}if(!f&&b>0){this.vertices.push(new THREE.Vector3(0,g,0));for(h=0;h<d;h++){c=j[0][h];n=j[0][h+1];k=this.vertices.length-1;p=new THREE.Vector3(0,
1,0);q=new THREE.Vector3(0,1,0);r=new THREE.Vector3(0,1,0);s=l[0][h].clone();t=l[0][h+1].clone();o=new THREE.UV(t.u,0);this.faces.push(new THREE.Face3(c,n,k,[p,q,r]));this.faceVertexUvs[0].push([s,t,o])}}if(!f&&a>0){this.vertices.push(new THREE.Vector3(0,-g,0));for(h=0;h<d;h++){c=j[i][h+1];n=j[i][h];k=this.vertices.length-1;p=new THREE.Vector3(0,-1,0);q=new THREE.Vector3(0,-1,0);r=new THREE.Vector3(0,-1,0);s=l[i][h+1].clone();t=l[i][h].clone();o=new THREE.UV(t.u,1);this.faces.push(new THREE.Face3(c,
n,k,[p,q,r]));this.faceVertexUvs[0].push([s,t,o])}}this.computeCentroids();this.computeFaceNormals()};THREE.CylinderGeometry.prototype=new THREE.Geometry;THREE.CylinderGeometry.prototype.constructor=THREE.CylinderGeometry;THREE.ExtrudeGeometry=function(b,a){if(typeof b!=="undefined"){THREE.Geometry.call(this);b=b instanceof Array?b:[b];this.shapebb=b[b.length-1].getBoundingBox();this.addShapeList(b,a);this.computeCentroids();this.computeFaceNormals()}};THREE.ExtrudeGeometry.prototype=new THREE.Geometry;
THREE.ExtrudeGeometry.prototype.constructor=THREE.ExtrudeGeometry;THREE.ExtrudeGeometry.prototype.addShapeList=function(b,a){for(var c=b.length,d=0;d<c;d++)this.addShape(b[d],a)};
THREE.ExtrudeGeometry.prototype.addShape=function(b,a){function c(a,b,c){b||console.log("die");return b.clone().multiplyScalar(c).addSelf(a)}function d(a,b,c){var d=THREE.ExtrudeGeometry.__v1,e=THREE.ExtrudeGeometry.__v2,f=THREE.ExtrudeGeometry.__v3,g=THREE.ExtrudeGeometry.__v4,h=THREE.ExtrudeGeometry.__v5,i=THREE.ExtrudeGeometry.__v6;d.set(a.x-b.x,a.y-b.y);e.set(a.x-c.x,a.y-c.y);d=d.normalize();e=e.normalize();f.set(-d.y,d.x);g.set(e.y,-e.x);h.copy(a).addSelf(f);i.copy(a).addSelf(g);if(h.equals(i))return g.clone();
h.copy(b).addSelf(f);i.copy(c).addSelf(g);f=d.dot(g);g=i.subSelf(h).dot(g);if(f===0){console.log("Either infinite or no solutions!");g===0?console.log("Its finite solutions."):console.log("Too bad, no solutions.")}g=g/f;if(g<0){b=Math.atan2(b.y-a.y,b.x-a.x);a=Math.atan2(c.y-a.y,c.x-a.x);b>a&&(a=a+Math.PI*2);c=(b+a)/2;a=-Math.cos(c);c=-Math.sin(c);a=new THREE.Vector2(a,c)}else a=d.multiplyScalar(g).addSelf(h).subSelf(a).clone();return a}function e(c,d){var e,f;for(y=c.length;--y>=0;){e=y;f=y-1;f<0&&
(f=c.length-1);for(var g=0,h=k+l*2,g=0;g<h;g++){var i=L*g,j=L*(g+1),m=d+e+i,i=d+f+i,n=d+f+j,j=d+e+j,p=c,q=g,o=h,m=m+C,i=i+C,n=n+C,j=j+C;F.faces.push(new THREE.Face4(m,i,n,j,null,null,s));m=Q.generateSideWallUV(F,b,p,a,m,i,n,j,q,o);F.faceVertexUvs[0].push(m)}}}function f(a,b,c){F.vertices.push(new THREE.Vector3(a,b,c))}function g(c,d,e,f){c=c+C;d=d+C;e=e+C;F.faces.push(new THREE.Face3(c,d,e,null,null,u));c=f?Q.generateBottomUV(F,b,a,c,d,e):Q.generateTopUV(F,b,a,c,d,e);F.faceVertexUvs[0].push(c)}var h=
a.amount!==void 0?a.amount:100,i=a.bevelThickness!==void 0?a.bevelThickness:6,j=a.bevelSize!==void 0?a.bevelSize:i-2,l=a.bevelSegments!==void 0?a.bevelSegments:3,n=a.bevelEnabled!==void 0?a.bevelEnabled:true,k=a.steps!==void 0?a.steps:1,m=a.bendPath,p=a.extrudePath,q,r=false,u=a.material,s=a.extrudeMaterial,t,o,x,z;if(p){q=p.getSpacedPoints(k);r=true;n=false;t=new THREE.TubeGeometry.FrenetFrames(p,k,false);o=new THREE.Vector3;x=new THREE.Vector3;z=new THREE.Vector3}if(!n)j=i=l=0;var A,v,w,F=this,
C=this.vertices.length;m&&b.addWrapPath(m);var p=b.extractPoints(),m=p.shape,B=p.holes;if(p=!THREE.Shape.Utils.isClockWise(m)){m=m.reverse();v=0;for(w=B.length;v<w;v++){A=B[v];THREE.Shape.Utils.isClockWise(A)&&(B[v]=A.reverse())}p=false}var I=THREE.Shape.Utils.triangulateShape(m,B),K=m;v=0;for(w=B.length;v<w;v++){A=B[v];m=m.concat(A)}var E,D,G,N,H,L=m.length,J,M=I.length,p=[],y=0;G=K.length;E=G-1;for(D=y+1;y<G;y++,E++,D++){E===G&&(E=0);D===G&&(D=0);p[y]=d(K[y],K[E],K[D])}var R=[],O,P=p.concat();v=
0;for(w=B.length;v<w;v++){A=B[v];O=[];y=0;G=A.length;E=G-1;for(D=y+1;y<G;y++,E++,D++){E===G&&(E=0);D===G&&(D=0);O[y]=d(A[y],A[E],A[D])}R.push(O);P=P.concat(O)}for(E=0;E<l;E++){G=E/l;N=i*(1-G);D=j*Math.sin(G*Math.PI/2);y=0;for(G=K.length;y<G;y++){H=c(K[y],p[y],D);f(H.x,H.y,-N)}v=0;for(w=B.length;v<w;v++){A=B[v];O=R[v];y=0;for(G=A.length;y<G;y++){H=c(A[y],O[y],D);f(H.x,H.y,-N)}}}D=j;for(y=0;y<L;y++){H=n?c(m[y],P[y],D):m[y];if(r){x.copy(t.normals[0]).multiplyScalar(H.x);o.copy(t.binormals[0]).multiplyScalar(H.y);
z.copy(q[0]).addSelf(x).addSelf(o);f(z.x,z.y,z.z)}else f(H.x,H.y,0)}for(G=1;G<=k;G++)for(y=0;y<L;y++){H=n?c(m[y],P[y],D):m[y];if(r){x.copy(t.normals[G]).multiplyScalar(H.x);o.copy(t.binormals[G]).multiplyScalar(H.y);z.copy(q[G]).addSelf(x).addSelf(o);f(z.x,z.y,z.z)}else f(H.x,H.y,h/k*G)}for(E=l-1;E>=0;E--){G=E/l;N=i*(1-G);D=j*Math.sin(G*Math.PI/2);y=0;for(G=K.length;y<G;y++){H=c(K[y],p[y],D);f(H.x,H.y,h+N)}v=0;for(w=B.length;v<w;v++){A=B[v];O=R[v];y=0;for(G=A.length;y<G;y++){H=c(A[y],O[y],D);r?f(H.x,
H.y+q[k-1].y,q[k-1].x+N):f(H.x,H.y,h+N)}}}var Q=THREE.ExtrudeGeometry.WorldUVGenerator;(function(){if(n){var a;a=L*0;for(y=0;y<M;y++){J=I[y];g(J[2]+a,J[1]+a,J[0]+a,true)}a=k+l*2;a=L*a;for(y=0;y<M;y++){J=I[y];g(J[0]+a,J[1]+a,J[2]+a,false)}}else{for(y=0;y<M;y++){J=I[y];g(J[2],J[1],J[0],true)}for(y=0;y<M;y++){J=I[y];g(J[0]+L*k,J[1]+L*k,J[2]+L*k,false)}}})();(function(){var a=0;e(K,a);a=a+K.length;v=0;for(w=B.length;v<w;v++){A=B[v];e(A,a);a=a+A.length}})()};
THREE.ExtrudeGeometry.WorldUVGenerator={generateTopUV:function(b,a,c,d,e,f){a=b.vertices[e].x;e=b.vertices[e].y;c=b.vertices[f].x;f=b.vertices[f].y;return[new THREE.UV(b.vertices[d].x,1-b.vertices[d].y),new THREE.UV(a,1-e),new THREE.UV(c,1-f)]},generateBottomUV:function(b,a,c,d,e,f){return this.generateTopUV(b,a,c,d,e,f)},generateSideWallUV:function(b,a,c,d,e,f,g,h){var a=b.vertices[e].x,c=b.vertices[e].y,e=b.vertices[e].z,d=b.vertices[f].x,i=b.vertices[f].y,f=b.vertices[f].z,j=b.vertices[g].x,l=
b.vertices[g].y,g=b.vertices[g].z,n=b.vertices[h].x,k=b.vertices[h].y,b=b.vertices[h].z;return Math.abs(c-i)<0.01?[new THREE.UV(a,e),new THREE.UV(d,f),new THREE.UV(j,g),new THREE.UV(n,b)]:[new THREE.UV(c,e),new THREE.UV(i,f),new THREE.UV(l,g),new THREE.UV(k,b)]}};THREE.ExtrudeGeometry.__v1=new THREE.Vector2;THREE.ExtrudeGeometry.__v2=new THREE.Vector2;THREE.ExtrudeGeometry.__v3=new THREE.Vector2;THREE.ExtrudeGeometry.__v4=new THREE.Vector2;THREE.ExtrudeGeometry.__v5=new THREE.Vector2;
THREE.ExtrudeGeometry.__v6=new THREE.Vector2;
THREE.LatheGeometry=function(b,a,c){THREE.Geometry.call(this);for(var a=a||12,c=c||2*Math.PI,d=[],e=(new THREE.Matrix4).makeRotationZ(c/a),f=0;f<b.length;f++){d[f]=b[f].clone();this.vertices.push(d[f])}for(var g=a+1,c=0;c<g;c++)for(f=0;f<d.length;f++){d[f]=e.multiplyVector3(d[f].clone());this.vertices.push(d[f])}for(c=0;c<a;c++){d=0;for(e=b.length;d<e-1;d++){this.faces.push(new THREE.Face4(c*e+d,(c+1)%g*e+d,(c+1)%g*e+(d+1)%e,c*e+(d+1)%e));this.faceVertexUvs[0].push([new THREE.UV(1-c/a,d/e),new THREE.UV(1-
(c+1)/a,d/e),new THREE.UV(1-(c+1)/a,(d+1)/e),new THREE.UV(1-c/a,(d+1)/e)])}}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.LatheGeometry.prototype=new THREE.Geometry;THREE.LatheGeometry.prototype.constructor=THREE.LatheGeometry;
THREE.PlaneGeometry=function(b,a,c,d){THREE.Geometry.call(this);for(var e=b/2,f=a/2,c=c||1,d=d||1,g=c+1,h=d+1,i=b/c,j=a/d,l=new THREE.Vector3(0,1,0),b=0;b<h;b++)for(a=0;a<g;a++)this.vertices.push(new THREE.Vector3(a*i-e,0,b*j-f));for(b=0;b<d;b++)for(a=0;a<c;a++){e=new THREE.Face4(a+g*b,a+g*(b+1),a+1+g*(b+1),a+1+g*b);e.normal.copy(l);e.vertexNormals.push(l.clone(),l.clone(),l.clone(),l.clone());this.faces.push(e);this.faceVertexUvs[0].push([new THREE.UV(a/c,b/d),new THREE.UV(a/c,(b+1)/d),new THREE.UV((a+
1)/c,(b+1)/d),new THREE.UV((a+1)/c,b/d)])}this.computeCentroids()};THREE.PlaneGeometry.prototype=new THREE.Geometry;THREE.PlaneGeometry.prototype.constructor=THREE.PlaneGeometry;
THREE.SphereGeometry=function(b,a,c,d,e,f,g){THREE.Geometry.call(this);var b=b||50,d=d!==void 0?d:0,e=e!==void 0?e:Math.PI*2,f=f!==void 0?f:0,g=g!==void 0?g:Math.PI,a=Math.max(3,Math.floor(a)||8),c=Math.max(2,Math.floor(c)||6),h,i,j=[],l=[];for(i=0;i<=c;i++){var n=[],k=[];for(h=0;h<=a;h++){var m=h/a,p=i/c,q=new THREE.Vector3;q.x=-b*Math.cos(d+m*e)*Math.sin(f+p*g);q.y=b*Math.cos(f+p*g);q.z=b*Math.sin(d+m*e)*Math.sin(f+p*g);this.vertices.push(q);n.push(this.vertices.length-1);k.push(new THREE.UV(m,
p))}j.push(n);l.push(k)}for(i=0;i<c;i++)for(h=0;h<a;h++){var d=j[i][h+1],e=j[i][h],f=j[i+1][h],g=j[i+1][h+1],n=this.vertices[d].clone().normalize(),k=this.vertices[e].clone().normalize(),m=this.vertices[f].clone().normalize(),p=this.vertices[g].clone().normalize(),q=l[i][h+1].clone(),r=l[i][h].clone(),u=l[i+1][h].clone(),s=l[i+1][h+1].clone();if(Math.abs(this.vertices[d].y)==b){this.faces.push(new THREE.Face3(d,f,g,[n,m,p]));this.faceVertexUvs[0].push([q,u,s])}else if(Math.abs(this.vertices[f].y)==
b){this.faces.push(new THREE.Face3(d,e,f,[n,k,m]));this.faceVertexUvs[0].push([q,r,u])}else{this.faces.push(new THREE.Face4(d,e,f,g,[n,k,m,p]));this.faceVertexUvs[0].push([q,r,u,s])}}this.computeCentroids();this.computeFaceNormals();this.boundingSphere={radius:b}};THREE.SphereGeometry.prototype=new THREE.Geometry;THREE.SphereGeometry.prototype.constructor=THREE.SphereGeometry;
THREE.TextGeometry=function(b,a){var c=(new THREE.TextPath(b,a)).toShapes();a.amount=a.height!==void 0?a.height:50;if(a.bevelThickness===void 0)a.bevelThickness=10;if(a.bevelSize===void 0)a.bevelSize=8;if(a.bevelEnabled===void 0)a.bevelEnabled=false;if(a.bend){var d=c[c.length-1].getBoundingBox().maxX;a.bendPath=new THREE.QuadraticBezierCurve(new THREE.Vector2(0,0),new THREE.Vector2(d/2,120),new THREE.Vector2(d,0))}THREE.ExtrudeGeometry.call(this,c,a)};THREE.TextGeometry.prototype=new THREE.ExtrudeGeometry;
THREE.TextGeometry.prototype.constructor=THREE.TextGeometry;
THREE.FontUtils={faces:{},face:"helvetiker",weight:"normal",style:"normal",size:150,divisions:10,getFace:function(){return this.faces[this.face][this.weight][this.style]},loadFace:function(b){var a=b.familyName.toLowerCase();this.faces[a]=this.faces[a]||{};this.faces[a][b.cssFontWeight]=this.faces[a][b.cssFontWeight]||{};this.faces[a][b.cssFontWeight][b.cssFontStyle]=b;return this.faces[a][b.cssFontWeight][b.cssFontStyle]=b},drawText:function(b){for(var a=this.getFace(),c=this.size/a.resolution,d=
0,e=(""+b).split(""),f=e.length,g=[],b=0;b<f;b++){var h=new THREE.Path,h=this.extractGlyphPoints(e[b],a,c,d,h),d=d+h.offset;g.push(h.path)}return{paths:g,offset:d/2}},extractGlyphPoints:function(b,a,c,d,e){var f=[],g,h,i,j,l,n,k,m,p,q,r,u=a.glyphs[b]||a.glyphs["?"];if(u){if(u.o){a=u._cachedOutline||(u._cachedOutline=u.o.split(" "));j=a.length;for(b=0;b<j;){i=a[b++];switch(i){case "m":i=a[b++]*c+d;l=a[b++]*c;f.push(new THREE.Vector2(i,l));e.moveTo(i,l);break;case "l":i=a[b++]*c+d;l=a[b++]*c;f.push(new THREE.Vector2(i,
l));e.lineTo(i,l);break;case "q":i=a[b++]*c+d;l=a[b++]*c;m=a[b++]*c+d;p=a[b++]*c;e.quadraticCurveTo(m,p,i,l);if(g=f[f.length-1]){n=g.x;k=g.y;g=1;for(h=this.divisions;g<=h;g++){var s=g/h,t=THREE.Shape.Utils.b2(s,n,m,i),s=THREE.Shape.Utils.b2(s,k,p,l);f.push(new THREE.Vector2(t,s))}}break;case "b":i=a[b++]*c+d;l=a[b++]*c;m=a[b++]*c+d;p=a[b++]*-c;q=a[b++]*c+d;r=a[b++]*-c;e.bezierCurveTo(i,l,m,p,q,r);if(g=f[f.length-1]){n=g.x;k=g.y;g=1;for(h=this.divisions;g<=h;g++){s=g/h;t=THREE.Shape.Utils.b3(s,n,m,
q,i);s=THREE.Shape.Utils.b3(s,k,p,r,l);f.push(new THREE.Vector2(t,s))}}}}}return{offset:u.ha*c,points:f,path:e}}}};
(function(b){var a=function(a){for(var b=a.length,e=0,f=b-1,g=0;g<b;f=g++)e=e+(a[f].x*a[g].y-a[g].x*a[f].y);return e*0.5};b.Triangulate=function(b,d){var e=b.length;if(e<3)return null;var f=[],g=[],h=[],i,j,l;if(a(b)>0)for(j=0;j<e;j++)g[j]=j;else for(j=0;j<e;j++)g[j]=e-1-j;var n=2*e;for(j=e-1;e>2;){if(n--<=0){console.log("Warning, unable to triangulate polygon!");break}i=j;e<=i&&(i=0);j=i+1;e<=j&&(j=0);l=j+1;e<=l&&(l=0);var k;a:{k=b;var m=i,p=j,q=l,r=e,u=g,s=void 0,t=void 0,o=void 0,x=void 0,z=void 0,
A=void 0,v=void 0,w=void 0,F=void 0,t=k[u[m]].x,o=k[u[m]].y,x=k[u[p]].x,z=k[u[p]].y,A=k[u[q]].x,v=k[u[q]].y;if(1.0E-10>(x-t)*(v-o)-(z-o)*(A-t))k=false;else{for(s=0;s<r;s++)if(!(s==m||s==p||s==q)){var w=k[u[s]].x,F=k[u[s]].y,C=void 0,B=void 0,I=void 0,K=void 0,E=void 0,D=void 0,G=void 0,N=void 0,H=void 0,L=void 0,J=void 0,M=void 0,C=I=E=void 0,C=A-x,B=v-z,I=t-A,K=o-v,E=x-t,D=z-o,G=w-t,N=F-o,H=w-x,L=F-z,J=w-A,M=F-v,C=C*L-B*H,E=E*N-D*G,I=I*M-K*J;if(C>=0&&I>=0&&E>=0){k=false;break a}}k=true}}if(k){f.push([b[g[i]],
b[g[j]],b[g[l]]]);h.push([g[i],g[j],g[l]]);i=j;for(l=j+1;l<e;i++,l++)g[i]=g[l];e--;n=2*e}}return d?h:f};b.Triangulate.area=a;return b})(THREE.FontUtils);self._typeface_js={faces:THREE.FontUtils.faces,loadFace:THREE.FontUtils.loadFace};
THREE.TorusGeometry=function(b,a,c,d,e){THREE.Geometry.call(this);this.radius=b||100;this.tube=a||40;this.segmentsR=c||8;this.segmentsT=d||6;this.arc=e||Math.PI*2;e=new THREE.Vector3;b=[];a=[];for(c=0;c<=this.segmentsR;c++)for(d=0;d<=this.segmentsT;d++){var f=d/this.segmentsT*this.arc,g=c/this.segmentsR*Math.PI*2;e.x=this.radius*Math.cos(f);e.y=this.radius*Math.sin(f);var h=new THREE.Vector3;h.x=(this.radius+this.tube*Math.cos(g))*Math.cos(f);h.y=(this.radius+this.tube*Math.cos(g))*Math.sin(f);h.z=
this.tube*Math.sin(g);this.vertices.push(h);b.push(new THREE.UV(d/this.segmentsT,1-c/this.segmentsR));a.push(h.clone().subSelf(e).normalize())}for(c=1;c<=this.segmentsR;c++)for(d=1;d<=this.segmentsT;d++){var e=(this.segmentsT+1)*c+d-1,f=(this.segmentsT+1)*(c-1)+d-1,g=(this.segmentsT+1)*(c-1)+d,h=(this.segmentsT+1)*c+d,i=new THREE.Face4(e,f,g,h,[a[e],a[f],a[g],a[h]]);i.normal.addSelf(a[e]);i.normal.addSelf(a[f]);i.normal.addSelf(a[g]);i.normal.addSelf(a[h]);i.normal.normalize();this.faces.push(i);
this.faceVertexUvs[0].push([b[e].clone(),b[f].clone(),b[g].clone(),b[h].clone()])}this.computeCentroids()};THREE.TorusGeometry.prototype=new THREE.Geometry;THREE.TorusGeometry.prototype.constructor=THREE.TorusGeometry;
THREE.TorusKnotGeometry=function(b,a,c,d,e,f,g){function h(a,b,c,d,e,f){var g=Math.cos(a);Math.cos(b);b=Math.sin(a);a=c/d*a;c=Math.cos(a);g=e*(2+c)*0.5*g;b=e*(2+c)*b*0.5;e=f*e*Math.sin(a)*0.5;return new THREE.Vector3(g,b,e)}THREE.Geometry.call(this);this.radius=b||200;this.tube=a||40;this.segmentsR=c||64;this.segmentsT=d||8;this.p=e||2;this.q=f||3;this.heightScale=g||1;this.grid=Array(this.segmentsR);c=new THREE.Vector3;d=new THREE.Vector3;e=new THREE.Vector3;for(b=0;b<this.segmentsR;++b){this.grid[b]=
Array(this.segmentsT);for(a=0;a<this.segmentsT;++a){var i=b/this.segmentsR*2*this.p*Math.PI,g=a/this.segmentsT*2*Math.PI,f=h(i,g,this.q,this.p,this.radius,this.heightScale),i=h(i+0.01,g,this.q,this.p,this.radius,this.heightScale);c.sub(i,f);d.add(i,f);e.cross(c,d);d.cross(e,c);e.normalize();d.normalize();i=-this.tube*Math.cos(g);g=this.tube*Math.sin(g);f.x=f.x+(i*d.x+g*e.x);f.y=f.y+(i*d.y+g*e.y);f.z=f.z+(i*d.z+g*e.z);this.grid[b][a]=this.vertices.push(new THREE.Vector3(f.x,f.y,f.z))-1}}for(b=0;b<
this.segmentsR;++b)for(a=0;a<this.segmentsT;++a){var e=(b+1)%this.segmentsR,f=(a+1)%this.segmentsT,c=this.grid[b][a],d=this.grid[e][a],e=this.grid[e][f],f=this.grid[b][f],g=new THREE.UV(b/this.segmentsR,a/this.segmentsT),i=new THREE.UV((b+1)/this.segmentsR,a/this.segmentsT),j=new THREE.UV((b+1)/this.segmentsR,(a+1)/this.segmentsT),l=new THREE.UV(b/this.segmentsR,(a+1)/this.segmentsT);this.faces.push(new THREE.Face4(c,d,e,f));this.faceVertexUvs[0].push([g,i,j,l])}this.computeCentroids();this.computeFaceNormals();
this.computeVertexNormals()};THREE.TorusKnotGeometry.prototype=new THREE.Geometry;THREE.TorusKnotGeometry.prototype.constructor=THREE.TorusKnotGeometry;
THREE.TubeGeometry=function(b,a,c,d,e,f){THREE.Geometry.call(this);this.path=b;this.segments=a||64;this.radius=c||1;this.segmentsRadius=d||8;this.closed=e||false;if(f)this.debug=new THREE.Object3D;this.grid=[];var g,h,f=this.segments+1,i,j,l,n=new THREE.Vector3,k,m,p,a=new THREE.TubeGeometry.FrenetFrames(b,a,e);k=a.tangents;m=a.normals;p=a.binormals;this.tangents=k;this.normals=m;this.binormals=p;for(a=0;a<f;a++){this.grid[a]=[];d=a/(f-1);l=b.getPointAt(d);d=k[a];g=m[a];h=p[a];if(this.debug){this.debug.add(new THREE.ArrowHelper(d,
l,c,255));this.debug.add(new THREE.ArrowHelper(g,l,c,16711680));this.debug.add(new THREE.ArrowHelper(h,l,c,65280))}for(d=0;d<this.segmentsRadius;d++){i=d/this.segmentsRadius*2*Math.PI;j=-this.radius*Math.cos(i);i=this.radius*Math.sin(i);n.copy(l);n.x=n.x+(j*g.x+i*h.x);n.y=n.y+(j*g.y+i*h.y);n.z=n.z+(j*g.z+i*h.z);this.grid[a][d]=this.vertices.push(new THREE.Vector3(n.x,n.y,n.z))-1}}for(a=0;a<this.segments;a++)for(d=0;d<this.segmentsRadius;d++){f=e?(a+1)%this.segments:a+1;n=(d+1)%this.segmentsRadius;
b=this.grid[a][d];c=this.grid[f][d];f=this.grid[f][n];n=this.grid[a][n];k=new THREE.UV(a/this.segments,d/this.segmentsRadius);m=new THREE.UV((a+1)/this.segments,d/this.segmentsRadius);p=new THREE.UV((a+1)/this.segments,(d+1)/this.segmentsRadius);g=new THREE.UV(a/this.segments,(d+1)/this.segmentsRadius);this.faces.push(new THREE.Face4(b,c,f,n));this.faceVertexUvs[0].push([k,m,p,g])}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.TubeGeometry.prototype=new THREE.Geometry;
THREE.TubeGeometry.prototype.constructor=THREE.TubeGeometry;
THREE.TubeGeometry.FrenetFrames=function(b,a,c){new THREE.Vector3;var d=new THREE.Vector3;new THREE.Vector3;var e=[],f=[],g=[],h=new THREE.Vector3,i=new THREE.Matrix4,a=a+1,j,l,n;this.tangents=e;this.normals=f;this.binormals=g;for(j=0;j<a;j++){l=j/(a-1);e[j]=b.getTangentAt(l);e[j].normalize()}f[0]=new THREE.Vector3;g[0]=new THREE.Vector3;b=Number.MAX_VALUE;j=Math.abs(e[0].x);l=Math.abs(e[0].y);n=Math.abs(e[0].z);if(j<=b){b=j;d.set(1,0,0)}if(l<=b){b=l;d.set(0,1,0)}n<=b&&d.set(0,0,1);h.cross(e[0],d).normalize();
f[0].cross(e[0],h);g[0].cross(e[0],f[0]);for(j=1;j<a;j++){f[j]=f[j-1].clone();g[j]=g[j-1].clone();h.cross(e[j-1],e[j]);if(h.length()>1.0E-4){h.normalize();d=Math.acos(e[j-1].dot(e[j]));i.makeRotationAxis(h,d).multiplyVector3(f[j])}g[j].cross(e[j],f[j])}if(c){d=Math.acos(f[0].dot(f[a-1]));d=d/(a-1);e[0].dot(h.cross(f[0],f[a-1]))>0&&(d=-d);for(j=1;j<a;j++){i.makeRotationAxis(e[j],d*j).multiplyVector3(f[j]);g[j].cross(e[j],f[j])}}};
THREE.PolyhedronGeometry=function(b,a,c,d){function e(a){var b=a.normalize().clone();b.index=i.vertices.push(b)-1;var c=Math.atan2(a.z,-a.x)/2/Math.PI+0.5,a=Math.atan2(-a.y,Math.sqrt(a.x*a.x+a.z*a.z))/Math.PI+0.5;b.uv=new THREE.UV(c,a);return b}function f(a,b,c,d){if(d<1){d=new THREE.Face3(a.index,b.index,c.index,[a.clone(),b.clone(),c.clone()]);d.centroid.addSelf(a).addSelf(b).addSelf(c).divideScalar(3);d.normal=d.centroid.clone().normalize();i.faces.push(d);d=Math.atan2(d.centroid.z,-d.centroid.x);
i.faceVertexUvs[0].push([h(a.uv,a,d),h(b.uv,b,d),h(c.uv,c,d)])}else{d=d-1;f(a,g(a,b),g(a,c),d);f(g(a,b),b,g(b,c),d);f(g(a,c),g(b,c),c,d);f(g(a,b),g(b,c),g(a,c),d)}}function g(a,b){n[a.index]||(n[a.index]=[]);n[b.index]||(n[b.index]=[]);var c=n[a.index][b.index];c===void 0&&(n[a.index][b.index]=n[b.index][a.index]=c=e((new THREE.Vector3).add(a,b).divideScalar(2)));return c}function h(a,b,c){c<0&&a.u===1&&(a=new THREE.UV(a.u-1,a.v));b.x===0&&b.z===0&&(a=new THREE.UV(c/2/Math.PI+0.5,a.v));return a}THREE.Geometry.call(this);
for(var c=c||1,d=d||0,i=this,j=0,l=b.length;j<l;j++)e(new THREE.Vector3(b[j][0],b[j][1],b[j][2]));for(var n=[],b=this.vertices,j=0,l=a.length;j<l;j++)f(b[a[j][0]],b[a[j][1]],b[a[j][2]],d);this.mergeVertices();j=0;for(l=this.vertices.length;j<l;j++)this.vertices[j].multiplyScalar(c);this.computeCentroids();this.boundingSphere={radius:c}};THREE.PolyhedronGeometry.prototype=new THREE.Geometry;THREE.PolyhedronGeometry.prototype.constructor=THREE.PolyhedronGeometry;
THREE.IcosahedronGeometry=function(b,a){var c=(1+Math.sqrt(5))/2;THREE.PolyhedronGeometry.call(this,[[-1,c,0],[1,c,0],[-1,-c,0],[1,-c,0],[0,-1,c],[0,1,c],[0,-1,-c],[0,1,-c],[c,0,-1],[c,0,1],[-c,0,-1],[-c,0,1]],[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],b,a)};THREE.IcosahedronGeometry.prototype=new THREE.Geometry;THREE.IcosahedronGeometry.prototype.constructor=THREE.IcosahedronGeometry;
THREE.OctahedronGeometry=function(b,a){THREE.PolyhedronGeometry.call(this,[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],[[0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,2,5],[1,5,3],[1,3,4],[1,4,2]],b,a)};THREE.OctahedronGeometry.prototype=new THREE.Geometry;THREE.OctahedronGeometry.prototype.constructor=THREE.OctahedronGeometry;THREE.TetrahedronGeometry=function(b,a){THREE.PolyhedronGeometry.call(this,[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],[[2,1,0],[0,3,2],[1,3,0],[2,3,1]],b,a)};
THREE.TetrahedronGeometry.prototype=new THREE.Geometry;THREE.TetrahedronGeometry.prototype.constructor=THREE.TetrahedronGeometry;
THREE.ParametricGeometry=function(b,a,c){THREE.Geometry.call(this);var d=this.vertices,e=this.faces,f=this.faceVertexUvs[0],g,h,i,j,l=a+1;for(g=0;g<=a;g++){j=g/a;for(h=0;h<=b;h++){i=h/b;i=c(i,j);d.push(i)}}var n,k,m,p;for(g=0;g<a;g++)for(h=0;h<b;h++){c=g*l+h;d=g*l+h+1;j=(g+1)*l+h;i=(g+1)*l+h+1;n=new THREE.UV(g/b,h/a);k=new THREE.UV(g/b,(h+1)/a);m=new THREE.UV((g+1)/b,h/a);p=new THREE.UV((g+1)/b,(h+1)/a);e.push(new THREE.Face3(c,d,j));e.push(new THREE.Face3(d,i,j));f.push([n,k,m]);f.push([k,p,m])}console.log(this);
b=this.mergeVertices();console.log("removed ",b," vertices by merging");this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.ParametricGeometry.prototype=new THREE.Geometry;THREE.ParametricGeometry.prototype.constructor=THREE.ParametricGeometry;
THREE.AxisHelper=function(){THREE.Object3D.call(this);var b=new THREE.Geometry;b.vertices.push(new THREE.Vector3);b.vertices.push(new THREE.Vector3(0,100,0));var a=new THREE.CylinderGeometry(0,5,25,5,1),c;c=new THREE.Line(b,new THREE.LineBasicMaterial({color:16711680}));c.rotation.z=-Math.PI/2;this.add(c);c=new THREE.Mesh(a,new THREE.MeshBasicMaterial({color:16711680}));c.position.x=100;c.rotation.z=-Math.PI/2;this.add(c);c=new THREE.Line(b,new THREE.LineBasicMaterial({color:65280}));this.add(c);
c=new THREE.Mesh(a,new THREE.MeshBasicMaterial({color:65280}));c.position.y=100;this.add(c);c=new THREE.Line(b,new THREE.LineBasicMaterial({color:255}));c.rotation.x=Math.PI/2;this.add(c);c=new THREE.Mesh(a,new THREE.MeshBasicMaterial({color:255}));c.position.z=100;c.rotation.x=Math.PI/2;this.add(c)};THREE.AxisHelper.prototype=new THREE.Object3D;THREE.AxisHelper.prototype.constructor=THREE.AxisHelper;
THREE.ArrowHelper=function(b,a,c,d){THREE.Object3D.call(this);d===void 0&&(d=16776960);c===void 0&&(c=20);var e=new THREE.Geometry;e.vertices.push(new THREE.Vector3(0,0,0));e.vertices.push(new THREE.Vector3(0,1,0));this.line=new THREE.Line(e,new THREE.LineBasicMaterial({color:d}));this.add(this.line);e=new THREE.CylinderGeometry(0,0.05,0.25,5,1);this.cone=new THREE.Mesh(e,new THREE.MeshBasicMaterial({color:d}));this.cone.position.set(0,1,0);this.add(this.cone);if(a instanceof THREE.Vector3)this.position=
a;this.setDirection(b);this.setLength(c)};THREE.ArrowHelper.prototype=new THREE.Object3D;THREE.ArrowHelper.prototype.constructor=THREE.ArrowHelper;THREE.ArrowHelper.prototype.setDirection=function(b){var a=(new THREE.Vector3(0,1,0)).crossSelf(b),b=Math.acos((new THREE.Vector3(0,1,0)).dot(b.clone().normalize()));this.matrix=(new THREE.Matrix4).makeRotationAxis(a.normalize(),b);this.rotation.getRotationFromMatrix(this.matrix,this.scale)};
THREE.ArrowHelper.prototype.setLength=function(b){this.scale.set(b,b,b)};THREE.ArrowHelper.prototype.setColor=function(b){this.line.material.color.setHex(b);this.cone.material.color.setHex(b)};
THREE.CameraHelper=function(b){function a(a,b,d){c(a,d);c(b,d)}function c(a,b){d.lineGeometry.vertices.push(new THREE.Vector3);d.lineGeometry.colors.push(new THREE.Color(b));d.pointMap[a]===void 0&&(d.pointMap[a]=[]);d.pointMap[a].push(d.lineGeometry.vertices.length-1)}THREE.Object3D.call(this);var d=this;this.lineGeometry=new THREE.Geometry;this.lineMaterial=new THREE.LineBasicMaterial({color:16777215,vertexColors:THREE.FaceColors});this.pointMap={};a("n1","n2",16755200);a("n2","n4",16755200);a("n4",
"n3",16755200);a("n3","n1",16755200);a("f1","f2",16755200);a("f2","f4",16755200);a("f4","f3",16755200);a("f3","f1",16755200);a("n1","f1",16755200);a("n2","f2",16755200);a("n3","f3",16755200);a("n4","f4",16755200);a("p","n1",16711680);a("p","n2",16711680);a("p","n3",16711680);a("p","n4",16711680);a("u1","u2",43775);a("u2","u3",43775);a("u3","u1",43775);a("c","t",16777215);a("p","c",3355443);a("cn1","cn2",3355443);a("cn3","cn4",3355443);a("cf1","cf2",3355443);a("cf3","cf4",3355443);this.camera=b;this.update(b);
this.lines=new THREE.Line(this.lineGeometry,this.lineMaterial,THREE.LinePieces);this.add(this.lines)};THREE.CameraHelper.prototype=new THREE.Object3D;THREE.CameraHelper.prototype.constructor=THREE.CameraHelper;
THREE.CameraHelper.prototype.update=function(){function b(b,d,e,f){THREE.CameraHelper.__v.set(d,e,f);THREE.CameraHelper.__projector.unprojectVector(THREE.CameraHelper.__v,THREE.CameraHelper.__c);b=a.pointMap[b];if(b!==void 0){d=0;for(e=b.length;d<e;d++)a.lineGeometry.vertices[b[d]].copy(THREE.CameraHelper.__v)}}var a=this;THREE.CameraHelper.__c.projectionMatrix.copy(this.camera.projectionMatrix);b("c",0,0,-1);b("t",0,0,1);b("n1",-1,-1,-1);b("n2",1,-1,-1);b("n3",-1,1,-1);b("n4",1,1,-1);b("f1",-1,-1,
1);b("f2",1,-1,1);b("f3",-1,1,1);b("f4",1,1,1);b("u1",0.7,1.1,-1);b("u2",-0.7,1.1,-1);b("u3",0,2,-1);b("cf1",-1,0,1);b("cf2",1,0,1);b("cf3",0,-1,1);b("cf4",0,1,1);b("cn1",-1,0,-1);b("cn2",1,0,-1);b("cn3",0,-1,-1);b("cn4",0,1,-1);this.lineGeometry.verticesNeedUpdate=true};THREE.CameraHelper.__projector=new THREE.Projector;THREE.CameraHelper.__v=new THREE.Vector3;THREE.CameraHelper.__c=new THREE.Camera;
THREE.SubdivisionModifier=function(b){this.subdivisions=b===void 0?1:b;this.useOldVertexColors=false;this.supportUVs=true;this.debug=false};THREE.SubdivisionModifier.prototype.constructor=THREE.SubdivisionModifier;THREE.SubdivisionModifier.prototype.modify=function(b){for(var a=this.subdivisions;a-- >0;)this.smooth(b)};
THREE.SubdivisionModifier.prototype.smooth=function(b){function a(){k.debug&&console.log.apply(console,arguments)}function c(){console&&console.log.apply(console,arguments)}function d(b,c,d,e,g,h,i){var j=new THREE.Face4(b,c,d,e,null,g.color,g.material);if(k.useOldVertexColors){j.vertexColors=[];for(var m,p,o,q=0;q<4;q++){o=h[q];m=new THREE.Color;m.setRGB(0,0,0);for(var r=0;r<o.length;r++){p=g.vertexColors[o[r]-1];m.r=m.r+p.r;m.g=m.g+p.g;m.b=m.b+p.b}m.r=m.r/o.length;m.g=m.g/o.length;m.b=m.b/o.length;
j.vertexColors[q]=m}}l.push(j);if(k.supportUVs){g=[f(b,""),f(c,i),f(d,i),f(e,i)];g[0]?g[1]?g[2]?g[3]?n.push(g):a("d :( ",e+":"+i):a("c :( ",d+":"+i):a("b :( ",c+":"+i):a("a :( ",b+":"+i)}}function e(a,b){return Math.min(a,b)+"_"+Math.max(a,b)}function f(b,d){var e=b+":"+d,f=s[e];if(!f){b>=t&&b<t+p.length?a("face pt"):a("edge pt");c("warning, UV not found for",e);return null}return f}function g(a,b,d){var e=a+":"+b;e in s?c("dup vertexNo",a,"oldFaceNo",b,"value",d,"key",e,s[e]):s[e]=d}function h(a,
b){I[a]===void 0&&(I[a]=[]);I[a].push(b)}function i(a,b,c){K[a]===void 0&&(K[a]={});K[a][b]=c}var j=[],l=[],n=[],k=this,m=b.vertices,p=b.faces,j=m.concat(),q=[],r={},u={},s={},t=m.length,o,x,z,A,v,w=b.faceVertexUvs[0],F;a("originalFaces, uvs, originalVerticesLength",p.length,w.length,t);if(k.supportUVs){o=0;for(x=w.length;o<x;o++){z=0;for(A=w[o].length;z<A;z++){F=p[o]["abcd".charAt(z)];g(F,o,w[o][z])}}}if(w.length==0)k.supportUVs=false;o=0;for(v in s)o++;if(!o){k.supportUVs=false;a("no uvs")}a("-- Original Faces + Vertices UVs completed",
s,"vs",w.length);o=0;for(x=p.length;o<x;o++){v=p[o];q.push(v.centroid);j.push(v.centroid);if(k.supportUVs){w=new THREE.UV;if(v instanceof THREE.Face3){w.u=f(v.a,o).u+f(v.b,o).u+f(v.c,o).u;w.v=f(v.a,o).v+f(v.b,o).v+f(v.c,o).v;w.u=w.u/3;w.v=w.v/3}else if(v instanceof THREE.Face4){w.u=f(v.a,o).u+f(v.b,o).u+f(v.c,o).u+f(v.d,o).u;w.v=f(v.a,o).v+f(v.b,o).v+f(v.c,o).v+f(v.d,o).v;w.u=w.u/4;w.v=w.v/4}g(t+o,"",w)}}a("-- added UVs for new Faces",s);x=function(a){function b(a,c){h[a]===void 0&&(h[a]=[]);h[a].push(c)}
var c,d,f,g,h={};c=0;for(d=a.faces.length;c<d;c++){f=a.faces[c];if(f instanceof THREE.Face3){g=e(f.a,f.b);b(g,c);g=e(f.b,f.c);b(g,c);g=e(f.c,f.a);b(g,c)}else if(f instanceof THREE.Face4){g=e(f.a,f.b);b(g,c);g=e(f.b,f.c);b(g,c);g=e(f.c,f.d);b(g,c);g=e(f.d,f.a);b(g,c)}}return h}(b);F=0;var C,B,I={},K={};for(o in x){w=x[o];C=o.split("_");B=C[0];C=C[1];h(B,[B,C]);h(C,[B,C]);z=0;for(A=w.length;z<A;z++){v=w[z];i(B,v,o);i(C,v,o)}w.length<2&&(u[o]=true)}a("vertexEdgeMap",I,"vertexFaceMap",K);for(o in x){w=
x[o];v=w[0];A=w[1];C=o.split("_");B=C[0];C=C[1];w=new THREE.Vector3;if(u[o]){w.addSelf(m[B]);w.addSelf(m[C]);w.multiplyScalar(0.5)}else{w.addSelf(q[v]);w.addSelf(q[A]);w.addSelf(m[B]);w.addSelf(m[C]);w.multiplyScalar(0.25)}r[o]=t+p.length+F;j.push(w);F++;if(k.supportUVs){w=new THREE.UV;w.u=f(B,v).u+f(C,v).u;w.v=f(B,v).v+f(C,v).v;w.u=w.u/2;w.v=w.v/2;g(r[o],v,w);if(!u[o]){w=new THREE.UV;w.u=f(B,A).u+f(C,A).u;w.v=f(B,A).v+f(C,A).v;w.u=w.u/2;w.v=w.v/2;g(r[o],A,w)}}}a("-- Step 2 done");var E,D;A=["123",
"12","2","23"];C=["123","23","3","31"];var G=["123","31","1","12"],N=["1234","12","2","23"],H=["1234","23","3","34"],L=["1234","34","4","41"],J=["1234","41","1","12"];o=0;for(x=q.length;o<x;o++){v=p[o];w=t+o;if(v instanceof THREE.Face3){F=e(v.a,v.b);B=e(v.b,v.c);E=e(v.c,v.a);d(w,r[F],v.b,r[B],v,A,o);d(w,r[B],v.c,r[E],v,C,o);d(w,r[E],v.a,r[F],v,G,o)}else if(v instanceof THREE.Face4){F=e(v.a,v.b);B=e(v.b,v.c);E=e(v.c,v.d);D=e(v.d,v.a);d(w,r[F],v.b,r[B],v,N,o);d(w,r[B],v.c,r[E],v,H,o);d(w,r[E],v.d,r[D],
v,L,o);d(w,r[D],v.a,r[F],v,J,o)}else a("face should be a face!",v)}r=new THREE.Vector3;v=new THREE.Vector3;o=0;for(x=m.length;o<x;o++)if(I[o]!==void 0){r.set(0,0,0);v.set(0,0,0);B=new THREE.Vector3(0,0,0);w=0;for(z in K[o]){r.addSelf(q[z]);w++}A=0;F=I[o].length;for(z=0;z<F;z++)u[e(I[o][z][0],I[o][z][1])]&&A++;if(A!=2){r.divideScalar(w);for(z=0;z<F;z++){w=I[o][z];w=m[w[0]].clone().addSelf(m[w[1]]).divideScalar(2);v.addSelf(w)}v.divideScalar(F);B.addSelf(m[o]);B.multiplyScalar(F-3);B.addSelf(r);B.addSelf(v.multiplyScalar(2));
B.divideScalar(F);j[o]=B}}b.vertices=j;b.faces=l;b.faceVertexUvs[0]=n;delete b.__tmpVertices;b.computeCentroids();b.computeFaceNormals();b.computeVertexNormals()};THREE.ImmediateRenderObject=function(){THREE.Object3D.call(this);this.render=function(){}};THREE.ImmediateRenderObject.prototype=new THREE.Object3D;THREE.ImmediateRenderObject.prototype.constructor=THREE.ImmediateRenderObject;
THREE.LensFlare=function(b,a,c,d,e){THREE.Object3D.call(this);this.lensFlares=[];this.positionScreen=new THREE.Vector3;this.customUpdateCallback=void 0;b!==void 0&&this.add(b,a,c,d,e)};THREE.LensFlare.prototype=new THREE.Object3D;THREE.LensFlare.prototype.constructor=THREE.LensFlare;THREE.LensFlare.prototype.supr=THREE.Object3D.prototype;
THREE.LensFlare.prototype.add=function(b,a,c,d,e,f){a===void 0&&(a=-1);c===void 0&&(c=0);f===void 0&&(f=1);e===void 0&&(e=new THREE.Color(16777215));if(d===void 0)d=THREE.NormalBlending;c=Math.min(c,Math.max(0,c));this.lensFlares.push({texture:b,size:a,distance:c,x:0,y:0,z:0,scale:1,rotation:1,opacity:f,color:e,blending:d})};
THREE.LensFlare.prototype.updateLensFlares=function(){var b,a=this.lensFlares.length,c,d=-this.positionScreen.x*2,e=-this.positionScreen.y*2;for(b=0;b<a;b++){c=this.lensFlares[b];c.x=this.positionScreen.x+d*c.distance;c.y=this.positionScreen.y+e*c.distance;c.wantedRotation=c.x*Math.PI*0.25;c.rotation=c.rotation+(c.wantedRotation-c.rotation)*0.25}};
THREE.MorphBlendMesh=function(b,a){THREE.Mesh.call(this,b,a);this.animationsMap={};this.animationsList=[];var c=this.geometry.morphTargets.length;this.createAnimation("__default",0,c-1,c/1);this.setAnimationWeight("__default",1)};THREE.MorphBlendMesh.prototype=new THREE.Mesh;THREE.MorphBlendMesh.prototype.constructor=THREE.MorphBlendMesh;
THREE.MorphBlendMesh.prototype.createAnimation=function(b,a,c,d){a={startFrame:a,endFrame:c,length:c-a+1,fps:d,duration:(c-a)/d,lastFrame:0,currentFrame:0,active:false,time:0,direction:1,weight:1,directionBackwards:false,mirroredLoop:false};this.animationsMap[b]=a;this.animationsList.push(a)};
THREE.MorphBlendMesh.prototype.autoCreateAnimations=function(b){for(var a=/([a-z]+)(\d+)/,c,d={},e=this.geometry,f=0,g=e.morphTargets.length;f<g;f++){var h=e.morphTargets[f].name.match(a);if(h&&h.length>1){var i=h[1];d[i]||(d[i]={start:Infinity,end:-Infinity});h=d[i];if(f<h.start)h.start=f;if(f>h.end)h.end=f;c||(c=i)}}for(i in d){h=d[i];this.createAnimation(i,h.start,h.end,b)}this.firstAnimation=c};
THREE.MorphBlendMesh.prototype.setAnimationDirectionForward=function(b){if(b=this.animationsMap[b]){b.direction=1;b.directionBackwards=false}};THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward=function(b){if(b=this.animationsMap[b]){b.direction=-1;b.directionBackwards=true}};THREE.MorphBlendMesh.prototype.setAnimationFPS=function(b,a){var c=this.animationsMap[b];if(c){c.fps=a;c.duration=(c.end-c.start)/c.fps}};
THREE.MorphBlendMesh.prototype.setAnimationDuration=function(b,a){var c=this.animationsMap[b];if(c){c.duration=a;c.fps=(c.end-c.start)/c.duration}};THREE.MorphBlendMesh.prototype.setAnimationWeight=function(b,a){var c=this.animationsMap[b];if(c)c.weight=a};THREE.MorphBlendMesh.prototype.setAnimationTime=function(b,a){var c=this.animationsMap[b];if(c)c.time=a};THREE.MorphBlendMesh.prototype.getAnimationTime=function(b){var a=0;if(b=this.animationsMap[b])a=b.time;return a};
THREE.MorphBlendMesh.prototype.getAnimationDuration=function(b){var a=-1;if(b=this.animationsMap[b])a=b.duration;return a};THREE.MorphBlendMesh.prototype.playAnimation=function(b){var a=this.animationsMap[b];if(a){a.time=0;a.active=true}else console.warn("animation["+b+"] undefined")};THREE.MorphBlendMesh.prototype.stopAnimation=function(b){if(b=this.animationsMap[b])b.active=false};
THREE.MorphBlendMesh.prototype.update=function(b){for(var a=0,c=this.animationsList.length;a<c;a++){var d=this.animationsList[a];if(d.active){var e=d.duration/d.length;d.time=d.time+d.direction*b;if(d.mirroredLoop){if(d.time>d.duration||d.time<0){d.direction=d.direction*-1;if(d.time>d.duration){d.time=d.duration;d.directionBackwards=true}if(d.time<0){d.time=0;d.directionBackwards=false}}}else{d.time=d.time%d.duration;if(d.time<0)d.time=d.time+d.duration}var f=d.startFrame+THREE.Math.clamp(Math.floor(d.time/
e),0,d.length-1),g=d.weight;if(f!==d.currentFrame){this.morphTargetInfluences[d.lastFrame]=0;this.morphTargetInfluences[d.currentFrame]=1*g;this.morphTargetInfluences[f]=0;d.lastFrame=d.currentFrame;d.currentFrame=f}e=d.time%e/e;d.directionBackwards&&(e=1-e);this.morphTargetInfluences[d.currentFrame]=e*g;this.morphTargetInfluences[d.lastFrame]=(1-e)*g}}};
THREE.LensFlarePlugin=function(){function b(b){var c=a.createProgram(),d=a.createShader(a.FRAGMENT_SHADER),e=a.createShader(a.VERTEX_SHADER);a.shaderSource(d,b.fragmentShader);a.shaderSource(e,b.vertexShader);a.compileShader(d);a.compileShader(e);a.attachShader(c,d);a.attachShader(c,e);a.linkProgram(c);return c}var a,c,d,e,f,g,h,i,j,l,n,k,m;this.init=function(p){a=p.context;c=p;d=new Float32Array(16);e=new Uint16Array(6);p=0;d[p++]=-1;d[p++]=-1;d[p++]=0;d[p++]=0;d[p++]=1;d[p++]=-1;d[p++]=1;d[p++]=
0;d[p++]=1;d[p++]=1;d[p++]=1;d[p++]=1;d[p++]=-1;d[p++]=1;d[p++]=0;d[p++]=1;p=0;e[p++]=0;e[p++]=1;e[p++]=2;e[p++]=0;e[p++]=2;e[p++]=3;f=a.createBuffer();g=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,f);a.bufferData(a.ARRAY_BUFFER,d,a.STATIC_DRAW);a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,g);a.bufferData(a.ELEMENT_ARRAY_BUFFER,e,a.STATIC_DRAW);h=a.createTexture();i=a.createTexture();a.bindTexture(a.TEXTURE_2D,h);a.texImage2D(a.TEXTURE_2D,0,a.RGB,16,16,0,a.RGB,a.UNSIGNED_BYTE,null);a.texParameteri(a.TEXTURE_2D,
a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST);a.bindTexture(a.TEXTURE_2D,i);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,16,16,0,a.RGBA,a.UNSIGNED_BYTE,null);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE);a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST);
a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST);if(a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS)<=0){j=false;l=b(THREE.ShaderFlares.lensFlare)}else{j=true;l=b(THREE.ShaderFlares.lensFlareVertexTexture)}n={};k={};n.vertex=a.getAttribLocation(l,"position");n.uv=a.getAttribLocation(l,"uv");k.renderType=a.getUniformLocation(l,"renderType");k.map=a.getUniformLocation(l,"map");k.occlusionMap=a.getUniformLocation(l,"occlusionMap");k.opacity=a.getUniformLocation(l,"opacity");k.color=a.getUniformLocation(l,
"color");k.scale=a.getUniformLocation(l,"scale");k.rotation=a.getUniformLocation(l,"rotation");k.screenPosition=a.getUniformLocation(l,"screenPosition");m=false};this.render=function(b,d,e,u){var b=b.__webglFlares,s=b.length;if(s){var t=new THREE.Vector3,o=u/e,x=e*0.5,z=u*0.5,A=16/u,v=new THREE.Vector2(A*o,A),w=new THREE.Vector3(1,1,0),F=new THREE.Vector2(1,1),C=k,A=n;a.useProgram(l);if(!m){a.enableVertexAttribArray(n.vertex);a.enableVertexAttribArray(n.uv);m=true}a.uniform1i(C.occlusionMap,0);a.uniform1i(C.map,
1);a.bindBuffer(a.ARRAY_BUFFER,f);a.vertexAttribPointer(A.vertex,2,a.FLOAT,false,16,0);a.vertexAttribPointer(A.uv,2,a.FLOAT,false,16,8);a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,g);a.disable(a.CULL_FACE);a.depthMask(false);var B,I,K,E,D;for(B=0;B<s;B++){A=16/u;v.set(A*o,A);E=b[B];t.set(E.matrixWorld.elements[12],E.matrixWorld.elements[13],E.matrixWorld.elements[14]);d.matrixWorldInverse.multiplyVector3(t);d.projectionMatrix.multiplyVector3(t);w.copy(t);F.x=w.x*x+x;F.y=w.y*z+z;if(j||F.x>0&&F.x<e&&F.y>0&&
F.y<u){a.activeTexture(a.TEXTURE1);a.bindTexture(a.TEXTURE_2D,h);a.copyTexImage2D(a.TEXTURE_2D,0,a.RGB,F.x-8,F.y-8,16,16,0);a.uniform1i(C.renderType,0);a.uniform2f(C.scale,v.x,v.y);a.uniform3f(C.screenPosition,w.x,w.y,w.z);a.disable(a.BLEND);a.enable(a.DEPTH_TEST);a.drawElements(a.TRIANGLES,6,a.UNSIGNED_SHORT,0);a.activeTexture(a.TEXTURE0);a.bindTexture(a.TEXTURE_2D,i);a.copyTexImage2D(a.TEXTURE_2D,0,a.RGBA,F.x-8,F.y-8,16,16,0);a.uniform1i(C.renderType,1);a.disable(a.DEPTH_TEST);a.activeTexture(a.TEXTURE1);
a.bindTexture(a.TEXTURE_2D,h);a.drawElements(a.TRIANGLES,6,a.UNSIGNED_SHORT,0);E.positionScreen.copy(w);E.customUpdateCallback?E.customUpdateCallback(E):E.updateLensFlares();a.uniform1i(C.renderType,2);a.enable(a.BLEND);I=0;for(K=E.lensFlares.length;I<K;I++){D=E.lensFlares[I];if(D.opacity>0.001&&D.scale>0.001){w.x=D.x;w.y=D.y;w.z=D.z;A=D.size*D.scale/u;v.x=A*o;v.y=A;a.uniform3f(C.screenPosition,w.x,w.y,w.z);a.uniform2f(C.scale,v.x,v.y);a.uniform1f(C.rotation,D.rotation);a.uniform1f(C.opacity,D.opacity);
a.uniform3f(C.color,D.color.r,D.color.g,D.color.b);c.setBlending(D.blending,D.blendEquation,D.blendSrc,D.blendDst);c.setTexture(D.texture,1);a.drawElements(a.TRIANGLES,6,a.UNSIGNED_SHORT,0)}}}}a.enable(a.CULL_FACE);a.enable(a.DEPTH_TEST);a.depthMask(true)}}};
THREE.ShadowMapPlugin=function(){var b,a,c,d,e=new THREE.Frustum,f=new THREE.Matrix4,g=new THREE.Vector3,h=new THREE.Vector3;this.init=function(e){b=e.context;a=e;var e=THREE.ShaderLib.depthRGBA,f=THREE.UniformsUtils.clone(e.uniforms);c=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f});d=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f,morphTargets:true});c._shadowPass=true;d._shadowPass=true};this.render=
function(b,c){a.shadowMapEnabled&&a.shadowMapAutoUpdate&&this.update(b,c)};this.update=function(i,j){var l,n,k,m,p,q,r,u,s,t=[];m=0;b.clearColor(1,1,1,1);b.disable(b.BLEND);b.enable(b.CULL_FACE);a.shadowMapCullFrontFaces?b.cullFace(b.FRONT):b.cullFace(b.BACK);a.setDepthTest(true);l=0;for(n=i.__lights.length;l<n;l++){k=i.__lights[l];if(k.castShadow)if(k instanceof THREE.DirectionalLight&&k.shadowCascade)for(p=0;p<k.shadowCascadeCount;p++){var o;if(k.shadowCascadeArray[p])o=k.shadowCascadeArray[p];
else{s=k;r=p;o=new THREE.DirectionalLight;o.isVirtual=true;o.onlyShadow=true;o.castShadow=true;o.shadowCameraNear=s.shadowCameraNear;o.shadowCameraFar=s.shadowCameraFar;o.shadowCameraLeft=s.shadowCameraLeft;o.shadowCameraRight=s.shadowCameraRight;o.shadowCameraBottom=s.shadowCameraBottom;o.shadowCameraTop=s.shadowCameraTop;o.shadowCameraVisible=s.shadowCameraVisible;o.shadowDarkness=s.shadowDarkness;o.shadowBias=s.shadowCascadeBias[r];o.shadowMapWidth=s.shadowCascadeWidth[r];o.shadowMapHeight=s.shadowCascadeHeight[r];
o.pointsWorld=[];o.pointsFrustum=[];u=o.pointsWorld;q=o.pointsFrustum;for(var x=0;x<8;x++){u[x]=new THREE.Vector3;q[x]=new THREE.Vector3}u=s.shadowCascadeNearZ[r];s=s.shadowCascadeFarZ[r];q[0].set(-1,-1,u);q[1].set(1,-1,u);q[2].set(-1,1,u);q[3].set(1,1,u);q[4].set(-1,-1,s);q[5].set(1,-1,s);q[6].set(-1,1,s);q[7].set(1,1,s);o.originalCamera=j;q=new THREE.Gyroscope;q.position=k.shadowCascadeOffset;q.add(o);q.add(o.target);j.add(q);k.shadowCascadeArray[p]=o;console.log("Created virtualLight",o)}r=k;u=
p;s=r.shadowCascadeArray[u];s.position.copy(r.position);s.target.position.copy(r.target.position);s.lookAt(s.target);s.shadowCameraVisible=r.shadowCameraVisible;s.shadowDarkness=r.shadowDarkness;s.shadowBias=r.shadowCascadeBias[u];q=r.shadowCascadeNearZ[u];r=r.shadowCascadeFarZ[u];s=s.pointsFrustum;s[0].z=q;s[1].z=q;s[2].z=q;s[3].z=q;s[4].z=r;s[5].z=r;s[6].z=r;s[7].z=r;t[m]=o;m++}else{t[m]=k;m++}}l=0;for(n=t.length;l<n;l++){k=t[l];if(!k.shadowMap){k.shadowMap=new THREE.WebGLRenderTarget(k.shadowMapWidth,
k.shadowMapHeight,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});k.shadowMapSize=new THREE.Vector2(k.shadowMapWidth,k.shadowMapHeight);k.shadowMatrix=new THREE.Matrix4}if(!k.shadowCamera){if(k instanceof THREE.SpotLight)k.shadowCamera=new THREE.PerspectiveCamera(k.shadowCameraFov,k.shadowMapWidth/k.shadowMapHeight,k.shadowCameraNear,k.shadowCameraFar);else if(k instanceof THREE.DirectionalLight)k.shadowCamera=new THREE.OrthographicCamera(k.shadowCameraLeft,k.shadowCameraRight,
k.shadowCameraTop,k.shadowCameraBottom,k.shadowCameraNear,k.shadowCameraFar);else{console.error("Unsupported light type for shadow");continue}i.add(k.shadowCamera);a.autoUpdateScene&&i.updateMatrixWorld()}if(k.shadowCameraVisible&&!k.cameraHelper){k.cameraHelper=new THREE.CameraHelper(k.shadowCamera);k.shadowCamera.add(k.cameraHelper)}if(k.isVirtual&&o.originalCamera==j){p=j;m=k.shadowCamera;q=k.pointsFrustum;s=k.pointsWorld;g.set(Infinity,Infinity,Infinity);h.set(-Infinity,-Infinity,-Infinity);for(r=
0;r<8;r++){u=s[r];u.copy(q[r]);THREE.ShadowMapPlugin.__projector.unprojectVector(u,p);m.matrixWorldInverse.multiplyVector3(u);if(u.x<g.x)g.x=u.x;if(u.x>h.x)h.x=u.x;if(u.y<g.y)g.y=u.y;if(u.y>h.y)h.y=u.y;if(u.z<g.z)g.z=u.z;if(u.z>h.z)h.z=u.z}m.left=g.x;m.right=h.x;m.top=h.y;m.bottom=g.y;m.updateProjectionMatrix()}m=k.shadowMap;q=k.shadowMatrix;p=k.shadowCamera;p.position.copy(k.matrixWorld.getPosition());p.lookAt(k.target.matrixWorld.getPosition());p.updateMatrixWorld();p.matrixWorldInverse.getInverse(p.matrixWorld);
if(k.cameraHelper)k.cameraHelper.lines.visible=k.shadowCameraVisible;k.shadowCameraVisible&&k.cameraHelper.update();q.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);q.multiplySelf(p.projectionMatrix);q.multiplySelf(p.matrixWorldInverse);if(!p._viewMatrixArray)p._viewMatrixArray=new Float32Array(16);if(!p._projectionMatrixArray)p._projectionMatrixArray=new Float32Array(16);p.matrixWorldInverse.flattenToArray(p._viewMatrixArray);p.projectionMatrix.flattenToArray(p._projectionMatrixArray);f.multiply(p.projectionMatrix,
p.matrixWorldInverse);e.setFromMatrix(f);a.setRenderTarget(m);a.clear();s=i.__webglObjects;k=0;for(m=s.length;k<m;k++){r=s[k];q=r.object;r.render=false;if(q.visible&&q.castShadow&&(!(q instanceof THREE.Mesh)||!q.frustumCulled||e.contains(q))){q._modelViewMatrix.multiply(p.matrixWorldInverse,q.matrixWorld);r.render=true}}k=0;for(m=s.length;k<m;k++){r=s[k];if(r.render){q=r.object;r=r.buffer;u=q.customDepthMaterial?q.customDepthMaterial:q.geometry.morphTargets.length?d:c;r instanceof THREE.BufferGeometry?
a.renderBufferDirect(p,i.__lights,null,u,r,q):a.renderBuffer(p,i.__lights,null,u,r,q)}}s=i.__webglObjectsImmediate;k=0;for(m=s.length;k<m;k++){r=s[k];q=r.object;if(q.visible&&q.castShadow){q._modelViewMatrix.multiply(p.matrixWorldInverse,q.matrixWorld);a.renderImmediateObject(p,i.__lights,null,c,q)}}}l=a.getClearColor();n=a.getClearAlpha();b.clearColor(l.r,l.g,l.b,n);b.enable(b.BLEND);a.shadowMapCullFrontFaces&&b.cullFace(b.BACK)}};THREE.ShadowMapPlugin.__projector=new THREE.Projector;
THREE.SpritePlugin=function(){function b(a,b){return b.z-a.z}var a,c,d,e,f,g,h,i,j,l;this.init=function(b){a=b.context;c=b;d=new Float32Array(16);e=new Uint16Array(6);b=0;d[b++]=-1;d[b++]=-1;d[b++]=0;d[b++]=1;d[b++]=1;d[b++]=-1;d[b++]=1;d[b++]=1;d[b++]=1;d[b++]=1;d[b++]=1;d[b++]=0;d[b++]=-1;d[b++]=1;d[b++]=0;b=d[b++]=0;e[b++]=0;e[b++]=1;e[b++]=2;e[b++]=0;e[b++]=2;e[b++]=3;f=a.createBuffer();g=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,f);a.bufferData(a.ARRAY_BUFFER,d,a.STATIC_DRAW);a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,
g);a.bufferData(a.ELEMENT_ARRAY_BUFFER,e,a.STATIC_DRAW);var b=THREE.ShaderSprite.sprite,k=a.createProgram(),m=a.createShader(a.FRAGMENT_SHADER),p=a.createShader(a.VERTEX_SHADER);a.shaderSource(m,b.fragmentShader);a.shaderSource(p,b.vertexShader);a.compileShader(m);a.compileShader(p);a.attachShader(k,m);a.attachShader(k,p);a.linkProgram(k);h=k;i={};j={};i.position=a.getAttribLocation(h,"position");i.uv=a.getAttribLocation(h,"uv");j.uvOffset=a.getUniformLocation(h,"uvOffset");j.uvScale=a.getUniformLocation(h,
"uvScale");j.rotation=a.getUniformLocation(h,"rotation");j.scale=a.getUniformLocation(h,"scale");j.alignment=a.getUniformLocation(h,"alignment");j.color=a.getUniformLocation(h,"color");j.map=a.getUniformLocation(h,"map");j.opacity=a.getUniformLocation(h,"opacity");j.useScreenCoordinates=a.getUniformLocation(h,"useScreenCoordinates");j.affectedByDistance=a.getUniformLocation(h,"affectedByDistance");j.screenPosition=a.getUniformLocation(h,"screenPosition");j.modelViewMatrix=a.getUniformLocation(h,"modelViewMatrix");
j.projectionMatrix=a.getUniformLocation(h,"projectionMatrix");l=false};this.render=function(d,e,m,p){var d=d.__webglSprites,q=d.length;if(q){var r=i,u=j,s=p/m,m=m*0.5,t=p*0.5,o=true;a.useProgram(h);if(!l){a.enableVertexAttribArray(r.position);a.enableVertexAttribArray(r.uv);l=true}a.disable(a.CULL_FACE);a.enable(a.BLEND);a.depthMask(true);a.bindBuffer(a.ARRAY_BUFFER,f);a.vertexAttribPointer(r.position,2,a.FLOAT,false,16,0);a.vertexAttribPointer(r.uv,2,a.FLOAT,false,16,8);a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,
g);a.uniformMatrix4fv(u.projectionMatrix,false,e._projectionMatrixArray);a.activeTexture(a.TEXTURE0);a.uniform1i(u.map,0);for(var x,z=[],r=0;r<q;r++){x=d[r];if(x.visible&&x.opacity!==0)if(x.useScreenCoordinates)x.z=-x.position.z;else{x._modelViewMatrix.multiply(e.matrixWorldInverse,x.matrixWorld);x.z=-x._modelViewMatrix.elements[14]}}d.sort(b);for(r=0;r<q;r++){x=d[r];if(x.visible&&x.opacity!==0&&x.map&&x.map.image&&x.map.image.width){if(x.useScreenCoordinates){a.uniform1i(u.useScreenCoordinates,1);
a.uniform3f(u.screenPosition,(x.position.x-m)/m,(t-x.position.y)/t,Math.max(0,Math.min(1,x.position.z)))}else{a.uniform1i(u.useScreenCoordinates,0);a.uniform1i(u.affectedByDistance,x.affectedByDistance?1:0);a.uniformMatrix4fv(u.modelViewMatrix,false,x._modelViewMatrix.elements)}e=x.map.image.width/(x.scaleByViewport?p:1);z[0]=e*s*x.scale.x;z[1]=e*x.scale.y;a.uniform2f(u.uvScale,x.uvScale.x,x.uvScale.y);a.uniform2f(u.uvOffset,x.uvOffset.x,x.uvOffset.y);a.uniform2f(u.alignment,x.alignment.x,x.alignment.y);
a.uniform1f(u.opacity,x.opacity);a.uniform3f(u.color,x.color.r,x.color.g,x.color.b);a.uniform1f(u.rotation,x.rotation);a.uniform2fv(u.scale,z);if(x.mergeWith3D&&!o){a.enable(a.DEPTH_TEST);o=true}else if(!x.mergeWith3D&&o){a.disable(a.DEPTH_TEST);o=false}c.setBlending(x.blending,x.blendEquation,x.blendSrc,x.blendDst);c.setTexture(x.map,0);a.drawElements(a.TRIANGLES,6,a.UNSIGNED_SHORT,0)}}a.enable(a.CULL_FACE);a.enable(a.DEPTH_TEST);a.depthMask(true)}}};
THREE.DepthPassPlugin=function(){this.enabled=false;this.renderTarget=null;var b,a,c,d,e=new THREE.Frustum,f=new THREE.Matrix4;this.init=function(e){b=e.context;a=e;var e=THREE.ShaderLib.depthRGBA,f=THREE.UniformsUtils.clone(e.uniforms);c=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f});d=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f,morphTargets:true});c._shadowPass=true;d._shadowPass=true};this.render=
function(a,b){this.enabled&&this.update(a,b)};this.update=function(g,h){var i,j,l,n,k,m;b.clearColor(1,1,1,1);b.disable(b.BLEND);a.setDepthTest(true);a.autoUpdateScene&&g.updateMatrixWorld();if(!h._viewMatrixArray)h._viewMatrixArray=new Float32Array(16);if(!h._projectionMatrixArray)h._projectionMatrixArray=new Float32Array(16);h.matrixWorldInverse.getInverse(h.matrixWorld);h.matrixWorldInverse.flattenToArray(h._viewMatrixArray);h.projectionMatrix.flattenToArray(h._projectionMatrixArray);f.multiply(h.projectionMatrix,
h.matrixWorldInverse);e.setFromMatrix(f);a.setRenderTarget(this.renderTarget);a.clear();m=g.__webglObjects;i=0;for(j=m.length;i<j;i++){l=m[i];k=l.object;l.render=false;if(k.visible&&(!(k instanceof THREE.Mesh)||!k.frustumCulled||e.contains(k))){k._modelViewMatrix.multiply(h.matrixWorldInverse,k.matrixWorld);l.render=true}}i=0;for(j=m.length;i<j;i++){l=m[i];if(l.render){k=l.object;l=l.buffer;a.setObjectFaces(k);n=k.customDepthMaterial?k.customDepthMaterial:k.geometry.morphTargets.length?d:c;l instanceof
THREE.BufferGeometry?a.renderBufferDirect(h,g.__lights,null,n,l,k):a.renderBuffer(h,g.__lights,null,n,l,k)}}m=g.__webglObjectsImmediate;i=0;for(j=m.length;i<j;i++){l=m[i];k=l.object;if(k.visible&&k.castShadow){k._modelViewMatrix.multiply(h.matrixWorldInverse,k.matrixWorld);a.renderImmediateObject(h,g.__lights,null,c,k)}}i=a.getClearColor();j=a.getClearAlpha();b.clearColor(i.r,i.g,i.b,j);b.enable(b.BLEND)}};
THREE.WebGLRenderer&&(THREE.AnaglyphWebGLRenderer=function(b){THREE.WebGLRenderer.call(this,b);this.autoUpdateScene=false;var a=this,c=this.setSize,d=this.render,e=new THREE.PerspectiveCamera,f=new THREE.PerspectiveCamera,g=new THREE.Matrix4,h=new THREE.Matrix4,i,j,l,n;e.matrixAutoUpdate=f.matrixAutoUpdate=false;var b={minFilter:THREE.LinearFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat},k=new THREE.WebGLRenderTarget(512,512,b),m=new THREE.WebGLRenderTarget(512,512,b),p=new THREE.PerspectiveCamera(53,
1,1,1E4);p.position.z=2;var b=new THREE.ShaderMaterial({uniforms:{mapLeft:{type:"t",value:0,texture:k},mapRight:{type:"t",value:1,texture:m}},vertexShader:"varying vec2 vUv;\nvoid main() {\nvUv = vec2( uv.x, 1.0 - uv.y );\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",fragmentShader:"uniform sampler2D mapLeft;\nuniform sampler2D mapRight;\nvarying vec2 vUv;\nvoid main() {\nvec4 colorL, colorR;\nvec2 uv = vUv;\ncolorL = texture2D( mapLeft, uv );\ncolorR = texture2D( mapRight, uv );\ngl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;\n}"}),
q=new THREE.Scene,b=new THREE.Mesh(new THREE.PlaneGeometry(2,2),b);b.rotation.x=Math.PI/2;q.add(b);q.add(p);this.setSize=function(b,d){c.call(a,b,d);k.width=b;k.height=d;m.width=b;m.height=d};this.render=function(b,c){b.updateMatrixWorld();if(i!==c.aspect||j!==c.near||l!==c.far||n!==c.fov){i=c.aspect;j=c.near;l=c.far;n=c.fov;var s=c.projectionMatrix.clone(),t=125/30*0.5,o=t*j/125,x=j*Math.tan(n*Math.PI/360),z;g.elements[12]=t;h.elements[12]=-t;t=-x*i+o;z=x*i+o;s.elements[0]=2*j/(z-t);s.elements[8]=
(z+t)/(z-t);e.projectionMatrix.copy(s);t=-x*i-o;z=x*i-o;s.elements[0]=2*j/(z-t);s.elements[8]=(z+t)/(z-t);f.projectionMatrix.copy(s)}e.matrixWorld.copy(c.matrixWorld).multiplySelf(h);e.position.copy(c.position);e.near=c.near;e.far=c.far;d.call(a,b,e,k,true);f.matrixWorld.copy(c.matrixWorld).multiplySelf(g);f.position.copy(c.position);f.near=c.near;f.far=c.far;d.call(a,b,f,m,true);q.updateMatrixWorld();d.call(a,q,p)}});
THREE.WebGLRenderer&&(THREE.CrosseyedWebGLRenderer=function(b){THREE.WebGLRenderer.call(this,b);this.autoClear=false;var a=this,c=this.setSize,d=this.render,e,f,g=new THREE.PerspectiveCamera;g.target=new THREE.Vector3(0,0,0);var h=new THREE.PerspectiveCamera;h.target=new THREE.Vector3(0,0,0);a.separation=10;if(b&&b.separation!==void 0)a.separation=b.separation;this.setSize=function(b,d){c.call(a,b,d);e=b/2;f=d};this.render=function(b,c){this.clear();g.fov=c.fov;g.aspect=0.5*c.aspect;g.near=c.near;
g.far=c.far;g.updateProjectionMatrix();g.position.copy(c.position);g.target.copy(c.target);g.translateX(a.separation);g.lookAt(g.target);h.projectionMatrix=g.projectionMatrix;h.position.copy(c.position);h.target.copy(c.target);h.translateX(-a.separation);h.lookAt(h.target);this.setViewport(0,0,e,f);d.call(a,b,g);this.setViewport(e,0,e,f);d.call(a,b,h,false)}});
THREE.ShaderFlares={lensFlareVertexTexture:{vertexShader:"uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility = (       visibility.r / 9.0 ) *\n( 1.0 - visibility.g / 9.0 ) *\n(       visibility.b / 9.0 ) *\n( 1.0 - visibility.a / 9.0 );\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",fragmentShader:"precision mediump float;\nuniform sampler2D map;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"},
lensFlare:{vertexShader:"uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",fragmentShader:"precision mediump float;\nuniform sampler2D map;\nuniform sampler2D occlusionMap;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nfloat visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;\nvisibility = ( 1.0 - visibility / 4.0 );\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * visibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"}};
THREE.ShaderSprite={sprite:{vertexShader:"uniform int useScreenCoordinates;\nuniform int affectedByDistance;\nuniform vec3 screenPosition;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 alignment;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position + alignment;\nvec2 rotatedPosition;\nrotatedPosition.x = ( cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y ) * scale.x;\nrotatedPosition.y = ( sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y ) * scale.y;\nvec4 finalPosition;\nif( useScreenCoordinates != 0 ) {\nfinalPosition = vec4( screenPosition.xy + rotatedPosition, screenPosition.z, 1.0 );\n} else {\nfinalPosition = projectionMatrix * modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition * ( affectedByDistance == 1 ? 1.0 : finalPosition.z );\n}\ngl_Position = finalPosition;\n}",
fragmentShader:"precision mediump float;\nuniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\n}"}};
>>>>>>> dev
