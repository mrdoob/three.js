import { Matrix4 } from './Matrix4';
import { BufferAttribute } from './../core/BufferAttribute';
import { Vector3 } from './Vector3';

/**
 * ( interface Matrix&lt;T&gt; )
 */
export interface Matrix {
	/**
   * Array with matrix values.
   */
	elements: number[];

	/**
   * identity():T;
   */
	identity(): Matrix;

	/**
   * copy(m:T):T;
   */
	copy( m: this ): this;

	/**
   * multiplyScalar(s:number):T;
   */
	multiplyScalar( s: number ): Matrix;

	determinant(): number;

	/**
   * getInverse(matrix:T, throwOnInvertible?:boolean):T;
   */
	getInverse( matrix: Matrix, throwOnInvertible?: boolean ): Matrix;

	/**
   * transpose():T;
   */
	transpose(): Matrix;

	/**
   * clone():T;
   */
	clone(): this;
}

/**
 * ( class Matrix3 implements Matrix&lt;Matrix3&gt; )
 */
export class Matrix3 implements Matrix {

	/**
   * Creates an identity matrix.
   */
	constructor();

	/**
   * Array with matrix values.
   */
	elements: number[];

	set(
		n11: number,
		n12: number,
		n13: number,
		n21: number,
		n22: number,
		n23: number,
		n31: number,
		n32: number,
		n33: number
	): Matrix3;
	identity(): Matrix3;
	clone(): this;
	copy( m: Matrix3 ): this;
	setFromMatrix4( m: Matrix4 ): Matrix3;

	/**
   * @deprecated Use {@link Matrix3#applyToBufferAttribute matrix3.applyToBufferAttribute( attribute )} instead.
   */
	applyToBuffer(
		buffer: BufferAttribute,
		offset?: number,
		length?: number
	): BufferAttribute;

	applyToBufferAttribute( attribute: BufferAttribute ): BufferAttribute;

	multiplyScalar( s: number ): Matrix3;
	determinant(): number;
	getInverse( matrix: Matrix3, throwOnDegenerate?: boolean ): Matrix3;

	/**
   * Transposes this matrix in place.
   */
	transpose(): Matrix3;
	getNormalMatrix( matrix4: Matrix4 ): Matrix3;

	/**
   * Transposes this matrix into the supplied array r, and returns itself.
   */
	transposeIntoArray( r: number[] ): number[];
	fromArray( array: number[], offset?: number ): Matrix3;
	toArray(): number[];

	/**
   * Multiplies this matrix by m.
   */
	multiply( m: Matrix3 ): Matrix3;

	premultiply( m: Matrix3 ): Matrix3;

	/**
   * Sets this matrix to a x b.
   */
	multiplyMatrices( a: Matrix3, b: Matrix3 ): Matrix3;

	/**
   * @deprecated Use {@link Vector3.applyMatrix3 vector.applyMatrix3( matrix )} instead.
   */
	multiplyVector3( vector: Vector3 ): any;

	/**
   * @deprecated This method has been removed completely.
   */
	multiplyVector3Array( a: any ): any;
	getInverse( matrix: Matrix4, throwOnDegenerate?: boolean ): Matrix3;

	/**
   * @deprecated Use {@link Matrix3#toArray .toArray()} instead.
   */
	flattenToArrayOffset( array: number[], offset: number ): number[];

}
