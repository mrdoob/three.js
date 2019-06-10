import { Euler } from './Euler';
import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';

/**
 * Implementation of a quaternion. This is used for rotating things without incurring in the dreaded gimbal lock issue, amongst other advantages.
 *
 * @example
 * var quaternion = new THREE.Quaternion();
 * quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
 * var vector = new THREE.Vector3( 1, 0, 0 );
 * vector.applyQuaternion( quaternion );
 */
export class Quaternion {

	/**
	 * @param x x coordinate
	 * @param y y coordinate
	 * @param z z coordinate
	 * @param w w coordinate
	 */
	constructor( x?: number, y?: number, z?: number, w?: number );

	x: number;
	y: number;
	z: number;
	w: number;

	/**
	 * Sets values of this quaternion.
	 */
	set( x: number, y: number, z: number, w: number ): Quaternion;

	/**
	 * Clones this quaternion.
	 */
	clone(): this;

	/**
	 * Copies values of q to this quaternion.
	 */
	copy( q: Quaternion ): this;

	/**
	 * Sets this quaternion from rotation specified by Euler angles.
	 */
	setFromEuler( euler: Euler, update?: boolean ): Quaternion;

	/**
	 * Sets this quaternion from rotation specified by axis and angle.
	 * Adapted from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm.
	 * Axis have to be normalized, angle is in radians.
	 */
	setFromAxisAngle( axis: Vector3, angle: number ): Quaternion;

	/**
	 * Sets this quaternion from rotation component of m. Adapted from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm.
	 */
	setFromRotationMatrix( m: Matrix4 ): Quaternion;
	setFromUnitVectors( vFrom: Vector3, vTo: Vector3 ): Quaternion;
	angleTo( q: Quaternion ): number;
	rotateTowards( q: Quaternion, step: number ): Quaternion;

	/**
	 * Inverts this quaternion.
	 */
	inverse(): Quaternion;

	conjugate(): Quaternion;
	dot( v: Quaternion ): number;
	lengthSq(): number;

	/**
	 * Computes length of this quaternion.
	 */
	length(): number;

	/**
	 * Normalizes this quaternion.
	 */
	normalize(): Quaternion;

	/**
	 * Multiplies this quaternion by b.
	 */
	multiply( q: Quaternion ): Quaternion;
	premultiply( q: Quaternion ): Quaternion;

	/**
	 * Sets this quaternion to a x b
	 * Adapted from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm.
	 */
	multiplyQuaternions( a: Quaternion, b: Quaternion ): Quaternion;

	slerp( qb: Quaternion, t: number ): Quaternion;
	equals( v: Quaternion ): boolean;
	fromArray( n: number[] ): Quaternion;
	toArray(): number[];

	fromArray( xyzw: number[], offset?: number ): Quaternion;
	toArray( xyzw?: number[], offset?: number ): number[];

	onChange( callback: Function ): Quaternion;
	onChangeCallback: Function;

	/**
	 * Adapted from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/.
	 */
	static slerp(
		qa: Quaternion,
		qb: Quaternion,
		qm: Quaternion,
		t: number
	): Quaternion;

	static slerpFlat(
		dst: number[],
		dstOffset: number,
		src0: number[],
		srcOffset: number,
		src1: number[],
		stcOffset1: number,
		t: number
	): Quaternion;

	/**
	 * @deprecated Use {@link Vector#applyQuaternion vector.applyQuaternion( quaternion )} instead.
	 */
	multiplyVector3( v: any ): any;

}
