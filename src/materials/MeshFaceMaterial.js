/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function ( materials ) {

	console.error( 'THREE.MeshFaceMaterial has been removed.' );

	var material = Array.isArray( materials ) ? materials[ 0 ] : new THREE.MeshBasicMaterial();
	material.materials = []; // temporal workaround

	return material;

};
