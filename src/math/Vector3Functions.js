import { clamp } from './MathUtils.js';

/**
 * A structural type describing any object that stores a 3D vector as
 * `x`, `y` and `z` numbers, exactly like {@link Vector3}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Vector3} instance. Since {@link Vector3}
 * exposes compatible `x`/`y`/`z` properties, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * Creates a new, plain {@link Vector3Like} object set to `(0, 0, 0)`.
 *
 * Unlike `new Vector3()`, the returned object is not a class instance and
 * carries no `isVector3` flag - it only satisfies the {@link Vector3Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Vector3} class so that unused vector operations can be tree-shaken.
 *
 * @return {Vector3Like} A new vector-like object set to `(0, 0, 0)`.
 */
export function vec3Create() {

	return { x: 0, y: 0, z: 0 };

}

/**
 * Sets the components of the given target.
 *
 * @param {Vector3Like} target - The vector-like object to modify.
 * @param {number} x - The value of the x component.
 * @param {number} y - The value of the y component.
 * @param {number} z - The value of the z component.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Set( target, x, y, z ) {

	if ( z === undefined ) z = target.z; // sprite.scale.set(x,y)

	target.x = x;
	target.y = y;
	target.z = z;

	return target;

}

/**
 * Sets the components of the target to the same value.
 *
 * @param {Vector3Like} target - The vector-like object to modify.
 * @param {number} scalar - The value to set for all components.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetScalar( target, scalar ) {

	target.x = scalar;
	target.y = scalar;
	target.z = scalar;

	return target;

}

/**
 * Sets the target's x component to the given value.
 *
 * @param {Vector3Like} target - The vector-like object to modify.
 * @param {number} x - The value to set.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetX( target, x ) {

	target.x = x;

	return target;

}

/**
 * Sets the target's y component to the given value.
 *
 * @param {Vector3Like} target - The vector-like object to modify.
 * @param {number} y - The value to set.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetY( target, y ) {

	target.y = y;

	return target;

}

/**
 * Sets the target's z component to the given value.
 *
 * @param {Vector3Like} target - The vector-like object to modify.
 * @param {number} z - The value to set.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetZ( target, z ) {

	target.z = z;

	return target;

}

/**
 * Allows to set a component of the target with an index.
 *
 * @param {Vector3Like} target - The vector-like object to modify.
 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
 * @param {number} value - The value to set.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetComponent( target, index, value ) {

	switch ( index ) {

		case 0: target.x = value; break;
		case 1: target.y = value; break;
		case 2: target.z = value; break;
		default: throw new Error( 'THREE.Vector3: index is out of range: ' + index );

	}

	return target;

}

/**
 * Returns the value of the component which matches the given index.
 *
 * @param {Vector3Like} v - The vector-like object to read.
 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
 * @return {number} The component value.
 */
export function vec3GetComponent( v, index ) {

	switch ( index ) {

		case 0: return v.x;
		case 1: return v.y;
		case 2: return v.z;
		default: throw new Error( 'THREE.Vector3: index is out of range: ' + index );

	}

}

/**
 * Copies the values of the given vector into the target.
 *
 * @param {Vector3Like} v - The vector to copy.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} A copy of `v`.
 */
export function vec3Copy( v, target = vec3Create() ) {

	target.x = v.x;
	target.y = v.y;
	target.z = v.z;

	return target;

}

