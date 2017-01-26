/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 **/

import { CubicBezierCurve } from '../curves/CubicBezierCurve';
import { CurvePath } from './CurvePath';
import { EllipseCurve } from '../curves/EllipseCurve';
import { LineCurve } from '../curves/LineCurve';
import { QuadraticBezierCurve } from '../curves/QuadraticBezierCurve';
import { SplineCurve } from '../curves/SplineCurve';
import { Vector2 } from '../../math/Vector2';

function Path( points ) {

	CurvePath.call( this );
	this.currentPoint = new Vector2();

	if ( points ) {

		this.fromPoints( points );

	}

}

Path.prototype = Object.assign( Object.create( CurvePath.prototype ), {

	constructor: Path,

	fromPoints: function ( vectors ) {

		this.moveTo( vectors[ 0 ].x, vectors[ 0 ].y );

		for ( var i = 1, l = vectors.length; i < l; i ++ ) {

			this.lineTo( vectors[ i ].x, vectors[ i ].y );

		}

	},

	moveTo: function ( x, y ) {

		this.currentPoint.set( x, y ); // TODO consider referencing vectors instead of copying?

	},

	lineTo: function ( x, y ) {

		var curve = new LineCurve( this.currentPoint.clone(), new Vector2( x, y ) );
		this.curves.push( curve );

		this.currentPoint.set( x, y );

	},

	quadraticCurveTo: function ( aCPx, aCPy, aX, aY ) {

		var curve = new QuadraticBezierCurve(
			this.currentPoint.clone(),
			new Vector2( aCPx, aCPy ),
			new Vector2( aX, aY )
		);

		this.curves.push( curve );

		this.currentPoint.set( aX, aY );

	},

	bezierCurveTo: function ( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

		var curve = new CubicBezierCurve(
			this.currentPoint.clone(),
			new Vector2( aCP1x, aCP1y ),
			new Vector2( aCP2x, aCP2y ),
			new Vector2( aX, aY )
		);

		this.curves.push( curve );

		this.currentPoint.set( aX, aY );

	},

	splineThru: function ( pts /*Array of Vector*/ ) {

		var npts = [ this.currentPoint.clone() ].concat( pts );

		var curve = new SplineCurve( npts );
		this.curves.push( curve );

		this.currentPoint.copy( pts[ pts.length - 1 ] );

	},

	arc: function ( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		var x0 = this.currentPoint.x;
		var y0 = this.currentPoint.y;

		this.absarc( aX + x0, aY + y0, aRadius,
			aStartAngle, aEndAngle, aClockwise );

	},

	absarc: function ( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		this.absellipse( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

	},

	ellipse: function ( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

		var x0 = this.currentPoint.x;
		var y0 = this.currentPoint.y;

		this.absellipse( aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

	},

	absellipse: function ( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

		var curve = new EllipseCurve( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

		if ( this.curves.length > 0 ) {

			// if a previous curve is present, attempt to join
			var firstPoint = curve.getPoint( 0 );

			if ( ! firstPoint.equals( this.currentPoint ) ) {

				this.lineTo( firstPoint.x, firstPoint.y );

			}

		}

		this.curves.push( curve );

		var lastPoint = curve.getPoint( 1 );
		this.currentPoint.copy( lastPoint );

	}

} );

export { Path };
