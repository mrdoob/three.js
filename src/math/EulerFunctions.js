import { mat4Create, mat4MakeRotationFromQuaternion } from './Matrix4Functions.js';
import { quatCreate, quatSetFromEuler } from './QuaternionFunctions.js';
import { clamp } from './MathUtils.js';
import { warn } from '../utils.js';

/**
 * A structural type describing any object that stores Euler angles as
 * `_x`, `_y`, `_z` and `_order` fields, exactly like {@link Euler}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring an {@link Euler} instance. Since {@link Euler}
 * exposes compatible fields, instances of that class satisfy this type
 * without any special handling. Underscored field names match the class
 * storage (and {@link Quaternion#setFromEuler}) so that writing through a
 * class instance as `target` does not fire per-component setters /
 * `_onChange` callbacks.
 *
 * @typedef {Object} EulerLike
 * @property {number} _x - The angle of the x axis in radians.
 * @property {number} _y - The angle of the y axis in radians.
 * @property {number} _z - The angle of the z axis in radians.
 * @property {string} _order - A string representing the order that the rotations are applied.
 */

/**
 * The default Euler angle order.
 *
 * @type {string}
 * @default 'XYZ'
 */
export const EULER_DEFAULT_ORDER = 'XYZ';

/**
 * Creates a new, plain {@link EulerLike} object holding zero angles in the
 * default order.
 *
 * Unlike `new Euler()`, the returned object is not a class instance and
 * carries no `isEuler` flag - it only satisfies the {@link EulerLike}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Euler} class so that unused Euler operations can be tree-shaken.
 *
 * @param {number} [x=0] - The angle of the x axis in radians.
 * @param {number} [y=0] - The angle of the y axis in radians.
 * @param {number} [z=0] - The angle of the z axis in radians.
 * @param {string} [order=EULER_DEFAULT_ORDER] - A string representing the order that the rotations are applied.
 * @return {EulerLike} A new Euler-like object.
 */
export function eulerCreate( x = 0, y = 0, z = 0, order = EULER_DEFAULT_ORDER ) {

	return { _x: x, _y: y, _z: z, _order: order };

}

