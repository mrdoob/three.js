/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Particle = function ( material ) {

	THREE.Object3D.call( this, material );

	this.autoUpdateMatrix = false;

};

THREE.Particle.prototype = new THREE.Object3D();
THREE.Particle.prototype.constructor = THREE.Particle;
