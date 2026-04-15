import { MathUtils, SRGBColorSpace } from 'three';

/**
 * @module ColorUtils
 * @three_import import * as ColorUtils from 'three/addons/utils/ColorUtils.js';
 */

/**
 * Sets the given color from a color temperature in Kelvin.
 *
 * Converts a correlated color temperature (CTT) to an approximate sRGB color
 * using Tanner Helland's algorithm. Useful for physically-based lighting
 * setups — e.g. candle flame (~1900K), tungsten bulb (~3200K), daylight
 * (~6500K), or clear blue sky (~10000K). Values outside [1000, 40000] are
 * clamped.
 *
 * Reference: https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
 *
 * @param {Color} color - The color to set.
 * @param {number} kelvin - Color temperature in Kelvin. Clamped to [1000, 40000].
 * @return {Color} The updated color.
 */
function setKelvin( color, kelvin ) {

	// Algorithm by Tanner Helland (2012). Inputs are divided by 100.
	const temp = MathUtils.clamp( kelvin, 1000, 40000 ) / 100;

	let r, g, b;

	// Red channel
	if ( temp <= 66 ) {

		r = 255;

	} else {

		r = 329.698727446 * Math.pow( temp - 60, - 0.1332047592 );

	}

	// Green channel
	if ( temp <= 66 ) {

		g = 99.4708025861 * Math.log( temp ) - 161.1195681661;

	} else {

		g = 288.1221695283 * Math.pow( temp - 60, - 0.0755148492 );

	}

	// Blue channel
	if ( temp >= 66 ) {

		b = 255;

	} else if ( temp <= 19 ) {

		b = 0;

	} else {

		b = 138.5177312231 * Math.log( temp - 10 ) - 305.0447927307;

	}

	return color.setRGB(
		MathUtils.clamp( r, 0, 255 ) / 255,
		MathUtils.clamp( g, 0, 255 ) / 255,
		MathUtils.clamp( b, 0, 255 ) / 255,
		SRGBColorSpace
	);

}

export { setKelvin };
