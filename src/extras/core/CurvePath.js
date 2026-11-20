import { Curve } from './Curve.js';
import * as Curves from '../curves/Curves.js';

/**
 * A base class extending {@link Curve}. `CurvePath` is simply an
 * array of connected curves, but retains the API of a curve.
 *
 * @augments Curve
 */
class CurvePath extends Curve {

	/**
	 * Constructs a new curve path.
	 */
	constructor() {

		super();

		this.type = 'CurvePath';

		/**
		 * An array of curves defining the
		 * path.
		 *
		 * @type {Array<Curve>}
		 */
		this.curves = [];

		/**
		 * Whether the path should automatically be closed
		 * by a line curve.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.autoClose = false;

		/**
		 * An internal cache that holds precomputed curve length values.
		 *
		 * @private
		 * @type {?Array<number>}
		 * @default null
		 */
		this.cacheLengths = null;

	}

	/**
	 * Adds a curve to this curve path.
	 *
	 * @param {Curve} curve - The curve to add.
	 */
	add( curve ) {

		this.curves.push( curve );

	}

	/**
	 * Adds a line curve to close the path.
	 *
	 * @return {CurvePath} A reference to this curve path.
	 */
	closePath() {

		// Add a line curve if start and end of lines are not connected
		const startPoint = this.curves[ 0 ].getPoint( 0 );
		const endPoint = this.curves[ this.curves.length - 1 ].getPoint( 1 );

		if ( ! startPoint.equals( endPoint ) ) {

			const lineType = ( startPoint.isVector2 === true ) ? 'LineCurve' : 'LineCurve3';
			this.curves.push( new Curves[ lineType ]( endPoint, startPoint ) );

		}

		return this;

	}

	/**
	 * This method returns a vector in 2D or 3D space (depending on the curve definitions)
	 * for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
	 * @return {?(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
	 */
	getPoint( t, optionalTarget ) {

		// To get accurate point with reference to
		// entire path distance at time t,
		// following has to be done:

		// 1. Length of each sub path have to be known
		// 2. Locate and identify type of curve
		// 3. Get t for the curve
		// 4. Return curve.getPointAt(t')

		const d = t * this.getLength();
		const curveLengths = this.getCurveLengths();
		let i = 0;

		// To think about boundaries points.

		while ( i < curveLengths.length ) {

			if ( curveLengths[ i ] >= d ) {

				const diff = curveLengths[ i ] - d;
				const curve = this.curves[ i ];

				const segmentLength = curve.getLength();
				const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

				return curve.getPointAt( u, optionalTarget );

			}

			i ++;

		}

		return null;

		// loop where sum != 0, sum > d , sum+1 <d

	}

	getLength() {

		// We cannot use the default THREE.Curve getPoint() with getLength() because in
		// THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
		// getPoint() depends on getLength

		const lens = this.getCurveLengths();
		return lens[ lens.length - 1 ];

	}

	updateArcLengths() {

		// cacheLengths must be recalculated.

		this.needsUpdate = true;
		this.cacheLengths = null;
		this.getCurveLengths();

	}

	/**
	 * Returns list of cumulative curve lengths of the defined curves.
	 *
	 * @return {Array<number>} The curve lengths.
	 */
	getCurveLengths() {

		// Compute lengths and cache them
		// We cannot overwrite getLengths() because UtoT mapping uses it.
		// We use cache values if curves and cache array are same length

		if ( this.cacheLengths && this.cacheLengths.length === this.curves.length ) {

			return this.cacheLengths;

		}

		// Get length of sub-curve
		// Push sums into cached array

		const lengths = [];
		let sums = 0;

		for ( let i = 0, l = this.curves.length; i < l; i ++ ) {

			sums += this.curves[ i ].getLength();
			lengths.push( sums );

		}

		this.cacheLengths = lengths;

		return lengths;

	}

	/**
	 * This method samples the curve path via {@link CurvePath#getPoint} and returns an array of
	 * equi-spaced points across the entire path. If {@link CurvePath#autoClose} is `true`, the
	 * first point is appended at the end.
	 *
	 * @param {number} [divisions=40] - The number of divisions.
	 * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values.
	 */
	getSpacedPoints( divisions = 40 ) {

		const points = [];

		for ( let i = 0; i <= divisions; i ++ ) {

			points.push( this.getPoint( i / divisions ) );

		}

		if ( this.autoClose ) {

			points.push( points[ 0 ] );

		}

		return points;

	}

	/**
	 * This method samples each curve of the path and returns an array of points representing
	 * the path shape. Consecutive duplicate points are removed. If {@link CurvePath#autoClose}
	 * is `true`, the first point is appended at the end if necessary.
	 *
	 * @param {number} [divisions=12] - The number of divisions per curve. Line curves always use
	 * one division, ellipse curves twice this value and {@link SplineCurve} instances this value times their
	 * point count. All other curves use this value.
	 * @return {Array<(Vector2|Vector3)>} An array holding the sampled curve values.
	 */
	getPoints( divisions = 12 ) {

		const points = [];
		let last;

		for ( let i = 0, curves = this.curves; i < curves.length; i ++ ) {

			const curve = curves[ i ];
			const resolution = curve.isEllipseCurve ? divisions * 2
				: ( curve.isLineCurve || curve.isLineCurve3 ) ? 1
					: curve.isSplineCurve ? divisions * curve.points.length
						: divisions;

			const pts = curve.getPoints( resolution );

			for ( let j = 0; j < pts.length; j ++ ) {

				const point = pts[ j ];

				if ( last && last.equals( point ) ) continue; // ensures no consecutive points are duplicates

				points.push( point );
				last = point;

			}

		}

		if ( this.autoClose && points.length > 1 && ! points[ points.length - 1 ].equals( points[ 0 ] ) ) {

			points.push( points[ 0 ] );

		}

		return points;

	}

	copy( source ) {

		super.copy( source );

		this.curves = [];

		for ( let i = 0, l = source.curves.length; i < l; i ++ ) {

			const curve = source.curves[ i ];

			this.curves.push( curve.clone() );

		}

		this.autoClose = source.autoClose;

		this.cacheLengths = null;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.autoClose = this.autoClose;
		data.curves = [];

		for ( let i = 0, l = this.curves.length; i < l; i ++ ) {

			const curve = this.curves[ i ];
			data.curves.push( curve.toJSON() );

		}

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.autoClose = json.autoClose;
		this.curves = [];

		for ( let i = 0, l = json.curves.length; i < l; i ++ ) {

			const curve = json.curves[ i ];
			this.curves.push( new Curves[ curve.type ]().fromJSON( curve ) );

		}

		this.cacheLengths = null;

		return this;

	}

}


export { CurvePath };
