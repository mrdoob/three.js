/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.Camera = function () {

	THREE.Object3D.call( this );

	this.type = 'Camera';

	this.matrixWorldInverse = new THREE.Matrix4();
	this.projectionMatrix = new THREE.Matrix4();

};

THREE.Camera.prototype = Object.create( THREE.Object3D.prototype );
THREE.Camera.prototype.constructor = THREE.Camera;

THREE.Camera.prototype.getWorldDirection = function () {

	var quaternion = new THREE.Quaternion();

	return function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		this.getWorldQuaternion( quaternion );

		return result.set( 0, 0, - 1 ).applyQuaternion( quaternion );

	};

}();

THREE.Camera.prototype.lookAt = function () {

	var m1 = new THREE.Matrix4();
	var v1 = new THREE.Vector3();

	return function ( vector ) {

		if ( this.parent && ( this.parent.parent || this.parent.type !== 'Scene' ) ) {

			this.parent.worldToLocal( v1.copy( vector ) );

			m1.lookAt( this.position, v1, this.up );

		} else {

			m1.lookAt( this.position, vector, this.up );

		}

		this.quaternion.setFromRotationMatrix( m1 );

	};

}();

THREE.Camera.prototype.clone = function () {

	return new this.constructor().copy( this );

};

THREE.Camera.prototype.copy = function ( source ) {

	THREE.Object3D.prototype.copy.call( this, source );

	this.matrixWorldInverse.copy( source.matrixWorldInverse );
	this.projectionMatrix.copy( source.projectionMatrix );

	return this;

};
