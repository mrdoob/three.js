import { Vector3 } from './Vector3.js';
import { clamp } from './MathUtils.js';

const _startP = /*@__PURE__*/ new Vector3();
const _startEnd = /*@__PURE__*/ new Vector3();

const _d1 = /*@__PURE__*/ new Vector3();
const _d2 = /*@__PURE__*/ new Vector3();
const _r = /*@__PURE__*/ new Vector3();
const _c1 = /*@__PURE__*/ new Vector3();
const _c2 = /*@__PURE__*/ new Vector3();

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
	 * Returns the closest squared distance between this line segment and the given one.
	 *
	 * @param {Line3} line - The line segment to compute the closest squared distance to.
	 * @param {Vector3} [c1] - The closest point on this line segment.
	 * @param {Vector3} [c2] - The closest point on the given line segment.
	 * @return {number} The squared distance between this line segment and the given one.
	 */
	distanceSqToLine3( line, c1 = _c1, c2 = _c2 ) {

		// from Real-Time Collision Detection by Christer Ericson, chapter 5.1.9

		// Computes closest points C1 and C2 of S1(s)=P1+s*(Q1-P1) and
		// S2(t)=P2+t*(Q2-P2), returning s and t. Function result is squared
		// distance between between S1(s) and S2(t)

		const EPSILON = 1e-8 * 1e-8; // must be squared since we compare squared length
		let s, t;

		const p1 = this.start;
		const p2 = line.start;
		const q1 = this.end;
		const q2 = line.end;

		_d1.subVectors( q1, p1 ); // Direction vector of segment S1
		_d2.subVectors( q2, p2 ); // Direction vector of segment S2
		_r.subVectors( p1, p2 );

		const a = _d1.dot( _d1 ); // Squared length of segment S1, always nonnegative
		const e = _d2.dot( _d2 ); // Squared length of segment S2, always nonnegative
		const f = _d2.dot( _r );

		// Check if either or both segments degenerate into points

		if ( a <= EPSILON && e <= EPSILON ) {

			// Both segments degenerate into points

			c1.copy( p1 );
			c2.copy( p2 );

			c1.sub( c2 );

			return c1.dot( c1 );

		}

		if ( a <= EPSILON ) {

			// First segment degenerates into a point

			s = 0;
			t = f / e; // s = 0 => t = (b*s + f) / e = f / e
			t = clamp( t, 0, 1 );


		} else {

			const c = _d1.dot( _r );

			if ( e <= EPSILON ) {

				// Second segment degenerates into a point

				t = 0;
				s = clamp( - c / a, 0, 1 ); // t = 0 => s = (b*t - c) / a = -c / a

			} else {

				// The general nondegenerate case starts here

				const b = _d1.dot( _d2 );
				const denom = a * e - b * b; // Always nonnegative

				// If segments not parallel, compute closest point on L1 to L2 and
				// clamp to segment S1. Else pick arbitrary s (here 0)

				if ( denom !== 0 ) {

					s = clamp( ( b * f - c * e ) / denom, 0, 1 );

				} else {

					s = 0;

				}

				// Compute point on L2 closest to S1(s) using
				// t = Dot((P1 + D1*s) - P2,D2) / Dot(D2,D2) = (b*s + f) / e

				t = ( b * s + f ) / e;

				// If t in [0,1] done. Else clamp t, recompute s for the new value
				// of t using s = Dot((P2 + D2*t) - P1,D1) / Dot(D1,D1)= (t*b - c) / a
				// and clamp s to [0, 1]

				if ( t < 0 ) {

					t = 0.;
					s = clamp( - c / a, 0, 1 );

				} else if ( t > 1 ) {

					t = 1;
					s = clamp( ( b - c ) / a, 0, 1 );

				}

			}

		}

		c1.copy( p1 ).addScaledVector( _d1, s );
		c2.copy( p2 ).addScaledVector( _d2, t );

		return c1.distanceToSquared( c2 );

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
