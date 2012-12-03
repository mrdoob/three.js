/**
 * @author bhouston / http://exocortex.com
 */

THREE.Ray = function ( origin, direction ) {


	if ( origin === undefined && direction === undefined ) {

		this.origin = new THREE.Vector3();
		this.direction = new THREE.Vector3( 0, 0, 0 );

	} else {

		this.origin = origin.clone();
		this.direction = direction.clone();

	}

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

	/*
	// Commented out because this does not handle the case of non-intersecting
	// perpendicular lines
	closestPointToRay: function ( ray ) {

		// Assumes the lines are normalized
		// based on algorithm in ILM's Imath Plane class.

	    THREE.Ray.__v1.copy( this.origin ).subSelf( ray.origin );
	    var c = this.direction.dot( THREE.Ray.__v1 );
	    var a = ray.direction.dot( this.direction );
	    var f = ray.direction.dot( THREE.Ray.__v1 );
	    var num = c - a * f;
	    var denom = a*a - 1;

	    var absDenom = ( ( denom >= 0 ) ? denom: -denom );

	    if ( absDenom < 1 )
	    {
			var absNum = ( ( num >= 0 ) ? num: -num );

			if (absNum >= absDenom * Number.MAX_VALUE ) {

				// Unsure if this is the correct method to handle this case.
				return this.origin.clone();

		    }
	    }

	    return this.direction.clone().multiplyScalar( num / denom ).addSelf( this.origin );

	},
	*/

	/*
	// Commented out because this does not handle the case of non-intersecting
	// perpendicular lines
	distanceToRay: function ( ray ) {		

		THREE.Ray.__v1.copy( this.direction ).crossSelf( ray.direction );
		THREE.Ray.__v2.copy( ray.origin ).subSelf( this.origin );


		var d = THREE.Ray.__v1.dot( THREE.Ray.__v2 );
		if( d >= 0 ) {

			return d;

		} else {

			// Unsure if this is the correct method to handle this case.
			return -1;

		}
	},*/

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