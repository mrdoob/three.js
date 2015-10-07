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

		if ( ! forceClone && array.constructor === type ) return array;

		if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

			return new type( array );

		}

		var result = [];
		result.push.apply( result, array );
		return result;

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

	},

	// fuzz-free, array-based Quaternion SLERP operation
	slerp: function( dst, dstOffset, src, srcOffset0, srcOffset1, t ) {

		var x0 = src[   srcOffset0   ],
			y0 = src[ srcOffset0 + 1 ],
			z0 = src[ srcOffset0 + 2 ],
			w0 = src[ srcOffset0 + 3 ],

			x1 = src[   srcOffset1   ],
			y1 = src[ srcOffset1 + 1 ],
			z1 = src[ srcOffset1 + 2 ],
			w1 = src[ srcOffset1 + 3 ];

		if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

			var s = 1 - t,

				cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,

				dir = ( cos >= 0 ? 1 : -1 ),
				sqrSin = 1 - cos * cos;

			// Skip the Slerp for tiny steps to avoid numeric problems:
			if ( sqrSin > Number.EPSILON ) {

				var sin = Math.sqrt( sqrSin ),
					len = Math.atan2( sin, cos * dir );

				s = Math.sin( s * len ) / sin;
				t = Math.sin( t * len ) / sin;

			}

			var tDir = t * dir;

			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;

			// Normalize in case we just did a lerp:
			if ( s === 1 - t ) {

				var f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;

			}

		}

		dst[   dstOffset   ] = x0;
		dst[ dstOffset + 1 ] = y0;
		dst[ dstOffset + 2 ] = z0;
		dst[ dstOffset + 3 ] = w0;

	}

};
