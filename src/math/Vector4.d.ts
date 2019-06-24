import { Matrix4 } from './Matrix4';
import { Quaternion } from './Quaternion';
import { Matrix3 } from './Matrix3';
import { BufferAttribute } from './../core/BufferAttribute';
import { Vector } from './Vector2';

/**
 * @deprecated use {@link Vector3 THREE.Vector3} instead.
 */

/**
 * 4D vector.
 *
 * ( class Vector4 implements Vector<Vector4> )
 */
export class Vector4 implements Vector {

	constructor( x?: number, y?: number, z?: number, w?: number );

	x: number;
	y: number;
	z: number;
	w: number;
	width: number;
	height: number;
	isVector4: true;

	/**
	 * Sets value of this vector.
	 */
	set( x: number, y: number, z: number, w: number ): this;

	/**
	 * Sets all values of this vector.
	 */
	setScalar( scalar: number ): this;

	/**
	 * Sets X component of this vector.
	 */
	setX( x: number ): this;

	/**
	 * Sets Y component of this vector.
	 */
	setY( y: number ): this;

	/**
	 * Sets Z component of this vector.
	 */
	setZ( z: number ): this;

	/**
	 * Sets w component of this vector.
	 */
	setW( w: number ): this;

	setComponent( index: number, value: number ): this;

	getComponent( index: number ): number;

	/**
	 * Clones this vector.
	 */
	clone(): this;

	/**
	 * Copies value of v to this vector.
	 */
	copy( v: Vector4 ): this;

	/**
	 * Adds v to this vector.
	 */
	add( v: Vector4, w?: Vector4 ): this;

	addScalar( scalar: number ): this;

	/**
	 * Sets this vector to a + b.
	 */
	addVectors( a: Vector4, b: Vector4 ): this;

	addScaledVector( v: Vector4, s: number ): this;
	/**
	 * Subtracts v from this vector.
	 */
	sub( v: Vector4 ): this;

	subScalar( s: number ): this;

	/**
	 * Sets this vector to a - b.
	 */
	subVectors( a: Vector4, b: Vector4 ): this;

	/**
	 * Multiplies this vector by scalar s.
	 */
	multiplyScalar( s: number ): this;

	applyMatrix4( m: Matrix4 ): this;

	/**
	 * Divides this vector by scalar s.
	 * Set vector to ( 0, 0, 0 ) if s == 0.
	 */
	divideScalar( s: number ): this;

	/**
	 * http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
	 * @param q is assumed to be normalized
	 */
	setAxisAngleFromQuaternion( q: Quaternion ): this;

	/**
	 * http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm
	 * @param m assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
	 */
	setAxisAngleFromRotationMatrix( m: Matrix3 ): this;

	min( v: Vector4 ): this;
	max( v: Vector4 ): this;
	clamp( min: Vector4, max: Vector4 ): this;
	clampScalar( min: number, max: number ): this;
	floor(): this;
	ceil(): this;
	round(): this;
	roundToZero(): this;

	/**
	 * Inverts this vector.
	 */
	negate(): this;

	/**
	 * Computes dot product of this vector and v.
	 */
	dot( v: Vector4 ): number;

	/**
	 * Computes squared length of this vector.
	 */
	lengthSq(): number;

	/**
	 * Computes length of this vector.
	 */
	length(): number;

	/**
	 * Computes the Manhattan length of this vector.
	 *
	 * @return {number}
	 *
	 * @see {@link http://en.wikipedia.org/wiki/Taxicab_geometry|Wikipedia: Taxicab Geometry}
	 */
	manhattanLength(): number;

	/**
	 * Normalizes this vector.
	 */
	normalize(): this;
	/**
	 * Normalizes this vector and multiplies it by l.
	 */
	setLength( length: number ): this;

	/**
	 * Linearly interpolate between this vector and v with alpha factor.
	 */
	lerp( v: Vector4, alpha: number ): this;

	lerpVectors( v1: Vector4, v2: Vector4, alpha: number ): this;

	/**
	 * Checks for strict equality of this vector and v.
	 */
	equals( v: Vector4 ): boolean;

	fromArray( xyzw: number[], offset?: number ): this;

	toArray( xyzw?: number[], offset?: number ): number[];

	fromBufferAttribute(
		attribute: BufferAttribute,
		index: number,
		offset?: number
	): this;

}
