import { Color } from '../math/Color';
import { ParameterSource } from '../core/ParameterSource';


/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

function Fog ( color, near, far ) {

	this.name = '';

	this.addParameter( 'color', new Color( color ), 'fogColor' );

	this.addParameter( 'near', ( near !== undefined ) ? near : 1, 'fogNear' );
	this.addParameter( 'far', ( far !== undefined ) ? far : 1000, 'fogFar' );

}

Fog.prototype.isFog = true;

Fog.prototype.clone = function () {

	return new Fog( this.color.getHex(), this.near, this.far );

};

Fog.prototype.toJSON = function ( meta ) {

	return {
		type: 'Fog',
		color: this.color.getHex(),
		near: this.near,
		far: this.far
	};

};

Object.assign( Fog.prototype, ParameterSource.prototype );

export { Fog };