/**
 * Adds the given vectors and stores the result in the target.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The vector to add.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Add( a, b, target = vec3Create() ) {

	target.x = a.x + b.x;
	target.y = a.y + b.y;
	target.z = a.z + b.z;

	return target;

}

/**
 * Adds the given scalar value to all components of the given vector and
 * stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {number} s - The scalar to add.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3AddScalar( v, s, target = vec3Create() ) {

	target.x = v.x + s;
	target.y = v.y + s;
	target.z = v.z + s;

	return target;

}

/**
 * Adds the given vectors and stores the result in the target.
 * Equivalent to {@link vec3Add}, provided for parity with {@link Vector3#addVectors}.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3AddVectors( a, b, target = vec3Create() ) {

	target.x = a.x + b.x;
	target.y = a.y + b.y;
	target.z = a.z + b.z;

	return target;

}

/**
 * Adds the given vector scaled by the given factor to `v` and stores the
 * result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} addend - The vector to scale and add.
 * @param {number} s - The factor that scales `addend`.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3AddScaledVector( v, addend, s, target = vec3Create() ) {

	target.x = v.x + addend.x * s;
	target.y = v.y + addend.y * s;
	target.z = v.z + addend.z * s;

	return target;

}

/**
 * Subtracts `b` from `a` and stores the result in the target.
 *
 * @param {Vector3Like} a - The vector to subtract from.
 * @param {Vector3Like} b - The vector to subtract.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Sub( a, b, target = vec3Create() ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;
	target.z = a.z - b.z;

	return target;

}

/**
 * Subtracts the given scalar value from all components of the given
 * vector and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {number} s - The scalar to subtract.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SubScalar( v, s, target = vec3Create() ) {

	target.x = v.x - s;
	target.y = v.y - s;
	target.z = v.z - s;

	return target;

}

/**
 * Subtracts the given vectors and stores the result in the target.
 * Equivalent to {@link vec3Sub}, provided for parity with {@link Vector3#subVectors}.
 *
 * @param {Vector3Like} a - The vector to subtract from.
 * @param {Vector3Like} b - The vector to subtract.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SubVectors( a, b, target = vec3Create() ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;
	target.z = a.z - b.z;

	return target;

}

/**
 * Multiplies the given vectors and stores the result in the target.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Multiply( a, b, target = vec3Create() ) {

	target.x = a.x * b.x;
	target.y = a.y * b.y;
	target.z = a.z * b.z;

	return target;

}

/**
 * Multiplies the given scalar value with all components of the given
 * vector and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {number} scalar - The scalar to multiply.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3MultiplyScalar( v, scalar, target = vec3Create() ) {

	target.x = v.x * scalar;
	target.y = v.y * scalar;
	target.z = v.z * scalar;

	return target;

}

/**
 * Multiplies the given vectors and stores the result in the target.
 * Equivalent to {@link vec3Multiply}, provided for parity with {@link Vector3#multiplyVectors}.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3MultiplyVectors( a, b, target = vec3Create() ) {

	target.x = a.x * b.x;
	target.y = a.y * b.y;
	target.z = a.z * b.z;

	return target;

}

/**
 * Sets the target quaternion-like scratch object from the given Euler
 * angles. Ported from {@link Quaternion#setFromEuler}, inlined here so that
 * {@link vec3ApplyEuler} does not depend on the {@link Quaternion} class.
 *
 * @param {EulerLike} euler - The Euler angles.
 * @param {Object} out - A `{x,y,z,w}` scratch object the result is stored to.
 * @return {Object} The `out` scratch object, for chaining.
 */
function quatFromEuler( euler, out ) {

	const x = euler.x, y = euler.y, z = euler.z, order = euler.order;

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
			out.x = s1 * c2 * c3 + c1 * s2 * s3;
			out.y = c1 * s2 * c3 - s1 * c2 * s3;
			out.z = c1 * c2 * s3 + s1 * s2 * c3;
			out.w = c1 * c2 * c3 - s1 * s2 * s3;
			break;

		case 'YXZ':
			out.x = s1 * c2 * c3 + c1 * s2 * s3;
			out.y = c1 * s2 * c3 - s1 * c2 * s3;
			out.z = c1 * c2 * s3 - s1 * s2 * c3;
			out.w = c1 * c2 * c3 + s1 * s2 * s3;
			break;

		case 'ZXY':
			out.x = s1 * c2 * c3 - c1 * s2 * s3;
			out.y = c1 * s2 * c3 + s1 * c2 * s3;
			out.z = c1 * c2 * s3 + s1 * s2 * c3;
			out.w = c1 * c2 * c3 - s1 * s2 * s3;
			break;

		case 'ZYX':
			out.x = s1 * c2 * c3 - c1 * s2 * s3;
			out.y = c1 * s2 * c3 + s1 * c2 * s3;
			out.z = c1 * c2 * s3 - s1 * s2 * c3;
			out.w = c1 * c2 * c3 + s1 * s2 * s3;
			break;

		case 'YZX':
			out.x = s1 * c2 * c3 + c1 * s2 * s3;
			out.y = c1 * s2 * c3 + s1 * c2 * s3;
			out.z = c1 * c2 * s3 - s1 * s2 * c3;
			out.w = c1 * c2 * c3 - s1 * s2 * s3;
			break;

		case 'XZY':
			out.x = s1 * c2 * c3 - c1 * s2 * s3;
			out.y = c1 * s2 * c3 - s1 * c2 * s3;
			out.z = c1 * c2 * s3 + s1 * s2 * c3;
			out.w = c1 * c2 * c3 + s1 * s2 * s3;
			break;

	}

	return out;

}

