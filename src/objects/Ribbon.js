/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Ribbon = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.flipSided = false;
	this.doubleSided = false;

};

THREE.Ribbon.prototype = new THREE.Object3D();
THREE.Ribbon.prototype.constructor = THREE.Ribbon;
