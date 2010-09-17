/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	/*
	this.r; this.g; this.b; this.a;
	this.hex;
	this.__styleString = 'rgba(0, 0, 0, 1)';
	*/
  
  this.setHex( hex );
  
}

THREE.Color.prototype = {

  setHex: function ( hex ) {

		this.hex = hex;
		this.updateRGBA();
		this.updateStyleString();

	},

	setRGBA: function ( r, g, b, a ) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		this.updateHex();
		this.updateStyleString();

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
