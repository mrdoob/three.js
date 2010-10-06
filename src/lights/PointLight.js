THREE.PointLight = function ( hex, intensity ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 0, 0 );
	this.intensity = intensity || 1;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.PointLight; 
