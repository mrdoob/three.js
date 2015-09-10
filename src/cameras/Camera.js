/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
 */

module.exports = Camera;

var Object3D = require( "../core/Object3D" ),
  Matrix4 = require( "../math/Matrix4" ),
  Quaternion = require( "../math/Quaternion" ),
  Vector3 = require( "../math/Vector3" );

function Camera() {

	Object3D.call( this );

	this.type = "Camera";

	this.matrixWorldInverse = new Matrix4();
	this.projectionMatrix = new Matrix4();

}

Camera.prototype = Object.create( Object3D.prototype );
Camera.prototype.constructor = Camera;

Camera.prototype.getWorldDirection = ( function () {

	var quaternion;

	return function ( optionalTarget ) {

		if ( quaternion === undefined ) { quaternion = new Quaternion(); }

		var result = optionalTarget || new Vector3();

		this.getWorldQuaternion( quaternion );

		return result.set( 0, 0, - 1 ).applyQuaternion( quaternion );

	};

}() );

Camera.prototype.lookAt = ( function () {

	// This routine does not support cameras with rotated and/or translated parent(s)

	var m1;

	return function ( vector ) {

		if ( m1 === undefined ) { m1 = new Matrix4(); }

		m1.lookAt( this.position, vector, this.up );

		this.quaternion.setFromRotationMatrix( m1 );

	};

}() );

Camera.prototype.clone = function () {

	return new this.constructor().copy( this );

};

Camera.prototype.copy = function ( source ) {

	Object3D.prototype.copy.call( this, source );

	this.matrixWorldInverse.copy( source.matrixWorldInverse );
	this.projectionMatrix.copy( source.projectionMatrix );

	return this;

};
