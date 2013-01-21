/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ColorUtils = {

	adjustHSV: function() {

		var hsv = { h: 0, s: 0, v: 0 };

		return function ( color, h, s, v ) {
		
			color.getHSV( hsv );

			hsv.h = THREE.Math.clamp( hsv.h + h, 0, 1 );
			hsv.s = THREE.Math.clamp( hsv.s + s, 0, 1 );
			hsv.v = THREE.Math.clamp( hsv.v + v, 0, 1 );

			color.setHSV( hsv.h, hsv.s, hsv.v );

		};
	}()

};
