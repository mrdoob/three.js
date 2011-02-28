/**
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 */

THREE.Vector2 = function ( x, y ) {

	this.set(

		x || 0,
		y || 0

	);

};

THREE.Vector2.prototype = {

	set : function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	copy : function ( v ) {

		this.set(

			v.x,
			v.y

		);

		return this;

	},

	addSelf : function ( v ) {

		this.set(

			this.x + v.x,
			this.y + v.y

		);

		return this;

	},

	add : function ( v1, v2 ) {

		this.set(

			v1.x + v2.x,
			v1.y + v2.y

		);

		return this;

	},

	subSelf : function ( v ) {

		this.set(

			this.x - v.x,
			this.y - v.y

		);

		return this;

	},

	sub : function ( v1, v2 ) {

		this.set(

			v1.x - v2.x,
			v1.y - v2.y

		);

		return this;

	},

	multiplyScalar : function ( s ) {

		this.set(

			this.x * s,
			this.y * s

		);

		return this;

	},

	negate : function() {

		this.set(

			- this.x,
			- this.y

		);

		return this;

	},

	unit : function () {

		this.multiplyScalar( 1 / this.length() );

		return this;

	},

	length : function () {

		return Math.sqrt( this.lengthSq() );

	},

	lengthSq : function () {

		return this.x * this.x + this.y * this.y;

	},

	clone : function () {

		return new THREE.Vector2( this.x, this.y );

	}

};
