import { clamp } from './MathUtils.js';
import { warn } from '../utils.js';

/**
 * A structural type describing any object that stores quaternion components
 * as `_x`, `_y`, `_z`, `_w`, exactly like {@link Quaternion}'s internal fields.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Quaternion} instance. Since {@link Quaternion}
 * exposes compatible `_x`/`_y`/`_z`/`_w` fields, instances of that class
 * satisfy this type without any special handling. Plain objects returned by
 * {@link quatCreate} use the same field names so they work with existing
 * consumers that read `_x` (e.g. {@link mat4Compose}).
 *
 * @typedef {Object} QuaternionLike
 * @property {number} _x
 * @property {number} _y
 * @property {number} _z
 * @property {number} _w
 */

/**
 * Creates a new, plain {@link QuaternionLike} object holding the identity
 * quaternion `(0, 0, 0, 1)`.
 *
 * Unlike `new Quaternion()`, the returned object is not a class instance and
 * carries no `isQuaternion` flag - it only satisfies the {@link QuaternionLike}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Quaternion} class so that unused quaternion operations can be
 * tree-shaken.
 *
 * @return {QuaternionLike} A new quaternion-like object set to the identity.
 */
export function quatCreate() {

	return { _x: 0, _y: 0, _z: 0, _w: 1 };

}

/**
 * Interpolates between two quaternions via SLERP. This implementation assumes
 * the quaternion data are managed in flat arrays.
 *
 * @param {Array<number>} dst - The destination array.
 * @param {number} dstOffset - An offset into the destination array.
 * @param {Array<number>} src0 - The source array of the first quaternion.
 * @param {number} srcOffset0 - An offset into the first source array.
 * @param {Array<number>} src1 - The source array of the second quaternion.
 * @param {number} srcOffset1 - An offset into the second source array.
 * @param {number} t - The interpolation factor.
 */
export function quatSlerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {

	let x0 = src0[ srcOffset0 + 0 ],
		y0 = src0[ srcOffset0 + 1 ],
		z0 = src0[ srcOffset0 + 2 ],
		w0 = src0[ srcOffset0 + 3 ];

	let x1 = src1[ srcOffset1 + 0 ],
		y1 = src1[ srcOffset1 + 1 ],
		z1 = src1[ srcOffset1 + 2 ],
		w1 = src1[ srcOffset1 + 3 ];

	if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

		let dot = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;

		if ( dot < 0 ) {

			x1 = - x1;
			y1 = - y1;
			z1 = - z1;
			w1 = - w1;

			dot = - dot;

		}

		let s = 1 - t;

		if ( dot < 0.9995 ) {

			// slerp

			const theta = Math.acos( dot );
			const sin = Math.sin( theta );

			s = Math.sin( s * theta ) / sin;
			t = Math.sin( t * theta ) / sin;

			x0 = x0 * s + x1 * t;
			y0 = y0 * s + y1 * t;
			z0 = z0 * s + z1 * t;
			w0 = w0 * s + w1 * t;

		} else {

			// for small angles, lerp then normalize

			x0 = x0 * s + x1 * t;
			y0 = y0 * s + y1 * t;
			z0 = z0 * s + z1 * t;
			w0 = w0 * s + w1 * t;

			const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

			x0 *= f;
			y0 *= f;
			z0 *= f;
			w0 *= f;

		}

	}

	dst[ dstOffset ] = x0;
	dst[ dstOffset + 1 ] = y0;
	dst[ dstOffset + 2 ] = z0;
	dst[ dstOffset + 3 ] = w0;

}

/**
 * Multiplies two quaternions. This implementation assumes the quaternion data
 * are managed in flat arrays.
 *
 * @param {Array<number>} dst - The destination array.
 * @param {number} dstOffset - An offset into the destination array.
 * @param {Array<number>} src0 - The source array of the first quaternion.
 * @param {number} srcOffset0 - An offset into the first source array.
 * @param {Array<number>} src1 - The source array of the second quaternion.
 * @param {number} srcOffset1 - An offset into the second source array.
 * @return {Array<number>} The destination array.
 */
