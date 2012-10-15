/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};


THREE.Vector3.prototype = {

	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},

	setZ: function ( z ) {

		this.z = z;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	sub: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	multiply: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	multiplySelf: function ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	},

	divideSelf: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divideScalar: function ( s ) {

		if ( s ) {

			this.x /= s;
			this.y /= s;
			this.z /= s;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;

		}

		return this;

	},


	negate: function() {

		return this.multiplyScalar( - 1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	length: function () {

		return Math.sqrt( this.lengthSq() );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		return this.normalize().multiplyScalar( l );

	},

	lerpSelf: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	},

	cross: function ( a, b ) {

		this.x = a.y * b.z - a.z * b.y;
		this.y = a.z * b.x - a.x * b.z;
		this.z = a.x * b.y - a.y * b.x;

		return this;

	},

	crossSelf: function ( v ) {

		var x = this.x, y = this.y, z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	angleTo: function ( v ) {

		return Math.acos( this.dot( v ) / this.length() / v.length() );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		return new THREE.Vector3().sub( this, v ).lengthSq();

	},

	getPositionFromMatrix: function ( m ) {

		this.x = m.elements[12];
		this.y = m.elements[13];
		this.z = m.elements[14];

		return this;

	},

	setEulerFromRotationMatrix: function ( m, order ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		// clamp, to handle numerical problems

		function clamp( x ) {

			return Math.min( Math.max( x, -1 ), 1 );

		}

		var te = m.elements;
		var m11 = te[0], m12 = te[4], m13 = te[8];
		var m21 = te[1], m22 = te[5], m23 = te[9];
		var m31 = te[2], m32 = te[6], m33 = te[10];

		if ( order === undefined || order === 'XYZ' ) {

			this.y = Math.asin( clamp( m13 ) );

			if ( Math.abs( m13 ) < 0.99999 ) {

				this.x = Math.atan2( - m23, m33 );
				this.z = Math.atan2( - m12, m11 );

			} else {

				this.x = Math.atan2( m32, m22 );
				this.z = 0;

			}

		} else if ( order === 'YXZ' ) {

			this.x = Math.asin( - clamp( m23 ) );

			if ( Math.abs( m23 ) < 0.99999 ) {

				this.y = Math.atan2( m13, m33 );
				this.z = Math.atan2( m21, m22 );

			} else {

				this.y = Math.atan2( - m31, m11 );
				this.z = 0;

			}

		} else if ( order === 'ZXY' ) {

			this.x = Math.asin( clamp( m32 ) );

			if ( Math.abs( m32 ) < 0.99999 ) {

				this.y = Math.atan2( - m31, m33 );
				this.z = Math.atan2( - m12, m22 );

			} else {

				this.y = 0;
				this.z = Math.atan2( m21, m11 );

			}

		} else if ( order === 'ZYX' ) {

			this.y = Math.asin( - clamp( m31 ) );

			if ( Math.abs( m31 ) < 0.99999 ) {

				this.x = Math.atan2( m32, m33 );
				this.z = Math.atan2( m21, m11 );

			} else {

				this.x = 0;
				this.z = Math.atan2( - m12, m22 );

			}

		} else if ( order === 'YZX' ) {

			this.z = Math.asin( clamp( m21 ) );

			if ( Math.abs( m21 ) < 0.99999 ) {

				this.x = Math.atan2( - m23, m22 );
				this.y = Math.atan2( - m31, m11 );

			} else {

				this.x = 0;
				this.y = Math.atan2( m13, m33 );

			}

		} else if ( order === 'XZY' ) {

			this.z = Math.asin( - clamp( m12 ) );

			if ( Math.abs( m12 ) < 0.99999 ) {

				this.x = Math.atan2( m32, m22 );
				this.y = Math.atan2( m13, m11 );

			} else {

				this.x = Math.atan2( - m23, m33 );
				this.y = 0;

			}

		}

		return this;

	},

	setEulerFromQuaternion: function ( q, order ) {

		// q is assumed to be normalized

		// clamp, to handle numerical problems

		function clamp( x ) {

			return Math.min( Math.max( x, -1 ), 1 );

		}

		// http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m

		var sqx = q.x * q.x;
		var sqy = q.y * q.y;
		var sqz = q.z * q.z;
		var sqw = q.w * q.w;

		if ( order === undefined || order === 'XYZ' ) {

			this.x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
			this.y = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ) ) );
			this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );

		} else if ( order ===  'YXZ' ) {

			this.x = Math.asin(  clamp( 2 * ( q.x * q.w - q.y * q.z ) ) );
			this.y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw - sqx - sqy + sqz ) );
			this.z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw - sqx + sqy - sqz ) );

		} else if ( order === 'ZXY' ) {

			this.x = Math.asin(  clamp( 2 * ( q.x * q.w + q.y * q.z ) ) );
			this.y = Math.atan2( 2 * ( q.y * q.w - q.z * q.x ), ( sqw - sqx - sqy + sqz ) );
			this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw - sqx + sqy - sqz ) );

		} else if ( order === 'ZYX' ) {

			this.x = Math.atan2( 2 * ( q.x * q.w + q.z * q.y ), ( sqw - sqx - sqy + sqz ) );
			this.y = Math.asin(  clamp( 2 * ( q.y * q.w - q.x * q.z ) ) );
			this.z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw + sqx - sqy - sqz ) );

		} else if ( order === 'YZX' ) {

			this.x = Math.atan2( 2 * ( q.x * q.w - q.z * q.y ), ( sqw - sqx + sqy - sqz ) );
			this.y = Math.atan2( 2 * ( q.y * q.w - q.x * q.z ), ( sqw + sqx - sqy - sqz ) );
			this.z = Math.asin(  clamp( 2 * ( q.x * q.y + q.z * q.w ) ) );

		} else if ( order === 'XZY' ) {

			this.x = Math.atan2( 2 * ( q.x * q.w + q.y * q.z ), ( sqw - sqx + sqy - sqz ) );
			this.y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw + sqx - sqy - sqz ) );
			this.z = Math.asin(  clamp( 2 * ( q.z * q.w - q.x * q.y ) ) );

		}

		return this;

	},

	getScaleFromMatrix: function ( m ) {

		var sx = this.set( m.elements[0], m.elements[1], m.elements[2] ).length();
		var sy = this.set( m.elements[4], m.elements[5], m.elements[6] ).length();
		var sz = this.set( m.elements[8], m.elements[9], m.elements[10] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;
	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	isZero: function ( v ) {

		return this.lengthSq() < ( v !== undefined ? v : 0.0001 );

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};
