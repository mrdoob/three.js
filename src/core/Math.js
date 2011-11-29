/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Math = {

	clamp: function ( x, a, b ) {

		return ( x < a ) ? a : ( ( x > b ) ? b : x );

	},

	clampBottom: function ( x, a ) {

		return x < a ? a : x;

	},

	mapLinear: function( x, a1, a2, b1, b2 ) {

		return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

	},

	// Get 16 bits of randomness
	// (standard Math.random() creates repetitive patterns when applied over larger space)

	random16: function() {

		return ( 65280 * Math.random() + 255 * Math.random() ) / 65535;

	}

};
