/**
 * @author tschw
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationUtils = {

	// same as Array.prototype.slice, but also works on typed arrays
	arraySlice: function( array, from, to ) {

		if ( array.slice === undefined ) {

			return new array.constructor( array.subarray( from, to ) );

		}

		return array.slice( from, to );

	},

	// converts an array to a specific type
	convertArray: function( array, type, forceClone ) {

		if ( ! array ||
				! forceClone && array.constructor === type ) return array;

		if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

			return new type( array );

		}

		var result = [];
		result.push.apply( result, array );
		return result;

	},

	isTypedArray: function( object ) {

		return ArrayBuffer.isView( object ) &&
				! ( object instanceof DataView );

	},

	// returns an array by which times and values can be sorted
	getKeyframeOrder: function( times ) {

		function compareTime( i, j ) {

			return times[ i ] - times[ j ];

		}

		var n = times.length;
		var result = new Array( n );
		for ( var i = 0; i !== n; ++ i ) result[ i ] = i;

		result.sort( compareTime );

		return result;

	},

	// uses the array previously returned by 'getKeyframeOrder' to sort data
	sortedArray: function( values, stride, order ) {

		var nValues = values.length;
		var result = new values.constructor( nValues );

		for ( var i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

			var srcOffset = order[ i ] * stride;

			for ( var j = 0; j !== stride; ++ j ) {

				result[ dstOffset ++ ] = values[ srcOffset + j ];

			}

		}

		return result;

	},

	// function for parsing AOS keyframe formats
	flattenJSON: function( jsonKeys, times, values, valuePropertyName ) {

		for ( var i = 0, n = jsonKeys.length; i !== n; ++ i ) {

			var key = jsonKeys[ i ];
			var value = key[ valuePropertyName ];

			if ( value === undefined ) continue;

			times.push( key[ 'time' ] );

			if ( value[ 'splice' ] !== undefined ) {

				values.push.apply( values, value );

			} else if ( value[ 'toArray' ] !== undefined ) {

				value.toArray( values, values.length );

			} else {

				values.push( value )

			}

		}

	}

};
