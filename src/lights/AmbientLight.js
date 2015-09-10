/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = AmbientLight;

var Light = require( "./Light" ),
	Object3D = require( "../core/Object3D" );

function AmbientLight( color ) {

	Light.call( this, color );

	this.type = "AmbientLight";

}

AmbientLight.prototype = Object.create( Light.prototype );
AmbientLight.prototype.constructor = AmbientLight;

AmbientLight.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();

	return data;

};
