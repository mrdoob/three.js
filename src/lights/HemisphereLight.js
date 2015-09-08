/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = HemisphereLight;

var Light = require( "./Light" ),
	Object3D = require( "../core/Object3D" ),
	Color = require( "../math/Color" );

function HemisphereLight( skyColor, groundColor, intensity ) {

	Light.call( this, skyColor );

	this.type = "HemisphereLight";

	this.position.set( 0, 100, 0 );
	this.updateMatrix();

	this.groundColor = new Color( groundColor );
	this.intensity = ( intensity !== undefined ) ? intensity : 1;

}

HemisphereLight.prototype = Object.create( Light.prototype );
HemisphereLight.prototype.constructor = HemisphereLight;

HemisphereLight.prototype.copy = function ( source ) {

	Light.prototype.copy.call( this, source );

	this.groundColor.copy( source.groundColor );
	this.intensity = source.intensity;

	return this;

};

HemisphereLight.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	data.object.groundColor = this.groundColor.getHex();
	data.object.intensity = this.intensity;

	return data;

};
