/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

}

THREE.Ray.prototype = {

	intersectScene : function ( scene ) {

		var i, l, object,
		objects = scene.objects,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i++ ) {

			object = objects[i];

			if ( object instanceof THREE.Mesh ) {

				intersects = intersects.concat( this.intersectObject( object ) );

			}

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	},

	intersectObject : function ( object ) {

		var f, fl, face, a, b, c, d, normal,
		dot, scalar,
		origin, direction,
		geometry = object.geometry,
		vertices = geometry.vertices,
		objMatrix,
		intersect, intersects = [],
		intersectPoint;

		for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			face = geometry.faces[ f ];

			origin = this.origin.clone();
			direction = this.direction.clone();

			objMatrix = object.matrixWorld;

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

		return intersects;

		// http://www.blackpawn.com/texts/pointinpoly/default.html

		function pointInFace3( p, a, b, c ) {

			var v0 = c.clone().subSelf( a ), v1 = b.clone().subSelf( a ), v2 = p.clone().subSelf( a ),
			dot00 = v0.dot( v0 ), dot01 = v0.dot( v1 ), dot02 = v0.dot( v2 ), dot11 = v1.dot( v1 ), dot12 = v1.dot( v2 ),

			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			return ( u > 0 ) && ( v > 0 ) && ( u + v < 1 );

		}

	}

};
