/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function ( materials ) {

	this.materials = materials instanceof Array ? materials : [];

};

THREE.MeshFaceMaterial.prototype.clone = function () {
	
	//TODO do we need to clone the materials in the array also?? 
	var material = new THREE.MeshFaceMaterial();
	material.materials = this.materials;
	return material;

};
