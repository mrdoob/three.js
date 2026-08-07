import { clamp, euclideanModulo, lerp } from './MathUtils.js';
import { ColorManagement, SRGBToLinear, LinearToSRGB } from './ColorManagement.js';
import { SRGBColorSpace } from '../constants.js';
import { warn } from '../utils.js';

/**
 * A structural type describing any object that stores RGB color components,
 * exactly like {@link Color#r}, {@link Color#g}, {@link Color#b}.
 *
 * Every function in this module accepts and produces values of this shape
 * instead of requiring a {@link Color} instance. Since {@link Color} exposes
 * compatible `r`/`g`/`b` fields, instances of that class satisfy this type
 * without any special handling.
 *
 * @typedef {Object} ColorLike
 * @property {number} r - Red channel value.
 * @property {number} g - Green channel value.
 * @property {number} b - Blue channel value.
 */

/**
 * A dictionary with X11 color names.
 *
 * Note that multiple words such as Dark Orange become the string 'darkorange'.
 *
 * @type {Object<string, number>}
 */
export const colorNAMES = {
	'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
	'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
	'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
	'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
	'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
	'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
	'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
	'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
	'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
	'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
	'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
	'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
	'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
	'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
	'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
	'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
	'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
	'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
	'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
	'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
	'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
	'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
	'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
	'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32
};

const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };
const _color = { r: 0, g: 0, b: 0 };

function hue2rgb( p, q, t ) {

	if ( t < 0 ) t += 1;
	if ( t > 1 ) t -= 1;
	if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	if ( t < 1 / 2 ) return q;
	if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
	return p;

}

/**
 * Creates a new, plain {@link ColorLike} object holding white (1, 1, 1).
 *
 * Unlike `new Color()`, the returned object is not a class instance and
 * carries no `isColor` flag — it only satisfies the {@link ColorLike}
 * shape. This keeps functional-only call sites free of any dependency on
 * the {@link Color} class so that unused color operations can be tree-shaken.
 *
 * @return {ColorLike} A new color-like object set to white.
 */
export function colorCreate() {

	return { r: 1, g: 1, b: 1 };

}

