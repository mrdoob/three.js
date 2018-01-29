import { Color } from '../math/Color.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

function Fog( color, near, far ) {

	this.name = '';

	this.color = new Color( color );

	this.near = ( near !== undefined ) ? near : 1;
	this.far = ( far !== undefined ) ? far : 1000;

}

Fog.prototype.isFog = true;

Fog.prototype.clone = function () {

	return new Fog( this.color.getHex(), this.near, this.far );

};

Fog.prototype.toJSON = function ( /* meta */ ) {

	return {
		type: 'Fog',
		color: this.color.getHex(),
		near: this.near,
		far: this.far
	};

};

export { Fog };
