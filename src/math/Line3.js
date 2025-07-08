import { Vector3 } from './Vector3.js';
import { Vector2 } from './Vector2.js';
import { clamp } from './MathUtils.js';

const _startP = /*@__PURE__*/ new Vector3();
const _startEnd = /*@__PURE__*/ new Vector3();
const _startEnd2 = /*@__PURE__*/ new Vector3();
const _parameters = /*@__PURE__*/ new Vector2();
const EPS_SQR = Number.EPSILON * Number.EPSILON;

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
	 * Returns the closest point on the line for a given point.
	 *
	 * @param {Vector3} point - The point to compute the closest point on the line for.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The closest point on the line.
	 */
	closestPointToPoint( point, clampToLine, target ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	/**
	 * Returns distance from a given point to the line.
	 *
	 * @param {Vector3} point - The point to compute the closest point on the line for.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @return {number} Distance from point to the line.
	 */
	distanceToPoint( point, clampToLine ) {

		this.closestPointToPoint( point, clampToLine, _startP );

		return point.distanceTo( _startP );

	}

	/**
	 * Returns point parameters of shortest segment connecting two lines.
	 *
	 * @param {Line3} line Line to find distance to
	 * @param {boolean} clampToLine  - Whether to clamp the result to the range `[0,1]` or not.
	 * @param {Vector2} target - The vector that is used to store the method's result. x is parameter for point on this, y is parameter for point on line.
	 * @return {Vector2} - Point parameters of the shortest segment connecting two lines.
	 */
	closestSegmentToLineParameters( line, clampToLine, target ) {

		// algorithm thanks to Real-Time Collision Detection by Christer Ericson,
		// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
		// under the accompanying license; see chapter 5.1.9 for detailed explanation.

		_startEnd.subVectors( this.end, this.start );
		_startEnd2.subVectors( line.end, line.start );

		const thisLengthSq = _startEnd.dot( _startEnd );
		const otherLengthSq = _startEnd2.dot( _startEnd2 );

		if ( thisLengthSq < EPS_SQR && otherLengthSq < EPS_SQR ) {

			target.set( 0, 0 );
			return target;

		}

		if ( thisLengthSq < EPS_SQR ) {

			target.set( 0, line.closestPointToPointParameter( this.start, clampToLine ) );
			return target;

		}

		if ( otherLengthSq < EPS_SQR ) {

			target.set( this.closestPointToPoint( line.start, clampToLine ), 0 );
			return target;

		}

		const startDiff = _startP.subVectors( this.start, line.start );
		const f = _startEnd2.dot( startDiff );
		const c = _startEnd.dot( startDiff );
		const b = _startEnd.dot( _startEnd2 );

		const denom = thisLengthSq * otherLengthSq - b * b;

		let s = 0;

		// If segments not parallel, compute closest point on L1 to L2 and
		// clamp to segment S1. Else pick arbitrary s (here 0)
		if ( denom != 0 ) {

			s = ( b * f - c * otherLengthSq ) / denom;
			if ( clampToLine ) {

				s = clamp( s, 0, 1 );

			}

		}

		// Compute point on L2 closest to S1(s) using
		// t = Dot((P1 + D1*s) - P2,D2) / Dot(D2,D2) = (b*s + f) / otherLengthSq
		let t = ( b * s + f ) / otherLengthSq;

		if ( clampToLine ) {

			// If t in [0,1] done. Else clamp t, recompute s for the new value
			// of t using s = Dot((P2 + D2*t) - P1,D1) / Dot(D1,D1) = (t*b - c) / thisLengthSq
			// and clamp s to [0, 1]
			if ( t < 0.0 ) {

				t = 0.0;
				s = clamp( - c / thisLengthSq, 0, 1 );

			} else if ( t > 1 ) {

				t = 1;
				s = clamp( ( b - c ) / thisLengthSq, 0, 1 );

			}

		}

		target.set( s, t );
		return target;


	}

	/**
	 * Returns shortest segment connecting two lines.
	 *
	 * @param {Line3} line Line to find distance to
	 * @param {boolean} clampToLine  - Whether to clamp the result to the range `[0,1]` or not.
	 * @param {Line3} target - The target segment that is used to store the method's result. Start point is on this, end is on line.
	 * @return {Line3} - The shortest segment connecting two lines.
	 */
	closestSegmentToLine( line, clampToLine, target ) {

		this.closestSegmentToLineParameters( line, clampToLine, _parameters );

		this.delta( target.start ).multiplyScalar( _parameters.x ).add( this.start );
		line.delta( target.end ).multiplyScalar( _parameters.y ).add( line.start );

		return target;

	}

	/**
	 * Return distance between two lines.
	 *
	 * @param {Line3} line Line to find distance to
	 * @param {boolean} clampToLine  - Whether to clamp the result to the range `[0,1]` or not.
	 * @return {number} Closest distance between lines
	 */
	closestDistanceToLine( line, clampToLine ) {

		this.closestSegmentToLineParameters( line, clampToLine, _parameters );

		const pointA = this.delta( _startEnd ).multiplyScalar( _parameters.x ).add( this.start );
		const pointB = line.delta( _startEnd2 ).multiplyScalar( _parameters.y ).add( line.start );

		return pointA.distanceTo( pointB );

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