/**
 * Sets the target's components from the given values.
 *
 * @param {(number|string|ColorLike)} [r] - The red component. If `g` and `b` are
 * not provided, it can be a hexadecimal triplet, a CSS-style string or another color-like.
 * @param {number} [g] - The green component.
 * @param {number} [b] - The blue component.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSet( r, g, b, target = colorCreate() ) {

	if ( g === undefined && b === undefined ) {

		// r is ColorLike, hex or string

		const value = r;

		if ( value && value.isColor ) {

			colorCopy( value, target );

		} else if ( value && value.r !== undefined ) {

			// plain ColorLike (no isColor brand)

			colorCopy( value, target );

		} else if ( typeof value === 'number' ) {

			colorSetHex( value, SRGBColorSpace, target );

		} else if ( typeof value === 'string' ) {

			colorSetStyle( value, SRGBColorSpace, target );

		}

	} else {

		colorSetRGB( r, g, b, ColorManagement.workingColorSpace, target );

	}

	return target;

}

/**
 * Sets the target's components to the given scalar value.
 *
 * @param {number} scalar - The scalar value.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetScalar( scalar, target = colorCreate() ) {

	target.r = scalar;
	target.g = scalar;
	target.b = scalar;

	return target;

}

/**
 * Sets the target from a hexadecimal value.
 *
 * @param {number} hex - The hexadecimal value.
 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetHex( hex, colorSpace = SRGBColorSpace, target = colorCreate() ) {

	hex = Math.floor( hex );

	target.r = ( hex >> 16 & 255 ) / 255;
	target.g = ( hex >> 8 & 255 ) / 255;
	target.b = ( hex & 255 ) / 255;

	ColorManagement.colorSpaceToWorking( target, colorSpace );

	return target;

}

/**
 * Sets the target from RGB values.
 *
 * @param {number} r - Red channel value between `0.0` and `1.0`.
 * @param {number} g - Green channel value between `0.0` and `1.0`.
 * @param {number} b - Blue channel value between `0.0` and `1.0`.
 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetRGB( r, g, b, colorSpace = ColorManagement.workingColorSpace, target = colorCreate() ) {

	target.r = r;
	target.g = g;
	target.b = b;

	ColorManagement.colorSpaceToWorking( target, colorSpace );

	return target;

}

/**
 * Sets the target from HSL values.
 *
 * @param {number} h - Hue value between `0.0` and `1.0`.
 * @param {number} s - Saturation value between `0.0` and `1.0`.
 * @param {number} l - Lightness value between `0.0` and `1.0`.
 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetHSL( h, s, l, colorSpace = ColorManagement.workingColorSpace, target = colorCreate() ) {

	// h,s,l ranges are in 0.0 - 1.0
	h = euclideanModulo( h, 1 );
	s = clamp( s, 0, 1 );
	l = clamp( l, 0, 1 );

	if ( s === 0 ) {

		target.r = target.g = target.b = l;

	} else {

		const p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
		const q = ( 2 * l ) - p;

		target.r = hue2rgb( q, p, h + 1 / 3 );
		target.g = hue2rgb( q, p, h );
		target.b = hue2rgb( q, p, h - 1 / 3 );

	}

	ColorManagement.colorSpaceToWorking( target, colorSpace );

	return target;

}

/**
 * Sets the target from a CSS-style string.
 *
 * @param {string} style - Color as a CSS-style string.
 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetStyle( style, colorSpace = SRGBColorSpace, target = colorCreate() ) {

	function handleAlpha( string ) {

		if ( string === undefined ) return;

		if ( parseFloat( string ) < 1 ) {

			warn( 'Color: Alpha component of ' + style + ' will be ignored.' );

		}

	}


	let m;

	if ( m = /^(\w+)\(([^\)]*)\)/.exec( style ) ) {

		// rgb / hsl

		let color;
		const name = m[ 1 ];
		const components = m[ 2 ];

		switch ( name ) {

			case 'rgb':
			case 'rgba':

				if ( color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

					// rgb(255,0,0) rgba(255,0,0,0.5)

					handleAlpha( color[ 4 ] );

					return colorSetRGB(
						Math.min( 255, parseInt( color[ 1 ], 10 ) ) / 255,
						Math.min( 255, parseInt( color[ 2 ], 10 ) ) / 255,
						Math.min( 255, parseInt( color[ 3 ], 10 ) ) / 255,
						colorSpace,
						target
					);

				}

				if ( color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

					// rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)

					handleAlpha( color[ 4 ] );

					return colorSetRGB(
						Math.min( 100, parseInt( color[ 1 ], 10 ) ) / 100,
						Math.min( 100, parseInt( color[ 2 ], 10 ) ) / 100,
						Math.min( 100, parseInt( color[ 3 ], 10 ) ) / 100,
						colorSpace,
						target
					);

				}

				break;

			case 'hsl':
			case 'hsla':

				if ( color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

					// hsl(120,50%,50%) hsla(120,50%,50%,0.5)

					handleAlpha( color[ 4 ] );

					return colorSetHSL(
						parseFloat( color[ 1 ] ) / 360,
						parseFloat( color[ 2 ] ) / 100,
						parseFloat( color[ 3 ] ) / 100,
						colorSpace,
						target
					);

				}

				break;

			default:

				warn( 'Color: Unknown color model ' + style );

		}

	} else if ( m = /^\#([A-Fa-f\d]+)$/.exec( style ) ) {

		// hex color

		const hex = m[ 1 ];
		const size = hex.length;

		if ( size === 3 ) {

			// #ff0
			return colorSetRGB(
				parseInt( hex.charAt( 0 ), 16 ) / 15,
				parseInt( hex.charAt( 1 ), 16 ) / 15,
				parseInt( hex.charAt( 2 ), 16 ) / 15,
				colorSpace,
				target
			);

		} else if ( size === 6 ) {

			// #ff0000
			return colorSetHex( parseInt( hex, 16 ), colorSpace, target );

		} else {

			warn( 'Color: Invalid hex color ' + style );

		}

	} else if ( style && style.length > 0 ) {

		return colorSetColorName( style, colorSpace, target );

	}

	return target;

}

/**
 * Sets the target from a color name.
 *
 * @param {string} style - The color name.
 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetColorName( style, colorSpace = SRGBColorSpace, target = colorCreate() ) {

	// color keywords
	const hex = colorNAMES[ style.toLowerCase() ];

	if ( hex !== undefined ) {

		// red
		colorSetHex( hex, colorSpace, target );

	} else {

		// unknown color
		warn( 'Color: Unknown color ' + style );

	}

	return target;

}

/**
 * Copies the values of the given color into the target.
 *
 * @param {ColorLike} color - The color to copy.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorCopy( color, target = colorCreate() ) {

	target.r = color.r;
	target.g = color.g;
	target.b = color.b;

	return target;

}

/**
 * Copies the given color into the target, converting from
 * `SRGBColorSpace` to `LinearSRGBColorSpace`.
 *
 * @param {ColorLike} color - The color to copy/convert.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorCopySRGBToLinear( color, target = colorCreate() ) {

	target.r = SRGBToLinear( color.r );
	target.g = SRGBToLinear( color.g );
	target.b = SRGBToLinear( color.b );

	return target;

}

/**
 * Copies the given color into the target, converting from
 * `LinearSRGBColorSpace` to `SRGBColorSpace`.
 *
 * @param {ColorLike} color - The color to copy/convert.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorCopyLinearToSRGB( color, target = colorCreate() ) {

	target.r = LinearToSRGB( color.r );
	target.g = LinearToSRGB( color.g );
	target.b = LinearToSRGB( color.b );

	return target;

}

/**
 * Converts the given color from `SRGBColorSpace` to `LinearSRGBColorSpace`.
 *
 * @param {ColorLike} color - The color to convert.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorConvertSRGBToLinear( color, target = colorCreate() ) {

	return colorCopySRGBToLinear( color, target );

}

/**
 * Converts the given color from `LinearSRGBColorSpace` to `SRGBColorSpace`.
 *
 * @param {ColorLike} color - The color to convert.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorConvertLinearToSRGB( color, target = colorCreate() ) {

	return colorCopyLinearToSRGB( color, target );

}

/**
 * Returns the hexadecimal value of the given color.
 *
 * @param {ColorLike} color - The color.
 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
 * @return {number} The hexadecimal value.
 */
