import { Vector3 } from './Vector3';
import { Euler } from './Euler';
import { Quaternion } from './Quaternion';
import { Matrix } from './Matrix3';
/**
 * A 4x4 Matrix.
 *
 * @example
 * // Simple rig for rotating around 3 axes
 * const m = new THREE.Matrix4();
 * const m1 = new THREE.Matrix4();
 * const m2 = new THREE.Matrix4();
 * const m3 = new THREE.Matrix4();
 * const alpha = 0;
 * const beta = Math.PI;
 * const gamma = Math.PI/2;
 * m1.makeRotationX( alpha );
 * m2.makeRotationY( beta );
 * m3.makeRotationZ( gamma );
 * m.multiplyMatrices( m1, m2 );
 * m.multiply( m3 );
 */
export class Matrix4 implements Matrix {

	constructor();

	/**
	 * Array with matrix values.
	 * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
	 */
	elements: number[];

	/**
	 * Sets all fields of this matrix.
	 */
	set(
		n11: number,
		n12: number,
		n13: number,
		n14: number,
		n21: number,
		n22: number,
		n23: number,
		n24: number,
		n31: number,
		n32: number,
		n33: number,
		n34: number,
		n41: number,
		n42: number,
		n43: number,
		n44: number
	): Matrix4;

	/**
	 * Resets this matrix to identity.
	 */
	identity(): Matrix4;
	clone(): this;
	copy( m: Matrix4 ): this;
	copyPosition( m: Matrix4 ): Matrix4;
	extractBasis( xAxis: Vector3, yAxis: Vector3, zAxis: Vector3 ): Matrix4;
	makeBasis( xAxis: Vector3, yAxis: Vector3, zAxis: Vector3 ): Matrix4;

	/**
	 * Copies the rotation component of the supplied matrix m into this matrix rotation component.
	 */
	extractRotation( m: Matrix4 ): Matrix4;
	makeRotationFromEuler( euler: Euler ): Matrix4;
	makeRotationFromQuaternion( q: Quaternion ): Matrix4;
	/**
	 * Constructs a rotation matrix, looking from eye towards center with defined up vector.
	 */
	lookAt( eye: Vector3, target: Vector3, up: Vector3 ): Matrix4;

	/**
	 * Multiplies this matrix by m.
	 */
	multiply( m: Matrix4 ): Matrix4;

	premultiply( m: Matrix4 ): Matrix4;

	/**
	 * Sets this matrix to a x b.
	 */
	multiplyMatrices( a: Matrix4, b: Matrix4 ): Matrix4;

	/**
	 * Sets this matrix to a x b and stores the result into the flat array r.
	 * r can be either a regular Array or a TypedArray.
	 *
	 * @deprecated This method has been removed completely.
	 */
	multiplyToArray( a: Matrix4, b: Matrix4, r: number[] ): Matrix4;

	/**
	 * Multiplies this matrix by s.
	 */
	multiplyScalar( s: number ): Matrix4;

	/**
	 * Computes determinant of this matrix.
	 * Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
	 */
	determinant(): number;

	/**
	 * Transposes this matrix.
	 */
	transpose(): Matrix4;

	/**
	 * Sets the position component for this matrix from vector v.
	 */
	setPosition( v: Vector3 | number, y?: number, z?: number ): Matrix4;

	/**
	 * Sets this matrix to the inverse of matrix m.
	 * Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm.
	 */
	getInverse( m: Matrix4 ): Matrix4;

	/**
	 * Multiplies the columns of this matrix by vector v.
	 */
	scale( v: Vector3 ): Matrix4;

	getMaxScaleOnAxis(): number;
	/**
	 * Sets this matrix as translation transform.
	 */
	makeTranslation( x: number, y: number, z: number ): Matrix4;

	/**
	 * Sets this matrix as rotation transform around x axis by theta radians.
	 *
	 * @param theta Rotation angle in radians.
	 */
	makeRotationX( theta: number ): Matrix4;

	/**
	 * Sets this matrix as rotation transform around y axis by theta radians.
	 *
	 * @param theta Rotation angle in radians.
	 */
	makeRotationY( theta: number ): Matrix4;

