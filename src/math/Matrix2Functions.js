/**
 * A structural type describing any object that stores a 2x2 matrix as a
 * column-major list of 4 numbers, exactly like {@link Matrix2#elements}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Matrix2} instance. Since {@link Matrix2}
 * exposes a compatible `elements` array, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} Matrix2Like
 * @property {Array<number>|TypedArray} elements - A column-major list of 4 matrix values.
 */

/**
 * Creates a new, plain {@link Matrix2Like} object holding an identity matrix.
 *
 * Unlike `new Matrix2()`, the returned object is not a class instance and
 * carries no `isMatrix2` flag - it only satisfies the {@link Matrix2Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Matrix2} class so that unused matrix operations can be tree-shaken.
 *
 * @return {Matrix2Like} A new matrix-like object set to the identity matrix.
 */
export function mat2Create() {

	return {

		elements: [
			1, 0,
			0, 1,
		]

	};

}

/**
 * Sets the elements of the given target. The arguments are supposed to be
 * in row-major order.
 *
 * @param {Matrix2Like} target - The matrix-like object to modify.
 * @param {number} n11 - 1-1 matrix element.
 * @param {number} n12 - 1-2 matrix element.
 * @param {number} n21 - 2-1 matrix element.
 * @param {number} n22 - 2-2 matrix element.
 * @return {Matrix2Like} The target, for chaining.
 */
export function mat2Set( target, n11, n12, n21, n22 ) {

	const te = target.elements;

	te[ 0 ] = n11; te[ 2 ] = n12;
	te[ 1 ] = n21; te[ 3 ] = n22;

	return target;

}

/**
 * Sets the given target to the 2x2 identity matrix.
 *
 * @param {Matrix2Like} [target] - The target the result is stored to.
 * @return {Matrix2Like} The identity matrix.
 */
export function mat2Identity( target = mat2Create() ) {

	return mat2Set(

		target,

		1, 0,
		0, 1

	);

}

/**
 * Sets the elements of the target from the given array.
 *
 * @param {Array<number>} array - The matrix elements in column-major order.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @param {Matrix2Like} [target] - The target the result is stored to.
 * @return {Matrix2Like} The target, for chaining.
 */
export function mat2FromArray( array, offset = 0, target = mat2Create() ) {

	const te = target.elements;

	for ( let i = 0; i < 4; i ++ ) {

		te[ i ] = array[ i + offset ];

	}

	return target;

}
