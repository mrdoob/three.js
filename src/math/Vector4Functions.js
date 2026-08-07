import { clamp } from './MathUtils.js';

/**
 * A structural type describing any object that stores a 4D vector as
 * `{ x, y, z, w }` numeric components, exactly like {@link Vector4}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Vector4} instance. Since {@link Vector4}
 * exposes compatible `x`/`y`/`z`/`w` properties, instances of that class
 * satisfy this type without any special handling.
 *
 * @typedef {Object} Vector4Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

/**
 * Creates a new, plain {@link Vector4Like} object.
 *
 * Unlike `new Vector4()`, the returned object is not a class instance and
 * carries no `isVector4` flag - it only satisfies the {@link Vector4Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Vector4} class so that unused vector operations can be tree-shaken.
 *
 * @param {number} [x=0] - The x value of the vector.
 * @param {number} [y=0] - The y value of the vector.
 * @param {number} [z=0] - The z value of the vector.
 * @param {number} [w=1] - The w value of the vector.
 * @return {Vector4Like} A new vector-like object.
 */
export function vec4Create( x = 0, y = 0, z = 0, w = 1 ) {

	return { x: x, y: y, z: z, w: w };

}

/**
 * Sets the vector components.
 *
 * @param {number} x - The value of the x component.
 * @param {number} y - The value of the y component.
 * @param {number} z - The value of the z component.
 * @param {number} w - The value of the w component.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4Set( x, y, z, w, target = vec4Create() ) {

	target.x = x;
	target.y = y;
	target.z = z;
	target.w = w;

	return target;

}

/**
 * Sets the vector components to the same value.
 *
 * @param {number} scalar - The value to set for all vector components.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetScalar( scalar, target = vec4Create() ) {

	target.x = scalar;
	target.y = scalar;
	target.z = scalar;
	target.w = scalar;

	return target;

}

/**
 * Sets the vector's x component to the given value, copying `y`/`z`/`w` from `v`.
 *
 * @param {Vector4Like} v - The source vector.
 * @param {number} x - The value to set.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetX( v, x, target = vec4Create() ) {

	target.x = x;
	target.y = v.y;
	target.z = v.z;
	target.w = v.w;

	return target;

}

/**
 * Sets the vector's y component to the given value, copying `x`/`z`/`w` from `v`.
 *
 * @param {Vector4Like} v - The source vector.
 * @param {number} y - The value to set.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetY( v, y, target = vec4Create() ) {

	target.x = v.x;
	target.y = y;
	target.z = v.z;
	target.w = v.w;

	return target;

}

/**
 * Sets the vector's z component to the given value, copying `x`/`y`/`w` from `v`.
 *
 * @param {Vector4Like} v - The source vector.
 * @param {number} z - The value to set.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetZ( v, z, target = vec4Create() ) {

	target.x = v.x;
	target.y = v.y;
	target.z = z;
	target.w = v.w;

	return target;

}

/**
 * Sets the vector's w component to the given value, copying `x`/`y`/`z` from `v`.
 *
 * @param {Vector4Like} v - The source vector.
 * @param {number} w - The value to set.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetW( v, w, target = vec4Create() ) {

	target.x = v.x;
	target.y = v.y;
	target.z = v.z;
	target.w = w;

	return target;

}

/**
 * Sets a vector component by index.
 *
 * @param {Vector4Like} v - The source vector.
 * @param {number} index - The component index. `0` equals to x, `1` equals to y,
 * `2` equals to z, `3` equals to w.
 * @param {number} value - The value to set.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetComponent( v, index, value, target = vec4Create() ) {

	target.x = v.x;
	target.y = v.y;
	target.z = v.z;
	target.w = v.w;

	switch ( index ) {

		case 0: target.x = value; break;
		case 1: target.y = value; break;
		case 2: target.z = value; break;
		case 3: target.w = value; break;
		default: throw new Error( 'THREE.Vector4: index is out of range: ' + index );

	}

	return target;

}

/**
 * Returns the value of the vector component which matches the given index.
 *
 * @param {Vector4Like} v - The vector to read.
 * @param {number} index - The component index. `0` equals to x, `1` equals to y,
 * `2` equals to z, `3` equals to w.
 * @return {number} A vector component value.
 */
export function vec4GetComponent( v, index ) {

	switch ( index ) {

		case 0: return v.x;
		case 1: return v.y;
		case 2: return v.z;
		case 3: return v.w;
		default: throw new Error( 'THREE.Vector4: index is out of range: ' + index );

	}

}

