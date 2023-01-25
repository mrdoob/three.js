import { Quaternion } from './Quaternion.js';
import { Matrix4 } from './Matrix4.js';
import { clamp } from './MathUtils.js';

const _matrix = /*@__PURE__*/ new Matrix4();
const _quaternion = /*@__PURE__*/ new Quaternion();

class Euler {

	constructor( x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER ) {

		this.isEuler = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get order() {

		return this._order;

	}

	set order( value ) {

		this._order = value;
		this._onChangeCallback();

	}

	set( x, y, z, order = this._order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._order );

	}

	copy( euler ) {

		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this._onChangeCallback();

		return this;

	}

	setFromRotationMatrix( m, order = this._order, update = true ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		switch ( order ) {

			case 'XYZ':

				this._y = Math.asin( clamp( m13, - 1, 1 ) );

				if ( Math.abs( m13 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m33 );
					this._z = Math.atan2( - m12, m11 );

				} else {

					this._x = Math.atan2( m32, m22 );
					this._z = 0;

				}

				break;

			case 'YXZ':

				this._x = Math.asin( - clamp( m23, - 1, 1 ) );

				if ( Math.abs( m23 ) < 0.9999999 ) {

					this._y = Math.atan2( m13, m33 );
					this._z = Math.atan2( m21, m22 );

				} else {

					this._y = Math.atan2( - m31, m11 );
					this._z = 0;

				}

				break;

			case 'ZXY':

				this._x = Math.asin( clamp( m32, - 1, 1 ) );

				if ( Math.abs( m32 ) < 0.9999999 ) {

					this._y = Math.atan2( - m31, m33 );
					this._z = Math.atan2( - m12, m22 );

				} else {

					this._y = 0;
					this._z = Math.atan2( m21, m11 );

				}

				break;

			case 'ZYX':

				this._y = Math.asin( - clamp( m31, - 1, 1 ) );

				if ( Math.abs( m31 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m33 );
					this._z = Math.atan2( m21, m11 );

				} else {

					this._x = 0;
					this._z = Math.atan2( - m12, m22 );

				}

				break;

			case 'YZX':

				this._z = Math.asin( clamp( m21, - 1, 1 ) );

				if ( Math.abs( m21 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m22 );
					this._y = Math.atan2( - m31, m11 );

				} else {

					this._x = 0;
					this._y = Math.atan2( m13, m33 );

				}

				break;

			case 'XZY':

				this._z = Math.asin( - clamp( m12, - 1, 1 ) );

				if ( Math.abs( m12 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m22 );
					this._y = Math.atan2( m13, m11 );

				} else {

					this._x = Math.atan2( - m23, m33 );
					this._y = 0;

				}

				break;

			default:

				console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

		}

		this._order = order;

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	setFromQuaternion( q, order, update ) {

		_matrix.makeRotationFromQuaternion( q );

		return this.setFromRotationMatrix( _matrix, order, update );

	}

	// Based on: Bernardes E, Viollet S (2022) Quaternion to Euler angles conversion:
	// A direct, general and computationally efficient method. PLoS ONE 17(11): e0276302.
	setFromQuaternionDirect( q, order, update ) {

        switch ( order ) {

            case 'XYZ':

                this._y = Mathutils.acos( clamp( -2 * q.w * q.y - 2 * q.x * q.z, -1, 1 ) );
                half_sum = -Mathutils.atan2( -q.x - q.z, q.w + q.y );
                half_diff = -Mathutils.atan2( -q.x + q.z, q.w - q.y );
                break;

            case 'XZY':

                this._y = Mathutils.acos( clamp( -2 * q.w * q.z + 2 * q.x * q.y, -1, 1 ) );
                half_sum = Mathutils.atan2( q.x + q.y, q.w - q.z );
                half_diff = Mathutils.atan2( q.x - q.y, q.w + q.z );
                break;

            case 'YXZ':

                this._y = Mathutils.acos( clamp( -2 * q.w * q.x + 2 * q.y * q.z, -1, 1 ) );
                half_sum = Mathutils.atan2( q.y + q.z, q.w - q.x );
                half_diff = Mathutils.atan2( q.y - q.z, q.w + q.x );
                break;

            case 'YZX':

                this._y = Mathutils.acos( clamp( -2 * q.w * q.z - 2 * q.x * q.y, -1, 1 ) );
                half_sum = -Mathutils.atan2( -q.x - q.y, q.w + q.z );
                half_diff = -Mathutils.atan2( q.x - q.y, q.w - q.z );
                break;

            case 'ZXY':

                this._y = Mathutils.acos( clamp( -2 * q.w * q.x - 2 * q.y * q.z, -1, 1 ) );
                half_sum = -Mathutils.atan2( -q.y - q.z, q.w + q.x );
                half_diff = -Mathutils.atan2( q.y - q.z, q.w - q.x );
                break;

            case 'ZYX':

                this._y = Mathutils.acos( clamp( -2 * q.w * q.y + 2 * q.x * q.z, -1, 1 ) );
                half_sum = Mathutils.atan2( q.x + q.z, q.w - q.y );
                half_diff = Mathutils.atan2( -q.x + q.z, q.w + q.y );
                break;

            }

        if ( Math.abs( this._y) < 0.00001 ) {

            this._x = 2 * half_sum;
            this._z = 0;

        } else if ( Math.abs( this._y - Math.PI ) < 0.00001) {

            this._x = 2 * half_diff;
            this._z = 0;

        } else {

            this._x = half_sum + half_diff;
            this._z = half_sum - half_diff;

        }

        this._y -= Math.PI/2;

        if ( this._x > Math.PI ) {

            this._x -= 2 * Math.PI;

        } else if ( -this._x > Math.PI ) {

            this._x += 2 * Math.PI;

        }

        if ( this._z > Math.PI ) {

            this._z -= 2 * Math.PI;

        } else if ( -this._z > Math.PI ) {

            this._z += 2 * Math.PI;

        }

		if ( update === true ) this._onChangeCallback();

		return this;

    }

	setFromVector3( v, order = this._order ) {

		return this.set( v.x, v.y, v.z, order );

	}

	reorder( newOrder ) {

		// WARNING: this discards revolution information -bhouston

		_quaternion.setFromEuler( this );

		return this.setFromQuaternion( _quaternion, newOrder );

	}

	equals( euler ) {

		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

	}

	fromArray( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;

		return array;

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._order;

	}

	// @deprecated since r138, 02cf0df1cb4575d5842fef9c85bb5a89fe020d53

	toVector3() {

		console.error( 'THREE.Euler: .toVector3() has been removed. Use Vector3.setFromEuler() instead' );

	}

}

Euler.DEFAULT_ORDER = 'XYZ';

export { Euler };
