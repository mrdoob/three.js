/**
 * @author mrdoob / http://mrdoob.com/
 * @author aluarosi / https://github.com/aluarosi
 */

THREE.PointLight = function ( hex, intensity, distance, quadratic ) {

	THREE.Light.call( this, hex );

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.quadratic = ( quadratic !== undefined ) ? quadratic : false;

};

THREE.PointLight.prototype = Object.create( THREE.Light.prototype );

THREE.PointLight.prototype.clone = function () {

	var light = new THREE.PointLight();

	THREE.Light.prototype.clone.call( this, light );

	light.intensity = this.intensity;
	light.distance = this.distance;
	light.quadratic = this.quadratic;

	return light;

};
