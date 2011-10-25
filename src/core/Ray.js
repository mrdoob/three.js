/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

}

THREE.Ray.prototype = {

	constructor: THREE.Ray,

	intersectScene: function ( scene ) {

		return this.intersectObjects( scene.children );

	},

	intersectObjects: function ( objects ) {

		var i, l, object,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ] ) );

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	},

	intersectObject: function ( object ) {

		function distanceFromIntersection( origin, direction, position ) {

			var vector, dot, intersect, distance;

			vector = position.clone().subSelf( origin );
			dot = vector.dot( direction );

			if ( dot <= 0 ) return null; // check if position behind origin.

			intersect = origin.clone().addSelf( direction.clone().multiplyScalar( dot ) );
			distance = position.distanceTo( intersect );

			return distance;

		}

		// http://www.blackpawn.com/texts/pointinpoly/default.html

		var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
		var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;

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

		//

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

			var f, fl, face,
			a, b, c, d, normal,
			vector, dot, scalar,
			origin, direction,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix,
			intersectPoint;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				face = geometry.faces[ f ];

				origin = this.origin.clone();
				direction = this.direction.clone();

				objMatrix = object.matrixWorld;

				// check if face.centroid is behind the origin

				vector = objMatrix.multiplyVector3( face.centroid.clone() ).subSelf( origin );
				dot = vector.dot( direction );

				if ( dot <= 0 ) continue;

				//

				a = objMatrix.multiplyVector3( vertices[ face.a ].position.clone() );
				b = objMatrix.multiplyVector3( vertices[ face.b ].position.clone() );
				c = objMatrix.multiplyVector3( vertices[ face.c ].position.clone() );
				d = face instanceof THREE.Face4 ? objMatrix.multiplyVector3( vertices[ face.d ].position.clone() ) : null;

				normal = object.matrixRotationWorld.multiplyVector3( face.normal.clone() );
				dot = direction.dot( normal );

				if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) { // Math.abs( dot ) > 0.0001

					scalar = normal.dot( new THREE.Vector3().sub( a, origin ) ) / dot;
					intersectPoint = origin.addSelf( direction.multiplyScalar( scalar ) );

					if ( face instanceof THREE.Face3 ) {

						if ( pointInFace3( intersectPoint, a, b, c ) ) {

							intersect = {

								distance: this.origin.distanceTo( intersectPoint ),
								point: intersectPoint,
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					} else if ( face instanceof THREE.Face4 ) {

						if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

							intersect = {

								distance: this.origin.distanceTo( intersectPoint ),
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

};
