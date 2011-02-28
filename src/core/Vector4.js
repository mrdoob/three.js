/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.set(

		x || 0,
		y || 0,
		z || 0,
		w || 1

	);

};

THREE.Vector4.prototype = {

	set : function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy : function ( v ) {

		this.set(

			v.x,
			v.y,
			v.z,
			v.w || 1.0

		);

		return this;

	},

	add : function ( v1, v2 ) {

		this.set(

			v1.x + v2.x,
			v1.y + v2.y,
			v1.z + v2.z,
			v1.w + v2.w

		);

		return this;

	},

	addSelf : function ( v ) {

		this.set(

			this.x + v.x,
			this.y + v.y,
			this.z + v.z,
			this.w + v.w

		);

		return this;

	},

	sub : function ( v1, v2 ) {

		this.set(

			v1.x - v2.x,
			v1.y - v2.y,
			v1.z - v2.z,
			v1.w - v2.w

		);

		return this;

	},

	subSelf : function ( v ) {

		this.set(

			this.x - v.x,
			this.y - v.y,
			this.z - v.z,
			this.w - v.w

		);

		return this;

	},

	multiplyScalar : function ( s ) {

		this.set(

			this.x * s,
			this.y * s,
			this.z * s,
			this.w * s

		);

		return this;

	},

	divideScalar : function ( s ) {

		this.set(

			this.x / s,
			this.y / s,
			this.z / s,
			this.w / s

		);

		return this;

	},

	lerpSelf : function ( v, alpha ) {

		this.set(

			this.x + (v.x - this.x) * alpha,
			this.y + (v.y - this.y) * alpha,
			this.z + (v.z - this.z) * alpha,
			this.w + (v.w - this.w) * alpha

		);

	},

	clone : function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	}

};
