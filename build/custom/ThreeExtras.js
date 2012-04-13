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

			if ( matrix ) matrix.multiplyVector3( vertexCopy.position );

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

			vA = geometry.vertices[ face.a ].position;
			vB = geometry.vertices[ face.b ].position;
			vC = geometry.vertices[ face.c ].position;

			return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vC );

		} else if ( face instanceof THREE.Face4 ) {

			vA = geometry.vertices[ face.a ].position;
			vB = geometry.vertices[ face.b ].position;
			vC = geometry.vertices[ face.c ].position;
			vD = geometry.vertices[ face.d ].position;

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

				vA = vertices[ face.a ].position;
				vB = vertices[ face.b ].position;
				vC = vertices[ face.c ].position;

				face._area = THREE.GeometryUtils.triangleArea( vA, vB, vC );

			} else if ( face instanceof THREE.Face4 ) {

				vA = vertices[ face.a ].position;
				vB = vertices[ face.b ].position;
				vC = vertices[ face.c ].position;
				vD = vertices[ face.d ].position;

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

				dab = va.position.distanceTo( vb.position );
				dbc = vb.position.distanceTo( vc.position );
				dac = va.position.distanceTo( vc.position );

				if ( dab > maxEdgeLength || dbc > maxEdgeLength || dac > maxEdgeLength ) {

					m = geometry.vertices.length;

					triA = face.clone();
					triB = face.clone();

					if ( dab >= dbc && dab >= dac ) {

						vm = va.clone();
						vm.position.lerpSelf( vb.position, 0.5 );

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
						vm.position.lerpSelf( vc.position, 0.5 );

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
						vm.position.lerpSelf( vc.position, 0.5 );

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

						faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ] );

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

				dab = va.position.distanceTo( vb.position );
				dbc = vb.position.distanceTo( vc.position );
				dcd = vc.position.distanceTo( vd.position );
				dad = va.position.distanceTo( vd.position );

				if ( dab > maxEdgeLength || dbc > maxEdgeLength || dcd > maxEdgeLength || dad > maxEdgeLength ) {

					m1 = geometry.vertices.length;
					m2 = geometry.vertices.length + 1;

					quadA = face.clone();
					quadB = face.clone();

					if ( ( dab >= dbc && dab >= dcd && dab >= dad ) || ( dcd >= dbc && dcd >= dab && dcd >= dad ) ) {

						vm1 = va.clone();
						vm1.position.lerpSelf( vb.position, 0.5 );

						vm2 = vc.clone();
						vm2.position.lerpSelf( vd.position, 0.5 );

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
						vm1.position.lerpSelf( vc.position, 0.5 );

						vm2 = vd.clone();
						vm2.position.lerpSelf( va.position, 0.5 );

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

						faceVertexUvs[ j ].push( geometry.faceVertexUvs[ j ] );

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

	};

	return pts;

};

// Get sequence of points using getPointAt( u )

THREE.Curve.prototype.getSpacedPoints = function ( divisions ) {

	if ( !divisions ) divisions = 5;

	var d, pts = [];

	for ( d = 0; d <= divisions; d ++ ) {

		pts.push( this.getPointAt( d / divisions ) );

	};

	return pts;

};

// Get total curve length

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

    t = ( i + segmentFraction ) / ( il -1 );

	return t;

};

// In case any sub curve does not implement its tangent / normal finding,
// we get 2 points with a small delta and find a gradient of the 2 points
// which seems to make a reasonable approximation

THREE.Curve.prototype.getNormalVector = function( t ) {

	var vec = this.getTangent( t );

	return new THREE.Vector2( -vec.y , vec.x );

};

// Returns a unit vector tangent at t

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

	if ( ! ( v1 instanceof THREE.Vector2 ) ) {

		// Fall back for old constuctor signature - should be removed over time

		THREE.LineCurve.oldConstructor.apply( this, arguments );
		return;

	}

	this.v1 = v1;
	this.v2 = v2;

};

THREE.LineCurve.oldConstructor = function ( x1, y1, x2, y2 ) {

	this.constructor( new THREE.Vector2( x1, y1 ), new THREE.Vector2( x2, y2 ) );

};

THREE.LineCurve.prototype = new THREE.Curve();
THREE.LineCurve.prototype.constructor = THREE.LineCurve;

THREE.LineCurve.prototype.getPoint = function ( t ) {

	var point = new THREE.Vector2();

	point.sub( this.v2, this.v1 );
	point.multiplyScalar( t ).addSelf( this.v1 );

	return point;

};

// Line curve is linear, so we can overwrite default getPointAt

THREE.LineCurve.prototype.getPointAt = function ( u ) {

	return this.getPoint( u );

};

THREE.LineCurve.prototype.getTangent = function( t ) {

	var tangent = new THREE.Vector2();

	tangent.sub( this.v2, this.v1 );
	tangent.normalize();

	return tangent;

};

/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/


THREE.QuadraticBezierCurve = function ( v0, v1, v2 ) {

	if ( !( v1 instanceof THREE.Vector2 ) ) {

		var args = Array.prototype.slice.call( arguments );

		v0 = new THREE.Vector2( args[ 0 ], args[ 1 ] );
		v1 = new THREE.Vector2( args[ 2 ], args[ 3 ] );
		v2 = new THREE.Vector2( args[ 4 ], args[ 5 ] );

	}

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

	// iterate sub segments
	// 	get lengths for sub segments
	// 	if segment is bezier
	//		perform subdivisions

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

	if ( ! ( v1 instanceof THREE.Vector2 ) ) {

		var args = Array.prototype.slice.call( arguments );

		v0 = new THREE.Vector2( args[ 0 ], args[ 1 ] );
		v1 = new THREE.Vector2( args[ 2 ], args[ 3 ] );
		v2 = new THREE.Vector2( args[ 4 ], args[ 5 ] );
		v3 = new THREE.Vector2( args[ 6 ], args[ 7 ] );

	}

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

	// return normal unit vector

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


/*
getPoint DONE
getLength DONE
getLengths DONE

curve.getPoints(); DONE
curve.getPointAtArcLength(t); DONE
curve.transform(params);
curve.getTangentAt(t); DONE
*/

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

    for( var i = 0; i < points.length; i ++ ) {

        geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( points[ i ].x, points[ i ].y, 0 ) ) );

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

	this.position = new THREE.Vector3();

	var fov = 90, aspect = 1;

	var cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	var cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );

	var cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	var cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );

	var cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	var cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );

	cameraPX.position = this.position;
	cameraPX.up.set( 0, -1, 0 );
	cameraPX.lookAt( new THREE.Vector3( 1, 0, 0 ) );

	cameraNX.position = this.position;
	cameraNX.up.set( 0, -1, 0 );
	cameraNX.lookAt( new THREE.Vector3( -1, 0, 0 ) );

	cameraPY.position = this.position;
	cameraPY.up.set( 0, 0, 1 );
	cameraPY.lookAt( new THREE.Vector3( 0, 1, 0 ) );

	cameraNY.position = this.position;
	cameraNY.up.set( 0, 0, -1 );
	cameraNY.lookAt( new THREE.Vector3( 0, -1, 0 ) );

	cameraPZ.position = this.position;
	cameraPZ.up.set( 0, -1, 0 );
	cameraPZ.lookAt( new THREE.Vector3( 0, 0, 1 ) );

	cameraNZ.position = this.position;
	cameraNZ.up.set( 0, -1, 0 );
	cameraNZ.lookAt( new THREE.Vector3( 0, 0, -1 ) );

	// cube render target

	this.renderTarget = new THREE.WebGLRenderTargetCube( cubeResolution, cubeResolution, { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );

	this.updateCubeMap = function ( renderer, scene ) {

		var cubeTarget = this.renderTarget;

		var oldGenerateMipmaps = cubeTarget.generateMipmaps;

		cubeTarget.generateMipmaps = false;

		cubeTarget.activeCubeFace = 0;
		renderer.render( scene, cameraPX, cubeTarget );

		cubeTarget.activeCubeFace = 1;
		renderer.render( scene, cameraNX, cubeTarget );

		cubeTarget.activeCubeFace = 2;
		renderer.render( scene, cameraPY, cubeTarget );

		cubeTarget.activeCubeFace = 3;
		renderer.render( scene, cameraNY, cubeTarget );

		cubeTarget.activeCubeFace = 4;
		renderer.render( scene, cameraPZ, cubeTarget );

		cubeTarget.generateMipmaps = oldGenerateMipmaps;

		cubeTarget.activeCubeFace = 5;
		renderer.render( scene, cameraNZ, cubeTarget );

	};

};
/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 * 
 *	A handy general perpose camera, for setting FOV, Lens Focal Length,  
 *		and switching between perspective and orthographic views easily.
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
THREE.CombinedCamera.prototype.constructor = THREE.CoolCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {

	this.near = this.cameraP.near;
	this.far = this.cameraP.far;
	this.cameraP.fov =  this.fov / this.zoom ;
	this.cameraP.updateProjectionMatrix();
	this.projectionMatrix = this.cameraP.projectionMatrix;
	
	this.inPersepectiveMode = true;
	this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

	// Orthographic from Perspective
	var fov = this.fov;
	var aspect = this.cameraP.aspect;
	var near = this.cameraP.near;
	var far = this.cameraP.far;
	
	
	// Just pretend we want the mid plane of the viewing frustum
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

THREE.CombinedCamera.prototype.setFov = function(fov) {	
	this.fov = fov;
	
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
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
	
	//TODO: Better way to disable camera.lookAt()?
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

			geometry.vertices[ i ] = new THREE.Vertex( new THREE.Vector3( position.x, position.y, position.z ) );

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

				scope.vertices.push( new THREE.Vertex( vector ) );

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

			var xpos = radius * Math.sin( u * Math.PI * 2 );
			var ypos = - v * height + heightHalf;
			var zpos = radius * Math.cos( u * Math.PI * 2 );

			this.vertices.push( new THREE.Vertex( new THREE.Vector3( xpos, ypos, zpos ) ) );

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

			var n1 = this.vertices[ v1 ].position.clone().setY( 0 ).normalize();
			var n2 = this.vertices[ v2 ].position.clone().setY( 0 ).normalize();
			var n3 = this.vertices[ v3 ].position.clone().setY( 0 ).normalize();
			var n4 = this.vertices[ v4 ].position.clone().setY( 0 ).normalize();

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

		this.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, heightHalf, 0 ) ) );

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

		this.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, - heightHalf, 0 ) ) );

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
		// TODO2 - have have TNBs calculation refactored from TubeGeometry?
		splineTube = new THREE.TubeGeometry(extrudePath, steps, 1, 1, false, false);
		
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
		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
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
		var ax = geometry.vertices[ indexA ].position.x,
			ay = geometry.vertices[ indexA ].position.y,

			bx = geometry.vertices[ indexB ].position.x,
			by = geometry.vertices[ indexB ].position.y,

			cx = geometry.vertices[ indexC ].position.x,
			cy = geometry.vertices[ indexC ].position.y;
			
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
		var ax = geometry.vertices[ indexA ].position.x,
			ay = geometry.vertices[ indexA ].position.y,
			az = geometry.vertices[ indexA ].position.z,

			bx = geometry.vertices[ indexB ].position.x,
			by = geometry.vertices[ indexB ].position.y,
			bz = geometry.vertices[ indexB ].position.z,

			cx = geometry.vertices[ indexC ].position.x,
			cy = geometry.vertices[ indexC ].position.y,
			cz = geometry.vertices[ indexC ].position.z,

			dx = geometry.vertices[ indexD ].position.x,
			dy = geometry.vertices[ indexD ].position.y,
			dz = geometry.vertices[ indexD ].position.z;
		
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
 */

THREE.LatheGeometry = function ( points, steps, angle ) {

	THREE.Geometry.call( this );

	this.steps = steps || 12;
	this.angle = angle || 2 * Math.PI;

	var stepSize = this.angle / this.steps,
	newV = [], oldInds = [], newInds = [], startInds = [],
	matrix = new THREE.Matrix4().makeRotationZ( stepSize );

	for ( var j = 0; j < points.length; j ++ ) {

		this.vertices.push( new THREE.Vertex( points[ j ] ) );

		newV[ j ] = points[ j ].clone();
		oldInds[ j ] = this.vertices.length - 1;

	}

	for ( var r = 0; r <= this.angle + 0.001; r += stepSize ) { // need the +0.001 for it go up to angle

		for ( var j = 0; j < newV.length; j ++ ) {

			if ( r < this.angle ) {

				newV[ j ] = matrix.multiplyVector3( newV[ j ].clone() );
				this.vertices.push( new THREE.Vertex( newV[ j ] ) );
				newInds[ j ] = this.vertices.length - 1;

			} else {

				newInds = startInds; // wrap it up!

			}

		}

		if ( r == 0 ) startInds = oldInds;

		for ( var j = 0; j < oldInds.length - 1; j ++ ) {

			this.faces.push( new THREE.Face4( newInds[ j ], newInds[ j + 1 ], oldInds[ j + 1 ], oldInds[ j ] ) );
			this.faceVertexUvs[ 0 ].push( [

				new THREE.UV( 1 - r / this.angle, j / points.length ),
				new THREE.UV( 1 - r / this.angle, ( j + 1 ) / points.length ),
				new THREE.UV( 1 - ( r - stepSize ) / this.angle, ( j + 1 ) / points.length ),
				new THREE.UV( 1 - ( r - stepSize ) / this.angle, j / points.length )

			] );

		}

		oldInds = newInds;
		newInds = [];

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

			this.vertices.push( new THREE.Vertex( new THREE.Vector3( x, 0, z ) ) );

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

			var xpos = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			var ypos = radius * Math.cos( thetaStart + v * thetaLength );
			var zpos = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			this.vertices.push( new THREE.Vertex( new THREE.Vector3( xpos, ypos, zpos ) ) );

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

			var n1 = this.vertices[ v1 ].position.clone().normalize();
			var n2 = this.vertices[ v2 ].position.clone().normalize();
			var n3 = this.vertices[ v3 ].position.clone().normalize();
			var n4 = this.vertices[ v4 ].position.clone().normalize();

			var uv1 = uvs[ y ][ x + 1 ].clone();
			var uv2 = uvs[ y ][ x ].clone();
			var uv3 = uvs[ y + 1 ][ x ].clone();
			var uv4 = uvs[ y + 1 ][ x + 1 ].clone();

			if ( Math.abs( this.vertices[ v1 ].position.y ) == radius ) {

				this.faces.push( new THREE.Face3( v1, v3, v4, [ n1, n3, n4 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv3, uv4 ] );

			} else if ( Math.abs( this.vertices[ v3 ].position.y ) ==  radius ) {

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

			var vector = new THREE.Vector3();
			vector.x = ( this.radius + this.tube * Math.cos( v ) ) * Math.cos( u );
			vector.y = ( this.radius + this.tube * Math.cos( v ) ) * Math.sin( u );
			vector.z = this.tube * Math.sin( v );

			this.vertices.push( new THREE.Vertex( vector ) );

			uvs.push( new THREE.UV( i / this.segmentsT, 1 - j / this.segmentsR ) );
			normals.push( vector.clone().subSelf( center ).normalize() );

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

		return scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) ) - 1;

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
		tangent = new THREE.Vector3(),
		normal = new THREE.Vector3(),
		binormal = new THREE.Vector3(),

		vec = new THREE.Vector3(),
		mat = new THREE.Matrix4(),

		tangents = [],
		normals = [],
		binormals = [],

		numpoints = this.segments + 1,
		theta,
		epsilon = 0.0001,
		smallest,
		x, y, z,
		tx, ty, tz,
		u, v,
		p1, p2,
		cx, cy,
		pos, pos2,
		i, j,
		ip, jp,
		a, b, c, d,
		uva, uvb, uvc, uvd;

	// expose internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;


	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) ) - 1;

	}

	// compute the tangent vectors for each segment on the path

	for ( i = 0; i < numpoints; i++ ) {

		u = i / ( numpoints - 1 );

		tangents[ i ] = this.path.getTangentAt( u );
		tangents[ i ].normalize();

	}

	initialNormal3();

	function initialNormal1() {
		// fixed start binormal. Has dangers of 0 vectors
		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		var lastBinormal = new THREE.Vector3( 0, 0, 1 );
		normals[ 0 ].cross( lastBinormal, tangents[ 0 ] ).normalize();
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] ).normalize();
	}

	function initialNormal2() {

		// This uses the Frenet-Serret formula for deriving binormal
		var t2 = path.getTangentAt( epsilon );

		normals[ 0 ] = new THREE.Vector3().sub( t2, tangents[ 0 ] ).normalize()
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
			vec.set( 1, 0, 0 );
		}

		if ( ty <= smallest ) {
			smallest = ty;
			vec.set( 0, 1, 0 );
		}

		if ( tz <= smallest ) {
			vec.set( 0, 0, 1 );
		}

		// vec.cross( tangents[ 0 ], normal ).normalize();

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

	if ( this.closed ) {

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


	// consruct the grid

	for ( i = 0; i < numpoints; i++ ) {

		this.grid[ i ] = [];

		u = i / ( numpoints - 1 );

		pos = this.path.getPointAt( u );

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

            pos2 = new THREE.Vector3().copy( pos );
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

		this.vertices[ i ].position.multiplyScalar( radius );

	}

	/**
	 * Project vector onto sphere's surface
	 */
	function prepare( vector ) {

		var vertex = new THREE.Vertex( vector.normalize() );
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

			var face = new THREE.Face3( v1.index, v2.index, v3.index, [ v1.position.clone(), v2.position.clone(), v3.position.clone() ] );
			face.centroid.addSelf( v1.position ).addSelf( v2.position ).addSelf( v3.position ).divideScalar( 3 );
			face.normal = face.centroid.clone().normalize();
			that.faces.push( face );

			var azi = azimuth( face.centroid );
			that.faceVertexUvs[ 0 ].push( [ 
				correctUV( v1.uv, v1.position, azi ),
				correctUV( v2.uv, v2.position, azi ),
				correctUV( v3.uv, v3.position, azi )
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
				new THREE.Vector3().add( v1.position, v2.position ).divideScalar( 2 )
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
	lineGeometry.vertices.push( new THREE.Vertex() );
	lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 100, 0 ) ) );

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
    lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 0, 0 ) ) );
    lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, 1, 0 ) ) );

    this.line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color : hex } ) );
    this.add( this.line );

    var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );

    this.cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color : hex } ) );
    this.cone.position.set( 0, 1, 0 );
    this.add( this.cone );

    if ( origin instanceof THREE.Vector3 ) {

        this.position = origin;

    }

    this.setDirection( dir );
    this.setLength( length );

};

THREE.ArrowHelper.prototype = new THREE.Object3D();
THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper;

THREE.ArrowHelper.prototype.setDirection = function( dir ) {

    var axis = new THREE.Vector3( 0, 1, 0 ).crossSelf( dir );

    var radians = Math.acos( new THREE.Vector3( 0, 1, 0 ).dot( dir.clone().normalize() ) );

    this.matrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );

    this.rotation.getRotationFromMatrix( this.matrix, this.scale );

};

THREE.ArrowHelper.prototype.setLength = function( length ) {

    this.scale.set( length, length, length );

};

