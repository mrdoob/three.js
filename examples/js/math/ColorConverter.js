/**
 * @author bhouston / http://exocortex.com/
 */

THREE.ColorConverter = function () {

	return this;

};

// these are all static functions that we are extending ColorConverter directly rather than its prorotype.
THREE.ColorConverter.fromRGB = function ( color, r, g, b ) {

	return color.setRGB( r, g, b );

};

THREE.ColorConverter.fromHex = function ( color, hex ) {

	return color.setHex( hex );

};

THREE.ColorConverter.toHex = function ( color ) {

	return color.getHex();

};
 
THREE.ColorConverter.toHexString = function ( color ) {

	return color.getHexString( color );

};

THREE.ColorConverter.fromHSL = function ( color, h, s, l ) {

	return color.setHSL( h, s, l );
};

THREE.ColorConverter.toHSL = function ( color ) {

	return color.getHSL( color );

};

THREE.ColorConverter.fromHSV = function ( color, h, s, v ) {

	return color.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 ); // https://gist.github.com/xpansive/1337890#file-index-js

};

THREE.ColorConverter.toHSV = function () { // based on https://gist.github.com/xpansive/1337890#file-index-js

	var hsv = { h: 0, s: 0, v: 0 };

	return function( color ) {

		var hsl = color.getHSL();

		hsl.s *= ( hsl.l < 0.5 ) ? hsl.l : ( 1 - hsl.l );

		hsv.h = hsl.h;
		hsv.s = 2 * hsl.s / ( hsl.l + hsl.s );
		hsv.v = hsl.l + hsl.s;
		
		return hsv;
		
	}
}();

THREE.ColorConverter.fromStyle = function ( color, style ) {

	return color.setStyle( style );

};

THREE.ColorConverter.toStyle = function ( color ) {

	return color.getStyle( color );

};
