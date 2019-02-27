/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

import { Color } from '../math/Color.js';

function Fog( color, near, far ) {

	this.name = '';

	this.color = new Color( color );

	this.near = ( near !== undefined ) ? near : 1;
	this.far = ( far !== undefined ) ? far : 1000;

}

Object.assign( Fog.prototype, {

	isFog: true,

	clone: function () {

		return new Fog( this.color, this.near, this.far );

	},

	toJSON: function ( /* meta */ ) {

		return {
			type: 'Fog',
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		}

	}

} );

export { Fog };