export function colorGetHex( color, colorSpace = SRGBColorSpace ) {

	ColorManagement.workingToColorSpace( colorCopy( color, _color ), colorSpace );

	return Math.round( clamp( _color.r * 255, 0, 255 ) ) * 65536 + Math.round( clamp( _color.g * 255, 0, 255 ) ) * 256 + Math.round( clamp( _color.b * 255, 0, 255 ) );

}

/**
 * Returns the hexadecimal value of the given color as a string (for example, 'FFFFFF').
 *
 * @param {ColorLike} color - The color.
 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
 * @return {string} The hexadecimal value as a string.
 */
export function colorGetHexString( color, colorSpace = SRGBColorSpace ) {

	return ( '000000' + colorGetHex( color, colorSpace ).toString( 16 ) ).slice( - 6 );

}

/**
 * Converts the color's RGB values into the HSL format and stores them into the
 * given target object.
 *
 * @param {ColorLike} color - The color.
 * @param {{h:number,s:number,l:number}} target - The target object that is used to store the method's result.
 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
 * @return {{h:number,s:number,l:number}} The HSL representation of the color.
 */
export function colorGetHSL( color, target, colorSpace = ColorManagement.workingColorSpace ) {

	// h,s,l ranges are in 0.0 - 1.0

	ColorManagement.workingToColorSpace( colorCopy( color, _color ), colorSpace );

	const r = _color.r, g = _color.g, b = _color.b;

	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );

	let hue, saturation;
	const lightness = ( min + max ) / 2.0;

	if ( min === max ) {

		hue = 0;
		saturation = 0;

	} else {

		const delta = max - min;

		saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

		switch ( max ) {

			case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
			case g: hue = ( b - r ) / delta + 2; break;
			case b: hue = ( r - g ) / delta + 4; break;

		}

		hue /= 6;

	}

	target.h = hue;
	target.s = saturation;
	target.l = lightness;

	return target;

}

/**
 * Returns the RGB values of the given color and stores them into the given target.
 *
 * @param {ColorLike} color - The color.
 * @param {ColorLike} target - The target color that is used to store the method's result.
 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
 * @return {ColorLike} The RGB representation of the color.
 */
