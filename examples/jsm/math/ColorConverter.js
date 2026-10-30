import { MathUtils } from 'three';

const _hsl = {};

/**
 * A utility class with helper functions for color conversion.
 *
 * @hideconstructor
 * @three_import import { ColorConverter } from 'three/addons/math/ColorConverter.js';
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

		const l = ( 2 - s ) * v;
		const saturation = ( l === 0 || l === 2 ) ? 0 : ( s * v ) / ( l < 1 ? l : ( 2 - l ) );

		return color.setHSL( h, saturation, l * 0.5 );

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
		const v = _hsl.l + _hsl.s;

		target.h = _hsl.h;
		target.s = v === 0 ? 0 : 2 * _hsl.s / v;
		target.v = v;

		return target;

	}

}

export { ColorConverter };