/**
 * Copies the values of the given vector into the target.
 *
 * @param {Vector3Like|Vector4Like} v - The vector to copy. If `w` is undefined, it defaults to `1`.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} A copy of `v`.
 */
export function vec4Copy( v, target = vec4Create() ) {

	target.x = v.x;
	target.y = v.y;
	target.z = v.z;
	target.w = ( v.w !== undefined ) ? v.w : 1;

	return target;

}

/**
 * Adds the given vectors and stores the result in the target.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The sum of `a` and `b`.
 */
export function vec4Add( a, b, target = vec4Create() ) {

	target.x = a.x + b.x;
	target.y = a.y + b.y;
	target.z = a.z + b.z;
	target.w = a.w + b.w;

	return target;

}

/**
 * Adds the given scalar value to all components of the given vector and
 * stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {number} s - The scalar to add.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4AddScalar( v, s, target = vec4Create() ) {

	target.x = v.x + s;
	target.y = v.y + s;
	target.z = v.z + s;
	target.w = v.w + s;

	return target;

}

/**
 * Adds the given vectors and stores the result in the target.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The sum of `a` and `b`.
 */
export function vec4AddVectors( a, b, target = vec4Create() ) {

	target.x = a.x + b.x;
	target.y = a.y + b.y;
	target.z = a.z + b.z;
	target.w = a.w + b.w;

	return target;

}

/**
 * Adds the given vector scaled by the given factor to `a` and stores the
 * result in the target.
 *
 * @param {Vector4Like} a - The vector to add to.
 * @param {Vector4Like} v - The vector to scale and add.
 * @param {number} s - The factor that scales `v`.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4AddScaledVector( a, v, s, target = vec4Create() ) {

	target.x = a.x + v.x * s;
	target.y = a.y + v.y * s;
	target.z = a.z + v.z * s;
	target.w = a.w + v.w * s;

	return target;

}

/**
 * Subtracts the given vectors and stores the result in the target.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The difference of `a` and `b`.
 */
export function vec4Sub( a, b, target = vec4Create() ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;
	target.z = a.z - b.z;
	target.w = a.w - b.w;

	return target;

}

/**
 * Subtracts the given scalar value from all components of the given vector
 * and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {number} s - The scalar to subtract.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4SubScalar( v, s, target = vec4Create() ) {

	target.x = v.x - s;
	target.y = v.y - s;
	target.z = v.z - s;
	target.w = v.w - s;

	return target;

}

/**
 * Subtracts the given vectors and stores the result in the target.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The difference of `a` and `b`.
 */
export function vec4SubVectors( a, b, target = vec4Create() ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;
	target.z = a.z - b.z;
	target.w = a.w - b.w;

	return target;

}

/**
 * Multiplies the given vectors component-wise and stores the result in the target.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The component-wise product.
 */
export function vec4Multiply( a, b, target = vec4Create() ) {

	target.x = a.x * b.x;
	target.y = a.y * b.y;
	target.z = a.z * b.z;
	target.w = a.w * b.w;

	return target;

}

/**
 * Multiplies the given vector by a scalar and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {number} scalar - The scalar to multiply.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4MultiplyScalar( v, scalar, target = vec4Create() ) {

	target.x = v.x * scalar;
	target.y = v.y * scalar;
	target.z = v.z * scalar;
	target.w = v.w * scalar;

	return target;

}

/**
 * Multiplies the given vector with the given 4x4 matrix and stores the
 * result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Matrix4Like} m - The 4x4 matrix.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The transformed vector.
 */
export function vec4ApplyMatrix4( v, m, target = vec4Create() ) {

	const x = v.x, y = v.y, z = v.z, w = v.w;
	const e = m.elements;

	target.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] * w;
	target.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] * w;
	target.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] * w;
	target.w = e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] * w;

	return target;

}

/**
 * Divides the given vectors component-wise and stores the result in the target.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The component-wise quotient.
 */
export function vec4Divide( a, b, target = vec4Create() ) {

	target.x = a.x / b.x;
	target.y = a.y / b.y;
	target.z = a.z / b.z;
	target.w = a.w / b.w;

	return target;

}

