/**
 * @author kile / http://kile.stravaganza.org/
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

	this.set = function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

	};

	this.copy = function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

	};

	this.add = function( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;

	};

	this.addSelf = function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

	};

	this.addScalar = function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

	};

	this.sub = function( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;

	};

	this.subSelf = function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

	};

	this.crossSelf = function ( v ) {

		var tx = this.x, ty = this.y, tz = this.z;

		this.x = ty * v.z - tz * v.y;
		this.y = tz * v.x - tx * v.z;
		this.z = tx * v.y - ty * v.x;

	};

	this.multiplySelf = function ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
	};

	this.multiplyScalar = function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

	};

	this.dot = function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	};

	this.distanceTo = function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	};

	this.distanceToSquared = function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;

	};

	this.length = function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	};

	this.lengthSq = function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	};

	this.negate = function () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

	};

	this.normalize = function () {

		if (this.length() > 0) {

			this.multiplyScalar(1 / this.length());

		} else {

			this.multiplyScalar(0);

		}

	};

	this.clone = function () {

		return new THREE.Vector3(this.x, this.y, this.z);

	};

	this.toString = function () {

		return 'THREE.Vector3 (' + this.x + ', ' + this.y + ', ' + this.z + ')';

	};

};
