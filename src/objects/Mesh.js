/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Mesh = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false; // TODO: Move to material?

	this.geometry.boundingSphere || this.geometry.computeBoundingSphere();

};

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;
