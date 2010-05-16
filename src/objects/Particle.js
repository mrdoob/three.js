THREE.Particle = function (material) {

	THREE.Object3D.call(this, material);

	this.size = 1;
}

THREE.Particle.prototype = new THREE.Object3D();
THREE.Particle.prototype.constructor = THREE.Particle;
