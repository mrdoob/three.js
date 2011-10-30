/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

	this.intersectScene = function ( scene ) {

		return this.intersectObjects( scene.children );

	};

	this.intersectObjects = function ( objects ) {

		var i, l, object,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ] ) );

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	};

	var a = new THREE.Vector3();
	var b = new THREE.Vector3();
	var c = new THREE.Vector3();
	var d = new THREE.Vector3();

	var origin = new THREE.Vector3();
	var direction = new THREE.Vector3();
	var vector = new THREE.Vector3();
	var normal = new THREE.Vector3();

	this.intersectObject = function ( object ) {

		var intersect, intersects = [];

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( object.children[ i ] ) );

		}

		if ( object instanceof THREE.Particle ) {

			var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );

			if ( distance === null || distance > object.scale.x ) {

				return [];

			}

			intersect = {

				distance: distance,
				point: object.position,
				face: null,
				object: object

			};

			intersects.push( intersect );

		} else if ( object instanceof THREE.Mesh ) {

			// Checking boundingSphere

			var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );

			if ( distance === null || distance > object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) ) ) {

				return intersects;

			}

			// Checking faces

			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix,
			intersectPoint;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				face = geometry.faces[ f ];

				origin = origin.copy( this.origin );
				direction = direction.copy( this.direction );

				objMatrix = object.matrixWorld;

				// check if face.centroid is behind the origin

				vector = objMatrix.multiplyVector3( vector.copy( face.centroid ) ).subSelf( origin );
				dot = vector.dot( direction );

				if ( dot <= 0 ) continue;

				//

				a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ].position ) );
				b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ].position ) );
				c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ].position ) );
				d = face instanceof THREE.Face4 ? objMatrix.multiplyVector3( d.copy( vertices[ face.d ].position ) ) : null;

				normal = object.matrixRotationWorld.multiplyVector3( normal.copy( face.normal ) );
				dot = direction.dot( normal );

				if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) { // Math.abs( dot ) > 0.0001

					scalar = normal.dot( vector.sub( a, origin ) ) / dot;
					intersectPoint = origin.clone().addSelf( direction.multiplyScalar( scalar ) );

					if ( face instanceof THREE.Face3 ) {

						if ( pointInFace3( intersectPoint, a, b, c ) ) {

							intersect = {

								distance: origin.distanceTo( intersectPoint ),
								point: intersectPoint,
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					} else if ( face instanceof THREE.Face4 ) {

						if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

							intersect = {

								distance: origin.distanceTo( intersectPoint ),
								point: intersectPoint,
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					}

				}

			}

		}

		return intersects;

	}

	var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
	var dot, intersect, distance;

	function distanceFromIntersection( origin, direction, position ) {

		v0 = v0.copy( position ).subSelf( origin );
		dot = v0.dot( direction );

		if ( dot <= 0 ) return null; // check if position behind origin.

		intersect = v1.copy( origin ).addSelf( v2.copy( direction ).multiplyScalar( dot ) );
		distance = position.distanceTo( intersect );

		return distance;

	}

	// http://www.blackpawn.com/texts/pointinpoly/default.html

	var dot00, dot01, dot02, dot11, dot12, invDenom, u, v

	function pointInFace3( p, a, b, c ) {

		v0.copy( c ).subSelf( a );
		v1.copy( b ).subSelf( a );
		v2.copy( p ).subSelf( a );

		dot00 = v0.dot( v0 );
		dot01 = v0.dot( v1 );
		dot02 = v0.dot( v2 );
		dot11 = v1.dot( v1 );
		dot12 = v1.dot( v2 );

		invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
		u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

	}

};