export function colorGetRGB( color, target, colorSpace = ColorManagement.workingColorSpace ) {

	ColorManagement.workingToColorSpace( colorCopy( color, _color ), colorSpace );

	target.r = _color.r;
	target.g = _color.g;
	target.b = _color.b;

	return target;

}

/**
 * Returns the value of the given color as a CSS style string.
 *
 * @param {ColorLike} color - The color.
 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
 * @return {string} The CSS representation of the color.
 */
export function colorGetStyle( color, colorSpace = SRGBColorSpace ) {

	ColorManagement.workingToColorSpace( colorCopy( color, _color ), colorSpace );

	const r = _color.r, g = _color.g, b = _color.b;

	if ( colorSpace !== SRGBColorSpace ) {

		// Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
		return `color(${ colorSpace } ${ r.toFixed( 3 ) } ${ g.toFixed( 3 ) } ${ b.toFixed( 3 ) })`;

	}

	return `rgb(${ Math.round( r * 255 ) },${ Math.round( g * 255 ) },${ Math.round( b * 255 ) })`;

}

/**
 * Adds the given HSL values to the color's values.
 *
 * @param {ColorLike} color - The color.
 * @param {number} h - Hue value between `0.0` and `1.0`.
 * @param {number} s - Saturation value between `0.0` and `1.0`.
 * @param {number} l - Lightness value between `0.0` and `1.0`.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorOffsetHSL( color, h, s, l, target = colorCreate() ) {

	colorGetHSL( color, _hslA );

	return colorSetHSL( _hslA.h + h, _hslA.s + s, _hslA.l + l, ColorManagement.workingColorSpace, target );

}

/**
 * Adds the RGB values of `b` to `a` and stores the result in the target.
 *
 * @param {ColorLike} a - The first color.
 * @param {ColorLike} b - The color to add.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorAdd( a, b, target = colorCreate() ) {

	target.r = a.r + b.r;
	target.g = a.g + b.g;
	target.b = a.b + b.b;

	return target;

}

/**
 * Adds the RGB values of the given colors and stores the result in the target.
 *
 * @param {ColorLike} color1 - The first color.
 * @param {ColorLike} color2 - The second color.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorAddColors( color1, color2, target = colorCreate() ) {

	target.r = color1.r + color2.r;
	target.g = color1.g + color2.g;
	target.b = color1.b + color2.b;

	return target;

}

/**
 * Adds the given scalar value to the RGB values of the color.
 *
 * @param {ColorLike} color - The color.
 * @param {number} s - The scalar to add.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorAddScalar( color, s, target = colorCreate() ) {

	target.r = color.r + s;
	target.g = color.g + s;
	target.b = color.b + s;

	return target;

}

/**
 * Subtracts the RGB values of `b` from `a` (clamped at zero) and stores the result in the target.
 *
 * @param {ColorLike} a - The first color.
 * @param {ColorLike} b - The color to subtract.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSub( a, b, target = colorCreate() ) {

	target.r = Math.max( 0, a.r - b.r );
	target.g = Math.max( 0, a.g - b.g );
	target.b = Math.max( 0, a.b - b.b );

	return target;

}

/**
 * Multiplies the RGB values of `a` with the RGB values of `b`.
 *
 * @param {ColorLike} a - The first color.
 * @param {ColorLike} b - The color to multiply.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorMultiply( a, b, target = colorCreate() ) {

	target.r = a.r * b.r;
	target.g = a.g * b.g;
	target.b = a.b * b.b;

	return target;

}

/**
 * Multiplies the given scalar value with the RGB values of the color.
 *
 * @param {ColorLike} color - The color.
 * @param {number} s - The scalar to multiply.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorMultiplyScalar( color, s, target = colorCreate() ) {

	target.r = color.r * s;
	target.g = color.g * s;
	target.b = color.b * s;

	return target;

}

/**
 * Linearly interpolates `a`'s RGB values toward `b`.
 *
 * @param {ColorLike} a - The starting color.
 * @param {ColorLike} b - The color to converge on.
 * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorLerp( a, b, alpha, target = colorCreate() ) {

	target.r = a.r + ( b.r - a.r ) * alpha;
	target.g = a.g + ( b.g - a.g ) * alpha;
	target.b = a.b + ( b.b - a.b ) * alpha;

	return target;

}

/**
 * Linearly interpolates between the given colors and stores the result in the target.
 *
 * @param {ColorLike} color1 - The first color.
 * @param {ColorLike} color2 - The second color.
 * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorLerpColors( color1, color2, alpha, target = colorCreate() ) {

	target.r = color1.r + ( color2.r - color1.r ) * alpha;
	target.g = color1.g + ( color2.g - color1.g ) * alpha;
	target.b = color1.b + ( color2.b - color1.b ) * alpha;

	return target;

}

/**
 * Linearly interpolates `a`'s HSL values toward `b`.
 *
 * @param {ColorLike} a - The starting color.
 * @param {ColorLike} b - The color to converge on.
 * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorLerpHSL( a, b, alpha, target = colorCreate() ) {

	colorGetHSL( a, _hslA );
	colorGetHSL( b, _hslB );

	const h = lerp( _hslA.h, _hslB.h, alpha );
	const s = lerp( _hslA.s, _hslB.s, alpha );
	const l = lerp( _hslA.l, _hslB.l, alpha );

	return colorSetHSL( h, s, l, ColorManagement.workingColorSpace, target );

}

/**
 * Sets the target's RGB components from the given 3D vector-like.
 *
 * @param {{x:number,y:number,z:number}} v - The vector to set.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorSetFromVector3( v, target = colorCreate() ) {

	target.r = v.x;
	target.g = v.y;
	target.b = v.z;

	return target;

}

/**
 * Transforms the given color with the given 3x3 matrix-like.
 *
 * @param {ColorLike} color - The color.
 * @param {{elements:Array<number>|TypedArray}} m - The matrix.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorApplyMatrix3( color, m, target = colorCreate() ) {

	const r = color.r, g = color.g, b = color.b;
	const e = m.elements;

	target.r = e[ 0 ] * r + e[ 3 ] * g + e[ 6 ] * b;
	target.g = e[ 1 ] * r + e[ 4 ] * g + e[ 7 ] * b;
	target.b = e[ 2 ] * r + e[ 5 ] * g + e[ 8 ] * b;

	return target;

}

/**
 * Returns `true` if the two colors are equal.
 *
 * @param {ColorLike} a - The first color.
 * @param {ColorLike} b - The second color.
 * @return {boolean} Whether the colors are equal.
 */
