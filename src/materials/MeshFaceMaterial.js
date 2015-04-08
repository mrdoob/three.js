/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function ( materials ) {

	THREE.error( 'THREE.MeshFaceMaterial has been removed.' );

	var material = materials !== undefined ? materials[ 0 ] : new THREE.MeshBasicMaterial();
	material.materials = []; // temporal workaround

	return material;

};
