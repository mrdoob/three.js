// http://stackoverflow.com/questions/1669190/javascript-min-max-array-values/13440842#13440842

function arrayMin( array ) {

	var length = array.length, min = Infinity;

	while ( length -- ) {

		if ( array[ length ] < min ) {

			min = array[ length ];

		}

	}

	return min;

}

function arrayMax( array ) {

	var length = array.length, max = - Infinity;

	while ( length -- ) {

		if ( array[ length ] > max ) {

			max = array[ length ];

		}

	}

	return max;

}

export { arrayMin, arrayMax };