export function quatMultiplyQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {

	const x0 = src0[ srcOffset0 ];
	const y0 = src0[ srcOffset0 + 1 ];
	const z0 = src0[ srcOffset0 + 2 ];
	const w0 = src0[ srcOffset0 + 3 ];

	const x1 = src1[ srcOffset1 ];
	const y1 = src1[ srcOffset1 + 1 ];
	const z1 = src1[ srcOffset1 + 2 ];
	const w1 = src1[ srcOffset1 + 3 ];

	dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
	dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
	dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
	dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

	return dst;

}

/**
 * Sets the quaternion components of the given target.
 *
 * @param {number} x - The x value.
 * @param {number} y - The y value.
 * @param {number} z - The z value.
 * @param {number} w - The w value.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSet( x, y, z, w, target = quatCreate() ) {

	target._x = x;
	target._y = y;
	target._z = z;
	target._w = w;

	return target;

}

/**
 * Copies the values of the given quaternion to the target.
 *
 * @param {QuaternionLike} q - The quaternion to copy.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatCopy( q, target = quatCreate() ) {

	target._x = q._x;
	target._y = q._y;
	target._z = q._z;
	target._w = q._w;

	return target;

}

/**
 * Sets the target from the rotation specified by the given Euler angles.
 *
 * @param {Object} euler - The Euler angles (`_x`, `_y`, `_z`, `_order`).
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSetFromEuler( euler, target = quatCreate() ) {

	const x = euler._x, y = euler._y, z = euler._z, order = euler._order;

	const cos = Math.cos;
	const sin = Math.sin;

	const c1 = cos( x / 2 );
	const c2 = cos( y / 2 );
	const c3 = cos( z / 2 );

	const s1 = sin( x / 2 );
	const s2 = sin( y / 2 );
	const s3 = sin( z / 2 );

	switch ( order ) {

		case 'XYZ':
			target._x = s1 * c2 * c3 + c1 * s2 * s3;
			target._y = c1 * s2 * c3 - s1 * c2 * s3;
			target._z = c1 * c2 * s3 + s1 * s2 * c3;
			target._w = c1 * c2 * c3 - s1 * s2 * s3;
			break;

		case 'YXZ':
			target._x = s1 * c2 * c3 + c1 * s2 * s3;
			target._y = c1 * s2 * c3 - s1 * c2 * s3;
			target._z = c1 * c2 * s3 - s1 * s2 * c3;
			target._w = c1 * c2 * c3 + s1 * s2 * s3;
			break;

		case 'ZXY':
			target._x = s1 * c2 * c3 - c1 * s2 * s3;
			target._y = c1 * s2 * c3 + s1 * c2 * s3;
			target._z = c1 * c2 * s3 + s1 * s2 * c3;
			target._w = c1 * c2 * c3 - s1 * s2 * s3;
			break;

		case 'ZYX':
			target._x = s1 * c2 * c3 - c1 * s2 * s3;
			target._y = c1 * s2 * c3 + s1 * c2 * s3;
			target._z = c1 * c2 * s3 - s1 * s2 * c3;
			target._w = c1 * c2 * c3 + s1 * s2 * s3;
			break;

		case 'YZX':
			target._x = s1 * c2 * c3 + c1 * s2 * s3;
			target._y = c1 * s2 * c3 + s1 * c2 * s3;
			target._z = c1 * c2 * s3 - s1 * s2 * c3;
			target._w = c1 * c2 * c3 - s1 * s2 * s3;
			break;

		case 'XZY':
			target._x = s1 * c2 * c3 - c1 * s2 * s3;
			target._y = c1 * s2 * c3 - s1 * c2 * s3;
			target._z = c1 * c2 * s3 + s1 * s2 * c3;
			target._w = c1 * c2 * c3 + s1 * s2 * s3;
			break;

		default:
			warn( 'Quaternion: .setFromEuler() encountered an unknown order: ' + order );

	}

	return target;

}

/**
 * Sets the target from the given axis and angle.
 *
 * @param {Object} axis - The normalized axis (`x`, `y`, `z`).
 * @param {number} angle - The angle in radians.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSetFromAxisAngle( axis, angle, target = quatCreate() ) {

	const halfAngle = angle / 2, s = Math.sin( halfAngle );

	target._x = axis.x * s;
	target._y = axis.y * s;
	target._z = axis.z * s;
	target._w = Math.cos( halfAngle );

	return target;

}

/**
 * Sets the target from the given rotation matrix.
 *
 * @param {Object} m - A 4x4 matrix-like object whose upper 3x3 is a pure rotation matrix.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSetFromRotationMatrix( m, target = quatCreate() ) {

	// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

	const te = m.elements,

		m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
		m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
		m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

		trace = m11 + m22 + m33;

	if ( trace > 0 ) {

		const s = 0.5 / Math.sqrt( trace + 1.0 );

		target._w = 0.25 / s;
		target._x = ( m32 - m23 ) * s;
		target._y = ( m13 - m31 ) * s;
		target._z = ( m21 - m12 ) * s;

	} else if ( m11 > m22 && m11 > m33 ) {

		const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

		target._w = ( m32 - m23 ) / s;
		target._x = 0.25 * s;
		target._y = ( m12 + m21 ) / s;
		target._z = ( m13 + m31 ) / s;

	} else if ( m22 > m33 ) {

		const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

		target._w = ( m13 - m31 ) / s;
		target._x = ( m12 + m21 ) / s;
		target._y = 0.25 * s;
		target._z = ( m23 + m32 ) / s;

	} else {

		const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

		target._w = ( m21 - m12 ) / s;
		target._x = ( m13 + m31 ) / s;
		target._y = ( m23 + m32 ) / s;
		target._z = 0.25 * s;

	}

	return target;

}

/**
 * Sets the target to the rotation required to rotate the direction vector
 * `vFrom` to the direction vector `vTo`.
 *
 * @param {Object} vFrom - The first (normalized) direction vector.
 * @param {Object} vTo - The second (normalized) direction vector.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSetFromUnitVectors( vFrom, vTo, target = quatCreate() ) {

	// assumes direction vectors vFrom and vTo are normalized

	let r = vFrom.x * vTo.x + vFrom.y * vTo.y + vFrom.z * vTo.z + 1;

	if ( r < 1e-8 ) { // the epsilon value has been discussed in #31286

		// vFrom and vTo point in opposite directions

		r = 0;

		if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

			target._x = - vFrom.y;
			target._y = vFrom.x;
			target._z = 0;
			target._w = r;

		} else {

			target._x = 0;
			target._y = - vFrom.z;
			target._z = vFrom.y;
			target._w = r;

		}

	} else {

		// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

		target._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
		target._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
		target._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
		target._w = r;

	}

	return quatNormalize( target, target );

}

/**
 * Returns the angle between two quaternions in radians.
 *
 * @param {QuaternionLike} a - The first quaternion.
 * @param {QuaternionLike} b - The second quaternion.
 * @return {number} The angle in radians.
 */
