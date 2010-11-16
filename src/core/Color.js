/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

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

		this.hex = ( ( hex = ~~ hex ) & 0xffffff ) == hex ? 0xff << 24 ^ hex : hex;

		if ( this.autoUpdate ) {

			this.updateRGBA();
			this.updateStyleString();

		}

	},

	updateHex: function () {

		this.hex = ~~( this.a * 255 ) << 24 ^ ~~( this.r * 255 ) << 16 ^ ~~( this.g * 255 ) << 8 ^ ~~( this.b * 255 );

	},

	updateRGBA: function () {

		this.a = ( this.hex >> 24 & 255 ) / 255;
		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	updateStyleString: function () {

		this.__styleString = 'rgba(' + ~~( this.r * 255 ) + ',' + ~~( this.g * 255 ) + ',' + ~~( this.b * 255 ) + ',' + this.a + ')';

	},

	toString: function () {

		return 'THREE.Color ( r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', a: ' + this.a + ', hex: ' + this.hex + ' )';

	}

};
