/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ParticleSystem = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.autoUpdateMatrix = false;

};

THREE.ParticleSystem.prototype = new THREE.Object3D();
THREE.ParticleSystem.prototype.constructor = THREE.ParticleSystem;
