/**
 * @author mr.doob / http://mrdoob.com/
 */

/**
 * Represents a color
 * @constructor
 * @param {integer} hex color value in hex
 */
THREE.Color = function ( hex ) {

	if ( hex !== undefined ) this.setHex( hex );
	return this;

};

THREE.Color.prototype = {

	constructor: THREE.Color,

	r: 1, g: 1, b: 1,

	/**
	 * Copy a color
	 * @param {THREE.Color} color source color to copy
	 * @returns {THREE.Color}
	 */
	copy: function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	},

	/**
	 * Copies a gamma color to a linear color
	 * @param {THREE.Color} color a gamma color
	 * @returns {THREE.Color}
	 */
	copyGammaToLinear: function ( color ) {

		this.r = color.r * color.r;
		this.g = color.g * color.g;
		this.b = color.b * color.b;

		return this;

	},

    /**
     * Copies a linear color to a gamma color
     * @param {THREE.Color} color a linear color
     * @returns {THREE.Color}
     */
	copyLinearToGamma: function ( color ) {

		this.r = Math.sqrt( color.r );
		this.g = Math.sqrt( color.g );
		this.b = Math.sqrt( color.b );

		return this;

	},

	/**
	 * Sets the color value given RGB values
	 * @param {float} r red channel (between 0 and 1)
	 * @param {float} g green channel (between 0 and 1)
	 * @param {float} b blue channel (between 0 and 1)
	 */
	setRGB: function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		return this;

	},

	/**
	 * Sets the color given HSV values.
	 * Based on MochiKit implementation by Bob Ippolito.
	 * @param {float} h hue (between 0 and 1)
	 * @param {float} s saturation (between 0 and 1)
	 * @param {float} v value (between 0 and 1)
	 */
	setHSV: function ( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		var i, f, p, q, t;

		if ( v === 0 ) {

			this.r = this.g = this.b = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			switch ( i ) {

				case 1: this.r = q; this.g = v; this.b = p; break;
				case 2: this.r = p; this.g = v; this.b = t; break;
				case 3: this.r = p; this.g = q; this.b = v; break;
				case 4: this.r = t; this.g = p; this.b = v; break;
				case 5: this.r = v; this.g = p; this.b = q; break;
				case 6: // fall through
				case 0: this.r = v; this.g = t; this.b = p; break;

			}

		}

		return this;

	},

	/**
	 * Sets this color from a hex value
	 * @param {integer} hex Hex integer value of color
	 */
	setHex: function ( hex ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		return this;

	},

	/**
	 * Gets the color value as hex
	 * @returns {integer} The color as a hex value
	 */
	getHex: function () {

		return ~~ ( this.r * 255 ) << 16 ^ ~~ ( this.g * 255 ) << 8 ^ ~~ ( this.b * 255 );

	},

	/**
	 * Gets the color value in string format for use as CSS for a canvas context.
	 * @returns {string} The color in the form ``rgb(red,green,blue)``.
	 */
	getContextStyle: function () {

		return 'rgb(' + Math.floor( this.r * 255 ) + ',' + Math.floor( this.g * 255 ) + ',' + Math.floor( this.b * 255 ) + ')';

	},

	/**
	 * Returns a copy of this color
	 * @returns {THREE.Color}
	 */
	clone: function () {

		return new THREE.Color().setRGB( this.r, this.g, this.b );

	}

};
