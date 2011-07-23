/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
 *
 * This file contains following classes:
 *
 * THREE.Curve
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.CubicBezierCurve
 * THREE.SplineCurve
 * THREE.ArcCurve
 *
 **/

/**************************************************************
 *	Abstract Curve base class
 **************************************************************/

THREE.Curve = function() {

};

// Virtual base class method to overwrite and implement in subclasses
//	- t [0 .. 1]

THREE.Curve.prototype.getPoint = function ( t ) {

	console.log( "Warning, getPoint() not implemented!" );
	return null;

};

// Get point at relative position in curve according to arc length
// - u [0 .. 1]

THREE.Curve.prototype.getPointAt = function ( u ) {

	var t = this.getUtoTmapping( u );
	return this.getPoint( t );

};

// Get sequence of points using getPoint( t )

THREE.Curve.prototype.getPoints = function ( divisions ) {

	if ( !divisions ) divisions = 5;

	var d, pts = [];

	for ( d = 0; d <= divisions; d ++ ) {

		pts.push( this.getPoint( d / divisions ) );

	};

	return pts;

};

// Get sequence of points using getPointAt( u )

THREE.Curve.prototype.getSpacedPoints = function ( divisions ) {

	if ( !divisions ) divisions = 5;

	var d, pts = [];

	for ( d = 0; d <= divisions; d ++ ) {

		pts.push( this.getPointAt( d / divisions ) );

	};

	return pts;

};

// Get total curve length

THREE.Curve.prototype.getLength = function () {

	var lengths = this.getLengths();
	return lengths[ lengths.length - 1 ];

};

// Get list of cumulative segment lengths

THREE.Curve.prototype.getLengths = function( divisions ) {

	if ( !divisions ) divisions = 200;

	if ( this.cacheLengths && ( this.cacheLengths.length == divisions ) ) {

		//console.log( "cached", this.cacheLengths );
		return this.cacheLengths;

	}

	var cache = [];
	var current, last = this.getPoint( 0 );
	var p, sum = 0;

	for ( p = 1; p <= divisions; p++ ) {

		current = this.getPoint ( p / divisions );
		sum += current.distanceTo( last );
		cache.push( sum );
		last = current;

	}

	this.cacheLengths = cache;
	return cache; // { sums: cache, sum:sum }; Sum is in the last element.

};

// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equi distance

THREE.Curve.prototype.getUtoTmapping = function( u, distance ) {

	var lengths = this.getLengths();
	var i = 0, il = lengths.length;

	var distanceForU;

	if ( distance ) {

		distanceForU = distance;

	} else {

		distanceForU = u * lengths[ il - 1 ];

	}

	// TODO Should do binary search + sub division + interpolation when needed

	while ( i < il ) {

		if ( lengths[ i ] > distanceForU ) break;

		i++;

	}

	var t = i / il;
	return t;

};


/**************************************************************
 *	Line
 **************************************************************/

THREE.LineCurve = function ( x1, y1, x2, y2 ) {

	this.x1 = x1;
	this.y1 = y1;

	this.x2 = x2;
	this.y2 = y2;

};

THREE.LineCurve.prototype = new THREE.Curve();
THREE.LineCurve.prototype.constructor = THREE.LineCurve;

THREE.LineCurve.prototype.getPoint = function ( t ) {

	var dx = this.x2 - this.x1;
	var dy = this.y2 - this.y1;

	var tx = this.x1 + dx * t;
	var ty = this.y1 + dy * t;

	return new THREE.Vector2( tx, ty );

};

/**************************************************************
 *	Quadratic Bezier curve
 **************************************************************/

THREE.QuadraticBezierCurve = function ( x0, y0, x1, y1, x2, y2 ) {

	this.x0 = x0;
	this.y0 = y0;

	this.x1 = x1;
	this.y1 = y1;

	this.x2 = x2;
	this.y2 = y2;

};

THREE.QuadraticBezierCurve.prototype = new THREE.Curve();
THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve;


THREE.QuadraticBezierCurve.prototype.getPoint = function ( t ) {

	var tx, ty;

	tx = THREE.FontUtils.b2( t, this.x0, this.x1, this.x2 );
	ty = THREE.FontUtils.b2( t, this.y0, this.y1, this.y2 );

	return new THREE.Vector2( tx, ty );

};


THREE.QuadraticBezierCurve.prototype.getNormalVector = function( t ) {

	// iterate sub segments
	// 	get lengths for sub segments
	// 	if segment is bezier
	//		perform subdivisions or perform integrals

	var x0, y0, x1, y1, x2, y2;

	x0 = this.actions[ 0 ].args[ 0 ];
	y0 = this.actions[ 0 ].args[ 1 ];

	x1 = this.actions[ 1 ].args[ 0 ];
	y1 = this.actions[ 1 ].args[ 1 ];

	x2 = this.actions[ 1 ].args[ 2 ];
	y2 = this.actions[ 1 ].args[ 3 ];

	var tx, ty;

	tx = THREE.Curve.Utils.tangentQuadraticBezier( t, this.x0, this.x1, this.x2 );
	ty = THREE.Curve.Utils.tangentQuadraticBezier( t, this.y0, this.y1, this.y2 );

	// return normal unit vector
	return new THREE.Vector2( -ty , tx ).unit();

};


/**************************************************************
 *	Cubic Bezier curve
 **************************************************************/

