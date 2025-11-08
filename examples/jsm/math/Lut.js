import {
	Color,
	LinearSRGBColorSpace,
	MathUtils
} from 'three';

/**
 * Represents a lookup table for colormaps. It is used to determine the color
 * values from a range of data values.
 *
 * ```js
 * const lut = new Lut( 'rainbow', 512 );
 * const color = lut.getColor( 0.5 );
 * ```
 *
 * @three_import import { Lut } from 'three/addons/math/Lut.js';
 */
class Lut {

	/**
	 * Constructs a new Lut.
	 *
	 * @param {('rainbow'|'cooltowarm'|'blackbody'|'grayscale')} [colormap='rainbow'] - Sets a colormap from predefined list of colormaps.
	 * @param {number} [count=32] - Sets the number of colors used to represent the data array.
	 */
 	constructor( colormap, count = 32 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLut = true;


		/**
		 * The lookup table for the selected color map
		 *
		 * @type {Array<Color>}
		 */
		this.lut = [];

		/**
		 * The currently selected color map.
		 *
		 * @type {Array<Array<number>>}
		 */
		this.map = [];

		/**
		 * The number of colors of the current selected color map.
		 *
		 * @type {number}
		 * @default 32
		 */
		this.n = 0;

		/**
		 * The minimum value to be represented with the lookup table.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minV = 0;

		/**
		 * The maximum value to be represented with the lookup table.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.maxV = 1;

		this.setColorMap( colormap, count );

	}

	/**
	 * Sets the given LUT.
	 *
	 * @param {Lut} value - The LUT to set.
	 * @return {Lut} A reference to this LUT.
	 */
	set( value ) {

		if ( value.isLut === true ) {

			this.copy( value );

		}

		return this;

	}

	/**
	 * Sets the minimum value to be represented with this LUT.
	 *
	 * @param {number} min - The minimum value to be represented with the lookup table.
	 * @return {Lut} A reference to this LUT.
	 */
	setMin( min ) {

		this.minV = min;

		return this;

	}

	/**
	 * Sets the maximum value to be represented with this LUT.
	 *
	 * @param {number} max - The maximum value to be represented with the lookup table.
	 * @return {Lut} A reference to this LUT.
	 */
	setMax( max ) {

		this.maxV = max;

		return this;

	}

	/**
	 * Configure the lookup table for the given color map and number of colors.
	 *
	 * @param {string} colormap - The name of the color map.
	 * @param {number} [count=32] - The number of colors.
	 * @return {Lut} A reference to this LUT.
	 */
	setColorMap( colormap, count = 32 ) {

		this.map = ColorMapKeywords[ colormap ] || ColorMapKeywords.rainbow;
		this.n = count;

		const step = 1.0 / this.n;
		const minColor = new Color();
		const maxColor = new Color();

		this.lut.length = 0;

		// sample at 0

		this.lut.push( new Color( this.map[ 0 ][ 1 ] ) );

		// sample at 1/n, ..., (n-1)/n

		for ( let i = 1; i < count; i ++ ) {

			const alpha = i * step;

			for ( let j = 0; j < this.map.length - 1; j ++ ) {

				if ( alpha > this.map[ j ][ 0 ] && alpha <= this.map[ j + 1 ][ 0 ] ) {

					const min = this.map[ j ][ 0 ];
					const max = this.map[ j + 1 ][ 0 ];

					minColor.setHex( this.map[ j ][ 1 ], LinearSRGBColorSpace );
					maxColor.setHex( this.map[ j + 1 ][ 1 ], LinearSRGBColorSpace );

					const color = new Color().lerpColors( minColor, maxColor, ( alpha - min ) / ( max - min ) );

					this.lut.push( color );

				}

			}

		}

		// sample at 1

		this.lut.push( new Color( this.map[ this.map.length - 1 ][ 1 ] ) );

		return this;

	}

	/**
	 * Copies the given lut.
	 *
	 * @param {Lut} lut - The LUT to copy.
	 * @return {Lut} A reference to this LUT.
	 */
	copy( lut ) {

		this.lut = lut.lut;
		this.map = lut.map;
		this.n = lut.n;
		this.minV = lut.minV;
		this.maxV = lut.maxV;

		return this;

	}

	/**
	 * Returns an instance of Color for the given data value.
	 *
	 * @param {number} alpha - The value to lookup.
	 * @return {Color} The color from the LUT.
	 */
	getColor( alpha ) {

		alpha = MathUtils.clamp( alpha, this.minV, this.maxV );

		alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );

		const colorPosition = Math.round( alpha * this.n );

		return this.lut[ colorPosition ];

	}