export function quatAngleTo( a, b ) {

	return 2 * Math.acos( Math.abs( clamp( quatDot( a, b ), - 1, 1 ) ) );

}

/**
 * Rotates quaternion `a` by a given angular step toward `b`, storing the
 * result in `target`. The result will not overshoot `b`.
 *
 * @param {QuaternionLike} a - The starting quaternion.
 * @param {QuaternionLike} b - The target quaternion.
 * @param {number} step - The angular step in radians.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatRotateTowards( a, b, step, target = quatCreate() ) {

	const angle = quatAngleTo( a, b );

	if ( angle === 0 ) return quatCopy( a, target );

	const t = Math.min( 1, step / angle );

	return quatSlerp( a, b, t, target );

}

/**
 * Sets the target to the identity quaternion.
 *
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatIdentity( target = quatCreate() ) {

	return quatSet( 0, 0, 0, 1, target );

}

/**
 * Inverts the given quaternion via conjugate. The quaternion is assumed to
 * have unit length.
 *
 * @param {QuaternionLike} q - The quaternion to invert.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatInvert( q, target = quatCreate() ) {

	return quatConjugate( q, target );

}

/**
 * Returns the rotational conjugate of the given quaternion.
 *
 * @param {QuaternionLike} q - The quaternion to conjugate.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatConjugate( q, target = quatCreate() ) {

	target._x = q._x * - 1;
	target._y = q._y * - 1;
	target._z = q._z * - 1;
	target._w = q._w;

	return target;

}

/**
 * Calculates the dot product of two quaternions.
 *
 * @param {QuaternionLike} a - The first quaternion.
 * @param {QuaternionLike} b - The second quaternion.
 * @return {number} The result of the dot product.
 */
