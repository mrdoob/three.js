import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../constants.js';

/**
 * A structural type describing any object that stores a 4x4 matrix as a
 * column-major list of 16 numbers, exactly like {@link Matrix4#elements}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Matrix4} instance. Since {@link Matrix4}
 * exposes a compatible `elements` array, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} Matrix4Like
 * @property {Array<number>|TypedArray} elements - A column-major list of 16 matrix values.
 */

/**
 * Creates a new, plain {@link Matrix4Like} object holding an identity matrix.
 *
 * Unlike `new Matrix4()`, the returned object is not a class instance and
 * carries no `isMatrix4` flag - it only satisfies the {@link Matrix4Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Matrix4} class so that unused matrix operations can be tree-shaken.
 *
 * @return {Matrix4Like} A new matrix-like object set to the identity matrix.
 */
export function mat4Create() {

	return {

		elements: [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		]

	};

}

/**
 * Sets the elements of the given target. The arguments are supposed to be
 * in row-major order.
 *
 * @param {Matrix4Like} target - The matrix-like object to modify.
 * @param {number} [n11] - 1-1 matrix element.
 * @param {number} [n12] - 1-2 matrix element.
 * @param {number} [n13] - 1-3 matrix element.
 * @param {number} [n14] - 1-4 matrix element.
 * @param {number} [n21] - 2-1 matrix element.
 * @param {number} [n22] - 2-2 matrix element.
 * @param {number} [n23] - 2-3 matrix element.
 * @param {number} [n24] - 2-4 matrix element.
 * @param {number} [n31] - 3-1 matrix element.
 * @param {number} [n32] - 3-2 matrix element.
 * @param {number} [n33] - 3-3 matrix element.
 * @param {number} [n34] - 3-4 matrix element.
 * @param {number} [n41] - 4-1 matrix element.
 * @param {number} [n42] - 4-2 matrix element.
 * @param {number} [n43] - 4-3 matrix element.
 * @param {number} [n44] - 4-4 matrix element.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4Set( target, n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	const te = target.elements;

	te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
	te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
	te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
	te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

	return target;

}

/**
 * Sets the given target to the 4x4 identity matrix.
 *
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The identity matrix.
 */
export function mat4Identity( target = mat4Create() ) {

	return mat4Set(

		target,

		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1

	);

}

/**
 * Copies the values of the given matrix into the target.
 *
 * @param {Matrix4Like} m - The matrix to copy.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} A copy of `m`.
 */
export function mat4Copy( m, target = mat4Create() ) {

	const te = target.elements;
	const me = m.elements;

	te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ]; te[ 3 ] = me[ 3 ];
	te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ];
	te[ 8 ] = me[ 8 ]; te[ 9 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 11 ] = me[ 11 ];
	te[ 12 ] = me[ 12 ]; te[ 13 ] = me[ 13 ]; te[ 14 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];

	return target;

}

/**
 * Copies the translation component of the given matrix into the
 * translation component of the target, leaving the rest of the target
 * unchanged.
 *
 * @param {Matrix4Like} m - The matrix to copy the translation component from.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4CopyPosition( m, target = mat4Create() ) {

	const te = target.elements, me = m.elements;

	te[ 12 ] = me[ 12 ];
	te[ 13 ] = me[ 13 ];
	te[ 14 ] = me[ 14 ];

	return target;

}

/**
 * Sets the upper 3x3 elements of the target to the values of the given 3x3 matrix.
 *
 * @param {Matrix3Like} m - The 3x3 matrix-like object.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4SetFromMatrix3( m, target = mat4Create() ) {

	const me = m.elements;

	return mat4Set(

		target,

		me[ 0 ], me[ 3 ], me[ 6 ], 0,
		me[ 1 ], me[ 4 ], me[ 7 ], 0,
		me[ 2 ], me[ 5 ], me[ 8 ], 0,
		0, 0, 0, 1

	);

}

/**
 * Extracts the basis vectors of the given matrix into the three vectors provided.
 *
 * @param {Matrix4Like} m - The matrix to extract the basis from.
 * @param {Vector3Like} xAxis - The basis's x axis.
 * @param {Vector3Like} yAxis - The basis's y axis.
 * @param {Vector3Like} zAxis - The basis's z axis.
 * @return {Matrix4Like} `m`, unchanged.
 */
