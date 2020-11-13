import { Matrix3 } from './Matrix3';
import { BufferAttribute } from './../core/BufferAttribute';

type Vector2tuple = [number, number];

/**
 * ( interface Vector<T> )
 *
 * Abstract interface of {@link https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js|Vector2},
 * {@link https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js|Vector3}
 * and {@link https://github.com/mrdoob/three.js/blob/master/src/math/Vector4.js|Vector4}.
 *
 * Currently the members of Vector is NOT type safe because it accepts different typed vectors.
 *
 * Those definitions will be changed when TypeScript innovates Generics to be type safe.
 *
 * @example
 * const v:THREE.Vector = new THREE.Vector3();
 * v.addVectors(new THREE.Vector2(0, 1), new THREE.Vector2(2, 3)); // invalid but compiled successfully
 */
export interface Vector {
	setComponent( index: number, value: number ): this;

	getComponent( index: number ): number;

	set( ...args: number[] ): this;

	setScalar( scalar: number ): this;

	/**
	 * copy(v:T):T;
	 */
	copy( v: Vector ): this;

	/**
	 * NOTE: The second argument is deprecated.
	 *
	 * add(v:T):T;
	 */
	add( v: Vector ): this;

	/**
	 * addVectors(a:T, b:T):T;
	 */
	addVectors( a: Vector, b: Vector ): this;

	addScaledVector( vector: Vector, scale: number ): this;

	/**
	 * Adds the scalar value s to this vector's values.
	 */
	addScalar( scalar: number ): this;

	/**
	 * sub(v:T):T;
	 */
	sub( v: Vector ): this;

	/**
	 * subVectors(a:T, b:T):T;
	 */
	subVectors( a: Vector, b: Vector ): this;

	/**
	 * multiplyScalar(s:number):T;
	 */
	multiplyScalar( s: number ): this;

	/**
	 * divideScalar(s:number):T;
	 */
	divideScalar( s: number ): this;

	/**
	 * negate():T;
	 */
	negate(): this;

	/**
	 * dot(v:T):T;
	 */
	dot( v: Vector ): number;

	/**
	 * lengthSq():number;
	 */
	lengthSq(): number;

	/**
	 * length():number;
	 */
	length(): number;

	/**
	 * normalize():T;
	 */
	normalize(): this;

	/**
	 * NOTE: Vector4 doesn't have the property.
	 *
	 * distanceTo(v:T):number;
	 */
	distanceTo?( v: Vector ): number;

	/**
	 * NOTE: Vector4 doesn't have the property.
	 *
	 * distanceToSquared(v:T):number;
	 */
	distanceToSquared?( v: Vector ): number;

	/**
	 * setLength(l:number):T;
	 */
	setLength( l: number ): this;

	/**
	 * lerp(v:T, alpha:number):T;
	 */
	lerp( v: Vector, alpha: number ): this;

	/**
	 * equals(v:T):boolean;
	 */
	equals( v: Vector ): boolean;

	/**
	 * clone():T;
	 */
	clone(): this;
}

/**
 * 2D vector.
 *
 * ( class Vector2 implements Vector<Vector2> )
 */
export class Vector2 implements Vector {

	constructor( x?: number, y?: number );

	/**
	 * @default 0
	 */
	x: number;

	/**
	 * @default 0
	 */
	y: number;
	width: number;
	height: number;
	readonly isVector2: true;

	/**
	 * Sets value of this vector.
	 */
	set( x: number, y: number ): this;

	/**
	 * Sets the x and y values of this vector both equal to scalar.
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
	 * Sets a component of this vector.
	 */
	setComponent( index: number, value: number ): this;

	/**
	 * Gets a component of this vector.
	 */
	getComponent( index: number ): number;

	/**
	 * Returns a new Vector2 instance with the same `x` and `y` values.
	 */
	clone(): this;

	/**
	 * Copies value of v to this vector.
	 */
	copy( v: Vector2 ): this;

	/**
	 * Adds v to this vector.
	 */
	add( v: Vector2, w?: Vector2 ): this;

	/**
	 * Adds the scalar value s to this vector's x and y values.
	 */
	addScalar( s: number ): this;

	/**
	 * Sets this vector to a + b.
	 */
	addVectors( a: Vector2, b: Vector2 ): this;

	/**
	 * Adds the multiple of v and s to this vector.
	 */
	addScaledVector( v: Vector2, s: number ): this;

	/**
	 * Subtracts v from this vector.
	 */
	sub( v: Vector2 ): this;

	/**
	 * Subtracts s from this vector's x and y components.
	 */
	subScalar( s: number ): this;

	/**
	 * Sets this vector to a - b.
	 */
	subVectors( a: Vector2, b: Vector2 ): this;

	/**
	 * Multiplies this vector by v.
	 */
	multiply( v: Vector2 ): this;

	/**
	 * Multiplies this vector by scalar s.
	 */
	multiplyScalar( scalar: number ): this;

	/**
	 * Divides this vector by v.
	 */
	divide( v: Vector2 ): this;

	/**
	 * Divides this vector by scalar s.
	 * Set vector to ( 0, 0 ) if s == 0.
	 */
	divideScalar( s: number ): this;

	/**
	 * Multiplies this vector (with an implicit 1 as the 3rd component) by m.
	 */
	applyMatrix3( m: Matrix3 ): this;

	/**
	 * If this vector's x or y value is greater than v's x or y value, replace that value with the corresponding min value.
	 */
	min( v: Vector2 ): this;

	/**
	 * If this vector's x or y value is less than v's x or y value, replace that value with the corresponding max value.
	 */
	max( v: Vector2 ): this;

