import { Quaternion } from './Quaternion.js';
import { Matrix4 } from './Matrix4.js';
import { clamp } from './MathUtils.js';

const _matrix = /*@__PURE__*/ new Matrix4();
const _quaternion = /*@__PURE__*/ new Quaternion();

class Euler {

	constructor( x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER ) {

		this.isEuler = true;

		this.x = x;
		this.y = y;
		this.z = z;
		this.order = order;

	}

	get _x() {

		return this.x;

	}

	set _x( value ) {

		this.x = value;

	}

	get _y() {

		return this.y;

	}

	set _y( value ) {

		this.y = value;

	}

	get _z() {

		return this.z;

	}

	set _z( value ) {

		this.z = value;

	}

	get _order() {

		return this.order;

	}

	set _order( value ) {

		this.order = value;

	}

	set( x, y, z, order = this.order ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.order = order;

		return this;

	}

	clone() {

		return new this.constructor( this.x, this.y, this.z, this.order );

	}

	copy( euler ) {

		this.x = euler.x;
		this.y = euler.y;
		this.z = euler.z;
		this.order = euler.order;

		return this;

	}

	setFromRotationMatrix( m, order = this.order ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		switch ( order ) {

			case 'XYZ':

				this.y = Math.asin( clamp( m13, - 1, 1 ) );

				if ( Math.abs( m13 ) < 0.9999999 ) {

					this.x = Math.atan2( - m23, m33 );
					this.z = Math.atan2( - m12, m11 );

				} else {

					this.x = Math.atan2( m32, m22 );
					this.z = 0;

				}

				break;

			case 'YXZ':

				this.x = Math.asin( - clamp( m23, - 1, 1 ) );

				if ( Math.abs( m23 ) < 0.9999999 ) {

					this.y = Math.atan2( m13, m33 );
					this.z = Math.atan2( m21, m22 );

				} else {

					this.y = Math.atan2( - m31, m11 );
					this.z = 0;

				}

				break;

			case 'ZXY':

				this.x = Math.asin( clamp( m32, - 1, 1 ) );

				if ( Math.abs( m32 ) < 0.9999999 ) {

					this.y = Math.atan2( - m31, m33 );
					this.z = Math.atan2( - m12, m22 );

				} else {

					this.y = 0;
					this.z = Math.atan2( m21, m11 );

				}

				break;

			case 'ZYX':

				this.y = Math.asin( - clamp( m31, - 1, 1 ) );

				if ( Math.abs( m31 ) < 0.9999999 ) {

					this.x = Math.atan2( m32, m33 );
					this.z = Math.atan2( m21, m11 );

				} else {

					this.x = 0;
					this.z = Math.atan2( - m12, m22 );

				}

				break;

			case 'YZX':

				this.z = Math.asin( clamp( m21, - 1, 1 ) );

				if ( Math.abs( m21 ) < 0.9999999 ) {

					this.x = Math.atan2( - m23, m22 );
					this.y = Math.atan2( - m31, m11 );

				} else {

					this.x = 0;
					this.y = Math.atan2( m13, m33 );

				}

				break;

			case 'XZY':

				this.z = Math.asin( - clamp( m12, - 1, 1 ) );

				if ( Math.abs( m12 ) < 0.9999999 ) {

					this.x = Math.atan2( m32, m22 );
					this.y = Math.atan2( m13, m11 );

				} else {

					this.x = Math.atan2( - m23, m33 );
					this.y = 0;

				}

				break;

			default:

				console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

		}

		this.order = order;

		return this;

	}

	setFromQuaternion( q, order ) {

		_matrix.makeRotationFromQuaternion( q );

		return this.setFromRotationMatrix( _matrix, order );

	}

	setFromVector3( v, order = this.order ) {

		return this.set( v.x, v.y, v.z, order );

	}

	reorder( newOrder ) {

		// WARNING: this discards revolution information -bhouston

		_quaternion.setFromEuler( this );

		return this.setFromQuaternion( _quaternion, newOrder );

	}

	equals( euler ) {

		return ( euler.x === this.x ) && ( euler.y === this.y ) && ( euler.z === this.z ) && ( euler.order === this.order );

	}

	fromArray( array ) {

		this.x = array[ 0 ];
		this.y = array[ 1 ];
		this.z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this.order = array[ 3 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		array[ offset + 3 ] = this.order;

		return array;

	}

	toJSON() {

		return {
			isEuler: true,
			_x: this.x,
			_y: this.y,
			_z: this.z,
			_order: this.order
		};

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;
		yield this.order;

	}

}

Euler.DEFAULT_ORDER = 'XYZ';

export { Euler };
