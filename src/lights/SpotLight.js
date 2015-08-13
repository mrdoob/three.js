/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpotLight = function ( color, intensity, distance, angle, exponent, decay ) {

	THREE.Light.call( this, color );

	this.type = 'SpotLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.angle = ( angle !== undefined ) ? angle : Math.PI / 3;
	this.exponent = ( exponent !== undefined ) ? exponent : 10;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.castShadow = false;
	this.onlyShadow = false;

	this.shadowCameraNear = 50;
	this.shadowCameraFar = 5000;
	this.shadowCameraFov = 50;

	this.shadowCameraVisible = false;

	this.shadowBias = 0;
	this.shadowDarkness = 0.5;

	this.shadowMapWidth = 512;
	this.shadowMapHeight = 512;

	this.shadowMap = null;
	this.shadowMapSize = null;
	this.shadowCamera = null;
	this.shadowMatrix = null;

};

THREE.SpotLight.prototype = Object.create( THREE.Light.prototype );
THREE.SpotLight.prototype.constructor = THREE.SpotLight;

THREE.SpotLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.intensity = source.intensity;
	this.distance = source.distance;
	this.angle = source.angle;
	this.exponent = source.exponent;
	this.decay = source.decay;

	this.target = source.target.clone();

	this.castShadow = source.castShadow;
	this.onlyShadow = source.onlyShadow;

	this.shadowCameraNear = source.shadowCameraNear;
	this.shadowCameraFar = source.shadowCameraFar;
	this.shadowCameraFov = source.shadowCameraFov;

	this.shadowCameraVisible = source.shadowCameraVisible;

	this.shadowBias = source.shadowBias;
	this.shadowDarkness = source.shadowDarkness;

	this.shadowMapWidth = source.shadowMapWidth;
	this.shadowMapHeight = source.shadowMapHeight;

	return this;
}

THREE.SpotLight.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	data.object.intensity = this.intensity;
	data.object.distance = this.distance;
	data.object.angle = this.angle;
	data.object.exponent = this.exponent;
	data.object.decay = this.decay;

	return data;

};
