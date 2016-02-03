/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
 *
 * Some common of Curve methods
 * .getPoint(t), getTangent(t)
 * .getPointAt(u), getTagentAt(u)
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This following classes subclasses THREE.Curve:
 *
 * -- 2d classes --
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.CubicBezierCurve
 * THREE.SplineCurve
 * THREE.ArcCurve
 * THREE.EllipseCurve
 *
 * -- 3d classes --
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 * THREE.CubicBezierCurve3
 * THREE.SplineCurve3
 * THREE.ClosedSplineCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath
 *
 **/

/**************************************************************
 *	Abstract Curve base class
 **************************************************************/

THREE.Curve = function () {

};

THREE.Curve.prototype = {

	constructor: THREE.Curve,

	// Virtual base class method to overwrite and implement in subclasses
	//	- t [0 .. 1]

	getPoint: function ( t ) {

		console.warn( "THREE.Curve: Warning, getPoint() not implemented!" );
		return null;

	},

	// Get point at relative position in curve according to arc length
	// - u [0 .. 1]

	getPointAt: function ( u ) {

		var t = this.getUtoTmapping( u );
		return this.getPoint( t );

	},

	// Get sequence of points using getPoint( t )

	getPoints: function ( divisions ) {

		if ( ! divisions ) divisions = 5;

		var d, pts = [];

		for ( d = 0; d <= divisions; d ++ ) {

			pts.push( this.getPoint( d / divisions ) );

		}

		return pts;

	},

	// Get sequence of points using getPointAt( u )

	getSpacedPoints: function ( divisions ) {

		if ( ! divisions ) divisions = 5;

		var d, pts = [];

		for ( d = 0; d <= divisions; d ++ ) {

			pts.push( this.getPointAt( d / divisions ) );

		}

		return pts;

	},

	// Get total curve arc length

	getLength: function () {

		var lengths = this.getLengths();
		return lengths[ lengths.length - 1 ];

	},

	// Get list of cumulative segment lengths

	getLengths: function ( divisions ) {

		if ( ! divisions ) divisions = ( this.__arcLengthDivisions ) ? ( this.__arcLengthDivisions ) : 200;

		if ( this.cacheArcLengths
			&& ( this.cacheArcLengths.length === divisions + 1 )
			&& ! this.needsUpdate ) {

			//console.log( "cached", this.cacheArcLengths );
			return this.cacheArcLengths;

		}

		this.needsUpdate = false;

		var cache = [];
		var current, last = this.getPoint( 0 );
		var p, sum = 0;

		cache.push( 0 );

		for ( p = 1; p <= divisions; p ++ ) {

			current = this.getPoint ( p / divisions );
			sum += current.distanceTo( last );
			cache.push( sum );
			last = current;

		}

		this.cacheArcLengths = cache;

		return cache; // { sums: cache, sum:sum }; Sum is in the last element.

	},

	updateArcLengths: function() {

		this.needsUpdate = true;
		this.getLengths();

	},

	// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant

	getUtoTmapping: function ( u, distance ) {

		var arcLengths = this.getLengths();

		var i = 0, il = arcLengths.length;

		var targetArcLength; // The targeted u distance value to get

		if ( distance ) {

			targetArcLength = distance;

		} else {

			targetArcLength = u * arcLengths[ il - 1 ];

		}

		//var time = Date.now();

		// binary search for the index with largest value smaller than target u distance

		var low = 0, high = il - 1, comparison;

		while ( low <= high ) {

			i = Math.floor( low + ( high - low ) / 2 ); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

			comparison = arcLengths[ i ] - targetArcLength;

			if ( comparison < 0 ) {

				low = i + 1;

			} else if ( comparison > 0 ) {

				high = i - 1;

			} else {

				high = i;
				break;

				// DONE

			}

		}

		i = high;

		//console.log('b' , i, low, high, Date.now()- time);

		if ( arcLengths[ i ] === targetArcLength ) {

			var t = i / ( il - 1 );
			return t;

		}

		// we could get finer grain at lengths, or use simple interpolation between two points

		var lengthBefore = arcLengths[ i ];
		var lengthAfter = arcLengths[ i + 1 ];

		var segmentLength = lengthAfter - lengthBefore;

		// determine where we are between the 'before' and 'after' points

		var segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

		// add that fractional amount to t

		var t = ( i + segmentFraction ) / ( il - 1 );

		return t;

	},

	// Returns a unit vector tangent at t
	// In case any sub curve does not implement its tangent derivation,
	// 2 points a small delta apart will be used to find its gradient
	// which seems to give a reasonable approximation

	getTangent: function( t ) {

		var delta = 0.0001;
		var t1 = t - delta;
		var t2 = t + delta;

		// Capping in case of danger

		if ( t1 < 0 ) t1 = 0;
		if ( t2 > 1 ) t2 = 1;

		var pt1 = this.getPoint( t1 );
		var pt2 = this.getPoint( t2 );

		var vec = pt2.clone().sub( pt1 );
		return vec.normalize();

	},

	getTangentAt: function ( u ) {

		var t = this.getUtoTmapping( u );
		return this.getTangent( t );

	}

};

// TODO: Transformation for Curves?

/**************************************************************
 *	3D Curves
 **************************************************************/

// A Factory method for creating new curve subclasses

THREE.Curve.create = function ( constructor, getPointFunc ) {

	constructor.prototype = Object.create( THREE.Curve.prototype );
	constructor.prototype.constructor = constructor;
	constructor.prototype.getPoint = getPointFunc;

	return constructor;

};
