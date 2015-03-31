
// a helper to show geometry bounding sphere for a mesh object

THREE.BoundingSphereHelper = function ( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0xffff80;

	this.object = object;

	THREE.Mesh.call( this, undefined, new THREE.MeshBasicMaterial( { color: color, wireframe: true } ) );

	this.matrixAutoUpdate = false;

	this.update();

};

THREE.BoundingSphereHelper.prototype = Object.create( THREE.Mesh.prototype );
THREE.BoundingSphereHelper.prototype.constructor = THREE.BoundingSphereHelper;

THREE.BoundingSphereHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();

}

THREE.BoundingSphereHelper.prototype.update = function () {

	// get bounding sphere

	var geometry = this.object.geometry

	if ( geometry.boundingSphere === null ) {

		geometry.computeBoundingSphere();

	}

	var center = geometry.boundingSphere.center

	// create sphere geometry

	this.geometry = new THREE.SphereGeometry( geometry.boundingSphere.radius, 8, 5 );

	var worldPos = new THREE.Vector3().setFromMatrixPosition( this.object.matrixWorld );

	var finalPos = new THREE.Vector3().addVectors( center, worldPos );

	this.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( finalPos.x, finalPos.y, finalPos.z ) );

};