THREE.CubicBezierCurve = function ( x0, y0, x1, y1, x2, y2, x3, y3 ) {

	this.x0 = x0;
	this.y0 = y0;

	this.x1 = x1;
	this.y1 = y1;

	this.x2 = x2;
	this.y2 = y2;

	this.x3 = x3;
	this.y3 = y3;

};

THREE.CubicBezierCurve.prototype = new THREE.Curve();
THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve;

THREE.CubicBezierCurve.prototype.getPoint = function ( t ) {

	var tx, ty;

	tx = THREE.FontUtils.b3( t, this.x0, this.x1, this.x2, this.x3 );
	ty = THREE.FontUtils.b3( t, this.y0, this.y1, this.y2, this.y3 );

	return new THREE.Vector2( tx, ty );

};

/**************************************************************
 *	Spline curve
 **************************************************************/

THREE.SplineCurve = function ( points /* array of Vector2*/ ) {

	this.points = points;

};

THREE.SplineCurve.prototype = new THREE.Curve();
THREE.SplineCurve.prototype.constructor = THREE.SplineCurve;

THREE.SplineCurve.prototype.getPoint = function ( t ) {

	var v = new THREE.Vector2();
	var c = [];
	var points = this.points, point, intPoint, weight;
	point = ( points.length - 1 ) * t;

	intPoint = Math.floor( point );
	weight = point - intPoint;

	c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
	c[ 1 ] = intPoint;
	c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
	c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

	v.x = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].x, points[ c[ 1 ] ].x, points[ c[ 2 ] ].x, points[ c[ 3 ] ].x, weight );
	v.y = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].y, points[ c[ 1 ] ].y, points[ c[ 2 ] ].y, points[ c[ 3 ] ].y, weight );

	return v;

};

/**************************************************************
 *	Arc curve
 **************************************************************/

THREE.ArcCurve = function ( aX, aY, aRadius,
							aStartAngle, aEndAngle, aClockwise ) {
	this.aX = aX;
	this.aY = aY;

	this.aRadius = aRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;

};

THREE.ArcCurve.prototype = new THREE.Curve();
THREE.ArcCurve.prototype.constructor = THREE.ArcCurve;

THREE.ArcCurve.prototype.getPoint = function ( t ) {

	var deltaAngle = this.aEndAngle - this.aStartAngle;

	if ( !this.aClockwise ) {

		t = 1 - t;

	}

	var angle = this.aStartAngle + t * deltaAngle;

	var tx = this.aX + this.aRadius * Math.cos( angle );
	var ty = this.aY + this.aRadius * Math.sin( angle );

	return new THREE.Vector2( tx, ty );

};

/**************************************************************
 *	Utils
 **************************************************************/

THREE.Curve.Utils = {

	tangentQuadraticBezier: function ( t, p0, p1, p2 ) {

		return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 );

	},

	tangentSpline: function ( t, p0, p1, p2, p3 ) {

		// To check if my formulas are correct

		var h00 = 6 * t * t - 6 * t; 	// derived from 2t^3 − 3t^2 + 1
		var h10 = 3 * t * t - 4 * t + 1; // t^3 − 2t^2 + t
		var h01 = -6 * t * t + 6 * t; 	// − 2t3 + 3t2
		var h11 = 3 * t * t - 2 * t;	// t3 − t2

	},

	// Catmull-Rom

	interpolate: function( p0, p1, p2, p3, t ) {

		var v0 = ( p2 - p0 ) * 0.5;
		var v1 = ( p3 - p1 ) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	}

};




/*
getPoint DONE
getLength DONE
getLengths DONE

curve.getPoints(); DONE
curve.getPointAtArcLength(t); DONE
curve.transform(params);
curve.getTangentAt(t)
*/

/**************************************************************
 *	3D Curves
 **************************************************************/


// A Factory Method for creating new curve subclasses
THREE.Curve.create = function(constructor, getpointfunc) {
    
    var subClass = constructor;
    subClass.prototype = new THREE.Curve();
    subClass.prototype.constructor = constructor;
    subClass.prototype.getPoint = getpointfunc;
    return subClass;
    
};



/**************************************************************
 *	Line3D
 **************************************************************/


THREE.LineCurve3 = THREE.Curve.create(
	
	function ( x1, y1, z1, x2, y2, z2 ) {

		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;

		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;

	},
	
	function ( t ) {

		var dx = this.x2 - this.x1;
		var dy = this.y2 - this.y1;
		var dz = this.z2 - this.z1;
		
		var tx = this.x1 + dx * t;
		var ty = this.y1 + dy * t;
		var tz = this.z1 + dz * t;

		return new THREE.Vector3( tx, ty, tz );

	}
);


/**************************************************************
 *	Quadratic Bezier 3D curve
 **************************************************************/

THREE.QuadraticBezierCurve3 = THREE.Curve.create(
	function ( x0, y0, z0,
			x1, y1, z1,
			x2, y2, z2 ) { // Qn should we use 2 Vector3 instead?

		this.x0 = x0;
		this.y0 = y0;
		this.z0 = z0;

		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;

		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;

	},
	
	function ( t ) {

		var tx, ty, tz;

		tx = THREE.FontUtils.b2( t, this.x0, this.x1, this.x2 );
		ty = THREE.FontUtils.b2( t, this.y0, this.y1, this.y2 );
		tz = THREE.FontUtils.b2( t, this.z0, this.z1, this.z2 );

		return new THREE.Vector2( tx, ty, tz );

	}
);