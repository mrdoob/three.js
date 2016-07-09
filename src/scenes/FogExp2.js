import { Color } from '../math/Color';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

function FogExp2 ( color, density ) {
	this.isFogExp2 = true;

	this.name = '';

	this.color = new Color( color );
	this.density = ( density !== undefined ) ? density : 0.00025;

};

FogExp2.prototype.clone = function () {

	return new FogExp2( this.color.getHex(), this.density );

};


export { FogExp2 };