export function mat4ExtractBasis( m, xAxis, yAxis, zAxis ) {

	if ( mat4DeterminantAffine( m ) === 0 ) {

		xAxis.set( 1, 0, 0 );
		yAxis.set( 0, 1, 0 );
		zAxis.set( 0, 0, 1 );

		return m;

	}

	const me = m.elements;

	xAxis.set( me[ 0 ], me[ 1 ], me[ 2 ] );
	yAxis.set( me[ 4 ], me[ 5 ], me[ 6 ] );
	zAxis.set( me[ 8 ], me[ 9 ], me[ 10 ] );

	return m;

}

/**
 * Sets the given basis vectors to the target matrix.
 *
 * @param {Vector3Like} xAxis - The basis's x axis.
 * @param {Vector3Like} yAxis - The basis's y axis.
 * @param {Vector3Like} zAxis - The basis's z axis.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeBasis( xAxis, yAxis, zAxis, target = mat4Create() ) {

	return mat4Set(

		target,

		xAxis.x, yAxis.x, zAxis.x, 0,
		xAxis.y, yAxis.y, zAxis.y, 0,
		xAxis.z, yAxis.z, zAxis.z, 0,
		0, 0, 0, 1

	);

}

/**
 * Extracts the rotation component of the given matrix into the target.
 *
 * Note: This method does not support reflection matrices.
 *
 * @param {Matrix4Like} m - The matrix.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4ExtractRotation( m, target = mat4Create() ) {

	if ( mat4DeterminantAffine( m ) === 0 ) {

		return mat4Identity( target );

	}

	const me = m.elements;

	const scaleX = 1 / Math.sqrt( me[ 0 ] * me[ 0 ] + me[ 1 ] * me[ 1 ] + me[ 2 ] * me[ 2 ] );
	const scaleY = 1 / Math.sqrt( me[ 4 ] * me[ 4 ] + me[ 5 ] * me[ 5 ] + me[ 6 ] * me[ 6 ] );
	const scaleZ = 1 / Math.sqrt( me[ 8 ] * me[ 8 ] + me[ 9 ] * me[ 9 ] + me[ 10 ] * me[ 10 ] );

	const te = target.elements;

	te[ 0 ] = me[ 0 ] * scaleX;
	te[ 1 ] = me[ 1 ] * scaleX;
	te[ 2 ] = me[ 2 ] * scaleX;
	te[ 3 ] = 0;

	te[ 4 ] = me[ 4 ] * scaleY;
	te[ 5 ] = me[ 5 ] * scaleY;
	te[ 6 ] = me[ 6 ] * scaleY;
	te[ 7 ] = 0;

	te[ 8 ] = me[ 8 ] * scaleZ;
	te[ 9 ] = me[ 9 ] * scaleZ;
	te[ 10 ] = me[ 10 ] * scaleZ;
	te[ 11 ] = 0;

	te[ 12 ] = 0;
	te[ 13 ] = 0;
	te[ 14 ] = 0;
	te[ 15 ] = 1;

	return target;

}

/**
 * Sets the rotation component (the upper left 3x3 matrix) of the target to
 * the rotation specified by the given Euler angles. The rest of the target
 * is set to the identity. Depending on the {@link Euler#order}, there are
 * six possible outcomes. See [this page](https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix)
 * for a complete list.
 *
 * @param {EulerLike} euler - The Euler angles.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeRotationFromEuler( euler, target = mat4Create() ) {

	const te = target.elements;

	const x = euler.x, y = euler.y, z = euler.z;
	const a = Math.cos( x ), b = Math.sin( x );
	const c = Math.cos( y ), d = Math.sin( y );
	const e = Math.cos( z ), f = Math.sin( z );

	if ( euler.order === 'XYZ' ) {

		const ae = a * e, af = a * f, be = b * e, bf = b * f;

		te[ 0 ] = c * e;
		te[ 4 ] = - c * f;
		te[ 8 ] = d;

		te[ 1 ] = af + be * d;
		te[ 5 ] = ae - bf * d;
		te[ 9 ] = - b * c;

		te[ 2 ] = bf - ae * d;
		te[ 6 ] = be + af * d;
		te[ 10 ] = a * c;

	} else if ( euler.order === 'YXZ' ) {

		const ce = c * e, cf = c * f, de = d * e, df = d * f;

		te[ 0 ] = ce + df * b;
		te[ 4 ] = de * b - cf;
		te[ 8 ] = a * d;

		te[ 1 ] = a * f;
		te[ 5 ] = a * e;
		te[ 9 ] = - b;

		te[ 2 ] = cf * b - de;
		te[ 6 ] = df + ce * b;
		te[ 10 ] = a * c;

	} else if ( euler.order === 'ZXY' ) {

		const ce = c * e, cf = c * f, de = d * e, df = d * f;

		te[ 0 ] = ce - df * b;
		te[ 4 ] = - a * f;
		te[ 8 ] = de + cf * b;

		te[ 1 ] = cf + de * b;
		te[ 5 ] = a * e;
		te[ 9 ] = df - ce * b;

		te[ 2 ] = - a * d;
		te[ 6 ] = b;
		te[ 10 ] = a * c;

	} else if ( euler.order === 'ZYX' ) {

		const ae = a * e, af = a * f, be = b * e, bf = b * f;

		te[ 0 ] = c * e;
		te[ 4 ] = be * d - af;
		te[ 8 ] = ae * d + bf;

		te[ 1 ] = c * f;
		te[ 5 ] = bf * d + ae;
		te[ 9 ] = af * d - be;

		te[ 2 ] = - d;
		te[ 6 ] = b * c;
		te[ 10 ] = a * c;

	} else if ( euler.order === 'YZX' ) {

		const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

		te[ 0 ] = c * e;
		te[ 4 ] = bd - ac * f;
		te[ 8 ] = bc * f + ad;

		te[ 1 ] = f;
		te[ 5 ] = a * e;
		te[ 9 ] = - b * e;

		te[ 2 ] = - d * e;
		te[ 6 ] = ad * f + bc;
		te[ 10 ] = ac - bd * f;

	} else if ( euler.order === 'XZY' ) {

		const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

		te[ 0 ] = c * e;
		te[ 4 ] = - f;
		te[ 8 ] = d * e;

		te[ 1 ] = ac * f + bd;
		te[ 5 ] = a * e;
		te[ 9 ] = ad * f - bc;

		te[ 2 ] = bc * f - ad;
		te[ 6 ] = b * e;
		te[ 10 ] = bd * f + ac;

	}

	// bottom row
	te[ 3 ] = 0;
	te[ 7 ] = 0;
	te[ 11 ] = 0;

	// last column
	te[ 12 ] = 0;
	te[ 13 ] = 0;
	te[ 14 ] = 0;
	te[ 15 ] = 1;

	return target;

}

/**
 * Sets the rotation component of the target to the rotation specified by
 * the given Quaternion as outlined [here](https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion).
 * The rest of the target is set to the identity.
 *
 * @param {QuaternionLike} quaternion - The Quaternion.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeRotationFromQuaternion( quaternion, target = mat4Create() ) {

	return mat4Compose( _zero, quaternion, _one, target );

}

/**
 * Sets the rotation component of the target, looking from `eye` towards
 * `target`, and oriented by the up-direction, leaving the rest of the
 * output unchanged.
 *
 * @param {Vector3Like} eye - The eye vector.
 * @param {Vector3Like} lookTarget - The target vector.
 * @param {Vector3Like} up - The up vector.
 * @param {Matrix4Like} [out] - The output the result is stored to.
 * @return {Matrix4Like} The output, for chaining.
 */
