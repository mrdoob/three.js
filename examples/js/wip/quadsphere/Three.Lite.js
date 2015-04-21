var THREE = {
	Math: {
		// Clamp value to range <a, b>

		clamp: function ( x, a, b ) {

			return ( x < a ) ? a : ( ( x > b ) ? b : x );

		}
	}
};