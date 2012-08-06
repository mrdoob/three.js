/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};



THREE.MeshFaceMaterial.prototype.clone = function(){ 
	var returnValue = new THREE.MeshFaceMaterial(this);
	return returnValue;
};