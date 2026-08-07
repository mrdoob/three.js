import { clamp } from './MathUtils.js';

/**
 * A structural type describing any object with numeric `x`, `y`, and `z`
 * components, exactly like {@link Vector3}.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * A structural type describing any object that stores a line segment as
 * `start` and `end` points, exactly like {@link Line3}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Line3} instance. Since {@link Line3}
 * exposes compatible `start`/`end` vectors, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} Line3Like
 * @property {Vector3Like} start - Start of the line segment.
 * @property {Vector3Like} end - End of the line segment.
 */

/**
 * A structural type describing any object that stores a 4x4 matrix as a
 * column-major list of 16 numbers, exactly like {@link Matrix4#elements}.
 *
 * @typedef {Object} Matrix4Like
 * @property {Array<number>|TypedArray} elements - A column-major list of 16 matrix values.
 */

const _startP = { x: 0, y: 0, z: 0 };
const _startEnd = { x: 0, y: 0, z: 0 };

const _d1 = { x: 0, y: 0, z: 0 };
const _d2 = { x: 0, y: 0, z: 0 };
const _r = { x: 0, y: 0, z: 0 };
const _c1 = { x: 0, y: 0, z: 0 };
const _c2 = { x: 0, y: 0, z: 0 };

/**
 * Creates a new, plain {@link Line3Like} object with both endpoints at the origin.
 *
 * Unlike `new Line3()`, the returned object is not a class instance and
 * carries no prototype methods - it only satisfies the {@link Line3Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Line3} class so that unused line operations can be tree-shaken.
 *
 * @return {Line3Like} A new line-like object with start and end at `(0,0,0)`.
 */
export function line3Create() {

	return {

		start: { x: 0, y: 0, z: 0 },
		end: { x: 0, y: 0, z: 0 }

	};

}

/**
 * Sets the start and end values of the target by copying the given vectors.
 *
 * @param {Vector3Like} start - The start point.
 * @param {Vector3Like} end - The end point.
 * @param {Line3Like} [target] - The target the result is stored to.
 * @return {Line3Like} The target, for chaining.
 */
export function line3Set( start, end, target = line3Create() ) {

	target.start.x = start.x;
	target.start.y = start.y;
	target.start.z = start.z;

	target.end.x = end.x;
	target.end.y = end.y;
	target.end.z = end.z;

	return target;

}

/**
 * Copies the values of the given line segment into the target.
 *
 * @param {Line3Like} line - The line segment to copy.
 * @param {Line3Like} [target] - The target the result is stored to.
 * @return {Line3Like} The target, for chaining.
 */
export function line3Copy( line, target = line3Create() ) {

	target.start.x = line.start.x;
	target.start.y = line.start.y;
	target.start.z = line.start.z;

	target.end.x = line.end.x;
	target.end.y = line.end.y;
	target.end.z = line.end.z;

	return target;

}

/**
 * Returns the center of the line segment.
 *
 * @param {Line3Like} line - The line segment.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The center point.
 */
export function line3GetCenter( line, target = { x: 0, y: 0, z: 0 } ) {

	target.x = ( line.start.x + line.end.x ) * 0.5;
	target.y = ( line.start.y + line.end.y ) * 0.5;
	target.z = ( line.start.z + line.end.z ) * 0.5;

	return target;

}

/**
 * Returns the delta vector of the line segment's start and end point.
 *
 * @param {Line3Like} line - The line segment.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The delta vector.
 */
export function line3Delta( line, target = { x: 0, y: 0, z: 0 } ) {

	target.x = line.end.x - line.start.x;
	target.y = line.end.y - line.start.y;
	target.z = line.end.z - line.start.z;

	return target;

}

/**
 * Returns the squared Euclidean distance between the line's start and end point.
 *
 * @param {Line3Like} line - The line segment.
 * @return {number} The squared Euclidean distance.
 */
export function line3DistanceSq( line ) {

	const dx = line.start.x - line.end.x;
	const dy = line.start.y - line.end.y;
	const dz = line.start.z - line.end.z;

	return dx * dx + dy * dy + dz * dz;

}

/**
 * Returns the Euclidean distance between the line's start and end point.
 *
 * @param {Line3Like} line - The line segment.
 * @return {number} The Euclidean distance.
 */
export function line3Distance( line ) {

	return Math.sqrt( line3DistanceSq( line ) );

}

/**
 * Returns a vector at a certain position along the line segment.
 *
 * @param {Line3Like} line - The line segment.
 * @param {number} t - A value between `[0,1]` to represent a position along the line segment.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The point on the line.
 */
export function line3At( line, t, target = { x: 0, y: 0, z: 0 } ) {

	line3Delta( line, target );

	target.x = target.x * t + line.start.x;
	target.y = target.y * t + line.start.y;
	target.z = target.z * t + line.start.z;

	return target;

}

/**
 * Returns a point parameter based on the closest point as projected on the line segment.
 *
 * @param {Line3Like} line - The line segment.
 * @param {Vector3Like} point - The point for which to return a point parameter.
 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
 * @return {number} The point parameter.
 */
export function line3ClosestPointToPointParameter( line, point, clampToLine ) {

	_startP.x = point.x - line.start.x;
	_startP.y = point.y - line.start.y;
	_startP.z = point.z - line.start.z;

	_startEnd.x = line.end.x - line.start.x;
	_startEnd.y = line.end.y - line.start.y;
	_startEnd.z = line.end.z - line.start.z;

	const startEnd2 = _startEnd.x * _startEnd.x + _startEnd.y * _startEnd.y + _startEnd.z * _startEnd.z;

	if ( startEnd2 === 0 ) return 0;

	const startEnd_startP = _startEnd.x * _startP.x + _startEnd.y * _startP.y + _startEnd.z * _startP.z;

	let t = startEnd_startP / startEnd2;

	if ( clampToLine ) {

		t = clamp( t, 0, 1 );

	}

	return t;

}

