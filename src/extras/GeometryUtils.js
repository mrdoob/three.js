/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GeometryUtils = {

	// Merge two geometries or geometry and geometry from object (using object's transform)

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( 'DEPRECATED: GeometryUtils\'s .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.' );

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

	randomPointInFace: function ( face, geometry, useCachedAreas ) {

		var vA, vB, vC;

		vA = geometry.vertices[ face.a ];
		vB = geometry.vertices[ face.b ];
		vC = geometry.vertices[ face.c ];

		return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vC );

	},
	
	// Get random point in segment
	// (uniform distribution)
	
	randomPointInSegment: function ( v1, v2 ){
	var t, p = new THREE.Vector3();
	t = THREE.GeometryUtils.random();
	
	return		p.copy(v2).subSelf(v1).multiplyScalar(t).addSelf(v1);
	
	},

	// Get random points in perimeter weighted by segment length
	// (uniform distribution)
	
	randomPointInPerimeter: function ( face, geometry ) {

		var vA, vB, vC, vD;
		var r, a, b, c, d=0,
			tmp = THREE.GeometryUtils.__v1;
		
		if ( face instanceof THREE.Face3 ) {

			vA = geometry.vertices[ face.a ];
			vB = geometry.vertices[ face.b ];
			vC = geometry.vertices[ face.c ];
			
			tmp.sub( vA, vB );
			a = tmp.length();

			tmp.sub( vB, vC );
			b = tmp.length() + a;

			tmp.sub( vC, vA );
			c = tmp.length() + b;
			
			r = THREE.GeometryUtils.random() * c;
			
			if(r < a) 		return	THREE.GeometryUtils.randomPointInSegment(vA, vB);
			else if(r< b) 	return 	THREE.GeometryUtils.randomPointInSegment(vB, vC);
			else 			return 	THREE.GeometryUtils.randomPointInSegment(vC, vA);

		} else if ( face instanceof THREE.Face4 ) {

			vA = geometry.vertices[ face.a ];
			vB = geometry.vertices[ face.b ];
			vC = geometry.vertices[ face.c ];
			vD = geometry.vertices[ face.d ];
			
			tmp.sub( vA, vB );
			a = tmp.length();

			tmp.sub( vB, vC );
			b = tmp.length() + a;

			tmp.sub( vC, vD );
			c = tmp.length() + b;
			
			tmp.sub( vD, vA );
			d = tmp.length() + c;
			
			r = THREE.GeometryUtils.random() * d;
			
			if(r < a) 		return 	THREE.GeometryUtils.randomPointInSegment(vA, vB);
			else if(r< b) 	return 	THREE.GeometryUtils.randomPointInSegment(vB, vC);
			else if(r<c)	return 	THREE.GeometryUtils.randomPointInSegment(vC, vD);
			else 			return 	THREE.GeometryUtils.randomPointInSegment(vD, vA);
			
		}
		
	},

	// Get uniformly distributed random points in mesh
	//  - create array with cumulative sums of face areas
	//  - pick random number from 0 to total area
	//  - find corresponding place in area array by binary search
	//  - get random point in face if primary dimension n1 is passed
	//  - get random point in wireframe if secondary dimension n2 is passed

	randomPointsInGeometry: function ( geometry, n1, n2 ) {

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

			var result = binarySearch( 0, cumulativeAreas.length - 1 )
			return result;

		}

		// pick random face weighted by face area

		var r, index,
			result = [];

		var stats = {};

		for ( i = 0; i < n1; i ++ ) {

			r = THREE.Math.random16() * totalArea;

			index = binarySearchIndices( r );

			result[ i ] = THREE.GeometryUtils.randomPointInFace( faces[ index ], geometry, true );

			if ( ! stats[ index ] ) {

				stats[ index ] = 1;

			} else {

				stats[ index ] += 1;

			}

		}

		for ( i = n1; i < (n1+n2); i ++ ) {
	
			r = THREE.GeometryUtils.random() * totalArea;

			index = binarySearchIndices( r );

			result[ i ] = THREE.GeometryUtils.randomPointInPerimeter( faces[ index ], geometry );

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

	}

};
