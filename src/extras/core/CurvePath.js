import { Curve } from './Curve';
import { Vector3 } from '../../math/Vector3';
import { Geometry } from '../../core/Geometry';
import { LineCurve } from '../curves/LineCurve';

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 **/

/**************************************************************
 *	Curved Path - a curve path is simply a array of connected
 *  curves, but retains the api of a curve
 **************************************************************/

function CurvePath () {
	this.isCurvePath = true;

	this.curves = [];

	this.autoClose = false; // Automatically closes the path

};

CurvePath.prototype = Object.assign( Object.create( Curve.prototype ), {

	constructor: CurvePath,

	add: function ( curve ) {

		this.curves.push( curve );

	},

	closePath: function () {

		// Add a line curve if start and end of lines are not connected
		var startPoint = this.curves[ 0 ].getPoint( 0 );
		var endPoint = this.curves[ this.curves.length - 1 ].getPoint( 1 );

		if ( ! startPoint.equals( endPoint ) ) {

			this.curves.push( new LineCurve( endPoint, startPoint ) );

		}

	},

	// To get accurate point with reference to
	// entire path distance at time t,
	// following has to be done:

	// 1. Length of each sub path have to be known
	// 2. Locate and identify type of curve
	// 3. Get t for the curve
	// 4. Return curve.getPointAt(t')

	getPoint: function ( t ) {

		var d = t * this.getLength();
		var curveLengths = this.getCurveLengths();
		var i = 0;

		// To think about boundaries points.

		while ( i < curveLengths.length ) {

			if ( curveLengths[ i ] >= d ) {

				var diff = curveLengths[ i ] - d;
				var curve = this.curves[ i ];

				var segmentLength = curve.getLength();
				var u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

				return curve.getPointAt( u );

			}

			i ++;

		}

		return null;

		// loop where sum != 0, sum > d , sum+1 <d

	},

	// We cannot use the default THREE.Curve getPoint() with getLength() because in
	// THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
	// getPoint() depends on getLength

	getLength: function () {

		var lens = this.getCurveLengths();
		return lens[ lens.length - 1 ];

	},

	// cacheLengths must be recalculated.
	updateArcLengths: function () {

		this.needsUpdate = true;
		this.cacheLengths = null;
		this.getLengths();

	},

	// Compute lengths and cache them
	// We cannot overwrite getLengths() because UtoT mapping uses it.

	getCurveLengths: function () {

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

	},

	getSpacedPoints: function ( divisions ) {

		if ( ! divisions ) divisions = 40;

		var points = [];

		for ( var i = 0; i <= divisions; i ++ ) {

			points.push( this.getPoint( i / divisions ) );

		}

		if ( this.autoClose ) {

			points.push( points[ 0 ] );

		}

		return points;

	},

	getPoints: function ( divisions ) {

		divisions = divisions || 12;

		var points = [], last;

		for ( var i = 0, curves = this.curves; i < curves.length; i ++ ) {

			var curve = curves[ i ];
			var resolution = (curve && curve.isEllipseCurve) ? divisions * 2
				: (curve && curve.isLineCurve) ? 1
				: (curve && curve.isSplineCurve) ? divisions * curve.points.length
				: divisions;

			var pts = curve.getPoints( resolution );

			for ( var j = 0; j < pts.length; j++ ) {

				var point = pts[ j ];

				if ( last && last.equals( point ) ) continue; // ensures no consecutive points are duplicates

				points.push( point );
				last = point;

			}

		}

		if ( this.autoClose && points.length > 1 && !points[ points.length - 1 ].equals( points[ 0 ] ) ) {

			points.push( points[ 0 ] );

		}

		return points;

	},

	/**************************************************************
	 *	Create Geometries Helpers
	 **************************************************************/

	/// Generate geometry from path points (for Line or Points objects)

	createPointsGeometry: function ( divisions ) {

		var pts = this.getPoints( divisions );
		return this.createGeometry( pts );

	},

	// Generate geometry from equidistant sampling along the path

	createSpacedPointsGeometry: function ( divisions ) {

		var pts = this.getSpacedPoints( divisions );
		return this.createGeometry( pts );

	},

	createGeometry: function ( points ) {

		var geometry = new Geometry();

		for ( var i = 0, l = points.length; i < l; i ++ ) {

			var point = points[ i ];
			geometry.vertices.push( new Vector3( point.x, point.y, point.z || 0 ) );

		}

		return geometry;

	}

} );


export { CurvePath };