	/**
	 * If this vector's x or y value is greater than the max vector's x or y value, it is replaced by the corresponding value.
	 * If this vector's x or y value is less than the min vector's x or y value, it is replaced by the corresponding value.
	 * @param min the minimum x and y values.
	 * @param max the maximum x and y values in the desired range.
	 */
	clamp( min: Vector2, max: Vector2 ): this;

	/**
	 * If this vector's x or y values are greater than the max value, they are replaced by the max value.
	 * If this vector's x or y values are less than the min value, they are replaced by the min value.
	 * @param min the minimum value the components will be clamped to.
	 * @param max the maximum value the components will be clamped to.
	 */
	clampScalar( min: number, max: number ): this;

	/**
	 * If this vector's length is greater than the max value, it is replaced by the max value.
	 * If this vector's length is less than the min value, it is replaced by the min value.
	 * @param min the minimum value the length will be clamped to.
	 * @param max the maximum value the length will be clamped to.
	 */
	clampLength( min: number, max: number ): this;

	/**
	 * The components of the vector are rounded down to the nearest integer value.
	 */
	floor(): this;

	/**
	 * The x and y components of the vector are rounded up to the nearest integer value.
	 */
	ceil(): this;

	/**
	 * The components of the vector are rounded to the nearest integer value.
	 */
	round(): this;

	/**
	 * The components of the vector are rounded towards zero (up if negative, down if positive) to an integer value.
	 */
	roundToZero(): this;

	/**
	 * Inverts this vector.
	 */
	negate(): this;

	/**
	 * Computes dot product of this vector and v.
	 */
	dot( v: Vector2 ): number;

	/**
	 * Computes cross product of this vector and v.
	 */
	cross( v: Vector2 ): number;

	/**
	 * Computes squared length of this vector.
	 */
	lengthSq(): number;

	/**
	 * Computes length of this vector.
	 */
	length(): number;

	/**
	 * @deprecated Use {@link Vector2#manhattanLength .manhattanLength()} instead.
	 */
	lengthManhattan(): number;

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
	 * computes the angle in radians with respect to the positive x-axis
	 */
	angle(): number;

	/**
	 * Computes distance of this vector to v.
	 */
	distanceTo( v: Vector2 ): number;

	/**
	 * Computes squared distance of this vector to v.
	 */
	distanceToSquared( v: Vector2 ): number;

	/**
	 * @deprecated Use {@link Vector2#manhattanDistanceTo .manhattanDistanceTo()} instead.
	 */
	distanceToManhattan( v: Vector2 ): number;

	/**
	 * Computes the Manhattan length (distance) from this vector to the given vector v
	 *
	 * @param {Vector2} v
	 *
	 * @return {number}
	 *
	 * @see {@link http://en.wikipedia.org/wiki/Taxicab_geometry|Wikipedia: Taxicab Geometry}
	 */
	manhattanDistanceTo( v: Vector2 ): number;

	/**
	 * Normalizes this vector and multiplies it by l.
	 */
	setLength( length: number ): this;

	/**
	 * Linearly interpolates between this vector and v, where alpha is the distance along the line - alpha = 0 will be this vector, and alpha = 1 will be v.
	 * @param v vector to interpolate towards.
	 * @param alpha interpolation factor in the closed interval [0, 1].
	 */
	lerp( v: Vector2, alpha: number ): this;

	/**
	 * Sets this vector to be the vector linearly interpolated between v1 and v2 where alpha is the distance along the line connecting the two vectors - alpha = 0 will be v1, and alpha = 1 will be v2.
	 * @param v1 the starting vector.
	 * @param v2 vector to interpolate towards.
	 * @param alpha interpolation factor in the closed interval [0, 1].
	 */
	lerpVectors( v1: Vector2, v2: Vector2, alpha: number ): this;

	/**
	 * Checks for strict equality of this vector and v.
	 */
	equals( v: Vector2 ): boolean;

	/**
	 * Sets this vector's x and y value from the provided array.
	 * @param array the source array.
	 * @param offset (optional) offset into the array. Default is 0.
	 */
	fromArray( array: number[], offset?: number ): this;

	/**
	 * Sets this vector's x and y value from the provided array-like.
	 * @param array the source array-like.
	 * @param offset (optional) offset into the array-like. Default is 0.
	 */
	fromArray( array: ArrayLike<number>, offset?: number ): this;

	/**
	 * Returns an array [x, y], or copies x and y into the provided array.
	 * @param array (optional) array to store the vector to. If this is not provided, a new array will be created.
	 * @param offset (optional) optional offset into the array.
	 * @return The created or provided array.
	 */
	toArray( array?: number[], offset?: number ): number[];
	toArray( array?: Vector2tuple, offset?: 0 ): Vector2tuple;

	/**
	 * Copies x and y into the provided array-like.
	 * @param array array-like to store the vector to.
	 * @param offset (optional) optional offset into the array.
	 * @return The provided array-like.
	 */
	toArray( array: ArrayLike<number>, offset?: number ): ArrayLike<number>;

	/**
	 * Sets this vector's x and y values from the attribute.
	 * @param attribute the source attribute.
	 * @param index index in the attribute.
	 */
	fromBufferAttribute( attribute: BufferAttribute, index: number ): this;

	/**
	 * Rotates the vector around center by angle radians.
	 * @param center the point around which to rotate.
	 * @param angle the angle to rotate, in radians.
	 */
	rotateAround( center: Vector2, angle: number ): this;

	/**
	 * Sets this vector's x and y from Math.random
	 */
	random(): this;

}