/**
 * Applies the given Euler rotation to the given vector and stores the
 * result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {EulerLike} euler - The Euler angles.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ApplyEuler( v, euler, target = vec3Create() ) {

	return vec3ApplyQuaternion( v, quatFromEuler( euler, _quaternion ), target );

}

/**
 * Applies a rotation specified by an axis and an angle to the given vector
 * and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} axis - A normalized vector representing the rotation axis.
 * @param {number} angle - The angle in radians.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ApplyAxisAngle( v, axis, angle, target = vec3Create() ) {

	const halfAngle = angle / 2, s = Math.sin( halfAngle );

	_quaternion.x = axis.x * s;
	_quaternion.y = axis.y * s;
	_quaternion.z = axis.z * s;
	_quaternion.w = Math.cos( halfAngle );

	return vec3ApplyQuaternion( v, _quaternion, target );

}

/**
 * Multiplies the given vector with the given 3x3 matrix and stores the
 * result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Matrix3Like} m - The 3x3 matrix.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ApplyMatrix3( v, m, target = vec3Create() ) {

	const x = v.x, y = v.y, z = v.z;
	const e = m.elements;

	target.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
	target.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
	target.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

	return target;

}

/**
 * Multiplies the given vector by the given normal matrix and normalizes
 * the result, storing it in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Matrix3Like} m - The normal matrix.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ApplyNormalMatrix( v, m, target = vec3Create() ) {

	vec3ApplyMatrix3( v, m, target );

	return vec3Normalize( target, target );

}

/**
 * Multiplies the given vector (with an implicit 1 in the 4th dimension) by
 * `m`, divides by perspective, and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Matrix4Like} m - The matrix to apply.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ApplyMatrix4( v, m, target = vec3Create() ) {

	const x = v.x, y = v.y, z = v.z;
	const e = m.elements;

	const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

	target.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
	target.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
	target.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

	return target;

}

/**
 * Applies the given Quaternion to the given vector and stores the result
 * in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {QuaternionLike} q - The Quaternion. Assumed to have unit length.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ApplyQuaternion( v, q, target = vec3Create() ) {

	const vx = v.x, vy = v.y, vz = v.z;
	// Accept QuaternionLike (`_x`/`_y`/`_z`/`_w`) and plain `{x,y,z,w}` (or
	// Quaternion instances, which expose both via fields and getters).
	const qx = q._x ?? q.x, qy = q._y ?? q.y, qz = q._z ?? q.z, qw = q._w ?? q.w;

	// t = 2 * cross( q.xyz, v );
	const tx = 2 * ( qy * vz - qz * vy );
	const ty = 2 * ( qz * vx - qx * vz );
	const tz = 2 * ( qx * vy - qy * vx );

	// v + q.w * t + cross( q.xyz, t );
	target.x = vx + qw * tx + qy * tz - qz * ty;
	target.y = vy + qw * ty + qz * tx - qx * tz;
	target.z = vz + qw * tz + qx * ty - qy * tx;

	return target;

}

/**
 * Projects the given vector from world space into the camera's normalized
 * device coordinate (NDC) space and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Camera} camera - The camera.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Project( v, camera, target = vec3Create() ) {

	vec3ApplyMatrix4( v, camera.matrixWorldInverse, target );

	return vec3ApplyMatrix4( target, camera.projectionMatrix, target );

}

/**
 * Unprojects the given vector from the camera's normalized device
 * coordinate (NDC) space into world space and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Camera} camera - The camera.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Unproject( v, camera, target = vec3Create() ) {

	vec3ApplyMatrix4( v, camera.projectionMatrixInverse, target );

	return vec3ApplyMatrix4( target, camera.matrixWorld, target );

}

/**
 * Transforms the given vector by the upper left 3x3 sub-matrix of the
 * given 4x4 matrix, normalizes the result, and stores it in the target.
 *
 * @param {Vector3Like} v - The vector, interpreted as a direction.
 * @param {Matrix4Like} m - The affine matrix.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3TransformDirection( v, m, target = vec3Create() ) {

	const x = v.x, y = v.y, z = v.z;
	const e = m.elements;

	target.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
	target.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
	target.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

	return vec3Normalize( target, target );

}

/**
 * Divides `a` by `b` and stores the result in the target.
 *
 * @param {Vector3Like} a - The vector to divide.
 * @param {Vector3Like} b - The vector to divide by.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Divide( a, b, target = vec3Create() ) {

	target.x = a.x / b.x;
	target.y = a.y / b.y;
	target.z = a.z / b.z;

	return target;

}

/**
 * Divides the given vector by the given scalar and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector to divide.
 * @param {number} scalar - The scalar to divide by.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3DivideScalar( v, scalar, target = vec3Create() ) {

	return vec3MultiplyScalar( v, 1 / scalar, target );

}

/**
 * Component-wise minimum of the given vectors, stored in the target.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Min( a, b, target = vec3Create() ) {

	target.x = Math.min( a.x, b.x );
	target.y = Math.min( a.y, b.y );
	target.z = Math.min( a.z, b.z );

	return target;

}

/**
 * Component-wise maximum of the given vectors, stored in the target.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Max( a, b, target = vec3Create() ) {

	target.x = Math.max( a.x, b.x );
	target.y = Math.max( a.y, b.y );
	target.z = Math.max( a.z, b.z );

	return target;

}

/**
 * Clamps the given vector's components between the given min and max
 * vectors, componentwise, and stores the result in the target.
 *
 * Assumes `min < max`, componentwise.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} min - The minimum x, y and z values.
 * @param {Vector3Like} max - The maximum x, y and z values in the desired range.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Clamp( v, min, max, target = vec3Create() ) {

	target.x = clamp( v.x, min.x, max.x );
	target.y = clamp( v.y, min.y, max.y );
	target.z = clamp( v.z, min.z, max.z );

	return target;

}

/**
 * Clamps the given vector's components between the given min and max
 * values and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {number} minVal - The minimum value the components will be clamped to.
 * @param {number} maxVal - The maximum value the components will be clamped to.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ClampScalar( v, minVal, maxVal, target = vec3Create() ) {

	target.x = clamp( v.x, minVal, maxVal );
	target.y = clamp( v.y, minVal, maxVal );
	target.z = clamp( v.z, minVal, maxVal );

	return target;

}

/**
 * Clamps the given vector's length between the given min and max values
 * and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {number} min - The minimum value the vector length will be clamped to.
 * @param {number} max - The maximum value the vector length will be clamped to.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ClampLength( v, min, max, target = vec3Create() ) {

	const length = vec3Length( v );

	vec3DivideScalar( v, length || 1, target );

	return vec3MultiplyScalar( target, clamp( length, min, max ), target );

}

/**
 * The components of the given vector, rounded down to the nearest integer
 * value, stored in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Floor( v, target = vec3Create() ) {

	target.x = Math.floor( v.x );
	target.y = Math.floor( v.y );
	target.z = Math.floor( v.z );

	return target;

}

/**
 * The components of the given vector, rounded up to the nearest integer
 * value, stored in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Ceil( v, target = vec3Create() ) {

	target.x = Math.ceil( v.x );
	target.y = Math.ceil( v.y );
	target.z = Math.ceil( v.z );

	return target;

}

/**
 * The components of the given vector, rounded to the nearest integer
 * value, stored in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Round( v, target = vec3Create() ) {

	target.x = Math.round( v.x );
	target.y = Math.round( v.y );
	target.z = Math.round( v.z );

	return target;

}

/**
 * The components of the given vector, rounded towards zero (up if
 * negative, down if positive) to an integer value, stored in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3RoundToZero( v, target = vec3Create() ) {

	target.x = Math.trunc( v.x );
	target.y = Math.trunc( v.y );
	target.z = Math.trunc( v.z );

	return target;

}

/**
 * Inverts the given vector - i.e. sets x = -x, y = -y and z = -z - and
 * stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Negate( v, target = vec3Create() ) {

	target.x = - v.x;
	target.y = - v.y;
	target.z = - v.z;

	return target;

}

/**
 * Calculates the dot product of the given vectors.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @return {number} The result of the dot product.
 */
