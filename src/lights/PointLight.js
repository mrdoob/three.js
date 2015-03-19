/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointLight = function ( color, intensity, distance, decay, physicalQuadraticFalloff ) {

	THREE.Light.call( this, color );

	this.type = 'PointLight';

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;
	this.physicalQuadraticFalloff =  ( physicalQuadraticFalloff !== undefined ) ? physicalQuadraticFalloff : false;

};

THREE.PointLight.prototype = Object.create( THREE.Light.prototype );
THREE.PointLight.prototype.constructor = THREE.PointLight;

THREE.PointLight.prototype.clone = function () {

	var light = new THREE.PointLight();

	THREE.Light.prototype.clone.call( this, light );

	light.intensity = this.intensity;
	light.distance = this.distance;
	light.decay = this.decay;
	light.physicalQuadraticFalloff = this.physicalQuadraticFalloff;

	return light;

};
