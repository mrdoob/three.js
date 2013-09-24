/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function ( materials ) {

	this.materials = materials instanceof Array ? materials : [];

};

THREE.MeshFaceMaterial.prototype.clone = function () {

	var material = new THREE.MeshFaceMaterial();

	for ( var i = 0; i < this.materials.length; i ++ ) {

		material.materials.push( this.materials[ i ].clone() );

	}

	return material;

};
