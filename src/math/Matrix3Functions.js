import { warnOnce } from '../utils.js';

/**
 * A structural type describing any object that stores a 3x3 matrix as a
 * column-major list of 9 numbers, exactly like {@link Matrix3#elements}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Matrix3} instance. Since {@link Matrix3}
 * exposes a compatible `elements` array, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} Matrix3Like
 * @property {Array<number>|TypedArray} elements - A column-major list of 9 matrix values.
 */

/**
 * Creates a new, plain {@link Matrix3Like} object holding an identity matrix.
 *
 * Unlike `new Matrix3()`, the returned object is not a class instance and
 * carries no `isMatrix3` flag - it only satisfies the {@link Matrix3Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Matrix3} class so that unused matrix operations can be tree-shaken.
 *
 * @return {Matrix3Like} A new matrix-like object set to the identity matrix.
 */
export function mat3Create() {

	return {

		elements: [

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		]

	};

}

/**
 * Sets the elements of the given target. The arguments are supposed to be
 * in row-major order.
 *
 * @param {Matrix3Like} target - The matrix-like object to modify.
 * @param {number} [n11] - 1-1 matrix element.
 * @param {number} [n12] - 1-2 matrix element.
 * @param {number} [n13] - 1-3 matrix element.
 * @param {number} [n21] - 2-1 matrix element.
 * @param {number} [n22] - 2-2 matrix element.
 * @param {number} [n23] - 2-3 matrix element.
 * @param {number} [n31] - 3-1 matrix element.
 * @param {number} [n32] - 3-2 matrix element.
 * @param {number} [n33] - 3-3 matrix element.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Set( target, n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

	const te = target.elements;

	te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
	te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
	te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;

	return target;

}

/**
 * Sets the given target to the 3x3 identity matrix.
 *
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The identity matrix.
 */
export function mat3Identity( target = mat3Create() ) {

	return mat3Set(

		target,

		1, 0, 0,
		0, 1, 0,
		0, 0, 1

	);

}

/**
 * Copies the values of the given matrix into the target.
 *
 * @param {Matrix3Like} m - The matrix to copy.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} A copy of `m`.
 */
export function mat3Copy( m, target = mat3Create() ) {

	const te = target.elements;
	const me = m.elements;

	te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
	te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
	te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

	return target;

}

/**
 * Extracts the basis of the given matrix into the three axis vectors provided.
 *
 * @param {Matrix3Like} m - The matrix to extract the basis from.
 * @param {Vector3Like} xAxis - The basis's x axis.
 * @param {Vector3Like} yAxis - The basis's y axis.
 * @param {Vector3Like} zAxis - The basis's z axis.
 * @return {Matrix3Like} `m`, unchanged.
 */
export function mat3ExtractBasis( m, xAxis, yAxis, zAxis ) {

	const me = m.elements;

	xAxis.x = me[ 0 ]; xAxis.y = me[ 1 ]; xAxis.z = me[ 2 ];
	yAxis.x = me[ 3 ]; yAxis.y = me[ 4 ]; yAxis.z = me[ 5 ];
	zAxis.x = me[ 6 ]; zAxis.y = me[ 7 ]; zAxis.z = me[ 8 ];

	return m;

}

/**
 * Set the target to the upper 3x3 matrix of the given 4x4 matrix.
 *
 * @param {Matrix4Like} m - The 4x4 matrix-like object.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3SetFromMatrix4( m, target = mat3Create() ) {

	const me = m.elements;

	return mat3Set(

		target,

		me[ 0 ], me[ 4 ], me[ 8 ],
		me[ 1 ], me[ 5 ], me[ 9 ],
		me[ 2 ], me[ 6 ], me[ 10 ]

	);

}

/**
 * Post-multiplies `a` by `b` (`a` × `b`) and stores the result in the target.
 *
 * @param {Matrix3Like} a - The first matrix.
 * @param {Matrix3Like} b - The matrix to multiply with.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Multiply( a, b, target = mat3Create() ) {

	return mat3MultiplyMatrices( a, b, target );

}

/**
 * Pre-multiplies `a` by `b` (`b` × `a`) and stores the result in the target.
 *
 * @param {Matrix3Like} a - The first matrix.
 * @param {Matrix3Like} b - The matrix to multiply with.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3PreMultiply( a, b, target = mat3Create() ) {

	return mat3MultiplyMatrices( b, a, target );

}

/**
 * Multiplies the given 3x3 matrices and stores the result in the target.
 *
 * @param {Matrix3Like} a - The first matrix.
 * @param {Matrix3Like} b - The second matrix.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3MultiplyMatrices( a, b, target = mat3Create() ) {

	const ae = a.elements;
	const be = b.elements;
	const te = target.elements;

	const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
	const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
	const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

	const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
	const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
	const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

	te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
	te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
	te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

	te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
	te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
	te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

	te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
	te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
	te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

	return target;

}

/**
 * Multiplies every component of the given matrix by the given scalar and
 * stores the result in the target.
 *
 * @param {Matrix3Like} m - The matrix.
 * @param {number} s - The scalar.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3MultiplyScalar( m, s, target = mat3Create() ) {

	const me = m.elements;
	const te = target.elements;

	te[ 0 ] = me[ 0 ] * s; te[ 3 ] = me[ 3 ] * s; te[ 6 ] = me[ 6 ] * s;
	te[ 1 ] = me[ 1 ] * s; te[ 4 ] = me[ 4 ] * s; te[ 7 ] = me[ 7 ] * s;
	te[ 2 ] = me[ 2 ] * s; te[ 5 ] = me[ 5 ] * s; te[ 8 ] = me[ 8 ] * s;

	return target;

}

/**
 * Computes and returns the determinant of the given matrix.
 *
 * @param {Matrix3Like} m - The matrix.
 * @return {number} The determinant.
 */
