/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Mesh = function ( geometry, material ) {

	THREE.Object3D.call( this, material );

	this.geometry = geometry;

	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false;

};

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;
