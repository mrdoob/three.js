/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Vector3 = function ( x, y, z ) {

	this.set(

		x || 0,
		y || 0,
		z || 0

	);

};


THREE.Vector3.prototype = {

	set : function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	copy : function ( v ) {

		this.set(

			v.x,
			v.y,
			v.z

		);

		return this;

	},


	add : function ( a, b ) {

		this.set(

			a.x + b.x,
			a.y + b.y,
			a.z + b.z

		);

		return this;

	},


	addSelf : function ( v ) {

		this.set(

			this.x + v.x,
			this.y + v.y,
			this.z + v.z

		);

		return this;

	},


	addScalar : function ( s ) {

		this.set(

			this.x + s,
			this.y + s,
			this.z + s

		);

		return this;

	},


	sub : function ( a, b ) {

		this.set(

			a.x - b.x,
			a.y - b.y,
			a.z - b.z

		);

		return this;

	},

	subSelf : function ( v ) {

		this.set(

			this.x - v.x,
			this.y - v.y,
			this.z - v.z

		);

		return this;

	},


	cross : function ( a, b ) {

		this.set(

			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x

		);

		return this;

	},

	crossSelf : function ( v ) {

		var tx = this.x, ty = this.y, tz = this.z;

		this.set(

			ty * v.z - tz * v.y,
			tz * v.x - tx * v.z,
			tx * v.y - ty * v.x

		);

		return this;

	},

	multiply : function ( a, b ) {

		this.set(

			a.x * b.x,
			a.y * b.y,
			a.z * b.z

		);

		return this;

	},

	multiplySelf : function ( v ) {

		this.set(

			this.x * v.x,
			this.y * v.y,
			this.z * v.z

		);

		return this;

	},

	multiplyScalar : function ( s ) {

		this.set(

			this.x * s,
			this.y * s,
			this.z * s

		);

		return this;

	},

	divideSelf : function ( v ) {

		this.set(

			this.x / v.x,
			this.y / v.y,
			this.z / v.z

		);

		return this;

	},

	divideScalar : function ( s ) {

		this.set(

			this.x / s,
			this.y / s,
			this.z / s

		);

		return this;

	},

	negate : function () {

		this.set(

			- this.x,
			- this.y,
			- this.z

		);

		return this;

	},

	dot : function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	distanceTo : function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared : function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;

	},

	length : function () {

		return Math.sqrt( this.lengthSq() );

	},

	lengthSq : function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	lengthManhattan : function () {

		return this.x + this.y + this.z;

	},

	normalize : function () {

		var l = this.length();

		l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0 );

		return this;

	},

	setPositionFromMatrix : function ( m ) {

		this.x = m.n14;
		this.y = m.n24;
		this.z = m.n34;

	},

	setRotationFromMatrix : function ( m ) {

		var cosY = Math.cos( this.y );

		this.y = Math.asin( m.n13 );

		if ( Math.abs( cosY ) > 0.00001 ) {

			this.x = Math.atan2( - m.n23 / cosY, m.n33 / cosY );
			this.z = Math.atan2( - m.n12 / cosY, m.n11 / cosY );

		} else {

			this.x = 0;
			this.z = Math.atan2( m.n21, m.n22 );

		}

	},

	setLength : function ( l ) {

		return this.normalize().multiplyScalar( l );

	},

	isZero : function () {

		var almostZero = 0.0001;
		return ( Math.abs( this.x ) < almostZero ) && ( Math.abs( this.y ) < almostZero ) && ( Math.abs( this.z ) < almostZero );

	},

	clone : function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};
