/**
 * Curved Path - a curve path is simply a array of connected
 * curves, but retains the api of a curve
 *
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

module.exports = CurvePath;

var Curve = require( "./Curve" ),
	LineCurve = require( "../curves/LineCurve" ),
	Geometry = require( "../../core/Geometry" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function CurvePath() {

	Curve.call( this );

	this.curves = [];
	this.bends = [];

	this.autoClose = false; // Automatically closes the path

}

CurvePath.prototype = Object.create( Curve.prototype );
CurvePath.prototype.constructor = CurvePath;

CurvePath.prototype.add = function ( curve ) {

	this.curves.push( curve );

};

CurvePath.prototype.checkConnection = function () {

	// TODO
	// If the ending of curve is not connected to the starting
	// or the next curve, then, this is not a real path

};

CurvePath.prototype.closePath = function () {

	// TODO Test
	// and verify for vector3 (needs to implement equals)
	// Add a line curve if start and end of lines are not connected
	var startPoint = this.curves[ 0 ].getPoint( 0 );
	var endPoint = this.curves[ this.curves.length - 1 ].getPoint( 1 );

	if ( ! startPoint.equals( endPoint ) ) {

		this.curves.push( new LineCurve( endPoint, startPoint ) );

	}

};

/**
 * To get accurate point with reference to
 * entire path distance at time t,
 * following has to be done:
 *
 * 1. Length of each sub path have to be known
 * 2. Locate and identify type of curve
 * 3. Get t for the curve
 * 4. Return curve.getPointAt(t')
 */

CurvePath.prototype.getPoint = function ( t ) {

	var d = t * this.getLength();
	var curveLengths = this.getCurveLengths();
	var i = 0, diff, curve;

	// To think about boundaries points.

	while ( i < curveLengths.length ) {

		if ( curveLengths[ i ] >= d ) {

			diff = curveLengths[ i ] - d;
			curve = this.curves[ i ];

			var u = 1 - diff / curve.getLength();

			return curve.getPointAt( u );

		}

		i ++;

	}

	return null;

	// loop where sum != 0, sum > d , sum+1 <d

};

/*
CurvePath.prototype.getTangent = function ( t ) {
};*/


/**
 * We cannot use the default Curve getPoint() with getLength() because in
 * Curve, getLength() depends on getPoint() but in CurvePath
 * getPoint() depends on getLength
 */

CurvePath.prototype.getLength = function () {

	var lens = this.getCurveLengths();
	return lens[ lens.length - 1 ];

};

// Compute lengths and cache them
// We cannot overwrite getLengths() because UtoT mapping uses it.

CurvePath.prototype.getCurveLengths = function () {

	// We use cache values if curves and cache array are same length

	if ( this.cacheLengths && this.cacheLengths.length === this.curves.length ) {

		return this.cacheLengths;

	}

	// Get length of sub-curve
	// Push sums into cached array

	var lengths = [], sums = 0;
	var i, il = this.curves.length;

	for ( i = 0; i < il; i ++ ) {

		sums += this.curves[ i ].getLength();
		lengths.push( sums );

	}

	this.cacheLengths = lengths;

	return lengths;

};



// Returns min and max coordinates

CurvePath.prototype.getBoundingBox = function () {

	var points = this.getPoints();

	var maxX, maxY, maxZ;
	var minX, minY, minZ;

	maxX = maxY = Number.NEGATIVE_INFINITY;
	minX = minY = Number.POSITIVE_INFINITY;

	var p, i, il, sum;

	var v3 = points[ 0 ] instanceof Vector3;

	sum = v3 ? new Vector3() : new Vector2();

	for ( i = 0, il = points.length; i < il; i ++ ) {

		p = points[ i ];

		if ( p.x > maxX ) { maxX = p.x; }
		else if ( p.x < minX ) { minX = p.x; }

		if ( p.y > maxY ) { maxY = p.y; }
		else if ( p.y < minY ) { minY = p.y; }

		if ( v3 ) {

			if ( p.z > maxZ ) { maxZ = p.z; }
			else if ( p.z < minZ ) { minZ = p.z; }

		}

		sum.add( p );

	}

	var ret = {

		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY

	};

	if ( v3 ) {

		ret.maxZ = maxZ;
		ret.minZ = minZ;

	}

	return ret;

};

/* Create Geometries Helpers */

// Generate geometry from path points (for Line or Points objects)

CurvePath.prototype.createPointsGeometry = function ( divisions ) {

	var pts = this.getPoints( divisions, true );
	return this.createGeometry( pts );

};

// Generate geometry from equidistant sampling along the path

CurvePath.prototype.createSpacedPointsGeometry = function ( divisions ) {

	var pts = this.getSpacedPoints( divisions, true );
	return this.createGeometry( pts );

};

CurvePath.prototype.createGeometry = function ( points ) {

	var geometry = new Geometry();

	for ( var i = 0; i < points.length; i ++ ) {

		geometry.vertices.push( new Vector3( points[ i ].x, points[ i ].y, points[ i ].z || 0 ) );

	}

	return geometry;

};


/* Bend / Wrap Helper Methods */

// Wrap path / Bend modifiers?

CurvePath.prototype.addWrapPath = function ( bendpath ) {

	this.bends.push( bendpath );

};

CurvePath.prototype.getTransformedPoints = function ( segments, bends ) {

	var oldPts = this.getPoints( segments ); // getPoints getSpacedPoints
	var i, il;

	if ( ! bends ) {

		bends = this.bends;

	}

	for ( i = 0, il = bends.length; i < il; i ++ ) {

		oldPts = this.getWrapPoints( oldPts, bends[ i ] );

	}

	return oldPts;

};

CurvePath.prototype.getTransformedSpacedPoints = function ( segments, bends ) {

	var oldPts = this.getSpacedPoints( segments );

	var i, il;

	if ( ! bends ) {

		bends = this.bends;

	}

	for ( i = 0, il = bends.length; i < il; i ++ ) {

		oldPts = this.getWrapPoints( oldPts, bends[ i ] );

	}

	return oldPts;

};

// This returns getPoints() bend/wrapped around the contour of a path.
// Read http://www.planetclegg.com/projects/WarpingTextToSplines.html

CurvePath.prototype.getWrapPoints = function ( oldPts, path ) {

	var bounds = this.getBoundingBox();

	var i, il, p, oldX, oldY, xNorm;

	for ( i = 0, il = oldPts.length; i < il; i ++ ) {

		p = oldPts[ i ];

		oldX = p.x;
		oldY = p.y;

		xNorm = oldX / bounds.maxX;

		// If using actual distance, for length > path, requires line extrusions
		//xNorm = path.getUtoTmapping(xNorm, oldX); // 3 styles. 1) wrap stretched. 2) wrap stretch by arc length 3) warp by actual distance

		xNorm = path.getUtoTmapping( xNorm, oldX );

		// check for out of bounds?

		var pathPt = path.getPoint( xNorm );
		var normal = path.getTangent( xNorm );
		normal.set( - normal.y, normal.x ).multiplyScalar( oldY );

		p.x = pathPt.x + normal.x;
		p.y = pathPt.y + normal.y;

	}

	return oldPts;

};

