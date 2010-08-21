/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};

THREE.Vector3.prototype = {

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

	},

	add: function( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

	},

	sub: function( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

	},

	cross: function ( v1, v2 ) {

		this.x = v1.y * v2.z - v1.z * v2.y;
		this.y = v1.z * v2.x - v1.x * v2.z;
		this.z = v1.x * v2.y - v1.y * v2.x;

	},

	crossSelf: function ( v ) {

		var tx = this.x, ty = this.y, tz = this.z;

		this.x = ty * v.z - tz * v.y;
		this.y = tz * v.x - tx * v.z;
		this.z = tx * v.y - ty * v.x;

	},

	multiplySelf: function ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

	},

	divideScalar: function ( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	negate: function () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

	},

	normalize: function () {

		if ( this.length() > 0 ) {

			this.multiplyScalar( 1 / this.length() );

		} else {

			this.multiplyScalar( 0 );

		}

	},

	isZero: function () {

		var almostZero = 0.0001;
		return ( Math.abs( this.x ) < almostZero ) && ( Math.abs( this.y ) < almostZero ) && ( Math.abs( this.z ) < almostZero );

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	},

	toString: function () {

		return 'THREE.Vector3 ( ' + this.x + ', ' + this.y + ', ' + this.z + ' )';

	}

};