export function mat4LookAt( eye, lookTarget, up, out = mat4Create() ) {

	const te = out.elements;

	let zx = eye.x - lookTarget.x;
	let zy = eye.y - lookTarget.y;
	let zz = eye.z - lookTarget.z;

	if ( zx * zx + zy * zy + zz * zz === 0 ) {

		// eye and target are in the same position

		zz = 1;

	}

	let zLen = Math.sqrt( zx * zx + zy * zy + zz * zz );
	zx /= zLen; zy /= zLen; zz /= zLen;

	let xx = up.y * zz - up.z * zy;
	let xy = up.z * zx - up.x * zz;
	let xz = up.x * zy - up.y * zx;

	if ( xx * xx + xy * xy + xz * xz === 0 ) {

		// up and z are parallel

		if ( Math.abs( up.z ) === 1 ) {

			zx += 0.0001;

		} else {

			zz += 0.0001;

		}

		zLen = Math.sqrt( zx * zx + zy * zy + zz * zz );
		zx /= zLen; zy /= zLen; zz /= zLen;

		xx = up.y * zz - up.z * zy;
		xy = up.z * zx - up.x * zz;
		xz = up.x * zy - up.y * zx;

	}

	const xLen = Math.sqrt( xx * xx + xy * xy + xz * xz );
	xx /= xLen; xy /= xLen; xz /= xLen;

	const yx = zy * xz - zz * xy;
	const yy = zz * xx - zx * xz;
	const yz = zx * xy - zy * xx;

	te[ 0 ] = xx; te[ 4 ] = yx; te[ 8 ] = zx;
	te[ 1 ] = xy; te[ 5 ] = yy; te[ 9 ] = zy;
	te[ 2 ] = xz; te[ 6 ] = yz; te[ 10 ] = zz;

	return out;

}

