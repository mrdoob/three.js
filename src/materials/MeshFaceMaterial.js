/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function ( materials ) {

	this.materials = materials instanceof Array ? materials : [];

};

THREE.MeshFaceMaterial.prototype.clone = function () {
	
	var material = new THREE.MeshFaceMaterial();
	material.materials = this.materials.slice(0);
	return material;

};
