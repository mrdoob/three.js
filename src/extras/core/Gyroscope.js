/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Gyroscope = function () {

	THREE.Object3D.call( this );

};

THREE.Gyroscope.prototype = Object.create( THREE.Object3D.prototype );

THREE.extend( THREE.Gyroscope.prototype, {

	updateMatrixWorld: function ( force ) {

		this.matrixAutoUpdate && this.updateMatrix();

		// update matrixWorld

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent ) {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

				this.matrixWorld.decompose( this.translationWorld, this.rotationWorld, this.scaleWorld );
				this.matrix.decompose( this.translationObject, this.rotationObject, this.scaleObject );

				this.matrixWorld.compose( this.translationWorld, this.rotationObject, this.scaleWorld );


			} else {

				this.matrixWorld.copy( this.matrix );

			}


			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	},

	translationWorld: new THREE.Vector3(),
	translationObject: new THREE.Vector3(),
	rotationWorld: new THREE.Quaternion(),
	rotationObject: new THREE.Quaternion(),
	scaleWorld: new THREE.Vector3(),
	scaleObject: new THREE.Vector3()

});