export function vec3Dot( a, b ) {

	return a.x * b.x + a.y * b.y + a.z * b.z;

}

/**
 * Computes the square of the Euclidean length (straight-line length) of
 * the given vector. If you are comparing the lengths of vectors, you
 * should compare the length squared instead as it is slightly more
 * efficient to calculate.
 *
 * @param {Vector3Like} v - The vector.
 * @return {number} The square length of the vector.
 */
export function vec3LengthSq( v ) {

	return v.x * v.x + v.y * v.y + v.z * v.z;

}

/**
 * Computes the Euclidean length (straight-line length) of the given vector.
 *
 * @param {Vector3Like} v - The vector.
 * @return {number} The length of the vector.
 */
export function vec3Length( v ) {

	return Math.sqrt( v.x * v.x + v.y * v.y + v.z * v.z );

}

/**
 * Computes the Manhattan length of the given vector.
 *
 * @param {Vector3Like} v - The vector.
 * @return {number} The length of the vector.
 */
export function vec3ManhattanLength( v ) {

	return Math.abs( v.x ) + Math.abs( v.y ) + Math.abs( v.z );

}

/**
 * Converts the given vector to a unit vector - that is, a vector with the
 * same direction, but with a length of `1` - and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Normalize( v, target = vec3Create() ) {

	return vec3DivideScalar( v, vec3Length( v ) || 1, target );

}

/**
 * Sets the target to a vector with the same direction as the given
 * vector, but with the specified length.
 *
 * @param {Vector3Like} v - The vector.
 * @param {number} length - The new length of the vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetLength( v, length, target = vec3Create() ) {

	vec3Normalize( v, target );

	return vec3MultiplyScalar( target, length, target );

}

/**
 * Linearly interpolates between the given vectors, where alpha is the
 * percent distance along the line - alpha = 0 will be `a`, and alpha = 1
 * will be `b`. The result is stored in the target.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The vector to interpolate towards.
 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Lerp( a, b, alpha, target = vec3Create() ) {

	target.x = a.x + ( b.x - a.x ) * alpha;
	target.y = a.y + ( b.y - a.y ) * alpha;
	target.z = a.z + ( b.z - a.z ) * alpha;

	return target;

}

/**
 * Linearly interpolates between the given vectors and stores the result
 * in the target. Equivalent to {@link vec3Lerp}, provided for parity with
 * {@link Vector3#lerpVectors}.
 *
 * @param {Vector3Like} v1 - The first vector.
 * @param {Vector3Like} v2 - The second vector.
 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3LerpVectors( v1, v2, alpha, target = vec3Create() ) {

	target.x = v1.x + ( v2.x - v1.x ) * alpha;
	target.y = v1.y + ( v2.y - v1.y ) * alpha;
	target.z = v1.z + ( v2.z - v1.z ) * alpha;

	return target;

}

/**
 * Calculates the cross product of the given vectors (`a` × `b`) and
 * stores the result in the target. Equivalent to {@link vec3CrossVectors},
 * provided for parity with {@link Vector3#cross}.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Cross( a, b, target = vec3Create() ) {

	return vec3CrossVectors( a, b, target );

}

/**
 * Calculates the cross product of the given vectors (`a` × `b`) and
 * stores the result in the target.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3CrossVectors( a, b, target = vec3Create() ) {

	const ax = a.x, ay = a.y, az = a.z;
	const bx = b.x, by = b.y, bz = b.z;

	target.x = ay * bz - az * by;
	target.y = az * bx - ax * bz;
	target.z = ax * by - ay * bx;

	return target;

}

/**
 * Projects `v` onto `onto` and stores the result in the target.
 *
 * @param {Vector3Like} v - The vector to project.
 * @param {Vector3Like} onto - The vector to project onto.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ProjectOnVector( v, onto, target = vec3Create() ) {

	const denominator = vec3LengthSq( onto );

	if ( denominator === 0 ) return vec3Set( target, 0, 0, 0 );

	const scalar = vec3Dot( onto, v ) / denominator;

	return vec3MultiplyScalar( onto, scalar, target );

}

/**
 * Projects `v` onto a plane by subtracting `v` projected onto the plane's
 * normal from `v`, storing the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} planeNormal - The plane normal.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3ProjectOnPlane( v, planeNormal, target = vec3Create() ) {

	vec3ProjectOnVector( v, planeNormal, _v1 );

	return vec3Sub( v, _v1, target );

}

/**
 * Reflects `v` off a plane orthogonal to the given (normalized) normal
 * vector, storing the result in the target.
 *
 * @param {Vector3Like} v - The vector.
 * @param {Vector3Like} normal - The (normalized) normal vector.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Reflect( v, normal, target = vec3Create() ) {

	vec3MultiplyScalar( normal, 2 * vec3Dot( v, normal ), _v1 );

	return vec3Sub( v, _v1, target );

}

/**
 * Returns the angle between the given vectors in radians.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @return {number} The angle in radians.
 */
