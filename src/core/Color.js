/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	/*
	this.r; this.g; this.b; this.a;
	this.hex;
	this.__styleString;
	*/

	this.autoUpdate = true;
	this.setHex( hex );

}

THREE.Color.prototype = {

	setRGBA: function ( r, g, b, a ) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},

	setHex: function ( hex ) {

		this.hex = hex;

		if ( this.autoUpdate ) {

			this.updateRGBA();
			this.updateStyleString();

		}

	},

	copyRGB: function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

	},

	copyRGBA: function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.a = color.a;

	},

	multiplySelfRGB: function ( color ) {

		this.r *= color.r;
		this.g *= color.g;
		this.b *= color.b;

	},

	updateHex: function () {

		this.hex = Math.floor( this.a * 255 ) << 24 | Math.floor( this.r * 255 ) << 16 | Math.floor( this.g * 255 ) << 8 | Math.floor( this.b * 255 );

	},

	updateRGBA: function () {

		this.a = ( this.hex >> 24 & 255 ) / 255;
		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	updateStyleString: function () {

		this.__styleString = 'rgba(' + Math.floor( this.r * 255 ) + ',' + Math.floor( this.g * 255 ) + ',' + Math.floor( this.b * 255 ) + ',' + this.a + ')';

	},

	toString: function () {

		return 'THREE.Color ( r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', a: ' + this.a + ', hex: ' + this.hex + ' )';

	}

};
