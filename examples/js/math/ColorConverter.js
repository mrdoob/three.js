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
	}

};