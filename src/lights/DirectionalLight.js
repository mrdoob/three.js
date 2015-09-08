/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = DirectionalLight;

var Light = require( "./Light" ),
	Object3D = require( "../core/Object3D" );

function DirectionalLight( color, intensity ) {

	Light.call( this, color );

	this.type = "DirectionalLight";

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;

	this.castShadow = false;
	this.onlyShadow = false;

	this.shadowCameraNear = 50;
	this.shadowCameraFar = 5000;

	this.shadowCameraLeft = - 500;
	this.shadowCameraRight = 500;
	this.shadowCameraTop = 500;
	this.shadowCameraBottom = - 500;

	this.shadowCameraVisible = false;

	this.shadowBias = 0;
	this.shadowDarkness = 0.5;

	this.shadowMapWidth = 512;
	this.shadowMapHeight = 512;

	this.shadowMap = null;
	this.shadowMapSize = null;
	this.shadowCamera = null;
	this.shadowMatrix = null;

}

DirectionalLight.prototype = Object.create( Light.prototype );
DirectionalLight.prototype.constructor = DirectionalLight;

DirectionalLight.prototype.copy = function ( source ) {

	Light.prototype.copy.call( this, source );

	this.intensity = source.intensity;
	this.target = source.target.clone();

	this.castShadow = source.castShadow;
	this.onlyShadow = source.onlyShadow;

	this.shadowCameraNear = source.shadowCameraNear;
	this.shadowCameraFar = source.shadowCameraFar;

	this.shadowCameraLeft = source.shadowCameraLeft;
	this.shadowCameraRight = source.shadowCameraRight;
	this.shadowCameraTop = source.shadowCameraTop;
	this.shadowCameraBottom = source.shadowCameraBottom;

	this.shadowCameraVisible = source.shadowCameraVisible;

	this.shadowBias = source.shadowBias;
	this.shadowDarkness = source.shadowDarkness;

	this.shadowMapWidth = source.shadowMapWidth;
	this.shadowMapHeight = source.shadowMapHeight;

	return this;

};

DirectionalLight.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	data.object.intensity = this.intensity;

	return data;

};
