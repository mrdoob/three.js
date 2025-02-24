import { Vector2 } from '../../math/Vector2.js';
import { CurvePath } from './CurvePath.js';
import { EllipseCurve } from '../curves/EllipseCurve.js';
import { SplineCurve } from '../curves/SplineCurve.js';
import { CubicBezierCurve } from '../curves/CubicBezierCurve.js';
import { QuadraticBezierCurve } from '../curves/QuadraticBezierCurve.js';
import { LineCurve } from '../curves/LineCurve.js';

/**
 * A 2D path representation. The class provides methods for creating paths
 * and contours of 2D shapes similar to the 2D Canvas API.
 *
 * ```js
 * const path = new THREE.Path();
 *
 * path.lineTo( 0, 0.8 );
 * path.quadraticCurveTo( 0, 1, 0.2, 1 );
 * path.lineTo( 1, 1 );
 *
 * const points = path.getPoints();
 *
 * const geometry = new THREE.BufferGeometry().setFromPoints( points );
 * const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
 *
 * const line = new THREE.Line( geometry, material );
 * scene.add( line );
 * ```
 *
 * @augments CurvePath
 */
class Path extends CurvePath {

	/**
	 * Constructs a new path.
	 *
	 * @param {Array<Vector2>} [points] - An array of 2D points defining the path.
	 */
	constructor( points ) {

		super();

		this.type = 'Path';

		/**
		 * The current offset of the path. Any new curve added will start here.
		 *
		 * @type {Vector2}
		 */
		this.currentPoint = new Vector2();

		if ( points ) {

			this.setFromPoints( points );

		}

	}

	/**
	 * Creates a path from the given list of points. The points are added
	 * to the path as instances of {@link LineCurve}.
	 *
	 * @param {Array<Vector2>} points - An array of 2D points.
	 * @return {Path} A reference to this path.
	 */
	setFromPoints( points ) {

		this.moveTo( points[ 0 ].x, points[ 0 ].y );

		for ( let i = 1, l = points.length; i < l; i ++ ) {

			this.lineTo( points[ i ].x, points[ i ].y );

		}

		return this;

	}

	/**
	 * Moves {@link Path#currentPoint} to the given point.
	 *
	 * @param {number} x - The x coordinate.
	 * @param {number} y - The y coordinate.
	 * @return {Path} A reference to this path.
	 */
	moveTo( x, y ) {

		this.currentPoint.set( x, y ); // TODO consider referencing vectors instead of copying?

		return this;

	}

	/**
	 * Adds an instance of {@link LineCurve} to the path by connecting
	 * the current point with the given one.
	 *
	 * @param {number} x - The x coordinate of the end point.
	 * @param {number} y - The y coordinate of the end point.
	 * @return {Path} A reference to this path.
	 */
	lineTo( x, y ) {

		const curve = new LineCurve( this.currentPoint.clone(), new Vector2( x, y ) );
		this.curves.push( curve );

		this.currentPoint.set( x, y );

		return this;

	}

	/**
	 * Adds an instance of {@link QuadraticBezierCurve} to the path by connecting
	 * the current point with the given one.
	 *
	 * @param {number} aCPx - The x coordinate of the control point.
	 * @param {number} aCPy - The y coordinate of the control point.
	 * @param {number} aX - The x coordinate of the end point.
	 * @param {number} aY - The y coordinate of the end point.
	 * @return {Path} A reference to this path.
	 */
	quadraticCurveTo( aCPx, aCPy, aX, aY ) {

		const curve = new QuadraticBezierCurve(
			this.currentPoint.clone(),
			new Vector2( aCPx, aCPy ),
			new Vector2( aX, aY )
		);

		this.curves.push( curve );

		this.currentPoint.set( aX, aY );

		return this;

	}

	/**
	 * Adds an instance of {@link CubicBezierCurve} to the path by connecting
	 * the current point with the given one.
	 *
	 * @param {number} aCP1x - The x coordinate of the first control point.
	 * @param {number} aCP1y - The y coordinate of the first control point.
	 * @param {number} aCP2x - The x coordinate of the second control point.
	 * @param {number} aCP2y - The y coordinate of the second control point.
	 * @param {number} aX - The x coordinate of the end point.
	 * @param {number} aY - The y coordinate of the end point.
	 * @return {Path} A reference to this path.
	 */
	bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

		const curve = new CubicBezierCurve(
			this.currentPoint.clone(),
			new Vector2( aCP1x, aCP1y ),
			new Vector2( aCP2x, aCP2y ),
			new Vector2( aX, aY )
		);