export function quatDot( a, b ) {

	return a._x * b._x + a._y * b._y + a._z * b._z + a._w * b._w;

}

/**
 * Computes the squared Euclidean length of the given quaternion.
 *
 * @param {QuaternionLike} q - The quaternion.
 * @return {number} The squared Euclidean length.
 */
export function quatLengthSq( q ) {

	return q._x * q._x + q._y * q._y + q._z * q._z + q._w * q._w;

}

/**
 * Computes the Euclidean length of the given quaternion.
 *
 * @param {QuaternionLike} q - The quaternion.
 * @return {number} The Euclidean length.
 */
export function quatLength( q ) {

	return Math.sqrt( q._x * q._x + q._y * q._y + q._z * q._z + q._w * q._w );

}

/**
 * Normalizes the given quaternion.
 *
 * @param {QuaternionLike} q - The quaternion to normalize.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatNormalize( q, target = quatCreate() ) {

	let l = quatLength( q );

	if ( l === 0 ) {

		target._x = 0;
		target._y = 0;
		target._z = 0;
		target._w = 1;

	} else {

		l = 1 / l;

		target._x = q._x * l;
		target._y = q._y * l;
		target._z = q._z * l;
		target._w = q._w * l;

	}

	return target;

}

/**
 * Multiplies quaternion `a` by `b` and stores the result in `target`.
 *
 * @param {QuaternionLike} a - The first quaternion.
 * @param {QuaternionLike} b - The second quaternion.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatMultiply( a, b, target = quatCreate() ) {

	return quatMultiplyQuaternions( a, b, target );

}

/**
 * Pre-multiplies quaternion `a` by `b` and stores the result in `target`
 * (equivalent to `b * a`).
 *
 * @param {QuaternionLike} a - The quaternion to pre-multiply.
 * @param {QuaternionLike} b - The quaternion to multiply by.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatPreMultiply( a, b, target = quatCreate() ) {

	return quatMultiplyQuaternions( b, a, target );

}

/**
 * Multiplies the given quaternions and stores the result in `target`.
 *
 * @param {QuaternionLike} a - The first quaternion.
 * @param {QuaternionLike} b - The second quaternion.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatMultiplyQuaternions( a, b, target = quatCreate() ) {

	const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
	const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

	target._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
	target._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
	target._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
	target._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

	return target;

}

/**
 * Performs a spherical linear interpolation between `qa` and `qb`.
 *
 * @param {QuaternionLike} qa - The starting quaternion.
 * @param {QuaternionLike} qb - The target quaternion.
 * @param {number} t - The interpolation factor.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSlerp( qa, qb, t, target = quatCreate() ) {

	const x0 = qa._x, y0 = qa._y, z0 = qa._z, w0 = qa._w;

	let x = qb._x, y = qb._y, z = qb._z, w = qb._w;

	let dot = x0 * x + y0 * y + z0 * z + w0 * w;

	if ( dot < 0 ) {

		x = - x;
		y = - y;
		z = - z;
		w = - w;

		dot = - dot;

	}

	let s = 1 - t;

	if ( dot < 0.9995 ) {

		// slerp

		const theta = Math.acos( dot );
		const sin = Math.sin( theta );

		s = Math.sin( s * theta ) / sin;
		t = Math.sin( t * theta ) / sin;

		target._x = x0 * s + x * t;
		target._y = y0 * s + y * t;
		target._z = z0 * s + z * t;
		target._w = w0 * s + w * t;

	} else {

		// for small angles, lerp then normalize

		target._x = x0 * s + x * t;
		target._y = y0 * s + y * t;
		target._z = z0 * s + z * t;
		target._w = w0 * s + w * t;

		quatNormalize( target, target );

	}

	return target;

}

/**
 * Performs a spherical linear interpolation between the given quaternions
 * and stores the result in `target`.
 *
 * @param {QuaternionLike} qa - The source quaternion.
 * @param {QuaternionLike} qb - The target quaternion.
 * @param {number} t - The interpolation factor.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatSlerpQuaternions( qa, qb, t, target = quatCreate() ) {

	return quatSlerp( quatCopy( qa, target ), qb, t, target );

}

/**
 * Sets the target to a uniformly random, normalized quaternion.
 *
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatRandom( target = quatCreate() ) {

	// Ken Shoemake
	// Uniform random rotations
	// D. Kirk, editor, Graphics Gems III, pages 124-132. Academic Press, New York, 1992.

	const theta1 = 2 * Math.PI * Math.random();
	const theta2 = 2 * Math.PI * Math.random();

	const x0 = Math.random();
	const r1 = Math.sqrt( 1 - x0 );
	const r2 = Math.sqrt( x0 );

	return quatSet(
		r1 * Math.sin( theta1 ),
		r1 * Math.cos( theta1 ),
		r2 * Math.sin( theta2 ),
		r2 * Math.cos( theta2 ),
		target,
	);

}

/**
 * Returns `true` if the two quaternions are equal.
 *
 * @param {QuaternionLike} a - The first quaternion.
 * @param {QuaternionLike} b - The second quaternion.
 * @return {boolean} Whether the quaternions are equal.
 */
