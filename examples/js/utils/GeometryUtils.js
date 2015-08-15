/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GeometryUtils = {

	// Merge two geometries or geometry and geometry from object (using object's transform)

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( 'THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.' );

		var matrix;

		if ( geometry2 instanceof THREE.Mesh ) {

			geometry2.matrixAutoUpdate && geometry2.updateMatrix();

			matrix = geometry2.matrix;
			geometry2 = geometry2.geometry;

		}

		geometry1.merge( geometry2, matrix, materialIndexOffset );

	},

	// Get random point in triangle (via barycentric coordinates)
	// 	(uniform distribution)
	// 	http://www.cgafaq.info/wiki/Random_Point_In_Triangle

	randomPointInTriangle: function () {

		var vector = new THREE.Vector3();

		return function ( vectorA, vectorB, vectorC ) {

			var point = new THREE.Vector3();

			var a = THREE.Math.random16();
			var b = THREE.Math.random16();

			if ( ( a + b ) > 1 ) {

				a = 1 - a;
				b = 1 - b;

			}

			var c = 1 - a - b;

			point.copy( vectorA );
			point.multiplyScalar( a );

			vector.copy( vectorB );
			vector.multiplyScalar( b );

			point.add( vector );

			vector.copy( vectorC );
			vector.multiplyScalar( c );

			point.add( vector );

			return point;

		};

	}(),

	// Get random point in face (triangle)
	// (uniform distribution)

	randomPointInFace: function ( face, geometry ) {

		var vA, vB, vC;

		vA = geometry.vertices[ face.a ];
		vB = geometry.vertices[ face.b ];
		vC = geometry.vertices[ face.c ];

		return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vC );

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
			vA, vB, vC;

		// precompute face areas

		for ( i = 0; i < il; i ++ ) {

			face = faces[ i ];

			vA = vertices[ face.a ];
			vB = vertices[ face.b ];
			vC = vertices[ face.c ];

			face._area = THREE.GeometryUtils.triangleArea( vA, vB, vC );

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

			var result = binarySearch( 0, cumulativeAreas.length - 1 );
			return result;

		}

		// pick random face weighted by face area

		var r, index,
			result = [];

		var stats = {};

		for ( i = 0; i < n; i ++ ) {

			r = THREE.Math.random16() * totalArea;

			index = binarySearchIndices( r );

			result[ i ] = THREE.GeometryUtils.randomPointInFace( faces[ index ], geometry );

			if ( ! stats[ index ] ) {

				stats[ index ] = 1;

			} else {

				stats[ index ] += 1;

			}

		}

		return result;

	},

	randomPointsInBufferGeometry: function ( geometry, n ) {

		var i,
			vertices = geometry.attributes.position.array,
			totalArea = 0,
			cumulativeAreas = [],
			vA, vB, vC;

		// precompute face areas
		vA = new THREE.Vector3();
		vB = new THREE.Vector3();
		vC = new THREE.Vector3();

		// geometry._areas = [];
		var il = vertices.length / 9;

		for ( i = 0; i < il; i ++ ) {

			vA.set( vertices[ i * 9 + 0 ], vertices[ i * 9 + 1 ], vertices[ i * 9 + 2 ] );
			vB.set( vertices[ i * 9 + 3 ], vertices[ i * 9 + 4 ], vertices[ i * 9 + 5 ] );
			vC.set( vertices[ i * 9 + 6 ], vertices[ i * 9 + 7 ], vertices[ i * 9 + 8 ] );

			area = THREE.GeometryUtils.triangleArea( vA, vB, vC );
			totalArea += area;

			cumulativeAreas.push( totalArea );

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

			var result = binarySearch( 0, cumulativeAreas.length - 1 );
			return result;

		}

		// pick random face weighted by face area

		var r, index,
			result = [];

		for ( i = 0; i < n; i ++ ) {

			r = THREE.Math.random16() * totalArea;

			index = binarySearchIndices( r );

			// result[ i ] = THREE.GeometryUtils.randomPointInFace( faces[ index ], geometry, true );
			vA.set( vertices[ index * 9 + 0 ], vertices[ index * 9 + 1 ], vertices[ index * 9 + 2 ] );
			vB.set( vertices[ index * 9 + 3 ], vertices[ index * 9 + 4 ], vertices[ index * 9 + 5 ] );
			vC.set( vertices[ index * 9 + 6 ], vertices[ index * 9 + 7 ], vertices[ index * 9 + 8 ] );
			result[ i ] = THREE.GeometryUtils.randomPointInTriangle( vA, vB, vC );

		}

		return result;

	},

	// Get triangle area (half of parallelogram)
	// http://mathworld.wolfram.com/TriangleArea.html

	triangleArea: function () {

		var vector1 = new THREE.Vector3();
		var vector2 = new THREE.Vector3();

		return function ( vectorA, vectorB, vectorC ) {

			vector1.subVectors( vectorB, vectorA );
			vector2.subVectors( vectorC, vectorA );
			vector1.cross( vector2 );

			return 0.5 * vector1.length();

		};

	}(),

	center: function ( geometry ) {

		console.warn( 'THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead.' );
		return geometry.center();

	}

};