		this.curves.push( curve );

		this.currentPoint.set( aX, aY );

		return this;

	}

	/**
	 * Adds an instance of {@link SplineCurve} to the path by connecting
	 * the current point with the given list of points.
	 *
	 * @param {Array<Vector2>} pts - An array of points in 2D space.
	 * @return {Path} A reference to this path.
	 */
	splineThru( pts ) {

		const npts = [ this.currentPoint.clone() ].concat( pts );

		const curve = new SplineCurve( npts );
		this.curves.push( curve );

		this.currentPoint.copy( pts[ pts.length - 1 ] );

		return this;

	}

	/**
	 * Adds an arc as an instance of {@link EllipseCurve} to the path, positioned relative
	 * to the current point.
	 *
	 * @param {number} aX - The x coordinate of the center of the arc offsetted from the previous curve.
	 * @param {number} aY - The y coordinate of the center of the arc offsetted from the previous curve.
	 * @param {number} aRadius - The radius of the arc.
	 * @param {number} aStartAngle - The start angle in radians.
	 * @param {number} aEndAngle - The end angle in radians.
	 * @param {boolean} [aClockwise=false] - Whether to sweep the arc clockwise or not.
	 * @return {Path} A reference to this path.
	 */
	arc( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		const x0 = this.currentPoint.x;
		const y0 = this.currentPoint.y;

		this.absarc( aX + x0, aY + y0, aRadius,
			aStartAngle, aEndAngle, aClockwise );

		return this;

	}

	/**
	 * Adds an absolutely positioned arc as an instance of {@link EllipseCurve} to the path.
	 *
	 * @param {number} aX - The x coordinate of the center of the arc.
	 * @param {number} aY - The y coordinate of the center of the arc.
	 * @param {number} aRadius - The radius of the arc.
	 * @param {number} aStartAngle - The start angle in radians.
	 * @param {number} aEndAngle - The end angle in radians.
	 * @param {boolean} [aClockwise=false] - Whether to sweep the arc clockwise or not.
	 * @return {Path} A reference to this path.
	 */
	absarc( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		this.absellipse( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

		return this;

	}

	/**
	 * Adds an ellipse as an instance of {@link EllipseCurve} to the path, positioned relative
	 * to the current point
	 *
	 * @param {number} aX - The x coordinate of the center of the ellipse offsetted from the previous curve.
	 * @param {number} aY - The y coordinate of the center of the ellipse offsetted from the previous curve.
	 * @param {number} xRadius - The radius of the ellipse in the x axis.
	 * @param {number} yRadius - The radius of the ellipse in the y axis.
	 * @param {number} aStartAngle - The start angle in radians.
	 * @param {number} aEndAngle - The end angle in radians.
	 * @param {boolean} [aClockwise=false] - Whether to sweep the ellipse clockwise or not.
	 * @param {boolean} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
	 * @return {Path} A reference to this path.
	 */
	ellipse( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

		const x0 = this.currentPoint.x;
		const y0 = this.currentPoint.y;

		this.absellipse( aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

		return this;

	}

	/**
	 * Adds an absolutely positioned ellipse as an instance of {@link EllipseCurve} to the path.
	 *
	 * @param {number} aX - The x coordinate of the absolute center of the ellipse.
	 * @param {number} aY - The y coordinate of the absolute center of the ellipse.
	 * @param {number} xRadius - The radius of the ellipse in the x axis.
	 * @param {number} yRadius - The radius of the ellipse in the y axis.
	 * @param {number} aStartAngle - The start angle in radians.
	 * @param {number} aEndAngle - The end angle in radians.
	 * @param {boolean} [aClockwise=false] - Whether to sweep the ellipse clockwise or not.
	 * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
	 * @return {Path} A reference to this path.
	 */
	absellipse( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

		const curve = new EllipseCurve( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

		if ( this.curves.length > 0 ) {

			// if a previous curve is present, attempt to join
			const firstPoint = curve.getPoint( 0 );

			if ( ! firstPoint.equals( this.currentPoint ) ) {

				this.lineTo( firstPoint.x, firstPoint.y );

			}

		}

		this.curves.push( curve );

		const lastPoint = curve.getPoint( 1 );
		this.currentPoint.copy( lastPoint );

		return this;

	}

	copy( source ) {

		super.copy( source );

		this.currentPoint.copy( source.currentPoint );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.currentPoint = this.currentPoint.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.currentPoint.fromArray( json.currentPoint );

		return this;

	}

}


export { Path };
