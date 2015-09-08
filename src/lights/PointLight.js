/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = PointLight;

var Light = require( "./Light" ),
	Object3D = require( "../core/Object3D" );

function PointLight( color, intensity, distance, decay ) {

	Light.call( this, color );

	this.type = "PointLight";

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

}

PointLight.prototype = Object.create( Light.prototype );
PointLight.prototype.constructor = PointLight;

PointLight.prototype.copy = function ( source ) {

	Light.prototype.copy.call( this, source );

	this.intensity = source.intensity;
	this.distance = source.distance;
	this.decay = source.decay;

	return this;

};

PointLight.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	data.object.intensity = this.intensity;
	data.object.distance = this.distance;
	data.object.decay = this.decay;

	return data;

};
