/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

import { Color } from '../math/Color.js';

function RangeFog( color, near, far ) {

	this.name = '';

	this.color = new Color( color );

	this.near = ( near !== undefined ) ? near : 1;
	this.far = ( far !== undefined ) ? far : 1000;

}

Object.assign( RangeFog.prototype, {

	isRangeFog: true,

	clone: function () {

		return new RangeFog( this.color, this.near, this.far );

	},

	toJSON: function ( /* meta */ ) {

		return {
			type: 'RangeFog',
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

} );

export { RangeFog };
