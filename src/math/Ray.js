/**
 * @author bhouston / http://exocortex.com
 */

THREE.Ray = function ( origin, direction ) {


	this.origin = origin !== undefined ? origin.clone() : new THREE.Vector3();
	this.direction = direction !== undefined ? direction.clone() : new THREE.Vector3();

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

	at: function( t ) {

		return this.direction.clone().multiplyScalar( t ).addSelf( this.origin );

	},

	recastSelf: function ( t ) {

		this.origin = this.at( t );

		return this;

	},

	recast: function ( t ) {

		return this.clone().recastSelf( t );

	},

	flip: function () {

		this.direction.negate();

		return this;
	},

	closestPointToPoint: function ( point ) {

		var result = point.clone().subSelf( this.origin );
		var directionDistance = result.dot( this.direction );

		return result.copy( this.direction ).multiplyScalar( directionDistance ).addSelf( this.origin );

	},

	distanceToPoint: function ( point ) {

		// NOTE: this creates a THREE.VEctor3 internally via closestPointToPoint
		// that is never returned, can be further GC optimized

		return this.closestPointToPoint( point ).distanceTo( point );

	},

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

	intersectPlane: function ( plane ) {

		var denominator = plane.normal.dot( this.direction );
		if ( denominator == 0 ) {

			// line is coplanar, return origin
			if( plane.distanceToPoint( this.origin ) == 0 ) {

				return this.origin.clone();

			}

			// Unsure if this is the correct method to handle this case.
			return undefined;

		}

		var t = - ( ( this.origin.dot( plane.normal ) ) + plane.constant ) / denominator;

		return this.at( t );

	},

	equals: function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	},

	clone: function () {

		return new THREE.Ray().copy( this );

	}

};

THREE.Ray.__v1 = new THREE.Vector3();
THREE.Ray.__v2 = new THREE.Vector3();