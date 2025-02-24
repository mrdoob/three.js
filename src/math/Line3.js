import { Vector3 } from './Vector3.js';
import { clamp } from './MathUtils.js';

const _startP = /*@__PURE__*/ new Vector3();
const _startEnd = /*@__PURE__*/ new Vector3();

/**
 * An analytical line segment in 3D space represented by a start and end point.
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

		this.start.copy( start );
		this.end.copy( end );

		return this;

	}

	/**
	 * Copies the values of the given line segment to this instance.
	 *
	 * @param {Line3} line - The line segment to copy.
	 * @return {Line3} A reference to this line segment.
	 */
	copy( line ) {

		this.start.copy( line.start );
		this.end.copy( line.end );

		return this;

	}

	/**
	 * Returns the center of the line segment.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The center point.
	 */
	getCenter( target ) {

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	}

	/**
	 * Returns the delta vector of the line segment's start and end point.
	 *
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The delta vector.
	 */
	delta( target ) {

		return target.subVectors( this.end, this.start );

	}

	/**
	 * Returns the squared Euclidean distance between the line' start and end point.
	 *
	 * @return {number} The squared Euclidean distance.
	 */
	distanceSq() {

		return this.start.distanceToSquared( this.end );

	}

	/**
	 * Returns the Euclidean distance between the line' start and end point.
	 *
	 * @return {number} The Euclidean distance.
	 */
	distance() {

		return this.start.distanceTo( this.end );

	}

	/**
	 * Returns a vector at a certain position along the line segment.
	 *
	 * @param {number} t - A value between `[0,1]` to represent a position along the line segment.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The delta vector.
	 */
	at( t, target ) {

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	/**
	 * Returns a point parameter based on the closest point as projected on the line segment.
	 *
	 * @param {Vector3} point - The point for which to return a point parameter.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @return {number} The point parameter.
	 */
	closestPointToPointParameter( point, clampToLine ) {

		_startP.subVectors( point, this.start );
		_startEnd.subVectors( this.end, this.start );

		const startEnd2 = _startEnd.dot( _startEnd );
		const startEnd_startP = _startEnd.dot( _startP );

		let t = startEnd_startP / startEnd2;

		if ( clampToLine ) {

			t = clamp( t, 0, 1 );

		}

		return t;

	}

	/**
	 * Returns the closets point on the line for a given point.
	 *
	 * @param {Vector3} point - The point to compute the closest point on the line for.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @param {Vector3} target -  The target vector that is used to store the method's result.
	 * @return {Vector3} The closest point on the line.
	 */
	closestPointToPoint( point, clampToLine, target ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	/**
	 * Applies a 4x4 transformation matrix to this line segment.
	 *
	 * @param {Matrix4} matrix - The transformation matrix.
	 * @return {Line3} A reference to this line segment.
	 */
	applyMatrix4( matrix ) {

		this.start.applyMatrix4( matrix );
		this.end.applyMatrix4( matrix );

		return this;

	}

	/**
	 * Returns `true` if this line segment is equal with the given one.
	 *
	 * @param {Line3} line - The line segment to test for equality.
	 * @return {boolean} Whether this line segment is equal with the given one.
	 */
	equals( line ) {

		return line.start.equals( this.start ) && line.end.equals( this.end );

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
