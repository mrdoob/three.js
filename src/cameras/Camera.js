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

};

THREE.Camera.prototype = new THREE.Object3D();
THREE.Camera.prototype.constructor = THREE.Camera;

THREE.Camera.prototype.lookAt = function ( vector ) {

	// TODO: Add hierarchy support.

	this.matrix.lookAt( this.position, vector, this.up );

	if ( this.rotationAutoUpdate ) {

		this.rotation.setRotationFromMatrix( this.matrix );

	}

}

THREE.Camera.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	this.matrixAutoUpdate && this.updateMatrix();

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if ( parentMatrixWorld ) {

			this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

		THREE.Matrix4.makeInvert( this.matrixWorld, this.matrixWorldInverse );

	}


	// update children

	for ( var i = 0; i < this.children.length; i ++ ) {

		this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

	}

};