/**
 * Multiplies the given 4x4 matrices (`a` × `b`) and stores the result in the target.
 *
 * @param {Matrix4Like} a - The first matrix.
 * @param {Matrix4Like} b - The second matrix.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MultiplyMatrices( a, b, target = mat4Create() ) {

	const ae = a.elements;
	const be = b.elements;
	const te = target.elements;

	const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
	const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
	const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
	const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

	const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
	const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
	const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
	const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

	te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
	te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
	te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
	te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

	te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
	te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
	te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
	te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

	te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
	te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
	te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
	te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

	te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
	te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
	te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
	te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

	return target;

}

/**
 * Post-multiplies `a` by `b` (`a` × `b`) and stores the result in the target.
 * Equivalent to {@link mat4MultiplyMatrices}, provided for readability at call sites.
 *
 * @param {Matrix4Like} a - The first matrix.
 * @param {Matrix4Like} b - The matrix to multiply with.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4Multiply( a, b, target = mat4Create() ) {

	return mat4MultiplyMatrices( a, b, target );

}

/**
 * Pre-multiplies `a` by `b` (`b` × `a`) and stores the result in the target.
 *
 * @param {Matrix4Like} a - The first matrix.
 * @param {Matrix4Like} b - The matrix to multiply with.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4PreMultiply( a, b, target = mat4Create() ) {

	return mat4MultiplyMatrices( b, a, target );

}

/**
 * Multiplies every component of the given matrix by the given scalar and
 * stores the result in the target.
 *
 * @param {Matrix4Like} m - The matrix.
 * @param {number} s - The scalar.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MultiplyScalar( m, s, target = mat4Create() ) {

	const me = m.elements;
	const te = target.elements;

	te[ 0 ] = me[ 0 ] * s; te[ 4 ] = me[ 4 ] * s; te[ 8 ] = me[ 8 ] * s; te[ 12 ] = me[ 12 ] * s;
	te[ 1 ] = me[ 1 ] * s; te[ 5 ] = me[ 5 ] * s; te[ 9 ] = me[ 9 ] * s; te[ 13 ] = me[ 13 ] * s;
	te[ 2 ] = me[ 2 ] * s; te[ 6 ] = me[ 6 ] * s; te[ 10 ] = me[ 10 ] * s; te[ 14 ] = me[ 14 ] * s;
	te[ 3 ] = me[ 3 ] * s; te[ 7 ] = me[ 7 ] * s; te[ 11 ] = me[ 11 ] * s; te[ 15 ] = me[ 15 ] * s;

	return target;

}

/**
 * Computes and returns the determinant of the given matrix.
 *
 * Based on the method outlined [here](http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html).
 *
 * @param {Matrix4Like} m - The matrix.
 * @return {number} The determinant.
 */
export function mat4Determinant( m ) {

	const te = m.elements;

	const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
	const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
	const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
	const n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

	const t11 = n23 * n34 - n24 * n33;
	const t12 = n22 * n34 - n24 * n32;
	const t13 = n22 * n33 - n23 * n32;

	const t21 = n21 * n34 - n24 * n31;
	const t22 = n21 * n33 - n23 * n31;
	const t23 = n21 * n32 - n22 * n31;

	return n11 * ( n42 * t11 - n43 * t12 + n44 * t13 ) -
		n12 * ( n41 * t11 - n43 * t21 + n44 * t22 ) +
		n13 * ( n41 * t12 - n42 * t21 + n44 * t23 ) -
		n14 * ( n41 * t13 - n42 * t22 + n43 * t23 );

}

/**
 * Computes and returns the determinant of the given matrix, but assumes the
 * matrix is affine, saving some computations.
 *
 * For affine matrices (like an object's world matrix), this value equals the
 * full 4x4 {@link mat4Determinant} but is cheaper to compute.
 *
 * Assumes the bottom row is `[0, 0, 0, 1]`.
 *
 * @param {Matrix4Like} m - The matrix.
 * @return {number} The determinant of the matrix.
 */
export function mat4DeterminantAffine( m ) {

	const te = m.elements;

	const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ];
	const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ];
	const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ];

	return n11 * ( n22 * n33 - n23 * n32 ) -
		n12 * ( n21 * n33 - n23 * n31 ) +
		n13 * ( n21 * n32 - n22 * n31 );

}

