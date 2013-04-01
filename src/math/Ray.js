/**
 * @author bhouston / http://exocortex.com
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = ( origin !== undefined ) ? origin : new THREE.Vector3();
	this.direction = ( direction !== undefined ) ? direction : new THREE.Vector3();

};

THREE.Ray.prototype = {

	constructor: THREE.Ray,

	set: function ( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	},

	copy: function ( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	},

	at: function( t, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

	},

	recast: function() {

		var v1 = new THREE.Vector3();

		return function ( t ) {

			this.origin.copy( this.at( t, v1 ) );

			return this;

		};

	}(),

	closestPointToPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		result.subVectors( point, this.origin );
		var directionDistance = result.dot( this.direction );

		return result.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

	},

	distanceToPoint: function() {

		var v1 = new THREE.Vector3();

		return function ( point ) {

			var directionDistance = v1.subVectors( point, this.origin ).dot( this.direction );
			v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

			return v1.distanceTo( point );

		};

	}(),

	isIntersectionSphere: function( sphere ) {

		return ( this.distanceToPoint( sphere.center ) <= sphere.radius );

	},

	isIntersectionPlane: function ( plane ) {

		// check if the line and plane are non-perpendicular, if they
		// eventually they will intersect.
		var denominator = plane.normal.dot( this.direction );
		if ( denominator != 0 ) {

			return true;

		}

		// line is coplanar, return origin
		if( plane.distanceToPoint( this.origin ) == 0 ) {

			return true;

		}

		return false;

	},

	distanceToPlane: function ( plane ) {

		var denominator = plane.normal.dot( this.direction );
		if ( denominator == 0 ) {

			// line is coplanar, return origin
			if( plane.distanceToPoint( this.origin ) == 0 ) {

				return 0;

			}

			// Unsure if this is the correct method to handle this case.
			return undefined;

		}

		var t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		return t;

	},

	intersectPlane: function ( plane, optionalTarget ) {

		var t = this.distanceToPlane( plane );

		if ( t === undefined ) {

			return undefined;
		}

		return this.at( t, optionalTarget );

	},

	applyMatrix4: function ( matrix4 ) {

		this.direction.add( this.origin ).applyMatrix4( matrix4 );
		this.origin.applyMatrix4( matrix4 );
		this.direction.sub( this.origin );

		return this;
	},

	equals: function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	},

	clone: function () {

		return new THREE.Ray().copy( this );

	}

};
