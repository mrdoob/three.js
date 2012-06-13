/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

	this.precision = 0.0001;
	this.threshold = 5;

};


THREE.Ray.prototype = {

	constructor: THREE.Ray,

	setPrecision: function ( value ) {

		this.precision = value;
		return this;

	},

	setOrigin: function ( v ) {

		this.origin = v;
		return this;

	},

	setDirection: function ( v ) {

		this.direction = v;
		return this;

	},

	distanceFromIntersection: ( function () {

		var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

		return function ( origin, direction, position ) {

			var dot, intersect, distance;

			v0.sub( position, origin );
			dot = v0.dot( direction );

			intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
			distance = position.distanceTo( intersect );

			return distance;
		};

	}()),

	// http://www.blackpawn.com/texts/pointinpoly/default.html
	pointInFace3: ( function () {

		var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

		return function ( p, a, b, c ) {

			var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;

			v0.sub( c, a );
			v1.sub( b, a );
			v2.sub( p, a );

			dot00 = v0.dot( v0 );
			dot01 = v0.dot( v1 );
			dot02 = v0.dot( v2 );
			dot11 = v1.dot( v1 );
			dot12 = v1.dot( v2 );

			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

		};

	}()),

	intersectObject: function ( object ) {

		var intersects = [];

		if ( object instanceof THREE.Particle ) {

			this.intersectParticle( object, intersects );

		} else if ( object instanceof THREE.ParticleSystem ) {

			this.intersectParticleSystem( object, intersects );

		} else if ( object instanceof THREE.Mesh ) {

			this.intersectMesh( object, intersects );

		}

		return intersects;

	},

	intersectObjects: function ( objects ) {

		var intersects = [];

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ] ) );

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	},

	// Canvas Particle
	intersectParticle: function ( object, intersects ) {

		var distance = this.distanceFromIntersection(
			this.origin,
			this.direction,
			object.matrixWorld.getPosition()
		);

		if ( distance > object.scale.x ) {

			return;

		}

		intersect = {

			distance: distance,
			point: object.position,
			face: null,
			object: object

		};

		intersects.push( intersect );
	},

	// WebGL Particle System
	intersectParticleSystem: function ( object, intersects ) {

		var vertices = object.geometry.vertices;
		var point, distance;

		for ( var i = 0; i < vertices.length; i ++ ) {

			point = vertices[ i ];
			distance = this.distanceFromIntersection(
				this.origin,
				this.direction,
				object.matrixWorld.multiplyVector3( point.clone() )
			);

			if ( distance > this.threshold ) {
				continue;
			}

			intersect = {

				distance: distance,
				point: point,
				face: null,
				object: object,
				vertex: i

			};

			intersects.push( intersect );
		}
	},

	intersectMesh: ( function () {

		var a = new THREE.Vector3();
		var b = new THREE.Vector3();
		var c = new THREE.Vector3();
		var d = new THREE.Vector3();

		var originCopy = new THREE.Vector3();
		var directionCopy = new THREE.Vector3();

		var vector = new THREE.Vector3();
		var normal = new THREE.Vector3();
		var intersectPoint = new THREE.Vector3();

		return function ( object, intersects ) {

			// Checking boundingSphere

			var distance = this.distanceFromIntersection(
				this.origin,
				this.direction,
				object.matrixWorld.getPosition()
			);

			var scale = THREE.Frustum.__v1.set(
				object.matrixWorld.getColumnX().length(),
				object.matrixWorld.getColumnY().length(),
				object.matrixWorld.getColumnZ().length()
			);

			if ( distance > object.geometry.boundingSphere.radius * Math.max( scale.x, Math.max( scale.y, scale.z ) ) ) {

				return intersects;

			}

			// Checking faces

			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				face = geometry.faces[ f ];

				originCopy.copy( this.origin );
				directionCopy.copy( this.direction );

				objMatrix = object.matrixWorld;

				// determine if ray intersects the plane of the face
				// note: this works regardless of the direction of the face normal

				vector = objMatrix.multiplyVector3( vector.copy( face.centroid ) ).subSelf( originCopy );
				normal = object.matrixRotationWorld.multiplyVector3( normal.copy( face.normal ) );
				dot = directionCopy.dot( normal );

				// bail if ray and plane are parallel

				if ( Math.abs( dot ) < this.precision ) continue;

				// calc distance to plane

				scalar = normal.dot( vector ) / dot;

				// if negative distance, then plane is behind ray

				if ( scalar < 0 ) continue;

				if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) {

					intersectPoint.add( originCopy, directionCopy.multiplyScalar( scalar ) );

					if ( face instanceof THREE.Face3 ) {

						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ] ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ] ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ] ) );

						if ( this.pointInFace3( intersectPoint, a, b, c ) ) {

							intersect = {

								distance: originCopy.distanceTo( intersectPoint ),
								point: intersectPoint.clone(),
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					} else if ( face instanceof THREE.Face4 ) {

						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ] ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ] ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ] ) );
						d = objMatrix.multiplyVector3( d.copy( vertices[ face.d ] ) );

						if ( this.pointInFace3( intersectPoint, a, b, d ) || this.pointInFace3( intersectPoint, b, c, d ) ) {

							intersect = {

								distance: originCopy.distanceTo( intersectPoint ),
								point: intersectPoint.clone(),
								face: face,
								object: object

							};

							intersects.push( intersect );

						}

					}

				}

			}

		};

	}())

};