/**
 * Transposes the given matrix and stores the result in the target.
 *
 * @param {Matrix4Like} m - The matrix.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4Transpose( m, target = mat4Create() ) {

	const me = m.elements;
	const te = target.elements;

	if ( te === me ) {

		let tmp;

		tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
		tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
		tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;

		tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
		tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
		tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;

	} else {

		te[ 0 ] = me[ 0 ]; te[ 4 ] = me[ 1 ]; te[ 8 ] = me[ 2 ]; te[ 12 ] = me[ 3 ];
		te[ 1 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 9 ] = me[ 6 ]; te[ 13 ] = me[ 7 ];
		te[ 2 ] = me[ 8 ]; te[ 6 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 14 ] = me[ 11 ];
		te[ 3 ] = me[ 12 ]; te[ 7 ] = me[ 13 ]; te[ 11 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];

	}

	return target;

}

/**
 * Sets the position component of the target from the given vector or
 * components, copying the rest of the matrix from `m`.
 *
 * @param {Matrix4Like} m - The matrix to copy the non-position components from.
 * @param {number|Vector3Like} x - The x component of the vector or alternatively the vector object.
 * @param {number} y - The y component of the vector.
 * @param {number} z - The z component of the vector.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4SetPosition( m, x, y, z, target = mat4Create() ) {

	if ( target !== m ) mat4Copy( m, target );

	const te = target.elements;

	if ( x.isVector3 ) {

		te[ 12 ] = x.x;
		te[ 13 ] = x.y;
		te[ 14 ] = x.z;

	} else {

		te[ 12 ] = x;
		te[ 13 ] = y;
		te[ 14 ] = z;

	}

	return target;

}

/**
 * Inverts the given matrix, using the [analytic method](https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution),
 * and stores the result in the target. You can not invert a matrix with a
 * determinant of zero. If you attempt this, the target becomes a zero matrix instead.
 *
 * @param {Matrix4Like} m - The matrix.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4Invert( m, target = mat4Create() ) {

	// based on https://github.com/toji/gl-matrix
	const me = m.elements,

		n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
		n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
		n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
		n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ],

		t1 = n11 * n22 - n21 * n12,
		t2 = n11 * n32 - n31 * n12,
		t3 = n11 * n42 - n41 * n12,
		t4 = n21 * n32 - n31 * n22,
		t5 = n21 * n42 - n41 * n22,
		t6 = n31 * n42 - n41 * n32,
		t7 = n13 * n24 - n23 * n14,
		t8 = n13 * n34 - n33 * n14,
		t9 = n13 * n44 - n43 * n14,
		t10 = n23 * n34 - n33 * n24,
		t11 = n23 * n44 - n43 * n24,
		t12 = n33 * n44 - n43 * n34;

	const det = t1 * t12 - t2 * t11 + t3 * t10 + t4 * t9 - t5 * t8 + t6 * t7;

	if ( det === 0 ) return mat4Set( target, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

	const detInv = 1 / det;

	const te = target.elements;

	te[ 0 ] = ( n22 * t12 - n32 * t11 + n42 * t10 ) * detInv;
	te[ 1 ] = ( n31 * t11 - n21 * t12 - n41 * t10 ) * detInv;
	te[ 2 ] = ( n24 * t6 - n34 * t5 + n44 * t4 ) * detInv;
	te[ 3 ] = ( n33 * t5 - n23 * t6 - n43 * t4 ) * detInv;

	te[ 4 ] = ( n32 * t9 - n12 * t12 - n42 * t8 ) * detInv;
	te[ 5 ] = ( n11 * t12 - n31 * t9 + n41 * t8 ) * detInv;
	te[ 6 ] = ( n34 * t3 - n14 * t6 - n44 * t2 ) * detInv;
	te[ 7 ] = ( n13 * t6 - n33 * t3 + n43 * t2 ) * detInv;

	te[ 8 ] = ( n12 * t11 - n22 * t9 + n42 * t7 ) * detInv;
	te[ 9 ] = ( n21 * t9 - n11 * t11 - n41 * t7 ) * detInv;
	te[ 10 ] = ( n14 * t5 - n24 * t3 + n44 * t1 ) * detInv;
	te[ 11 ] = ( n23 * t3 - n13 * t5 - n43 * t1 ) * detInv;

	te[ 12 ] = ( n22 * t8 - n12 * t10 - n32 * t7 ) * detInv;
	te[ 13 ] = ( n11 * t10 - n21 * t8 + n31 * t7 ) * detInv;
	te[ 14 ] = ( n24 * t2 - n14 * t4 - n34 * t1 ) * detInv;
	te[ 15 ] = ( n13 * t4 - n23 * t2 + n33 * t1 ) * detInv;

	return target;

}

/**
 * Scales each of the first three columns of the given matrix by the
 * corresponding component of the given vector and stores the result in the target.
 *
 * @param {Matrix4Like} m - The matrix.
 * @param {Vector3Like} v - The scale vector.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4Scale( m, v, target = mat4Create() ) {

	const me = m.elements;
	const te = target.elements;
	const x = v.x, y = v.y, z = v.z;

	te[ 0 ] = me[ 0 ] * x; te[ 4 ] = me[ 4 ] * y; te[ 8 ] = me[ 8 ] * z; te[ 12 ] = me[ 12 ];
	te[ 1 ] = me[ 1 ] * x; te[ 5 ] = me[ 5 ] * y; te[ 9 ] = me[ 9 ] * z; te[ 13 ] = me[ 13 ];
	te[ 2 ] = me[ 2 ] * x; te[ 6 ] = me[ 6 ] * y; te[ 10 ] = me[ 10 ] * z; te[ 14 ] = me[ 14 ];
	te[ 3 ] = me[ 3 ] * x; te[ 7 ] = me[ 7 ] * y; te[ 11 ] = me[ 11 ] * z; te[ 15 ] = me[ 15 ];

	return target;

}

/**
 * Gets the maximum scale value of the three axes of the given matrix.
 *
 * @param {Matrix4Like} m - The matrix.
 * @return {number} The maximum scale.
 */
