import {
	Vector4
} from 'three';
import * as NURBSUtils from '../curves/NURBSUtils.js';

/**
 * This class represents a NURBS surface.
 *
 * Implementation is based on `(x, y [, z=0 [, w=1]])` control points with `w=weight`.
 */
class NURBSSurface {

	/**
	 * Constructs a new NURBS surface.
	 *
	 * @param {number} degree1 - The first NURBS degree.
	 * @param {number} degree2 - The second NURBS degree.
	 * @param {Array<number>} knots1 - The first knots as a flat array of numbers.
	 * @param {Array<number>} knots2 - The second knots as a flat array of numbers.
	 * @param {Array<Array<Vector2|Vector3|Vector4>>} controlPoints - An array^2 holding control points.
	 */
	constructor( degree1, degree2, knots1, knots2, controlPoints ) {

		/**
		 * The first NURBS degree.
		 *
		 * @type {number}
		 */
		this.degree1 = degree1;

		/**
		 * The second NURBS degree.
		 *
		 * @type {number}
		 */
		this.degree2 = degree2;

		/**
		 * The first knots as a flat array of numbers.
		 *
		 * @type {Array<number>}
		 */
		this.knots1 = knots1;

		/**
		 * The second knots as a flat array of numbers.
		 *
		 * @type {Array<number>}
		 */
		this.knots2 = knots2;

		/**
		 *  An array holding arrays of control points.
		 *
		 * @type {Array<Array<Vector2|Vector3|Vector4>>}
		 */
		this.controlPoints = [];

		const len1 = knots1.length - degree1 - 1;
		const len2 = knots2.length - degree2 - 1;

		// ensure Vector4 for control points
		for ( let i = 0; i < len1; ++ i ) {

			this.controlPoints[ i ] = [];

			for ( let j = 0; j < len2; ++ j ) {

				const point = controlPoints[ i ][ j ];
				this.controlPoints[ i ][ j ] = new Vector4( point.x, point.y, point.z, point.w );

			}

		}

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor. This vector lies on the NURBS surface.
	 *
	 * @param {number} t1 - The first interpolation factor representing the `u` position on the surface. Must be in the range `[0,1]`.
	 * @param {number} t2 - The second interpolation factor representing the `v` position on the surface. Must be in the range `[0,1]`.
	 * @param {Vector3} target - The target vector the result is written to.
	 */
	getPoint( t1, t2, target ) {

		const u = this.knots1[ 0 ] + t1 * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
		const v = this.knots2[ 0 ] + t2 * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->u

		NURBSUtils.calcSurfacePoint( this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target );

	}

}

export { NURBSSurface };
