import { Color } from '../../math/Color.js';

/**
 * A four-component version of {@link Color} which is internally
 * used by the renderer to represents clear color with alpha as
 * one object.
 *
 * @private
 * @augments Color
 */
class Color4 extends Color {

	/**
	 * Constructs a new four-component color.
	 *
	 * @param {Number|String} r - The red value.
	 * @param {Number} g - The green value.
	 * @param {Number} b - The blue value.
	 * @param {Number} [a=1] - The alpha value.
	 */
	constructor( r, g, b, a = 1 ) {

		super( r, g, b );

		this.a = a;

	}

	/**
	 * Overwrites the default to honor alpha.
	 *
	 * @param {Number|String} r - The red value.
	 * @param {Number} g - The green value.
	 * @param {Number} b - The blue value.
	 * @param {Number} [a=1] - The alpha value.
	 * @return {Color4} A reference to this object.
	 */
	set( r, g, b, a = 1 ) {

		this.a = a;

		return super.set( r, g, b );

	}

	/**
	 * Overwrites the default to honor alpha.
	 *
	 * @param {Color4} color - The color to copy.
	 * @return {Color4} A reference to this object.
	 */
	copy( color ) {

		if ( color.a !== undefined ) this.a = color.a;

		return super.copy( color );

	}

	/**
	 * Overwrites the default to honor alpha.
	 *
	 * @return {Color4} The cloned color.
	 */
	clone() {

		return new this.constructor( this.r, this.g, this.b, this.a );

	}

}

export default Color4;
