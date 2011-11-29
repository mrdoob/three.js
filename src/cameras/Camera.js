/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Camera = function () {

	if ( arguments.length ) {

		console.warn( 'DEPRECATED: Camera() is now PerspectiveCamera() or OrthographicCamera().' );
		return new THREE.PerspectiveCamera( arguments[ 0 ], arguments[ 1 ], arguments[ 2 ], arguments[ 3 ] );

	}

	THREE.Object3D.call( this );

	this.matrixWorldInverse = new THREE.Matrix4();

	this.projectionMatrix = new THREE.Matrix4();
	this.projectionMatrixInverse = new THREE.Matrix4();


};

THREE.Camera.prototype = new THREE.Object3D();
THREE.Camera.prototype.constructor = THREE.Camera;

THREE.Camera.prototype.lookAt = function ( vector ) {

	// TODO: Add hierarchy support.

	this.matrix.lookAt( this.position, vector, this.up );

	if ( this.rotationAutoUpdate ) {

		this.rotation.setRotationFromMatrix( this.matrix );

	}

};
