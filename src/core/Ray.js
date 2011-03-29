/**
 * @author mr.doob / http://mrdoob.com/
 * @author jaycrossler / http://wecreategames.com
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

}

THREE.Ray.prototype = {

	intersectScene : function ( scene, checkClickable ) {

		var i, l, j, k, object,
		objects = scene.objects,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i++ ) {

			object = objects[i];

			if (checkClickable && !object.isClickable) continue;

			if ( object instanceof THREE.Mesh ) {

				intersects = intersects.concat( this.intersectObject( object ) );

			}

			if ( object instanceof THREE.Particle ) {

				intersects = intersects.concat( this.intersectParticle( object ) );

			}

			if ( object instanceof THREE.ParticleSystem ) {
			
				intersects = intersects.concat( this.intersectParticleSystemItem( object ) );				
				
			}
		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	},

	intersectParticleSystemItem : function ( object ) {
		var intersects = [], target_point, starter_vector;
		var dist_padding = 1;

		var origin_point = this.origin.clone();
		var direction_vector = this.direction.clone();

		for ( var i = 0, l = object.geometry.vertices.length; i < l; i++) {
			target_point = object.geometry.vertices[i].position; 
			starter_vector = target_point.clone().subSelf(origin_point);
		
			var c1 = starter_vector.dot ( direction_vector );
			var c2 = direction_vector.dot ( direction_vector );
			var b = c1 / c2;
			var intersect_point = origin_point.clone().addSelf(direction_vector.multiplyScalar(b));

			var dist = target_point.distanceTo(intersect_point);
			
			//There are two ways people make particles - with one material, or many
			var dist_cutoff = (object.materials[i]) ? (object.materials[i].size/2) : (object.materials[0].size/2);

			if (dist < (dist_cutoff+dist_padding)) {
				var intersect = {
					distance: dist,
					point: target_point,
					particleNumber: i,
					object: object.geometry.vertices[i],
					particleSystem: object
				};
				intersects.push( intersect );
			}
		}
		return intersects;

	},

	intersectParticle : function ( object ) {
// Concept: If distance from point to the line is small, then consider it an intersect
// Derived from: http://www.softsurfer.com/Archive/algorithm_0102/

		var intersects = [];
		var dist_padding = 1;

		var origin_point = this.origin.clone();
		var direction_vector = this.direction.clone();
		var target_point = object.position;
		var starter_vector = target_point.clone().subSelf(origin_point);

		var c1 = starter_vector.dot ( direction_vector );
		var c2 = direction_vector.dot ( direction_vector );
		var b = c1 / c2;
		var intersect_point = origin_point.clone().addSelf(direction_vector.multiplyScalar(b));

		var dist = target_point.distanceTo(intersect_point);
		var dist_cutoff = (object.scale && object.scale.x) ? (object.scale.x/2) : 1;  //Scale works on straight Particles

		if (dist < (dist_cutoff+dist_padding)) {
			var intersect = {
				distance: dist,
				point: target_point,
				face: null,
				object: object
			};
			intersects.push( intersect );
		}
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

			if ( dot < 0 ) { // Math.abs( dot ) > 0.0001

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