/**
 * Divides the given vector by a scalar and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {number} scalar - The scalar to divide.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4DivideScalar( v, scalar, target = vec4Create() ) {

	return vec4MultiplyScalar( v, 1 / scalar, target );

}

/**
 * Sets the x, y and z components of the target to the quaternion's axis
 * and w to the angle.
 *
 * @param {QuaternionLike} q - The Quaternion to set from (assumed normalized).
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetAxisAngleFromQuaternion( q, target = vec4Create() ) {

	// q is assumed to be normalized

	target.w = 2 * Math.acos( q.w );

	const s = Math.sqrt( 1 - q.w * q.w );

	if ( s < 0.0001 ) {

		target.x = 1;
		target.y = 0;
		target.z = 0;

	} else {

		target.x = q.x / s;
		target.y = q.y / s;
		target.z = q.z / s;

	}

	return target;

}

/**
 * Sets the x, y and z components of the target to the axis of rotation
 * and w to the angle.
 *
 * @param {Matrix4Like} m - A 4x4 matrix of which the upper left 3x3 matrix is a pure rotation matrix.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetAxisAngleFromRotationMatrix( m, target = vec4Create() ) {

	// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

	let angle, x, y, z; // variables for result
	const epsilon = 0.01,		// margin to allow for rounding errors
		epsilon2 = 0.1,		// margin to distinguish between 0 and 180 degrees

		te = m.elements,

		m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
		m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
		m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

	if ( ( Math.abs( m12 - m21 ) < epsilon ) &&
	     ( Math.abs( m13 - m31 ) < epsilon ) &&
	     ( Math.abs( m23 - m32 ) < epsilon ) ) {

		// singularity found
		// first check for identity matrix which must have +1 for all terms
		// in leading diagonal and zero in other terms

		if ( ( Math.abs( m12 + m21 ) < epsilon2 ) &&
		     ( Math.abs( m13 + m31 ) < epsilon2 ) &&
		     ( Math.abs( m23 + m32 ) < epsilon2 ) &&
		     ( Math.abs( m11 + m22 + m33 - 3 ) < epsilon2 ) ) {

			// this singularity is identity matrix so angle = 0

			vec4Set( 1, 0, 0, 0, target );

			return target; // zero angle, arbitrary axis

		}

		// otherwise this singularity is angle = 180

		angle = Math.PI;

		const xx = ( m11 + 1 ) / 2;
		const yy = ( m22 + 1 ) / 2;
		const zz = ( m33 + 1 ) / 2;
		const xy = ( m12 + m21 ) / 4;
		const xz = ( m13 + m31 ) / 4;
		const yz = ( m23 + m32 ) / 4;

		if ( ( xx > yy ) && ( xx > zz ) ) {

			// m11 is the largest diagonal term

			if ( xx < epsilon ) {

				x = 0;
				y = 0.707106781;
				z = 0.707106781;

			} else {

				x = Math.sqrt( xx );
				y = xy / x;
				z = xz / x;

			}

		} else if ( yy > zz ) {

			// m22 is the largest diagonal term

			if ( yy < epsilon ) {

				x = 0.707106781;
				y = 0;
				z = 0.707106781;

			} else {

				y = Math.sqrt( yy );
				x = xy / y;
				z = yz / y;

			}

		} else {

			// m33 is the largest diagonal term so base result on this

			if ( zz < epsilon ) {

				x = 0.707106781;
				y = 0.707106781;
				z = 0;

			} else {

				z = Math.sqrt( zz );
				x = xz / z;
				y = yz / z;

			}

		}

		vec4Set( x, y, z, angle, target );

		return target; // return 180 deg rotation

	}

	// as we have reached here there are no singularities so we can handle normally

	let s = Math.sqrt( ( m32 - m23 ) * ( m32 - m23 ) +
		( m13 - m31 ) * ( m13 - m31 ) +
		( m21 - m12 ) * ( m21 - m12 ) ); // used to normalize

	if ( Math.abs( s ) < 0.001 ) s = 1;

	// prevent divide by zero, should not happen if matrix is orthogonal and should be
	// caught by singularity test above, but I've left it in just in case

	target.x = ( m32 - m23 ) / s;
	target.y = ( m13 - m31 ) / s;
	target.z = ( m21 - m12 ) / s;
	target.w = Math.acos( ( m11 + m22 + m33 - 1 ) / 2 );

	return target;

}

/**
 * Sets the vector components to the position elements of the
 * given transformation matrix.
 *
 * @param {Matrix4Like} m - The 4x4 matrix.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4SetFromMatrixPosition( m, target = vec4Create() ) {

	const e = m.elements;

	target.x = e[ 12 ];
	target.y = e[ 13 ];
	target.z = e[ 14 ];
	target.w = e[ 15 ];

	return target;

}

/**
 * If `a`'s x, y, z or w value is greater than `b`'s corresponding value,
 * replace that value with `b`'s. Stores the result in the target.
 *
 * @param {Vector4Like} a - The vector to clamp.
 * @param {Vector4Like} b - The vector providing the minimum values.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Min( a, b, target = vec4Create() ) {

	target.x = Math.min( a.x, b.x );
	target.y = Math.min( a.y, b.y );
	target.z = Math.min( a.z, b.z );
	target.w = Math.min( a.w, b.w );

	return target;

}

/**
 * If `a`'s x, y, z or w value is less than `b`'s corresponding value,
 * replace that value with `b`'s. Stores the result in the target.
 *
 * @param {Vector4Like} a - The vector to clamp.
 * @param {Vector4Like} b - The vector providing the maximum values.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Max( a, b, target = vec4Create() ) {

	target.x = Math.max( a.x, b.x );
	target.y = Math.max( a.y, b.y );
	target.z = Math.max( a.z, b.z );
	target.w = Math.max( a.w, b.w );

	return target;

}

/**
 * Clamps `v` componentwise between `min` and `max` and stores the result
 * in the target. Assumes `min < max` componentwise.
 *
 * @param {Vector4Like} v - The vector to clamp.
 * @param {Vector4Like} min - The minimum x, y, z and w values.
 * @param {Vector4Like} max - The maximum x, y, z and w values.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Clamp( v, min, max, target = vec4Create() ) {

	// assumes min < max, componentwise

	target.x = clamp( v.x, min.x, max.x );
	target.y = clamp( v.y, min.y, max.y );
	target.z = clamp( v.z, min.z, max.z );
	target.w = clamp( v.w, min.w, max.w );

	return target;

}

/**
 * Clamps each component of `v` between the given scalar bounds and stores
 * the result in the target.
 *
 * @param {Vector4Like} v - The vector to clamp.
 * @param {number} minVal - The minimum value the components will be clamped to.
 * @param {number} maxVal - The maximum value the components will be clamped to.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4ClampScalar( v, minVal, maxVal, target = vec4Create() ) {

	target.x = clamp( v.x, minVal, maxVal );
	target.y = clamp( v.y, minVal, maxVal );
	target.z = clamp( v.z, minVal, maxVal );
	target.w = clamp( v.w, minVal, maxVal );

	return target;

}

/**
 * If `v`'s length is greater than `max`, it is replaced by `max`.
 * If `v`'s length is less than `min`, it is replaced by `min`.
 *
 * @param {Vector4Like} v - The vector to clamp.
 * @param {number} min - The minimum value the vector length will be clamped to.
 * @param {number} max - The maximum value the vector length will be clamped to.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4ClampLength( v, min, max, target = vec4Create() ) {

	const length = vec4Length( v );

	return vec4MultiplyScalar(
		vec4DivideScalar( v, length || 1, target ),
		clamp( length, min, max ),
		target
	);

}

/**
 * Rounds the components of the given vector down to the nearest integer
 * value and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Floor( v, target = vec4Create() ) {

	target.x = Math.floor( v.x );
	target.y = Math.floor( v.y );
	target.z = Math.floor( v.z );
	target.w = Math.floor( v.w );

	return target;

}

/**
 * Rounds the components of the given vector up to the nearest integer
 * value and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Ceil( v, target = vec4Create() ) {

	target.x = Math.ceil( v.x );
	target.y = Math.ceil( v.y );
	target.z = Math.ceil( v.z );
	target.w = Math.ceil( v.w );

	return target;

}

/**
 * Rounds the components of the given vector to the nearest integer value
 * and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Round( v, target = vec4Create() ) {

	target.x = Math.round( v.x );
	target.y = Math.round( v.y );
	target.z = Math.round( v.z );
	target.w = Math.round( v.w );

	return target;

}

/**
 * Rounds the components of the given vector towards zero to an integer
 * value and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4RoundToZero( v, target = vec4Create() ) {

	target.x = Math.trunc( v.x );
	target.y = Math.trunc( v.y );
	target.z = Math.trunc( v.z );
	target.w = Math.trunc( v.w );

	return target;

}

/**
 * Inverts the given vector - i.e. sets x = -x, y = -y, z = -z, w = -w -
 * and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Negate( v, target = vec4Create() ) {

	target.x = - v.x;
	target.y = - v.y;
	target.z = - v.z;
	target.w = - v.w;

	return target;

}

/**
 * Calculates the dot product of the given vectors.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @return {number} The result of the dot product.
 */
