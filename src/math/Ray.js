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

	isIntersectionSphere: function( sphere ) {

		return ( this.distanceToPoint( sphere.center ) <= sphere.radius );

	},

	isIntersectionBox: function( box ) {

		// this is very slow, this is just an initial implementation
		return ( this.intersectBox( box ) !== undefined );

	},

	intersectBox: function( box ) {
		// based on intersects from ImathBoxAlgo from ILM's Imath library
		//
		// Intersect a ray, r, with a box, b, and compute the intersection
		// point, ip:
		//
		// isIntersectionBox() returns
		//     - true if the ray starts inside the box or if the
		//       ray starts outside and intersects the box
		//     - false if the ray starts outside the box and intersects it,
		//       but the intersection is behind the ray's origin.
		//     - false if the ray starts outside and does not intersect it
		//
		// The intersection point is
		//     - the ray's origin if the ray starts inside the box
		//     - a point on one of the faces of the box if the ray
		//       starts outside the box
		//     - undefined when intersect() returns false

		// No ray intersects an empty box
		if(  box.empty() ) {
			return false;
		}

		// The ray starts inside the box
		if(  box.containsPoint( this.origin ) ) {
			return this.origin;
		}

		// The ray starts outside the box.  Between one and three "frontfacing"
		// sides of the box are oriented towards the ray, and between one and
		// three "backfacing" sides are oriented away from the ray.
		// We intersect the ray with the planes that contain the sides of the
		// box, and compare the distances between ray's origin and the ray-plane
		// intersections.
		// The ray intersects the box if the most distant frontfacing intersection
		// is nearer than the nearest backfacing intersection.  If the ray does
		// intersect the box, then the most distant frontfacing ray-plane
		// intersection is the ray-box intersection.
		var TMAX = Infinity;
		var tFrontMax = -1;
		var tBackMin = TMAX;
		var t, d;
		var ip = new THREE.Vector3();

		// Minimum and maximum X sides.
		if( this.direction.x > 0 ) {
			if( this.origin.x > box.max.x ) {
			    return undefined;
			}

			d = box.max.x - this.origin.x;

			if( this.direction.x > 1 || d < TMAX * this.direction.x ) {
				t = d / this.direction.x;
				if( tBackMin > t) {
					tBackMin = t;
				}
			}

			if( this.origin.x <= box.min.x ) {

			    d = box.min.x - this.origin.x;
			    t = (this.direction.x > 1 || d < TMAX * this.direction.x)? d / this.direction.x: TMAX;

			    if( tFrontMax < t) {
					tFrontMax = t;

					ip.set(
						box.min.x,
						THREE.Math.clamp( this.origin.y + t * this.direction.y, box.min.y, box.max.y),
						THREE.Math.clamp( this.origin.z + t * this.direction.z, box.min.z, box.max.z) );
			    }
			}
		} else if( this.direction.x < 0 ) {
			if( this.origin.x < box.min.x ) {
				return undefined;
			}

			d = box.min.x - this.origin.x;

			if( this.direction.x < -1 || d > TMAX * this.direction.x ) {
			    t = d / this.direction.x;

			    if( tBackMin > t ) {
					tBackMin = t;
				}
			}

			if( this.origin.x >= box.max.x ) {
			    d = box.max.x - this.origin.x;
				t = (this.direction.x < -1 || d > TMAX * this.direction.x)? d / this.direction.x: TMAX;

				if( tFrontMax < t ) {
					tFrontMax = t;

					ip.set (
						box.max.x,
						THREE.Math.clamp( this.origin.y + t * this.direction.y, box.min.y, box.max.y),
						THREE.Math.clamp( this.origin.z + t * this.direction.z, box.min.z, box.max.z) );
				}
			}
		} else { // this.direction.x == 0

			if( this.origin.x < box.min.x || this.origin.x > box.max.x ) {
			    return undefined;
			}
		}

		// Minimum and maximum Y sides.
		if( this.direction.y > 0 ) {
			if( this.origin.y > box.max.y ) {
				return undefined;
			}

			d = box.max.y - this.origin.y;

			if( this.direction.y > 1 || d < TMAX * this.direction.y ) {
				t = d / this.direction.y;

				if( tBackMin > t) {
					tBackMin = t;
				}
			}

			if( this.origin.y <= box.min.y ) {
				d = box.min.y - this.origin.y;
				t = (this.direction.y > 1 || d < TMAX * this.direction.y)? d / this.direction.y: TMAX;

		    if( tFrontMax < t ) {
				tFrontMax = t;

				ip.set(
					THREE.Math.clamp( this.origin.x + t * this.direction.x, box.min.x, box.max.x),
					box.min.y,
					THREE.Math.clamp( this.origin.z + t * this.direction.z, box.min.z, box.max.z) );
				}
			}
		} else if( this.direction.y < 0 ) {
			if( this.origin.y < box.min.y ) {
				return undefined;
		    }

			d = box.min.y - this.origin.y;

			if( this.direction.y < -1 || d > TMAX * this.direction.y ) {
				t = d / this.direction.y;

				if( tBackMin > t ) {
					tBackMin = t;
				}
			}

			if( this.origin.y >= box.max.y ) {
			    d = box.max.y - this.origin.y;
			    t = (this.direction.y < -1 || d > TMAX * this.direction.y)? d / this.direction.y: TMAX;

			    if( tFrontMax < t) {
					tFrontMax = t;

					ip.set(
						THREE.Math.clamp( this.origin.x + t * this.direction.x, box.min.x, box.max.x),
						box.max.y,
						THREE.Math.clamp( this.origin.z + t * this.direction.z, box.min.z, box.max.z) );
				}
			}
		} else {	// this.direction.y == 0

			if( this.origin.y < box.min.y || this.origin.y > box.max.y) {
				return undefined;
		    }
		}

		// Minimum and maximum Z sides.
		if( this.direction.z > 0) {
			if( this.origin.z > box.max.z ) {
				return undefined;
			}

			d = box.max.z - this.origin.z;

			if(  this.direction.z > 1 || d < TMAX * this.direction.z ) {
			    t = d / this.direction.z;

			    if( tBackMin > t ) {
					tBackMin = t;
				}
			}

			if( this.origin.z <= box.min.z ) {
				d = box.min.z - this.origin.z;
				t = (this.direction.z > 1 || d < TMAX * this.direction.z)? d / this.direction.z: TMAX;

				if( tFrontMax < t ) {
					tFrontMax = t;

					ip.set(
						THREE.Math.clamp( this.origin.x + t * this.direction.x, box.min.x, box.max.x ),
						THREE.Math.clamp( this.origin.y + t * this.direction.y, box.min.y, box.max.y ),
						box.min.z );
			    }
			}
		} else if( this.direction.z < 0 ) {
			if( this.origin.z < box.min.z ) {
				return undefined;
		    }

			d = box.min.z - this.origin.z;

			if( this.direction.z < -1 || d > TMAX * this.direction.z ) {
				t = d / this.direction.z;

				if( tBackMin > t ) {
					tBackMin = t;
				}
			}

			if( this.origin.z >= box.max.z ) {
				d = box.max.z - this.origin.z;
				t = (this.direction.z < -1 || d > TMAX * this.direction.z)? d / this.direction.z: TMAX;

				if( tFrontMax < t ) {
					tFrontMax = t;

					ip.set(
						THREE.Math.clamp( this.origin.x + t * this.direction.x, box.min.x, box.max.x),
						THREE.Math.clamp( this.origin.y + t * this.direction.y, box.min.y, box.max.y),
						box.max.z );
				}
			}
		} else {	// this.direction.z == 0
			if( this.origin.z < box.min.z || this.origin.z > box.max.z ) {
				return undefined;
		    }
		}

		if( tFrontMax <= tBackMin ) {
			return ip;
		}

		return undefined;

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