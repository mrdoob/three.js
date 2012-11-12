/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function (materials) {
    
    this.useGeometryMaterial = !materials;
    this.materials = materials !== undefined ? materials : [];

};

THREE.MeshFaceMaterial.prototype.clone = function () {

	return new THREE.MeshFaceMaterial();

};
