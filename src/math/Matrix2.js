/**
 * Represents a 2x2 matrix.
 *
 * A Note on Row-Major and Column-Major Ordering:
 *
 * The constructor and {@link Matrix2#set} method take arguments in
 * [row-major]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order}
 * order, while internally they are stored in the {@link Matrix2#elements} array in column-major order.
 * This means that calling:
 * ```js
 * const m = new THREE.Matrix2();
 * m.set( 11, 12,
 *        21, 22 );
 * ```
 * will result in the elements array containing:
 * ```js
 * m.elements = [ 11, 21,
 *                12, 22 ];
 * ```
 * and internally all calculations are performed using column-major ordering.
 * However, as the actual ordering makes no difference mathematically and
 * most people are used to thinking about matrices in row-major order, the
 * three.js documentation shows matrices in row-major order. Just bear in
 * mind that if you are reading the source code, you'll have to take the
 * transpose of any matrices outlined here to make sense of the calculations.
 */
export class Matrix2 {

	/**
	 * Constructs a new 2x2 matrix. The arguments are supposed to be
	 * in row-major order. If no arguments are provided, the constructor
	 * initializes the matrix as an identity matrix.
	 *
	 * @param {number} [n11] - 1-1 matrix element.
	 * @param {number} [n12] - 1-2 matrix element.
	 * @param {number} [n21] - 2-1 matrix element.
	 * @param {number} [n22] - 2-2 matrix element.
	 */
	constructor( n11, n12, n21, n22 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		Matrix2.prototype.isMatrix2 = true;

		/**
		 * A column-major list of matrix values.
		 *
		 * @type {Array<number>}
		 */
		this.elements = [
			1, 0,
			0, 1,
		];

		if ( n11 !== undefined ) {

			this.set( n11, n12, n21, n22 );

		}

	}

	/**
	 * Sets this matrix to the 2x2 identity matrix.
	 *
	 * @return {Matrix2} A reference to this matrix.
	 */
	identity() {

		this.set(
			1, 0,
			0, 1,
		);

		return this;

	}

	/**
	 * Sets the elements of the matrix from the given array.
	 *
	 * @param {Array<number>} array - The matrix elements in column-major order.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @return {Matrix2} A reference to this matrix.
	 */
	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 4; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	/**
	 * Sets the elements of the matrix.The arguments are supposed to be
	 * in row-major order.
	 *
	 * @param {number} n11 - 1-1 matrix element.
	 * @param {number} n12 - 1-2 matrix element.
	 * @param {number} n21 - 2-1 matrix element.
	 * @param {number} n22 - 2-2 matrix element.
	 * @return {Matrix2} A reference to this matrix.
	 */
	set( n11, n12, n21, n22 ) {

		const te = this.elements;

		te[ 0 ] = n11; te[ 2 ] = n12;
		te[ 1 ] = n21; te[ 3 ] = n22;

		return this;

	}

}