export function mat3Determinant( m ) {

	const te = m.elements;

	const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
		d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
		g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

	return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

}

/**
 * Inverts the given matrix, using the [analytic method](https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution),
 * and stores the result in the target. You can not invert a matrix with a
 * determinant of zero. If you attempt this, the target becomes a zero matrix instead.
 *
 * @param {Matrix3Like} m - The matrix.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Invert( m, target = mat3Create() ) {

	const me = m.elements,

		n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
		n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
		n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],

		t11 = n33 * n22 - n32 * n23,
		t12 = n32 * n13 - n33 * n12,
		t13 = n23 * n12 - n22 * n13,

		det = n11 * t11 + n21 * t12 + n31 * t13;

	if ( det === 0 ) return mat3Set( target, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

	const detInv = 1 / det;
	const te = target.elements;

	te[ 0 ] = t11 * detInv;
	te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
	te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

	te[ 3 ] = t12 * detInv;
	te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
	te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

	te[ 6 ] = t13 * detInv;
	te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
	te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

	return target;

}

/**
 * Transposes the given matrix and stores the result in the target.
 *
 * @param {Matrix3Like} m - The matrix.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Transpose( m, target = mat3Create() ) {

	const me = m.elements;
	const te = target.elements;

	if ( te === me ) {

		let tmp;

		tmp = te[ 1 ]; te[ 1 ] = te[ 3 ]; te[ 3 ] = tmp;
		tmp = te[ 2 ]; te[ 2 ] = te[ 6 ]; te[ 6 ] = tmp;
		tmp = te[ 5 ]; te[ 5 ] = te[ 7 ]; te[ 7 ] = tmp;

	} else {

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 3 ]; te[ 2 ] = me[ 6 ];
		te[ 3 ] = me[ 1 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 7 ];
		te[ 6 ] = me[ 2 ]; te[ 7 ] = me[ 5 ]; te[ 8 ] = me[ 8 ];

	}

	return target;

}

/**
 * Computes the normal matrix which is the inverse transpose of the upper
 * left 3x3 portion of the given 4x4 matrix.
 *
 * @param {Matrix4Like} matrix4 - The 4x4 matrix-like object.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3GetNormalMatrix( matrix4, target = mat3Create() ) {

	return mat3Transpose( mat3Invert( mat3SetFromMatrix4( matrix4, target ), target ), target );

}

/**
 * Transposes the given matrix into the supplied array, and returns the matrix unchanged.
 *
 * @param {Matrix3Like} m - The matrix.
 * @param {Array<number>} r - An array to store the transposed matrix elements.
 * @return {Matrix3Like} `m`, unchanged.
 */
export function mat3TransposeIntoArray( m, r ) {

	const me = m.elements;

	r[ 0 ] = me[ 0 ];
	r[ 1 ] = me[ 3 ];
	r[ 2 ] = me[ 6 ];
	r[ 3 ] = me[ 1 ];
	r[ 4 ] = me[ 4 ];
	r[ 5 ] = me[ 7 ];
	r[ 6 ] = me[ 2 ];
	r[ 7 ] = me[ 5 ];
	r[ 8 ] = me[ 8 ];

	return m;

}

