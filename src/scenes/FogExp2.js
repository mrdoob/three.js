import { Color } from '../math/Color';
import { ParameterSource } from '../core/ParameterSource';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

function FogExp2 ( color, density ) {

	this.name = '';

	this.addParameter( 'color', new Color( color ), 'fogColor' );
	this.addParameter( 'density', ( density !== undefined ) ? density : 0.00025, 'fogDensity' );

}

FogExp2.prototype.isFogExp2 = true;

FogExp2.prototype.clone = function () {

	return new FogExp2( this.color.getHex(), this.density );

};

FogExp2.prototype.toJSON = function ( meta ) {

	return {
		type: 'FogExp2',
		color: this.color.getHex(),
		density: this.density
	};

};

Object.assign( FogExp2.prototype, ParameterSource.prototype );

export { FogExp2 };