export function mat4GetMaxScaleOnAxis( m ) {

	const te = m.elements;

	const scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
	const scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
	const scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];

	return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

}

/**
 * Sets the target to a translation transform from the given vector.
 *
 * @param {number|Vector3Like} x - The amount to translate in the X axis or alternatively a translation vector.
 * @param {number} y - The amount to translate in the Y axis.
 * @param {number} z - The amount to translate in the z axis.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeTranslation( x, y, z, target = mat4Create() ) {

	if ( x.isVector3 ) {

		return mat4Set(

			target,

			1, 0, 0, x.x,
			0, 1, 0, x.y,
			0, 0, 1, x.z,
			0, 0, 0, 1

		);

	}

	return mat4Set(

		target,

		1, 0, 0, x,
		0, 1, 0, y,
		0, 0, 1, z,
		0, 0, 0, 1

	);

}

/**
 * Sets the target to a rotational transformation around the X axis by the given angle.
 *
 * @param {number} theta - The rotation in radians.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeRotationX( theta, target = mat4Create() ) {

	const c = Math.cos( theta ), s = Math.sin( theta );

	return mat4Set(

		target,

		1, 0, 0, 0,
		0, c, - s, 0,
		0, s, c, 0,
		0, 0, 0, 1

	);

}

/**
 * Sets the target to a rotational transformation around the Y axis by the given angle.
 *
 * @param {number} theta - The rotation in radians.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeRotationY( theta, target = mat4Create() ) {

	const c = Math.cos( theta ), s = Math.sin( theta );

	return mat4Set(

		target,

		 c, 0, s, 0,
		 0, 1, 0, 0,
		- s, 0, c, 0,
		 0, 0, 0, 1

	);

}

/**
 * Sets the target to a rotational transformation around the Z axis by the given angle.
 *
 * @param {number} theta - The rotation in radians.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeRotationZ( theta, target = mat4Create() ) {

	const c = Math.cos( theta ), s = Math.sin( theta );

	return mat4Set(

		target,

		c, - s, 0, 0,
		s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1

	);

}

/**
 * Sets the target to a rotational transformation around the given axis by the given angle.
 *
 * This is a somewhat controversial but mathematically sound alternative to
 * rotating via Quaternions. See the discussion [here](https://www.gamedev.net/articles/programming/math-and-physics/do-we-really-need-quaternions-r1199).
 *
 * @param {Vector3Like} axis - The normalized rotation axis.
 * @param {number} angle - The rotation in radians.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeRotationAxis( axis, angle, target = mat4Create() ) {

	// Based on http://www.gamedev.net/reference/articles/article1199.asp

	const c = Math.cos( angle );
	const s = Math.sin( angle );
	const t = 1 - c;
	const x = axis.x, y = axis.y, z = axis.z;
	const tx = t * x, ty = t * y;

	return mat4Set(

		target,

		tx * x + c, tx * y - s * z, tx * z + s * y, 0,
		tx * y + s * z, ty * y + c, ty * z - s * x, 0,
		tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
		0, 0, 0, 1

	);

}

/**
 * Sets the target to a scale transformation.
 *
 * @param {number} x - The amount to scale in the X axis.
 * @param {number} y - The amount to scale in the Y axis.
 * @param {number} z - The amount to scale in the Z axis.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeScale( x, y, z, target = mat4Create() ) {

	return mat4Set(

		target,

		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1

	);

}

/**
 * Sets the target to a shear transformation.
 *
 * @param {number} xy - The amount to shear X by Y.
 * @param {number} xz - The amount to shear X by Z.
 * @param {number} yx - The amount to shear Y by X.
 * @param {number} yz - The amount to shear Y by Z.
 * @param {number} zx - The amount to shear Z by X.
 * @param {number} zy - The amount to shear Z by Y.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeShear( xy, xz, yx, yz, zx, zy, target = mat4Create() ) {

	return mat4Set(

		target,

		1, yx, zx, 0,
		xy, 1, zy, 0,
		xz, yz, 1, 0,
		0, 0, 0, 1

	);

}

/**
 * Sets the target to the transformation composed of the given position,
 * rotation (Quaternion) and scale.
 *
 * @param {Vector3Like} position - The position vector.
 * @param {QuaternionLike} quaternion - The rotation as a Quaternion.
 * @param {Vector3Like} scale - The scale vector.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4Compose( position, quaternion, scale, target = mat4Create() ) {

	const te = target.elements;

	const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
	const x2 = x + x,	y2 = y + y, z2 = z + z;
	const xx = x * x2, xy = x * y2, xz = x * z2;
	const yy = y * y2, yz = y * z2, zz = z * z2;
	const wx = w * x2, wy = w * y2, wz = w * z2;

	const sx = scale.x, sy = scale.y, sz = scale.z;

	te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
	te[ 1 ] = ( xy + wz ) * sx;
	te[ 2 ] = ( xz - wy ) * sx;
	te[ 3 ] = 0;

	te[ 4 ] = ( xy - wz ) * sy;
	te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
	te[ 6 ] = ( yz + wx ) * sy;
	te[ 7 ] = 0;

	te[ 8 ] = ( xz + wy ) * sz;
	te[ 9 ] = ( yz - wx ) * sz;
	te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
	te[ 11 ] = 0;

	te[ 12 ] = position.x;
	te[ 13 ] = position.y;
	te[ 14 ] = position.z;
	te[ 15 ] = 1;

	return target;

}

/**
 * Decomposes the given matrix into its position, rotation and scale components
 * and provides the result in the given objects.
 *
 * Note: Not all matrices are decomposable in this way. For example, if an
 * object has a non-uniformly scaled parent, then the object's world matrix
 * may not be decomposable, and this method may not be appropriate.
 *
 * @param {Matrix4Like} m - The matrix to decompose.
 * @param {Vector3Like} position - The position vector the result is stored to.
 * @param {QuaternionLike} quaternion - The rotation Quaternion the result is stored to.
 * @param {Vector3Like} scale - The scale vector the result is stored to.
 * @return {Matrix4Like} `m`, unchanged.
 */
