/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = w || 1;

	this.set = function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

	};

	this.copy = function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w;

	};

	this.add = function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;
		this.w = v1.w + v2.w;

	};

	this.addSelf = function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

	};

	this.sub = function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;
		this.w = v1.w - v2.w;

	};

	this.subSelf = function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

	};

	this.clone = function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	};

	this.toVector3 = function () {

		return new THREE.Vector3( this.x / this.w, this.y / this.w, this.z / this.w );

	};

	this.toString = function () {

		return 'THREE.Vector4 (' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';

	};

};
