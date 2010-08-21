/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	/*
	this.r; this.g; this.b; this.a;
	this.hex;
	*/

	this.__styleString = 'rgba(0, 0, 0, 1)';

	this.setHex = function ( hex ) {

		this.hex = hex;
		this.updateRGBA();
		this.updateStyleString();

	};

	this.setRGBA = function ( r, g, b, a ) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		this.updateHex();
		this.updateStyleString();

	};

	this.updateHex = function () {

		this.hex = Math.floor( this.a * 255 ) << 24 | Math.floor( this.r * 255 ) << 16 | Math.floor( this.g * 255 ) << 8 | Math.floor( this.b * 255 );

	};

	this.updateRGBA = function () {

		this.a = ( this.hex >> 24 & 0xff ) / 0xff;
		this.r = ( this.hex >> 16 & 0xff ) / 0xff;
		this.g = ( this.hex >> 8 & 0xff ) / 0xff;
		this.b = ( this.hex & 0xff ) / 0xff;

	};

	this.updateStyleString = function () {

		this.__styleString = 'rgba(' + Math.floor( this.r * 255 ) + ',' + Math.floor( this.g * 255 ) + ',' + Math.floor( this.b * 255 ) + ',' + this.a + ')';

	};

	this.toString = function () {

		return 'THREE.Color ( r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', a: ' + this.a + ', hex: ' + this.hex + ' )';

	};

	this.setHex( hex );

};