THREE.ArrowHelper.prototype.setColor = function( hex ) {

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

		_this.lineGeometry.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
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
				_this.lineGeometry.vertices[ j ].position.copy( THREE.CameraHelper.__v );

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
	
	//console.log( 'running smooth' );
	
	// New set of vertices, faces and uvs
	var newVertices = [], newFaces = [], newUVs = [];
	
	function v( x, y, z ) {
		newVertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
	}
	
	var scope = this;

	function f4( a, b, c, d, oldFace, orders ) {
		
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
		
		if (!scope.supportUVs || uvForVertices.length!=0) {
			newUVs.push( [
				uvForVertices[a],
				uvForVertices[b],
				uvForVertices[c],
				uvForVertices[d]
			] );
			
		}
	}
	
	function edge_hash( a, b ) {

		return Math.min( a, b ) + "_" + Math.max( a, b );

	};
	
	function computeEdgeFaces( geometry ) {

		function addToMap( map, hash, i ) {

			if ( map[ hash ] === undefined ) {

				map[ hash ] = [];
				
			} 
			
			map[ hash ].push( i );

		};

		var i, il, v1, v2, j, k,
			face, faceIndices, faceIndex,
			edge,
			hash,
			vfMap = {};

		// construct vertex -> face map

		for( i = 0, il = geometry.faces.length; i < il; i ++ ) {

			face = geometry.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				hash = edge_hash( face.a, face.b );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.b, face.c );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.c, face.a );
				addToMap( vfMap, hash, i );

			} else if ( face instanceof THREE.Face4 ) {

				hash = edge_hash( face.a, face.b );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.b, face.c );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.c, face.d );
				addToMap( vfMap, hash, i );
				
				hash = edge_hash( face.d, face.a );
				addToMap( vfMap, hash, i );

			}

		}

		// extract faces
		
		// var edges = [];
		// 
		// var numOfEdges = 0;
		// for (i in vfMap) {
		// 	numOfEdges++;
		// 	
		// 	edge = vfMap[i];
		// 	edges.push(edge);
		// 	
		// }
		
		//console.log('vfMap', vfMap, 'geometry.edges',geometry.edges, 'numOfEdges', numOfEdges);

		return vfMap;

	};
	
	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	
	var newPoints = originalPoints.concat(); // Vertices
		
	var facePoints = [], edgePoints = {};
	
	var sharpEdges = {}, sharpVertices = [], sharpFaces = [];
	
	var uvForVertices = [];
	
	// Step 1
	//	For each face, add a face point
	//	Set each face point to be the centroid of all original points for the respective face.
	
	var i, il, j, jl, face;
	
	// For Uvs
	var uvs = oldGeometry.faceVertexUvs[0];
	var abcd = 'abcd', vertice;
	
	for (i=0, il = uvs.length; i<il; i++ ) {
		for (j=0,jl=uvs[i].length;j<jl;j++) {
			vertice = originalFaces[i][abcd.charAt(j)];
			
			if (!uvForVertices[vertice]) {
				uvForVertices[vertice] = uvs[i][j];
			} else {
				//console.log('dup', 	uvForVertices[vertice]);
			}
			
			
		}
	}
			
	var avgUv ;
	for (i=0, il = originalFaces.length; i<il ;i++) {
		face = originalFaces[i];
		facePoints.push(face.centroid);
		newPoints.push( new THREE.Vertex(face.centroid) );
		
		
		if (!scope.supportUVs || uvForVertices.length==0) continue;
		
		// Prepare subdivided uv
		
		avgUv = new THREE.UV();
		
		if ( face instanceof THREE.Face3 ) {
			avgUv.u = uvForVertices[face.a].u + uvForVertices[face.b].u + uvForVertices[face.c].u;
			avgUv.v = uvForVertices[face.a].v + uvForVertices[face.b].v + uvForVertices[face.c].v;
			avgUv.u /= 3;
			avgUv.v /= 3;
			
		} else if ( face instanceof THREE.Face4 ) {
			avgUv.u = uvForVertices[face.a].u + uvForVertices[face.b].u + uvForVertices[face.c].u + uvForVertices[face.d].u;
			avgUv.v = uvForVertices[face.a].v + uvForVertices[face.b].v + uvForVertices[face.c].v + uvForVertices[face.d].v;
			avgUv.u /= 4;
			avgUv.v /= 4;
		}
	
		uvForVertices.push(avgUv);
	}

	// Step 2
	//	For each edge, add an edge point.
	//	Set each edge point to be the average of the two neighbouring face points and its two original endpoints.
	
	var vfMap = computeEdgeFaces ( oldGeometry );
	var edge, faceIndexA, faceIndexB, avg;
	
	//console.log('vfMap', vfMap);

	var edgeCount = 0;
	var originalVerticesLength = originalPoints.length;
	var edgeVertex, edgeVertexA, edgeVertexB;
	
	////
	
	var vertexEdgeMap = {};
	var vertexFaceMap = {};
	
	var addVertexEdgeMap = function(vertex, edge) {
		if (vertexEdgeMap[vertex]===undefined) {
			vertexEdgeMap[vertex] = [];
		}
		
		vertexEdgeMap[vertex].push(edge);
	};
	
	var addVertexFaceMap = function(vertex, face, edge) {
		if (vertexFaceMap[vertex]===undefined) {
			vertexFaceMap[vertex] = {};
		}
		
		//vertexFaceMap[vertex][face] = edge;
		vertexFaceMap[vertex][face] = null;
	};
	
	// Prepares vertexEdgeMap and vertexFaceMap
	for (i in vfMap) { // This is for every edge
		edge = vfMap[i];
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		// Maps an edgeVertex to connecting edges
		addVertexEdgeMap(edgeVertexA, [edgeVertexA, edgeVertexB] );
		addVertexEdgeMap(edgeVertexB, [edgeVertexA, edgeVertexB] );
		
		
		// faceIndexA = edge[0]; // face index a
		// faceIndexB = edge[1]; // face index b
		// 
		// // Add connecting faces for edge
		// addVertexFaceMap(edgeVertexA, faceIndexA);
		// addVertexFaceMap(edgeVertexB, faceIndexA);
		// 
		// 
		// if (faceIndexB) {
		// 	addVertexFaceMap(edgeVertexA, faceIndexB);
		// 	addVertexFaceMap(edgeVertexB, faceIndexB);
		// } else {
		// 	addVertexFaceMap(edgeVertexA, faceIndexA);
		// 	addVertexFaceMap(edgeVertexB, faceIndexA);
		// }
		
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
	
	
	
	//console.log('vertexEdgeMap',vertexEdgeMap, 'vertexFaceMap', vertexFaceMap);
	
	
	for (i in vfMap) {
		edge = vfMap[i];
		
		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		
		avg = new THREE.Vector3();
		
		//console.log(i, faceIndexB,facePoints[faceIndexB]);
		
		if (sharpEdges[i]) {
			//console.log('warning, ', i, 'edge has only 1 connecting face', edge);
			
			// For a sharp edge, average the edge end points.
			avg.addSelf(originalPoints[edgeVertexA].position);
			avg.addSelf(originalPoints[edgeVertexB].position);
			
			avg.multiplyScalar(0.5);
			
			sharpVertices[newPoints.length] = true;
			
		} else {
		
			avg.addSelf(facePoints[faceIndexA]);
			avg.addSelf(facePoints[faceIndexB]);
		
			avg.addSelf(originalPoints[edgeVertexA].position);
			avg.addSelf(originalPoints[edgeVertexB].position);
		
			avg.multiplyScalar(0.25);
		
		}
		
		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;
		//console.log(edgePoints[i], newPoints.length);
		
		newPoints.push( new THREE.Vertex(avg) );
	
		edgeCount ++;
		
		if (!scope.supportUVs || uvForVertices.length==0) continue;
		
		// Prepare subdivided uv
		
		avgUv = new THREE.UV();
		
		avgUv.u = uvForVertices[edgeVertexA].u + uvForVertices[edgeVertexB].u;
		avgUv.v = uvForVertices[edgeVertexA].v + uvForVertices[edgeVertexB].v;
		avgUv.u /= 2;
		avgUv.v /= 2;
	
		uvForVertices.push(avgUv);
		
	}
	
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
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc123 );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA], face, bca123 );
			f4( currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB], face, cab123 );
			
		} else if ( face instanceof THREE.Face4 ) {
			// create 4 face4s
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCD = edge_hash( face.c, face.d );
			hashDA = edge_hash( face.d, face.a );
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc1234 );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD], face, bcd1234 );
			f4( currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA], face, cda1234 );
			f4( currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB], face, dab1234  );

				
		} else {
			console.log('face should be a face!', face);
		}
	}
	
	newVertices = newPoints;
	
	// console.log('original ', oldGeometry.vertices.length, oldGeometry.faces.length );
	// console.log('new points', newPoints.length, 'faces', newFaces.length );
	
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
			var midPt = originalPoints[edge[0]].position.clone().addSelf(originalPoints[edge[1]].position).divideScalar(2);
			R.addSelf(midPt);
			// R.addSelf(originalPoints[edge[0]].position);
			// R.addSelf(originalPoints[edge[1]].position);
		}
		
		R.divideScalar(n)
		
		newPos.addSelf(originalPoints[i].position);
		newPos.multiplyScalar(n - 3);
		
		newPos.addSelf(F);
		newPos.addSelf(R.multiplyScalar(2));
		newPos.divideScalar(n);
		
		newVertices[i].position = newPos;
		
		
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

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

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

				skin.bindShapeMatrix.multiplyVector3( geometry.vertices[ i ].position );

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

			skinController.skin.bindShapeMatrix.multiplyVector3( geometry.vertices[i].position );

		}

		// process animation, or simply pose the rig if no animation

		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];

			// zero skinned vertices

			for ( i = 0; i < geometry.vertices.length; i++ ) {

				skinned.push( new THREE.Vertex( new THREE.Vector3() ) );

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

					v.x = o.position.x;
					v.y = o.position.y;
					v.z = o.position.z;

					bones[i].skinningMatrix.multiplyVector3(v);

					s.position.x += (v.x * weight);
					s.position.y += (v.y * weight);
					s.position.z += (v.z * weight);

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
					member = getConvertedMember( channel.member ),
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid );

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

			if ( prevData.length ) {

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

		switch ( this.type ) {

			case 'matrix':

				console.log( 'Currently not handling matrix transform updates' );
				break;

			case 'translate':
			case 'scale':

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

			var v = new THREE.Vertex( getConvertedVec3( vertexData, i ) );
			this.geometry3js.vertices.push( v );

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

									}

								}

							}

						} else if ( prop == 'diffuse' || !transparent ) {

							props[ prop ] = cot.color.getHex();

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

		if ( this.strideOut > 1 ) {

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

			if ( nextTarget ) {

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

			vertex = new THREE.Vertex();

			vertex.position.x = vertices[ offset ++ ] * scale;
			vertex.position.y = vertices[ offset ++ ] * scale;
			vertex.position.z = vertices[ offset ++ ] * scale;

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

			var i, l, v, vl, x, y, z, dstVertices, srcVertices;

			for ( i = 0, l = json.morphTargets.length; i < l; i ++ ) {

				geometry.morphTargets[ i ] = {};
				geometry.morphTargets[ i ].name = json.morphTargets[ i ].name;
				geometry.morphTargets[ i ].vertices = [];

				dstVertices = geometry.morphTargets[ i ].vertices;
				srcVertices = json.morphTargets [ i ].vertices;

				for( v = 0, vl = srcVertices.length; v < vl; v += 3 ) {

					x = srcVertices[ v ] * scale;
					y = srcVertices[ v + 1 ] * scale;
					z = srcVertices[ v + 2 ] * scale;

					dstVertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

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
						object.position.set( p[0], p[1], p[2] );

						if ( q ) {

							object.quaternion.set( q[0], q[1], q[2], q[3] );
							object.useQuaternion = true;

						} else {

							object.rotation.set( r[0], r[1], r[2] );

						}

						object.scale.set( s[0], s[1], s[2] );

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

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

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

					if( object.matrixAutoUpdate ) {

						//object.matrixWorld.flattenToArray( object._objectMatrixArray );

					}

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

				if( object.matrixAutoUpdate ) {

					//object.matrixWorld.flattenToArray( object._objectMatrixArray );

				}

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
'use strict';THREE.ColorUtils={adjustHSV:function(a,b,c,d){var f=THREE.ColorUtils.__hsv;THREE.ColorUtils.rgbToHsv(a,f);f.h=THREE.Math.clamp(f.h+b,0,1);f.s=THREE.Math.clamp(f.s+c,0,1);f.v=THREE.Math.clamp(f.v+d,0,1);a.setHSV(f.h,f.s,f.v)},rgbToHsv:function(a,b){var c=a.r,d=a.g,f=a.b,e=Math.max(Math.max(c,d),f),g=Math.min(Math.min(c,d),f);if(g===e)g=c=0;else{var h=e-g,g=h/e,c=(c===e?(d-f)/h:d===e?2+(f-c)/h:4+(c-d)/h)/6;0>c&&(c+=1);1<c&&(c-=1)}void 0===b&&(b={h:0,s:0,v:0});b.h=c;b.s=g;b.v=e;return b}};
THREE.ColorUtils.__hsv={h:0,s:0,v:0};
THREE.GeometryUtils={merge:function(a,b){for(var c,d,f=a.vertices.length,e=b instanceof THREE.Mesh?b.geometry:b,g=a.vertices,h=e.vertices,i=a.faces,j=e.faces,k=a.faceVertexUvs[0],q=e.faceVertexUvs[0],l={},n=0;n<a.materials.length;n++)l[a.materials[n].id]=n;b instanceof THREE.Mesh&&(b.matrixAutoUpdate&&b.updateMatrix(),c=b.matrix,d=new THREE.Matrix4,d.extractRotation(c,b.scale));for(var n=0,r=h.length;n<r;n++){var m=h[n].clone();c&&c.multiplyVector3(m);g.push(m)}n=0;for(r=j.length;n<r;n++){var g=j[n],
p,t,s=g.vertexNormals,v=g.vertexColors;g instanceof THREE.Face3?p=new THREE.Face3(g.a+f,g.b+f,g.c+f):g instanceof THREE.Face4&&(p=new THREE.Face4(g.a+f,g.b+f,g.c+f,g.d+f));p.normal.copy(g.normal);d&&d.multiplyVector3(p.normal);h=0;for(m=s.length;h<m;h++)t=s[h].clone(),d&&d.multiplyVector3(t),p.vertexNormals.push(t);p.color.copy(g.color);h=0;for(m=v.length;h<m;h++)t=v[h],p.vertexColors.push(t.clone());void 0!==g.materialIndex&&(h=e.materials[g.materialIndex],m=h.id,v=l[m],void 0===v&&(v=a.materials.length,
l[m]=v,a.materials.push(h)),p.materialIndex=v);p.centroid.copy(g.centroid);c&&c.multiplyVector3(p.centroid);i.push(p)}n=0;for(r=q.length;n<r;n++){c=q[n];d=[];h=0;for(m=c.length;h<m;h++)d.push(new THREE.UV(c[h].u,c[h].v));k.push(d)}},clone:function(a){var b=new THREE.Geometry,c,d=a.vertices,f=a.faces,e=a.faceVertexUvs[0];a.materials&&(b.materials=a.materials.slice());a=0;for(c=d.length;a<c;a++)b.vertices.push(d[a].clone());a=0;for(c=f.length;a<c;a++)b.faces.push(f[a].clone());a=0;for(c=e.length;a<
c;a++){for(var d=e[a],f=[],g=0,h=d.length;g<h;g++)f.push(new THREE.UV(d[g].u,d[g].v));b.faceVertexUvs[0].push(f)}return b},randomPointInTriangle:function(a,b,c){var d,f,e,g=new THREE.Vector3,h=THREE.GeometryUtils.__v1;d=THREE.GeometryUtils.random();f=THREE.GeometryUtils.random();1<d+f&&(d=1-d,f=1-f);e=1-d-f;g.copy(a);g.multiplyScalar(d);h.copy(b);h.multiplyScalar(f);g.addSelf(h);h.copy(c);h.multiplyScalar(e);g.addSelf(h);return g},randomPointInFace:function(a,b,c){var d,f,e;if(a instanceof THREE.Face3)return d=
b.vertices[a.a],f=b.vertices[a.b],e=b.vertices[a.c],THREE.GeometryUtils.randomPointInTriangle(d,f,e);if(a instanceof THREE.Face4){d=b.vertices[a.a];f=b.vertices[a.b];e=b.vertices[a.c];var b=b.vertices[a.d],g;c?a._area1&&a._area2?(c=a._area1,g=a._area2):(c=THREE.GeometryUtils.triangleArea(d,f,b),g=THREE.GeometryUtils.triangleArea(f,e,b),a._area1=c,a._area2=g):(c=THREE.GeometryUtils.triangleArea(d,f,b),g=THREE.GeometryUtils.triangleArea(f,e,b));return THREE.GeometryUtils.random()*(c+g)<c?THREE.GeometryUtils.randomPointInTriangle(d,
f,b):THREE.GeometryUtils.randomPointInTriangle(f,e,b)}},randomPointsInGeometry:function(a,b){function c(a){function b(c,d){if(d<c)return c;var f=c+Math.floor((d-c)/2);return j[f]>a?b(c,f-1):j[f]<a?b(f+1,d):f}return b(0,j.length-1)}var d,f,e=a.faces,g=a.vertices,h=e.length,i=0,j=[],k,q,l,n;for(f=0;f<h;f++)d=e[f],d instanceof THREE.Face3?(k=g[d.a],q=g[d.b],l=g[d.c],d._area=THREE.GeometryUtils.triangleArea(k,q,l)):d instanceof THREE.Face4&&(k=g[d.a],q=g[d.b],l=g[d.c],n=g[d.d],d._area1=THREE.GeometryUtils.triangleArea(k,
q,n),d._area2=THREE.GeometryUtils.triangleArea(q,l,n),d._area=d._area1+d._area2),i+=d._area,j[f]=i;d=[];for(f=0;f<b;f++)g=THREE.GeometryUtils.random()*i,g=c(g),d[f]=THREE.GeometryUtils.randomPointInFace(e[g],a,!0);return d},triangleArea:function(a,b,c){var d,f=THREE.GeometryUtils.__v1;f.sub(a,b);d=f.length();f.sub(a,c);a=f.length();f.sub(b,c);c=f.length();b=0.5*(d+a+c);return Math.sqrt(b*(b-d)*(b-a)*(b-c))},center:function(a){a.computeBoundingBox();var b=a.boundingBox,c=new THREE.Vector3;c.add(b.min,
b.max);c.multiplyScalar(-0.5);a.applyMatrix((new THREE.Matrix4).makeTranslation(c.x,c.y,c.z));a.computeBoundingBox();return c},normalizeUVs:function(a){for(var a=a.faceVertexUvs[0],b=0,c=a.length;b<c;b++)for(var d=a[b],f=0,e=d.length;f<e;f++)if(1!==d[f].u&&(d[f].u-=Math.floor(d[f].u)),1!==d[f].v)d[f].v-=Math.floor(d[f].v)},triangulateQuads:function(a){var b,c,d,f,e=[],g=[],h=[];b=0;for(c=a.faceUvs.length;b<c;b++)g[b]=[];b=0;for(c=a.faceVertexUvs.length;b<c;b++)h[b]=[];b=0;for(c=a.faces.length;b<c;b++)if(d=
a.faces[b],d instanceof THREE.Face4){f=d.a;var i=d.b,j=d.c,k=d.d,q=new THREE.Face3,l=new THREE.Face3;q.color.copy(d.color);l.color.copy(d.color);q.materialIndex=d.materialIndex;l.materialIndex=d.materialIndex;q.a=f;q.b=i;q.c=k;l.a=i;l.b=j;l.c=k;4===d.vertexColors.length&&(q.vertexColors[0]=d.vertexColors[0].clone(),q.vertexColors[1]=d.vertexColors[1].clone(),q.vertexColors[2]=d.vertexColors[3].clone(),l.vertexColors[0]=d.vertexColors[1].clone(),l.vertexColors[1]=d.vertexColors[2].clone(),l.vertexColors[2]=
d.vertexColors[3].clone());e.push(q,l);d=0;for(f=a.faceVertexUvs.length;d<f;d++)a.faceVertexUvs[d].length&&(q=a.faceVertexUvs[d][b],i=q[1],j=q[2],k=q[3],q=[q[0].clone(),i.clone(),k.clone()],i=[i.clone(),j.clone(),k.clone()],h[d].push(q,i));d=0;for(f=a.faceUvs.length;d<f;d++)a.faceUvs[d].length&&(i=a.faceUvs[d][b],g[d].push(i,i))}else{e.push(d);d=0;for(f=a.faceUvs.length;d<f;d++)g[d].push(a.faceUvs[d]);d=0;for(f=a.faceVertexUvs.length;d<f;d++)h[d].push(a.faceVertexUvs[d])}a.faces=e;a.faceUvs=g;a.faceVertexUvs=
h;a.computeCentroids();a.computeFaceNormals();a.computeVertexNormals();a.hasTangents&&a.computeTangents()},explode:function(a){for(var b=[],c=0,d=a.faces.length;c<d;c++){var f=b.length,e=a.faces[c];if(e instanceof THREE.Face4){var g=e.a,h=e.b,i=e.c,g=a.vertices[g],h=a.vertices[h],i=a.vertices[i],j=a.vertices[e.d];b.push(g.clone());b.push(h.clone());b.push(i.clone());b.push(j.clone());e.a=f;e.b=f+1;e.c=f+2;e.d=f+3}else g=e.a,h=e.b,i=e.c,g=a.vertices[g],h=a.vertices[h],i=a.vertices[i],b.push(g.clone()),
b.push(h.clone()),b.push(i.clone()),e.a=f,e.b=f+1,e.c=f+2}a.vertices=b;delete a.__tmpVertices},tessellate:function(a,b){var c,d,f,e,g,h,i,j,k,q,l,n,r,m,p,t,s,v,o,x=[],y=[];c=0;for(d=a.faceVertexUvs.length;c<d;c++)y[c]=[];c=0;for(d=a.faces.length;c<d;c++)if(f=a.faces[c],f instanceof THREE.Face3)if(e=f.a,g=f.b,h=f.c,j=a.vertices[e],k=a.vertices[g],q=a.vertices[h],n=j.distanceTo(k),r=k.distanceTo(q),l=j.distanceTo(q),n>b||r>b||l>b){i=a.vertices.length;v=f.clone();o=f.clone();n>=r&&n>=l?(j=j.clone(),
j.lerpSelf(k,0.5),v.a=e,v.b=i,v.c=h,o.a=i,o.b=g,o.c=h,3===f.vertexNormals.length&&(e=f.vertexNormals[0].clone(),e.lerpSelf(f.vertexNormals[1],0.5),v.vertexNormals[1].copy(e),o.vertexNormals[0].copy(e)),3===f.vertexColors.length&&(e=f.vertexColors[0].clone(),e.lerpSelf(f.vertexColors[1],0.5),v.vertexColors[1].copy(e),o.vertexColors[0].copy(e)),f=0):r>=n&&r>=l?(j=k.clone(),j.lerpSelf(q,0.5),v.a=e,v.b=g,v.c=i,o.a=i,o.b=h,o.c=e,3===f.vertexNormals.length&&(e=f.vertexNormals[1].clone(),e.lerpSelf(f.vertexNormals[2],
0.5),v.vertexNormals[2].copy(e),o.vertexNormals[0].copy(e),o.vertexNormals[1].copy(f.vertexNormals[2]),o.vertexNormals[2].copy(f.vertexNormals[0])),3===f.vertexColors.length&&(e=f.vertexColors[1].clone(),e.lerpSelf(f.vertexColors[2],0.5),v.vertexColors[2].copy(e),o.vertexColors[0].copy(e),o.vertexColors[1].copy(f.vertexColors[2]),o.vertexColors[2].copy(f.vertexColors[0])),f=1):(j=j.clone(),j.lerpSelf(q,0.5),v.a=e,v.b=g,v.c=i,o.a=i,o.b=g,o.c=h,3===f.vertexNormals.length&&(e=f.vertexNormals[0].clone(),
e.lerpSelf(f.vertexNormals[2],0.5),v.vertexNormals[2].copy(e),o.vertexNormals[0].copy(e)),3===f.vertexColors.length&&(e=f.vertexColors[0].clone(),e.lerpSelf(f.vertexColors[2],0.5),v.vertexColors[2].copy(e),o.vertexColors[0].copy(e)),f=2);x.push(v,o);a.vertices.push(j);e=0;for(g=a.faceVertexUvs.length;e<g;e++)a.faceVertexUvs[e].length&&(j=a.faceVertexUvs[e][c],o=j[0],h=j[1],v=j[2],0===f?(k=o.clone(),k.lerpSelf(h,0.5),j=[o.clone(),k.clone(),v.clone()],h=[k.clone(),h.clone(),v.clone()]):1===f?(k=h.clone(),
k.lerpSelf(v,0.5),j=[o.clone(),h.clone(),k.clone()],h=[k.clone(),v.clone(),o.clone()]):(k=o.clone(),k.lerpSelf(v,0.5),j=[o.clone(),h.clone(),k.clone()],h=[k.clone(),h.clone(),v.clone()]),y[e].push(j,h))}else{x.push(f);e=0;for(g=a.faceVertexUvs.length;e<g;e++)y[e].push(a.faceVertexUvs[e][c])}else if(e=f.a,g=f.b,h=f.c,i=f.d,j=a.vertices[e],k=a.vertices[g],q=a.vertices[h],l=a.vertices[i],n=j.distanceTo(k),r=k.distanceTo(q),m=q.distanceTo(l),p=j.distanceTo(l),n>b||r>b||m>b||p>b){t=a.vertices.length;s=
a.vertices.length+1;v=f.clone();o=f.clone();n>=r&&n>=m&&n>=p||m>=r&&m>=n&&m>=p?(n=j.clone(),n.lerpSelf(k,0.5),k=q.clone(),k.lerpSelf(l,0.5),v.a=e,v.b=t,v.c=s,v.d=i,o.a=t,o.b=g,o.c=h,o.d=s,4===f.vertexNormals.length&&(e=f.vertexNormals[0].clone(),e.lerpSelf(f.vertexNormals[1],0.5),g=f.vertexNormals[2].clone(),g.lerpSelf(f.vertexNormals[3],0.5),v.vertexNormals[1].copy(e),v.vertexNormals[2].copy(g),o.vertexNormals[0].copy(e),o.vertexNormals[3].copy(g)),4===f.vertexColors.length&&(e=f.vertexColors[0].clone(),
e.lerpSelf(f.vertexColors[1],0.5),g=f.vertexColors[2].clone(),g.lerpSelf(f.vertexColors[3],0.5),v.vertexColors[1].copy(e),v.vertexColors[2].copy(g),o.vertexColors[0].copy(e),o.vertexColors[3].copy(g)),f=0):(n=k.clone(),n.lerpSelf(q,0.5),k=l.clone(),k.lerpSelf(j,0.5),v.a=e,v.b=g,v.c=t,v.d=s,o.a=s,o.b=t,o.c=h,o.d=i,4===f.vertexNormals.length&&(e=f.vertexNormals[1].clone(),e.lerpSelf(f.vertexNormals[2],0.5),g=f.vertexNormals[3].clone(),g.lerpSelf(f.vertexNormals[0],0.5),v.vertexNormals[2].copy(e),v.vertexNormals[3].copy(g),
o.vertexNormals[0].copy(g),o.vertexNormals[1].copy(e)),4===f.vertexColors.length&&(e=f.vertexColors[1].clone(),e.lerpSelf(f.vertexColors[2],0.5),g=f.vertexColors[3].clone(),g.lerpSelf(f.vertexColors[0],0.5),v.vertexColors[2].copy(e),v.vertexColors[3].copy(g),o.vertexColors[0].copy(g),o.vertexColors[1].copy(e)),f=1);x.push(v,o);a.vertices.push(n,k);e=0;for(g=a.faceVertexUvs.length;e<g;e++)a.faceVertexUvs[e].length&&(j=a.faceVertexUvs[e][c],o=j[0],h=j[1],v=j[2],j=j[3],0===f?(k=o.clone(),k.lerpSelf(h,
0.5),q=v.clone(),q.lerpSelf(j,0.5),o=[o.clone(),k.clone(),q.clone(),j.clone()],h=[k.clone(),h.clone(),v.clone(),q.clone()]):(k=h.clone(),k.lerpSelf(v,0.5),q=j.clone(),q.lerpSelf(o,0.5),o=[o.clone(),h.clone(),k.clone(),q.clone()],h=[q.clone(),k.clone(),v.clone(),j.clone()]),y[e].push(o,h))}else{x.push(f);e=0;for(g=a.faceVertexUvs.length;e<g;e++)y[e].push(a.faceVertexUvs[e][c])}a.faces=x;a.faceVertexUvs=y}};THREE.GeometryUtils.random=THREE.Math.random16;THREE.GeometryUtils.__v1=new THREE.Vector3;
THREE.ImageUtils={crossOrigin:"anonymous",loadTexture:function(a,b,c){var d=new Image,f=new THREE.Texture(d,b);d.onload=function(){f.needsUpdate=!0;c&&c(this)};d.crossOrigin=this.crossOrigin;d.src=a;return f},loadTextureCube:function(a,b,c){var d,f=[],e=new THREE.Texture(f,b),b=f.loadCount=0;for(d=a.length;b<d;++b)f[b]=new Image,f[b].onload=function(){f.loadCount+=1;6===f.loadCount&&(e.needsUpdate=!0);c&&c(this)},f[b].crossOrigin=this.crossOrigin,f[b].src=a[b];return e},getNormalMap:function(a,b){var c=
function(a){var b=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);return[a[0]/b,a[1]/b,a[2]/b]},b=b|1,d=a.width,f=a.height,e=document.createElement("canvas");e.width=d;e.height=f;var g=e.getContext("2d");g.drawImage(a,0,0);for(var h=g.getImageData(0,0,d,f).data,i=g.createImageData(d,f),j=i.data,k=0;k<d;k++)for(var q=1;q<f;q++){var l=0>q-1?f-1:q-1,n=(q+1)%f,r=0>k-1?d-1:k-1,m=(k+1)%d,p=[],t=[0,0,h[4*(q*d+k)]/255*b];p.push([-1,0,h[4*(q*d+r)]/255*b]);p.push([-1,-1,h[4*(l*d+r)]/255*b]);p.push([0,-1,h[4*(l*d+
k)]/255*b]);p.push([1,-1,h[4*(l*d+m)]/255*b]);p.push([1,0,h[4*(q*d+m)]/255*b]);p.push([1,1,h[4*(n*d+m)]/255*b]);p.push([0,1,h[4*(n*d+k)]/255*b]);p.push([-1,1,h[4*(n*d+r)]/255*b]);l=[];r=p.length;for(n=0;n<r;n++){var m=p[n],s=p[(n+1)%r],m=[m[0]-t[0],m[1]-t[1],m[2]-t[2]],s=[s[0]-t[0],s[1]-t[1],s[2]-t[2]];l.push(c([m[1]*s[2]-m[2]*s[1],m[2]*s[0]-m[0]*s[2],m[0]*s[1]-m[1]*s[0]]))}p=[0,0,0];for(n=0;n<l.length;n++)p[0]+=l[n][0],p[1]+=l[n][1],p[2]+=l[n][2];p[0]/=l.length;p[1]/=l.length;p[2]/=l.length;t=4*
(q*d+k);j[t]=255*((p[0]+1)/2)|0;j[t+1]=255*(p[1]+0.5)|0;j[t+2]=255*p[2]|0;j[t+3]=255}g.putImageData(i,0,0);return e},generateDataTexture:function(a,b,c){for(var d=a*b,f=new Uint8Array(3*d),e=Math.floor(255*c.r),g=Math.floor(255*c.g),c=Math.floor(255*c.b),h=0;h<d;h++)f[3*h]=e,f[3*h+1]=g,f[3*h+2]=c;a=new THREE.DataTexture(f,a,b,THREE.RGBFormat);a.needsUpdate=!0;return a}};
THREE.SceneUtils={showHierarchy:function(a,b){THREE.SceneUtils.traverseHierarchy(a,function(a){a.visible=b})},traverseHierarchy:function(a,b){var c,d,f=a.children.length;for(d=0;d<f;d++)c=a.children[d],b(c),THREE.SceneUtils.traverseHierarchy(c,b)},createMultiMaterialObject:function(a,b){var c,d=b.length,f=new THREE.Object3D;for(c=0;c<d;c++){var e=new THREE.Mesh(a,b[c]);f.add(e)}return f},cloneObject:function(a){var b;a instanceof THREE.MorphAnimMesh?(b=new THREE.MorphAnimMesh(a.geometry,a.material),
b.duration=a.duration,b.mirroredLoop=a.mirroredLoop,b.time=a.time,b.lastKeyframe=a.lastKeyframe,b.currentKeyframe=a.currentKeyframe,b.direction=a.direction,b.directionBackwards=a.directionBackwards):a instanceof THREE.SkinnedMesh?b=new THREE.SkinnedMesh(a.geometry,a.material):a instanceof THREE.Mesh?b=new THREE.Mesh(a.geometry,a.material):a instanceof THREE.Line?b=new THREE.Line(a.geometry,a.material,a.type):a instanceof THREE.Ribbon?b=new THREE.Ribbon(a.geometry,a.material):a instanceof THREE.ParticleSystem?
(b=new THREE.ParticleSystem(a.geometry,a.material),b.sortParticles=a.sortParticles):a instanceof THREE.Particle?b=new THREE.Particle(a.material):a instanceof THREE.Sprite?(b=new THREE.Sprite({}),b.color.copy(a.color),b.map=a.map,b.blending=a.blending,b.useScreenCoordinates=a.useScreenCoordinates,b.mergeWith3D=a.mergeWith3D,b.affectedByDistance=a.affectedByDistance,b.scaleByViewport=a.scaleByViewport,b.alignment=a.alignment,b.rotation3d.copy(a.rotation3d),b.rotation=a.rotation,b.opacity=a.opacity,
b.uvOffset.copy(a.uvOffset),b.uvScale.copy(a.uvScale)):a instanceof THREE.LOD?b=new THREE.LOD:a instanceof THREE.MarchingCubes?(b=new THREE.MarchingCubes(a.resolution,a.material),b.field.set(a.field),b.isolation=a.isolation):a instanceof THREE.Object3D&&(b=new THREE.Object3D);b.name=a.name;b.parent=a.parent;b.up.copy(a.up);b.position.copy(a.position);b.rotation instanceof THREE.Vector3&&b.rotation.copy(a.rotation);b.eulerOrder=a.eulerOrder;b.scale.copy(a.scale);b.dynamic=a.dynamic;b.doubleSided=a.doubleSided;
b.flipSided=a.flipSided;b.renderDepth=a.renderDepth;b.rotationAutoUpdate=a.rotationAutoUpdate;b.matrix.copy(a.matrix);b.matrixWorld.copy(a.matrixWorld);b.matrixRotationWorld.copy(a.matrixRotationWorld);b.matrixAutoUpdate=a.matrixAutoUpdate;b.matrixWorldNeedsUpdate=a.matrixWorldNeedsUpdate;b.quaternion.copy(a.quaternion);b.useQuaternion=a.useQuaternion;b.boundRadius=a.boundRadius;b.boundRadiusScale=a.boundRadiusScale;b.visible=a.visible;b.castShadow=a.castShadow;b.receiveShadow=a.receiveShadow;b.frustumCulled=
a.frustumCulled;for(var c=0;c<a.children.length;c++){var d=THREE.SceneUtils.cloneObject(a.children[c]);b.children[c]=d;d.parent=b}if(a instanceof THREE.LOD)for(c=0;c<a.LODs.length;c++)b.LODs[c]={visibleAtDistance:a.LODs[c].visibleAtDistance,object3D:b.children[c]};return b},detach:function(a,b,c){a.applyMatrix(b.matrixWorld);b.remove(a);c.add(a)},attach:function(a,b,c){var d=new THREE.Matrix4;d.getInverse(c.matrixWorld);a.applyMatrix(d);b.remove(a);c.add(a)}};
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
THREE.Curve=function(){};THREE.Curve.prototype.getPoint=function(){console.log("Warning, getPoint() not implemented!");return null};THREE.Curve.prototype.getPointAt=function(a){return this.getPoint(this.getUtoTmapping(a))};THREE.Curve.prototype.getPoints=function(a){a||(a=5);var b,c=[];for(b=0;b<=a;b++)c.push(this.getPoint(b/a));return c};THREE.Curve.prototype.getSpacedPoints=function(a){a||(a=5);var b,c=[];for(b=0;b<=a;b++)c.push(this.getPointAt(b/a));return c};
THREE.Curve.prototype.getLength=function(){var a=this.getLengths();return a[a.length-1]};THREE.Curve.prototype.getLengths=function(a){a||(a=this.__arcLengthDivisions?this.__arcLengthDivisions:200);if(this.cacheArcLengths&&this.cacheArcLengths.length==a+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=false;var b=[],c,d=this.getPoint(0),f,e=0;b.push(0);for(f=1;f<=a;f++){c=this.getPoint(f/a);e=e+c.distanceTo(d);b.push(e);d=c}return this.cacheArcLengths=b};
THREE.Curve.prototype.updateArcLengths=function(){this.needsUpdate=true;this.getLengths()};THREE.Curve.prototype.getUtoTmapping=function(a,b){var c=this.getLengths(),d=0,f=c.length,e;e=b?b:a*c[f-1];for(var g=0,h=f-1,i;g<=h;){d=Math.floor(g+(h-g)/2);i=c[d]-e;if(i<0)g=d+1;else if(i>0)h=d-1;else{h=d;break}}d=h;if(c[d]==e)return d/(f-1);g=c[d];return c=(d+(e-g)/(c[d+1]-g))/(f-1)};THREE.Curve.prototype.getNormalVector=function(a){a=this.getTangent(a);return new THREE.Vector2(-a.y,a.x)};
THREE.Curve.prototype.getTangent=function(a){var b=a-1.0E-4,a=a+1.0E-4;b<0&&(b=0);a>1&&(a=1);b=this.getPoint(b);return this.getPoint(a).clone().subSelf(b).normalize()};THREE.Curve.prototype.getTangentAt=function(a){return this.getTangent(this.getUtoTmapping(a))};THREE.LineCurve=function(a,b){this.v1=a;this.v2=b};THREE.LineCurve.prototype=new THREE.Curve;THREE.LineCurve.prototype.constructor=THREE.LineCurve;
THREE.LineCurve.prototype.getPoint=function(a){var b=this.v2.clone().subSelf(this.v1);b.multiplyScalar(a).addSelf(this.v1);return b};THREE.LineCurve.prototype.getPointAt=function(a){return this.getPoint(a)};THREE.LineCurve.prototype.getTangent=function(){return this.v2.clone().subSelf(this.v1).normalize()};THREE.QuadraticBezierCurve=function(a,b,c){this.v0=a;this.v1=b;this.v2=c};THREE.QuadraticBezierCurve.prototype=new THREE.Curve;THREE.QuadraticBezierCurve.prototype.constructor=THREE.QuadraticBezierCurve;
THREE.QuadraticBezierCurve.prototype.getPoint=function(a){var b;b=THREE.Shape.Utils.b2(a,this.v0.x,this.v1.x,this.v2.x);a=THREE.Shape.Utils.b2(a,this.v0.y,this.v1.y,this.v2.y);return new THREE.Vector2(b,a)};THREE.QuadraticBezierCurve.prototype.getTangent=function(a){var b;b=THREE.Curve.Utils.tangentQuadraticBezier(a,this.v0.x,this.v1.x,this.v2.x);a=THREE.Curve.Utils.tangentQuadraticBezier(a,this.v0.y,this.v1.y,this.v2.y);b=new THREE.Vector2(b,a);b.normalize();return b};
THREE.CubicBezierCurve=function(a,b,c,d){this.v0=a;this.v1=b;this.v2=c;this.v3=d};THREE.CubicBezierCurve.prototype=new THREE.Curve;THREE.CubicBezierCurve.prototype.constructor=THREE.CubicBezierCurve;THREE.CubicBezierCurve.prototype.getPoint=function(a){var b;b=THREE.Shape.Utils.b3(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x);a=THREE.Shape.Utils.b3(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y);return new THREE.Vector2(b,a)};
THREE.CubicBezierCurve.prototype.getTangent=function(a){var b;b=THREE.Curve.Utils.tangentCubicBezier(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x);a=THREE.Curve.Utils.tangentCubicBezier(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y);b=new THREE.Vector2(b,a);b.normalize();return b};THREE.SplineCurve=function(a){this.points=a==void 0?[]:a};THREE.SplineCurve.prototype=new THREE.Curve;THREE.SplineCurve.prototype.constructor=THREE.SplineCurve;
THREE.SplineCurve.prototype.getPoint=function(a){var b=new THREE.Vector2,c=[],d=this.points,f;f=(d.length-1)*a;a=Math.floor(f);f=f-a;c[0]=a==0?a:a-1;c[1]=a;c[2]=a>d.length-2?d.length-1:a+1;c[3]=a>d.length-3?d.length-1:a+2;b.x=THREE.Curve.Utils.interpolate(d[c[0]].x,d[c[1]].x,d[c[2]].x,d[c[3]].x,f);b.y=THREE.Curve.Utils.interpolate(d[c[0]].y,d[c[1]].y,d[c[2]].y,d[c[3]].y,f);return b};
THREE.ArcCurve=function(a,b,c,d,f,e){this.aX=a;this.aY=b;this.aRadius=c;this.aStartAngle=d;this.aEndAngle=f;this.aClockwise=e};THREE.ArcCurve.prototype=new THREE.Curve;THREE.ArcCurve.prototype.constructor=THREE.ArcCurve;THREE.ArcCurve.prototype.getPoint=function(a){var b=this.aEndAngle-this.aStartAngle;this.aClockwise||(a=1-a);b=this.aStartAngle+a*b;a=this.aX+this.aRadius*Math.cos(b);b=this.aY+this.aRadius*Math.sin(b);return new THREE.Vector2(a,b)};
THREE.Curve.Utils={tangentQuadraticBezier:function(a,b,c,d){return 2*(1-a)*(c-b)+2*a*(d-c)},tangentCubicBezier:function(a,b,c,d,f){return-3*b*(1-a)*(1-a)+3*c*(1-a)*(1-a)-6*a*c*(1-a)+6*a*d*(1-a)-3*a*a*d+3*a*a*f},tangentSpline:function(a){return 6*a*a-6*a+(3*a*a-4*a+1)+(-6*a*a+6*a)+(3*a*a-2*a)},interpolate:function(a,b,c,d,f){var a=(c-a)*0.5,d=(d-b)*0.5,e=f*f;return(2*b-2*c+a+d)*f*e+(-3*b+3*c-2*a-d)*e+a*f+b}};
THREE.Curve.create=function(a,b){a.prototype=new THREE.Curve;a.prototype.constructor=a;a.prototype.getPoint=b;return a};THREE.LineCurve3=THREE.Curve.create(function(a,b){this.v1=a;this.v2=b},function(a){var b=new THREE.Vector3;b.sub(this.v2,this.v1);b.multiplyScalar(a);b.addSelf(this.v1);return b});
THREE.QuadraticBezierCurve3=THREE.Curve.create(function(a,b,c){this.v0=a;this.v1=b;this.v2=c},function(a){var b,c;b=THREE.Shape.Utils.b2(a,this.v0.x,this.v1.x,this.v2.x);c=THREE.Shape.Utils.b2(a,this.v0.y,this.v1.y,this.v2.y);a=THREE.Shape.Utils.b2(a,this.v0.z,this.v1.z,this.v2.z);return new THREE.Vector3(b,c,a)});
THREE.CubicBezierCurve3=THREE.Curve.create(function(a,b,c,d){this.v0=a;this.v1=b;this.v2=c;this.v3=d},function(a){var b,c;b=THREE.Shape.Utils.b3(a,this.v0.x,this.v1.x,this.v2.x,this.v3.x);c=THREE.Shape.Utils.b3(a,this.v0.y,this.v1.y,this.v2.y,this.v3.y);a=THREE.Shape.Utils.b3(a,this.v0.z,this.v1.z,this.v2.z,this.v3.z);return new THREE.Vector3(b,c,a)});
THREE.SplineCurve3=THREE.Curve.create(function(a){this.points=a==void 0?[]:a},function(a){var b=new THREE.Vector3,c=[],d=this.points,f,a=(d.length-1)*a;f=Math.floor(a);a=a-f;c[0]=f==0?f:f-1;c[1]=f;c[2]=f>d.length-2?d.length-1:f+1;c[3]=f>d.length-3?d.length-1:f+2;f=d[c[0]];var e=d[c[1]],g=d[c[2]],c=d[c[3]];b.x=THREE.Curve.Utils.interpolate(f.x,e.x,g.x,c.x,a);b.y=THREE.Curve.Utils.interpolate(f.y,e.y,g.y,c.y,a);b.z=THREE.Curve.Utils.interpolate(f.z,e.z,g.z,c.z,a);return b});
THREE.ClosedSplineCurve3=THREE.Curve.create(function(a){this.points=a==void 0?[]:a},function(a){var b=new THREE.Vector3,c=[],d=this.points,f;f=(d.length-0)*a;a=Math.floor(f);f=f-a;a=a+(a>0?0:(Math.floor(Math.abs(a)/d.length)+1)*d.length);c[0]=(a-1)%d.length;c[1]=a%d.length;c[2]=(a+1)%d.length;c[3]=(a+2)%d.length;b.x=THREE.Curve.Utils.interpolate(d[c[0]].x,d[c[1]].x,d[c[2]].x,d[c[3]].x,f);b.y=THREE.Curve.Utils.interpolate(d[c[0]].y,d[c[1]].y,d[c[2]].y,d[c[3]].y,f);b.z=THREE.Curve.Utils.interpolate(d[c[0]].z,
d[c[1]].z,d[c[2]].z,d[c[3]].z,f);return b});THREE.CurvePath=function(){this.curves=[];this.bends=[];this.autoClose=false};THREE.CurvePath.prototype=new THREE.Curve;THREE.CurvePath.prototype.constructor=THREE.CurvePath;THREE.CurvePath.prototype.add=function(a){this.curves.push(a)};THREE.CurvePath.prototype.checkConnection=function(){};
THREE.CurvePath.prototype.closePath=function(){var a=this.curves[0].getPoint(0),b=this.curves[this.curves.length-1].getPoint(1);a.equals(b)||this.curves.push(new THREE.LineCurve(b,a))};THREE.CurvePath.prototype.getPoint=function(a){for(var b=a*this.getLength(),c=this.getCurveLengths(),a=0;a<c.length;){if(c[a]>=b){b=c[a]-b;a=this.curves[a];b=1-b/a.getLength();return a.getPointAt(b)}a++}return null};THREE.CurvePath.prototype.getLength=function(){var a=this.getCurveLengths();return a[a.length-1]};
THREE.CurvePath.prototype.getCurveLengths=function(){if(this.cacheLengths&&this.cacheLengths.length==this.curves.length)return this.cacheLengths;var a=[],b=0,c,d=this.curves.length;for(c=0;c<d;c++){b=b+this.curves[c].getLength();a.push(b)}return this.cacheLengths=a};
THREE.CurvePath.prototype.getBoundingBox=function(){var a=this.getPoints(),b,c,d,f;b=c=Number.NEGATIVE_INFINITY;d=f=Number.POSITIVE_INFINITY;var e,g,h,i;i=new THREE.Vector2;g=0;for(h=a.length;g<h;g++){e=a[g];if(e.x>b)b=e.x;else if(e.x<d)d=e.x;if(e.y>c)c=e.y;else if(e.y<c)f=e.y;i.addSelf(e.x,e.y)}return{minX:d,minY:f,maxX:b,maxY:c,centroid:i.divideScalar(h)}};THREE.CurvePath.prototype.createPointsGeometry=function(a){return this.createGeometry(this.getPoints(a,true))};
THREE.CurvePath.prototype.createSpacedPointsGeometry=function(a){return this.createGeometry(this.getSpacedPoints(a,true))};THREE.CurvePath.prototype.createGeometry=function(a){for(var b=new THREE.Geometry,c=0;c<a.length;c++)b.vertices.push(new THREE.Vertex(a[c].x,a[c].y,0));return b};THREE.CurvePath.prototype.addWrapPath=function(a){this.bends.push(a)};
THREE.CurvePath.prototype.getTransformedPoints=function(a,b){var c=this.getPoints(a),d,f;if(!b)b=this.bends;d=0;for(f=b.length;d<f;d++)c=this.getWrapPoints(c,b[d]);return c};THREE.CurvePath.prototype.getTransformedSpacedPoints=function(a,b){var c=this.getSpacedPoints(a),d,f;if(!b)b=this.bends;d=0;for(f=b.length;d<f;d++)c=this.getWrapPoints(c,b[d]);return c};
THREE.CurvePath.prototype.getWrapPoints=function(a,b){var c=this.getBoundingBox(),d,f,e,g,h,i;d=0;for(f=a.length;d<f;d++){e=a[d];g=e.x;h=e.y;i=g/c.maxX;i=b.getUtoTmapping(i,g);g=b.getPoint(i);h=b.getNormalVector(i).multiplyScalar(h);e.x=g.x+h.x;e.y=g.y+h.y}return a};
THREE.EventTarget=function(){var a={};this.addEventListener=function(b,c){a[b]==void 0&&(a[b]=[]);a[b].indexOf(c)===-1&&a[b].push(c)};this.dispatchEvent=function(b){for(var c in a[b.type])a[b.type][c](b)};this.removeEventListener=function(b,c){var d=a[b].indexOf(c);d!==-1&&a[b].splice(d,1)}};THREE.Gyroscope=function(){THREE.Object3D.call(this)};THREE.Gyroscope.prototype=new THREE.Object3D;THREE.Gyroscope.prototype.constructor=THREE.Gyroscope;
THREE.Gyroscope.prototype.updateMatrixWorld=function(a){this.matrixAutoUpdate&&this.updateMatrix();if(this.matrixWorldNeedsUpdate||a){if(this.parent){this.matrixWorld.multiply(this.parent.matrixWorld,this.matrix);this.matrixWorld.decompose(this.translationWorld,this.rotationWorld,this.scaleWorld);this.matrix.decompose(this.translationObject,this.rotationObject,this.scaleObject);this.matrixWorld.compose(this.translationWorld,this.rotationObject,this.scaleWorld)}else this.matrixWorld.copy(this.matrix);
this.matrixWorldNeedsUpdate=false;a=true}for(var b=0,c=this.children.length;b<c;b++)this.children[b].updateMatrixWorld(a)};THREE.Gyroscope.prototype.translationWorld=new THREE.Vector3;THREE.Gyroscope.prototype.translationObject=new THREE.Vector3;THREE.Gyroscope.prototype.rotationWorld=new THREE.Quaternion;THREE.Gyroscope.prototype.rotationObject=new THREE.Quaternion;THREE.Gyroscope.prototype.scaleWorld=new THREE.Vector3;THREE.Gyroscope.prototype.scaleObject=new THREE.Vector3;
THREE.Path=function(a){THREE.CurvePath.call(this);this.actions=[];a&&this.fromPoints(a)};THREE.Path.prototype=new THREE.CurvePath;THREE.Path.prototype.constructor=THREE.Path;THREE.PathActions={MOVE_TO:"moveTo",LINE_TO:"lineTo",QUADRATIC_CURVE_TO:"quadraticCurveTo",BEZIER_CURVE_TO:"bezierCurveTo",CSPLINE_THRU:"splineThru",ARC:"arc"};THREE.Path.prototype.fromPoints=function(a){this.moveTo(a[0].x,a[0].y);for(var b=1,c=a.length;b<c;b++)this.lineTo(a[b].x,a[b].y)};
THREE.Path.prototype.moveTo=function(a,b){var c=Array.prototype.slice.call(arguments);this.actions.push({action:THREE.PathActions.MOVE_TO,args:c})};THREE.Path.prototype.lineTo=function(a,b){var c=Array.prototype.slice.call(arguments),d=this.actions[this.actions.length-1].args;this.curves.push(new THREE.LineCurve(new THREE.Vector2(d[d.length-2],d[d.length-1]),new THREE.Vector2(a,b)));this.actions.push({action:THREE.PathActions.LINE_TO,args:c})};
THREE.Path.prototype.quadraticCurveTo=function(a,b,c,d){var f=Array.prototype.slice.call(arguments),e=this.actions[this.actions.length-1].args;this.curves.push(new THREE.QuadraticBezierCurve(new THREE.Vector2(e[e.length-2],e[e.length-1]),new THREE.Vector2(a,b),new THREE.Vector2(c,d)));this.actions.push({action:THREE.PathActions.QUADRATIC_CURVE_TO,args:f})};
THREE.Path.prototype.bezierCurveTo=function(a,b,c,d,f,e){var g=Array.prototype.slice.call(arguments),h=this.actions[this.actions.length-1].args;this.curves.push(new THREE.CubicBezierCurve(new THREE.Vector2(h[h.length-2],h[h.length-1]),new THREE.Vector2(a,b),new THREE.Vector2(c,d),new THREE.Vector2(f,e)));this.actions.push({action:THREE.PathActions.BEZIER_CURVE_TO,args:g})};
THREE.Path.prototype.splineThru=function(a){var b=Array.prototype.slice.call(arguments),c=this.actions[this.actions.length-1].args,c=[new THREE.Vector2(c[c.length-2],c[c.length-1])];Array.prototype.push.apply(c,a);this.curves.push(new THREE.SplineCurve(c));this.actions.push({action:THREE.PathActions.CSPLINE_THRU,args:b})};
THREE.Path.prototype.arc=function(a,b,c,d,f,e){var g=Array.prototype.slice.call(arguments),h=this.actions[this.actions.length-1],h=new THREE.ArcCurve(h.x+a,h.y+b,c,d,f,e);this.curves.push(h);h=h.getPoint(e?1:0);g.push(h.x);g.push(h.y);this.actions.push({action:THREE.PathActions.ARC,args:g})};
THREE.Path.prototype.absarc=function(a,b,c,d,f,e){var g=Array.prototype.slice.call(arguments),h=new THREE.ArcCurve(a,b,c,d,f,e);this.curves.push(h);h=h.getPoint(e?1:0);g.push(h.x);g.push(h.y);this.actions.push({action:THREE.PathActions.ARC,args:g})};THREE.Path.prototype.getSpacedPoints=function(a){a||(a=40);for(var b=[],c=0;c<a;c++)b.push(this.getPoint(c/a));return b};
THREE.Path.prototype.getPoints=function(a,b){if(this.useSpacedPoints){console.log("tata");return this.getSpacedPoints(a,b)}var a=a||12,c=[],d,f,e,g,h,i,j,k,q,l,n,r,m;d=0;for(f=this.actions.length;d<f;d++){e=this.actions[d];g=e.action;e=e.args;switch(g){case THREE.PathActions.MOVE_TO:c.push(new THREE.Vector2(e[0],e[1]));break;case THREE.PathActions.LINE_TO:c.push(new THREE.Vector2(e[0],e[1]));break;case THREE.PathActions.QUADRATIC_CURVE_TO:h=e[2];i=e[3];q=e[0];l=e[1];if(c.length>0){g=c[c.length-1];
n=g.x;r=g.y}else{g=this.actions[d-1].args;n=g[g.length-2];r=g[g.length-1]}for(e=1;e<=a;e++){m=e/a;g=THREE.Shape.Utils.b2(m,n,q,h);m=THREE.Shape.Utils.b2(m,r,l,i);c.push(new THREE.Vector2(g,m))}break;case THREE.PathActions.BEZIER_CURVE_TO:h=e[4];i=e[5];q=e[0];l=e[1];j=e[2];k=e[3];if(c.length>0){g=c[c.length-1];n=g.x;r=g.y}else{g=this.actions[d-1].args;n=g[g.length-2];r=g[g.length-1]}for(e=1;e<=a;e++){m=e/a;g=THREE.Shape.Utils.b3(m,n,q,j,h);m=THREE.Shape.Utils.b3(m,r,l,k,i);c.push(new THREE.Vector2(g,
m))}break;case THREE.PathActions.CSPLINE_THRU:g=this.actions[d-1].args;m=[new THREE.Vector2(g[g.length-2],g[g.length-1])];g=a*e[0].length;m=m.concat(e[0]);m=new THREE.SplineCurve(m);for(e=1;e<=g;e++)c.push(m.getPointAt(e/g));break;case THREE.PathActions.ARC:h=e[0];i=e[1];j=e[2];q=e[3];l=!!e[5];k=e[4]-q;n=a*2;for(e=1;e<=n;e++){m=e/n;l||(m=1-m);m=q+m*k;g=h+j*Math.cos(m);m=i+j*Math.sin(m);c.push(new THREE.Vector2(g,m))}}}d=c[c.length-1];Math.abs(d.x-c[0].x)<1.0E-10&&Math.abs(d.y-c[0].y)<1.0E-10&&c.splice(c.length-
1,1);b&&c.push(c[0]);return c};THREE.Path.prototype.transform=function(a,b){this.getBoundingBox();return this.getWrapPoints(this.getPoints(b),a)};THREE.Path.prototype.nltransform=function(a,b,c,d,f,e){var g=this.getPoints(),h,i,j,k,q;h=0;for(i=g.length;h<i;h++){j=g[h];k=j.x;q=j.y;j.x=a*k+b*q+c;j.y=d*q+f*k+e}return g};
THREE.Path.prototype.debug=function(a){var b=this.getBoundingBox();if(!a){a=document.createElement("canvas");a.setAttribute("width",b.maxX+100);a.setAttribute("height",b.maxY+100);document.body.appendChild(a)}b=a.getContext("2d");b.fillStyle="white";b.fillRect(0,0,a.width,a.height);b.strokeStyle="black";b.beginPath();var c,d,f,a=0;for(c=this.actions.length;a<c;a++){d=this.actions[a];f=d.args;d=d.action;d!=THREE.PathActions.CSPLINE_THRU&&b[d].apply(b,f)}b.stroke();b.closePath();b.strokeStyle="red";
d=this.getPoints();a=0;for(c=d.length;a<c;a++){f=d[a];b.beginPath();b.arc(f.x,f.y,1.5,0,Math.PI*2,false);b.stroke();b.closePath()}};
THREE.Path.prototype.toShapes=function(){var a,b,c,d,f=[],e=new THREE.Path;a=0;for(b=this.actions.length;a<b;a++){c=this.actions[a];d=c.args;c=c.action;if(c==THREE.PathActions.MOVE_TO&&e.actions.length!=0){f.push(e);e=new THREE.Path}e[c].apply(e,d)}e.actions.length!=0&&f.push(e);if(f.length==0)return[];var g;d=[];a=!THREE.Shape.Utils.isClockWise(f[0].getPoints());if(f.length==1){e=f[0];g=new THREE.Shape;g.actions=e.actions;g.curves=e.curves;d.push(g);return d}if(a){g=new THREE.Shape;a=0;for(b=f.length;a<
b;a++){e=f[a];if(THREE.Shape.Utils.isClockWise(e.getPoints())){g.actions=e.actions;g.curves=e.curves;d.push(g);g=new THREE.Shape}else g.holes.push(e)}}else{a=0;for(b=f.length;a<b;a++){e=f[a];if(THREE.Shape.Utils.isClockWise(e.getPoints())){g&&d.push(g);g=new THREE.Shape;g.actions=e.actions;g.curves=e.curves}else g.holes.push(e)}d.push(g)}return d};THREE.Shape=function(){THREE.Path.apply(this,arguments);this.holes=[]};THREE.Shape.prototype=new THREE.Path;THREE.Shape.prototype.constructor=THREE.Path;
THREE.Shape.prototype.extrude=function(a){return new THREE.ExtrudeGeometry(this,a)};THREE.Shape.prototype.getPointsHoles=function(a){var b,c=this.holes.length,d=[];for(b=0;b<c;b++)d[b]=this.holes[b].getTransformedPoints(a,this.bends);return d};THREE.Shape.prototype.getSpacedPointsHoles=function(a){var b,c=this.holes.length,d=[];for(b=0;b<c;b++)d[b]=this.holes[b].getTransformedSpacedPoints(a,this.bends);return d};
THREE.Shape.prototype.extractAllPoints=function(a){return{shape:this.getTransformedPoints(a),holes:this.getPointsHoles(a)}};THREE.Shape.prototype.extractPoints=function(a){return this.useSpacedPoints?this.extractAllSpacedPoints(a):this.extractAllPoints(a)};THREE.Shape.prototype.extractAllSpacedPoints=function(a){return{shape:this.getTransformedSpacedPoints(a),holes:this.getSpacedPointsHoles(a)}};
THREE.Shape.Utils={removeHoles:function(a,b){var c=a.concat(),d=c.concat(),f,e,g,h,i,j,k,q,l,n,r=[];for(i=0;i<b.length;i++){j=b[i];Array.prototype.push.apply(d,j);e=Number.POSITIVE_INFINITY;for(f=0;f<j.length;f++){l=j[f];n=[];for(q=0;q<c.length;q++){k=c[q];k=l.distanceToSquared(k);n.push(k);if(k<e){e=k;g=f;h=q}}}f=h-1>=0?h-1:c.length-1;e=g-1>=0?g-1:j.length-1;var m=[j[g],c[h],c[f]];q=THREE.FontUtils.Triangulate.area(m);var p=[j[g],j[e],c[h]];l=THREE.FontUtils.Triangulate.area(p);n=h;k=g;h=h+1;g=g+
-1;h<0&&(h=h+c.length);h=h%c.length;g<0&&(g=g+j.length);g=g%j.length;f=h-1>=0?h-1:c.length-1;e=g-1>=0?g-1:j.length-1;m=[j[g],c[h],c[f]];m=THREE.FontUtils.Triangulate.area(m);p=[j[g],j[e],c[h]];p=THREE.FontUtils.Triangulate.area(p);if(q+l>m+p){h=n;g=k;h<0&&(h=h+c.length);h=h%c.length;g<0&&(g=g+j.length);g=g%j.length;f=h-1>=0?h-1:c.length-1;e=g-1>=0?g-1:j.length-1}q=c.slice(0,h);l=c.slice(h);n=j.slice(g);k=j.slice(0,g);e=[j[g],j[e],c[h]];r.push([j[g],c[h],c[f]]);r.push(e);c=q.concat(n).concat(k).concat(l)}return{shape:c,
isolatedPts:r,allpoints:d}},triangulateShape:function(a,b){var c=THREE.Shape.Utils.removeHoles(a,b),d=c.allpoints,f=c.isolatedPts,c=THREE.FontUtils.Triangulate(c.shape,false),e,g,h,i,j={};e=0;for(g=d.length;e<g;e++){i=d[e].x+":"+d[e].y;j[i]!==void 0&&console.log("Duplicate point",i);j[i]=e}e=0;for(g=c.length;e<g;e++){h=c[e];for(d=0;d<3;d++){i=h[d].x+":"+h[d].y;i=j[i];i!==void 0&&(h[d]=i)}}e=0;for(g=f.length;e<g;e++){h=f[e];for(d=0;d<3;d++){i=h[d].x+":"+h[d].y;i=j[i];i!==void 0&&(h[d]=i)}}return c.concat(f)},
isClockWise:function(a){return THREE.FontUtils.Triangulate.area(a)<0},b2p0:function(a,b){var c=1-a;return c*c*b},b2p1:function(a,b){return 2*(1-a)*a*b},b2p2:function(a,b){return a*a*b},b2:function(a,b,c,d){return this.b2p0(a,b)+this.b2p1(a,c)+this.b2p2(a,d)},b3p0:function(a,b){var c=1-a;return c*c*c*b},b3p1:function(a,b){var c=1-a;return 3*c*c*a*b},b3p2:function(a,b){return 3*(1-a)*a*a*b},b3p3:function(a,b){return a*a*a*b},b3:function(a,b,c,d,f){return this.b3p0(a,b)+this.b3p1(a,c)+this.b3p2(a,d)+
this.b3p3(a,f)}};THREE.TextPath=function(a,b){THREE.Path.call(this);this.parameters=b||{};this.set(a)};THREE.TextPath.prototype.set=function(a,b){b=b||this.parameters;this.text=a;var c=b.curveSegments!==void 0?b.curveSegments:4,d=b.font!==void 0?b.font:"helvetiker",f=b.weight!==void 0?b.weight:"normal",e=b.style!==void 0?b.style:"normal";THREE.FontUtils.size=b.size!==void 0?b.size:100;THREE.FontUtils.divisions=c;THREE.FontUtils.face=d;THREE.FontUtils.weight=f;THREE.FontUtils.style=e};
THREE.TextPath.prototype.toShapes=function(){for(var a=THREE.FontUtils.drawText(this.text).paths,b=[],c=0,d=a.length;c<d;c++)Array.prototype.push.apply(b,a[c].toShapes());return b};
THREE.AnimationHandler=function(){var a=[],b={},c={update:function(b){for(var c=0;c<a.length;c++)a[c].update(b)},addToUpdate:function(b){a.indexOf(b)===-1&&a.push(b)},removeFromUpdate:function(b){b=a.indexOf(b);b!==-1&&a.splice(b,1)},add:function(a){b[a.name]!==void 0&&console.log("THREE.AnimationHandler.add: Warning! "+a.name+" already exists in library. Overwriting.");b[a.name]=a;if(a.initialized!==true){for(var c=0;c<a.hierarchy.length;c++){for(var d=0;d<a.hierarchy[c].keys.length;d++){if(a.hierarchy[c].keys[d].time<
0)a.hierarchy[c].keys[d].time=0;if(a.hierarchy[c].keys[d].rot!==void 0&&!(a.hierarchy[c].keys[d].rot instanceof THREE.Quaternion)){var h=a.hierarchy[c].keys[d].rot;a.hierarchy[c].keys[d].rot=new THREE.Quaternion(h[0],h[1],h[2],h[3])}}if(a.hierarchy[c].keys.length&&a.hierarchy[c].keys[0].morphTargets!==void 0){h={};for(d=0;d<a.hierarchy[c].keys.length;d++)for(var i=0;i<a.hierarchy[c].keys[d].morphTargets.length;i++){var j=a.hierarchy[c].keys[d].morphTargets[i];h[j]=-1}a.hierarchy[c].usedMorphTargets=
h;for(d=0;d<a.hierarchy[c].keys.length;d++){var k={};for(j in h){for(i=0;i<a.hierarchy[c].keys[d].morphTargets.length;i++)if(a.hierarchy[c].keys[d].morphTargets[i]===j){k[j]=a.hierarchy[c].keys[d].morphTargetsInfluences[i];break}i===a.hierarchy[c].keys[d].morphTargets.length&&(k[j]=0)}a.hierarchy[c].keys[d].morphTargetsInfluences=k}}for(d=1;d<a.hierarchy[c].keys.length;d++)if(a.hierarchy[c].keys[d].time===a.hierarchy[c].keys[d-1].time){a.hierarchy[c].keys.splice(d,1);d--}for(d=0;d<a.hierarchy[c].keys.length;d++)a.hierarchy[c].keys[d].index=
d}d=parseInt(a.length*a.fps,10);a.JIT={};a.JIT.hierarchy=[];for(c=0;c<a.hierarchy.length;c++)a.JIT.hierarchy.push(Array(d));a.initialized=true}},get:function(a){if(typeof a==="string"){if(b[a])return b[a];console.log("THREE.AnimationHandler.get: Couldn't find animation "+a);return null}},parse:function(a){var b=[];if(a instanceof THREE.SkinnedMesh)for(var c=0;c<a.bones.length;c++)b.push(a.bones[c]);else d(a,b);return b}},d=function(a,b){b.push(a);for(var c=0;c<a.children.length;c++)d(a.children[c],
b)};c.LINEAR=0;c.CATMULLROM=1;c.CATMULLROM_FORWARD=2;return c}();THREE.Animation=function(a,b,c,d){this.root=a;this.data=THREE.AnimationHandler.get(b);this.hierarchy=THREE.AnimationHandler.parse(a);this.currentTime=0;this.timeScale=1;this.isPlaying=false;this.loop=this.isPaused=true;this.interpolationType=c!==void 0?c:THREE.AnimationHandler.LINEAR;this.JITCompile=d!==void 0?d:true;this.points=[];this.target=new THREE.Vector3};
THREE.Animation.prototype.play=function(a,b){if(!this.isPlaying){this.isPlaying=true;this.loop=a!==void 0?a:true;this.currentTime=b!==void 0?b:0;var c,d=this.hierarchy.length,f;for(c=0;c<d;c++){f=this.hierarchy[c];if(this.interpolationType!==THREE.AnimationHandler.CATMULLROM_FORWARD)f.useQuaternion=true;f.matrixAutoUpdate=true;if(f.animationCache===void 0){f.animationCache={};f.animationCache.prevKey={pos:0,rot:0,scl:0};f.animationCache.nextKey={pos:0,rot:0,scl:0};f.animationCache.originalMatrix=
f instanceof THREE.Bone?f.skinMatrix:f.matrix}var e=f.animationCache.prevKey;f=f.animationCache.nextKey;e.pos=this.data.hierarchy[c].keys[0];e.rot=this.data.hierarchy[c].keys[0];e.scl=this.data.hierarchy[c].keys[0];f.pos=this.getNextKeyWith("pos",c,1);f.rot=this.getNextKeyWith("rot",c,1);f.scl=this.getNextKeyWith("scl",c,1)}this.update(0)}this.isPaused=false;THREE.AnimationHandler.addToUpdate(this)};
THREE.Animation.prototype.pause=function(){this.isPaused?THREE.AnimationHandler.addToUpdate(this):THREE.AnimationHandler.removeFromUpdate(this);this.isPaused=!this.isPaused};
THREE.Animation.prototype.stop=function(){this.isPaused=this.isPlaying=false;THREE.AnimationHandler.removeFromUpdate(this);for(var a=0;a<this.hierarchy.length;a++)if(this.hierarchy[a].animationCache!==void 0){this.hierarchy[a]instanceof THREE.Bone?this.hierarchy[a].skinMatrix=this.hierarchy[a].animationCache.originalMatrix:this.hierarchy[a].matrix=this.hierarchy[a].animationCache.originalMatrix;delete this.hierarchy[a].animationCache}};
THREE.Animation.prototype.update=function(a){if(this.isPlaying){var b=["pos","rot","scl"],c,d,f,e,g,h,i,j,k=this.data.JIT.hierarchy,q,l;l=this.currentTime=this.currentTime+a*this.timeScale;q=this.currentTime=this.currentTime%this.data.length;j=parseInt(Math.min(q*this.data.fps,this.data.length*this.data.fps),10);for(var n=0,r=this.hierarchy.length;n<r;n++){a=this.hierarchy[n];i=a.animationCache;if(this.JITCompile&&k[n][j]!==void 0)if(a instanceof THREE.Bone){a.skinMatrix=k[n][j];a.matrixAutoUpdate=
false;a.matrixWorldNeedsUpdate=false}else{a.matrix=k[n][j];a.matrixAutoUpdate=false;a.matrixWorldNeedsUpdate=true}else{if(this.JITCompile)a instanceof THREE.Bone?a.skinMatrix=a.animationCache.originalMatrix:a.matrix=a.animationCache.originalMatrix;for(var m=0;m<3;m++){c=b[m];g=i.prevKey[c];h=i.nextKey[c];if(h.time<=l){if(q<l)if(this.loop){g=this.data.hierarchy[n].keys[0];for(h=this.getNextKeyWith(c,n,1);h.time<q;){g=h;h=this.getNextKeyWith(c,n,h.index+1)}}else{this.stop();return}else{do{g=h;h=this.getNextKeyWith(c,
n,h.index+1)}while(h.time<q)}i.prevKey[c]=g;i.nextKey[c]=h}a.matrixAutoUpdate=true;a.matrixWorldNeedsUpdate=true;d=(q-g.time)/(h.time-g.time);f=g[c];e=h[c];if(d<0||d>1){console.log("THREE.Animation.update: Warning! Scale out of bounds:"+d+" on bone "+n);d=d<0?0:1}if(c==="pos"){c=a.position;if(this.interpolationType===THREE.AnimationHandler.LINEAR){c.x=f[0]+(e[0]-f[0])*d;c.y=f[1]+(e[1]-f[1])*d;c.z=f[2]+(e[2]-f[2])*d}else if(this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===
THREE.AnimationHandler.CATMULLROM_FORWARD){this.points[0]=this.getPrevKeyWith("pos",n,g.index-1).pos;this.points[1]=f;this.points[2]=e;this.points[3]=this.getNextKeyWith("pos",n,h.index+1).pos;d=d*0.33+0.33;f=this.interpolateCatmullRom(this.points,d);c.x=f[0];c.y=f[1];c.z=f[2];if(this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD){d=this.interpolateCatmullRom(this.points,d*1.01);this.target.set(d[0],d[1],d[2]);this.target.subSelf(c);this.target.y=0;this.target.normalize();d=Math.atan2(this.target.x,
this.target.z);a.rotation.set(0,d,0)}}}else if(c==="rot")THREE.Quaternion.slerp(f,e,a.quaternion,d);else if(c==="scl"){c=a.scale;c.x=f[0]+(e[0]-f[0])*d;c.y=f[1]+(e[1]-f[1])*d;c.z=f[2]+(e[2]-f[2])*d}}}}if(this.JITCompile&&k[0][j]===void 0){this.hierarchy[0].updateMatrixWorld(true);for(n=0;n<this.hierarchy.length;n++)k[n][j]=this.hierarchy[n]instanceof THREE.Bone?this.hierarchy[n].skinMatrix.clone():this.hierarchy[n].matrix.clone()}}};
THREE.Animation.prototype.interpolateCatmullRom=function(a,b){var c=[],d=[],f,e,g,h,i,j;f=(a.length-1)*b;e=Math.floor(f);f=f-e;c[0]=e===0?e:e-1;c[1]=e;c[2]=e>a.length-2?e:e+1;c[3]=e>a.length-3?e:e+2;e=a[c[0]];h=a[c[1]];i=a[c[2]];j=a[c[3]];c=f*f;g=f*c;d[0]=this.interpolate(e[0],h[0],i[0],j[0],f,c,g);d[1]=this.interpolate(e[1],h[1],i[1],j[1],f,c,g);d[2]=this.interpolate(e[2],h[2],i[2],j[2],f,c,g);return d};
THREE.Animation.prototype.interpolate=function(a,b,c,d,f,e,g){a=(c-a)*0.5;d=(d-b)*0.5;return(2*(b-c)+a+d)*g+(-3*(b-c)-2*a-d)*e+a*f+b};THREE.Animation.prototype.getNextKeyWith=function(a,b,c){for(var d=this.data.hierarchy[b].keys,c=this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD?c<d.length-1?c:d.length-1:c%d.length;c<d.length;c++)if(d[c][a]!==void 0)return d[c];return this.data.hierarchy[b].keys[0]};
THREE.Animation.prototype.getPrevKeyWith=function(a,b,c){for(var d=this.data.hierarchy[b].keys,c=this.interpolationType===THREE.AnimationHandler.CATMULLROM||this.interpolationType===THREE.AnimationHandler.CATMULLROM_FORWARD?c>0?c:0:c>=0?c:c+d.length;c>=0;c--)if(d[c][a]!==void 0)return d[c];return this.data.hierarchy[b].keys[d.length-1]};
THREE.KeyFrameAnimation=function(a,b,c){this.root=a;this.data=THREE.AnimationHandler.get(b);this.hierarchy=THREE.AnimationHandler.parse(a);this.currentTime=0;this.timeScale=0.001;this.isPlaying=false;this.loop=this.isPaused=true;this.JITCompile=c!==void 0?c:true;a=0;for(b=this.hierarchy.length;a<b;a++){var c=this.data.hierarchy[a].sids,d=this.hierarchy[a];if(this.data.hierarchy[a].keys.length&&c){for(var f=0;f<c.length;f++){var e=c[f],g=this.getNextKeyWith(e,a,0);g&&g.apply(e)}d.matrixAutoUpdate=
false;this.data.hierarchy[a].node.updateMatrix();d.matrixWorldNeedsUpdate=true}}};
THREE.KeyFrameAnimation.prototype.play=function(a,b){if(!this.isPlaying){this.isPlaying=true;this.loop=a!==void 0?a:true;this.currentTime=b!==void 0?b:0;this.startTimeMs=b;this.startTime=1E7;this.endTime=-this.startTime;var c,d=this.hierarchy.length,f,e;for(c=0;c<d;c++){f=this.hierarchy[c];e=this.data.hierarchy[c];f.useQuaternion=true;if(e.animationCache===void 0){e.animationCache={};e.animationCache.prevKey=null;e.animationCache.nextKey=null;e.animationCache.originalMatrix=f instanceof THREE.Bone?
f.skinMatrix:f.matrix}f=this.data.hierarchy[c].keys;if(f.length){e.animationCache.prevKey=f[0];e.animationCache.nextKey=f[1];this.startTime=Math.min(f[0].time,this.startTime);this.endTime=Math.max(f[f.length-1].time,this.endTime)}}this.update(0)}this.isPaused=false;THREE.AnimationHandler.addToUpdate(this)};THREE.KeyFrameAnimation.prototype.pause=function(){this.isPaused?THREE.AnimationHandler.addToUpdate(this):THREE.AnimationHandler.removeFromUpdate(this);this.isPaused=!this.isPaused};
THREE.KeyFrameAnimation.prototype.stop=function(){this.isPaused=this.isPlaying=false;THREE.AnimationHandler.removeFromUpdate(this);for(var a=0;a<this.data.hierarchy.length;a++){var b=this.hierarchy[a],c=this.data.hierarchy[a];if(c.animationCache!==void 0){var d=c.animationCache.originalMatrix;if(b instanceof THREE.Bone){d.copy(b.skinMatrix);b.skinMatrix=d}else{d.copy(b.matrix);b.matrix=d}delete c.animationCache}}};
THREE.KeyFrameAnimation.prototype.update=function(a){if(this.isPlaying){var b,c,d,f,e=this.data.JIT.hierarchy,g,h,i;h=this.currentTime=this.currentTime+a*this.timeScale;g=this.currentTime=this.currentTime%this.data.length;if(g<this.startTimeMs)g=this.currentTime=this.startTimeMs+g;f=parseInt(Math.min(g*this.data.fps,this.data.length*this.data.fps),10);if((i=g<h)&&!this.loop){for(var a=0,j=this.hierarchy.length;a<j;a++){var k=this.data.hierarchy[a].keys,e=this.data.hierarchy[a].sids;d=k.length-1;f=
this.hierarchy[a];if(k.length){for(k=0;k<e.length;k++){g=e[k];(h=this.getPrevKeyWith(g,a,d))&&h.apply(g)}this.data.hierarchy[a].node.updateMatrix();f.matrixWorldNeedsUpdate=true}}this.stop()}else if(!(g<this.startTime)){a=0;for(j=this.hierarchy.length;a<j;a++){d=this.hierarchy[a];b=this.data.hierarchy[a];var k=b.keys,q=b.animationCache;if(this.JITCompile&&e[a][f]!==void 0)if(d instanceof THREE.Bone){d.skinMatrix=e[a][f];d.matrixWorldNeedsUpdate=false}else{d.matrix=e[a][f];d.matrixWorldNeedsUpdate=
true}else if(k.length){if(this.JITCompile&&q)d instanceof THREE.Bone?d.skinMatrix=q.originalMatrix:d.matrix=q.originalMatrix;b=q.prevKey;c=q.nextKey;if(b&&c){if(c.time<=h){if(i&&this.loop){b=k[0];for(c=k[1];c.time<g;){b=c;c=k[b.index+1]}}else if(!i)for(var l=k.length-1;c.time<g&&c.index!==l;){b=c;c=k[b.index+1]}q.prevKey=b;q.nextKey=c}c.time>=g?b.interpolate(c,g):b.interpolate(c,c.time)}this.data.hierarchy[a].node.updateMatrix();d.matrixWorldNeedsUpdate=true}}if(this.JITCompile&&e[0][f]===void 0){this.hierarchy[0].updateMatrixWorld(true);
for(a=0;a<this.hierarchy.length;a++)e[a][f]=this.hierarchy[a]instanceof THREE.Bone?this.hierarchy[a].skinMatrix.clone():this.hierarchy[a].matrix.clone()}}}};THREE.KeyFrameAnimation.prototype.getNextKeyWith=function(a,b,c){b=this.data.hierarchy[b].keys;for(c=c%b.length;c<b.length;c++)if(b[c].hasTarget(a))return b[c];return b[0]};
THREE.KeyFrameAnimation.prototype.getPrevKeyWith=function(a,b,c){b=this.data.hierarchy[b].keys;for(c=c>=0?c:c+b.length;c>=0;c--)if(b[c].hasTarget(a))return b[c];return b[b.length-1]};
THREE.CubeCamera=function(a,b,c){THREE.Object3D.call(this);var d=new THREE.PerspectiveCamera(90,1,a,b);d.up.set(0,-1,0);d.lookAt(new THREE.Vector3(1,0,0));this.add(d);var f=new THREE.PerspectiveCamera(90,1,a,b);f.up.set(0,-1,0);f.lookAt(new THREE.Vector3(-1,0,0));this.add(f);var e=new THREE.PerspectiveCamera(90,1,a,b);e.up.set(0,0,1);e.lookAt(new THREE.Vector3(0,1,0));this.add(e);var g=new THREE.PerspectiveCamera(90,1,a,b);g.up.set(0,0,-1);g.lookAt(new THREE.Vector3(0,-1,0));this.add(g);var h=new THREE.PerspectiveCamera(90,
1,a,b);h.up.set(0,-1,0);h.lookAt(new THREE.Vector3(0,0,1));this.add(h);var i=new THREE.PerspectiveCamera(90,1,a,b);i.up.set(0,-1,0);i.lookAt(new THREE.Vector3(0,0,-1));this.add(i);this.renderTarget=new THREE.WebGLRenderTargetCube(c,c,{format:THREE.RGBFormat,magFilter:THREE.LinearFilter,minFilter:THREE.LinearFilter});this.updateCubeMap=function(a,b){var c=this.renderTarget,l=c.generateMipmaps;c.generateMipmaps=false;c.activeCubeFace=0;a.render(b,d,c);c.activeCubeFace=1;a.render(b,f,c);c.activeCubeFace=
2;a.render(b,e,c);c.activeCubeFace=3;a.render(b,g,c);c.activeCubeFace=4;a.render(b,h,c);c.generateMipmaps=l;c.activeCubeFace=5;a.render(b,i,c)}};THREE.CubeCamera.prototype=new THREE.Object3D;THREE.CubeCamera.prototype.constructor=THREE.CubeCamera;
THREE.CombinedCamera=function(a,b,c,d,f,e,g){THREE.Camera.call(this);this.fov=c;this.left=-a/2;this.right=a/2;this.top=b/2;this.bottom=-b/2;this.cameraO=new THREE.OrthographicCamera(a/-2,a/2,b/2,b/-2,e,g);this.cameraP=new THREE.PerspectiveCamera(c,a/b,d,f);this.zoom=1;this.toPerspective()};THREE.CombinedCamera.prototype=new THREE.Camera;THREE.CombinedCamera.prototype.constructor=THREE.CombinedCamera;
THREE.CombinedCamera.prototype.toPerspective=function(){this.near=this.cameraP.near;this.far=this.cameraP.far;this.cameraP.fov=this.fov/this.zoom;this.cameraP.updateProjectionMatrix();this.projectionMatrix=this.cameraP.projectionMatrix;this.inPersepectiveMode=true;this.inOrthographicMode=false};
THREE.CombinedCamera.prototype.toOrthographic=function(){var a=this.cameraP.aspect,b=(this.cameraP.near+this.cameraP.far)/2,b=Math.tan(this.fov/2)*b,a=2*b*a/2,b=b/this.zoom,a=a/this.zoom;this.cameraO.left=-a;this.cameraO.right=a;this.cameraO.top=b;this.cameraO.bottom=-b;this.cameraO.updateProjectionMatrix();this.near=this.cameraO.near;this.far=this.cameraO.far;this.projectionMatrix=this.cameraO.projectionMatrix;this.inPersepectiveMode=false;this.inOrthographicMode=true};
THREE.CombinedCamera.prototype.setSize=function(a,b){this.cameraP.aspect=a/b;this.left=-a/2;this.right=a/2;this.top=b/2;this.bottom=-b/2};THREE.CombinedCamera.prototype.setFov=function(a){this.fov=a;this.inPersepectiveMode?this.toPerspective():this.toOrthographic()};THREE.CombinedCamera.prototype.updateProjectionMatrix=function(){if(this.inPersepectiveMode)this.toPerspective();else{this.toPerspective();this.toOrthographic()}};
THREE.CombinedCamera.prototype.setLens=function(a,b){var c=2*Math.atan((b!==void 0?b:24)/(a*2))*(180/Math.PI);this.setFov(c);return c};THREE.CombinedCamera.prototype.setZoom=function(a){this.zoom=a;this.inPersepectiveMode?this.toPerspective():this.toOrthographic()};THREE.CombinedCamera.prototype.toFrontView=function(){this.rotation.x=0;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=false};
THREE.CombinedCamera.prototype.toBackView=function(){this.rotation.x=0;this.rotation.y=Math.PI;this.rotation.z=0;this.rotationAutoUpdate=false};THREE.CombinedCamera.prototype.toLeftView=function(){this.rotation.x=0;this.rotation.y=-Math.PI/2;this.rotation.z=0;this.rotationAutoUpdate=false};THREE.CombinedCamera.prototype.toRightView=function(){this.rotation.x=0;this.rotation.y=Math.PI/2;this.rotation.z=0;this.rotationAutoUpdate=false};
THREE.CombinedCamera.prototype.toTopView=function(){this.rotation.x=-Math.PI/2;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=false};THREE.CombinedCamera.prototype.toBottomView=function(){this.rotation.x=Math.PI/2;this.rotation.y=0;this.rotation.z=0;this.rotationAutoUpdate=false};
THREE.FirstPersonControls=function(a,b){function c(a,b){return function(){b.apply(a,arguments)}}this.object=a;this.target=new THREE.Vector3(0,0,0);this.domElement=b!==void 0?b:document;this.movementSpeed=1;this.lookSpeed=0.005;this.noFly=false;this.lookVertical=true;this.autoForward=false;this.activeLook=true;this.heightSpeed=false;this.heightCoef=1;this.heightMin=0;this.constrainVertical=false;this.verticalMin=0;this.verticalMax=Math.PI;this.theta=this.phi=this.lon=this.lat=this.mouseY=this.mouseX=
this.autoSpeedFactor=0;this.mouseDragOn=this.freeze=this.moveRight=this.moveLeft=this.moveBackward=this.moveForward=false;if(this.domElement===document){this.viewHalfX=window.innerWidth/2;this.viewHalfY=window.innerHeight/2}else{this.viewHalfX=this.domElement.offsetWidth/2;this.viewHalfY=this.domElement.offsetHeight/2;this.domElement.setAttribute("tabindex",-1)}this.onMouseDown=function(a){this.domElement!==document&&this.domElement.focus();a.preventDefault();a.stopPropagation();if(this.activeLook)switch(a.button){case 0:this.moveForward=
true;break;case 2:this.moveBackward=true}this.mouseDragOn=true};this.onMouseUp=function(a){a.preventDefault();a.stopPropagation();if(this.activeLook)switch(a.button){case 0:this.moveForward=false;break;case 2:this.moveBackward=false}this.mouseDragOn=false};this.onMouseMove=function(a){if(this.domElement===document){this.mouseX=a.pageX-this.viewHalfX;this.mouseY=a.pageY-this.viewHalfY}else{this.mouseX=a.pageX-this.domElement.offsetLeft-this.viewHalfX;this.mouseY=a.pageY-this.domElement.offsetTop-this.viewHalfY}};
this.onKeyDown=function(a){switch(a.keyCode){case 38:case 87:this.moveForward=true;break;case 37:case 65:this.moveLeft=true;break;case 40:case 83:this.moveBackward=true;break;case 39:case 68:this.moveRight=true;break;case 82:this.moveUp=true;break;case 70:this.moveDown=true;break;case 81:this.freeze=!this.freeze}};this.onKeyUp=function(a){switch(a.keyCode){case 38:case 87:this.moveForward=false;break;case 37:case 65:this.moveLeft=false;break;case 40:case 83:this.moveBackward=false;break;case 39:case 68:this.moveRight=
false;break;case 82:this.moveUp=false;break;case 70:this.moveDown=false}};this.update=function(a){var b=0;if(!this.freeze){if(this.heightSpeed){b=THREE.Math.clamp(this.object.position.y,this.heightMin,this.heightMax)-this.heightMin;this.autoSpeedFactor=a*b*this.heightCoef}else this.autoSpeedFactor=0;b=a*this.movementSpeed;(this.moveForward||this.autoForward&&!this.moveBackward)&&this.object.translateZ(-(b+this.autoSpeedFactor));this.moveBackward&&this.object.translateZ(b);this.moveLeft&&this.object.translateX(-b);
this.moveRight&&this.object.translateX(b);this.moveUp&&this.object.translateY(b);this.moveDown&&this.object.translateY(-b);a=a*this.lookSpeed;this.activeLook||(a=0);this.lon=this.lon+this.mouseX*a;if(this.lookVertical)this.lat=this.lat-this.mouseY*a;this.lat=Math.max(-85,Math.min(85,this.lat));this.phi=(90-this.lat)*Math.PI/180;this.theta=this.lon*Math.PI/180;var b=this.target,c=this.object.position;b.x=c.x+100*Math.sin(this.phi)*Math.cos(this.theta);b.y=c.y+100*Math.cos(this.phi);b.z=c.z+100*Math.sin(this.phi)*
Math.sin(this.theta);b=1;this.constrainVertical&&(b=Math.PI/(this.verticalMax-this.verticalMin));this.lon=this.lon+this.mouseX*a;if(this.lookVertical)this.lat=this.lat-this.mouseY*a*b;this.lat=Math.max(-85,Math.min(85,this.lat));this.phi=(90-this.lat)*Math.PI/180;this.theta=this.lon*Math.PI/180;if(this.constrainVertical)this.phi=THREE.Math.mapLinear(this.phi,0,Math.PI,this.verticalMin,this.verticalMax);b=this.target;c=this.object.position;b.x=c.x+100*Math.sin(this.phi)*Math.cos(this.theta);b.y=c.y+
100*Math.cos(this.phi);b.z=c.z+100*Math.sin(this.phi)*Math.sin(this.theta);this.object.lookAt(b)}};this.domElement.addEventListener("contextmenu",function(a){a.preventDefault()},false);this.domElement.addEventListener("mousemove",c(this,this.onMouseMove),false);this.domElement.addEventListener("mousedown",c(this,this.onMouseDown),false);this.domElement.addEventListener("mouseup",c(this,this.onMouseUp),false);this.domElement.addEventListener("keydown",c(this,this.onKeyDown),false);this.domElement.addEventListener("keyup",
c(this,this.onKeyUp),false)};
THREE.PathControls=function(a,b){function c(a){return(a=a*2)<1?0.5*a*a:-0.5*(--a*(a-2)-1)}function d(a,b){return function(){b.apply(a,arguments)}}function f(a,b,c,d){var e={name:c,fps:0.6,length:d,hierarchy:[]},f,g=b.getControlPointsArray(),h=b.getLength(),p=g.length,t=0;f=p-1;b={parent:-1,keys:[]};b.keys[0]={time:0,pos:g[0],rot:[0,0,0,1],scl:[1,1,1]};b.keys[f]={time:d,pos:g[f],rot:[0,0,0,1],scl:[1,1,1]};for(f=1;f<p-1;f++){t=d*h.chunks[f]/h.total;b.keys[f]={time:t,pos:g[f]}}e.hierarchy[0]=b;THREE.AnimationHandler.add(e);
return new THREE.Animation(a,c,THREE.AnimationHandler.CATMULLROM_FORWARD,false)}function e(a,b){var c,d,e=new THREE.Geometry;for(c=0;c<a.points.length*b;c++){d=c/(a.points.length*b);d=a.getPoint(d);e.vertices[c]=new THREE.Vertex(d.x,d.y,d.z)}return e}this.object=a;this.domElement=b!==void 0?b:document;this.id="PathControls"+THREE.PathControlsIdCounter++;this.duration=1E4;this.waypoints=[];this.useConstantSpeed=true;this.resamplingCoef=50;this.debugPath=new THREE.Object3D;this.debugDummy=new THREE.Object3D;
this.animationParent=new THREE.Object3D;this.lookSpeed=0.005;this.lookHorizontal=this.lookVertical=true;this.verticalAngleMap={srcRange:[0,2*Math.PI],dstRange:[0,2*Math.PI]};this.horizontalAngleMap={srcRange:[0,2*Math.PI],dstRange:[0,2*Math.PI]};this.target=new THREE.Object3D;this.theta=this.phi=this.lon=this.lat=this.mouseY=this.mouseX=0;if(this.domElement===document){this.viewHalfX=window.innerWidth/2;this.viewHalfY=window.innerHeight/2}else{this.viewHalfX=this.domElement.offsetWidth/2;this.viewHalfY=
this.domElement.offsetHeight/2;this.domElement.setAttribute("tabindex",-1)}var g=Math.PI*2,h=Math.PI/180;this.update=function(a){var b;if(this.lookHorizontal)this.lon=this.lon+this.mouseX*this.lookSpeed*a;if(this.lookVertical)this.lat=this.lat-this.mouseY*this.lookSpeed*a;this.lon=Math.max(0,Math.min(360,this.lon));this.lat=Math.max(-85,Math.min(85,this.lat));this.phi=(90-this.lat)*h;this.theta=this.lon*h;a=this.phi%g;this.phi=a>=0?a:a+g;b=this.verticalAngleMap.srcRange;a=this.verticalAngleMap.dstRange;
b=THREE.Math.mapLinear(this.phi,b[0],b[1],a[0],a[1]);var d=a[1]-a[0];this.phi=c((b-a[0])/d)*d+a[0];b=this.horizontalAngleMap.srcRange;a=this.horizontalAngleMap.dstRange;b=THREE.Math.mapLinear(this.theta,b[0],b[1],a[0],a[1]);d=a[1]-a[0];this.theta=c((b-a[0])/d)*d+a[0];a=this.target.position;a.x=100*Math.sin(this.phi)*Math.cos(this.theta);a.y=100*Math.cos(this.phi);a.z=100*Math.sin(this.phi)*Math.sin(this.theta);this.object.lookAt(this.target.position)};this.onMouseMove=function(a){if(this.domElement===
document){this.mouseX=a.pageX-this.viewHalfX;this.mouseY=a.pageY-this.viewHalfY}else{this.mouseX=a.pageX-this.domElement.offsetLeft-this.viewHalfX;this.mouseY=a.pageY-this.domElement.offsetTop-this.viewHalfY}};this.init=function(){this.spline=new THREE.Spline;this.spline.initFromArray(this.waypoints);this.useConstantSpeed&&this.spline.reparametrizeByArcLength(this.resamplingCoef);if(this.createDebugDummy){var a=new THREE.MeshLambertMaterial({color:30719}),b=new THREE.MeshLambertMaterial({color:65280}),
c=new THREE.CubeGeometry(10,10,20),g=new THREE.CubeGeometry(2,2,10);this.animationParent=new THREE.Mesh(c,a);a=new THREE.Mesh(g,b);a.position.set(0,10,0);this.animation=f(this.animationParent,this.spline,this.id,this.duration);this.animationParent.add(this.object);this.animationParent.add(this.target);this.animationParent.add(a)}else{this.animation=f(this.animationParent,this.spline,this.id,this.duration);this.animationParent.add(this.target);this.animationParent.add(this.object)}if(this.createDebugPath){var a=
this.debugPath,b=this.spline,g=e(b,10),c=e(b,10),h=new THREE.LineBasicMaterial({color:16711680,linewidth:3}),g=new THREE.Line(g,h),c=new THREE.ParticleSystem(c,new THREE.ParticleBasicMaterial({color:16755200,size:3}));g.scale.set(1,1,1);a.add(g);c.scale.set(1,1,1);a.add(c);for(var g=new THREE.SphereGeometry(1,16,8),h=new THREE.MeshBasicMaterial({color:65280}),n=0;n<b.points.length;n++){c=new THREE.Mesh(g,h);c.position.copy(b.points[n]);a.add(c)}}this.domElement.addEventListener("mousemove",d(this,
this.onMouseMove),false)}};THREE.PathControlsIdCounter=0;
THREE.FlyControls=function(a,b){function c(a,b){return function(){b.apply(a,arguments)}}this.object=a;this.domElement=b!==void 0?b:document;b&&this.domElement.setAttribute("tabindex",-1);this.movementSpeed=1;this.rollSpeed=0.005;this.autoForward=this.dragToLook=false;this.object.useQuaternion=true;this.tmpQuaternion=new THREE.Quaternion;this.mouseStatus=0;this.moveState={up:0,down:0,left:0,right:0,forward:0,back:0,pitchUp:0,pitchDown:0,yawLeft:0,yawRight:0,rollLeft:0,rollRight:0};this.moveVector=
new THREE.Vector3(0,0,0);this.rotationVector=new THREE.Vector3(0,0,0);this.handleEvent=function(a){if(typeof this[a.type]=="function")this[a.type](a)};this.keydown=function(a){if(!a.altKey){switch(a.keyCode){case 16:this.movementSpeedMultiplier=0.1;break;case 87:this.moveState.forward=1;break;case 83:this.moveState.back=1;break;case 65:this.moveState.left=1;break;case 68:this.moveState.right=1;break;case 82:this.moveState.up=1;break;case 70:this.moveState.down=1;break;case 38:this.moveState.pitchUp=
1;break;case 40:this.moveState.pitchDown=1;break;case 37:this.moveState.yawLeft=1;break;case 39:this.moveState.yawRight=1;break;case 81:this.moveState.rollLeft=1;break;case 69:this.moveState.rollRight=1}this.updateMovementVector();this.updateRotationVector()}};this.keyup=function(a){switch(a.keyCode){case 16:this.movementSpeedMultiplier=1;break;case 87:this.moveState.forward=0;break;case 83:this.moveState.back=0;break;case 65:this.moveState.left=0;break;case 68:this.moveState.right=0;break;case 82:this.moveState.up=
0;break;case 70:this.moveState.down=0;break;case 38:this.moveState.pitchUp=0;break;case 40:this.moveState.pitchDown=0;break;case 37:this.moveState.yawLeft=0;break;case 39:this.moveState.yawRight=0;break;case 81:this.moveState.rollLeft=0;break;case 69:this.moveState.rollRight=0}this.updateMovementVector();this.updateRotationVector()};this.mousedown=function(a){this.domElement!==document&&this.domElement.focus();a.preventDefault();a.stopPropagation();if(this.dragToLook)this.mouseStatus++;else switch(a.button){case 0:this.object.moveForward=
true;break;case 2:this.object.moveBackward=true}};this.mousemove=function(a){if(!this.dragToLook||this.mouseStatus>0){var b=this.getContainerDimensions(),c=b.size[0]/2,g=b.size[1]/2;this.moveState.yawLeft=-(a.pageX-b.offset[0]-c)/c;this.moveState.pitchDown=(a.pageY-b.offset[1]-g)/g;this.updateRotationVector()}};this.mouseup=function(a){a.preventDefault();a.stopPropagation();if(this.dragToLook){this.mouseStatus--;this.moveState.yawLeft=this.moveState.pitchDown=0}else switch(a.button){case 0:this.moveForward=
false;break;case 2:this.moveBackward=false}this.updateRotationVector()};this.update=function(a){var b=a*this.movementSpeed,a=a*this.rollSpeed;this.object.translateX(this.moveVector.x*b);this.object.translateY(this.moveVector.y*b);this.object.translateZ(this.moveVector.z*b);this.tmpQuaternion.set(this.rotationVector.x*a,this.rotationVector.y*a,this.rotationVector.z*a,1).normalize();this.object.quaternion.multiplySelf(this.tmpQuaternion);this.object.matrix.setPosition(this.object.position);this.object.matrix.setRotationFromQuaternion(this.object.quaternion);
this.object.matrixWorldNeedsUpdate=true};this.updateMovementVector=function(){var a=this.moveState.forward||this.autoForward&&!this.moveState.back?1:0;this.moveVector.x=-this.moveState.left+this.moveState.right;this.moveVector.y=-this.moveState.down+this.moveState.up;this.moveVector.z=-a+this.moveState.back};this.updateRotationVector=function(){this.rotationVector.x=-this.moveState.pitchDown+this.moveState.pitchUp;this.rotationVector.y=-this.moveState.yawRight+this.moveState.yawLeft;this.rotationVector.z=
-this.moveState.rollRight+this.moveState.rollLeft};this.getContainerDimensions=function(){return this.domElement!=document?{size:[this.domElement.offsetWidth,this.domElement.offsetHeight],offset:[this.domElement.offsetLeft,this.domElement.offsetTop]}:{size:[window.innerWidth,window.innerHeight],offset:[0,0]}};this.domElement.addEventListener("mousemove",c(this,this.mousemove),false);this.domElement.addEventListener("mousedown",c(this,this.mousedown),false);this.domElement.addEventListener("mouseup",
c(this,this.mouseup),false);this.domElement.addEventListener("keydown",c(this,this.keydown),false);this.domElement.addEventListener("keyup",c(this,this.keyup),false);this.updateMovementVector();this.updateRotationVector()};
THREE.RollControls=function(a,b){this.object=a;this.domElement=b!==void 0?b:document;this.mouseLook=true;this.autoForward=false;this.rollSpeed=this.movementSpeed=this.lookSpeed=1;this.constrainVertical=[-0.9,0.9];this.object.matrixAutoUpdate=false;this.forward=new THREE.Vector3(0,0,1);this.roll=0;var c=new THREE.Vector3,d=new THREE.Vector3,f=new THREE.Vector3,e=new THREE.Matrix4,g=false,h=1,i=0,j=0,k=0,q=0,l=0,n=window.innerWidth/2,r=window.innerHeight/2;this.update=function(a){if(this.mouseLook){var b=
a*this.lookSpeed;this.rotateHorizontally(b*q);this.rotateVertically(b*l)}b=a*this.movementSpeed;this.object.translateZ(-b*(i>0||this.autoForward&&!(i<0)?1:i));this.object.translateX(b*j);this.object.translateY(b*k);if(g)this.roll=this.roll+this.rollSpeed*a*h;if(this.forward.y>this.constrainVertical[1]){this.forward.y=this.constrainVertical[1];this.forward.normalize()}else if(this.forward.y<this.constrainVertical[0]){this.forward.y=this.constrainVertical[0];this.forward.normalize()}f.copy(this.forward);
d.set(0,1,0);c.cross(d,f).normalize();d.cross(f,c).normalize();this.object.matrix.n11=c.x;this.object.matrix.n12=d.x;this.object.matrix.n13=f.x;this.object.matrix.n21=c.y;this.object.matrix.n22=d.y;this.object.matrix.n23=f.y;this.object.matrix.n31=c.z;this.object.matrix.n32=d.z;this.object.matrix.n33=f.z;e.identity();e.n11=Math.cos(this.roll);e.n12=-Math.sin(this.roll);e.n21=Math.sin(this.roll);e.n22=Math.cos(this.roll);this.object.matrix.multiplySelf(e);this.object.matrixWorldNeedsUpdate=true;this.object.matrix.n14=
this.object.position.x;this.object.matrix.n24=this.object.position.y;this.object.matrix.n34=this.object.position.z};this.translateX=function(a){this.object.position.x=this.object.position.x+this.object.matrix.n11*a;this.object.position.y=this.object.position.y+this.object.matrix.n21*a;this.object.position.z=this.object.position.z+this.object.matrix.n31*a};this.translateY=function(a){this.object.position.x=this.object.position.x+this.object.matrix.n12*a;this.object.position.y=this.object.position.y+
this.object.matrix.n22*a;this.object.position.z=this.object.position.z+this.object.matrix.n32*a};this.translateZ=function(a){this.object.position.x=this.object.position.x-this.object.matrix.n13*a;this.object.position.y=this.object.position.y-this.object.matrix.n23*a;this.object.position.z=this.object.position.z-this.object.matrix.n33*a};this.rotateHorizontally=function(a){c.set(this.object.matrix.n11,this.object.matrix.n21,this.object.matrix.n31);c.multiplyScalar(a);this.forward.subSelf(c);this.forward.normalize()};
this.rotateVertically=function(a){d.set(this.object.matrix.n12,this.object.matrix.n22,this.object.matrix.n32);d.multiplyScalar(a);this.forward.addSelf(d);this.forward.normalize()};this.domElement.addEventListener("contextmenu",function(a){a.preventDefault()},false);this.domElement.addEventListener("mousemove",function(a){q=(a.clientX-n)/window.innerWidth;l=(a.clientY-r)/window.innerHeight},false);this.domElement.addEventListener("mousedown",function(a){a.preventDefault();a.stopPropagation();switch(a.button){case 0:i=
1;break;case 2:i=-1}},false);this.domElement.addEventListener("mouseup",function(a){a.preventDefault();a.stopPropagation();switch(a.button){case 0:i=0;break;case 2:i=0}},false);this.domElement.addEventListener("keydown",function(a){switch(a.keyCode){case 38:case 87:i=1;break;case 37:case 65:j=-1;break;case 40:case 83:i=-1;break;case 39:case 68:j=1;break;case 81:g=true;h=1;break;case 69:g=true;h=-1;break;case 82:k=1;break;case 70:k=-1}},false);this.domElement.addEventListener("keyup",function(a){switch(a.keyCode){case 38:case 87:i=
0;break;case 37:case 65:j=0;break;case 40:case 83:i=0;break;case 39:case 68:j=0;break;case 81:g=false;break;case 69:g=false;break;case 82:k=0;break;case 70:k=0}},false)};
THREE.TrackballControls=function(a,b){THREE.EventTarget.call(this);var c=this;this.object=a;this.domElement=b!==void 0?b:document;this.enabled=true;this.screen={width:window.innerWidth,height:window.innerHeight,offsetLeft:0,offsetTop:0};this.radius=(this.screen.width+this.screen.height)/4;this.rotateSpeed=1;this.zoomSpeed=1.2;this.panSpeed=0.3;this.staticMoving=this.noPan=this.noZoom=this.noRotate=false;this.dynamicDampingFactor=0.2;this.minDistance=0;this.maxDistance=Infinity;this.keys=[65,83,68];
this.target=new THREE.Vector3;var d=new THREE.Vector3,f=false,e=-1,g=new THREE.Vector3,h=new THREE.Vector3,i=new THREE.Vector3,j=new THREE.Vector2,k=new THREE.Vector2,q=new THREE.Vector2,l=new THREE.Vector2,n={type:"change"};this.handleEvent=function(a){if(typeof this[a.type]=="function")this[a.type](a)};this.getMouseOnScreen=function(a,b){return new THREE.Vector2((a-c.screen.offsetLeft)/c.radius*0.5,(b-c.screen.offsetTop)/c.radius*0.5)};this.getMouseProjectionOnBall=function(a,b){var d=new THREE.Vector3((a-
c.screen.width*0.5-c.screen.offsetLeft)/c.radius,(c.screen.height*0.5+c.screen.offsetTop-b)/c.radius,0),e=d.length();e>1?d.normalize():d.z=Math.sqrt(1-e*e);g.copy(c.object.position).subSelf(c.target);e=c.object.up.clone().setLength(d.y);e.addSelf(c.object.up.clone().crossSelf(g).setLength(d.x));e.addSelf(g.setLength(d.z));return e};this.rotateCamera=function(){var a=Math.acos(h.dot(i)/h.length()/i.length());if(a){var b=(new THREE.Vector3).cross(h,i).normalize(),d=new THREE.Quaternion,a=a*c.rotateSpeed;
d.setFromAxisAngle(b,-a);d.multiplyVector3(g);d.multiplyVector3(c.object.up);d.multiplyVector3(i);if(c.staticMoving)h=i;else{d.setFromAxisAngle(b,a*(c.dynamicDampingFactor-1));d.multiplyVector3(h)}}};this.zoomCamera=function(){var a=1+(k.y-j.y)*c.zoomSpeed;if(a!==1&&a>0){g.multiplyScalar(a);c.staticMoving?j=k:j.y=j.y+(k.y-j.y)*this.dynamicDampingFactor}};this.panCamera=function(){var a=l.clone().subSelf(q);if(a.lengthSq()){a.multiplyScalar(g.length()*c.panSpeed);var b=g.clone().crossSelf(c.object.up).setLength(a.x);
b.addSelf(c.object.up.clone().setLength(a.y));c.object.position.addSelf(b);c.target.addSelf(b);c.staticMoving?q=l:q.addSelf(a.sub(l,q).multiplyScalar(c.dynamicDampingFactor))}};this.checkDistances=function(){if(!c.noZoom||!c.noPan){c.object.position.lengthSq()>c.maxDistance*c.maxDistance&&c.object.position.setLength(c.maxDistance);g.lengthSq()<c.minDistance*c.minDistance&&c.object.position.add(c.target,g.setLength(c.minDistance))}};this.update=function(){g.copy(c.object.position).subSelf(c.target);
c.noRotate||c.rotateCamera();c.noZoom||c.zoomCamera();c.noPan||c.panCamera();c.object.position.add(c.target,g);c.checkDistances();c.object.lookAt(c.target);if(d.distanceTo(c.object.position)>0){c.dispatchEvent(n);d.copy(c.object.position)}};this.domElement.addEventListener("contextmenu",function(a){a.preventDefault()},false);this.domElement.addEventListener("mousemove",function(a){if(c.enabled){if(f){h=i=c.getMouseProjectionOnBall(a.clientX,a.clientY);j=k=c.getMouseOnScreen(a.clientX,a.clientY);q=
l=c.getMouseOnScreen(a.clientX,a.clientY);f=false}e!==-1&&(e===0&&!c.noRotate?i=c.getMouseProjectionOnBall(a.clientX,a.clientY):e===1&&!c.noZoom?k=c.getMouseOnScreen(a.clientX,a.clientY):e===2&&!c.noPan&&(l=c.getMouseOnScreen(a.clientX,a.clientY)))}},false);this.domElement.addEventListener("mousedown",function(a){if(c.enabled){a.preventDefault();a.stopPropagation();if(e===-1){e=a.button;e===0&&!c.noRotate?h=i=c.getMouseProjectionOnBall(a.clientX,a.clientY):e===1&&!c.noZoom?j=k=c.getMouseOnScreen(a.clientX,
a.clientY):this.noPan||(q=l=c.getMouseOnScreen(a.clientX,a.clientY))}}},false);this.domElement.addEventListener("mouseup",function(a){if(c.enabled){a.preventDefault();a.stopPropagation();e=-1}},false);window.addEventListener("keydown",function(a){if(c.enabled&&e===-1){a.keyCode===c.keys[0]&&!c.noRotate?e=0:a.keyCode===c.keys[1]&&!c.noZoom?e=1:a.keyCode===c.keys[2]&&!c.noPan&&(e=2);e!==-1&&(f=true)}},false);window.addEventListener("keyup",function(){c.enabled&&e!==-1&&(e=-1)},false)};
THREE.CubeGeometry=function(a,b,c,d,f,e,g,h){function i(a,b,c,g,h,l,i,k){var m,q=d||1,n=f||1,r=h/2,p=l/2,t=j.vertices.length;if(a==="x"&&b==="y"||a==="y"&&b==="x")m="z";else if(a==="x"&&b==="z"||a==="z"&&b==="x"){m="y";n=e||1}else if(a==="z"&&b==="y"||a==="y"&&b==="z"){m="x";q=e||1}var s=q+1,v=n+1,F=h/q,M=l/n,N=new THREE.Vector3;N[m]=i>0?1:-1;for(h=0;h<v;h++)for(l=0;l<s;l++){var D=new THREE.Vertex;D[a]=(l*F-r)*c;D[b]=(h*M-p)*g;D[m]=i;j.vertices.push(D)}for(h=0;h<n;h++)for(l=0;l<q;l++){a=new THREE.Face4(l+
s*h+t,l+s*(h+1)+t,l+1+s*(h+1)+t,l+1+s*h+t);a.normal.copy(N);a.vertexNormals.push(N.clone(),N.clone(),N.clone(),N.clone());a.materialIndex=k;j.faces.push(a);j.faceVertexUvs[0].push([new THREE.UV(l/q,h/n),new THREE.UV(l/q,(h+1)/n),new THREE.UV((l+1)/q,(h+1)/n),new THREE.UV((l+1)/q,h/n)])}}THREE.Geometry.call(this);var j=this,k=a/2,q=b/2,l=c/2,n,r,m,p,t,s;if(g!==void 0){if(g instanceof Array)this.materials=g;else{this.materials=[];for(n=0;n<6;n++)this.materials.push(g)}n=0;p=1;r=2;t=3;m=4;s=5}else this.materials=
[];this.sides={px:true,nx:true,py:true,ny:true,pz:true,nz:true};if(h!=void 0)for(var v in h)this.sides[v]!==void 0&&(this.sides[v]=h[v]);this.sides.px&&i("z","y",-1,-1,c,b,k,n);this.sides.nx&&i("z","y",1,-1,c,b,-k,p);this.sides.py&&i("x","z",1,1,a,c,q,r);this.sides.ny&&i("x","z",1,-1,a,c,-q,t);this.sides.pz&&i("x","y",1,-1,a,b,l,m);this.sides.nz&&i("x","y",-1,-1,a,b,-l,s);this.computeCentroids();this.mergeVertices()};THREE.CubeGeometry.prototype=new THREE.Geometry;
THREE.CubeGeometry.prototype.constructor=THREE.CubeGeometry;
THREE.CylinderGeometry=function(a,b,c,d,f,e){THREE.Geometry.call(this);var a=a!==void 0?a:20,b=b!==void 0?b:20,c=c!==void 0?c:100,g=c/2,d=d||8,f=f||1,h,i,j=[],k=[];for(i=0;i<=f;i++){var q=[],l=[],n=i/f,r=n*(b-a)+a;for(h=0;h<=d;h++){var m=h/d,p=r*Math.sin(m*Math.PI*2),t=-n*c+g,s=r*Math.cos(m*Math.PI*2);this.vertices.push(new THREE.Vertex(p,t,s));q.push(this.vertices.length-1);l.push(new THREE.UV(m,n))}j.push(q);k.push(l)}for(i=0;i<f;i++)for(h=0;h<d;h++){var c=j[i][h],q=j[i+1][h],l=j[i+1][h+1],n=j[i][h+
1],r=this.vertices[c].clone().setY(0).normalize(),m=this.vertices[q].clone().setY(0).normalize(),p=this.vertices[l].clone().setY(0).normalize(),t=this.vertices[n].clone().setY(0).normalize(),s=k[i][h].clone(),v=k[i+1][h].clone(),o=k[i+1][h+1].clone(),x=k[i][h+1].clone();this.faces.push(new THREE.Face4(c,q,l,n,[r,m,p,t]));this.faceVertexUvs[0].push([s,v,o,x])}if(!e&&a>0){this.vertices.push(new THREE.Vertex(0,g,0));for(h=0;h<d;h++){c=j[0][h];q=j[0][h+1];l=this.vertices.length-1;r=new THREE.Vector3(0,
1,0);m=new THREE.Vector3(0,1,0);p=new THREE.Vector3(0,1,0);s=k[0][h].clone();v=k[0][h+1].clone();o=new THREE.UV(v.u,0);this.faces.push(new THREE.Face3(c,q,l,[r,m,p]));this.faceVertexUvs[0].push([s,v,o])}}if(!e&&b>0){this.vertices.push(new THREE.Vertex(0,-g,0));for(h=0;h<d;h++){c=j[i][h+1];q=j[i][h];l=this.vertices.length-1;r=new THREE.Vector3(0,-1,0);m=new THREE.Vector3(0,-1,0);p=new THREE.Vector3(0,-1,0);s=k[i][h+1].clone();v=k[i][h].clone();o=new THREE.UV(v.u,1);this.faces.push(new THREE.Face3(c,
q,l,[r,m,p]));this.faceVertexUvs[0].push([s,v,o])}}this.computeCentroids();this.computeFaceNormals()};THREE.CylinderGeometry.prototype=new THREE.Geometry;THREE.CylinderGeometry.prototype.constructor=THREE.CylinderGeometry;THREE.ExtrudeGeometry=function(a,b){if(typeof a!=="undefined"){THREE.Geometry.call(this);a=a instanceof Array?a:[a];this.shapebb=a[a.length-1].getBoundingBox();this.addShapeList(a,b);this.computeCentroids();this.computeFaceNormals()}};THREE.ExtrudeGeometry.prototype=new THREE.Geometry;
THREE.ExtrudeGeometry.prototype.constructor=THREE.ExtrudeGeometry;THREE.ExtrudeGeometry.prototype.addShapeList=function(a,b){for(var c=a.length,d=0;d<c;d++)this.addShape(a[d],b)};
THREE.ExtrudeGeometry.prototype.addShape=function(a,b){function c(a,b,c){b||console.log("die");return b.clone().multiplyScalar(c).addSelf(a)}function d(a,b,c){var d=THREE.ExtrudeGeometry.__v1,e=THREE.ExtrudeGeometry.__v2,f=THREE.ExtrudeGeometry.__v3,g=THREE.ExtrudeGeometry.__v4,h=THREE.ExtrudeGeometry.__v5,l=THREE.ExtrudeGeometry.__v6;d.set(a.x-b.x,a.y-b.y);e.set(a.x-c.x,a.y-c.y);d=d.normalize();e=e.normalize();f.set(-d.y,d.x);g.set(e.y,-e.x);h.copy(a).addSelf(f);l.copy(a).addSelf(g);if(h.equals(l))return g.clone();
h.copy(b).addSelf(f);l.copy(c).addSelf(g);f=d.dot(g);g=l.subSelf(h).dot(g);if(f===0){console.log("Either infinite or no solutions!");g===0?console.log("Its finite solutions."):console.log("Too bad, no solutions.")}g=g/f;if(g<0){b=Math.atan2(b.y-a.y,b.x-a.x);a=Math.atan2(c.y-a.y,c.x-a.x);b>a&&(a=a+Math.PI*2);c=(b+a)/2;a=-Math.cos(c);c=-Math.sin(c);return new THREE.Vector2(a,c)}return d.multiplyScalar(g).addSelf(h).subSelf(a).clone()}function f(c,d){var e,f;for(D=c.length;--D>=0;){e=D;f=D-1;f<0&&(f=
c.length-1);for(var g=0,h=l+k*2,g=0;g<h;g++){var j=F*g,i=F*(g+1),m=d+e+j,j=d+f+j,q=d+f+i,i=d+e+i,n=c,r=g,p=h,m=m+H,j=j+H,q=q+H,i=i+H;E.faces.push(new THREE.Face4(m,j,q,i,null,null,s));m=O.generateSideWallUV(E,a,n,b,m,j,q,i,r,p);E.faceVertexUvs[0].push(m)}}}function e(a,b,c){E.vertices.push(new THREE.Vertex(a,b,c))}function g(c,d,e,f){c=c+H;d=d+H;e=e+H;E.faces.push(new THREE.Face3(c,d,e,null,null,t));c=f?O.generateBottomUV(E,a,b,c,d,e):O.generateTopUV(E,a,b,c,d,e);E.faceVertexUvs[0].push(c)}var h=
b.amount!==void 0?b.amount:100,i=b.bevelThickness!==void 0?b.bevelThickness:6,j=b.bevelSize!==void 0?b.bevelSize:i-2,k=b.bevelSegments!==void 0?b.bevelSegments:3,q=b.bevelEnabled!==void 0?b.bevelEnabled:true,l=b.steps!==void 0?b.steps:1,n=b.bendPath,r=b.extrudePath,m,p=false,t=b.material,s=b.extrudeMaterial,v,o,x,y;if(r){m=r.getSpacedPoints(l);p=true;q=false;v=new THREE.TubeGeometry.FrenetFrames(r,l,false);o=new THREE.Vector3;x=new THREE.Vector3;y=new THREE.Vector3}if(!q)j=i=k=0;var z,u,w,E=this,
H=this.vertices.length;n&&a.addWrapPath(n);var r=a.extractPoints(),n=r.shape,I=r.holes;if(r=!THREE.Shape.Utils.isClockWise(n)){n=n.reverse();u=0;for(w=I.length;u<w;u++){z=I[u];THREE.Shape.Utils.isClockWise(z)&&(I[u]=z.reverse())}r=false}var J=THREE.Shape.Utils.triangulateShape(n,I),C=n;u=0;for(w=I.length;u<w;u++){z=I[u];n=n.concat(z)}var A,B,G,L,K,F=n.length,M,N=J.length,r=[],D=0;G=C.length;A=G-1;for(B=D+1;D<G;D++,A++,B++){A===G&&(A=0);B===G&&(B=0);r[D]=d(C[D],C[A],C[B])}var T=[],P,S=r.concat();u=
0;for(w=I.length;u<w;u++){z=I[u];P=[];D=0;G=z.length;A=G-1;for(B=D+1;D<G;D++,A++,B++){A===G&&(A=0);B===G&&(B=0);P[D]=d(z[D],z[A],z[B])}T.push(P);S=S.concat(P)}for(A=0;A<k;A++){G=A/k;L=i*(1-G);B=j*Math.sin(G*Math.PI/2);D=0;for(G=C.length;D<G;D++){K=c(C[D],r[D],B);e(K.x,K.y,-L)}u=0;for(w=I.length;u<w;u++){z=I[u];P=T[u];D=0;for(G=z.length;D<G;D++){K=c(z[D],P[D],B);e(K.x,K.y,-L)}}}B=j;for(D=0;D<F;D++){K=q?c(n[D],S[D],B):n[D];if(p){x.copy(v.normals[0]).multiplyScalar(K.x);o.copy(v.binormals[0]).multiplyScalar(K.y);
y.copy(m[0]).addSelf(x).addSelf(o);e(y.x,y.y,y.z)}else e(K.x,K.y,0)}for(G=1;G<=l;G++)for(D=0;D<F;D++){K=q?c(n[D],S[D],B):n[D];if(p){x.copy(v.normals[G]).multiplyScalar(K.x);o.copy(v.binormals[G]).multiplyScalar(K.y);y.copy(m[G]).addSelf(x).addSelf(o);e(y.x,y.y,y.z)}else e(K.x,K.y,h/l*G)}for(A=k-1;A>=0;A--){G=A/k;L=i*(1-G);B=j*Math.sin(G*Math.PI/2);D=0;for(G=C.length;D<G;D++){K=c(C[D],r[D],B);e(K.x,K.y,h+L)}u=0;for(w=I.length;u<w;u++){z=I[u];P=T[u];D=0;for(G=z.length;D<G;D++){K=c(z[D],P[D],B);p?e(K.x,
K.y+m[l-1].y,m[l-1].x+L):e(K.x,K.y,h+L)}}}var O=THREE.ExtrudeGeometry.WorldUVGenerator;(function(){if(q){var a;a=F*0;for(D=0;D<N;D++){M=J[D];g(M[2]+a,M[1]+a,M[0]+a,true)}a=l+k*2;a=F*a;for(D=0;D<N;D++){M=J[D];g(M[0]+a,M[1]+a,M[2]+a,false)}}else{for(D=0;D<N;D++){M=J[D];g(M[2],M[1],M[0],true)}for(D=0;D<N;D++){M=J[D];g(M[0]+F*l,M[1]+F*l,M[2]+F*l,false)}}})();(function(){var a=0;f(C,a);a=a+C.length;u=0;for(w=I.length;u<w;u++){z=I[u];f(z,a);a=a+z.length}})()};
THREE.ExtrudeGeometry.WorldUVGenerator={generateTopUV:function(a,b,c,d,f,e){b=a.vertices[f].x;f=a.vertices[f].y;c=a.vertices[e].x;e=a.vertices[e].y;return[new THREE.UV(a.vertices[d].x,1-a.vertices[d].y),new THREE.UV(b,1-f),new THREE.UV(c,1-e)]},generateBottomUV:function(a,b,c,d,f,e){return this.generateTopUV(a,b,c,d,f,e)},generateSideWallUV:function(a,b,c,d,f,e,g,h){var b=a.vertices[f].x,c=a.vertices[f].y,f=a.vertices[f].z,d=a.vertices[e].x,i=a.vertices[e].y,e=a.vertices[e].z,j=a.vertices[g].x,k=
a.vertices[g].y,g=a.vertices[g].z,q=a.vertices[h].x,l=a.vertices[h].y,a=a.vertices[h].z;return Math.abs(c-i)<0.01?[new THREE.UV(b,f),new THREE.UV(d,e),new THREE.UV(j,g),new THREE.UV(q,a)]:[new THREE.UV(c,f),new THREE.UV(i,e),new THREE.UV(k,g),new THREE.UV(l,a)]}};THREE.ExtrudeGeometry.__v1=new THREE.Vector2;THREE.ExtrudeGeometry.__v2=new THREE.Vector2;THREE.ExtrudeGeometry.__v3=new THREE.Vector2;THREE.ExtrudeGeometry.__v4=new THREE.Vector2;THREE.ExtrudeGeometry.__v5=new THREE.Vector2;
THREE.ExtrudeGeometry.__v6=new THREE.Vector2;
THREE.LatheGeometry=function(a,b,c){THREE.Geometry.call(this);for(var b=b||12,c=c||2*Math.PI,d=[],f=(new THREE.Matrix4).makeRotationZ(c/b),e=0;e<a.length;e++){d[e]=a[e].clone();this.vertices.push((new THREE.Vertex).copy(d[e]))}for(var g=b+1,c=0;c<g;c++)for(e=0;e<d.length;e++){d[e]=f.multiplyVector3(d[e].clone());this.vertices.push((new THREE.Vertex).copy(d[e]))}for(c=0;c<b;c++){d=0;for(f=a.length;d<f-1;d++){this.faces.push(new THREE.Face4(c*f+d,(c+1)%g*f+d,(c+1)%g*f+(d+1)%f,c*f+(d+1)%f));this.faceVertexUvs[0].push([new THREE.UV(1-
c/b,d/f),new THREE.UV(1-(c+1)/b,d/f),new THREE.UV(1-(c+1)/b,(d+1)/f),new THREE.UV(1-c/b,(d+1)/f)])}}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.LatheGeometry.prototype=new THREE.Geometry;THREE.LatheGeometry.prototype.constructor=THREE.LatheGeometry;
THREE.PlaneGeometry=function(a,b,c,d){THREE.Geometry.call(this);for(var f=a/2,e=b/2,c=c||1,d=d||1,g=c+1,h=d+1,i=a/c,j=b/d,k=new THREE.Vector3(0,1,0),a=0;a<h;a++)for(b=0;b<g;b++)this.vertices.push(new THREE.Vertex(b*i-f,0,a*j-e));for(a=0;a<d;a++)for(b=0;b<c;b++){f=new THREE.Face4(b+g*a,b+g*(a+1),b+1+g*(a+1),b+1+g*a);f.normal.copy(k);f.vertexNormals.push(k.clone(),k.clone(),k.clone(),k.clone());this.faces.push(f);this.faceVertexUvs[0].push([new THREE.UV(b/c,a/d),new THREE.UV(b/c,(a+1)/d),new THREE.UV((b+
1)/c,(a+1)/d),new THREE.UV((b+1)/c,a/d)])}this.computeCentroids()};THREE.PlaneGeometry.prototype=new THREE.Geometry;THREE.PlaneGeometry.prototype.constructor=THREE.PlaneGeometry;
THREE.SphereGeometry=function(a,b,c,d,f,e,g){THREE.Geometry.call(this);var a=a||50,d=d!==void 0?d:0,f=f!==void 0?f:Math.PI*2,e=e!==void 0?e:0,g=g!==void 0?g:Math.PI,b=Math.max(3,Math.floor(b)||8),c=Math.max(2,Math.floor(c)||6),h,i,j=[],k=[];for(i=0;i<=c;i++){var q=[],l=[];for(h=0;h<=b;h++){var n=h/b,r=i/c,m=-a*Math.cos(d+n*f)*Math.sin(e+r*g),p=a*Math.cos(e+r*g),t=a*Math.sin(d+n*f)*Math.sin(e+r*g);this.vertices.push(new THREE.Vertex(m,p,t));q.push(this.vertices.length-1);l.push(new THREE.UV(n,r))}j.push(q);
k.push(l)}for(i=0;i<c;i++)for(h=0;h<b;h++){var d=j[i][h+1],f=j[i][h],e=j[i+1][h],g=j[i+1][h+1],q=this.vertices[d].clone().normalize(),l=this.vertices[f].clone().normalize(),n=this.vertices[e].clone().normalize(),r=this.vertices[g].clone().normalize(),m=k[i][h+1].clone(),p=k[i][h].clone(),t=k[i+1][h].clone(),s=k[i+1][h+1].clone();if(Math.abs(this.vertices[d].y)==a){this.faces.push(new THREE.Face3(d,e,g,[q,n,r]));this.faceVertexUvs[0].push([m,t,s])}else if(Math.abs(this.vertices[e].y)==a){this.faces.push(new THREE.Face3(d,
f,e,[q,l,n]));this.faceVertexUvs[0].push([m,p,t])}else{this.faces.push(new THREE.Face4(d,f,e,g,[q,l,n,r]));this.faceVertexUvs[0].push([m,p,t,s])}}this.computeCentroids();this.computeFaceNormals();this.boundingSphere={radius:a}};THREE.SphereGeometry.prototype=new THREE.Geometry;THREE.SphereGeometry.prototype.constructor=THREE.SphereGeometry;
THREE.TextGeometry=function(a,b){var c=(new THREE.TextPath(a,b)).toShapes();b.amount=b.height!==void 0?b.height:50;if(b.bevelThickness===void 0)b.bevelThickness=10;if(b.bevelSize===void 0)b.bevelSize=8;if(b.bevelEnabled===void 0)b.bevelEnabled=false;if(b.bend){var d=c[c.length-1].getBoundingBox().maxX;b.bendPath=new THREE.QuadraticBezierCurve(new THREE.Vector2(0,0),new THREE.Vector2(d/2,120),new THREE.Vector2(d,0))}THREE.ExtrudeGeometry.call(this,c,b)};THREE.TextGeometry.prototype=new THREE.ExtrudeGeometry;
THREE.TextGeometry.prototype.constructor=THREE.TextGeometry;
THREE.FontUtils={faces:{},face:"helvetiker",weight:"normal",style:"normal",size:150,divisions:10,getFace:function(){return this.faces[this.face][this.weight][this.style]},loadFace:function(a){var b=a.familyName.toLowerCase();this.faces[b]=this.faces[b]||{};this.faces[b][a.cssFontWeight]=this.faces[b][a.cssFontWeight]||{};this.faces[b][a.cssFontWeight][a.cssFontStyle]=a;return this.faces[b][a.cssFontWeight][a.cssFontStyle]=a},drawText:function(a){for(var b=this.getFace(),c=this.size/b.resolution,d=
0,f=(""+a).split(""),e=f.length,g=[],a=0;a<e;a++){var h=new THREE.Path,h=this.extractGlyphPoints(f[a],b,c,d,h),d=d+h.offset;g.push(h.path)}return{paths:g,offset:d/2}},extractGlyphPoints:function(a,b,c,d,f){var e=[],g,h,i,j,k,q,l,n,r,m,p,t=b.glyphs[a]||b.glyphs["?"];if(t){if(t.o){b=t._cachedOutline||(t._cachedOutline=t.o.split(" "));j=b.length;for(a=0;a<j;){i=b[a++];switch(i){case "m":i=b[a++]*c+d;k=b[a++]*c;e.push(new THREE.Vector2(i,k));f.moveTo(i,k);break;case "l":i=b[a++]*c+d;k=b[a++]*c;e.push(new THREE.Vector2(i,
k));f.lineTo(i,k);break;case "q":i=b[a++]*c+d;k=b[a++]*c;n=b[a++]*c+d;r=b[a++]*c;f.quadraticCurveTo(n,r,i,k);if(g=e[e.length-1]){q=g.x;l=g.y;g=1;for(h=this.divisions;g<=h;g++){var s=g/h,v=THREE.Shape.Utils.b2(s,q,n,i),s=THREE.Shape.Utils.b2(s,l,r,k);e.push(new THREE.Vector2(v,s))}}break;case "b":i=b[a++]*c+d;k=b[a++]*c;n=b[a++]*c+d;r=b[a++]*-c;m=b[a++]*c+d;p=b[a++]*-c;f.bezierCurveTo(i,k,n,r,m,p);if(g=e[e.length-1]){q=g.x;l=g.y;g=1;for(h=this.divisions;g<=h;g++){s=g/h;v=THREE.Shape.Utils.b3(s,q,n,
m,i);s=THREE.Shape.Utils.b3(s,l,r,p,k);e.push(new THREE.Vector2(v,s))}}}}}return{offset:t.ha*c,points:e,path:f}}}};
(function(a){var b=function(a){for(var b=a.length,f=0,e=b-1,g=0;g<b;e=g++)f=f+(a[e].x*a[g].y-a[g].x*a[e].y);return f*0.5};a.Triangulate=function(a,d){var f=a.length;if(f<3)return null;var e=[],g=[],h=[],i,j,k;if(b(a)>0)for(j=0;j<f;j++)g[j]=j;else for(j=0;j<f;j++)g[j]=f-1-j;var q=2*f;for(j=f-1;f>2;){if(q--<=0){console.log("Warning, unable to triangulate polygon!");break}i=j;f<=i&&(i=0);j=i+1;f<=j&&(j=0);k=j+1;f<=k&&(k=0);var l;a:{l=a;var n=i,r=j,m=k,p=f,t=g,s=void 0,v=void 0,o=void 0,x=void 0,y=void 0,
z=void 0,u=void 0,w=void 0,E=void 0,v=l[t[n]].x,o=l[t[n]].y,x=l[t[r]].x,y=l[t[r]].y,z=l[t[m]].x,u=l[t[m]].y;if(1.0E-10>(x-v)*(u-o)-(y-o)*(z-v))l=false;else{for(s=0;s<p;s++)if(!(s==n||s==r||s==m)){var w=l[t[s]].x,E=l[t[s]].y,H=void 0,I=void 0,J=void 0,C=void 0,A=void 0,B=void 0,G=void 0,L=void 0,K=void 0,F=void 0,M=void 0,N=void 0,H=J=A=void 0,H=z-x,I=u-y,J=v-z,C=o-u,A=x-v,B=y-o,G=w-v,L=E-o,K=w-x,F=E-y,M=w-z,N=E-u,H=H*F-I*K,A=A*L-B*G,J=J*N-C*M;if(H>=0&&J>=0&&A>=0){l=false;break a}}l=true}}if(l){e.push([a[g[i]],
a[g[j]],a[g[k]]]);h.push([g[i],g[j],g[k]]);i=j;for(k=j+1;k<f;i++,k++)g[i]=g[k];f--;q=2*f}}return d?h:e};a.Triangulate.area=b;return a})(THREE.FontUtils);self._typeface_js={faces:THREE.FontUtils.faces,loadFace:THREE.FontUtils.loadFace};
THREE.TorusGeometry=function(a,b,c,d,f){THREE.Geometry.call(this);this.radius=a||100;this.tube=b||40;this.segmentsR=c||8;this.segmentsT=d||6;this.arc=f||Math.PI*2;f=new THREE.Vector3;a=[];b=[];for(c=0;c<=this.segmentsR;c++)for(d=0;d<=this.segmentsT;d++){var e=d/this.segmentsT*this.arc,g=c/this.segmentsR*Math.PI*2;f.x=this.radius*Math.cos(e);f.y=this.radius*Math.sin(e);var h=new THREE.Vertex;h.x=(this.radius+this.tube*Math.cos(g))*Math.cos(e);h.y=(this.radius+this.tube*Math.cos(g))*Math.sin(e);h.z=
this.tube*Math.sin(g);this.vertices.push(h);a.push(new THREE.UV(d/this.segmentsT,1-c/this.segmentsR));b.push(h.clone().subSelf(f).normalize())}for(c=1;c<=this.segmentsR;c++)for(d=1;d<=this.segmentsT;d++){var f=(this.segmentsT+1)*c+d-1,e=(this.segmentsT+1)*(c-1)+d-1,g=(this.segmentsT+1)*(c-1)+d,h=(this.segmentsT+1)*c+d,i=new THREE.Face4(f,e,g,h,[b[f],b[e],b[g],b[h]]);i.normal.addSelf(b[f]);i.normal.addSelf(b[e]);i.normal.addSelf(b[g]);i.normal.addSelf(b[h]);i.normal.normalize();this.faces.push(i);
this.faceVertexUvs[0].push([a[f].clone(),a[e].clone(),a[g].clone(),a[h].clone()])}this.computeCentroids()};THREE.TorusGeometry.prototype=new THREE.Geometry;THREE.TorusGeometry.prototype.constructor=THREE.TorusGeometry;
THREE.TorusKnotGeometry=function(a,b,c,d,f,e,g){function h(a,b,c,d,e,f){var g=Math.cos(a);Math.cos(b);b=Math.sin(a);a=c/d*a;c=Math.cos(a);g=e*(2+c)*0.5*g;b=e*(2+c)*b*0.5;e=f*e*Math.sin(a)*0.5;return new THREE.Vector3(g,b,e)}THREE.Geometry.call(this);this.radius=a||200;this.tube=b||40;this.segmentsR=c||64;this.segmentsT=d||8;this.p=f||2;this.q=e||3;this.heightScale=g||1;this.grid=Array(this.segmentsR);c=new THREE.Vector3;d=new THREE.Vector3;f=new THREE.Vector3;for(a=0;a<this.segmentsR;++a){this.grid[a]=
Array(this.segmentsT);for(b=0;b<this.segmentsT;++b){var i=a/this.segmentsR*2*this.p*Math.PI,g=b/this.segmentsT*2*Math.PI,e=h(i,g,this.q,this.p,this.radius,this.heightScale),i=h(i+0.01,g,this.q,this.p,this.radius,this.heightScale);c.sub(i,e);d.add(i,e);f.cross(c,d);d.cross(f,c);f.normalize();d.normalize();i=-this.tube*Math.cos(g);g=this.tube*Math.sin(g);e.x=e.x+(i*d.x+g*f.x);e.y=e.y+(i*d.y+g*f.y);e.z=e.z+(i*d.z+g*f.z);this.grid[a][b]=this.vertices.push(new THREE.Vertex(e.x,e.y,e.z))-1}}for(a=0;a<this.segmentsR;++a)for(b=
0;b<this.segmentsT;++b){var f=(a+1)%this.segmentsR,e=(b+1)%this.segmentsT,c=this.grid[a][b],d=this.grid[f][b],f=this.grid[f][e],e=this.grid[a][e],g=new THREE.UV(a/this.segmentsR,b/this.segmentsT),i=new THREE.UV((a+1)/this.segmentsR,b/this.segmentsT),j=new THREE.UV((a+1)/this.segmentsR,(b+1)/this.segmentsT),k=new THREE.UV(a/this.segmentsR,(b+1)/this.segmentsT);this.faces.push(new THREE.Face4(c,d,f,e));this.faceVertexUvs[0].push([g,i,j,k])}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};
THREE.TorusKnotGeometry.prototype=new THREE.Geometry;THREE.TorusKnotGeometry.prototype.constructor=THREE.TorusKnotGeometry;
THREE.TubeGeometry=function(a,b,c,d,f,e){THREE.Geometry.call(this);this.path=a;this.segments=b||64;this.radius=c||1;this.segmentsRadius=d||8;this.closed=f||false;if(e)this.debug=new THREE.Object3D;this.grid=[];var g,h,e=this.segments+1,i,j,k,q=new THREE.Vector3,l,n,r,b=new THREE.TubeGeometry.FrenetFrames(a,b,f);l=b.tangents;n=b.normals;r=b.binormals;this.tangents=l;this.normals=n;this.binormals=r;for(b=0;b<e;b++){this.grid[b]=[];d=b/(e-1);k=a.getPointAt(d);d=l[b];g=n[b];h=r[b];if(this.debug){this.debug.add(new THREE.ArrowHelper(d,
k,c,255));this.debug.add(new THREE.ArrowHelper(g,k,c,16711680));this.debug.add(new THREE.ArrowHelper(h,k,c,65280))}for(d=0;d<this.segmentsRadius;d++){i=d/this.segmentsRadius*2*Math.PI;j=-this.radius*Math.cos(i);i=this.radius*Math.sin(i);q.copy(k);q.x=q.x+(j*g.x+i*h.x);q.y=q.y+(j*g.y+i*h.y);q.z=q.z+(j*g.z+i*h.z);this.grid[b][d]=this.vertices.push(new THREE.Vertex(q.x,q.y,q.z))-1}}for(b=0;b<this.segments;b++)for(d=0;d<this.segmentsRadius;d++){e=f?(b+1)%this.segments:b+1;q=(d+1)%this.segmentsRadius;
a=this.grid[b][d];c=this.grid[e][d];e=this.grid[e][q];q=this.grid[b][q];l=new THREE.UV(b/this.segments,d/this.segmentsRadius);n=new THREE.UV((b+1)/this.segments,d/this.segmentsRadius);r=new THREE.UV((b+1)/this.segments,(d+1)/this.segmentsRadius);g=new THREE.UV(b/this.segments,(d+1)/this.segmentsRadius);this.faces.push(new THREE.Face4(a,c,e,q));this.faceVertexUvs[0].push([l,n,r,g])}this.computeCentroids();this.computeFaceNormals();this.computeVertexNormals()};THREE.TubeGeometry.prototype=new THREE.Geometry;
THREE.TubeGeometry.prototype.constructor=THREE.TubeGeometry;
THREE.TubeGeometry.FrenetFrames=function(a,b,c){new THREE.Vector3;var d=new THREE.Vector3;new THREE.Vector3;var f=[],e=[],g=[],h=new THREE.Vector3,i=new THREE.Matrix4,b=b+1,j,k,q;this.tangents=f;this.normals=e;this.binormals=g;for(j=0;j<b;j++){k=j/(b-1);f[j]=a.getTangentAt(k);f[j].normalize()}e[0]=new THREE.Vector3;g[0]=new THREE.Vector3;a=Number.MAX_VALUE;j=Math.abs(f[0].x);k=Math.abs(f[0].y);q=Math.abs(f[0].z);if(j<=a){a=j;d.set(1,0,0)}if(k<=a){a=k;d.set(0,1,0)}q<=a&&d.set(0,0,1);h.cross(f[0],d).normalize();
e[0].cross(f[0],h);g[0].cross(f[0],e[0]);for(j=1;j<b;j++){e[j]=e[j-1].clone();g[j]=g[j-1].clone();h.cross(f[j-1],f[j]);if(h.length()>1.0E-4){h.normalize();d=Math.acos(f[j-1].dot(f[j]));i.makeRotationAxis(h,d).multiplyVector3(e[j])}g[j].cross(f[j],e[j])}if(c){d=Math.acos(e[0].dot(e[b-1]));d=d/(b-1);f[0].dot(h.cross(e[0],e[b-1]))>0&&(d=-d);for(j=1;j<b;j++){i.makeRotationAxis(f[j],d*j).multiplyVector3(e[j]);g[j].cross(f[j],e[j])}}};
THREE.PolyhedronGeometry=function(a,b,c,d){function f(a){var b=(new THREE.Vertex).copy(a.normalize());b.index=i.vertices.push(b)-1;var c=Math.atan2(a.z,-a.x)/2/Math.PI+0.5,a=Math.atan2(-a.y,Math.sqrt(a.x*a.x+a.z*a.z))/Math.PI+0.5;b.uv=new THREE.UV(c,a);return b}function e(a,b,c,d){if(d<1){d=new THREE.Face3(a.index,b.index,c.index,[a.clone(),b.clone(),c.clone()]);d.centroid.addSelf(a).addSelf(b).addSelf(c).divideScalar(3);d.normal=d.centroid.clone().normalize();i.faces.push(d);d=Math.atan2(d.centroid.z,
-d.centroid.x);i.faceVertexUvs[0].push([h(a.uv,a,d),h(b.uv,b,d),h(c.uv,c,d)])}else{d=d-1;e(a,g(a,b),g(a,c),d);e(g(a,b),b,g(b,c),d);e(g(a,c),g(b,c),c,d);e(g(a,b),g(b,c),g(a,c),d)}}function g(a,b){q[a.index]||(q[a.index]=[]);q[b.index]||(q[b.index]=[]);var c=q[a.index][b.index];c===void 0&&(q[a.index][b.index]=q[b.index][a.index]=c=f((new THREE.Vector3).add(a,b).divideScalar(2)));return c}function h(a,b,c){c<0&&a.u===1&&(a=new THREE.UV(a.u-1,a.v));b.x===0&&b.z===0&&(a=new THREE.UV(c/2/Math.PI+0.5,a.v));
return a}THREE.Geometry.call(this);for(var c=c||1,d=d||0,i=this,j=0,k=a.length;j<k;j++)f(new THREE.Vector3(a[j][0],a[j][1],a[j][2]));for(var q=[],a=this.vertices,j=0,k=b.length;j<k;j++)e(a[b[j][0]],a[b[j][1]],a[b[j][2]],d);this.mergeVertices();j=0;for(k=this.vertices.length;j<k;j++)this.vertices[j].multiplyScalar(c);this.computeCentroids();this.boundingSphere={radius:c}};THREE.PolyhedronGeometry.prototype=new THREE.Geometry;THREE.PolyhedronGeometry.prototype.constructor=THREE.PolyhedronGeometry;
THREE.IcosahedronGeometry=function(a,b){var c=(1+Math.sqrt(5))/2;THREE.PolyhedronGeometry.call(this,[[-1,c,0],[1,c,0],[-1,-c,0],[1,-c,0],[0,-1,c],[0,1,c],[0,-1,-c],[0,1,-c],[c,0,-1],[c,0,1],[-c,0,-1],[-c,0,1]],[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],a,b)};THREE.IcosahedronGeometry.prototype=new THREE.Geometry;THREE.IcosahedronGeometry.prototype.constructor=THREE.IcosahedronGeometry;
THREE.OctahedronGeometry=function(a,b){THREE.PolyhedronGeometry.call(this,[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],[[0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,2,5],[1,5,3],[1,3,4],[1,4,2]],a,b)};THREE.OctahedronGeometry.prototype=new THREE.Geometry;THREE.OctahedronGeometry.prototype.constructor=THREE.OctahedronGeometry;THREE.TetrahedronGeometry=function(a,b){THREE.PolyhedronGeometry.call(this,[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],[[2,1,0],[0,3,2],[1,3,0],[2,3,1]],a,b)};
THREE.TetrahedronGeometry.prototype=new THREE.Geometry;THREE.TetrahedronGeometry.prototype.constructor=THREE.TetrahedronGeometry;
THREE.AxisHelper=function(){THREE.Object3D.call(this);var a=new THREE.Geometry;a.vertices.push(new THREE.Vertex);a.vertices.push(new THREE.Vertex(0,100,0));var b=new THREE.CylinderGeometry(0,5,25,5,1),c;c=new THREE.Line(a,new THREE.LineBasicMaterial({color:16711680}));c.rotation.z=-Math.PI/2;this.add(c);c=new THREE.Mesh(b,new THREE.MeshBasicMaterial({color:16711680}));c.position.x=100;c.rotation.z=-Math.PI/2;this.add(c);c=new THREE.Line(a,new THREE.LineBasicMaterial({color:65280}));this.add(c);c=
new THREE.Mesh(b,new THREE.MeshBasicMaterial({color:65280}));c.position.y=100;this.add(c);c=new THREE.Line(a,new THREE.LineBasicMaterial({color:255}));c.rotation.x=Math.PI/2;this.add(c);c=new THREE.Mesh(b,new THREE.MeshBasicMaterial({color:255}));c.position.z=100;c.rotation.x=Math.PI/2;this.add(c)};THREE.AxisHelper.prototype=new THREE.Object3D;THREE.AxisHelper.prototype.constructor=THREE.AxisHelper;
THREE.ArrowHelper=function(a,b,c,d){THREE.Object3D.call(this);d===void 0&&(d=16776960);c===void 0&&(c=20);var f=new THREE.Geometry;f.vertices.push(new THREE.Vertex(0,0,0));f.vertices.push(new THREE.Vertex(0,1,0));this.line=new THREE.Line(f,new THREE.LineBasicMaterial({color:d}));this.add(this.line);f=new THREE.CylinderGeometry(0,0.05,0.25,5,1);this.cone=new THREE.Mesh(f,new THREE.MeshBasicMaterial({color:d}));this.cone.position.set(0,1,0);this.add(this.cone);if(b instanceof THREE.Vector3)this.position=
b;this.setDirection(a);this.setLength(c)};THREE.ArrowHelper.prototype=new THREE.Object3D;THREE.ArrowHelper.prototype.constructor=THREE.ArrowHelper;THREE.ArrowHelper.prototype.setDirection=function(a){var b=(new THREE.Vector3(0,1,0)).crossSelf(a),a=Math.acos((new THREE.Vector3(0,1,0)).dot(a.clone().normalize()));this.matrix=(new THREE.Matrix4).makeRotationAxis(b.normalize(),a);this.rotation.getRotationFromMatrix(this.matrix,this.scale)};
THREE.ArrowHelper.prototype.setLength=function(a){this.scale.set(a,a,a)};THREE.ArrowHelper.prototype.setColor=function(a){this.line.material.color.setHex(a);this.cone.material.color.setHex(a)};
THREE.CameraHelper=function(a){function b(a,b,d){c(a,d);c(b,d)}function c(a,b){d.lineGeometry.vertices.push(new THREE.Vertex);d.lineGeometry.colors.push(new THREE.Color(b));d.pointMap[a]===void 0&&(d.pointMap[a]=[]);d.pointMap[a].push(d.lineGeometry.vertices.length-1)}THREE.Object3D.call(this);var d=this;this.lineGeometry=new THREE.Geometry;this.lineMaterial=new THREE.LineBasicMaterial({color:16777215,vertexColors:THREE.FaceColors});this.pointMap={};b("n1","n2",16755200);b("n2","n4",16755200);b("n4",
"n3",16755200);b("n3","n1",16755200);b("f1","f2",16755200);b("f2","f4",16755200);b("f4","f3",16755200);b("f3","f1",16755200);b("n1","f1",16755200);b("n2","f2",16755200);b("n3","f3",16755200);b("n4","f4",16755200);b("p","n1",16711680);b("p","n2",16711680);b("p","n3",16711680);b("p","n4",16711680);b("u1","u2",43775);b("u2","u3",43775);b("u3","u1",43775);b("c","t",16777215);b("p","c",3355443);b("cn1","cn2",3355443);b("cn3","cn4",3355443);b("cf1","cf2",3355443);b("cf3","cf4",3355443);this.camera=a;this.update(a);
this.lines=new THREE.Line(this.lineGeometry,this.lineMaterial,THREE.LinePieces);this.add(this.lines)};THREE.CameraHelper.prototype=new THREE.Object3D;THREE.CameraHelper.prototype.constructor=THREE.CameraHelper;
THREE.CameraHelper.prototype.update=function(){function a(a,d,f,e){THREE.CameraHelper.__v.set(d,f,e);THREE.CameraHelper.__projector.unprojectVector(THREE.CameraHelper.__v,THREE.CameraHelper.__c);a=b.pointMap[a];if(a!==void 0){d=0;for(f=a.length;d<f;d++)b.lineGeometry.vertices[a[d]].copy(THREE.CameraHelper.__v)}}var b=this;THREE.CameraHelper.__c.projectionMatrix.copy(this.camera.projectionMatrix);a("c",0,0,-1);a("t",0,0,1);a("n1",-1,-1,-1);a("n2",1,-1,-1);a("n3",-1,1,-1);a("n4",1,1,-1);a("f1",-1,-1,
1);a("f2",1,-1,1);a("f3",-1,1,1);a("f4",1,1,1);a("u1",0.7,1.1,-1);a("u2",-0.7,1.1,-1);a("u3",0,2,-1);a("cf1",-1,0,1);a("cf2",1,0,1);a("cf3",0,-1,1);a("cf4",0,1,1);a("cn1",-1,0,-1);a("cn2",1,0,-1);a("cn3",0,-1,-1);a("cn4",0,1,-1);this.lineGeometry.__dirtyVertices=true};THREE.CameraHelper.__projector=new THREE.Projector;THREE.CameraHelper.__v=new THREE.Vector3;THREE.CameraHelper.__c=new THREE.Camera;
THREE.SubdivisionModifier=function(a){this.subdivisions=a===void 0?1:a;this.useOldVertexColors=false;this.supportUVs=true;this.debug=false};THREE.SubdivisionModifier.prototype.constructor=THREE.SubdivisionModifier;THREE.SubdivisionModifier.prototype.modify=function(a){for(var b=this.subdivisions;b-- >0;)this.smooth(a)};
THREE.SubdivisionModifier.prototype.smooth=function(a){function b(){l.debug&&console.log.apply(console,arguments)}function c(){console&&console.log.apply(console,arguments)}function d(a,c,d,f,g,h,j){var i=new THREE.Face4(a,c,d,f,null,g.color,g.material);if(l.useOldVertexColors){i.vertexColors=[];for(var m,n,p,r=0;r<4;r++){p=h[r];m=new THREE.Color;m.setRGB(0,0,0);for(var o=0;o<p.length;o++){n=g.vertexColors[p[o]-1];m.r=m.r+n.r;m.g=m.g+n.g;m.b=m.b+n.b}m.r=m.r/p.length;m.g=m.g/p.length;m.b=m.b/p.length;
i.vertexColors[r]=m}}k.push(i);if(l.supportUVs){g=[e(a,""),e(c,j),e(d,j),e(f,j)];g[0]?g[1]?g[2]?g[3]?q.push(g):b("d :( ",f+":"+j):b("c :( ",d+":"+j):b("b :( ",c+":"+j):b("a :( ",a+":"+j)}}function f(a,b){return Math.min(a,b)+"_"+Math.max(a,b)}function e(a,d){var e=a+":"+d,f=s[e];if(!f){a>=v&&a<v+r.length?b("face pt"):b("edge pt");c("warning, UV not found for",e);return null}return f}function g(a,b,d){var e=a+":"+b;e in s?c("dup vertexNo",a,"oldFaceNo",b,"value",d,"key",e,s[e]):s[e]=d}function h(a,
b){J[a]===void 0&&(J[a]=[]);J[a].push(b)}function i(a,b,c){C[a]===void 0&&(C[a]={});C[a][b]=c}var j=[],k=[],q=[],l=this,n=a.vertices,r=a.faces,j=n.concat(),m=[],p={},t={},s={},v=n.length,o,x,y,z,u,w=a.faceVertexUvs[0],E;b("originalFaces, uvs, originalVerticesLength",r.length,w.length,v);if(l.supportUVs){o=0;for(x=w.length;o<x;o++){y=0;for(z=w[o].length;y<z;y++){E=r[o]["abcd".charAt(y)];g(E,o,w[o][y])}}}if(w.length==0)l.supportUVs=false;o=0;for(u in s)o++;if(!o){l.supportUVs=false;b("no uvs")}b("-- Original Faces + Vertices UVs completed",
s,"vs",w.length);o=0;for(x=r.length;o<x;o++){u=r[o];m.push(u.centroid);j.push((new THREE.Vertex).copy(u.centroid));if(l.supportUVs){w=new THREE.UV;if(u instanceof THREE.Face3){w.u=e(u.a,o).u+e(u.b,o).u+e(u.c,o).u;w.v=e(u.a,o).v+e(u.b,o).v+e(u.c,o).v;w.u=w.u/3;w.v=w.v/3}else if(u instanceof THREE.Face4){w.u=e(u.a,o).u+e(u.b,o).u+e(u.c,o).u+e(u.d,o).u;w.v=e(u.a,o).v+e(u.b,o).v+e(u.c,o).v+e(u.d,o).v;w.u=w.u/4;w.v=w.v/4}g(v+o,"",w)}}b("-- added UVs for new Faces",s);x=function(a){function b(a,c){h[a]===
void 0&&(h[a]=[]);h[a].push(c)}var c,d,e,g,h={};c=0;for(d=a.faces.length;c<d;c++){e=a.faces[c];if(e instanceof THREE.Face3){g=f(e.a,e.b);b(g,c);g=f(e.b,e.c);b(g,c);g=f(e.c,e.a);b(g,c)}else if(e instanceof THREE.Face4){g=f(e.a,e.b);b(g,c);g=f(e.b,e.c);b(g,c);g=f(e.c,e.d);b(g,c);g=f(e.d,e.a);b(g,c)}}return h}(a);E=0;var H,I,J={},C={};for(o in x){w=x[o];H=o.split("_");I=H[0];H=H[1];h(I,[I,H]);h(H,[I,H]);y=0;for(z=w.length;y<z;y++){u=w[y];i(I,u,o);i(H,u,o)}w.length<2&&(t[o]=true)}b("vertexEdgeMap",J,
"vertexFaceMap",C);for(o in x){w=x[o];u=w[0];z=w[1];H=o.split("_");I=H[0];H=H[1];w=new THREE.Vector3;if(t[o]){w.addSelf(n[I]);w.addSelf(n[H]);w.multiplyScalar(0.5)}else{w.addSelf(m[u]);w.addSelf(m[z]);w.addSelf(n[I]);w.addSelf(n[H]);w.multiplyScalar(0.25)}p[o]=v+r.length+E;j.push((new THREE.Vertex).copy(w));E++;if(l.supportUVs){w=new THREE.UV;w.u=e(I,u).u+e(H,u).u;w.v=e(I,u).v+e(H,u).v;w.u=w.u/2;w.v=w.v/2;g(p[o],u,w);if(!t[o]){w=new THREE.UV;w.u=e(I,z).u+e(H,z).u;w.v=e(I,z).v+e(H,z).v;w.u=w.u/2;w.v=
w.v/2;g(p[o],z,w)}}}b("-- Step 2 done");var A,B;z=["123","12","2","23"];H=["123","23","3","31"];var G=["123","31","1","12"],L=["1234","12","2","23"],K=["1234","23","3","34"],F=["1234","34","4","41"],M=["1234","41","1","12"];o=0;for(x=m.length;o<x;o++){u=r[o];w=v+o;if(u instanceof THREE.Face3){E=f(u.a,u.b);I=f(u.b,u.c);A=f(u.c,u.a);d(w,p[E],u.b,p[I],u,z,o);d(w,p[I],u.c,p[A],u,H,o);d(w,p[A],u.a,p[E],u,G,o)}else if(u instanceof THREE.Face4){E=f(u.a,u.b);I=f(u.b,u.c);A=f(u.c,u.d);B=f(u.d,u.a);d(w,p[E],
u.b,p[I],u,L,o);d(w,p[I],u.c,p[A],u,K,o);d(w,p[A],u.d,p[B],u,F,o);d(w,p[B],u.a,p[E],u,M,o)}else b("face should be a face!",u)}p=new THREE.Vector3;u=new THREE.Vector3;o=0;for(x=n.length;o<x;o++)if(J[o]!==void 0){p.set(0,0,0);u.set(0,0,0);I=new THREE.Vector3(0,0,0);w=0;for(y in C[o]){p.addSelf(m[y]);w++}z=0;E=J[o].length;for(y=0;y<E;y++)t[f(J[o][y][0],J[o][y][1])]&&z++;if(z!=2){p.divideScalar(w);for(y=0;y<E;y++){w=J[o][y];w=n[w[0]].clone().addSelf(n[w[1]]).divideScalar(2);u.addSelf(w)}u.divideScalar(E);
I.addSelf(n[o]);I.multiplyScalar(E-3);I.addSelf(p);I.addSelf(u.multiplyScalar(2));I.divideScalar(E);j[o]=I}}a.vertices=j;a.faces=k;a.faceVertexUvs[0]=q;delete a.__tmpVertices;a.computeCentroids();a.computeFaceNormals();a.computeVertexNormals()};THREE.Loader=function(a){this.statusDomElement=(this.showStatus=a)?THREE.Loader.prototype.addStatusElement():null;this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){}};
THREE.Loader.prototype={constructor:THREE.Loader,crossOrigin:"anonymous",addStatusElement:function(){var a=document.createElement("div");a.style.position="absolute";a.style.right="0px";a.style.top="0px";a.style.fontSize="0.8em";a.style.textAlign="left";a.style.background="rgba(0,0,0,0.25)";a.style.color="#fff";a.style.width="120px";a.style.padding="0.5em 0.5em 0.5em 0.5em";a.style.zIndex=1E3;a.innerHTML="Loading ...";return a},updateProgress:function(a){var b="Loaded ",b=a.total?b+((100*a.loaded/
a.total).toFixed(0)+"%"):b+((a.loaded/1E3).toFixed(2)+" KB");this.statusDomElement.innerHTML=b},extractUrlBase:function(a){a=a.split("/");a.pop();return(a.length<1?".":a.join("/"))+"/"},initMaterials:function(a,b,c){a.materials=[];for(var d=0;d<b.length;++d)a.materials[d]=THREE.Loader.prototype.createMaterial(b[d],c)},hasNormals:function(a){var b,c,d=a.materials.length;for(c=0;c<d;c++){b=a.materials[c];if(b instanceof THREE.ShaderMaterial)return true}return false},createMaterial:function(a,b){function c(a){a=
Math.log(a)/Math.LN2;return Math.floor(a)==a}function d(a){a=Math.log(a)/Math.LN2;return Math.pow(2,Math.round(a))}function f(a,b){var e=new Image;e.onload=function(){if(!c(this.width)||!c(this.height)){var b=d(this.width),e=d(this.height);a.image.width=b;a.image.height=e;a.image.getContext("2d").drawImage(this,0,0,b,e)}else a.image=this;a.needsUpdate=true};e.crossOrigin=h.crossOrigin;e.src=b}function e(a,c,d,e,g,h){var j=document.createElement("canvas");a[c]=new THREE.Texture(j);a[c].sourceFile=
d;if(e){a[c].repeat.set(e[0],e[1]);if(e[0]!=1)a[c].wrapS=THREE.RepeatWrapping;if(e[1]!=1)a[c].wrapT=THREE.RepeatWrapping}g&&a[c].offset.set(g[0],g[1]);if(h){e={repeat:THREE.RepeatWrapping,mirror:THREE.MirroredRepeatWrapping};if(e[h[0]]!==void 0)a[c].wrapS=e[h[0]];if(e[h[1]]!==void 0)a[c].wrapT=e[h[1]]}f(a[c],b+"/"+d)}function g(a){return(a[0]*255<<16)+(a[1]*255<<8)+a[2]*255}var h=this,i="MeshLambertMaterial",j={color:15658734,opacity:1,map:null,lightMap:null,normalMap:null,wireframe:a.wireframe};
if(a.shading){var k=a.shading.toLowerCase();k==="phong"?i="MeshPhongMaterial":k==="basic"&&(i="MeshBasicMaterial")}if(a.blending!==void 0&&THREE[a.blending]!==void 0)j.blending=THREE[a.blending];if(a.transparent!==void 0||a.opacity<1)j.transparent=a.transparent;if(a.depthTest!==void 0)j.depthTest=a.depthTest;if(a.depthWrite!==void 0)j.depthWrite=a.depthWrite;if(a.vertexColors!==void 0)if(a.vertexColors=="face")j.vertexColors=THREE.FaceColors;else if(a.vertexColors)j.vertexColors=THREE.VertexColors;
if(a.colorDiffuse)j.color=g(a.colorDiffuse);else if(a.DbgColor)j.color=a.DbgColor;if(a.colorSpecular)j.specular=g(a.colorSpecular);if(a.colorAmbient)j.ambient=g(a.colorAmbient);if(a.transparency)j.opacity=a.transparency;if(a.specularCoef)j.shininess=a.specularCoef;a.mapDiffuse&&b&&e(j,"map",a.mapDiffuse,a.mapDiffuseRepeat,a.mapDiffuseOffset,a.mapDiffuseWrap);a.mapLight&&b&&e(j,"lightMap",a.mapLight,a.mapLightRepeat,a.mapLightOffset,a.mapLightWrap);a.mapNormal&&b&&e(j,"normalMap",a.mapNormal,a.mapNormalRepeat,
a.mapNormalOffset,a.mapNormalWrap);a.mapSpecular&&b&&e(j,"specularMap",a.mapSpecular,a.mapSpecularRepeat,a.mapSpecularOffset,a.mapSpecularWrap);if(a.mapNormal){i=THREE.ShaderUtils.lib.normal;k=THREE.UniformsUtils.clone(i.uniforms);k.tNormal.texture=j.normalMap;if(a.mapNormalFactor)k.uNormalScale.value=a.mapNormalFactor;if(j.map){k.tDiffuse.texture=j.map;k.enableDiffuse.value=true}if(j.specularMap){k.tSpecular.texture=j.specularMap;k.enableSpecular.value=true}if(j.lightMap){k.tAO.texture=j.lightMap;
k.enableAO.value=true}k.uDiffuseColor.value.setHex(j.color);k.uSpecularColor.value.setHex(j.specular);k.uAmbientColor.value.setHex(j.ambient);k.uShininess.value=j.shininess;if(j.opacity!==void 0)k.uOpacity.value=j.opacity;j=new THREE.ShaderMaterial({fragmentShader:i.fragmentShader,vertexShader:i.vertexShader,uniforms:k,lights:true,fog:true})}else j=new THREE[i](j);if(a.DbgName!==void 0)j.name=a.DbgName;return j}};THREE.BinaryLoader=function(a){THREE.Loader.call(this,a)};
THREE.BinaryLoader.prototype=new THREE.Loader;THREE.BinaryLoader.prototype.constructor=THREE.BinaryLoader;THREE.BinaryLoader.prototype.supr=THREE.Loader.prototype;THREE.BinaryLoader.prototype.load=function(a,b,c,d){var c=c?c:this.extractUrlBase(a),d=d?d:this.extractUrlBase(a),f=this.showProgress?THREE.Loader.prototype.updateProgress:null;this.onLoadStart();this.loadAjaxJSON(this,a,b,c,d,f)};
THREE.BinaryLoader.prototype.loadAjaxJSON=function(a,b,c,d,f,e){var g=new XMLHttpRequest;g.onreadystatechange=function(){if(g.readyState==4)if(g.status==200||g.status==0){var h=JSON.parse(g.responseText);a.loadAjaxBuffers(h,c,f,d,e)}else console.error("THREE.BinaryLoader: Couldn't load ["+b+"] ["+g.status+"]")};g.open("GET",b,true);g.overrideMimeType&&g.overrideMimeType("text/plain; charset=x-user-defined");g.setRequestHeader("Content-Type","text/plain");g.send(null)};
THREE.BinaryLoader.prototype.loadAjaxBuffers=function(a,b,c,d,f){var e=new XMLHttpRequest,g=c+"/"+a.buffers,h=0;e.onreadystatechange=function(){if(e.readyState==4)e.status==200||e.status==0?THREE.BinaryLoader.prototype.createBinModel(e.response,b,d,a.materials):console.error("THREE.BinaryLoader: Couldn't load ["+g+"] ["+e.status+"]");else if(e.readyState==3){if(f){h==0&&(h=e.getResponseHeader("Content-Length"));f({total:h,loaded:e.responseText.length})}}else e.readyState==2&&(h=e.getResponseHeader("Content-Length"))};
e.open("GET",g,true);e.responseType="arraybuffer";e.send(null)};
THREE.BinaryLoader.prototype.createBinModel=function(a,b,c,d){var f=function(b){var c,f,i,j,k,q,l,n,r,m,p,t,s,v,o;function x(a){return a%4?4-a%4:0}function y(a,b){return(new Uint8Array(a,b,1))[0]}function z(a,b){return(new Uint32Array(a,b,1))[0]}function u(b,c){var d,e,f,g,h,j,i,k,l=new Uint32Array(a,c,3*b);for(d=0;d<b;d++){e=l[d*3];f=l[d*3+1];g=l[d*3+2];h=G[e*2];e=G[e*2+1];j=G[f*2];i=G[f*2+1];f=G[g*2];k=G[g*2+1];g=C.faceVertexUvs[0];var m=[];m.push(new THREE.UV(h,e));m.push(new THREE.UV(j,i));m.push(new THREE.UV(f,
k));g.push(m)}}function w(b,c){var d,e,f,g,h,j,i,k,l,m,q=new Uint32Array(a,c,4*b);for(d=0;d<b;d++){e=q[d*4];f=q[d*4+1];g=q[d*4+2];h=q[d*4+3];j=G[e*2];e=G[e*2+1];i=G[f*2];l=G[f*2+1];k=G[g*2];m=G[g*2+1];g=G[h*2];f=G[h*2+1];h=C.faceVertexUvs[0];var n=[];n.push(new THREE.UV(j,e));n.push(new THREE.UV(i,l));n.push(new THREE.UV(k,m));n.push(new THREE.UV(g,f));h.push(n)}}function E(b,c,d){for(var e,f,g,h,c=new Uint32Array(a,c,3*b),j=new Uint16Array(a,d,b),d=0;d<b;d++){e=c[d*3];f=c[d*3+1];g=c[d*3+2];h=j[d];
C.faces.push(new THREE.Face3(e,f,g,null,null,h))}}function H(b,c,d){for(var e,f,g,h,j,c=new Uint32Array(a,c,4*b),i=new Uint16Array(a,d,b),d=0;d<b;d++){e=c[d*4];f=c[d*4+1];g=c[d*4+2];h=c[d*4+3];j=i[d];C.faces.push(new THREE.Face4(e,f,g,h,null,null,j))}}function I(b,c,d,e){for(var f,g,h,j,i,k,l,c=new Uint32Array(a,c,3*b),d=new Uint32Array(a,d,3*b),m=new Uint16Array(a,e,b),e=0;e<b;e++){f=c[e*3];g=c[e*3+1];h=c[e*3+2];i=d[e*3];k=d[e*3+1];l=d[e*3+2];j=m[e];var q=B[k*3],n=B[k*3+1];k=B[k*3+2];var p=B[l*3],
r=B[l*3+1];l=B[l*3+2];C.faces.push(new THREE.Face3(f,g,h,[new THREE.Vector3(B[i*3],B[i*3+1],B[i*3+2]),new THREE.Vector3(q,n,k),new THREE.Vector3(p,r,l)],null,j))}}function J(b,c,d,e){for(var f,g,h,j,i,k,l,m,q,c=new Uint32Array(a,c,4*b),d=new Uint32Array(a,d,4*b),n=new Uint16Array(a,e,b),e=0;e<b;e++){f=c[e*4];g=c[e*4+1];h=c[e*4+2];j=c[e*4+3];k=d[e*4];l=d[e*4+1];m=d[e*4+2];q=d[e*4+3];i=n[e];var p=B[l*3],r=B[l*3+1];l=B[l*3+2];var o=B[m*3],t=B[m*3+1];m=B[m*3+2];var s=B[q*3],u=B[q*3+1];q=B[q*3+2];C.faces.push(new THREE.Face4(f,
g,h,j,[new THREE.Vector3(B[k*3],B[k*3+1],B[k*3+2]),new THREE.Vector3(p,r,l),new THREE.Vector3(o,t,m),new THREE.Vector3(s,u,q)],null,i))}}var C=this,A=0,B=[],G=[],L,K,F;THREE.Geometry.call(this);THREE.Loader.prototype.initMaterials(C,d,b);(function(a,b,c){for(var a=new Uint8Array(a,b,c),d="",e=0;e<c;e++)d=d+String.fromCharCode(a[b+e]);return d})(a,A,12);c=y(a,A+12);y(a,A+13);y(a,A+14);y(a,A+15);f=y(a,A+16);i=y(a,A+17);j=y(a,A+18);k=y(a,A+19);q=z(a,A+20);l=z(a,A+20+4);n=z(a,A+20+8);b=z(a,A+20+12);r=
z(a,A+20+16);m=z(a,A+20+20);p=z(a,A+20+24);t=z(a,A+20+28);s=z(a,A+20+32);v=z(a,A+20+36);o=z(a,A+20+40);A=A+c;c=f*3+k;F=f*4+k;L=b*c;K=r*(c+i*3);f=m*(c+j*3);k=p*(c+i*3+j*3);c=t*F;i=s*(F+i*4);j=v*(F+j*4);A=A+function(b){var b=new Float32Array(a,b,q*3),c,d,e,f;for(c=0;c<q;c++){d=b[c*3];e=b[c*3+1];f=b[c*3+2];C.vertices.push(new THREE.Vertex(d,e,f))}return q*3*Float32Array.BYTES_PER_ELEMENT}(A);A=A+function(b){if(l){var b=new Int8Array(a,b,l*3),c,d,e,f;for(c=0;c<l;c++){d=b[c*3];e=b[c*3+1];f=b[c*3+2];B.push(d/
127,e/127,f/127)}}return l*3*Int8Array.BYTES_PER_ELEMENT}(A);A=A+x(l*3);A=A+function(b){if(n){var b=new Float32Array(a,b,n*2),c,d,e;for(c=0;c<n;c++){d=b[c*2];e=b[c*2+1];G.push(d,e)}}return n*2*Float32Array.BYTES_PER_ELEMENT}(A);L=A+L+x(b*2);K=L+K+x(r*2);f=K+f+x(m*2);k=f+k+x(p*2);c=k+c+x(t*2);i=c+i+x(s*2);j=i+j+x(v*2);(function(a){if(m){var b=a+m*Uint32Array.BYTES_PER_ELEMENT*3;E(m,a,b+m*Uint32Array.BYTES_PER_ELEMENT*3);u(m,b)}})(K);(function(a){if(p){var b=a+p*Uint32Array.BYTES_PER_ELEMENT*3,c=b+
p*Uint32Array.BYTES_PER_ELEMENT*3;I(p,a,b,c+p*Uint32Array.BYTES_PER_ELEMENT*3);u(p,c)}})(f);(function(a){if(v){var b=a+v*Uint32Array.BYTES_PER_ELEMENT*4;H(v,a,b+v*Uint32Array.BYTES_PER_ELEMENT*4);w(v,b)}})(i);(function(a){if(o){var b=a+o*Uint32Array.BYTES_PER_ELEMENT*4,c=b+o*Uint32Array.BYTES_PER_ELEMENT*4;J(o,a,b,c+o*Uint32Array.BYTES_PER_ELEMENT*4);w(o,c)}})(j);b&&E(b,A,A+b*Uint32Array.BYTES_PER_ELEMENT*3);(function(a){if(r){var b=a+r*Uint32Array.BYTES_PER_ELEMENT*3;I(r,a,b,b+r*Uint32Array.BYTES_PER_ELEMENT*
3)}})(L);t&&H(t,k,k+t*Uint32Array.BYTES_PER_ELEMENT*4);(function(a){if(s){var b=a+s*Uint32Array.BYTES_PER_ELEMENT*4;J(s,a,b,b+s*Uint32Array.BYTES_PER_ELEMENT*4)}})(c);this.computeCentroids();this.computeFaceNormals();THREE.Loader.prototype.hasNormals(this)&&this.computeTangents()};f.prototype=new THREE.Geometry;f.prototype.constructor=f;b(new f(c))};
THREE.ColladaLoader=function(){function a(a,d,f){Q=a;d=d||na;if(f!==void 0){a=f.split("/");a.pop();oa=(a.length<1?".":a.join("/"))+"/"}if((a=Q.evaluate("//dae:asset",Q,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null).iterateNext())&&a.childNodes)for(f=0;f<a.childNodes.length;f++){var j=a.childNodes[f];switch(j.nodeName){case "unit":(j=j.getAttribute("meter"))&&parseFloat(j);break;case "up_axis":ba=j.textContent.charAt(0)}}if(!R.convertUpAxis||ba===R.upAxis)X=null;else switch(ba){case "X":X=R.upAxis===
"Y"?"XtoY":"XtoZ";break;case "Y":X=R.upAxis==="X"?"YtoX":"YtoZ";break;case "Z":X=R.upAxis==="X"?"ZtoX":"ZtoY"}aa=b("//dae:library_images/dae:image",g,"image");ga=b("//dae:library_materials/dae:material",w,"material");ha=b("//dae:library_effects/dae:effect",C,"effect");W=b("//dae:library_geometries/dae:geometry",p,"geometry");ia=b(".//dae:library_cameras/dae:camera",F,"camera");V=b("//dae:library_controllers/dae:controller",h,"controller");Y=b("//dae:library_animations/dae:animation",B,"animation");
ja=b(".//dae:library_visual_scenes/dae:visual_scene",k,"visual_scene");ca=[];da=[];if(a=Q.evaluate(".//dae:scene/dae:instance_visual_scene",Q,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null).iterateNext()){a=a.getAttribute("url").replace(/^#/,"");U=ja[a.length>0?a:"visual_scene0"]}else U=null;$=new THREE.Object3D;for(a=0;a<U.nodes.length;a++)$.add(e(U.nodes[a]));ka=[];c($);a={scene:$,morphs:ca,skins:da,animations:ka,dae:{images:aa,materials:ga,cameras:ia,effects:ha,geometries:W,controllers:V,animations:Y,
visualScenes:ja,scene:U}};d&&d(a);return a}function b(a,b,c){for(var a=Q.evaluate(a,Q,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null),d={},e=a.iterateNext(),f=0;e;){e=(new b).parse(e);if(!e.id||e.id.length==0)e.id=c+f++;d[e.id]=e;e=a.iterateNext()}return d}function c(a){var b=U.getChildById(a.name,true),d=null;if(b&&b.keys){d={fps:60,hierarchy:[{node:b,keys:b.keys,sids:b.sids}],node:a,name:"animation_"+a.name,length:0};ka.push(d);for(var e=0,f=b.keys.length;e<f;e++)d.length=Math.max(d.length,b.keys[e].time)}else d=
{hierarchy:[{keys:[],sids:[]}]};e=0;for(f=a.children.length;e<f;e++)for(var b=0,g=c(a.children[e]).hierarchy.length;b<g;b++)d.hierarchy.push({keys:[],sids:[]});return d}function d(a,b,c,e){a.world=a.world||new THREE.Matrix4;a.world.copy(a.matrix);if(a.channels&&a.channels.length){var f=a.channels[0].sampler.output[c];f instanceof THREE.Matrix4&&a.world.copy(f)}e&&a.world.multiply(e,a.world);b.push(a);for(e=0;e<a.nodes.length;e++)d(a.nodes[e],b,c,a.world)}function f(a,b,c){var e,f=V[b.url];if(!f||
!f.skin)console.log("ColladaLoader: Could not find skin controller.");else if(!b.skeleton||!b.skeleton.length)console.log("ColladaLoader: Could not find the skeleton for the skin. ");else{var c=1E6,g=-c,h=0;for(e in Y)for(var j=Y[e],i=0;i<j.sampler.length;i++){var k=j.sampler[i];k.create();c=Math.min(c,k.startTime);g=Math.max(g,k.endTime);h=Math.max(h,k.input.length)}e=h;for(var b=U.getChildById(b.skeleton[0],true)||U.getChildBySid(b.skeleton[0],true),l,m,g=new THREE.Vector3,q,i=0;i<a.vertices.length;i++)f.skin.bindShapeMatrix.multiplyVector3(a.vertices[i]);
for(c=0;c<e;c++){h=[];j=[];for(i=0;i<a.vertices.length;i++)j.push(new THREE.Vertex);d(b,h,c);i=h;k=f.skin;for(m=0;m<i.length;m++){l=i[m];q=-1;if(l.type=="JOINT"){for(var n=0;n<k.joints.length;n++)if(l.sid==k.joints[n]){q=n;break}if(q>=0){n=k.invBindMatrices[q];l.invBindMatrix=n;l.skinningMatrix=new THREE.Matrix4;l.skinningMatrix.multiply(l.world,n);l.weights=[];for(n=0;n<k.weights.length;n++)for(var p=0;p<k.weights[n].length;p++){var r=k.weights[n][p];r.joint==q&&l.weights.push(r)}}else throw"ColladaLoader: Could not find joint '"+
l.sid+"'.";}}for(i=0;i<h.length;i++)if(h[i].type=="JOINT")for(k=0;k<h[i].weights.length;k++){l=h[i].weights[k];m=l.index;l=l.weight;q=a.vertices[m];m=j[m];g.x=q.x;g.y=q.y;g.z=q.z;h[i].skinningMatrix.multiplyVector3(g);m.x=m.x+g.x*l;m.y=m.y+g.y*l;m.z=m.z+g.z*l}a.morphTargets.push({name:"target_"+c,vertices:j})}}}function e(a){var b=new THREE.Object3D,c,d,g,h;for(g=0;g<a.controllers.length;g++){var j=V[a.controllers[g].url];switch(j.type){case "skin":if(W[j.skin.source]){var i=new m;i.url=j.skin.source;
i.instance_material=a.controllers[g].instance_material;a.geometries.push(i);c=a.controllers[g]}else if(V[j.skin.source]){d=j=V[j.skin.source];if(j.morph&&W[j.morph.source]){i=new m;i.url=j.morph.source;i.instance_material=a.controllers[g].instance_material;a.geometries.push(i)}}break;case "morph":if(W[j.morph.source]){i=new m;i.url=j.morph.source;i.instance_material=a.controllers[g].instance_material;a.geometries.push(i);d=a.controllers[g]}console.log("ColladaLoader: Morph-controller partially supported.")}}for(g=
0;g<a.geometries.length;g++){var j=a.geometries[g],i=j.instance_material,j=W[j.url],k={},l=[],q=0,p;if(j&&j.mesh&&j.mesh.primitives){if(b.name.length==0)b.name=j.id;if(i)for(h=0;h<i.length;h++){p=i[h];var r=ga[p.target],o=ha[r.instance_effect.url].shader;o.material.opacity=!o.material.opacity?1:o.material.opacity;k[p.symbol]=q;l.push(o.material);p=o.material;p.name=r.name==null||r.name===""?r.id:r.name;q++}i=p||new THREE.MeshLambertMaterial({color:14540253,shading:THREE.FlatShading});j=j.mesh.geometry3js;
if(q>1){i=new THREE.MeshFaceMaterial;j.materials=l;for(h=0;h<j.faces.length;h++){l=j.faces[h];l.materialIndex=k[l.daeMaterial]}}if(c!==void 0){f(j,c);i.morphTargets=true;i=new THREE.SkinnedMesh(j,i);i.skeleton=c.skeleton;i.skinController=V[c.url];i.skinInstanceController=c;i.name="skin_"+da.length;da.push(i)}else if(d!==void 0){h=j;k=d instanceof n?V[d.url]:d;if(!k||!k.morph)console.log("could not find morph controller!");else{k=k.morph;for(l=0;l<k.targets.length;l++){q=W[k.targets[l]];if(q.mesh&&
q.mesh.primitives&&q.mesh.primitives.length){q=q.mesh.primitives[0].geometry;q.vertices.length===h.vertices.length&&h.morphTargets.push({name:"target_1",vertices:q.vertices})}}h.morphTargets.push({name:"target_Z",vertices:h.vertices})}i.morphTargets=true;i=new THREE.Mesh(j,i);i.name="morph_"+ca.length;ca.push(i)}else i=new THREE.Mesh(j,i);a.geometries.length>1?b.add(i):b=i}}for(g=0;g<a.cameras.length;g++){b=ia[a.cameras[g].url];b=new THREE.PerspectiveCamera(b.fov,b.aspect_ratio,b.znear,b.zfar)}b.name=
a.id||"";b.matrix=a.matrix;g=a.matrix.decompose();b.position=g[0];b.quaternion=g[1];b.useQuaternion=true;b.scale=g[2];if(R.centerGeometry&&b.geometry){g=THREE.GeometryUtils.center(b.geometry);b.quaternion.multiplyVector3(g.multiplySelf(b.scale));b.position.subSelf(g)}for(g=0;g<a.nodes.length;g++)b.add(e(a.nodes[g],a));return b}function g(){this.init_from=this.id=""}function h(){this.type=this.name=this.id="";this.morph=this.skin=null}function i(){this.weights=this.targets=this.source=this.method=
null}function j(){this.source="";this.bindShapeMatrix=null;this.invBindMatrices=[];this.joints=[];this.weights=[]}function k(){this.name=this.id="";this.nodes=[];this.scene=new THREE.Object3D}function q(){this.sid=this.name=this.id="";this.nodes=[];this.controllers=[];this.transforms=[];this.geometries=[];this.channels=[];this.matrix=new THREE.Matrix4}function l(){this.type=this.sid="";this.data=[];this.obj=null}function n(){this.url="";this.skeleton=[];this.instance_material=[]}function r(){this.target=
this.symbol=""}function m(){this.url="";this.instance_material=[]}function p(){this.id="";this.mesh=null}function t(a){this.geometry=a.id;this.primitives=[];this.geometry3js=this.vertices=null}function s(){this.material="";this.count=0;this.inputs=[];this.vcount=null;this.p=[];this.geometry=new THREE.Geometry}function v(){s.call(this);this.vcount=[]}function o(){s.call(this);this.vcount=3}function x(){this.source="";this.stride=this.count=0;this.params=[]}function y(){this.input={}}function z(){this.semantic=
"";this.offset=0;this.source="";this.set=0}function u(a){this.id=a;this.type=null}function w(){this.name=this.id="";this.instance_effect=null}function E(){this.color=new THREE.Color(0);this.color.setRGB(Math.random(),Math.random(),Math.random());this.color.a=1;this.texOpts=this.texcoord=this.texture=null}function H(a,b){this.type=a;this.effect=b;this.material=null}function I(a){this.effect=a;this.format=this.init_from=null}function J(a){this.effect=a;this.mipfilter=this.magfilter=this.minfilter=this.wrap_t=
this.wrap_s=this.source=null}function C(){this.name=this.id="";this.sampler=this.surface=this.shader=null}function A(){this.url=""}function B(){this.name=this.id="";this.source={};this.sampler=[];this.channel=[]}function G(a){this.animation=a;this.target=this.source="";this.member=this.arrIndices=this.arrSyntax=this.dotSyntax=this.sid=this.fullSid=null}function L(a){this.id="";this.animation=a;this.inputs=[];this.endTime=this.startTime=this.interpolation=this.strideOut=this.output=this.input=null;
this.duration=0}function K(a){this.targets=[];this.time=a}function F(){this.technique=this.name=this.id=""}function M(){this.url=""}function N(a){return a=="dae"?"http://www.collada.org/2005/11/COLLADASchema":null}function D(a){for(var a=P(a),b=[],c=0,d=a.length;c<d;c++)b.push(parseFloat(a[c]));return b}function T(a){for(var a=P(a),b=[],c=0,d=a.length;c<d;c++)b.push(parseInt(a[c],10));return b}function P(a){return a.length>0?a.replace(/^\s+/,"").replace(/\s+$/,"").split(/\s+/):[]}function S(a,b,c){return a.hasAttribute(b)?
parseInt(a.getAttribute(b),10):c}function O(a,b){if(R.convertUpAxis&&ba!==R.upAxis)switch(X){case "XtoY":var c=a[0];a[0]=b*a[1];a[1]=c;break;case "XtoZ":c=a[2];a[2]=a[1];a[1]=a[0];a[0]=c;break;case "YtoX":c=a[0];a[0]=a[1];a[1]=b*c;break;case "YtoZ":c=a[1];a[1]=b*a[2];a[2]=c;break;case "ZtoX":c=a[0];a[0]=a[1];a[1]=a[2];a[2]=c;break;case "ZtoY":c=a[1];a[1]=a[2];a[2]=b*c}}function ea(a,b){var c=[a[b],a[b+1],a[b+2]];O(c,-1);return new THREE.Vector3(c[0],c[1],c[2])}function fa(a){if(R.convertUpAxis){var b=
[a[0],a[4],a[8]];O(b,-1);a[0]=b[0];a[4]=b[1];a[8]=b[2];b=[a[1],a[5],a[9]];O(b,-1);a[1]=b[0];a[5]=b[1];a[9]=b[2];b=[a[2],a[6],a[10]];O(b,-1);a[2]=b[0];a[6]=b[1];a[10]=b[2];b=[a[0],a[1],a[2]];O(b,-1);a[0]=b[0];a[1]=b[1];a[2]=b[2];b=[a[4],a[5],a[6]];O(b,-1);a[4]=b[0];a[5]=b[1];a[6]=b[2];b=[a[8],a[9],a[10]];O(b,-1);a[8]=b[0];a[9]=b[1];a[10]=b[2];b=[a[3],a[7],a[11]];O(b,-1);a[3]=b[0];a[7]=b[1];a[11]=b[2]}return new THREE.Matrix4(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11],a[12],a[13],
a[14],a[15])}function ma(a){if(R.convertUpAxis)switch(a){case "X":switch(X){case "XtoY":case "XtoZ":case "YtoX":a="Y";break;case "ZtoX":a="Z"}break;case "Y":switch(X){case "XtoY":case "YtoX":case "ZtoX":a="X";break;case "XtoZ":case "YtoZ":case "ZtoY":a="Z"}break;case "Z":switch(X){case "XtoZ":a="X";break;case "YtoZ":case "ZtoX":case "ZtoY":a="Y"}}return a}var Q=null,$=null,U,na=null,Z={},aa={},Y={},V={},W={},ga={},ha={},ia={},ka,ja,oa,ca,da,pa=THREE.SmoothShading,R={centerGeometry:false,convertUpAxis:false,
subdivideFaces:true,upAxis:"Y"},ba="Y",X=null,la=Math.PI/180;g.prototype.parse=function(a){this.id=a.getAttribute("id");for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeName=="init_from")this.init_from=c.textContent}return this};h.prototype.parse=function(a){this.id=a.getAttribute("id");this.name=a.getAttribute("name");this.type="none";for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];switch(c.nodeName){case "skin":this.skin=(new j).parse(c);this.type=c.nodeName;break;
case "morph":this.morph=(new i).parse(c);this.type=c.nodeName}}return this};i.prototype.parse=function(a){var b={},c=[],d;this.method=a.getAttribute("method");this.source=a.getAttribute("source").replace(/^#/,"");for(d=0;d<a.childNodes.length;d++){var e=a.childNodes[d];if(e.nodeType==1)switch(e.nodeName){case "source":e=(new u).parse(e);b[e.id]=e;break;case "targets":c=this.parseInputs(e);break;default:console.log(e.nodeName)}}for(d=0;d<c.length;d++){a=c[d];e=b[a.source];switch(a.semantic){case "MORPH_TARGET":this.targets=
e.read();break;case "MORPH_WEIGHT":this.weights=e.read()}}return this};i.prototype.parseInputs=function(a){for(var b=[],c=0;c<a.childNodes.length;c++){var d=a.childNodes[c];if(d.nodeType==1)switch(d.nodeName){case "input":b.push((new z).parse(d))}}return b};j.prototype.parse=function(a){var b={},c,d;this.source=a.getAttribute("source").replace(/^#/,"");this.invBindMatrices=[];this.joints=[];this.weights=[];for(var e=0;e<a.childNodes.length;e++){var f=a.childNodes[e];if(f.nodeType==1)switch(f.nodeName){case "bind_shape_matrix":f=
D(f.textContent);this.bindShapeMatrix=fa(f);break;case "source":f=(new u).parse(f);b[f.id]=f;break;case "joints":c=f;break;case "vertex_weights":d=f;break;default:console.log(f.nodeName)}}this.parseJoints(c,b);this.parseWeights(d,b);return this};j.prototype.parseJoints=function(a,b){for(var c=0;c<a.childNodes.length;c++){var d=a.childNodes[c];if(d.nodeType==1)switch(d.nodeName){case "input":var d=(new z).parse(d),e=b[d.source];if(d.semantic=="JOINT")this.joints=e.read();else if(d.semantic=="INV_BIND_MATRIX")this.invBindMatrices=
e.read()}}};j.prototype.parseWeights=function(a,b){for(var c,d,e=[],f=0;f<a.childNodes.length;f++){var g=a.childNodes[f];if(g.nodeType==1)switch(g.nodeName){case "input":e.push((new z).parse(g));break;case "v":c=T(g.textContent);break;case "vcount":d=T(g.textContent)}}for(f=g=0;f<d.length;f++){for(var h=d[f],j=[],i=0;i<h;i++){for(var k={},l=0;l<e.length;l++){var m=e[l],q=c[g+m.offset];switch(m.semantic){case "JOINT":k.joint=q;break;case "WEIGHT":k.weight=b[m.source].data[q]}}j.push(k);g=g+e.length}for(i=
0;i<j.length;i++)j[i].index=f;this.weights.push(j)}};k.prototype.getChildById=function(a,b){for(var c=0;c<this.nodes.length;c++){var d=this.nodes[c].getChildById(a,b);if(d)return d}return null};k.prototype.getChildBySid=function(a,b){for(var c=0;c<this.nodes.length;c++){var d=this.nodes[c].getChildBySid(a,b);if(d)return d}return null};k.prototype.parse=function(a){this.id=a.getAttribute("id");this.name=a.getAttribute("name");this.nodes=[];for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];
if(c.nodeType==1)switch(c.nodeName){case "node":this.nodes.push((new q).parse(c))}}return this};q.prototype.getChannelForTransform=function(a){for(var b=0;b<this.channels.length;b++){var c=this.channels[b],d=c.target.split("/");d.shift();var e=d.shift(),f=e.indexOf(".")>=0,g=e.indexOf("(")>=0,h;if(f){d=e.split(".");e=d.shift();d.shift()}else if(g){h=e.split("(");e=h.shift();for(d=0;d<h.length;d++)h[d]=parseInt(h[d].replace(/\)/,""))}if(e==a){c.info={sid:e,dotSyntax:f,arrSyntax:g,arrIndices:h};return c}}return null};
q.prototype.getChildById=function(a,b){if(this.id==a)return this;if(b)for(var c=0;c<this.nodes.length;c++){var d=this.nodes[c].getChildById(a,b);if(d)return d}return null};q.prototype.getChildBySid=function(a,b){if(this.sid==a)return this;if(b)for(var c=0;c<this.nodes.length;c++){var d=this.nodes[c].getChildBySid(a,b);if(d)return d}return null};q.prototype.getTransformBySid=function(a){for(var b=0;b<this.transforms.length;b++)if(this.transforms[b].sid==a)return this.transforms[b];return null};q.prototype.parse=
function(a){var b;this.id=a.getAttribute("id");this.sid=a.getAttribute("sid");this.name=a.getAttribute("name");this.type=a.getAttribute("type");this.type=this.type=="JOINT"?this.type:"NODE";this.nodes=[];this.transforms=[];this.geometries=[];this.cameras=[];this.controllers=[];this.matrix=new THREE.Matrix4;for(var c=0;c<a.childNodes.length;c++){b=a.childNodes[c];if(b.nodeType==1)switch(b.nodeName){case "node":this.nodes.push((new q).parse(b));break;case "instance_camera":this.cameras.push((new M).parse(b));
break;case "instance_controller":this.controllers.push((new n).parse(b));break;case "instance_geometry":this.geometries.push((new m).parse(b));break;case "instance_light":break;case "instance_node":b=b.getAttribute("url").replace(/^#/,"");(b=Q.evaluate(".//dae:library_nodes//dae:node[@id='"+b+"']",Q,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null).iterateNext())&&this.nodes.push((new q).parse(b));break;case "rotate":case "translate":case "scale":case "matrix":case "lookat":case "skew":this.transforms.push((new l).parse(b));
break;case "extra":break;default:console.log(b.nodeName)}}a=[];c=1E6;b=-1E6;for(var d in Y)for(var e=Y[d],f=0;f<e.channel.length;f++){var g=e.channel[f],h=e.sampler[f];d=g.target.split("/")[0];if(d==this.id){h.create();g.sampler=h;c=Math.min(c,h.startTime);b=Math.max(b,h.endTime);a.push(g)}}if(a.length){this.startTime=c;this.endTime=b}if((this.channels=a)&&this.channels.length){d=[];a=[];c=0;for(e=this.channels.length;c<e;c++){var j=this.channels[c],f=j.fullSid,g=j.sampler,h=g.input,i=this.getTransformBySid(j.sid),
k;if(j.arrIndices){k=[];b=0;for(var p=j.arrIndices.length;b<p;b++){var r=k,o=b,t=j.arrIndices[b];if(t>-1&&t<3){t=ma(["X","Y","Z"][t]);t={X:0,Y:1,Z:2}[t]}r[o]=t}}else k=ma(j.member);if(i){a.indexOf(f)===-1&&a.push(f);b=0;for(p=h.length;b<p;b++){for(var r=h[b],j=g.getData(i.type,b),o=null,t=0,s=d.length;t<s&&o==null;t++){var u=d[t];if(u.time===r)o=u;else if(u.time>r)break}if(!o){o=new K(r);t=-1;s=0;for(u=d.length;s<u&&t==-1;s++)d[s].time>=r&&(t=s);r=t;d.splice(r==-1?d.length:r,0,o)}o.addTarget(f,i,
k,j)}}else console.log('Could not find transform "'+j.sid+'" in node '+this.id)}for(c=0;c<a.length;c++){e=a[c];for(b=0;b<d.length;b++){o=d[b];if(!o.hasTarget(e)){h=d;f=o;k=b;g=e;i=void 0;a:{i=k?k-1:0;for(i=i>=0?i:i+h.length;i>=0;i--){p=h[i];if(p.hasTarget(g)){i=p;break a}}i=null}p=void 0;a:{for(k=k+1;k<h.length;k++){p=h[k];if(p.hasTarget(g))break a}p=null}if(i&&p){h=(f.time-i.time)/(p.time-i.time);i=i.getTarget(g);k=p.getTarget(g).data;p=i.data;j=void 0;if(i.type==="matrix")j=p;else if(p.length){j=
[];for(r=0;r<p.length;++r)j[r]=p[r]+(k[r]-p[r])*h}else j=p+(k-p)*h;f.addTarget(g,i.transform,i.member,j)}}}}this.keys=d;this.sids=a}this.updateMatrix();return this};q.prototype.updateMatrix=function(){this.matrix.identity();for(var a=0;a<this.transforms.length;a++)this.transforms[a].apply(this.matrix)};l.prototype.parse=function(a){this.sid=a.getAttribute("sid");this.type=a.nodeName;this.data=D(a.textContent);this.convert();return this};l.prototype.convert=function(){switch(this.type){case "matrix":this.obj=
fa(this.data);break;case "rotate":this.angle=this.data[3]*la;case "translate":O(this.data,-1);this.obj=new THREE.Vector3(this.data[0],this.data[1],this.data[2]);break;case "scale":O(this.data,1);this.obj=new THREE.Vector3(this.data[0],this.data[1],this.data[2]);break;default:console.log("Can not convert Transform of type "+this.type)}};l.prototype.apply=function(a){switch(this.type){case "matrix":a.multiplySelf(this.obj);break;case "translate":a.translate(this.obj);break;case "rotate":a.rotateByAxis(this.obj,
this.angle);break;case "scale":a.scale(this.obj)}};l.prototype.update=function(a,b){var c=["X","Y","Z","ANGLE"];switch(this.type){case "matrix":if(b)if(b.length===1)switch(b[0]){case 0:this.obj.n11=a[0];this.obj.n21=a[1];this.obj.n31=a[2];this.obj.n41=a[3];break;case 1:this.obj.n12=a[0];this.obj.n22=a[1];this.obj.n32=a[2];this.obj.n42=a[3];break;case 2:this.obj.n13=a[0];this.obj.n23=a[1];this.obj.n33=a[2];this.obj.n43=a[3];break;case 3:this.obj.n14=a[0];this.obj.n24=a[1];this.obj.n34=a[2];this.obj.n44=
a[3]}else b.length===2?this.obj["n"+(b[0]+1)+(b[1]+1)]=a:console.log("Incorrect addressing of matrix in transform.");else this.obj.copy(a);break;case "translate":case "scale":Object.prototype.toString.call(b)==="[object Array]"&&(b=c[b[0]]);switch(b){case "X":this.obj.x=a;break;case "Y":this.obj.y=a;break;case "Z":this.obj.z=a;break;default:this.obj.x=a[0];this.obj.y=a[1];this.obj.z=a[2]}break;case "rotate":Object.prototype.toString.call(b)==="[object Array]"&&(b=c[b[0]]);switch(b){case "X":this.obj.x=
a;break;case "Y":this.obj.y=a;break;case "Z":this.obj.z=a;break;case "ANGLE":this.angle=a*la;break;default:this.obj.x=a[0];this.obj.y=a[1];this.obj.z=a[2];this.angle=a[3]*la}}};n.prototype.parse=function(a){this.url=a.getAttribute("url").replace(/^#/,"");this.skeleton=[];this.instance_material=[];for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "skeleton":this.skeleton.push(c.textContent.replace(/^#/,""));break;case "bind_material":if(c=Q.evaluate(".//dae:instance_material",
c,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null))for(var d=c.iterateNext();d;){this.instance_material.push((new r).parse(d));d=c.iterateNext()}}}return this};r.prototype.parse=function(a){this.symbol=a.getAttribute("symbol");this.target=a.getAttribute("target").replace(/^#/,"");return this};m.prototype.parse=function(a){this.url=a.getAttribute("url").replace(/^#/,"");this.instance_material=[];for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1&&c.nodeName=="bind_material"){if(a=
Q.evaluate(".//dae:instance_material",c,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null))for(b=a.iterateNext();b;){this.instance_material.push((new r).parse(b));b=a.iterateNext()}break}}return this};p.prototype.parse=function(a){this.id=a.getAttribute("id");for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];switch(c.nodeName){case "mesh":this.mesh=(new t(this)).parse(c)}}return this};t.prototype.parse=function(a){this.primitives=[];var b;for(b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];
switch(c.nodeName){case "source":var d=c.getAttribute("id");Z[d]==void 0&&(Z[d]=(new u(d)).parse(c));break;case "vertices":this.vertices=(new y).parse(c);break;case "triangles":this.primitives.push((new o).parse(c));break;case "polygons":this.primitives.push((new s).parse(c));break;case "polylist":this.primitives.push((new v).parse(c))}}this.geometry3js=new THREE.Geometry;a=Z[this.vertices.input.POSITION.source].data;for(b=0;b<a.length;b=b+3)this.geometry3js.vertices.push((new THREE.Vertex).copy(ea(a,
b)));for(b=0;b<this.primitives.length;b++){a=this.primitives[b];a.setVertices(this.vertices);this.handlePrimitive(a,this.geometry3js)}this.geometry3js.computeCentroids();this.geometry3js.computeFaceNormals();if(this.geometry3js.calcNormals){this.geometry3js.computeVertexNormals();delete this.geometry3js.calcNormals}this.geometry3js.computeBoundingBox();return this};t.prototype.handlePrimitive=function(a,b){var c,d,e=a.p,f=a.inputs,g,h,i,j,k=0,l=3,m=0,q=[];for(c=0;c<f.length;c++){g=f[c];l=g.offset+
1;m=m<l?l:m;switch(g.semantic){case "TEXCOORD":q.push(g.set)}}for(var n=0;n<e.length;++n)for(var p=e[n],r=0;r<p.length;){var o=[],t=[],s={},u=[],l=a.vcount?a.vcount.length?a.vcount[k++]:a.vcount:p.length/m;for(c=0;c<l;c++)for(d=0;d<f.length;d++){g=f[d];j=Z[g.source];h=p[r+c*m+g.offset];i=j.accessor.params.length;i=h*i;switch(g.semantic){case "VERTEX":o.push(h);break;case "NORMAL":t.push(ea(j.data,i));break;case "TEXCOORD":s[g.set]===void 0&&(s[g.set]=[]);s[g.set].push(new THREE.UV(j.data[i],1-j.data[i+
1]));break;case "COLOR":u.push((new THREE.Color).setRGB(j.data[i],j.data[i+1],j.data[i+2]))}}d=null;c=[];if(t.length==0)if(g=this.vertices.input.NORMAL){j=Z[g.source];i=j.accessor.params.length;g=0;for(h=o.length;g<h;g++)t.push(ea(j.data,o[g]*i))}else b.calcNormals=true;if(l===3)c.push(new THREE.Face3(o[0],o[1],o[2],t,u.length?u:new THREE.Color));else if(l===4)c.push(new THREE.Face4(o[0],o[1],o[2],o[3],t,u.length?u:new THREE.Color));else if(l>4&&R.subdivideFaces){u=u.length?u:new THREE.Color;for(d=
1;d<l-1;)c.push(new THREE.Face3(o[0],o[d],o[d+1],[t[0],t[d++],t[d]],u))}if(c.length){g=0;for(h=c.length;g<h;g++){d=c[g];d.daeMaterial=a.material;b.faces.push(d);for(d=0;d<q.length;d++){o=s[q[d]];o=l>4?[o[0],o[g+1],o[g+2]]:l===4?[o[0],o[1],o[2],o[3]]:[o[0],o[1],o[2]];b.faceVertexUvs[d]||(b.faceVertexUvs[d]=[]);b.faceVertexUvs[d].push(o)}}}else console.log("dropped face with vcount "+l+" for geometry with id: "+b.id);r=r+m*l}};s.prototype.setVertices=function(a){for(var b=0;b<this.inputs.length;b++)if(this.inputs[b].source==
a.id)this.inputs[b].source=a.input.POSITION.source};s.prototype.parse=function(a){this.material=a.getAttribute("material");this.count=S(a,"count",0);for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];switch(c.nodeName){case "input":this.inputs.push((new z).parse(a.childNodes[b]));break;case "vcount":this.vcount=T(c.textContent);break;case "p":this.p.push(T(c.textContent));break;case "ph":console.warn("polygon holes not yet supported!")}}return this};v.prototype=new s;v.prototype.constructor=
v;o.prototype=new s;o.prototype.constructor=o;x.prototype.parse=function(a){this.params=[];this.source=a.getAttribute("source");this.count=S(a,"count",0);this.stride=S(a,"stride",0);for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeName=="param"){var d={};d.name=c.getAttribute("name");d.type=c.getAttribute("type");this.params.push(d)}}return this};y.prototype.parse=function(a){this.id=a.getAttribute("id");for(var b=0;b<a.childNodes.length;b++)if(a.childNodes[b].nodeName=="input"){var c=
(new z).parse(a.childNodes[b]);this.input[c.semantic]=c}return this};z.prototype.parse=function(a){this.semantic=a.getAttribute("semantic");this.source=a.getAttribute("source").replace(/^#/,"");this.set=S(a,"set",-1);this.offset=S(a,"offset",0);if(this.semantic=="TEXCOORD"&&this.set<0)this.set=0;return this};u.prototype.parse=function(a){this.id=a.getAttribute("id");for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];switch(c.nodeName){case "bool_array":for(var d=P(c.textContent),e=[],f=
0,g=d.length;f<g;f++)e.push(d[f]=="true"||d[f]=="1"?true:false);this.data=e;this.type=c.nodeName;break;case "float_array":this.data=D(c.textContent);this.type=c.nodeName;break;case "int_array":this.data=T(c.textContent);this.type=c.nodeName;break;case "IDREF_array":case "Name_array":this.data=P(c.textContent);this.type=c.nodeName;break;case "technique_common":for(d=0;d<c.childNodes.length;d++)if(c.childNodes[d].nodeName=="accessor"){this.accessor=(new x).parse(c.childNodes[d]);break}}}return this};
u.prototype.read=function(){var a=[],b=this.accessor.params[0];switch(b.type){case "IDREF":case "Name":case "name":case "float":return this.data;case "float4x4":for(b=0;b<this.data.length;b=b+16){var c=this.data.slice(b,b+16),c=fa(c);a.push(c)}break;default:console.log("ColladaLoader: Source: Read dont know how to read "+b.type+".")}return a};w.prototype.parse=function(a){this.id=a.getAttribute("id");this.name=a.getAttribute("name");for(var b=0;b<a.childNodes.length;b++)if(a.childNodes[b].nodeName==
"instance_effect"){this.instance_effect=(new A).parse(a.childNodes[b]);break}return this};E.prototype.isColor=function(){return this.texture==null};E.prototype.isTexture=function(){return this.texture!=null};E.prototype.parse=function(a){for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "color":c=D(c.textContent);this.color=new THREE.Color(0);this.color.setRGB(c[0],c[1],c[2]);this.color.a=c[3];break;case "texture":this.texture=c.getAttribute("texture");
this.texcoord=c.getAttribute("texcoord");this.texOpts={offsetU:0,offsetV:0,repeatU:1,repeatV:1,wrapU:1,wrapV:1};this.parseTexture(c)}}return this};E.prototype.parseTexture=function(a){if(!a.childNodes)return this;if(a.childNodes[1]&&a.childNodes[1].nodeName==="extra"){a=a.childNodes[1];a.childNodes[1]&&a.childNodes[1].nodeName==="technique"&&(a=a.childNodes[1])}for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];switch(c.nodeName){case "offsetU":case "offsetV":case "repeatU":case "repeatV":this.texOpts[c.nodeName]=
parseFloat(c.textContent);break;case "wrapU":case "wrapV":this.texOpts[c.nodeName]=parseInt(c.textContent);break;default:this.texOpts[c.nodeName]=c.textContent}}return this};H.prototype.parse=function(a){for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "ambient":case "emission":case "diffuse":case "specular":case "transparent":this[c.nodeName]=(new E).parse(c);break;case "shininess":case "reflectivity":case "transparency":var d;d=Q.evaluate(".//dae:float",
c,N,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);for(var e=d.iterateNext(),f=[];e;){f.push(e);e=d.iterateNext()}d=f;d.length>0&&(this[c.nodeName]=parseFloat(d[0].textContent))}}this.create();return this};H.prototype.create=function(){var a={},b=this.transparency!==void 0&&this.transparency<1,c;for(c in this)switch(c){case "ambient":case "emission":case "diffuse":case "specular":var d=this[c];if(d instanceof E)if(d.isTexture()){if(this.effect.sampler&&this.effect.surface&&this.effect.sampler.source==
this.effect.surface.sid){var e=aa[this.effect.surface.init_from];if(e){e=THREE.ImageUtils.loadTexture(oa+e.init_from);e.wrapS=d.texOpts.wrapU?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;e.wrapT=d.texOpts.wrapV?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;e.offset.x=d.texOpts.offsetU;e.offset.y=d.texOpts.offsetV;e.repeat.x=d.texOpts.repeatU;e.repeat.y=d.texOpts.repeatV;a.map=e;c=="emission"&&(a.emissive=16777215)}}}else if(c=="diffuse"||!b)c=="emission"?a.emissive=d.color.getHex():a[c]=d.color.getHex();
break;case "shininess":case "reflectivity":a[c]=this[c];break;case "transparency":if(b){a.transparent=true;a.opacity=this[c];b=true}}a.shading=pa;switch(this.type){case "constant":a.color=a.emission;this.material=new THREE.MeshBasicMaterial(a);break;case "phong":case "blinn":a.color=a.diffuse;this.material=new THREE.MeshPhongMaterial(a);break;default:a.color=a.diffuse;this.material=new THREE.MeshLambertMaterial(a)}return this.material};I.prototype.parse=function(a){for(var b=0;b<a.childNodes.length;b++){var c=
a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "init_from":this.init_from=c.textContent;break;case "format":this.format=c.textContent;break;default:console.log("unhandled Surface prop: "+c.nodeName)}}return this};J.prototype.parse=function(a){for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "source":this.source=c.textContent;break;case "minfilter":this.minfilter=c.textContent;break;case "magfilter":this.magfilter=c.textContent;break;case "mipfilter":this.mipfilter=
c.textContent;break;case "wrap_s":this.wrap_s=c.textContent;break;case "wrap_t":this.wrap_t=c.textContent;break;default:console.log("unhandled Sampler2D prop: "+c.nodeName)}}return this};C.prototype.create=function(){if(this.shader==null)return null};C.prototype.parse=function(a){this.id=a.getAttribute("id");this.name=a.getAttribute("name");this.shader=null;for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "profile_COMMON":this.parseTechnique(this.parseProfileCOMMON(c))}}return this};
C.prototype.parseNewparam=function(a){for(var b=a.getAttribute("sid"),c=0;c<a.childNodes.length;c++){var d=a.childNodes[c];if(d.nodeType==1)switch(d.nodeName){case "surface":this.surface=(new I(this)).parse(d);this.surface.sid=b;break;case "sampler2D":this.sampler=(new J(this)).parse(d);this.sampler.sid=b;break;case "extra":break;default:console.log(d.nodeName)}}};C.prototype.parseProfileCOMMON=function(a){for(var b,c=0;c<a.childNodes.length;c++){var d=a.childNodes[c];if(d.nodeType==1)switch(d.nodeName){case "profile_COMMON":this.parseProfileCOMMON(d);
break;case "technique":b=d;break;case "newparam":this.parseNewparam(d);break;case "image":d=(new g).parse(d);aa[d.id]=d;break;case "extra":break;default:console.log(d.nodeName)}}return b};C.prototype.parseTechnique=function(a){for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "constant":case "lambert":case "blinn":case "phong":this.shader=(new H(c.nodeName,this)).parse(c)}}};A.prototype.parse=function(a){this.url=a.getAttribute("url").replace(/^#/,
"");return this};B.prototype.parse=function(a){this.id=a.getAttribute("id");this.name=a.getAttribute("name");this.source={};for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "animation":var c=(new B).parse(c),d;for(d in c.source)this.source[d]=c.source[d];for(var e=0;e<c.channel.length;e++){this.channel.push(c.channel[e]);this.sampler.push(c.sampler[e])}break;case "source":d=(new u).parse(c);this.source[d.id]=d;break;case "sampler":this.sampler.push((new L(this)).parse(c));
break;case "channel":this.channel.push((new G(this)).parse(c))}}return this};G.prototype.parse=function(a){this.source=a.getAttribute("source").replace(/^#/,"");this.target=a.getAttribute("target");var b=this.target.split("/");b.shift();var a=b.shift(),c=a.indexOf(".")>=0,d=a.indexOf("(")>=0;if(c){b=a.split(".");this.sid=b.shift();this.member=b.shift()}else if(d){b=a.split("(");this.sid=b.shift();for(var e=0;e<b.length;e++)b[e]=parseInt(b[e].replace(/\)/,""));this.arrIndices=b}else this.sid=a;this.fullSid=
a;this.dotSyntax=c;this.arrSyntax=d;return this};L.prototype.parse=function(a){this.id=a.getAttribute("id");this.inputs=[];for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "input":this.inputs.push((new z).parse(c))}}return this};L.prototype.create=function(){for(var a=0;a<this.inputs.length;a++){var b=this.inputs[a],c=this.animation.source[b.source];switch(b.semantic){case "INPUT":this.input=c.read();break;case "OUTPUT":this.output=c.read();this.strideOut=
c.accessor.stride;break;case "INTERPOLATION":this.interpolation=c.read();break;case "IN_TANGENT":break;case "OUT_TANGENT":break;default:console.log(b.semantic)}}this.duration=this.endTime=this.startTime=0;if(this.input.length){this.startTime=1E8;this.endTime=-1E8;for(a=0;a<this.input.length;a++){this.startTime=Math.min(this.startTime,this.input[a]);this.endTime=Math.max(this.endTime,this.input[a])}this.duration=this.endTime-this.startTime}};L.prototype.getData=function(a,b){var c;if(a==="matrix"&&
this.strideOut===16)c=this.output[b];else if(this.strideOut>1){c=[];for(var b=b*this.strideOut,d=0;d<this.strideOut;++d)c[d]=this.output[b+d];if(this.strideOut===3)switch(a){case "rotate":case "translate":O(c,-1);break;case "scale":O(c,1)}else this.strideOut===4&&a==="matrix"&&O(c,-1)}else c=this.output[b];return c};K.prototype.addTarget=function(a,b,c,d){this.targets.push({sid:a,member:c,transform:b,data:d})};K.prototype.apply=function(a){for(var b=0;b<this.targets.length;++b){var c=this.targets[b];
(!a||c.sid===a)&&c.transform.update(c.data,c.member)}};K.prototype.getTarget=function(a){for(var b=0;b<this.targets.length;++b)if(this.targets[b].sid===a)return this.targets[b];return null};K.prototype.hasTarget=function(a){for(var b=0;b<this.targets.length;++b)if(this.targets[b].sid===a)return true;return false};K.prototype.interpolate=function(a,b){for(var c=0;c<this.targets.length;++c){var d=this.targets[c],e=a.getTarget(d.sid);if(d.transform.type!=="matrix"&&e){var f=(b-this.time)/(a.time-this.time),
g=e.data,h=d.data;if(f<0||f>1){console.log("Key.interpolate: Warning! Scale out of bounds:"+f);f=f<0?0:1}if(h.length)for(var e=[],i=0;i<h.length;++i)e[i]=h[i]+(g[i]-h[i])*f;else e=h+(g-h)*f}else e=d.data;d.transform.update(e,d.member)}};F.prototype.parse=function(a){this.id=a.getAttribute("id");this.name=a.getAttribute("name");for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeType==1)switch(c.nodeName){case "optics":this.parseOptics(c)}}return this};F.prototype.parseOptics=function(a){for(var b=
0;b<a.childNodes.length;b++)if(a.childNodes[b].nodeName=="technique_common")for(var c=a.childNodes[b],d=0;d<c.childNodes.length;d++){this.technique=c.childNodes[d].nodeName;if(this.technique=="perspective")for(var e=c.childNodes[d],f=0;f<e.childNodes.length;f++){var g=e.childNodes[f];switch(g.nodeName){case "yfov":this.yfov=g.textContent;break;case "xfov":this.xfov=g.textContent;break;case "znear":this.znear=g.textContent;break;case "zfar":this.zfar=g.textContent;break;case "aspect_ratio":this.aspect_ratio=
g.textContent}}else if(this.technique=="orthographic"){e=c.childNodes[d];for(f=0;f<e.childNodes.length;f++){g=e.childNodes[f];switch(g.nodeName){case "xmag":this.xmag=g.textContent;break;case "ymag":this.ymag=g.textContent;break;case "znear":this.znear=g.textContent;break;case "zfar":this.zfar=g.textContent;break;case "aspect_ratio":this.aspect_ratio=g.textContent}}}}return this};M.prototype.parse=function(a){this.url=a.getAttribute("url").replace(/^#/,"");return this};return{load:function(b,c,d){var e=
0;if(document.implementation&&document.implementation.createDocument){var f=new XMLHttpRequest;f.overrideMimeType&&f.overrideMimeType("text/xml");f.onreadystatechange=function(){if(f.readyState==4){if(f.status==0||f.status==200)if(f.responseXML){na=c;a(f.responseXML,void 0,b)}else console.error("ColladaLoader: Empty or non-existing file ("+b+")")}else if(f.readyState==3&&d){e==0&&(e=f.getResponseHeader("Content-Length"));d({total:e,loaded:f.responseText.length})}};f.open("GET",b,true);f.send(null)}else alert("Don't know how to parse XML!")},
parse:a,setPreferredShading:function(a){pa=a},applySkin:f,geometries:W,options:R}};THREE.JSONLoader=function(a){THREE.Loader.call(this,a)};THREE.JSONLoader.prototype=new THREE.Loader;THREE.JSONLoader.prototype.constructor=THREE.JSONLoader;THREE.JSONLoader.prototype.supr=THREE.Loader.prototype;THREE.JSONLoader.prototype.load=function(a,b,c){c=c?c:this.extractUrlBase(a);this.onLoadStart();this.loadAjaxJSON(this,a,b,c)};
THREE.JSONLoader.prototype.loadAjaxJSON=function(a,b,c,d,f){var e=new XMLHttpRequest,g=0;e.onreadystatechange=function(){if(e.readyState===e.DONE)if(e.status===200||e.status===0){if(e.responseText){var h=JSON.parse(e.responseText);a.createModel(h,c,d)}else console.warn("THREE.JSONLoader: ["+b+"] seems to be unreachable or file there is empty");a.onLoadComplete()}else console.error("THREE.JSONLoader: Couldn't load ["+b+"] ["+e.status+"]");else if(e.readyState===e.LOADING){if(f){g===0&&(g=e.getResponseHeader("Content-Length"));
f({total:g,loaded:e.responseText.length})}}else e.readyState===e.HEADERS_RECEIVED&&(g=e.getResponseHeader("Content-Length"))};e.open("GET",b,true);e.overrideMimeType&&e.overrideMimeType("text/plain; charset=x-user-defined");e.setRequestHeader("Content-Type","text/plain");e.send(null)};
THREE.JSONLoader.prototype.createModel=function(a,b,c){var d=new THREE.Geometry,f=a.scale!==void 0?1/a.scale:1;this.initMaterials(d,a.materials,c);(function(b){var c,f,i,j,k,q,l,n,r,m,p,t,s,v,o=a.faces;q=a.vertices;var x=a.normals,y=a.colors,z=0;for(c=0;c<a.uvs.length;c++)a.uvs[c].length&&z++;for(c=0;c<z;c++){d.faceUvs[c]=[];d.faceVertexUvs[c]=[]}j=0;for(k=q.length;j<k;){l=new THREE.Vertex;l.x=q[j++]*b;l.y=q[j++]*b;l.z=q[j++]*b;d.vertices.push(l)}j=0;for(k=o.length;j<k;){b=o[j++];q=b&1;i=b&2;c=b&
4;f=b&8;n=b&16;l=b&32;m=b&64;b=b&128;if(q){p=new THREE.Face4;p.a=o[j++];p.b=o[j++];p.c=o[j++];p.d=o[j++];q=4}else{p=new THREE.Face3;p.a=o[j++];p.b=o[j++];p.c=o[j++];q=3}if(i){i=o[j++];p.materialIndex=i}i=d.faces.length;if(c)for(c=0;c<z;c++){t=a.uvs[c];r=o[j++];v=t[r*2];r=t[r*2+1];d.faceUvs[c][i]=new THREE.UV(v,r)}if(f)for(c=0;c<z;c++){t=a.uvs[c];s=[];for(f=0;f<q;f++){r=o[j++];v=t[r*2];r=t[r*2+1];s[f]=new THREE.UV(v,r)}d.faceVertexUvs[c][i]=s}if(n){n=o[j++]*3;f=new THREE.Vector3;f.x=x[n++];f.y=x[n++];
f.z=x[n];p.normal=f}if(l)for(c=0;c<q;c++){n=o[j++]*3;f=new THREE.Vector3;f.x=x[n++];f.y=x[n++];f.z=x[n];p.vertexNormals.push(f)}if(m){l=o[j++];l=new THREE.Color(y[l]);p.color=l}if(b)for(c=0;c<q;c++){l=o[j++];l=new THREE.Color(y[l]);p.vertexColors.push(l)}d.faces.push(p)}})(f);(function(){var b,c,f,i;if(a.skinWeights){b=0;for(c=a.skinWeights.length;b<c;b=b+2){f=a.skinWeights[b];i=a.skinWeights[b+1];d.skinWeights.push(new THREE.Vector4(f,i,0,0))}}if(a.skinIndices){b=0;for(c=a.skinIndices.length;b<c;b=
b+2){f=a.skinIndices[b];i=a.skinIndices[b+1];d.skinIndices.push(new THREE.Vector4(f,i,0,0))}}d.bones=a.bones;d.animation=a.animation})();(function(b){if(a.morphTargets!==void 0){var c,f,i,j,k,q,l,n,r;c=0;for(f=a.morphTargets.length;c<f;c++){d.morphTargets[c]={};d.morphTargets[c].name=a.morphTargets[c].name;d.morphTargets[c].vertices=[];n=d.morphTargets[c].vertices;r=a.morphTargets[c].vertices;i=0;for(j=r.length;i<j;i=i+3){k=r[i]*b;q=r[i+1]*b;l=r[i+2]*b;n.push(new THREE.Vertex(k,q,l))}}}if(a.morphColors!==
void 0){c=0;for(f=a.morphColors.length;c<f;c++){d.morphColors[c]={};d.morphColors[c].name=a.morphColors[c].name;d.morphColors[c].colors=[];j=d.morphColors[c].colors;k=a.morphColors[c].colors;b=0;for(i=k.length;b<i;b=b+3){q=new THREE.Color(16755200);q.setRGB(k[b],k[b+1],k[b+2]);j.push(q)}}}})(f);d.computeCentroids();d.computeFaceNormals();this.hasNormals(d)&&d.computeTangents();b(d)};
THREE.SceneLoader=function(){this.onLoadStart=function(){};this.onLoadProgress=function(){};this.onLoadComplete=function(){};this.callbackSync=function(){};this.callbackProgress=function(){}};THREE.SceneLoader.prototype.constructor=THREE.SceneLoader;
THREE.SceneLoader.prototype.load=function(a,b){var c=this,d=new XMLHttpRequest;d.onreadystatechange=function(){if(d.readyState==4)if(d.status==200||d.status==0){var f=JSON.parse(d.responseText);c.createScene(f,b,a)}else console.error("THREE.SceneLoader: Couldn't load ["+a+"] ["+d.status+"]")};d.open("GET",a,true);d.overrideMimeType&&d.overrideMimeType("text/plain; charset=x-user-defined");d.setRequestHeader("Content-Type","text/plain");d.send(null)};
THREE.SceneLoader.prototype.createScene=function(a,b,c){function d(a,b){return b=="relativeToHTML"?a:j+"/"+a}function f(){var a;for(l in C.objects)if(!F.objects[l]){t=C.objects[l];if(t.geometry!==void 0){if(E=F.geometries[t.geometry]){a=false;H=F.materials[t.materials[0]];(a=H instanceof THREE.ShaderMaterial)&&E.computeTangents();o=t.position;x=t.rotation;y=t.quaternion;z=t.scale;y=0;t.materials.length==0&&(H=new THREE.MeshFaceMaterial);t.materials.length>1&&(H=new THREE.MeshFaceMaterial);a=new THREE.Mesh(E,
H);a.name=l;a.position.set(o[0],o[1],o[2]);if(y){a.quaternion.set(y[0],y[1],y[2],y[3]);a.useQuaternion=true}else a.rotation.set(x[0],x[1],x[2]);a.scale.set(z[0],z[1],z[2]);a.visible=t.visible;a.doubleSided=t.doubleSided;a.castShadow=t.castShadow;a.receiveShadow=t.receiveShadow;F.scene.add(a);F.objects[l]=a}}else{o=t.position;x=t.rotation;y=t.quaternion;z=t.scale;y=0;a=new THREE.Object3D;a.name=l;a.position.set(o[0],o[1],o[2]);if(y){a.quaternion.set(y[0],y[1],y[2],y[3]);a.useQuaternion=true}else a.rotation.set(x[0],
x[1],x[2]);a.scale.set(z[0],z[1],z[2]);a.visible=t.visible!==void 0?t.visible:false;F.scene.add(a);F.objects[l]=a;F.empties[l]=a}}}function e(a){return function(b){F.geometries[a]=b;f();B=B-1;i.onLoadComplete();h()}}function g(a){return function(b){F.geometries[a]=b}}function h(){i.callbackProgress({totalModels:L,totalTextures:K,loadedModels:L-B,loadedTextures:K-G},F);i.onLoadProgress();B==0&&G==0&&b(F)}var i=this,j=THREE.Loader.prototype.extractUrlBase(c),k,q,l,n,r,m,p,t,s,v,o,x,y,z,u,w,E,H,I,J,
C,A,B,G,L,K,F;C=a;c=new THREE.BinaryLoader;A=new THREE.JSONLoader;G=B=0;F={scene:new THREE.Scene,geometries:{},materials:{},textures:{},objects:{},cameras:{},lights:{},fogs:{},empties:{}};if(C.transform){a=C.transform.position;s=C.transform.rotation;u=C.transform.scale;a&&F.scene.position.set(a[0],a[1],a[2]);s&&F.scene.rotation.set(s[0],s[1],s[2]);u&&F.scene.scale.set(u[0],u[1],u[2]);if(a||s||u){F.scene.updateMatrix();F.scene.updateMatrixWorld()}}a=function(){G=G-1;h();i.onLoadComplete()};for(r in C.cameras){u=
C.cameras[r];u.type=="perspective"?I=new THREE.PerspectiveCamera(u.fov,u.aspect,u.near,u.far):u.type=="ortho"&&(I=new THREE.OrthographicCamera(u.left,u.right,u.top,u.bottom,u.near,u.far));o=u.position;s=u.target;u=u.up;I.position.set(o[0],o[1],o[2]);I.target=new THREE.Vector3(s[0],s[1],s[2]);u&&I.up.set(u[0],u[1],u[2]);F.cameras[r]=I}for(n in C.lights){s=C.lights[n];r=s.color!==void 0?s.color:16777215;I=s.intensity!==void 0?s.intensity:1;if(s.type=="directional"){o=s.direction;v=new THREE.DirectionalLight(r,
I);v.position.set(o[0],o[1],o[2]);v.position.normalize()}else if(s.type=="point"){o=s.position;v=s.distance;v=new THREE.PointLight(r,I,v);v.position.set(o[0],o[1],o[2])}else s.type=="ambient"&&(v=new THREE.AmbientLight(r));F.scene.add(v);F.lights[n]=v}for(m in C.fogs){n=C.fogs[m];n.type=="linear"?J=new THREE.Fog(0,n.near,n.far):n.type=="exp2"&&(J=new THREE.FogExp2(0,n.density));u=n.color;J.color.setRGB(u[0],u[1],u[2]);F.fogs[m]=J}if(F.cameras&&C.defaults.camera)F.currentCamera=F.cameras[C.defaults.camera];
if(F.fogs&&C.defaults.fog)F.scene.fog=F.fogs[C.defaults.fog];u=C.defaults.bgcolor;F.bgColor=new THREE.Color;F.bgColor.setRGB(u[0],u[1],u[2]);F.bgColorAlpha=C.defaults.bgalpha;for(k in C.geometries){m=C.geometries[k];if(m.type=="bin_mesh"||m.type=="ascii_mesh"){B=B+1;i.onLoadStart()}}L=B;for(k in C.geometries){m=C.geometries[k];if(m.type=="cube"){E=new THREE.CubeGeometry(m.width,m.height,m.depth,m.segmentsWidth,m.segmentsHeight,m.segmentsDepth,null,m.flipped,m.sides);F.geometries[k]=E}else if(m.type==
"plane"){E=new THREE.PlaneGeometry(m.width,m.height,m.segmentsWidth,m.segmentsHeight);F.geometries[k]=E}else if(m.type=="sphere"){E=new THREE.SphereGeometry(m.radius,m.segmentsWidth,m.segmentsHeight);F.geometries[k]=E}else if(m.type=="cylinder"){E=new THREE.CylinderGeometry(m.topRad,m.botRad,m.height,m.radSegs,m.heightSegs);F.geometries[k]=E}else if(m.type=="torus"){E=new THREE.TorusGeometry(m.radius,m.tube,m.segmentsR,m.segmentsT);F.geometries[k]=E}else if(m.type=="icosahedron"){E=new THREE.IcosahedronGeometry(m.radius,
m.subdivisions);F.geometries[k]=E}else if(m.type=="bin_mesh")c.load(d(m.url,C.urlBaseType),e(k));else if(m.type=="ascii_mesh")A.load(d(m.url,C.urlBaseType),e(k));else if(m.type=="embedded_mesh"){m=C.embeds[m.id];m.metadata=C.metadata;m&&A.createModel(m,g(k),"")}}for(p in C.textures){k=C.textures[p];if(k.url instanceof Array){G=G+k.url.length;for(m=0;m<k.url.length;m++)i.onLoadStart()}else{G=G+1;i.onLoadStart()}}K=G;for(p in C.textures){k=C.textures[p];if(k.mapping!=void 0&&THREE[k.mapping]!=void 0)k.mapping=
new THREE[k.mapping];if(k.url instanceof Array){m=[];for(J=0;J<k.url.length;J++)m[J]=d(k.url[J],C.urlBaseType);m=THREE.ImageUtils.loadTextureCube(m,k.mapping,a)}else{m=THREE.ImageUtils.loadTexture(d(k.url,C.urlBaseType),k.mapping,a);if(THREE[k.minFilter]!=void 0)m.minFilter=THREE[k.minFilter];if(THREE[k.magFilter]!=void 0)m.magFilter=THREE[k.magFilter];if(k.repeat){m.repeat.set(k.repeat[0],k.repeat[1]);if(k.repeat[0]!=1)m.wrapS=THREE.RepeatWrapping;if(k.repeat[1]!=1)m.wrapT=THREE.RepeatWrapping}k.offset&&
m.offset.set(k.offset[0],k.offset[1]);if(k.wrap){J={repeat:THREE.RepeatWrapping,mirror:THREE.MirroredRepeatWrapping};if(J[k.wrap[0]]!==void 0)m.wrapS=J[k.wrap[0]];if(J[k.wrap[1]]!==void 0)m.wrapT=J[k.wrap[1]]}}F.textures[p]=m}for(q in C.materials){p=C.materials[q];for(w in p.parameters)if(w=="envMap"||w=="map"||w=="lightMap")p.parameters[w]=F.textures[p.parameters[w]];else if(w=="shading")p.parameters[w]=p.parameters[w]=="flat"?THREE.FlatShading:THREE.SmoothShading;else if(w=="blending")p.parameters[w]=
THREE[p.parameters[w]]?THREE[p.parameters[w]]:THREE.NormalBlending;else if(w=="combine")p.parameters[w]=p.parameters[w]=="MixOperation"?THREE.MixOperation:THREE.MultiplyOperation;else if(w=="vertexColors")if(p.parameters[w]=="face")p.parameters[w]=THREE.FaceColors;else if(p.parameters[w])p.parameters[w]=THREE.VertexColors;if(p.parameters.opacity!==void 0&&p.parameters.opacity<1)p.parameters.transparent=true;if(p.parameters.normalMap){a=THREE.ShaderUtils.lib.normal;k=THREE.UniformsUtils.clone(a.uniforms);
m=p.parameters.color;J=p.parameters.specular;c=p.parameters.ambient;A=p.parameters.shininess;k.tNormal.texture=F.textures[p.parameters.normalMap];if(p.parameters.normalMapFactor)k.uNormalScale.value=p.parameters.normalMapFactor;if(p.parameters.map){k.tDiffuse.texture=p.parameters.map;k.enableDiffuse.value=true}if(p.parameters.lightMap){k.tAO.texture=p.parameters.lightMap;k.enableAO.value=true}if(p.parameters.specularMap){k.tSpecular.texture=F.textures[p.parameters.specularMap];k.enableSpecular.value=
true}k.uDiffuseColor.value.setHex(m);k.uSpecularColor.value.setHex(J);k.uAmbientColor.value.setHex(c);k.uShininess.value=A;if(p.parameters.opacity)k.uOpacity.value=p.parameters.opacity;H=new THREE.ShaderMaterial({fragmentShader:a.fragmentShader,vertexShader:a.vertexShader,uniforms:k,lights:true,fog:true})}else H=new THREE[p.type](p.parameters);F.materials[q]=H}f();i.callbackSync(F);h()};THREE.UTF8Loader=function(){};
THREE.UTF8Loader.prototype.load=function(a,b,c){var d=new XMLHttpRequest,f=c.scale!==void 0?c.scale:1,e=c.offsetX!==void 0?c.offsetX:0,g=c.offsetY!==void 0?c.offsetY:0,h=c.offsetZ!==void 0?c.offsetZ:0;d.onreadystatechange=function(){d.readyState==4?d.status==200||d.status==0?THREE.UTF8Loader.prototype.createModel(d.responseText,b,f,e,g,h):console.error("THREE.UTF8Loader: Couldn't load ["+a+"] ["+d.status+"]"):d.readyState!=3&&d.readyState==2&&d.getResponseHeader("Content-Length")};d.open("GET",a,
true);d.send(null)};THREE.UTF8Loader.prototype.decompressMesh=function(a){var b=a.charCodeAt(0);b>=57344&&(b=b-2048);b++;for(var c=new Float32Array(8*b),d=1,f=0;f<8;f++){for(var e=0,g=0;g<b;++g){var h=a.charCodeAt(g+d),e=e+(h>>1^-(h&1));c[8*g+f]=e}d=d+b}b=a.length-d;e=new Uint16Array(b);for(f=g=0;f<b;f++){h=a.charCodeAt(f+d);e[f]=g-h;h==0&&g++}return[c,e]};
THREE.UTF8Loader.prototype.createModel=function(a,b,c,d,f,e){var g=function(){var b=this;b.materials=[];THREE.Geometry.call(this);var g=THREE.UTF8Loader.prototype.decompressMesh(a),j=[],k=[];(function(a,g,i){for(var j,k,p,t=a.length;i<t;i=i+g){j=a[i];k=a[i+1];p=a[i+2];j=j/16383*c;k=k/16383*c;p=p/16383*c;j=j+d;k=k+f;p=p+e;b.vertices.push(new THREE.Vertex(j,k,p))}})(g[0],8,0);(function(a,b,c){for(var d,e,f=a.length;c<f;c=c+b){d=a[c];e=a[c+1];d=d/1023;e=e/1023;k.push(d,1-e)}})(g[0],8,3);(function(a,
b,c){for(var d,e,f,g=a.length;c<g;c=c+b){d=a[c];e=a[c+1];f=a[c+2];d=(d-512)/511;e=(e-512)/511;f=(f-512)/511;j.push(d,e,f)}})(g[0],8,5);(function(a){var c,d,e,f,g,i,s,v,o,x=a.length;for(c=0;c<x;c=c+3){d=a[c];e=a[c+1];f=a[c+2];g=b;v=d;o=e;i=f;var y=j[e*3],z=j[e*3+1],u=j[e*3+2],w=j[f*3],E=j[f*3+1],H=j[f*3+2];s=new THREE.Vector3(j[d*3],j[d*3+1],j[d*3+2]);y=new THREE.Vector3(y,z,u);w=new THREE.Vector3(w,E,H);g.faces.push(new THREE.Face3(v,o,i,[s,y,w],null,0));g=k[d*2];d=k[d*2+1];i=k[e*2];s=k[e*2+1];v=
k[f*2];o=k[f*2+1];f=b.faceVertexUvs[0];e=i;i=s;s=[];s.push(new THREE.UV(g,d));s.push(new THREE.UV(e,i));s.push(new THREE.UV(v,o));f.push(s)}})(g[1]);this.computeCentroids();this.computeFaceNormals()};g.prototype=new THREE.Geometry;g.prototype.constructor=g;b(new g)};THREE.ImmediateRenderObject=function(){THREE.Object3D.call(this);this.render=function(){}};THREE.ImmediateRenderObject.prototype=new THREE.Object3D;THREE.ImmediateRenderObject.prototype.constructor=THREE.ImmediateRenderObject;
THREE.LensFlare=function(a,b,c,d,f){THREE.Object3D.call(this);this.lensFlares=[];this.positionScreen=new THREE.Vector3;this.customUpdateCallback=void 0;a!==void 0&&this.add(a,b,c,d,f)};THREE.LensFlare.prototype=new THREE.Object3D;THREE.LensFlare.prototype.constructor=THREE.LensFlare;THREE.LensFlare.prototype.supr=THREE.Object3D.prototype;
THREE.LensFlare.prototype.add=function(a,b,c,d,f,e){b===void 0&&(b=-1);c===void 0&&(c=0);e===void 0&&(e=1);f===void 0&&(f=new THREE.Color(16777215));if(d===void 0)d=THREE.NormalBlending;c=Math.min(c,Math.max(0,c));this.lensFlares.push({texture:a,size:b,distance:c,x:0,y:0,z:0,scale:1,rotation:1,opacity:e,color:f,blending:d})};
THREE.LensFlare.prototype.updateLensFlares=function(){var a,b=this.lensFlares.length,c,d=-this.positionScreen.x*2,f=-this.positionScreen.y*2;for(a=0;a<b;a++){c=this.lensFlares[a];c.x=this.positionScreen.x+d*c.distance;c.y=this.positionScreen.y+f*c.distance;c.wantedRotation=c.x*Math.PI*0.25;c.rotation=c.rotation+(c.wantedRotation-c.rotation)*0.25}};
THREE.MorphBlendMesh=function(a,b){THREE.Mesh.call(this,a,b);this.animationsMap={};this.animationsList=[];var c=this.geometry.morphTargets.length;this.createAnimation("__default",0,c-1,c/1);this.setAnimationWeight("__default",1)};THREE.MorphBlendMesh.prototype=new THREE.Mesh;THREE.MorphBlendMesh.prototype.constructor=THREE.MorphBlendMesh;
THREE.MorphBlendMesh.prototype.createAnimation=function(a,b,c,d){b={startFrame:b,endFrame:c,length:c-b+1,fps:d,duration:(c-b)/d,lastFrame:0,currentFrame:0,active:false,time:0,direction:1,weight:1,directionBackwards:false,mirroredLoop:false};this.animationsMap[a]=b;this.animationsList.push(b)};
THREE.MorphBlendMesh.prototype.autoCreateAnimations=function(a){for(var b=/([a-z]+)(\d+)/,c,d={},f=this.geometry,e=0,g=f.morphTargets.length;e<g;e++){var h=f.morphTargets[e].name.match(b);if(h&&h.length>1){var i=h[1];d[i]||(d[i]={start:Infinity,end:-Infinity});h=d[i];if(e<h.start)h.start=e;if(e>h.end)h.end=e;c||(c=i)}}for(i in d){h=d[i];this.createAnimation(i,h.start,h.end,a)}this.firstAnimation=c};
THREE.MorphBlendMesh.prototype.setAnimationDirectionForward=function(a){if(a=this.animationsMap[a]){a.direction=1;a.directionBackwards=false}};THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward=function(a){if(a=this.animationsMap[a]){a.direction=-1;a.directionBackwards=true}};THREE.MorphBlendMesh.prototype.setAnimationFPS=function(a,b){var c=this.animationsMap[a];if(c){c.fps=b;c.duration=(c.end-c.start)/c.fps}};
THREE.MorphBlendMesh.prototype.setAnimationDuration=function(a,b){var c=this.animationsMap[a];if(c){c.duration=b;c.fps=(c.end-c.start)/c.duration}};THREE.MorphBlendMesh.prototype.setAnimationWeight=function(a,b){var c=this.animationsMap[a];if(c)c.weight=b};THREE.MorphBlendMesh.prototype.setAnimationTime=function(a,b){var c=this.animationsMap[a];if(c)c.time=b};THREE.MorphBlendMesh.prototype.getAnimationTime=function(a){var b=0;if(a=this.animationsMap[a])b=a.time;return b};
THREE.MorphBlendMesh.prototype.getAnimationDuration=function(a){var b=-1;if(a=this.animationsMap[a])b=a.duration;return b};THREE.MorphBlendMesh.prototype.playAnimation=function(a){var b=this.animationsMap[a];if(b){b.time=0;b.active=true}else console.warn("animation["+a+"] undefined")};THREE.MorphBlendMesh.prototype.stopAnimation=function(a){if(a=this.animationsMap[a])a.active=false};
THREE.MorphBlendMesh.prototype.update=function(a){for(var b=0,c=this.animationsList.length;b<c;b++){var d=this.animationsList[b];if(d.active){var f=d.duration/d.length;d.time=d.time+d.direction*a;if(d.mirroredLoop){if(d.time>d.duration||d.time<0){d.direction=d.direction*-1;if(d.time>d.duration){d.time=d.duration;d.directionBackwards=true}if(d.time<0){d.time=0;d.directionBackwards=false}}}else{d.time=d.time%d.duration;if(d.time<0)d.time=d.time+d.duration}var e=d.startFrame+THREE.Math.clamp(Math.floor(d.time/
f),0,d.length-1),g=d.weight;if(e!==d.currentFrame){this.morphTargetInfluences[d.lastFrame]=0;this.morphTargetInfluences[d.currentFrame]=1*g;this.morphTargetInfluences[e]=0;d.lastFrame=d.currentFrame;d.currentFrame=e}f=d.time%f/f;d.directionBackwards&&(f=1-f);this.morphTargetInfluences[d.currentFrame]=f*g;this.morphTargetInfluences[d.lastFrame]=(1-f)*g}}};
THREE.LensFlarePlugin=function(){function a(a){var c=b.createProgram(),d=b.createShader(b.FRAGMENT_SHADER),e=b.createShader(b.VERTEX_SHADER);b.shaderSource(d,a.fragmentShader);b.shaderSource(e,a.vertexShader);b.compileShader(d);b.compileShader(e);b.attachShader(c,d);b.attachShader(c,e);b.linkProgram(c);return c}var b,c,d,f,e,g,h,i,j,k,q,l,n;this.init=function(r){b=r.context;c=r;d=new Float32Array(16);f=new Uint16Array(6);r=0;d[r++]=-1;d[r++]=-1;d[r++]=0;d[r++]=0;d[r++]=1;d[r++]=-1;d[r++]=1;d[r++]=
0;d[r++]=1;d[r++]=1;d[r++]=1;d[r++]=1;d[r++]=-1;d[r++]=1;d[r++]=0;d[r++]=1;r=0;f[r++]=0;f[r++]=1;f[r++]=2;f[r++]=0;f[r++]=2;f[r++]=3;e=b.createBuffer();g=b.createBuffer();b.bindBuffer(b.ARRAY_BUFFER,e);b.bufferData(b.ARRAY_BUFFER,d,b.STATIC_DRAW);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,g);b.bufferData(b.ELEMENT_ARRAY_BUFFER,f,b.STATIC_DRAW);h=b.createTexture();i=b.createTexture();b.bindTexture(b.TEXTURE_2D,h);b.texImage2D(b.TEXTURE_2D,0,b.RGB,16,16,0,b.RGB,b.UNSIGNED_BYTE,null);b.texParameteri(b.TEXTURE_2D,
b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);b.bindTexture(b.TEXTURE_2D,i);b.texImage2D(b.TEXTURE_2D,0,b.RGBA,16,16,0,b.RGBA,b.UNSIGNED_BYTE,null);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST);
b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST);if(b.getParameter(b.MAX_VERTEX_TEXTURE_IMAGE_UNITS)<=0){j=false;k=a(THREE.ShaderFlares.lensFlare)}else{j=true;k=a(THREE.ShaderFlares.lensFlareVertexTexture)}q={};l={};q.vertex=b.getAttribLocation(k,"position");q.uv=b.getAttribLocation(k,"uv");l.renderType=b.getUniformLocation(k,"renderType");l.map=b.getUniformLocation(k,"map");l.occlusionMap=b.getUniformLocation(k,"occlusionMap");l.opacity=b.getUniformLocation(k,"opacity");l.color=b.getUniformLocation(k,
"color");l.scale=b.getUniformLocation(k,"scale");l.rotation=b.getUniformLocation(k,"rotation");l.screenPosition=b.getUniformLocation(k,"screenPosition");n=false};this.render=function(a,d,f,t){var a=a.__webglFlares,s=a.length;if(s){var v=new THREE.Vector3,o=t/f,x=f*0.5,y=t*0.5,z=16/t,u=new THREE.Vector2(z*o,z),w=new THREE.Vector3(1,1,0),E=new THREE.Vector2(1,1),H=l,z=q;b.useProgram(k);if(!n){b.enableVertexAttribArray(q.vertex);b.enableVertexAttribArray(q.uv);n=true}b.uniform1i(H.occlusionMap,0);b.uniform1i(H.map,
1);b.bindBuffer(b.ARRAY_BUFFER,e);b.vertexAttribPointer(z.vertex,2,b.FLOAT,false,16,0);b.vertexAttribPointer(z.uv,2,b.FLOAT,false,16,8);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,g);b.disable(b.CULL_FACE);b.depthMask(false);var I,J,C,A,B;for(I=0;I<s;I++){z=16/t;u.set(z*o,z);A=a[I];v.set(A.matrixWorld.n14,A.matrixWorld.n24,A.matrixWorld.n34);d.matrixWorldInverse.multiplyVector3(v);d.projectionMatrix.multiplyVector3(v);w.copy(v);E.x=w.x*x+x;E.y=w.y*y+y;if(j||E.x>0&&E.x<f&&E.y>0&&E.y<t){b.activeTexture(b.TEXTURE1);
b.bindTexture(b.TEXTURE_2D,h);b.copyTexImage2D(b.TEXTURE_2D,0,b.RGB,E.x-8,E.y-8,16,16,0);b.uniform1i(H.renderType,0);b.uniform2f(H.scale,u.x,u.y);b.uniform3f(H.screenPosition,w.x,w.y,w.z);b.disable(b.BLEND);b.enable(b.DEPTH_TEST);b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0);b.activeTexture(b.TEXTURE0);b.bindTexture(b.TEXTURE_2D,i);b.copyTexImage2D(b.TEXTURE_2D,0,b.RGBA,E.x-8,E.y-8,16,16,0);b.uniform1i(H.renderType,1);b.disable(b.DEPTH_TEST);b.activeTexture(b.TEXTURE1);b.bindTexture(b.TEXTURE_2D,
h);b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0);A.positionScreen.copy(w);A.customUpdateCallback?A.customUpdateCallback(A):A.updateLensFlares();b.uniform1i(H.renderType,2);b.enable(b.BLEND);J=0;for(C=A.lensFlares.length;J<C;J++){B=A.lensFlares[J];if(B.opacity>0.001&&B.scale>0.001){w.x=B.x;w.y=B.y;w.z=B.z;z=B.size*B.scale/t;u.x=z*o;u.y=z;b.uniform3f(H.screenPosition,w.x,w.y,w.z);b.uniform2f(H.scale,u.x,u.y);b.uniform1f(H.rotation,B.rotation);b.uniform1f(H.opacity,B.opacity);b.uniform3f(H.color,
B.color.r,B.color.g,B.color.b);c.setBlending(B.blending,B.blendEquation,B.blendSrc,B.blendDst);c.setTexture(B.texture,1);b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0)}}}}b.enable(b.CULL_FACE);b.enable(b.DEPTH_TEST);b.depthMask(true)}}};
THREE.ShadowMapPlugin=function(){var a,b,c,d,f=new THREE.Frustum,e=new THREE.Matrix4,g=new THREE.Vector3,h=new THREE.Vector3;this.init=function(e){a=e.context;b=e;var e=THREE.ShaderLib.depthRGBA,f=THREE.UniformsUtils.clone(e.uniforms);c=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f});d=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f,morphTargets:true});c._shadowPass=true;d._shadowPass=true};this.render=
function(a,c){b.shadowMapEnabled&&b.shadowMapAutoUpdate&&this.update(a,c)};this.update=function(i,j){var k,q,l,n,r,m,p,t,s,v=[];n=0;a.clearColor(1,1,1,1);a.disable(a.BLEND);b.shadowMapCullFrontFaces&&a.cullFace(a.FRONT);b.setDepthTest(true);k=0;for(q=i.__lights.length;k<q;k++){l=i.__lights[k];if(l.castShadow)if(l instanceof THREE.DirectionalLight&&l.shadowCascade)for(r=0;r<l.shadowCascadeCount;r++){var o;if(l.shadowCascadeArray[r])o=l.shadowCascadeArray[r];else{s=l;p=r;o=new THREE.DirectionalLight;
o.isVirtual=true;o.onlyShadow=true;o.castShadow=true;o.shadowCameraNear=s.shadowCameraNear;o.shadowCameraFar=s.shadowCameraFar;o.shadowCameraLeft=s.shadowCameraLeft;o.shadowCameraRight=s.shadowCameraRight;o.shadowCameraBottom=s.shadowCameraBottom;o.shadowCameraTop=s.shadowCameraTop;o.shadowCameraVisible=s.shadowCameraVisible;o.shadowDarkness=s.shadowDarkness;o.shadowBias=s.shadowCascadeBias[p];o.shadowMapWidth=s.shadowCascadeWidth[p];o.shadowMapHeight=s.shadowCascadeHeight[p];o.pointsWorld=[];o.pointsFrustum=
[];t=o.pointsWorld;m=o.pointsFrustum;for(var x=0;x<8;x++){t[x]=new THREE.Vector3;m[x]=new THREE.Vector3}t=s.shadowCascadeNearZ[p];s=s.shadowCascadeFarZ[p];m[0].set(-1,-1,t);m[1].set(1,-1,t);m[2].set(-1,1,t);m[3].set(1,1,t);m[4].set(-1,-1,s);m[5].set(1,-1,s);m[6].set(-1,1,s);m[7].set(1,1,s);o.originalCamera=j;m=new THREE.Gyroscope;m.position=l.shadowCascadeOffset;m.add(o);m.add(o.target);j.add(m);l.shadowCascadeArray[r]=o;console.log("Created virtualLight",o)}p=l;t=r;s=p.shadowCascadeArray[t];s.position.copy(p.position);
s.target.position.copy(p.target.position);s.lookAt(s.target);s.shadowCameraVisible=p.shadowCameraVisible;s.shadowDarkness=p.shadowDarkness;s.shadowBias=p.shadowCascadeBias[t];m=p.shadowCascadeNearZ[t];p=p.shadowCascadeFarZ[t];s=s.pointsFrustum;s[0].z=m;s[1].z=m;s[2].z=m;s[3].z=m;s[4].z=p;s[5].z=p;s[6].z=p;s[7].z=p;v[n]=o;n++}else{v[n]=l;n++}}k=0;for(q=v.length;k<q;k++){l=v[k];if(!l.shadowMap){l.shadowMap=new THREE.WebGLRenderTarget(l.shadowMapWidth,l.shadowMapHeight,{minFilter:THREE.LinearFilter,
magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});l.shadowMapSize=new THREE.Vector2(l.shadowMapWidth,l.shadowMapHeight);l.shadowMatrix=new THREE.Matrix4}if(!l.shadowCamera){if(l instanceof THREE.SpotLight)l.shadowCamera=new THREE.PerspectiveCamera(l.shadowCameraFov,l.shadowMapWidth/l.shadowMapHeight,l.shadowCameraNear,l.shadowCameraFar);else if(l instanceof THREE.DirectionalLight)l.shadowCamera=new THREE.OrthographicCamera(l.shadowCameraLeft,l.shadowCameraRight,l.shadowCameraTop,l.shadowCameraBottom,
l.shadowCameraNear,l.shadowCameraFar);else{console.error("Unsupported light type for shadow");continue}i.add(l.shadowCamera);b.autoUpdateScene&&i.updateMatrixWorld()}if(l.shadowCameraVisible&&!l.cameraHelper){l.cameraHelper=new THREE.CameraHelper(l.shadowCamera);l.shadowCamera.add(l.cameraHelper)}if(l.isVirtual&&o.originalCamera==j){r=j;n=l.shadowCamera;m=l.pointsFrustum;s=l.pointsWorld;g.set(Infinity,Infinity,Infinity);h.set(-Infinity,-Infinity,-Infinity);for(p=0;p<8;p++){t=s[p];t.copy(m[p]);THREE.ShadowMapPlugin.__projector.unprojectVector(t,
r);n.matrixWorldInverse.multiplyVector3(t);if(t.x<g.x)g.x=t.x;if(t.x>h.x)h.x=t.x;if(t.y<g.y)g.y=t.y;if(t.y>h.y)h.y=t.y;if(t.z<g.z)g.z=t.z;if(t.z>h.z)h.z=t.z}n.left=g.x;n.right=h.x;n.top=h.y;n.bottom=g.y;n.updateProjectionMatrix()}n=l.shadowMap;m=l.shadowMatrix;r=l.shadowCamera;r.position.copy(l.matrixWorld.getPosition());r.lookAt(l.target.matrixWorld.getPosition());r.updateMatrixWorld();r.matrixWorldInverse.getInverse(r.matrixWorld);if(l.cameraHelper)l.cameraHelper.lines.visible=l.shadowCameraVisible;
l.shadowCameraVisible&&l.cameraHelper.update();m.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);m.multiplySelf(r.projectionMatrix);m.multiplySelf(r.matrixWorldInverse);if(!r._viewMatrixArray)r._viewMatrixArray=new Float32Array(16);if(!r._projectionMatrixArray)r._projectionMatrixArray=new Float32Array(16);r.matrixWorldInverse.flattenToArray(r._viewMatrixArray);r.projectionMatrix.flattenToArray(r._projectionMatrixArray);e.multiply(r.projectionMatrix,r.matrixWorldInverse);f.setFromMatrix(e);b.setRenderTarget(n);
b.clear();s=i.__webglObjects;l=0;for(n=s.length;l<n;l++){p=s[l];m=p.object;p.render=false;if(m.visible&&m.castShadow&&(!(m instanceof THREE.Mesh)||!m.frustumCulled||f.contains(m))){m.matrixWorld.flattenToArray(m._objectMatrixArray);m._modelViewMatrix.multiplyToArray(r.matrixWorldInverse,m.matrixWorld,m._modelViewMatrixArray);p.render=true}}l=0;for(n=s.length;l<n;l++){p=s[l];if(p.render){m=p.object;p=p.buffer;b.setObjectFaces(m);t=m.customDepthMaterial?m.customDepthMaterial:m.geometry.morphTargets.length?
d:c;p instanceof THREE.BufferGeometry?b.renderBufferDirect(r,i.__lights,null,t,p,m):b.renderBuffer(r,i.__lights,null,t,p,m)}}s=i.__webglObjectsImmediate;l=0;for(n=s.length;l<n;l++){p=s[l];m=p.object;if(m.visible&&m.castShadow){m.matrixAutoUpdate&&m.matrixWorld.flattenToArray(m._objectMatrixArray);m._modelViewMatrix.multiplyToArray(r.matrixWorldInverse,m.matrixWorld,m._modelViewMatrixArray);b.renderImmediateObject(r,i.__lights,null,c,m)}}}k=b.getClearColor();q=b.getClearAlpha();a.clearColor(k.r,k.g,
k.b,q);a.enable(a.BLEND);b.shadowMapCullFrontFaces&&a.cullFace(a.BACK)}};THREE.ShadowMapPlugin.__projector=new THREE.Projector;
THREE.SpritePlugin=function(){function a(a,b){return b.z-a.z}var b,c,d,f,e,g,h,i,j,k;this.init=function(a){b=a.context;c=a;d=new Float32Array(16);f=new Uint16Array(6);a=0;d[a++]=-1;d[a++]=-1;d[a++]=0;d[a++]=1;d[a++]=1;d[a++]=-1;d[a++]=1;d[a++]=1;d[a++]=1;d[a++]=1;d[a++]=1;d[a++]=0;d[a++]=-1;d[a++]=1;d[a++]=0;a=d[a++]=0;f[a++]=0;f[a++]=1;f[a++]=2;f[a++]=0;f[a++]=2;f[a++]=3;e=b.createBuffer();g=b.createBuffer();b.bindBuffer(b.ARRAY_BUFFER,e);b.bufferData(b.ARRAY_BUFFER,d,b.STATIC_DRAW);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,
g);b.bufferData(b.ELEMENT_ARRAY_BUFFER,f,b.STATIC_DRAW);var a=THREE.ShaderSprite.sprite,l=b.createProgram(),n=b.createShader(b.FRAGMENT_SHADER),r=b.createShader(b.VERTEX_SHADER);b.shaderSource(n,a.fragmentShader);b.shaderSource(r,a.vertexShader);b.compileShader(n);b.compileShader(r);b.attachShader(l,n);b.attachShader(l,r);b.linkProgram(l);h=l;i={};j={};i.position=b.getAttribLocation(h,"position");i.uv=b.getAttribLocation(h,"uv");j.uvOffset=b.getUniformLocation(h,"uvOffset");j.uvScale=b.getUniformLocation(h,
"uvScale");j.rotation=b.getUniformLocation(h,"rotation");j.scale=b.getUniformLocation(h,"scale");j.alignment=b.getUniformLocation(h,"alignment");j.color=b.getUniformLocation(h,"color");j.map=b.getUniformLocation(h,"map");j.opacity=b.getUniformLocation(h,"opacity");j.useScreenCoordinates=b.getUniformLocation(h,"useScreenCoordinates");j.affectedByDistance=b.getUniformLocation(h,"affectedByDistance");j.screenPosition=b.getUniformLocation(h,"screenPosition");j.modelViewMatrix=b.getUniformLocation(h,"modelViewMatrix");
j.projectionMatrix=b.getUniformLocation(h,"projectionMatrix");k=false};this.render=function(d,f,n,r){var d=d.__webglSprites,m=d.length;if(m){var p=i,t=j,s=r/n,n=n*0.5,v=r*0.5,o=true;b.useProgram(h);if(!k){b.enableVertexAttribArray(p.position);b.enableVertexAttribArray(p.uv);k=true}b.disable(b.CULL_FACE);b.enable(b.BLEND);b.depthMask(true);b.bindBuffer(b.ARRAY_BUFFER,e);b.vertexAttribPointer(p.position,2,b.FLOAT,false,16,0);b.vertexAttribPointer(p.uv,2,b.FLOAT,false,16,8);b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,
g);b.uniformMatrix4fv(t.projectionMatrix,false,f._projectionMatrixArray);b.activeTexture(b.TEXTURE0);b.uniform1i(t.map,0);for(var x,y=[],p=0;p<m;p++){x=d[p];if(x.visible&&x.opacity!==0)if(x.useScreenCoordinates)x.z=-x.position.z;else{x._modelViewMatrix.multiplyToArray(f.matrixWorldInverse,x.matrixWorld,x._modelViewMatrixArray);x.z=-x._modelViewMatrix.n34}}d.sort(a);for(p=0;p<m;p++){x=d[p];if(x.visible&&x.opacity!==0&&x.map&&x.map.image&&x.map.image.width){if(x.useScreenCoordinates){b.uniform1i(t.useScreenCoordinates,
1);b.uniform3f(t.screenPosition,(x.position.x-n)/n,(v-x.position.y)/v,Math.max(0,Math.min(1,x.position.z)))}else{b.uniform1i(t.useScreenCoordinates,0);b.uniform1i(t.affectedByDistance,x.affectedByDistance?1:0);b.uniformMatrix4fv(t.modelViewMatrix,false,x._modelViewMatrixArray)}f=x.map.image.width/(x.scaleByViewport?r:1);y[0]=f*s*x.scale.x;y[1]=f*x.scale.y;b.uniform2f(t.uvScale,x.uvScale.x,x.uvScale.y);b.uniform2f(t.uvOffset,x.uvOffset.x,x.uvOffset.y);b.uniform2f(t.alignment,x.alignment.x,x.alignment.y);
b.uniform1f(t.opacity,x.opacity);b.uniform3f(t.color,x.color.r,x.color.g,x.color.b);b.uniform1f(t.rotation,x.rotation);b.uniform2fv(t.scale,y);if(x.mergeWith3D&&!o){b.enable(b.DEPTH_TEST);o=true}else if(!x.mergeWith3D&&o){b.disable(b.DEPTH_TEST);o=false}c.setBlending(x.blending,x.blendEquation,x.blendSrc,x.blendDst);c.setTexture(x.map,0);b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0)}}b.enable(b.CULL_FACE);b.enable(b.DEPTH_TEST);b.depthMask(true)}}};
THREE.DepthPassPlugin=function(){this.enabled=false;this.renderTarget=null;var a,b,c,d,f=new THREE.Frustum,e=new THREE.Matrix4;this.init=function(e){a=e.context;b=e;var e=THREE.ShaderLib.depthRGBA,f=THREE.UniformsUtils.clone(e.uniforms);c=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f});d=new THREE.ShaderMaterial({fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:f,morphTargets:true});c._shadowPass=true;d._shadowPass=true};this.render=
function(a,b){this.enabled&&this.update(a,b)};this.update=function(g,h){var i,j,k,q,l,n;a.clearColor(1,1,1,1);a.disable(a.BLEND);b.setDepthTest(true);b.autoUpdateScene&&g.updateMatrixWorld();if(!h._viewMatrixArray)h._viewMatrixArray=new Float32Array(16);if(!h._projectionMatrixArray)h._projectionMatrixArray=new Float32Array(16);h.matrixWorldInverse.getInverse(h.matrixWorld);h.matrixWorldInverse.flattenToArray(h._viewMatrixArray);h.projectionMatrix.flattenToArray(h._projectionMatrixArray);e.multiply(h.projectionMatrix,
h.matrixWorldInverse);f.setFromMatrix(e);b.setRenderTarget(this.renderTarget);b.clear();n=g.__webglObjects;i=0;for(j=n.length;i<j;i++){k=n[i];l=k.object;k.render=false;if(l.visible&&(!(l instanceof THREE.Mesh)||!l.frustumCulled||f.contains(l))){l.matrixWorld.flattenToArray(l._objectMatrixArray);l._modelViewMatrix.multiplyToArray(h.matrixWorldInverse,l.matrixWorld,l._modelViewMatrixArray);k.render=true}}i=0;for(j=n.length;i<j;i++){k=n[i];if(k.render){l=k.object;k=k.buffer;b.setObjectFaces(l);q=l.customDepthMaterial?
l.customDepthMaterial:l.geometry.morphTargets.length?d:c;k instanceof THREE.BufferGeometry?b.renderBufferDirect(h,g.__lights,null,q,k,l):b.renderBuffer(h,g.__lights,null,q,k,l)}}n=g.__webglObjectsImmediate;i=0;for(j=n.length;i<j;i++){k=n[i];l=k.object;if(l.visible&&l.castShadow){l.matrixAutoUpdate&&l.matrixWorld.flattenToArray(l._objectMatrixArray);l._modelViewMatrix.multiplyToArray(h.matrixWorldInverse,l.matrixWorld,l._modelViewMatrixArray);b.renderImmediateObject(h,g.__lights,null,c,l)}}i=b.getClearColor();
j=b.getClearAlpha();a.clearColor(i.r,i.g,i.b,j);a.enable(a.BLEND)}};
THREE.WebGLRenderer&&(THREE.AnaglyphWebGLRenderer=function(a){THREE.WebGLRenderer.call(this,a);this.autoUpdateScene=false;var b=this,c=this.setSize,d=this.render,f=new THREE.PerspectiveCamera,e=new THREE.PerspectiveCamera,g=new THREE.Matrix4,h=new THREE.Matrix4,i,j,k,q;f.matrixAutoUpdate=e.matrixAutoUpdate=false;var a={minFilter:THREE.LinearFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat},l=new THREE.WebGLRenderTarget(512,512,a),n=new THREE.WebGLRenderTarget(512,512,a),r=new THREE.PerspectiveCamera(53,
1,1,1E4);r.position.z=2;var a=new THREE.ShaderMaterial({uniforms:{mapLeft:{type:"t",value:0,texture:l},mapRight:{type:"t",value:1,texture:n}},vertexShader:"varying vec2 vUv;\nvoid main() {\nvUv = vec2( uv.x, 1.0 - uv.y );\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",fragmentShader:"uniform sampler2D mapLeft;\nuniform sampler2D mapRight;\nvarying vec2 vUv;\nvoid main() {\nvec4 colorL, colorR;\nvec2 uv = vUv;\ncolorL = texture2D( mapLeft, uv );\ncolorR = texture2D( mapRight, uv );\ngl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;\n}"}),
m=new THREE.Scene,a=new THREE.Mesh(new THREE.PlaneGeometry(2,2),a);a.rotation.x=Math.PI/2;m.add(a);m.add(r);this.setSize=function(a,d){c.call(b,a,d);l.width=a;l.height=d;n.width=a;n.height=d};this.render=function(a,c){a.updateMatrixWorld();if(i!==c.aspect||j!==c.near||k!==c.far||q!==c.fov){i=c.aspect;j=c.near;k=c.far;q=c.fov;var s=c.projectionMatrix.clone(),v=125/30*0.5,o=v*j/125,x=j*Math.tan(q*Math.PI/360),y;g.n14=v;h.n14=-v;v=-x*i+o;y=x*i+o;s.n11=2*j/(y-v);s.n13=(y+v)/(y-v);f.projectionMatrix.copy(s);
v=-x*i-o;y=x*i-o;s.n11=2*j/(y-v);s.n13=(y+v)/(y-v);e.projectionMatrix.copy(s)}f.matrixWorld.copy(c.matrixWorld).multiplySelf(h);f.position.copy(c.position);f.near=c.near;f.far=c.far;d.call(b,a,f,l,true);e.matrixWorld.copy(c.matrixWorld).multiplySelf(g);e.position.copy(c.position);e.near=c.near;e.far=c.far;d.call(b,a,e,n,true);m.updateMatrixWorld();d.call(b,m,r)}});
THREE.WebGLRenderer&&(THREE.CrosseyedWebGLRenderer=function(a){THREE.WebGLRenderer.call(this,a);this.autoClear=false;var b=this,c=this.setSize,d=this.render,f,e,g=new THREE.PerspectiveCamera;g.target=new THREE.Vector3(0,0,0);var h=new THREE.PerspectiveCamera;h.target=new THREE.Vector3(0,0,0);b.separation=10;if(a&&a.separation!==void 0)b.separation=a.separation;this.setSize=function(a,d){c.call(b,a,d);f=a/2;e=d};this.render=function(a,c){this.clear();g.fov=c.fov;g.aspect=0.5*c.aspect;g.near=c.near;
g.far=c.far;g.updateProjectionMatrix();g.position.copy(c.position);g.target.copy(c.target);g.translateX(b.separation);g.lookAt(g.target);h.projectionMatrix=g.projectionMatrix;h.position.copy(c.position);h.target.copy(c.target);h.translateX(-b.separation);h.lookAt(h.target);this.setViewport(0,0,f,e);d.call(b,a,g);this.setViewport(f,0,f,e);d.call(b,a,h,false)}});
THREE.ShaderFlares={lensFlareVertexTexture:{vertexShader:"uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility = (       visibility.r / 9.0 ) *\n( 1.0 - visibility.g / 9.0 ) *\n(       visibility.b / 9.0 ) *\n( 1.0 - visibility.a / 9.0 );\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",fragmentShader:"precision mediump float;\nuniform sampler2D map;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"},
lensFlare:{vertexShader:"uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",fragmentShader:"precision mediump float;\nuniform sampler2D map;\nuniform sampler2D occlusionMap;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nfloat visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;\nvisibility = ( 1.0 - visibility / 4.0 );\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * visibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"}};
THREE.ShaderSprite={sprite:{vertexShader:"uniform int useScreenCoordinates;\nuniform int affectedByDistance;\nuniform vec3 screenPosition;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 alignment;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position + alignment;\nvec2 rotatedPosition;\nrotatedPosition.x = ( cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y ) * scale.x;\nrotatedPosition.y = ( sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y ) * scale.y;\nvec4 finalPosition;\nif( useScreenCoordinates != 0 ) {\nfinalPosition = vec4( screenPosition.xy + rotatedPosition, screenPosition.z, 1.0 );\n} else {\nfinalPosition = projectionMatrix * modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition * ( affectedByDistance == 1 ? 1.0 : finalPosition.z );\n}\ngl_Position = finalPosition;\n}",
fragmentShader:"precision mediump float;\nuniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\n}"}};
>>>>>>> mrdoob/dev