export function quatEquals( a, b ) {

	return ( a._x === b._x ) && ( a._y === b._y ) && ( a._z === b._z ) && ( a._w === b._w );

}

/**
 * Sets the target's components from the given array.
 *
 * @param {Array<number>} array - An array holding the quaternion component values.
 * @param {number} [offset=0] - The offset into the array.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatFromArray( array, offset = 0, target = quatCreate() ) {

	target._x = array[ offset ];
	target._y = array[ offset + 1 ];
	target._z = array[ offset + 2 ];
	target._w = array[ offset + 3 ];

	return target;

}

/**
 * Writes the components of the given quaternion to the given array.
 *
 * @param {QuaternionLike} q - The quaternion.
 * @param {Array<number>} [array=[]] - The target array.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The quaternion components.
 */
export function quatToArray( q, array = [], offset = 0 ) {

	array[ offset ] = q._x;
	array[ offset + 1 ] = q._y;
	array[ offset + 2 ] = q._z;
	array[ offset + 3 ] = q._w;

	return array;

}

/**
 * Sets the components of the target from the given buffer attribute.
 *
 * @param {Object} attribute - The buffer attribute holding quaternion data.
 * @param {number} index - The index into the attribute.
 * @param {QuaternionLike} [target] - The target the result is stored to.
 * @return {QuaternionLike} The target, for chaining.
 */
export function quatFromBufferAttribute( attribute, index, target = quatCreate() ) {

	target._x = attribute.getX( index );
	target._y = attribute.getY( index );
	target._z = attribute.getZ( index );
	target._w = attribute.getW( index );

	return target;

}

/**
 * Returns the numerical elements of the given quaternion as `[x, y, z, w]`.
 *
 * @param {QuaternionLike} q - The quaternion.
 * @return {Array<number>} The serialized quaternion.
 */
export function quatToJSON( q ) {

	return quatToArray( q );

}
