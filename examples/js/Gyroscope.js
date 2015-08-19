/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Gyroscope = function () {

	THREE.Object3D.call( this );

};

THREE.Gyroscope.prototype = Object.create( THREE.Object3D.prototype );
THREE.Gyroscope.prototype.constructor = THREE.Gyroscope;

THREE.Gyroscope.prototype._updateMatrixWorld = ( function () {

	var translationObject = new THREE.Vector3();
	var quaternionObject = new THREE.Quaternion();
	var scaleObject = new THREE.Vector3();

	var translationWorld = new THREE.Vector3();
	var quaternionWorld = new THREE.Quaternion();
	var scaleWorld = new THREE.Vector3();

	return function _updateMatrixWorld( force ) {

		if ( this.matrixAutoUpdate === true ) {

            this.updateMatrix();

        } else {

            this._matrixWorldNeedsUpdate = true;

        } 

        var parent = this.parent; 

        if ( this._matrixWorldNeedsUpdate === true ) {

            if ( parent === undefined ) {

                this._matrixWorld.copy( this._matrix );             

            } else {

                this._matrixWorld.multiplyMatrices( parent._matrixWorld, this._matrix );
				this.matrixWorld.decompose( translationWorld, quaternionWorld, scaleWorld );
				this.matrix.decompose( translationObject, quaternionObject, scaleObject );

				this.matrixWorld.compose( translationWorld, quaternionObject, scaleWorld );
            }
            
            

        }

        this._matrixWorldNeedsUpdate = false;

        return this._matrixWorld;

	};

}() );
