import { MathUtils } from 'three';

const _hsl = {};

/**
 * A utility class with helper functions for color conversion.
 *
 * @hideconstructor
 */
class ColorConverter {

	/**
	 * Sets the given HSV color definition to the given color object.
	 *
	 * @param {Color} color - The color to set.
	 * @param {number} h - The hue.
	 * @param {number} s - The saturation.
	 * @param {number} v - The value.
	 * @return {Color} The update color.
	 */
	static setHSV( color, h, s, v ) {

		// https://gist.github.com/xpansive/1337890#file-index-js

		h = MathUtils.euclideanModulo( h, 1 );
		s = MathUtils.clamp( s, 0, 1 );
		v = MathUtils.clamp( v, 0, 1 );

		return color.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );

	}

	/**
	 * Returns a HSV color representation of the given color object.
	 *
	 * @param {Color} color - The color to get HSV values from.
	 * @param {{h:number,s:number,v:number}} target - The target object that is used to store the method's result.
	 * @return {{h:number,s:number,v:number}} The HSV color.
	 */
	static getHSV( color, target ) {

		color.getHSL( _hsl );

		// based on https://gist.github.com/xpansive/1337890#file-index-js
		_hsl.s *= ( _hsl.l < 0.5 ) ? _hsl.l : ( 1 - _hsl.l );

		target.h = _hsl.h;
		target.s = 2 * _hsl.s / ( _hsl.l + _hsl.s );
		target.v = _hsl.l + _hsl.s;

		return target;

	}

}

export { ColorConverter };