	/**
	 * Adds a color map to this Lut instance.
	 *
	 * @param {string} name - The name of the color map.
	 * @param {Array<Array<number>>} arrayOfColors - An array of color values. Each value is an array
	 * holding a threshold and the actual color value as a hexadecimal number.
	 * @return {Lut} A reference to this LUT.
	 */
	addColorMap( name, arrayOfColors ) {

		ColorMapKeywords[ name ] = arrayOfColors;

		return this;

	}

	/**
	 * Creates a canvas in order to visualize the lookup table as a texture.
	 *
	 * @return {HTMLCanvasElement} The created canvas.
	 */
	createCanvas() {

		const canvas = document.createElement( 'canvas' );
		canvas.width = 1;
		canvas.height = this.n;

		this.updateCanvas( canvas );

		return canvas;

	}

	/**
	 * Updates the given canvas with the Lut's data.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas to update.
	 * @return {HTMLCanvasElement} The updated canvas.
	 */
	updateCanvas( canvas ) {

		const ctx = canvas.getContext( '2d', { alpha: false } );

		const imageData = ctx.getImageData( 0, 0, 1, this.n );

		const data = imageData.data;

		let k = 0;

		const step = 1.0 / this.n;

		const minColor = new Color();
		const maxColor = new Color();
		const finalColor = new Color();

		for ( let i = 1; i >= 0; i -= step ) {

			for ( let j = this.map.length - 1; j >= 0; j -- ) {

				if ( i < this.map[ j ][ 0 ] && i >= this.map[ j - 1 ][ 0 ] ) {

					const min = this.map[ j - 1 ][ 0 ];
					const max = this.map[ j ][ 0 ];

					minColor.setHex( this.map[ j - 1 ][ 1 ], LinearSRGBColorSpace );
					maxColor.setHex( this.map[ j ][ 1 ], LinearSRGBColorSpace );

					finalColor.lerpColors( minColor, maxColor, ( i - min ) / ( max - min ) );

					data[ k * 4 ] = Math.round( finalColor.r * 255 );
					data[ k * 4 + 1 ] = Math.round( finalColor.g * 255 );
					data[ k * 4 + 2 ] = Math.round( finalColor.b * 255 );
					data[ k * 4 + 3 ] = 255;

					k += 1;

				}

			}

		}

		ctx.putImageData( imageData, 0, 0 );

		return canvas;

	}

}

const ColorMapKeywords = {

	'rainbow': [[ 0.0, 0x0000FF ], [ 0.2, 0x00FFFF ], [ 0.5, 0x00FF00 ], [ 0.8, 0xFFFF00 ], [ 1.0, 0xFF0000 ]],
	'cooltowarm': [[ 0.0, 0x3C4EC2 ], [ 0.2, 0x9BBCFF ], [ 0.5, 0xDCDCDC ], [ 0.8, 0xF6A385 ], [ 1.0, 0xB40426 ]],
	'blackbody': [[ 0.0, 0x000000 ], [ 0.2, 0x780000 ], [ 0.5, 0xE63200 ], [ 0.8, 0xFFFF00 ], [ 1.0, 0xFFFFFF ]],
	'grayscale': [[ 0.0, 0x000000 ], [ 0.2, 0x404040 ], [ 0.5, 0x7F7F80 ], [ 0.8, 0xBFBFBF ], [ 1.0, 0xFFFFFF ]]

};

export { Lut, ColorMapKeywords };