export function vec3AngleTo( a, b ) {

	const denominator = Math.sqrt( vec3LengthSq( a ) * vec3LengthSq( b ) );

	if ( denominator === 0 ) return Math.PI / 2;

	const theta = vec3Dot( a, b ) / denominator;

	// clamp, to handle numerical problems

	return Math.acos( clamp( theta, - 1, 1 ) );

}

/**
 * Computes the distance between the given vectors.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @return {number} The distance.
 */
export function vec3DistanceTo( a, b ) {

	return Math.sqrt( vec3DistanceToSquared( a, b ) );

}

/**
 * Computes the squared distance between the given vectors. If you are
 * just comparing the distance with another distance, you should compare
 * the distance squared instead as it is slightly more efficient to calculate.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @return {number} The squared distance.
 */
export function vec3DistanceToSquared( a, b ) {

	const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;

	return dx * dx + dy * dy + dz * dz;

}

/**
 * Computes the Manhattan distance between the given vectors.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @return {number} The Manhattan distance.
 */
export function vec3ManhattanDistanceTo( a, b ) {

	return Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );

}

/**
 * Sets the target's components from the given spherical coordinates.
 *
 * @param {SphericalLike} s - The spherical coordinates.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromSpherical( s, target = vec3Create() ) {

	return vec3SetFromSphericalCoords( s.radius, s.phi, s.theta, target );

}

/**
 * Sets the target's components from the given spherical coordinates.
 *
 * @param {number} radius - The radius.
 * @param {number} phi - The phi angle in radians.
 * @param {number} theta - The theta angle in radians.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromSphericalCoords( radius, phi, theta, target = vec3Create() ) {

	const sinPhiRadius = Math.sin( phi ) * radius;

	target.x = sinPhiRadius * Math.sin( theta );
	target.y = Math.cos( phi ) * radius;
	target.z = sinPhiRadius * Math.cos( theta );

	return target;

}

/**
 * Sets the target's components from the given cylindrical coordinates.
 *
 * @param {CylindricalLike} c - The cylindrical coordinates.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromCylindrical( c, target = vec3Create() ) {

	return vec3SetFromCylindricalCoords( c.radius, c.theta, c.y, target );

}

/**
 * Sets the target's components from the given cylindrical coordinates.
 *
 * @param {number} radius - The radius.
 * @param {number} theta - The theta angle in radians.
 * @param {number} y - The y value.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromCylindricalCoords( radius, theta, y, target = vec3Create() ) {

	target.x = radius * Math.sin( theta );
	target.y = y;
	target.z = radius * Math.cos( theta );

	return target;

}

/**
 * Sets the target's components to the position elements of the given
 * transformation matrix.
 *
 * @param {Matrix4Like} m - The 4x4 matrix.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromMatrixPosition( m, target = vec3Create() ) {

	const e = m.elements;

	target.x = e[ 12 ];
	target.y = e[ 13 ];
	target.z = e[ 14 ];

	return target;

}

/**
 * Sets the target's components to the scale elements of the given
 * transformation matrix.
 *
 * @param {Matrix4Like} m - The 4x4 matrix.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromMatrixScale( m, target = vec3Create() ) {

	const sx = vec3Length( vec3SetFromMatrixColumn( m, 0, _v1 ) );
	const sy = vec3Length( vec3SetFromMatrixColumn( m, 1, _v1 ) );
	const sz = vec3Length( vec3SetFromMatrixColumn( m, 2, _v1 ) );

	target.x = sx;
	target.y = sy;
	target.z = sz;

	return target;

}

/**
 * Sets the target's components from the specified matrix column.
 *
 * @param {Matrix4Like} m - The 4x4 matrix.
 * @param {number} index - The column index.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromMatrixColumn( m, index, target = vec3Create() ) {

	return vec3FromArray( m.elements, index * 4, target );

}

/**
 * Sets the target's components from the specified 3x3 matrix column.
 *
 * @param {Matrix3Like} m - The 3x3 matrix.
 * @param {number} index - The column index.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromMatrix3Column( m, index, target = vec3Create() ) {

	return vec3FromArray( m.elements, index * 3, target );

}

/**
 * Sets the target's components from the given Euler angles.
 *
 * @param {EulerLike} e - The Euler angles to set.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromEuler( e, target = vec3Create() ) {

	target.x = e.x;
	target.y = e.y;
	target.z = e.z;

	return target;

}

/**
 * Sets the target's components from the RGB components of the given color.
 *
 * @param {ColorLike} c - The color to set.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3SetFromColor( c, target = vec3Create() ) {

	target.x = c.r;
	target.y = c.g;
	target.z = c.b;

	return target;

}

/**
 * Returns `true` if the given vectors are equal.
 *
 * @param {Vector3Like} a - The first vector.
 * @param {Vector3Like} b - The second vector.
 * @return {boolean} Whether the given vectors are equal.
 */
