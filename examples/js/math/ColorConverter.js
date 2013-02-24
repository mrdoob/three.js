/**
 * @author bhouston / http://exocortex.com/
 */

THREE.ColorConverter = {

	fromRGB: function ( color, r, g, b ) {

		return color.setRGB( r, g, b );

	},

	fromHex: function ( color, hex ) {

		return color.setHex( hex );

	},

	toHex: function ( color ) {

		return color.getHex();

	},
	 
	toHexString: function ( color ) {

		return color.getHexString( color );

	},

	fromHSL: function ( color, h, s, l ) {

		return color.setHSL( h, s, l );
	},

	toHSL: function ( color ) {

		return color.getHSL( color );

	},

	fromHSV: function ( color, h, s, v ) {

		// https://gist.github.com/xpansive/1337890#file-index-js
		return color.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );

	},

	toHSV: function( color ) {

		var hsl = color.getHSL();

		// based on https://gist.github.com/xpansive/1337890#file-index-js
		hsl.s *= ( hsl.l < 0.5 ) ? hsl.l : ( 1 - hsl.l );

		return {
			h: hsl.h,
			s: 2 * hsl.s / ( hsl.l + hsl.s ),
			v: hsl.l + hsl.s
		};
		
	},

	fromStyle: function ( color, style ) {

		return color.setStyle( style );

	},

	toStyle: function ( color ) {

		return color.getStyle( color );

	}

};