/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Vector3 = function ( _x, _y, _z ) {

	this.x = _x || 0;
	this.y = _y || 0;
	this.z = _z || 0;

	this.api = {
	
		isDirty:	false,
		that: 		this,

		get x() { return this.that.x; },
		get y() { return this.that.y; },
		get z() { return this.that.z; },
		
		set x( value ) { this.that.x = value; this.isDirty = true; },
		set y( value ) { this.that.y = value; this.isDirty = true; },
		set z( value ) { this.that.z = value; this.isDirty = true; },
	};

	this.api.__proto__ = THREE.Vector3.prototype;
	
	return this.api;

};


THREE.Vector3.prototype = {

	set: function ( x, y, z ) {

		var vec = this.that; 
		vec.x = x;
		vec.y = y;
		vec.z = z;

		this.isDirty = true;
		return this;

	},

	copy: function ( v ) {

		var vec = this.that; 
		vec.x = v.x;
		vec.y = v.y;
		vec.z = v.z;

		this.isDirty = true;
		return this;

	},


	add: function ( a, b ) {

		var vec = this.that; 
		vec.x = a.x + b.x;
		vec.y = a.y + b.y;
		vec.z = a.z + b.z;

		this.isDirty = true;
		return this;

	},


	addSelf: function ( v ) {

		var vec = this.that; 
		vec.x += v.x;
		vec.y += v.y;
		vec.z += v.z;

		this.isDirty = true;
		return this;

	},


	addScalar: function ( s ) {

		var vec = this.that; 
		vec.x += s;
		vec.y += s;
		vec.z += s;

		this.isDirty = true;
		return this;

	},


	sub: function( a, b ) {

		var vec = this.that; 
		vec.x = a.x - b.x;
		vec.y = a.y - b.y;
		vec.z = a.z - b.z;

		this.isDirty = true;
		return this;

	},
	

	subSelf: function ( v ) {

		var vec = this.that; 
		vec.x -= v.x;
		vec.y -= v.y;
		vec.z -= v.z;

		this.isDirty = true;
		return this;

	},


	cross: function ( a, b ) {

		var vec = this.that; 
		vec.x = a.y * b.z - a.z * b.y;
		vec.y = a.z * b.x - a.x * b.z;
		vec.z = a.x * b.y - a.y * b.x;

		this.isDirty = true;
		return this;

	},

	crossSelf: function ( v ) {

		var vec = this.that; 
		var tx  = vec.x, ty = vec.y, tz = vec.z;

		vec.x = ty * v.z - tz * v.y;
		vec.y = tz * v.x - tx * v.z;
		vec.z = tx * v.y - ty * v.x;

		this.isDirty = true;
		return this;

	},

	multiply: function ( a, b ) {

		var vec = this.that; 
		vec.x = a.x * b.x;
		vec.y = a.y * b.y;
		vec.z = a.z * b.z;

		this.isDirty = true;
		return this;

	},

	multiplySelf: function ( v ) {

		var vec = this.that; 
		vec.x *= v.x;
		vec.y *= v.y;
		vec.z *= v.z;

		this.isDirty = true;
		return this;

	},

	multiplyScalar: function ( s ) {

		var vec = this.that; 
		vec.x *= s;
		vec.y *= s;
		vec.z *= s;

		this.isDirty = true;
		return this;

	},

	divideSelf: function ( v ) {

		var vec = this.that; 
		vec.x /= v.x;
		vec.y /= v.y;
		vec.z /= v.z;

		this.isDirty = true;
		return this;

	},

	divideScalar: function ( s ) {

		var vec = this.that; 
		vec.x /= s;
		vec.y /= s;
		vec.z /= s;

		this.isDirty = true;
		return this;
	},

	dot: function ( v ) {

		var vec = this.that; 
		return vec.x * v.x + vec.y * v.y + vec.z * v.z;

	},

	distanceTo: function ( v ) {

		var vec = this.that; 
		var dx = vec.x - v.x, dy = vec.y - v.y, dz = vec.z - v.z;
		return Math.sqrt( dx * dx + dy * dy + dz * dz );

	},

	distanceToSquared: function ( v ) {

		var vec = this.that; 
		var dx = vec.x - v.x, dy = vec.y - v.y, dz = vec.z - v.z;
		return dx * dx + dy * dy + dz * dz;

	},

	length: function () {

		var vec = this.that; 
		return Math.sqrt( vec.x * vec.x + vec.y * vec.y + vec.z * vec.z );

	},

	lengthSq: function () {

		var vec = this.that; 
		return vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;

	},

	lengthManhattan: function () {

		var vec = this.that; 
		return vec.x + vec.y + vec.z;

	},


	negate: function () {

		var vec = this.that; 
		vec.x = - this.x;
		vec.y = - this.y;
		vec.z = - this.z;

		this.isDirty = true;
		return this;

	},

	normalize: function () {

		var vec = this.that; 
		var length = Math.sqrt( vec.x * vec.x + vec.y * vec.y + vec.z * vec.z );

		length > 0 ? this.multiplyScalar( 1 / length ) : this.set( 0, 0, 0 );

		this.isDirty = true;
		return this;

	},

	setLength: function( len ) {

		return this.normalize().multiplyScalar( len );

	},

	isZero: function () {

		var almostZero = 0.0001;
		var vec        = this.that; 
		
		return ( Math.abs( vec.x ) < almostZero ) && ( Math.abs( vec.y ) < almostZero ) && ( Math.abs( vec.z ) < almostZero );

	},

	clone: function () {

		var vec = this.that; 
		return new THREE.Vector3( vec.x, vec.y, vec.z );

	},

	toString: function () {

		return 'THREE.Vector3 ( ' + this.x + ', ' + this.y + ', ' + this.z + ' )';

	}

};
