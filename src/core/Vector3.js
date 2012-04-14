/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
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

	getRotationFromMatrix: function ( m, scale ) {

		var sx = scale ? scale.x : 1;
		var sy = scale ? scale.y : 1;
		var sz = scale ? scale.z : 1;

		var m11 = m.elements[0] / sx, m12 = m.elements[4] / sy, m13 = m.elements[8] / sz;
		var m21 = m.elements[1] / sx, m22 = m.elements[5] / sy, m23 = m.elements[9] / sz;
		var m33 = m.elements[10] / sz;

		this.y = Math.asin( m13 );

		var cosY = Math.cos( this.y );

		if ( Math.abs( cosY ) > 0.00001 ) {

			this.x = Math.atan2( - m23 / cosY, m33 / cosY );
			this.z = Math.atan2( - m12 / cosY, m11 / cosY );

		} else {

			this.x = 0;
			this.z = Math.atan2( m21, m22 );

		}

		return this;

	},

	/*

	// from http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
	// order XYZ

	getEulerXYZFromQuaternion: function ( q ) {

		this.x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z ) );
		this.y = Math.asin( 2 *  ( q.x * q.z + q.y * q.w ) );
		this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( q.w * q.w + q.x * q.x - q.y * q.y - q.z * q.z ) );

	},

	// from http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/index.htm
	// order YZX (assuming heading == y, attitude == z, bank == x)

	getEulerYZXFromQuaternion: function ( q ) {

		var sqw = q.w * q.w;
		var sqx = q.x * q.x;
		var sqy = q.y * q.y;
		var sqz = q.z * q.z;
		var unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
		var test = q.x * q.y + q.z * q.w;

		if ( test > 0.499 * unit ) { // singularity at north pole

			this.y = 2 * Math.atan2( q.x, q.w );
			this.z = Math.PI / 2;
			this.x = 0;

			return;

		}

		if ( test < -0.499 * unit ) { // singularity at south pole

			this.y = -2 * Math.atan2( q.x, q.w );
			this.z = -Math.PI / 2;
			this.x = 0;

			return;

		}

		this.y = Math.atan2( 2 * q.y * q.w - 2 * q.x * q.z, sqx - sqy - sqz + sqw );
		this.z = Math.asin( 2 * test / unit );
		this.x = Math.atan2( 2 * q.x * q.w - 2 * q.y * q.z, -sqx + sqy - sqz + sqw );

	},

	*/

	getScaleFromMatrix: function ( m ) {

		var sx = this.set( m.elements[0], m.elements[1], m.elements[2] ).length();
		var sy = this.set( m.elements[4], m.elements[5], m.elements[6] ).length();
		var sz = this.set( m.elements[8], m.elements[9], m.elements[10] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	isZero: function () {

		return ( this.lengthSq() < 0.0001 /* almostZero */ );

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};