export function mat4Decompose( m, position, quaternion, scale ) {

	const te = m.elements;

	position.x = te[ 12 ];
	position.y = te[ 13 ];
	position.z = te[ 14 ];

	const det = mat4DeterminantAffine( m );

	if ( det === 0 ) {

		scale.set( 1, 1, 1 );
		quaternion.identity();

		return m;

	}

	let sx = Math.sqrt( te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ] );
	const sy = Math.sqrt( te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ] );
	const sz = Math.sqrt( te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ] );

	// if determinant is negative, we need to invert one scale
	if ( det < 0 ) sx = - sx;

	const invSX = 1 / sx;
	const invSY = 1 / sy;
	const invSZ = 1 / sz;

	// scale the rotation part into a plain matrix-like object, avoiding any class dependency
	const rotation = {

		elements: [

			te[ 0 ] * invSX, te[ 1 ] * invSX, te[ 2 ] * invSX, 0,
			te[ 4 ] * invSY, te[ 5 ] * invSY, te[ 6 ] * invSY, 0,
			te[ 8 ] * invSZ, te[ 9 ] * invSZ, te[ 10 ] * invSZ, 0,
			0, 0, 0, 1

		]

	};

	quaternion.setFromRotationMatrix( rotation );

	scale.x = sx;
	scale.y = sy;
	scale.z = sz;

	return m;

}