	/**
	 * Sets this matrix as rotation transform around z axis by theta radians.
	 *
	 * @param theta Rotation angle in radians.
	 */
	makeRotationZ( theta: number ): Matrix4;

	/**
	 * Sets this matrix as rotation transform around axis by angle radians.
	 * Based on http://www.gamedev.net/reference/articles/article1199.asp.
	 *
	 * @param axis Rotation axis.
	 * @param theta Rotation angle in radians.
	 */
	makeRotationAxis( axis: Vector3, angle: number ): Matrix4;

	/**
	 * Sets this matrix as scale transform.
	 */
	makeScale( x: number, y: number, z: number ): Matrix4;

	/**
	 * Sets this matrix to the transformation composed of translation, rotation and scale.
	 */
	compose( translation: Vector3, rotation: Quaternion, scale: Vector3 ): Matrix4;

	/**
	 * Decomposes this matrix into it's position, quaternion and scale components.
	 */
	decompose(
		translation: Vector3,
		rotation: Quaternion,
		scale: Vector3
	): Matrix4;

	/**
	 * Creates a frustum matrix.
	 */
	makePerspective(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): Matrix4;

	/**
	 * Creates a perspective projection matrix.
	 */
	makePerspective(
		fov: number,
		aspect: number,
		near: number,
		far: number
	): Matrix4;

	/**
	 * Creates an orthographic projection matrix.
	 */
	makeOrthographic(
		left: number,
		right: number,
		top: number,
		bottom: number,
		near: number,
		far: number
	): Matrix4;
	equals( matrix: Matrix4 ): boolean;

	/**
	 * Sets the values of this matrix from the provided array.
	 * @param array the source array.
	 * @param offset (optional) offset into the array. Default is 0.
	 */
	fromArray( array: number[], offset?: number ): Matrix4;

	/**
	 * Sets the values of this matrix from the provided array-like.
	 * @param array the source array-like.
	 * @param offset (optional) offset into the array-like. Default is 0.
	 */
	fromArray( array: ArrayLike<number>, offset?: number ): Matrix4;

	/**
	 * Returns an array with the values of this matrix, or copies them into the provided array.
	 * @param array (optional) array to store the matrix to. If this is not provided, a new array will be created.
	 * @param offset (optional) optional offset into the array.
	 * @return The created or provided array.
	 */
	toArray( array?: number[], offset?: number ): number[];

	/**
	 * Copies he values of this matrix into the provided array-like.
	 * @param array array-like to store the matrix to.
	 * @param offset (optional) optional offset into the array-like.
	 * @return The provided array-like.
	 */
	toArray( array?: ArrayLike<number>, offset?: number ): ArrayLike<number>;

	/**
	 * @deprecated Use {@link Matrix4#copyPosition .copyPosition()} instead.
	 */
	extractPosition( m: Matrix4 ): Matrix4;

	/**
	 * @deprecated Use {@link Matrix4#makeRotationFromQuaternion .makeRotationFromQuaternion()} instead.
	 */
	setRotationFromQuaternion( q: Quaternion ): Matrix4;

	/**
	 * @deprecated Use {@link Vector3#applyMatrix4 vector.applyMatrix4( matrix )} instead.
	 */
	multiplyVector3( v: any ): any;

	/**
	 * @deprecated Use {@link Vector4#applyMatrix4 vector.applyMatrix4( matrix )} instead.
	 */
	multiplyVector4( v: any ): any;

	/**
	 * @deprecated This method has been removed completely.
	 */
	multiplyVector3Array( array: number[] ): number[];

	/**
	 * @deprecated Use {@link Vector3#transformDirection Vector3.transformDirection( matrix )} instead.
	 */
	rotateAxis( v: any ): void;

	/**
	 * @deprecated Use {@link Vector3#applyMatrix4 vector.applyMatrix4( matrix )} instead.
	 */
	crossVector( v: any ): void;

	/**
	 * @deprecated Use {@link Matrix4#toArray .toArray()} instead.
	 */
	flattenToArrayOffset( array: number[], offset: number ): number[];

}
