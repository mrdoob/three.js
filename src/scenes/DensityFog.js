/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author EliasHasle / http://eliashasle.github.io/
 */

import { Color } from '../math/Color.js';

function DensityFog( color, density, squared ) {

	this.name = '';

	this.color = new Color( color );
	this.density = ( density !== undefined ) ? density : 0.00025;

	this.needsUpdate = false;
	squared = squared !== undefined ? squared : true;

	Object.defineProperty( this, "squared", {

		get() {

			return squared;

		},

		set( value ) {

			squared = value;
			this.needsUpdate = true;

		}

	} );

	this.squared = squared;

}

Object.assign( DensityFog.prototype, {

	isDensityFog: true,

	clone: function () {

		return new DensityFog( this.color, this.density, this.squared );

	},

	toJSON: function ( /* meta */ ) {

		return {
			type: 'DensityFog',
			color: this.color.getHex(),
			density: this.density
		};

	}

} );

export { DensityFog };
