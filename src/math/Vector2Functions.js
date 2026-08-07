import { clamp } from './MathUtils.js';

/**
 * A structural type describing any object that stores a 2D vector as `x` and
 * `y` number components, exactly like {@link Vector2}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Vector2} instance. Since {@link Vector2}
 * exposes compatible `x`/`y` properties, instances of that class satisfy
 * this type without any special handling.
 *
 * @typedef {Object} Vector2Like
 * @property {number} x
 * @property {number} y
 */

/**
 * Creates a new, plain {@link Vector2Like} object.
 *
 * Unlike `new Vector2()`, the returned object is not a class instance and
 * carries no `isVector2` flag - it only satisfies the {@link Vector2Like}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Vector2} class so that unused vector operations can be tree-shaken.
 *
 * @param {number} [x=0] - The x value of the vector.
 * @param {number} [y=0] - The y value of the vector.
 * @return {Vector2Like} A new vector-like object.
 */
export function vec2Create( x = 0, y = 0 ) {

	return { x: x, y: y };

}

/**
 * Sets the vector components.
 *
 * @param {number} x - The value of the x component.
 * @param {number} y - The value of the y component.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Set( x, y, target = vec2Create() ) {

	target.x = x;
	target.y = y;

	return target;

}

/**
 * Sets the vector components to the same value.
 *
 * @param {number} scalar - The value to set for all vector components.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SetScalar( scalar, target = vec2Create() ) {

	target.x = scalar;
	target.y = scalar;

	return target;

}

/**
 * Sets the vector's x component to the given value, copying `y` from `v`.
 *
 * @param {Vector2Like} v - The source vector.
 * @param {number} x - The value to set.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SetX( v, x, target = vec2Create() ) {

	target.x = x;
	target.y = v.y;

	return target;

}

/**
 * Sets the vector's y component to the given value, copying `x` from `v`.
 *
 * @param {Vector2Like} v - The source vector.
 * @param {number} y - The value to set.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SetY( v, y, target = vec2Create() ) {

	target.x = v.x;
	target.y = y;

	return target;

}

/**
 * Sets a vector component by index.
 *
 * @param {Vector2Like} v - The source vector.
 * @param {number} index - The component index. `0` equals to x, `1` equals to y.
 * @param {number} value - The value to set.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SetComponent( v, index, value, target = vec2Create() ) {

	target.x = v.x;
	target.y = v.y;

	switch ( index ) {

		case 0: target.x = value; break;
		case 1: target.y = value; break;
		default: throw new Error( 'THREE.Vector2: index is out of range: ' + index );

	}

	return target;

}

/**
 * Returns the value of the vector component which matches the given index.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} index - The component index. `0` equals to x, `1` equals to y.
 * @return {number} A vector component value.
 */
export function vec2GetComponent( v, index ) {

	switch ( index ) {

		case 0: return v.x;
		case 1: return v.y;
		default: throw new Error( 'THREE.Vector2: index is out of range: ' + index );

	}

}

