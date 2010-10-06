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

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	},

	add: function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	},

	sub: function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;

		return this;

	},

	unit: function () {

		this.multiplyScalar( 1 / this.length() );

		return this;

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

		return this;

	},

	clone: function () {

		return new THREE.Vector2( this.x, this.y );

	},

	toString: function () {

		return 'THREE.Vector2 (' + this.x + ', ' + this.y + ')';

	}

};
