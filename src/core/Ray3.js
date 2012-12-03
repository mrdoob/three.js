/**
 * @author bhouston / http://exocortex.com
 */

THREE.Ray3 = function ( origin, direction ) {


	if ( origin === undefined && direction === undefined ) {

		this.origin = new THREE.Vector3();
		this.direction = new THREE.Vector3( 0, 0, 0 );

	} else {

		this.origin = origin.clone();
		this.direction = direction.clone();

	}

};

THREE.Ray3.prototype = {

	constructor: THREE.Ray3,

	set: function ( origin, direction) {

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

	recast: function ( t ) {

		return new THREE.Ray3( this.at( t ), this.direction );

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

	closestPointToRay: function ( ray ) {

		// Assumes the lines are normalized
		// based on algorithm in ILM's Imath Plane class.

	    __v1.copy( this.origin ).subSelf( ray.origin );
	    var c = this.direction.dot( __v1 );
	    var a = ray.direction.dot( this.direction );
	    var f = ray.direction.dot( __v1 );
	    var num = c - a * f;
	    var denom = a*a - 1;

	    var absDenom = ( ( denom >= 0 ) ? denom: -denom );

	    if ( absDenom < 1 )
	    {
			var absNum = ( ( num >= 0 ) ? num: -num );

			if (absNum >= absDenom * Number.MAX_VALUE ) {
				return this.origin.clone();
		    }
	    }

	    return this.direction.clone().multipleScalar( num / denom ).addSelf( this.origin );

	},

	distanceToRay: function ( ray ) {

		__v1.copy( this.direction ).crossSelf( ray.direction );
		__v2.copy( ray.origin ).subSelf( this.origin );

		var d = __v1.dot( __v2 );
		if( d >= 0 ) {
			return d;
		}
		return -1;

	},

	isIntersectionPlane: function ( plane ) {

		return ( plane.normal.dot( this.direction ) != 0 );

	},

	intersectPlane: function ( plane ) {

		var a = plane.normal.dot( this.direction );
		if ( a == 0.0 ) {

			// Unsure if this is the correct method to handle this case.
			return undefined;

		}

		var t = - ( ( this.origin ^ plane.normal ) - plane.constant ) / a;
		return this.at( t );

	},

	equals: function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	},

	clone: function () {

		return new THREE.Ray3().copy( this );

	}

};

THREE.Ray3.__v1 = new THREE.Vector3();
THREE.Ray3.__v2 = new THREE.Vector3();