/**
 * Sets the target to a perspective projection matrix. This is used internally by
 * {@link PerspectiveCamera#updateProjectionMatrix}.
 *
 * @param {number} left - Left boundary of the viewing frustum at the near plane.
 * @param {number} right - Right boundary of the viewing frustum at the near plane.
 * @param {number} top - Top boundary of the viewing frustum at the near plane.
 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
 * @param {number} near - The distance from the camera to the near plane.
 * @param {number} far - The distance from the camera to the far plane.
 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakePerspective( left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false, target = mat4Create() ) {

	const te = target.elements;

	const x = 2 * near / ( right - left );
	const y = 2 * near / ( top - bottom );

	const a = ( right + left ) / ( right - left );
	const b = ( top + bottom ) / ( top - bottom );

	let c, d;

	if ( reversedDepth ) {

		c = near / ( far - near );
		d = ( far * near ) / ( far - near );

	} else {

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			c = - ( far + near ) / ( far - near );
			d = ( - 2 * far * near ) / ( far - near );

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			c = - far / ( far - near );
			d = ( - far * near ) / ( far - near );

		} else {

			throw new Error( 'THREE.Matrix4: mat4MakePerspective(): Invalid coordinate system: ' + coordinateSystem );

		}

	}

	te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a; 	te[ 12 ] = 0;
	te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b; 	te[ 13 ] = 0;
	te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c; 	te[ 14 ] = d;
	te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

	return target;

}

/**
 * Sets the target to an orthographic projection matrix. This is used internally by
 * {@link OrthographicCamera#updateProjectionMatrix}.
 *
 * @param {number} left - Left boundary of the viewing frustum at the near plane.
 * @param {number} right - Right boundary of the viewing frustum at the near plane.
 * @param {number} top - Top boundary of the viewing frustum at the near plane.
 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
 * @param {number} near - The distance from the camera to the near plane.
 * @param {number} far - The distance from the camera to the far plane.
 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4MakeOrthographic( left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false, target = mat4Create() ) {

	const te = target.elements;

	const x = 2 / ( right - left );
	const y = 2 / ( top - bottom );

	const a = - ( right + left ) / ( right - left );
	const b = - ( top + bottom ) / ( top - bottom );

	let c, d;

	if ( reversedDepth ) {

		c = 1 / ( far - near );
		d = far / ( far - near );

	} else {

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			c = - 2 / ( far - near );
			d = - ( far + near ) / ( far - near );

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			c = - 1 / ( far - near );
			d = - near / ( far - near );

		} else {

			throw new Error( 'THREE.Matrix4: mat4MakeOrthographic(): Invalid coordinate system: ' + coordinateSystem );

		}

	}

	te[ 0 ] = x;		te[ 4 ] = 0;		te[ 8 ] = 0; 		te[ 12 ] = a;
	te[ 1 ] = 0; 		te[ 5 ] = y;		te[ 9 ] = 0; 		te[ 13 ] = b;
	te[ 2 ] = 0; 		te[ 6 ] = 0;		te[ 10 ] = c;		te[ 14 ] = d;
	te[ 3 ] = 0; 		te[ 7 ] = 0;		te[ 11 ] = 0;		te[ 15 ] = 1;

	return target;

}

/**
 * Returns `true` if the given matrices are equal.
 *
 * @param {Matrix4Like} a - The first matrix.
 * @param {Matrix4Like} b - The second matrix.
 * @return {boolean} Whether the given matrices are equal.
 */
export function mat4Equals( a, b ) {

	const ae = a.elements;
	const be = b.elements;

	for ( let i = 0; i < 16; i ++ ) {

		if ( ae[ i ] !== be[ i ] ) return false;

	}

	return true;

}

/**
 * Sets the elements of the target from the given array.
 *
 * @param {Array<number>} array - The matrix elements in column-major order.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @param {Matrix4Like} [target] - The target the result is stored to.
 * @return {Matrix4Like} The target, for chaining.
 */
export function mat4FromArray( array, offset = 0, target = mat4Create() ) {

	const te = target.elements;

	for ( let i = 0; i < 16; i ++ ) {

		te[ i ] = array[ i + offset ];

	}

	return target;

}

/**
 * Writes the elements of the given matrix to an array. If no array is provided,
 * the method creates a new one.
 *
 * @param {Matrix4Like} m - The matrix to read.
 * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The matrix elements in column-major order.
 */
export function mat4ToArray( m, array = [], offset = 0 ) {

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
	array[ offset + 9 ] = te[ 9 ];
	array[ offset + 10 ] = te[ 10 ];
	array[ offset + 11 ] = te[ 11 ];

	array[ offset + 12 ] = te[ 12 ];
	array[ offset + 13 ] = te[ 13 ];
	array[ offset + 14 ] = te[ 14 ];
	array[ offset + 15 ] = te[ 15 ];

	return array;

}

const _zero = /*@__PURE__*/ { x: 0, y: 0, z: 0 };
const _one = /*@__PURE__*/ { x: 1, y: 1, z: 1 };
