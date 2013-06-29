/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
  */

THREE.Rotation = function ( quaternion ) {

	this.euler = new THREE.Euler();
	this.quaternion = quaternion;

	this.updateEuler();

};

THREE.Rotation.prototype = {

	get x () {

		return this.euler.x;

	},

	set x ( value ) {

		this.euler.x = value;
		this.updateQuaternion();

	},

	get y () {

		return this.euler.y;

	},

	set y ( value ) {

		this.euler.y = value;
		this.updateQuaternion();

	},

	get z () {

		return this.euler.z;

	},

	set z ( value ) {

		this.euler.z = value;
		this.updateQuaternion();

	},

	//

	set: function ( x, y, z ) {

		this.euler.x = x;
		this.euler.y = y;
		this.euler.z = z;

		this.updateQuaternion();

		return this;

	},

	setX: function ( x ) {

		this.euler.x = x;
		this.updateQuaternion();

		return this;

	},

	setY: function ( y ) {

		this.euler.y = y;
		this.updateQuaternion();

		return this;

	},

	setZ: function ( z ) {

		this.euler.z = z;
		this.updateQuaternion();

		return this;

	},

	setEulerFromRotationMatrix: function ( matrix, order ) {

		console.warn( 'DEPRECATED: Rotation\'s .setEulerFromRotationMatrix() has been renamed to .setFromRotationMatrix().' );
		return this.setFromRotationMatrix( matrix, order );

	},

	setFromRotationMatrix: function ( matrix, order ) {

		this.euler.setFromRotationMatrix( matrix, order );
		this.updateQuaternion();

		return this;

	},

	setFromQuaternion: function ( quaternion, order ) {

		this.euler.setFromQuaternion( quaternion, order );
		this.quaternion.copy( quaternion );

		return this;

	},

	copy: function ( rotation ) {

		this.euler.copy( rotation.euler );
		this.quaternion.copy( rotation.quaternion );

		return this;

	},

	fromArray: function ( array ) {

		this.euler.fromArray( array );
		this.updateQuaternion();

		return this;

	},

	toArray: function () {

		return this.euler.toArray();

	},

	updateEuler: function () {

		this.euler.setFromQuaternion( this.quaternion );

		return this;

	},

	updateQuaternion: function () {

		this.quaternion.setFromEuler( this.euler );

		return this;

	}

};
