/**
 * @author bhouston / http://exocortex.com/
 * @author zz85 / http://github.com/zz85
 */

THREE.ColorConverter = {

	setHSV: function ( color, h, s, v ) {

		// https://gist.github.com/xpansive/1337890#file-index-js
		return color.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );

	},

	getHSV: function( color ) {

		var hsl = color.getHSL();

		// based on https://gist.github.com/xpansive/1337890#file-index-js
		hsl.s *= ( hsl.l < 0.5 ) ? hsl.l : ( 1 - hsl.l );

		return {
			h: hsl.h,
			s: 2 * hsl.s / ( hsl.l + hsl.s ),
			v: hsl.l + hsl.s
		};
	},

	// where c, m, y, k is between 0 and 1
	
	setCMYK: function ( color, c, m, y, k ) {

		var r = ( 1 - c ) * ( 1 - k );
		var g = ( 1 - m ) * ( 1 - k );
		var b = ( 1 - y ) * ( 1 - k );

		return color.setRGB( r, g, b );

	},

	getCMYK: function ( color ) {

		var r = color.r;
		var g = color.g;
		var b = color.b;
		var k = 1 - Math.max(r, g, b);
		var c = ( 1 - r - k ) / ( 1 - k );
		var m = ( 1 - g - k ) / ( 1 - k );
		var y = ( 1 - b - k ) / ( 1 - k );

		return {
			c: c, m: m, y: y, k: k
		};

	}


};