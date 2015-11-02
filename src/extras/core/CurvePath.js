/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 **/

/**************************************************************
 *	Curved Path - a curve path is simply a array of connected
 *  curves, but retains the api of a curve
 **************************************************************/

THREE.CurvePath = function () {

	this.curves = [];

	this.autoClose = false; // Automatically closes the path

};

THREE.CurvePath.prototype = Object.create( THREE.Curve.prototype );
THREE.CurvePath.prototype.constructor = THREE.CurvePath;

THREE.CurvePath.prototype.add = function ( curve ) {

	this.curves.push( curve );

};

/*
THREE.CurvePath.prototype.checkConnection = function() {
	// TODO
	// If the ending of curve is not connected to the starting
	// or the next curve, then, this is not a real path
};
*/

THREE.CurvePath.prototype.closePath = function() {

	// TODO Test
	// and verify for vector3 (needs to implement equals)
	// Add a line curve if start and end of lines are not connected
	var startPoint = this.curves[ 0 ].getPoint( 0 );
	var endPoint = this.curves[ this.curves.length - 1 ].getPoint( 1 );

	if ( ! startPoint.equals( endPoint ) ) {

		this.curves.push( new THREE.LineCurve( endPoint, startPoint ) );

	}

};

// To get accurate point with reference to
// entire path distance at time t,
// following has to be done:

// 1. Length of each sub path have to be known
// 2. Locate and identify type of curve
// 3. Get t for the curve
// 4. Return curve.getPointAt(t')

THREE.CurvePath.prototype.getPoint = function( t ) {

	var d = t * this.getLength();
	var curveLengths = this.getCurveLengths();
	var i = 0;

	// To think about boundaries points.

	while ( i < curveLengths.length ) {

		if ( curveLengths[ i ] >= d ) {

			var diff = curveLengths[ i ] - d;
			var curve = this.curves[ i ];

			var u = 1 - diff / curve.getLength();

			return curve.getPointAt( u );

		}

		i ++;

	}

	return null;

	// loop where sum != 0, sum > d , sum+1 <d

};

/*
THREE.CurvePath.prototype.getTangent = function( t ) {
};
*/

// We cannot use the default THREE.Curve getPoint() with getLength() because in
// THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
// getPoint() depends on getLength

THREE.CurvePath.prototype.getLength = function() {

	var lens = this.getCurveLengths();
	return lens[ lens.length - 1 ];

};

// Compute lengths and cache them
// We cannot overwrite getLengths() because UtoT mapping uses it.

THREE.CurvePath.prototype.getCurveLengths = function() {

	// We use cache values if curves and cache array are same length

	if ( this.cacheLengths && this.cacheLengths.length === this.curves.length ) {

		return this.cacheLengths;

	}

	// Get length of sub-curve
	// Push sums into cached array

	var lengths = [], sums = 0;

	for ( var i = 0, l = this.curves.length; i < l; i ++ ) {

		sums += this.curves[ i ].getLength();
		lengths.push( sums );

	}

	this.cacheLengths = lengths;

	return lengths;

};



/**************************************************************
 *	Create Geometries Helpers
 **************************************************************/

/// Generate geometry from path points (for Line or Points objects)

THREE.CurvePath.prototype.createPointsGeometry = function( divisions ) {

	var pts = this.getPoints( divisions, true );
	return this.createGeometry( pts );

};

// Generate geometry from equidistant sampling along the path

THREE.CurvePath.prototype.createSpacedPointsGeometry = function( divisions ) {

	var pts = this.getSpacedPoints( divisions, true );
	return this.createGeometry( pts );

};

THREE.CurvePath.prototype.createGeometry = function( points ) {

	var geometry = new THREE.Geometry();

	for ( var i = 0, l = points.length; i < l; i ++ ) {

		var point = points[ i ];
		geometry.vertices.push( new THREE.Vector3( point.x, point.y, point.z || 0 ) );

	}

	return geometry;

};