/**
 * Copies the values of the given vector to the target.
 *
 * @param {Vector2Like} v - The vector to copy.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Copy( v, target = vec2Create() ) {

	target.x = v.x;
	target.y = v.y;

	return target;

}

/**
 * Adds the given vectors.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Add( a, b, target = vec2Create() ) {

	target.x = a.x + b.x;
	target.y = a.y + b.y;

	return target;

}

/**
 * Adds the given scalar value to all components of the vector.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} s - The scalar to add.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2AddScalar( v, s, target = vec2Create() ) {

	target.x = v.x + s;
	target.y = v.y + s;

	return target;

}

/**
 * Adds the given vectors and stores the result in the target.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2AddVectors( a, b, target = vec2Create() ) {

	target.x = a.x + b.x;
	target.y = a.y + b.y;

	return target;

}

/**
 * Adds the given vector scaled by the given factor.
 *
 * @param {Vector2Like} a - The vector to add to.
 * @param {Vector2Like} v - The vector to scale and add.
 * @param {number} s - The factor that scales `v`.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2AddScaledVector( a, v, s, target = vec2Create() ) {

	target.x = a.x + v.x * s;
	target.y = a.y + v.y * s;

	return target;

}

/**
 * Subtracts the given vectors.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Sub( a, b, target = vec2Create() ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;

	return target;

}

/**
 * Subtracts the given scalar value from all components of the vector.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} s - The scalar to subtract.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SubScalar( v, s, target = vec2Create() ) {

	target.x = v.x - s;
	target.y = v.y - s;

	return target;

}

/**
 * Subtracts the given vectors and stores the result in the target.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SubVectors( a, b, target = vec2Create() ) {

	target.x = a.x - b.x;
	target.y = a.y - b.y;

	return target;

}

/**
 * Multiplies the given vectors component-wise.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Multiply( a, b, target = vec2Create() ) {

	target.x = a.x * b.x;
	target.y = a.y * b.y;

	return target;

}

/**
 * Multiplies the given scalar value with all components of the vector.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} scalar - The scalar to multiply.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2MultiplyScalar( v, scalar, target = vec2Create() ) {

	target.x = v.x * scalar;
	target.y = v.y * scalar;

	return target;

}

/**
 * Divides the first vector by the second component-wise.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Divide( a, b, target = vec2Create() ) {

	target.x = a.x / b.x;
	target.y = a.y / b.y;

	return target;

}

/**
 * Divides the vector by the given scalar.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} scalar - The scalar to divide.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2DivideScalar( v, scalar, target = vec2Create() ) {

	return vec2MultiplyScalar( v, 1 / scalar, target );

}

/**
 * Multiplies the vector (with an implicit 1 as the 3rd component) by
 * the given 3x3 matrix.
 *
 * @param {Vector2Like} v - The vector.
 * @param {{elements: Array<number>|TypedArray}} m - The matrix to apply.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2ApplyMatrix3( v, m, target = vec2Create() ) {

	const x = v.x, y = v.y;
	const e = m.elements;

	target.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
	target.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];

	return target;

}

/**
 * Component-wise minimum of the given vectors.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Min( a, b, target = vec2Create() ) {

	target.x = Math.min( a.x, b.x );
	target.y = Math.min( a.y, b.y );

	return target;

}

/**
 * Component-wise maximum of the given vectors.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Max( a, b, target = vec2Create() ) {

	target.x = Math.max( a.x, b.x );
	target.y = Math.max( a.y, b.y );

	return target;

}

/**
 * Clamps the vector components between the corresponding min and max vector components.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} min - The minimum x and y values.
 * @param {Vector2Like} max - The maximum x and y values in the desired range.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Clamp( v, min, max, target = vec2Create() ) {

	// assumes min < max, componentwise

	target.x = clamp( v.x, min.x, max.x );
	target.y = clamp( v.y, min.y, max.y );

	return target;

}

/**
 * Clamps the vector components between the given min and max scalar values.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} minVal - The minimum value the components will be clamped to.
 * @param {number} maxVal - The maximum value the components will be clamped to.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2ClampScalar( v, minVal, maxVal, target = vec2Create() ) {

	target.x = clamp( v.x, minVal, maxVal );
	target.y = clamp( v.y, minVal, maxVal );

	return target;

}

/**
 * Clamps the length of the vector between the given min and max values.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} min - The minimum value the vector length will be clamped to.
 * @param {number} max - The maximum value the vector length will be clamped to.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2ClampLength( v, min, max, target = vec2Create() ) {

	const length = vec2Length( v );

	return vec2MultiplyScalar( vec2DivideScalar( v, length || 1, target ), clamp( length, min, max ), target );

}

/**
 * Rounds the components of the vector down to the nearest integer value.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Floor( v, target = vec2Create() ) {

	target.x = Math.floor( v.x );
	target.y = Math.floor( v.y );

	return target;

}

/**
 * Rounds the components of the vector up to the nearest integer value.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Ceil( v, target = vec2Create() ) {

	target.x = Math.ceil( v.x );
	target.y = Math.ceil( v.y );

	return target;

}

/**
 * Rounds the components of the vector to the nearest integer value.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Round( v, target = vec2Create() ) {

	target.x = Math.round( v.x );
	target.y = Math.round( v.y );

	return target;

}

/**
 * Rounds the components of the vector towards zero to an integer value.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2RoundToZero( v, target = vec2Create() ) {

	target.x = Math.trunc( v.x );
	target.y = Math.trunc( v.y );

	return target;

}

/**
 * Inverts the vector - i.e. sets x = -x and y = -y.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Negate( v, target = vec2Create() ) {

	target.x = - v.x;
	target.y = - v.y;

	return target;

}

/**
 * Calculates the dot product of the given vectors.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {number} The result of the dot product.
 */
export function vec2Dot( a, b ) {

	return a.x * b.x + a.y * b.y;

}

/**
 * Calculates the cross product of the given vectors.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {number} The result of the cross product.
 */
export function vec2Cross( a, b ) {

	return a.x * b.y - a.y * b.x;

}

/**
 * Computes the square of the Euclidean length of the vector.
 *
 * @param {Vector2Like} v - The vector.
 * @return {number} The square length of the vector.
 */
export function vec2LengthSq( v ) {

	return v.x * v.x + v.y * v.y;

}

/**
 * Computes the Euclidean length of the vector.
 *
 * @param {Vector2Like} v - The vector.
 * @return {number} The length of the vector.
 */
export function vec2Length( v ) {

	return Math.sqrt( v.x * v.x + v.y * v.y );

}

/**
 * Computes the Manhattan length of the vector.
 *
 * @param {Vector2Like} v - The vector.
 * @return {number} The length of the vector.
 */
export function vec2ManhattanLength( v ) {

	return Math.abs( v.x ) + Math.abs( v.y );

}

