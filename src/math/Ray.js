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

	distanceSqAndPointToSegment: function( v0, v1, optionalPointOnLine, optionalPointOnSegment ) {
		// from http://www.geometrictools.com/LibMathematics/Distance/Wm5DistLine3Segment3.cpp
		// It returns the min distance between the ray (actually... the line) and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest point on the ray (...line)
		// - The closest point on the segment
		var segCenter = v0.clone().add( v1 ).multiplyScalar( 0.5 );
		var segDir = v1.clone().sub( v0 ).normalize();
		var segExtent = v0.distanceTo( v1 ) *0.5;
		var diff = this.origin.clone().sub( segCenter );
		var a01 = -this.direction.dot( segDir );
		var b0 = diff.dot( this.direction );
		var c = diff.lengthSq();
		var det = Math.abs( 1 - a01 * a01 );
		var b1, s0, s1, sqrDist, extDet;
		if( det >= 0 ) {
			// The line and segment are not parallel.
			b1 = -diff.dot( segDir );
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;
			if( s1 >= -extDet ) {
				if( s1 <= extDet ) {
					// Two interior points are closest, one on the line and one
					// on the segment.
					var invDet = 1 / det;
					s0 = ( a01 * b1 - b0 ) * invDet;
					s1 *= invDet;
					sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;
				}
				else {
					// The endpoint e1 of the segment and an interior point of
					// the line are closest.
					s1 = segExtent;
					s0 = - ( a01 * s1 + b0 );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;
				}
			}
			else {
				// The end point e0 of the segment and an interior point of the
				// line are closest.
				s1 = - segExtent;
				s0 = - ( a01 * s1 + b0 );
				sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;
			}
		}
		else {
			// The line and segment are parallel.  Choose the closest pair so that
			// one point is at segment center.
			s1 = 0;
			s0 = - b0;
			sqrDist = b0 * s0 + c;
		}
		if(optionalPointOnLine)
			optionalPointOnLine.copy( this.direction.clone().multiplyScalar( s0 ).add( this.origin ) );
		if(optionalPointOnSegment)
			optionalPointOnSegment.copy( segDir.clone().multiplyScalar( s1 ).add( segCenter ) );
		return sqrDist;
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
