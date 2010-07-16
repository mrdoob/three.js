/**
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 */

THREE.Vector2 = function ( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

};

THREE.Vector2.prototype = {

	set: function ( x, y ) {

		this.x = x;
		this.y = y;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;

	},

	add: function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;

	},

	sub: function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;

	},

	unit: function () {

		this.multiplyScalar( 1 / this.length() );

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y;

	},

	negate: function() {

		this.x = - this.x;
		this.y = - this.y;

	},

	clone: function () {

		return new THREE.Vector2( this.x, this.y );

	},

	toString: function () {

		return 'THREE.Vector2 (' + this.x + ', ' + this.y + ')';

	}

};
