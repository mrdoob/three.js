/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MathUtils = {

	clamp: function ( x, a, b ) {

		return ( x < a ) ? a : ( ( x > b ) ? b : x );

	},

	mapLinear: function( x, sa, sb, ea, eb ) {

		return ( x  - sa ) * ( eb - ea ) / ( sb - sa ) + ea;

	}

};