export function colorEquals( a, b ) {

	return ( a.r === b.r ) && ( a.g === b.g ) && ( a.b === b.b );

}

/**
 * Sets the target's RGB components from the given array.
 *
 * @param {Array<number>} array - An array holding the RGB values.
 * @param {number} [offset=0] - The offset into the array.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorFromArray( array, offset = 0, target = colorCreate() ) {

	target.r = array[ offset ];
	target.g = array[ offset + 1 ];
	target.b = array[ offset + 2 ];

	return target;

}

/**
 * Writes the RGB components of the given color to the given array.
 *
 * @param {ColorLike} color - The color.
 * @param {Array<number>} [array=[]] - The target array holding the color components.
 * @param {number} [offset=0] - Index of the first element in the array.
 * @return {Array<number>} The color components.
 */
export function colorToArray( color, array = [], offset = 0 ) {

	array[ offset ] = color.r;
	array[ offset + 1 ] = color.g;
	array[ offset + 2 ] = color.b;

	return array;

}

/**
 * Sets the components of the target from the given buffer attribute.
 *
 * @param {BufferAttribute} attribute - The buffer attribute holding color data.
 * @param {number} index - The index into the attribute.
 * @param {ColorLike} [target] - The target the result is stored to.
 * @return {ColorLike} The target, for chaining.
 */
export function colorFromBufferAttribute( attribute, index, target = colorCreate() ) {

	target.r = attribute.getX( index );
	target.g = attribute.getY( index );
	target.b = attribute.getZ( index );

	return target;

}

/**
 * Returns the serialization result of the given color (hexadecimal value).
 *
 * @param {ColorLike} color - The color.
 * @return {number} The hexadecimal value.
 */
export function colorToJSON( color ) {

	return colorGetHex( color );

}
