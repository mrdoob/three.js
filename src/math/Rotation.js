/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
  */

THREE.Rotation = function ( quaternion ) {

	this.euler = new THREE.Euler().setFromQuaternion( quaternion );
	this.quaternion = quaternion;

};

THREE.Rotation.prototype = {

	get x () {

		return this.euler.x;

	},

	set x ( value ) {

		this.euler.x = value;
		this.quaternion.setFromEuler( this.euler );

	},

	get y () {

		return this.euler.y;

	},

	set y ( value ) {

		this.euler.y = value;
		this.quaternion.setFromEuler( this.euler );

	},

	get z () {

		return this.euler.z;

	},

	set z ( value ) {

		this.euler.z = value;
		this.quaternion.setFromEuler( this.euler );

	},

	//

	set: function ( x, y, z ) {

		this.euler.x = x;
		this.euler.y = y;
		this.euler.z = z;

		this.quaternion.setFromEuler( this.euler );

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

	setFromRotationMatrix: function ( m, order ) {

		this.euler.setFromRotationMatrix( m, order );
		this.quaternion.setFromEuler( this.euler );

		return this;

	},

	setFromQuaternion: function ( q, order ) {

		this.euler.setFromQuaternion( q, order );
		this.quaternion.copy( q );

		return this;

	},

	copy: function ( rotation ) {

		this.euler.copy( rotation.euler );
		this.quaternion.setFromEuler( this.euler );

		return this;

	},

	fromArray: function ( array ) {

		this.euler.fromArray( array );
		this.quaternion.setFromEuler( this.euler );

		return this;

	},

	toArray: function () {

		return this.euler.toArray();

	}

};
