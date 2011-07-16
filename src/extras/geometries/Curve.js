/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible Curve Object
 *
 **/

THREE.Curve = function() {
	
};

/* Basic function to overwrite and implement */
THREE.Curve.prototype.getPoint = function ( t /* between 0 .. 1 */) {
	console.log("Warning, getPoint() not implemented!");
	return null;
};

/* getPointAt returns as a porportion of arc length instead of formula */
THREE.Curve.prototype.getPointAt = function ( u /* between 0 .. 1 */) {
	var t = this.getUtoTmapping(u);
	return this.getPoint(t);
};

/* Get Points using getPoint(t) */
THREE.Curve.prototype.getPoints = function (divisions) {
	if (!divisions) divisions = 5;
	var d, pts = [];
	for (d=0;d<=divisions;d++) {
		pts.push(this.getPoint(d/divisions));
	};
	return pts;
};

/* Get Points using getPointAt(u) */
THREE.Curve.prototype.getSpacedPoints = function (divisions) {
	if (!divisions) divisions = 5;
	var d, pts = [];
	for (d=0;d<=divisions;d++) {
		pts.push(this.getPointAt(d/divisions));
	};
	return pts;
};

THREE.Curve.prototype.getLength = function () {
	var lengths = this.getLengths();
	return lengths[lengths.length-1];
};

THREE.Curve.prototype.getLengths = function(divisions) {
	if (!divisions) divisions = 200;
	
	if (this.cacheLengths && (this.cacheLengths.length==divisions)) {
		//console.log("catched",this.cacheLengths);
		return this.cacheLengths;
	}
	
	var cache = [];
	var p=1;
	var last = this.getPoint(0), current;
	var sum = 0;
	
	for (; p <= divisions; p++) {
		current = this.getPoint (p/divisions);
		sum += current.distanceTo(last);
		cache.push(sum);
		last = current;
	}
	
	this.cacheLengths = cache;
	return cache; //{sums: cache, sum:sum}; Sum is in the last element.
};

/* Given u (0..1), get a t to find p. This gives you pt which are equi distance */

THREE.Curve.prototype.getUtoTmapping = function(u, distance) {
	
	var lengths = this.getLengths(); 
	var i = 0,il = lengths.length;
	
	var distanceForU;
	if (distance) {
		distanceForU = distance;
	} else {
		 distanceForU = u * lengths[il-1];
	}
	
	// TODO Should do binary search + sub division + interpolation when needed
	while (i<il) {
		if (lengths[i]>distanceForU) break;
		i++;
	}
	
	var t= i/il;
	return t;
	
};



THREE.StraightCurve = function (x1, y1, x2, y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
};

THREE.StraightCurve.prototype = new THREE.Curve();
THREE.StraightCurve.prototype.constructor = THREE.StraightCurve;

/* Basic function to overwrite and implement */
THREE.StraightCurve.prototype.getPoint = function ( t /* between 0 .. 1 */) {
	var dx = this.x2 - this.x1;
	var dy = this.y2 - this.y1;
	var tx = this.x1 + dx * t;
	var ty = this.y1 + dy * t;

	return new THREE.Vector2( tx, ty );
};

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

/* Basic function to overwrite and implement */
THREE.QuadraticBezierCurve.prototype.getPoint = function ( t /* between 0 .. 1 */) {
	var tx, ty;

	tx = THREE.FontUtils.b2( t, this.x0, this.x1, this.x2 );
	ty = THREE.FontUtils.b2( t, this.y0, this.y1, this.y2 );

	return new THREE.Vector2( tx, ty );
};


THREE.QuadraticBezierCurve.prototype.getNormalVector = function(t) {
	// iterate sub segments
	// 	get lengths for sub segments
	// 	if segment is bezier
	//		perform sub devisions or perform integrals.
	var x0, y0, x1, y1, x2, y2;
	x0 = this.actions[0].args[0];
	y0 = this.actions[0].args[1];
	x1 = this.actions[1].args[0];
	y1 = this.actions[1].args[1];
	x2 = this.actions[1].args[2];
	y2 = this.actions[1].args[3];
	
	var tx, ty;
	
	tx = THREE.Curve.Utils.tangentQuadraticBezier( t, this.x0, this.x1, this.x2 );
	ty = THREE.Curve.Utils.tangentQuadraticBezier( t, this.y0, this.y1, this.y2 );
	
	// return normal unit vector
	return new THREE.Vector2( -ty , tx ).unit();
	
};


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

/* Basic function to overwrite and implement */
THREE.CubicBezierCurve.prototype.getPoint = function ( t /* between 0 .. 1 */) {
	var tx, ty;

	tx = THREE.FontUtils.b3( t, this.x0, this.x1, this.x2, this.x3 );
	ty = THREE.FontUtils.b3( t, this.y0, this.y1, this.y2, this.y3 );

	return new THREE.Vector2( tx, ty );
};

THREE.SplineCurve = function ( points ) {
	this.points = points;
};

THREE.SplineCurve.prototype = new THREE.Curve();
THREE.SplineCurve.prototype.constructor = THREE.SplineCurve;



/* Basic function to overwrite and implement */
THREE.SplineCurve.prototype.getPoint = function ( t /* between 0 .. 1 */) {
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

}



THREE.ArcCurve = function ( aX, aY, aRadius,
                                 aStartAngle, aEndAngle, aClockwise ) {
	this.aX = aX;
	this.aY = aY;
	this.aRadius = aRadius;
	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;
	this.aClockwise;
};

THREE.ArcCurve.prototype = new THREE.Curve();
THREE.ArcCurve.prototype.constructor = THREE.ArcCurve;



/* Basic function to overwrite and implement */
THREE.ArcCurve.prototype.getPoint = function ( t /* between 0 .. 1 */) {
			
	var deltaAngle = this.aEndAngle - this.aStartAngle;
	if (this.aClockwise) {
		t = 1 - t;
	}
	var angle = this.aStartAngle + t * deltaAngle;

	var tx = this.aX + this.aRadius * Math.cos(angle);
	var ty = this.aY + this.aRadius * Math.sin(angle);

	return new THREE.Vector2( tx, ty );
	
}




THREE.Curve.Utils = {
	tangentQuadraticBezier: function (t, p0, p1, p2 ) {
		return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 ) ;
	},
	
	tangentSpline: function (t, p0, p1, p2, p3) {
		// To check if my formulas are correct
		var h00 = 6 * t * t - 6 * t; // derived from 2t^3 − 3t^2 + 1
		var h10 = 3 * t * t - 4 * t + 1; // t^3 − 2t^2 + t
		var h01 = -6 * t * t + 6 * t; // − 2t3 + 3t2
		var h11 = 3 * t * t - 2 * t;// t3 − t2
		
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