export function vec3Equals( a, b ) {

	return ( a.x === b.x ) && ( a.y === b.y ) && ( a.z === b.z );

}

/**
 * Sets the target's x value to `array[ offset ]`, y value to
 * `array[ offset + 1 ]` and z value to `array[ offset + 2 ]`.
 *
 * @param {Array<number>} array - An array holding the vector component values.
 * @param {number} [offset=0] - The offset into the array.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3FromArray( array, offset = 0, target = vec3Create() ) {

	target.x = array[ offset ];
	target.y = array[ offset + 1 ];
	target.z = array[ offset + 2 ];

	return target;

}

/**
 * Writes the components of the given vector to an array. If no array is
 * provided, the function creates a new one.
 *
 * @param {Vector3Like} v - The vector to read.
 * @param {Array<number>} [array=[]] - The target array holding the vector components.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The vector components.
 */
export function vec3ToArray( v, array = [], offset = 0 ) {

	array[ offset ] = v.x;
	array[ offset + 1 ] = v.y;
	array[ offset + 2 ] = v.z;

	return array;

}

/**
 * Sets the target's components from the given buffer attribute.
 *
 * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
 * @param {number} index - The index into the attribute.
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3FromBufferAttribute( attribute, index, target = vec3Create() ) {

	target.x = attribute.getX( index );
	target.y = attribute.getY( index );
	target.z = attribute.getZ( index );

	return target;

}

/**
 * Sets each component of the target to a pseudo-random value between `0`
 * and `1`, excluding `1`.
 *
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3Random( target = vec3Create() ) {

	target.x = Math.random();
	target.y = Math.random();
	target.z = Math.random();

	return target;

}

/**
 * Sets the target to a uniformly random point on a unit sphere.
 *
 * @param {Vector3Like} [target] - The target the result is stored to.
 * @return {Vector3Like} The target, for chaining.
 */
export function vec3RandomDirection( target = vec3Create() ) {

	// https://mathworld.wolfram.com/SpherePointPicking.html

	const theta = Math.random() * Math.PI * 2;
	const u = Math.random() * 2 - 1;
	const c = Math.sqrt( 1 - u * u );

	target.x = c * Math.cos( theta );
	target.y = u;
	target.z = c * Math.sin( theta );

	return target;

}

const _v1 = { x: 0, y: 0, z: 0 };
const _quaternion = { x: 0, y: 0, z: 0, w: 1 };