export function vec4Dot( a, b ) {

	return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

}

/**
 * Computes the square of the Euclidean length of the given vector.
 *
 * @param {Vector4Like} v - The vector.
 * @return {number} The square length of the vector.
 */
export function vec4LengthSq( v ) {

	return v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w;

}

/**
 * Computes the Euclidean length of the given vector.
 *
 * @param {Vector4Like} v - The vector.
 * @return {number} The length of the vector.
 */
export function vec4Length( v ) {

	return Math.sqrt( v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w );

}

/**
 * Computes the Manhattan length of the given vector.
 *
 * @param {Vector4Like} v - The vector.
 * @return {number} The Manhattan length of the vector.
 */
export function vec4ManhattanLength( v ) {

	return Math.abs( v.x ) + Math.abs( v.y ) + Math.abs( v.z ) + Math.abs( v.w );

}

/**
 * Converts the given vector to a unit vector and stores the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Normalize( v, target = vec4Create() ) {

	return vec4DivideScalar( v, vec4Length( v ) || 1, target );

}

/**
 * Sets the given vector to a vector with the same direction but the
 * specified length, storing the result in the target.
 *
 * @param {Vector4Like} v - The vector.
 * @param {number} length - The new length of the vector.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4SetLength( v, length, target = vec4Create() ) {

	return vec4MultiplyScalar( vec4Normalize( v, target ), length, target );

}

/**
 * Linearly interpolates between `a` and `b`, where alpha is the percent
 * distance along the line - alpha = 0 will be `a`, and alpha = 1 will be `b`.
 *
 * @param {Vector4Like} a - The starting vector.
 * @param {Vector4Like} b - The vector to interpolate towards.
 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4Lerp( a, b, alpha, target = vec4Create() ) {

	target.x = a.x + ( b.x - a.x ) * alpha;
	target.y = a.y + ( b.y - a.y ) * alpha;
	target.z = a.z + ( b.z - a.z ) * alpha;
	target.w = a.w + ( b.w - a.w ) * alpha;

	return target;

}

/**
 * Linearly interpolates between the given vectors, where alpha is the percent
 * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
 * be the second one. The result is stored in the target.
 *
 * @param {Vector4Like} v1 - The first vector.
 * @param {Vector4Like} v2 - The second vector.
 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The result.
 */
