const _floatView = new Float32Array( 1 );
const _int32View = new Int32Array( _floatView.buffer );

class DataUtils {

	// Converts float32 to float16 (stored as uint16 value).

	static toHalfFloat( val ) {

		if ( val > 65504 ) {

			console.warn( 'THREE.DataUtils.toHalfFloat(): value exceeds 65504.' );

			val = 65504; // maximum representable value in float16

		}

		// Source: http://gamedev.stackexchange.com/questions/17326/conversion-of-a-number-from-single-precision-floating-point-representation-to-a/17410#17410

		/* This method is faster than the OpenEXR implementation (very often
		* used, eg. in Ogre), with the additional benefit of rounding, inspired
		* by James Tursa?s half-precision code. */

		_floatView[ 0 ] = val;
		const x = _int32View[ 0 ];

		let bits = ( x >> 16 ) & 0x8000; /* Get the sign */
		let m = ( x >> 12 ) & 0x07ff; /* Keep one extra bit for rounding */
		const e = ( x >> 23 ) & 0xff; /* Using int is faster here */

		/* If zero, or denormal, or exponent underflows too much for a denormal
			* half, return signed zero. */
		if ( e < 103 ) return bits;

		/* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
		if ( e > 142 ) {

			bits |= 0x7c00;
			/* If exponent was 0xff and one mantissa bit was set, it means NaN,
						* not Inf, so make sure we set one mantissa bit too. */
			bits |= ( ( e == 255 ) ? 0 : 1 ) && ( x & 0x007fffff );
			return bits;

		}

		/* If exponent underflows but not too much, return a denormal */
		if ( e < 113 ) {

			m |= 0x0800;
			/* Extra rounding may overflow and set mantissa to 0 and exponent
				* to 1, which is OK. */
			bits |= ( m >> ( 114 - e ) ) + ( ( m >> ( 113 - e ) ) & 1 );
			return bits;

		}

		bits |= ( ( e - 112 ) << 10 ) | ( m >> 1 );
		/* Extra rounding. An overflow will set mantissa to 0 and increment
			* the exponent, which is OK. */
		bits += m & 1;
		return bits;

	}

}

export { DataUtils };