/**
 * Returns the closest point on the line for a given point.
 *
 * @param {Line3Like} line - The line segment.
 * @param {Vector3Like} point - The point to compute the closest point on the line for.
 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
 * @param {Vector3Like} [target] - The target vector that is used to store the result.
 * @return {Vector3Like} The closest point on the line.
 */
export function line3ClosestPointToPoint( line, point, clampToLine, target = { x: 0, y: 0, z: 0 } ) {

	const t = line3ClosestPointToPointParameter( line, point, clampToLine );

	return line3At( line, t, target );

}

/**
 * Returns the closest squared distance between this line segment and the given one.
 *
 * @param {Line3Like} line - The first line segment.
 * @param {Line3Like} other - The line segment to compute the closest squared distance to.
 * @param {Vector3Like} [c1] - The closest point on the first line segment.
 * @param {Vector3Like} [c2] - The closest point on the given line segment.
 * @return {number} The squared distance between the two line segments.
 */
export function line3DistanceSqToLine3( line, other, c1 = _c1, c2 = _c2 ) {

	// from Real-Time Collision Detection by Christer Ericson, chapter 5.1.9

	// Computes closest points C1 and C2 of S1(s)=P1+s*(Q1-P1) and
	// S2(t)=P2+t*(Q2-P2), returning s and t. Function result is squared
	// distance between between S1(s) and S2(t)

	const EPSILON = 1e-8 * 1e-8; // must be squared since we compare squared length
	let s, t;

	const p1 = line.start;
	const p2 = other.start;
	const q1 = line.end;
	const q2 = other.end;

	_d1.x = q1.x - p1.x; // Direction vector of segment S1
	_d1.y = q1.y - p1.y;
	_d1.z = q1.z - p1.z;

	_d2.x = q2.x - p2.x; // Direction vector of segment S2
	_d2.y = q2.y - p2.y;
	_d2.z = q2.z - p2.z;

	_r.x = p1.x - p2.x;
	_r.y = p1.y - p2.y;
	_r.z = p1.z - p2.z;

	const a = _d1.x * _d1.x + _d1.y * _d1.y + _d1.z * _d1.z; // Squared length of segment S1, always nonnegative
	const e = _d2.x * _d2.x + _d2.y * _d2.y + _d2.z * _d2.z; // Squared length of segment S2, always nonnegative
	const f = _d2.x * _r.x + _d2.y * _r.y + _d2.z * _r.z;

	// Check if either or both segments degenerate into points

	if ( a <= EPSILON && e <= EPSILON ) {

		// Both segments degenerate into points

		c1.x = p1.x;
		c1.y = p1.y;
		c1.z = p1.z;

		c2.x = p2.x;
		c2.y = p2.y;
		c2.z = p2.z;

		c1.x -= c2.x;
		c1.y -= c2.y;
		c1.z -= c2.z;

		return c1.x * c1.x + c1.y * c1.y + c1.z * c1.z;

	}

	if ( a <= EPSILON ) {

		// First segment degenerates into a point

		s = 0;
		t = f / e; // s = 0 => t = (b*s + f) / e = f / e
		t = clamp( t, 0, 1 );


	} else {

		const c = _d1.x * _r.x + _d1.y * _r.y + _d1.z * _r.z;

		if ( e <= EPSILON ) {

			// Second segment degenerates into a point

			t = 0;
			s = clamp( - c / a, 0, 1 ); // t = 0 => s = (b*t - c) / a = -c / a

		} else {

			// The general nondegenerate case starts here

			const b = _d1.x * _d2.x + _d1.y * _d2.y + _d1.z * _d2.z;
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

	c1.x = p1.x + _d1.x * s;
	c1.y = p1.y + _d1.y * s;
	c1.z = p1.z + _d1.z * s;

	c2.x = p2.x + _d2.x * t;
	c2.y = p2.y + _d2.y * t;
	c2.z = p2.z + _d2.z * t;

	const dx = c1.x - c2.x;
	const dy = c1.y - c2.y;
	const dz = c1.z - c2.z;

	return dx * dx + dy * dy + dz * dz;

}

/**
 * Applies a 4x4 transformation matrix to the line segment.
 *
 * @param {Line3Like} line - The line segment.
 * @param {Matrix4Like} matrix - The transformation matrix.
 * @param {Line3Like} [target] - The target the result is stored to.
 * @return {Line3Like} The target, for chaining.
 */
export function line3ApplyMatrix4( line, matrix, target = line3Create() ) {

	_applyMatrix4ToVector3( line.start, matrix, target.start );
	_applyMatrix4ToVector3( line.end, matrix, target.end );

	return target;

}

/**
 * Returns `true` if the two line segments are equal.
 *
 * @param {Line3Like} a - The first line segment.
 * @param {Line3Like} b - The second line segment.
 * @return {boolean} Whether the two line segments are equal.
 */
export function line3Equals( a, b ) {

	return a.start.x === b.start.x && a.start.y === b.start.y && a.start.z === b.start.z &&
		a.end.x === b.end.x && a.end.y === b.end.y && a.end.z === b.end.z;

}

/**
 * Applies a 4x4 transformation matrix to a vector (inlined from Vector3.applyMatrix4).
 *
 * @param {Vector3Like} v - The vector to transform.
 * @param {Matrix4Like} m - The transformation matrix.
 * @param {Vector3Like} target - The target the result is stored to.
 * @return {Vector3Like} The target.
 */
function _applyMatrix4ToVector3( v, m, target ) {

	const x = v.x, y = v.y, z = v.z;
	const e = m.elements;

	const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

	target.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
	target.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
	target.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

	return target;

}