/**
 * Converts the vector to a unit vector.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Normalize( v, target = vec2Create() ) {

	return vec2DivideScalar( v, vec2Length( v ) || 1, target );

}

/**
 * Computes the angle in radians of the vector with respect to the positive x-axis.
 *
 * @param {Vector2Like} v - The vector.
 * @return {number} The angle in radians.
 */
export function vec2Angle( v ) {

	const angle = Math.atan2( - v.y, - v.x ) + Math.PI;

	return angle;

}

/**
 * Returns the angle between the given vectors in radians.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {number} The angle in radians.
 */
export function vec2AngleTo( a, b ) {

	const denominator = Math.sqrt( vec2LengthSq( a ) * vec2LengthSq( b ) );

	if ( denominator === 0 ) return Math.PI / 2;

	const theta = vec2Dot( a, b ) / denominator;

	// clamp, to handle numerical problems

	return Math.acos( clamp( theta, - 1, 1 ) );

}

/**
 * Computes the distance from one vector to another.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {number} The distance.
 */
export function vec2DistanceTo( a, b ) {

	return Math.sqrt( vec2DistanceToSquared( a, b ) );

}

/**
 * Computes the squared distance from one vector to another.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {number} The squared distance.
 */
export function vec2DistanceToSquared( a, b ) {

	const dx = a.x - b.x, dy = a.y - b.y;
	return dx * dx + dy * dy;

}

/**
 * Computes the Manhattan distance from one vector to another.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {number} The Manhattan distance.
 */
export function vec2ManhattanDistanceTo( a, b ) {

	return Math.abs( a.x - b.x ) + Math.abs( a.y - b.y );

}

/**
 * Sets the vector to a vector with the same direction as `v`, but with the specified length.
 *
 * @param {Vector2Like} v - The vector.
 * @param {number} length - The new length of the vector.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2SetLength( v, length, target = vec2Create() ) {

	return vec2MultiplyScalar( vec2Normalize( v, target ), length, target );

}

/**
 * Linearly interpolates between two vectors.
 *
 * @param {Vector2Like} a - The starting vector.
 * @param {Vector2Like} b - The vector to interpolate towards.
 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Lerp( a, b, alpha, target = vec2Create() ) {

	target.x = a.x + ( b.x - a.x ) * alpha;
	target.y = a.y + ( b.y - a.y ) * alpha;

	return target;

}

/**
 * Linearly interpolates between the given vectors.
 *
 * @param {Vector2Like} v1 - The first vector.
 * @param {Vector2Like} v2 - The second vector.
 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2LerpVectors( v1, v2, alpha, target = vec2Create() ) {

	target.x = v1.x + ( v2.x - v1.x ) * alpha;
	target.y = v1.y + ( v2.y - v1.y ) * alpha;

	return target;

}

/**
 * Returns `true` if the vectors are equal.
 *
 * @param {Vector2Like} a - The first vector.
 * @param {Vector2Like} b - The second vector.
 * @return {boolean} Whether the vectors are equal.
 */
export function vec2Equals( a, b ) {

	return ( ( a.x === b.x ) && ( a.y === b.y ) );

}

/**
 * Sets the vector's components from the given array.
 *
 * @param {Array<number>|TypedArray} array - An array holding the vector component values.
 * @param {number} [offset=0] - The offset into the array.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2FromArray( array, offset = 0, target = vec2Create() ) {

	target.x = array[ offset ];
	target.y = array[ offset + 1 ];

	return target;

}

/**
 * Writes the components of the vector to the given array.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Array<number>} [array=[]] - The target array holding the vector components.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The vector components.
 */
export function vec2ToArray( v, array = [], offset = 0 ) {

	array[ offset ] = v.x;
	array[ offset + 1 ] = v.y;

	return array;

}

/**
 * Sets the components of the vector from the given buffer attribute.
 *
 * @param {{getX: function(number): number, getY: function(number): number}} attribute - The buffer attribute holding vector data.
 * @param {number} index - The index into the attribute.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2FromBufferAttribute( attribute, index, target = vec2Create() ) {

	target.x = attribute.getX( index );
	target.y = attribute.getY( index );

	return target;

}

/**
 * Rotates the vector around the given center by the given angle.
 *
 * @param {Vector2Like} v - The vector.
 * @param {Vector2Like} center - The point around which to rotate.
 * @param {number} angle - The angle to rotate, in radians.
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2RotateAround( v, center, angle, target = vec2Create() ) {

	const c = Math.cos( angle ), s = Math.sin( angle );

	const x = v.x - center.x;
	const y = v.y - center.y;

	target.x = x * c - y * s + center.x;
	target.y = x * s + y * c + center.y;

	return target;

}

/**
 * Sets each component of the vector to a pseudo-random value between `0` and
 * `1`, excluding `1`.
 *
 * @param {Vector2Like} [target] - The target the result is stored to.
 * @return {Vector2Like} The target.
 */
export function vec2Random( target = vec2Create() ) {

	target.x = Math.random();
	target.y = Math.random();

	return target;

}
