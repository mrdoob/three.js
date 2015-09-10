/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = FogExp2;

var Color = require( "../math/Color" );

function FogExp2( color, density ) {

	this.name = "";

	this.color = new Color( color );
	this.density = ( density !== undefined ) ? density : 0.00025;

}

FogExp2.prototype.clone = function () {

	return new FogExp2( this.color.getHex(), this.density );

};
