import { Color, ColorManagement, LinearSRGBColorSpace, MathUtils } from 'three';

const _hsl = {};
const _color = /*@__PURE__*/ new Color();

function linearSRGBToOKLCH( r, g, b, target ) {

	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

	const l_ = Math.cbrt( l );
	const m_ = Math.cbrt( m );
	const s_ = Math.cbrt( s );

	const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
	const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

	target.l = L;
	target.c = Math.sqrt( a * a + bLab * bLab );

	let h = Math.atan2( bLab, a ) / ( 2 * Math.PI );
	if ( h < 0 ) h += 1;
	target.h = h;

	return target;

}

function oklchToLinearSRGB( L, C, H, target ) {

	const hRad = H * 2 * Math.PI;
	const a = C * Math.cos( hRad );
	const b = C * Math.sin( hRad );

	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;

	target.r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	target.g = - 1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	target.b = - 0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

	return target;

}

function scaleToRGBGamut( color ) {

	color.r = Math.max( color.r, 0 );
	color.g = Math.max( color.g, 0 );
	color.b = Math.max( color.b, 0 );

	const maxComponent = Math.max( color.r, color.g, color.b, 1 );

	color.r /= maxComponent;
	color.g /= maxComponent;
	color.b /= maxComponent;

	return color;

}

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

	/**
	 * Sets the given OKLCH color definition to the given color object.
	 *
	 * The result is written into the configured working color space and
	 * gamut-mapped to that space's primaries, so a color that lies outside
	 * the sRGB gamut but inside a wider working gamut (e.g. linear
	 * Display-P3) is preserved instead of being clipped to sRGB.
	 *
	 * @param {Color} color - The color to set.
	 * @param {number} l - The lightness.
	 * @param {number} c - The chroma.
	 * @param {number} h - The hue.
	 * @return {Color} The updated color.
	 */
	static setOKLCH( color, l, c, h ) {

		l = MathUtils.clamp( l, 0, 1 );
		c = Math.max( c, 0 );
		h = MathUtils.euclideanModulo( h, 1 );

		oklchToLinearSRGB( l, c, h, color );

		ColorManagement.colorSpaceToWorking( color, LinearSRGBColorSpace );

		return scaleToRGBGamut( color );

	}

	/**
	 * Returns an OKLCH color representation of the given color object.
	 *
	 * @param {Color} color - The color to get OKLCH values from.
	 * @param {{l:number,c:number,h:number}} target - The target object that is used to store the method's result.
	 * @return {{l:number,c:number,h:number}} The OKLCH color.
	 */
	static getOKLCH( color, target ) {

		_color.copy( color );

		ColorManagement.workingToColorSpace( _color, LinearSRGBColorSpace );

		return linearSRGBToOKLCH( _color.r, _color.g, _color.b, target );

	}

}

export { ColorConverter };
