THREE.LocalFog = function (color, radius, far) {

	THREE.Object3D.call( this );

	this.color = new THREE.Color( color );
	this.radius = ( radius !== undefined ) ? radius : 100;
	this.far = ( far !== undefined ) ? far : 50;
	
};

THREE.LocalFog.prototype = Object.create( THREE.Object3D.prototype );
THREE.LocalFog.prototype.constructor = THREE.LocalFog;