/**
 * Sets the UV transform matrix from offset, repeat, rotation, and center.
 *
 * @param {number} tx - Offset x.
 * @param {number} ty - Offset y.
 * @param {number} sx - Repeat x.
 * @param {number} sy - Repeat y.
 * @param {number} rotation - Rotation, in radians. Positive values rotate counterclockwise.
 * @param {number} cx - Center x of rotation.
 * @param {number} cy - Center y of rotation.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3SetUvTransform( tx, ty, sx, sy, rotation, cx, cy, target = mat3Create() ) {

	const c = Math.cos( rotation );
	const s = Math.sin( rotation );

	return mat3Set(
		target,
		sx * c, sx * s, - sx * ( c * cx + s * cy ) + cx + tx,
		- sy * s, sy * c, - sy * ( - s * cx + c * cy ) + cy + ty,
		0, 0, 1
	);

}

/**
 * Scales the given matrix with the given scalar values.
 *
 * @deprecated
 * @param {Matrix3Like} m - The matrix.
 * @param {number} sx - The amount to scale in the X axis.
 * @param {number} sy - The amount to scale in the Y axis.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Scale( m, sx, sy, target = mat3Create() ) {

	warnOnce( 'Matrix3: .scale() is deprecated. Use .makeScale() instead.' ); // @deprecated r185

	return mat3PreMultiply( m, mat3MakeScale( sx, sy, _m3 ), target );

}

/**
 * Rotates the given matrix by the given angle.
 *
 * @deprecated
 * @param {Matrix3Like} m - The matrix.
 * @param {number} theta - The rotation in radians.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Rotate( m, theta, target = mat3Create() ) {

	warnOnce( 'Matrix3: .rotate() is deprecated. Use .makeRotation() instead.' ); // @deprecated r185

	return mat3PreMultiply( m, mat3MakeRotation( - theta, _m3 ), target );

}

/**
 * Translates the given matrix by the given scalar values.
 *
 * @deprecated
 * @param {Matrix3Like} m - The matrix.
 * @param {number} tx - The amount to translate in the X axis.
 * @param {number} ty - The amount to translate in the Y axis.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3Translate( m, tx, ty, target = mat3Create() ) {

	warnOnce( 'Matrix3: .translate() is deprecated. Use .makeTranslation() instead.' ); // @deprecated r185

	return mat3PreMultiply( m, mat3MakeTranslation( tx, ty, _m3 ), target );

}

/**
 * Sets the target as a 2D translation transform.
 *
 * @param {number|Vector2Like} x - The amount to translate in the X axis or alternatively a translation vector.
 * @param {number} y - The amount to translate in the Y axis.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3MakeTranslation( x, y, target = mat3Create() ) {

	if ( x.isVector2 ) {

		return mat3Set(

			target,

			1, 0, x.x,
			0, 1, x.y,
			0, 0, 1

		);

	} else {

		return mat3Set(

			target,

			1, 0, x,
			0, 1, y,
			0, 0, 1

		);

	}

}

/**
 * Sets the target as a 2D rotational transformation.
 *
 * @param {number} theta - The rotation in radians.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3MakeRotation( theta, target = mat3Create() ) {

	// counterclockwise

	const c = Math.cos( theta );
	const s = Math.sin( theta );

	return mat3Set(

		target,

		c, - s, 0,
		s, c, 0,
		0, 0, 1

	);

}

/**
 * Sets the target as a 2D scale transform.
 *
 * @param {number} x - The amount to scale in the X axis.
 * @param {number} y - The amount to scale in the Y axis.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3MakeScale( x, y, target = mat3Create() ) {

	return mat3Set(

		target,

		x, 0, 0,
		0, y, 0,
		0, 0, 1

	);

}

/**
 * Returns `true` if the two matrices are equal.
 *
 * @param {Matrix3Like} a - The first matrix.
 * @param {Matrix3Like} b - The second matrix.
 * @return {boolean} Whether the matrices are equal.
 */
export function mat3Equals( a, b ) {

	const ae = a.elements;
	const be = b.elements;

	for ( let i = 0; i < 9; i ++ ) {

		if ( ae[ i ] !== be[ i ] ) return false;

	}

	return true;

}

/**
 * Sets the elements of the target from the given array.
 *
 * @param {Array<number>} array - The matrix elements in column-major order.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @param {Matrix3Like} [target] - The target the result is stored to.
 * @return {Matrix3Like} The target, for chaining.
 */
export function mat3FromArray( array, offset = 0, target = mat3Create() ) {

	const te = target.elements;

	for ( let i = 0; i < 9; i ++ ) {

		te[ i ] = array[ i + offset ];

	}

	return target;

}

/**
 * Writes the elements of the given matrix to an array. If no array is provided,
 * the method returns a new instance.
 *
 * @param {Matrix3Like} m - The matrix.
 * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The matrix elements in column-major order.
 */
export function mat3ToArray( m, array = [], offset = 0 ) {

	const te = m.elements;

	array[ offset ] = te[ 0 ];
	array[ offset + 1 ] = te[ 1 ];
	array[ offset + 2 ] = te[ 2 ];

	array[ offset + 3 ] = te[ 3 ];
	array[ offset + 4 ] = te[ 4 ];
	array[ offset + 5 ] = te[ 5 ];

	array[ offset + 6 ] = te[ 6 ];
	array[ offset + 7 ] = te[ 7 ];
	array[ offset + 8 ] = te[ 8 ];

	return array;

}

const _m3 = /*@__PURE__*/ mat3Create();
