/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = Fog;

var Color = require( "../math/Color" );

function Fog( color, near, far ) {

	this.name = "";

	this.color = new Color( color );

	this.near = ( near !== undefined ) ? near : 1;
	this.far = ( far !== undefined ) ? far : 1000;

}

Fog.prototype.clone = function () {

	return new Fog( this.color.getHex(), this.near, this.far );

};
