/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
 */

( function ( THREE ) {

	THREE.Raycaster = function ( origin, direction, near, far ) {

		this.ray = new THREE.Ray( origin, direction );
		
		// normalized ray.direction required for accurate distance calculations
		if( this.ray.direction.length() > 0 ) {

			this.ray.direction.normalize();

		}

		this.near = near || 0;
		this.far = far || Infinity;

	};

	var sphere = new THREE.Sphere();
	var localRay = new THREE.Ray();
	var facePlane = new THREE.Plane();
	var intersectPoint = new THREE.Vector3();

	var inverseMatrix = new THREE.Matrix4();

	var descSort = function ( a, b ) {

		return a.distance - b.distance;

	};

	var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

	// http://www.blackpawn.com/texts/pointinpoly/default.html

	var intersectObject = function ( object, raycaster, intersects ) {

		if ( object instanceof THREE.Particle ) {

			var distance = raycaster.ray.distanceToPoint( object.matrixWorld.getPosition() );

			if ( distance > object.scale.x ) {

				return intersects;

			}

			intersects.push( {

				distance: distance,
				point: object.position,
				face: null,
				object: object

			} );

		} else if ( object instanceof THREE.Mesh ) {

			// Checking boundingSphere distance to ray
			sphere.set(
				object.matrixWorld.getPosition(),
				object.geometry.boundingSphere.radius* object.matrixWorld.getMaxScaleOnAxis() );

			if ( ! raycaster.ray.isIntersectionSphere( sphere ) ) {

				return intersects;

			}

			// Checking faces

			var geometry = object.geometry;
			var vertices = geometry.vertices;

			var isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
			var objectMaterials = isFaceMaterial === true ? object.material.materials : null;

			var side = object.material.side;

			var a, b, c, d;
			var precision = raycaster.precision;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			inverseMatrix.getInverse( object.matrixWorld );

			localRay.copy( raycaster.ray ).transform( inverseMatrix );
	
			for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				var face = geometry.faces[ f ];

				var material = isFaceMaterial === true ? objectMaterials[ face.materialIndex ] : object.material;

				if ( material === undefined ) continue;
				
				facePlane.setFromNormalAndCoplanarPoint( face.normal, vertices[face.a] );

				var planeDistance = localRay.distanceToPlane( facePlane );
	
				// bail if raycaster and plane are parallel
				if ( Math.abs( planeDistance ) < precision ) continue;
	
				// if negative distance, then plane is behind raycaster
				if ( planeDistance < 0 ) continue;

				// check if we hit the wrong side of a single sided face
				side = material.side;
				if( side !== THREE.DoubleSide ) {

					var planeSign = localRay.direction.dot( facePlane.normal );

					if( ! ( side === THREE.FrontSide ? planeSign < 0 : planeSign > 0 ) ) continue;

				}

				// this can be done using the planeDistance from localRay because localRay wasn't normalized, but ray was
				if ( planeDistance < raycaster.near || planeDistance > raycaster.far ) continue;
				
				intersectPoint = localRay.at( planeDistance, intersectPoint ); // passing in intersectPoint avoids a copy

				if ( face instanceof THREE.Face3 ) {

					a = vertices[ face.a ];
					b = vertices[ face.b ];
					c = vertices[ face.c ];

					if ( ! THREE.Triangle.containsPoint( intersectPoint, a, b, c ) ) continue;

				} else if ( face instanceof THREE.Face4 ) {

					a = vertices[ face.a ];
					b = vertices[ face.b ];
					c = vertices[ face.c ];
					d = vertices[ face.d ];

					if ( ( ! THREE.Triangle.containsPoint( intersectPoint, a, b, d ) ) &&
						 ( ! THREE.Triangle.containsPoint( intersectPoint, b, c, d ) ) ) continue;

				} else {

					// This is added because if we call out of this if/else group when none of the cases
					//    match it will add a point to the intersection list erroneously.
					throw Error( "face type not supported" );

				}

				intersects.push( {

					distance: planeDistance,	// this works because the original ray was normalized, and the transformed localRay wasn't
					point: raycaster.ray.at( planeDistance ),
					face: face,
					faceIndex: f,
					object: object

				} );

			}
		} else if ( object instanceof THREE.Line ) {
			if( object.geometry.vertices.length == 2 ) { // only works with minimal lines (i.e. between 2 points) for now, feel free to extend :) 
				var v0 = object.geometry.vertices[0];
				var v1 = object.geometry.vertices[1];
				var lineDirection = v1.clone().sub( v0 );
				var rayOfLine = new THREE.Ray( v0, lineDirection );
				
				var distanceToRay = raycaster.ray.distanceToRay( rayOfLine );
				if( distanceToRay <= raycaster.precision ) {
					var nearestPointOnLine = getNearestPointOnLine( raycaster.ray, v0, v1, lineDirection );
					var diffOrigins = nearestPointOnLine.clone().sub( raycaster.ray.origin ); 
					distanceToRay = diffOrigins.cross( raycaster.ray.direction ).length() / raycaster.ray.direction.length();

					if( distanceToRay <= raycaster.precision ) {
						var distance = raycaster.ray.origin.distanceTo( nearestPointOnLine );
						if ( raycaster.near <= distance && distance <= raycaster.far )
							intersects.push( {
		
								distance: distance,
								point: nearestPointOnLine,
								object: object
		
							} );
					}
				}
			}
		}
	};

	// ---- helper functions for line intersection test

	/***
	 * getNearestPointOnLine 
	 * 
	 * returns the point on the line from @param v0 to @param v1 that is nearest to the @param ray.
	 * 	       @param lineDirection is the vector from @param v0 to @param v1 , i.e. v1.clone().sub( v0 ).
	 *         @param lineDirection could be calculated within getNearestPointOnLine and is only passed for performance benefits,
	 *         because it has already been calculated when getNearestPointOnLine is being called.
	 * 
	 */
	
	var getNearestPointOnLine = function( ray, v0, v1, lineDirection ) {
//		getNearestPointOnLine resolves the equation (ray.origin + m * ray.direction - v0  - n * lineDirection) * lineDirection == 0
		// --- helper functions for getNearestPointOnLine
		
		/***
		 * assignDimension
		 * 
		 *  ... checks if the dimension @param dim of @param vec is a suitable dimension 
		 *  (for resolving the getNearestPointOnLine-equation, see at getNearestPointOnLine), i.e. if @param vec[ @param dim] != 0.
		 *      
		 * In this case, assignDimension stores @param dim in the next free dimension container (which is @param dimFirst, iff ! @param dimFirst[0]
		 * and @param dimSecond otherwise).  
		 * 
		 * returns nothing
		 */
		
		var assignDimension = function( vec, dim, dimFirst, dimSecond ) {
			if( vec[dim] != 0 ) {
				if( !dimFirst[0] )
					dimFirst[0] = dim;
				else
					dimSecond[0] = dim;
			}
		};
		
		/***
		 * returnSuitableMDimension 
		 * 
		 * returns dim iff dim is a suitable dimension to calculate m and
		 * 		   null otherwise
		 */
		
		var returnSuitableMDimension = function( dim, ray, lineDirection ) {
			return lineDirection[dim] == 0 && ray.direction[dim] != 0 ? dim : null;  
		}
		
		var assert = function( expr, msg ) {
//			Didn't know what to do with my assert-statements when contriubting this code, so I commented them out.
			console.assert( expr, msg );
		}

		var m, n;
		
		var diffOrigins = ray.origin.clone().sub(v0);
		var dimFirst = [null], dimSecond =  [null];
		assignDimension( lineDirection, "x", dimFirst, dimSecond );
		assignDimension( lineDirection, "y", dimFirst, dimSecond );
		if( !dimSecond[0])
			assignDimension( lineDirection, "z", dimFirst, dimSecond );
		
		assert( dimFirst[0] );
		
		if( !dimSecond[0]) {
			var dimM = returnSuitableMDimension("x", ray, lineDirection )
				    || returnSuitableMDimension("y", ray, lineDirection )
				    || returnSuitableMDimension("z", ray, lineDirection )
				    ;
			
			if( dimM ) {
				m = -diffOrigins[dimM]/ray.direction[dimM];
			} else {
				m = 1;
			}
		} else {					
			var div = ray.direction[dimSecond[0]] * lineDirection[dimFirst[0]] - ray.direction[dimFirst[0]] * lineDirection[dimSecond[0]];
			if( div == 0 && dimSecond[0] == "y" && lineDirection.z != 0 ) {
				dimSecond[0] = "z";
				div = ray.direction[dimSecond[0]] * lineDirection[dimFirst[0]] - ray.direction[dimFirst[0]] * lineDirection[dimSecond[0]];
			}
			
			var diffDir = (diffOrigins[dimFirst[0]] * lineDirection[dimSecond[0]] - diffOrigins[dimSecond[0]] * lineDirection[dimFirst[0]]);
			if (div != 0 ) {
				m = diffDir / div;
			} else {
				assert( diffDir == 0 );
				m = 1;
			} 
		}
	
		n = (diffOrigins[dimFirst[0]] + m * ray.direction[dimFirst[0]]) / lineDirection[dimFirst[0]];
		
		// If n == 0 the nearest point on the line is v0.
		// If n == 1 the nearest point on the line is v1.
		// If 0 < n < 1, the nearest point on the line is between v0 and v1.
		// In all these cases, the distance between the ray and the valid section of the line (i.e. between v0 and v1) is the 
		// calculated distance between the ray and the (infinite) line.
	
		if( 0 <= n && n <= 1 ) {
			return lineDirection.clone().multiplyScalar(n).add(v0);
	
		} else {
			if( 1 < n ) { // if 1 < n the nearest point is after v1 => the nearest point of the valid section of the line is v1
				return v1;
			} else {
				assert( n < 0 ); // if n < 0 the nearest point is before v0 => the nearest point of the valid section of the line is v0
				return v0;
			}
		}
	};

	var intersectDescendants = function ( object, raycaster, intersects ) {

		var descendants = object.getDescendants();

		for ( var i = 0, l = descendants.length; i < l; i ++ ) {

			intersectObject( descendants[ i ], raycaster, intersects );

		}
	};

	//

	THREE.Raycaster.prototype.precision = 0.0001;

	THREE.Raycaster.prototype.set = function ( origin, direction ) {

		this.ray.set( origin, direction );

		// normalized ray.direction required for accurate distance calculations
		if( this.ray.direction.length() > 0 ) {

			this.ray.direction.normalize();

		}

	};

	THREE.Raycaster.prototype.intersectObject = function ( object, recursive ) {

		var intersects = [];

		if ( recursive === true ) {

			intersectDescendants( object, this, intersects );

		}

		intersectObject( object, this, intersects );

		intersects.sort( descSort );

		return intersects;

	};

	THREE.Raycaster.prototype.intersectObjects = function ( objects, recursive ) {

		var intersects = [];

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			intersectObject( objects[ i ], this, intersects );

			if ( recursive === true ) {

				intersectDescendants( objects[ i ], this, intersects );

			}
		}

		intersects.sort( descSort );

		return intersects;

	};

}( THREE ) );
