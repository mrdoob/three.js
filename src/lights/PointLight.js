THREE.PointLight = function ( hex, intensity ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3();
	this.intensity = intensity || 1;

};

THREE.PointLight.prototype = new THREE.Light();
THREE.PointLight.prototype.constructor = THREE.PointLight; 
