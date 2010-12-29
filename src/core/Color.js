/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	this.autoUpdate = true;
	this.setHex( hex );

};

THREE.Color.prototype = {

	setRGB: function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},

	setHex: function ( hex ) {

		this.hex = ( ~~ hex ) & 0xffffff;

		if ( this.autoUpdate ) {

			this.updateRGBA();
			this.updateStyleString();

		}

	},

	updateHex: function () {

		this.hex = ~~( this.r * 255 ) << 16 ^ ~~( this.g * 255 ) << 8 ^ ~~( this.b * 255 );

	},

	updateRGBA: function () {

		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	updateStyleString: function () {

		this.__styleString = 'rgb(' + ~~( this.r * 255 ) + ',' + ~~( this.g * 255 ) + ',' + ~~( this.b * 255 ) + ')';

	},

	clone: function () {

		return new THREE.Color( this.hex );

	},


	toString: function () {

		return 'THREE.Color ( r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', hex: ' + this.hex + ' )';

	}

};