export function vec4LerpVectors( v1, v2, alpha, target = vec4Create() ) {

	target.x = v1.x + ( v2.x - v1.x ) * alpha;
	target.y = v1.y + ( v2.y - v1.y ) * alpha;
	target.z = v1.z + ( v2.z - v1.z ) * alpha;
	target.w = v1.w + ( v2.w - v1.w ) * alpha;

	return target;

}

/**
 * Returns `true` if the given vectors are equal.
 *
 * @param {Vector4Like} a - The first vector.
 * @param {Vector4Like} b - The second vector.
 * @return {boolean} Whether the vectors are equal.
 */
export function vec4Equals( a, b ) {

	return ( ( a.x === b.x ) && ( a.y === b.y ) && ( a.z === b.z ) && ( a.w === b.w ) );

}

/**
 * Sets the target's components from the given array.
 *
 * @param {Array<number>} array - An array holding the vector component values.
 * @param {number} [offset=0] - The offset into the array.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4FromArray( array, offset = 0, target = vec4Create() ) {

	target.x = array[ offset ];
	target.y = array[ offset + 1 ];
	target.z = array[ offset + 2 ];
	target.w = array[ offset + 3 ];

	return target;

}

/**
 * Writes the components of the given vector to an array. If no array is
 * provided, the function creates a new one.
 *
 * @param {Vector4Like} v - The vector to read.
 * @param {Array<number>} [array=[]] - The target array holding the vector components.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The vector components.
 */
export function vec4ToArray( v, array = [], offset = 0 ) {

	array[ offset ] = v.x;
	array[ offset + 1 ] = v.y;
	array[ offset + 2 ] = v.z;
	array[ offset + 3 ] = v.w;

	return array;

}

/**
 * Sets the components of the target from the given buffer attribute.
 *
 * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
 * @param {number} index - The index into the attribute.
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4FromBufferAttribute( attribute, index, target = vec4Create() ) {

	target.x = attribute.getX( index );
	target.y = attribute.getY( index );
	target.z = attribute.getZ( index );
	target.w = attribute.getW( index );

	return target;

}

/**
 * Sets each component of the target to a pseudo-random value between `0`
 * and `1`, excluding `1`.
 *
 * @param {Vector4Like} [target] - The target the result is stored to.
 * @return {Vector4Like} The target.
 */
export function vec4Random( target = vec4Create() ) {

	target.x = Math.random();
	target.y = Math.random();
	target.z = Math.random();
	target.w = Math.random();

	return target;

}
