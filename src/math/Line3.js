import { Vector3 } from './Vector3.js';
import {
	line3ApplyMatrix4,
	line3At,
	line3ClosestPointToPoint,
	line3ClosestPointToPointParameter,
	line3Copy,
	line3Delta,
	line3Distance,
	line3DistanceSq,
	line3DistanceSqToLine3,
	line3Equals,
	line3GetCenter,
	line3Set
} from './Line3Functions.js';

/**
 * An analytical line segment in 3D space represented by a start and end point.
 *
 * `Line3` is a thin, backwards-compatible wrapper around the standalone,
 * tree-shakeable `line3*` functions in {@link Line3Functions}, which operate
 * on any {@link Line3Like} object. Prefer importing those functions
 * directly if you only need a handful of operations and want unused ones
 * eliminated from your bundle.
 */
class Line3 {

	/**
	 * Constructs a new line segment.
	 *
	 * @param {Vector3} [start=(0,0,0)] - Start of the line segment.
	 * @param {Vector3} [end=(0,0,0)] - End of the line segment.
	 */
	constructor( start = new Vector3(), end = new Vector3() ) {

		/**
		 * Start of the line segment.
		 *
		 * @type {Vector3}
		 */
		this.start = start;

		/**
		 * End of the line segment.
		 *
		 * @type {Vector3}
		 */
		this.end = end;

	}

	/**
	 * Sets the start and end values by copying the given vectors.
	 *
	 * @param {Vector3} start - The start point.
	 * @param {Vector3} end - The end point.
	 * @return {Line3} A reference to this line segment.
	 */
	set( start, end ) {

		return line3Set( start, end, this );

	}

	/**
	 * Copies the values of the given line segment to this instance.
	 *
	 * @param {Line3} line - The line segment to copy.
	 * @return {Line3} A reference to this line segment.
	 */
	copy( line ) {

		return line3Copy( line, this );

	}

	/**
	 * Returns the center of the line segment.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The center point.
	 */
	getCenter( target ) {

		return line3GetCenter( this, target );

	}

	/**
	 * Returns the delta vector of the line segment's start and end point.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The delta vector.
	 */
	delta( target ) {

		return line3Delta( this, target );

	}

	/**
	 * Returns the squared Euclidean distance between the line' start and end point.
	 *
	 * @return {number} The squared Euclidean distance.
	 */
	distanceSq() {

		return line3DistanceSq( this );

	}

	/**
	 * Returns the Euclidean distance between the line' start and end point.
	 *
	 * @return {number} The Euclidean distance.
	 */
	distance() {

		return line3Distance( this );

	}

	/**
	 * Returns a vector at a certain position along the line segment.
	 *
	 * @param {number} t - A value between `[0,1]` to represent a position along the line segment.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The delta vector.
	 */
	at( t, target ) {

		return line3At( this, t, target );

	}

	/**
	 * Returns a point parameter based on the closest point as projected on the line segment.
	 *
	 * @param {Vector3} point - The point for which to return a point parameter.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @return {number} The point parameter.
	 */
	closestPointToPointParameter( point, clampToLine ) {

		return line3ClosestPointToPointParameter( this, point, clampToLine );

	}

	/**
	 * Returns the closest point on the line for a given point.
	 *
	 * @param {Vector3} point - The point to compute the closest point on the line for.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The closest point on the line.
	 */
	closestPointToPoint( point, clampToLine, target ) {

		return line3ClosestPointToPoint( this, point, clampToLine, target );

	}

	/**
	 * Returns the closest squared distance between this line segment and the given one.
	 *
	 * @param {Line3} line - The line segment to compute the closest squared distance to.
	 * @param {Vector3} [c1] - The closest point on this line segment.
	 * @param {Vector3} [c2] - The closest point on the given line segment.
	 * @return {number} The squared distance between this line segment and the given one.
	 */
	distanceSqToLine3( line, c1, c2 ) {

		return line3DistanceSqToLine3( this, line, c1, c2 );

	}

	/**
	 * Applies a 4x4 transformation matrix to this line segment.
	 *
	 * @param {Matrix4} matrix - The transformation matrix.
	 * @return {Line3} A reference to this line segment.
	 */
	applyMatrix4( matrix ) {

		return line3ApplyMatrix4( this, matrix, this );

	}

	/**
	 * Returns `true` if this line segment is equal with the given one.
	 *
	 * @param {Line3} line - The line segment to test for equality.
	 * @return {boolean} Whether this line segment is equal with the given one.
	 */
	equals( line ) {

		return line3Equals( this, line );

	}

	/**
	 * Returns a new line segment with copied values from this instance.
	 *
	 * @return {Line3} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { Line3 };
