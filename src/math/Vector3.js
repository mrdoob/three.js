import { _Math } from './Math.js';
import { Matrix4 } from './Matrix4.js';
import { Quaternion } from './Quaternion.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

function Vector3( x, y, z ) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;

}

Object.defineProperties( Vector3.prototype, {

	x: {

		get: function () {

			return this._x;

		},

		set: function ( value ) {

			this._x = value;
			this.onChangeCallback();

		}

	},

	y: {

		get: function () {

			return this._y;

		},

		set: function ( value ) {

			this._y = value;
			this.onChangeCallback();

		}

	},

	z: {

		get: function () {

			return this._z;

		},

		set: function ( value ) {

			this._z = value;
			this.onChangeCallback();

		}

	}

} );

Object.assign( Vector3.prototype, {

	isVector3: true,

	set: function ( x, y, z ) {

		this._x = x;
		this._y = y;
		this._z = z;

		this.onChangeCallback();

		return this;

	},

	setScalar: function ( scalar ) {

		this._x = scalar;
		this._y = scalar;
		this._z = scalar;

		this.onChangeCallback();

		return this;

	},

	setX: function ( x ) {

		this._x = x;

		this.onChangeCallback();

		return this;

	},

	setY: function ( y ) {

		this._y = y;

		this.onChangeCallback();

		return this;

	},

	setZ: function ( z ) {

		this._z = z;

		this.onChangeCallback();

		return this;

	},

	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this._x = value; break;
			case 1: this._y = value; break;
			case 2: this._z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		this.onChangeCallback();

		return this;

	},

	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this._x;
			case 1: return this._y;
			case 2: return this._z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	clone: function () {

		return new this.constructor( this._x, this._y, this._z );

	},

	copy: function ( v ) {

		this._x = v.x;
		this._y = v.y;
		this._z = v.z;

		this.onChangeCallback();

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this._x += v.x;
		this._y += v.y;
		this._z += v.z;

		this.onChangeCallback();

		return this;

	},

	addScalar: function ( s ) {

		this._x += s;
		this._y += s;
		this._z += s;

		this.onChangeCallback();

		return this;

	},

	addVectors: function ( a, b ) {

		this._x = a.x + b.x;
		this._y = a.y + b.y;
		this._z = a.z + b.z;

		this.onChangeCallback();

		return this;

	},

	addScaledVector: function ( v, s ) {

		this._x += v.x * s;
		this._y += v.y * s;
		this._z += v.z * s;

		this.onChangeCallback();

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this._x -= v.x;
		this._y -= v.y;
		this._z -= v.z;

		this.onChangeCallback();

		return this;

	},

	subScalar: function ( s ) {

		this._x -= s;
		this._y -= s;
		this._z -= s;

		this.onChangeCallback();

		return this;

	},

	subVectors: function ( a, b ) {

		this._x = a.x - b.x;
		this._y = a.y - b.y;
		this._z = a.z - b.z;

		this.onChangeCallback();

		return this;

	},

	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this._x *= v.x;
		this._y *= v.y;
		this._z *= v.z;

		this.onChangeCallback();

		return this;

	},

	multiplyScalar: function ( scalar ) {

		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;

		this.onChangeCallback();

		return this;

	},

	multiplyVectors: function ( a, b ) {

		this._x = a.x * b.x;
		this._y = a.y * b.y;
		this._z = a.z * b.z;

		this.onChangeCallback();

		return this;

	},

	applyEuler: function () {

		var quaternion = new Quaternion();

		return function applyEuler( euler ) {

			if ( ! ( euler && euler.isEuler ) ) {

				console.error( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );

			}

			return this.applyQuaternion( quaternion.setFromEuler( euler ) );

		};

	}(),

	applyAxisAngle: function () {

		var quaternion = new Quaternion();

		return function applyAxisAngle( axis, angle ) {

			return this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );

		};

	}(),

	applyMatrix3: function ( m ) {

		var x = this._x, y = this._y, z = this._z;
		var e = m.elements;

		this._x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this._y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this._z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		this.onChangeCallback();

		return this;

	},

	applyMatrix4: function ( m ) {

		var x = this._x, y = this._y, z = this._z;
		var e = m.elements;

		var w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this._x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this._y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this._z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		this.onChangeCallback();

		return this;

	},

	applyQuaternion: function ( q ) {

		var x = this._x, y = this._y, z = this._z;
		var qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this._x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this._y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this._z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		this.onChangeCallback();

		return this;

	},

	project: function () {

		var matrix = new Matrix4();

		return function project( camera ) {

			matrix.multiplyMatrices( camera.projectionMatrix, matrix.getInverse( camera.matrixWorld ) );
			return this.applyMatrix4( matrix );

		};

	}(),

	unproject: function () {

		var matrix = new Matrix4();

		return function unproject( camera ) {

			matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );
			return this.applyMatrix4( matrix );

		};

	}(),

	transformDirection: function ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this._x, y = this._y, z = this._z;
		var e = m.elements;

		this._x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this._y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this._z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	},

	divide: function ( v ) {

		this._x /= v.x;
		this._y /= v.y;
		this._z /= v.z;

		this.onChangeCallback();

		return this;

	},

	divideScalar: function ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	},

	min: function ( v ) {

		this._x = Math.min( this._x, v.x );
		this._y = Math.min( this._y, v.y );
		this._z = Math.min( this._z, v.z );

		this.onChangeCallback();

		return this;

	},

	max: function ( v ) {

		this._x = Math.max( this._x, v.x );
		this._y = Math.max( this._y, v.y );
		this._z = Math.max( this._z, v.z );

		this.onChangeCallback();

		return this;

	},

	clamp: function ( min, max ) {

		// assumes min < max, componentwise

		this._x = Math.max( min.x, Math.min( max.x, this._x ) );
		this._y = Math.max( min.y, Math.min( max.y, this._y ) );
		this._z = Math.max( min.z, Math.min( max.z, this._z ) );

		this.onChangeCallback();

		return this;

	},

	clampScalar: function () {

		var min = new Vector3();
		var max = new Vector3();

		return function clampScalar( minVal, maxVal ) {

			min.set( minVal, minVal, minVal );
			max.set( maxVal, maxVal, maxVal );

			return this.clamp( min, max );

		};

	}(),

	clampLength: function ( min, max ) {

		var length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	},

	floor: function () {

		this._x = Math.floor( this._x );
		this._y = Math.floor( this._y );
		this._z = Math.floor( this._z );

		this.onChangeCallback();

		return this;

	},

	ceil: function () {

		this._x = Math.ceil( this._x );
		this._y = Math.ceil( this._y );
		this._z = Math.ceil( this._z );

		this.onChangeCallback();

		return this;

	},

	round: function () {

		this._x = Math.round( this._x );
		this._y = Math.round( this._y );
		this._z = Math.round( this._z );

		this.onChangeCallback();

		return this;

	},

	roundToZero: function () {

		this._x = ( this._x < 0 ) ? Math.ceil( this._x ) : Math.floor( this._x );
		this._y = ( this._y < 0 ) ? Math.ceil( this._y ) : Math.floor( this._y );
		this._z = ( this._z < 0 ) ? Math.ceil( this._z ) : Math.floor( this._z );

		this.onChangeCallback();

		return this;

	},

	negate: function () {

		this._x = - this._x;
		this._y = - this._y;
		this._z = - this._z;

		this.onChangeCallback();

		return this;

	},

	dot: function ( v ) {

		return this._x * v.x + this._y * v.y + this._z * v.z;

	},

	// TODO lengthSquared?

	lengthSq: function () {

		return this._x * this._x + this._y * this._y + this._z * this._z;

	},

	length: function () {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z );

	},

	manhattanLength: function () {

		return Math.abs( this._x ) + Math.abs( this._y ) + Math.abs( this._z );

	},

	normalize: function () {

		return this.divideScalar( this.length() || 1 );

	},

	setLength: function ( length ) {

		return this.normalize().multiplyScalar( length );

	},

	lerp: function ( v, alpha ) {

		this._x += ( v.x - this._x ) * alpha;
		this._y += ( v.y - this._y ) * alpha;
		this._z += ( v.z - this._z ) * alpha;

		this.onChangeCallback();

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

	},

	cross: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		return this.crossVectors( this, v );

	},

	crossVectors: function ( a, b ) {

		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;

		this._x = ay * bz - az * by;
		this._y = az * bx - ax * bz;
		this._z = ax * by - ay * bx;

		this.onChangeCallback();

		return this;

	},

	projectOnVector: function ( vector ) {

		var scalar = vector.dot( this ) / vector.lengthSq();

		return this.copy( vector ).multiplyScalar( scalar );

	},

	projectOnPlane: function () {

		var v1 = new Vector3();

		return function projectOnPlane( planeNormal ) {

			v1.copy( this ).projectOnVector( planeNormal );

			return this.sub( v1 );

		};

	}(),

	reflect: function () {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1 = new Vector3();

		return function reflect( normal ) {

			return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		};

	}(),

	angleTo: function ( v ) {

		var theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );

		// clamp, to handle numerical problems

		return Math.acos( _Math.clamp( theta, - 1, 1 ) );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this._x - v.x, dy = this._y - v.y, dz = this._z - v.z;

		return dx * dx + dy * dy + dz * dz;

	},

	manhattanDistanceTo: function ( v ) {

		return Math.abs( this._x - v.x ) + Math.abs( this._y - v.y ) + Math.abs( this._z - v.z );

	},

	setFromSpherical: function ( s ) {

		var sinPhiRadius = Math.sin( s.phi ) * s.radius;

		this._x = sinPhiRadius * Math.sin( s.theta );
		this._y = Math.cos( s.phi ) * s.radius;
		this._z = sinPhiRadius * Math.cos( s.theta );

		this.onChangeCallback();

		return this;

	},

	setFromCylindrical: function ( c ) {

		this._x = c.radius * Math.sin( c.theta );
		this._y = c.y;
		this._z = c.radius * Math.cos( c.theta );

		this.onChangeCallback();

		return this;

	},

	setFromMatrixPosition: function ( m ) {

		var e = m.elements;

		this._x = e[ 12 ];
		this._y = e[ 13 ];
		this._z = e[ 14 ];

		this.onChangeCallback();

		return this;

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.setFromMatrixColumn( m, 0 ).length();
		var sy = this.setFromMatrixColumn( m, 1 ).length();
		var sz = this.setFromMatrixColumn( m, 2 ).length();

		this._x = sx;
		this._y = sy;
		this._z = sz;

		this.onChangeCallback();

		return this;

	},

	setFromMatrixColumn: function ( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	},

	equals: function ( v ) {

		return ( ( v.x === this._x ) && ( v.y === this._y ) && ( v.z === this._z ) );

	},

	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];

		this.onChangeCallback();

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;

		return array;

	},

	fromBufferAttribute: function ( attribute, index, offset ) {

		if ( offset !== undefined ) {

			console.warn( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );

		}

		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );

		this.onChangeCallback();

		return this;

	},

	onChange: function ( callback ) {

		this.onChangeCallback = callback;

		return this;

	},

	onChangeCallback: function () {}

} );


export { Vector3 };
