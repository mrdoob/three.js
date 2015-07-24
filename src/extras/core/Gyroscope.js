/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Gyroscope = function () {

	THREE.Object3D.call( this );

};

THREE.Gyroscope.prototype = Object.create( THREE.Object3D.prototype );
THREE.Gyroscope.prototype.constructor = THREE.Gyroscope;

THREE.Gyroscope.prototype.updateMatrixWorld = ( function () {

	var translationObject = new THREE.Vector3();
	var quaternionObject = new THREE.Quaternion();
	var scaleObject = new THREE.Vector3();

	var translationWorld = new THREE.Vector3();
	var quaternionWorld = new THREE.Quaternion();
	var scaleWorld = new THREE.Vector3();

	return function updateMatrixWorld( recursive, parentChanged ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, false, parentChanged );

		this._matrixWorld.decompose( translationWorld, quaternionWorld, scaleWorld );
		this._matrix.decompose( translationObject, quaternionObject, scaleObject );

		this._matrixWorld.compose( translationWorld, quaternionObject, scaleWorld );

		// update children
		if ( recursive === true ) { 
			
			var children = this.children;
			for ( var i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateMatrixWorld( true, false );

			}
			
		}
		
		return this._matrixWorld;

	};
	
}() );
