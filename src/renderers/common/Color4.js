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
	 * You can also pass a single THREE.Color, hex or
	 * string argument to this constructor.
	 *
	 * @param {number|string} [r=1] - The red value.
	 * @param {number} [g=1] - The green value.
	 * @param {number} [b=1] - The blue value.
	 * @param {number} [a=1] - The alpha value.
	 */
	constructor( r, g, b, a = 1 ) {

		super( r, g, b );

		this.a = a;

	}

	/**
	 * Overwrites the default to honor alpha.
	 * You can also pass a single THREE.Color, hex or
	 * string argument to this method.
	 *
	 * @param {number|string|Color} r - The red value.
	 * @param {number} [g] - The green value.
	 * @param {number} [b] - The blue value.
	 * @param {number} [a=1] - The alpha value.
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