/**
 * Sets the Euler components of the given target.
 *
 * @param {number} x - The angle of the x axis in radians.
 * @param {number} y - The angle of the y axis in radians.
 * @param {number} z - The angle of the z axis in radians.
 * @param {string} [order] - A string representing the order that the rotations are applied. Defaults to the target's current order.
 * @param {EulerLike} [target] - The target the result is stored to.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerSet( x, y, z, order, target = eulerCreate() ) {

	target._x = x;
	target._y = y;
	target._z = z;
	target._order = ( order !== undefined ) ? order : target._order;

	return target;

}

/**
 * Copies the values of the given Euler-like object to the target.
 *
 * @param {EulerLike} euler - The Euler-like object to copy.
 * @param {EulerLike} [target] - The target the result is stored to.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerCopy( euler, target = eulerCreate() ) {

	target._x = euler._x;
	target._y = euler._y;
	target._z = euler._z;
	target._order = euler._order;

	return target;

}

/**
 * Sets the angles of the target from a pure rotation matrix.
 *
 * @param {Matrix4Like} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
 * @param {string} [order] - A string representing the order that the rotations are applied. Defaults to the target's current order.
 * @param {EulerLike} [target] - The target the result is stored to.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerSetFromRotationMatrix( m, order, target = eulerCreate() ) {

	const te = m.elements;
	const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
	const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
	const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

	if ( order === undefined ) order = target._order;

	switch ( order ) {

		case 'XYZ':

			target._y = Math.asin( clamp( m13, - 1, 1 ) );

			if ( Math.abs( m13 ) < 0.9999999 ) {

				target._x = Math.atan2( - m23, m33 );
				target._z = Math.atan2( - m12, m11 );

			} else {

				target._x = Math.atan2( m32, m22 );
				target._z = 0;

			}

			break;

		case 'YXZ':

			target._x = Math.asin( - clamp( m23, - 1, 1 ) );

			if ( Math.abs( m23 ) < 0.9999999 ) {

				target._y = Math.atan2( m13, m33 );
				target._z = Math.atan2( m21, m22 );

			} else {

				target._y = Math.atan2( - m31, m11 );
				target._z = 0;

			}

			break;

		case 'ZXY':

			target._x = Math.asin( clamp( m32, - 1, 1 ) );

			if ( Math.abs( m32 ) < 0.9999999 ) {

				target._y = Math.atan2( - m31, m33 );
				target._z = Math.atan2( - m12, m22 );

			} else {

				target._y = 0;
				target._z = Math.atan2( m21, m11 );

			}

			break;

		case 'ZYX':

			target._y = Math.asin( - clamp( m31, - 1, 1 ) );

			if ( Math.abs( m31 ) < 0.9999999 ) {

				target._x = Math.atan2( m32, m33 );
				target._z = Math.atan2( m21, m11 );

			} else {

				target._x = 0;
				target._z = Math.atan2( - m12, m22 );

			}

			break;

		case 'YZX':

			target._z = Math.asin( clamp( m21, - 1, 1 ) );

			if ( Math.abs( m21 ) < 0.9999999 ) {

				target._x = Math.atan2( - m23, m22 );
				target._y = Math.atan2( - m31, m11 );

			} else {

				target._x = 0;
				target._y = Math.atan2( m13, m33 );

			}

			break;

		case 'XZY':

			target._z = Math.asin( - clamp( m12, - 1, 1 ) );

			if ( Math.abs( m12 ) < 0.9999999 ) {

				target._x = Math.atan2( m32, m22 );
				target._y = Math.atan2( m13, m11 );

			} else {

				target._x = Math.atan2( - m23, m33 );
				target._y = 0;

			}

			break;

		default:

			warn( 'Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

	}

	target._order = order;

	return target;

}

/**
 * Sets the angles of the target from a normalized quaternion.
 *
 * @param {QuaternionLike} q - A normalized Quaternion-like object (`_x`, `_y`, `_z`, `_w`).
 * @param {string} [order] - A string representing the order that the rotations are applied. Defaults to the target's current order.
 * @param {EulerLike} [target] - The target the result is stored to.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerSetFromQuaternion( q, order, target = eulerCreate() ) {

	mat4MakeRotationFromQuaternion( q, _matrix );

	return eulerSetFromRotationMatrix( _matrix, order, target );

}

/**
 * Sets the angles of the target from the given vector.
 *
 * @param {Vector3Like} v - The vector.
 * @param {string} [order] - A string representing the order that the rotations are applied. Defaults to the target's current order.
 * @param {EulerLike} [target] - The target the result is stored to.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerSetFromVector3( v, order, target = eulerCreate() ) {

	return eulerSet( v.x, v.y, v.z, order, target );

}

/**
 * Resets the Euler angles with a new order by converting through a
 * quaternion. Warning: This discards revolution information.
 *
 * @param {EulerLike} euler - The Euler-like object to reorder.
 * @param {string} newOrder - A string representing the new order that the rotations are applied.
 * @param {EulerLike} [target] - The target the result is stored to. May be the same object as `euler`.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerReorder( euler, newOrder, target = eulerCreate() ) {

	quatSetFromEuler( euler, _quaternion );

	return eulerSetFromQuaternion( _quaternion, newOrder, target );

}

/**
 * Returns `true` if the two Euler-like objects are equal.
 *
 * @param {EulerLike} a - The first Euler-like object.
 * @param {EulerLike} b - The second Euler-like object.
 * @return {boolean} Whether the two objects are equal.
 */
export function eulerEquals( a, b ) {

	return ( a._x === b._x ) && ( a._y === b._y ) && ( a._z === b._z ) && ( a._order === b._order );

}

/**
 * Sets the target's components to values from the given array. The first
 * three entries of the array are assigned to the x, y and z components. An
 * optional fourth entry defines the Euler order.
 *
 * @param {Array<number,number,number,?string>} array - An array holding the Euler component values.
 * @param {EulerLike} [target] - The target the result is stored to.
 * @return {EulerLike} The target, for chaining.
 */
export function eulerFromArray( array, target = eulerCreate() ) {

	target._x = array[ 0 ];
	target._y = array[ 1 ];
	target._z = array[ 2 ];
	if ( array[ 3 ] !== undefined ) target._order = array[ 3 ];

	return target;

}

/**
 * Writes the components of the given Euler-like object to the given array.
 * If no array is provided, the function returns a new array.
 *
 * @param {EulerLike} euler - The Euler-like object to write.
 * @param {Array<number,number,number,string>} [array=[]] - The target array holding the Euler components.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number,number,number,string>} The Euler components.
 */
export function eulerToArray( euler, array = [], offset = 0 ) {

	array[ offset ] = euler._x;
	array[ offset + 1 ] = euler._y;
	array[ offset + 2 ] = euler._z;
	array[ offset + 3 ] = euler._order;

	return array;

}

const _matrix = /*@__PURE__*/ mat4Create();
const _quaternion = /*@__PURE__*/ quatCreate();
