import { clamp } from '../math/MathUtils.js';

// Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf

class DataUtils {

	// float32 to float16

	static toHalfFloat( val ) {

		if ( ! this._floatView ) this._generateTables();

		if ( Math.abs( val ) > 65504 ) console.warn( 'THREE.DataUtils.toHalfFloat(): Value out of range.' );

		val = clamp( val, - 65504, 65504 );

		this._floatView[ 0 ] = val;
		const f = this._uint32View[ 0 ];
		const e = ( f >> 23 ) & 0x1ff;
		return this._baseTable[ e ] + ( ( f & 0x007fffff ) >> this._shiftTable[ e ] );

	}

	// float16 to float32

	static fromHalfFloat( val ) {

		if ( ! this._floatView ) this._generateTables();

		const m = val >> 10;
		this._uint32View[ 0 ] = this._mantissaTable[ this._offsetTable[ m ] + ( val & 0x3ff ) ] + this._exponentTable[ m ];
		return this._floatView[ 0 ];

	}

	static _generateTables() {

		// float32 to float16 helpers

		const _buffer = new ArrayBuffer( 4 );

		this._floatView = new Float32Array( _buffer );
		this._uint32View = new Uint32Array( _buffer );

		this._baseTable = new Uint32Array( 512 );
		this._shiftTable = new Uint32Array( 512 );

		for ( let i = 0; i < 256; ++ i ) {

			const e = i - 127;

			// very small number (0, -0)

			if ( e < - 27 ) {

				this._baseTable[ i ] = 0x0000;
				this._baseTable[ i | 0x100 ] = 0x8000;
				this._shiftTable[ i ] = 24;
				this._shiftTable[ i | 0x100 ] = 24;

				// small number (denorm)

			} else if ( e < - 14 ) {

				this._baseTable[ i ] = 0x0400 >> ( - e - 14 );
				this._baseTable[ i | 0x100 ] = ( 0x0400 >> ( - e - 14 ) ) | 0x8000;
				this._shiftTable[ i ] = - e - 1;
				this._shiftTable[ i | 0x100 ] = - e - 1;

				// normal number

			} else if ( e <= 15 ) {

				this._baseTable[ i ] = ( e + 15 ) << 10;
				this._baseTable[ i | 0x100 ] = ( ( e + 15 ) << 10 ) | 0x8000;
				this._shiftTable[ i ] = 13;
				this._shiftTable[ i | 0x100 ] = 13;

				// large number (Infinity, -Infinity)

			} else if ( e < 128 ) {

				this._baseTable[ i ] = 0x7c00;
				this._baseTable[ i | 0x100 ] = 0xfc00;
				this._shiftTable[ i ] = 24;
				this._shiftTable[ i | 0x100 ] = 24;

				// stay (NaN, Infinity, -Infinity)

			} else {

				this._baseTable[ i ] = 0x7c00;
				this._baseTable[ i | 0x100 ] = 0xfc00;
				this._shiftTable[ i ] = 13;
				this._shiftTable[ i | 0x100 ] = 13;

			}

		}

		// float16 to float32 helpers

		this._mantissaTable = new Uint32Array( 2048 );
		this._exponentTable = new Uint32Array( 64 );
		this._offsetTable = new Uint32Array( 64 );

		for ( let i = 1; i < 1024; ++ i ) {

			let m = i << 13; // zero pad mantissa bits
			let e = 0; // zero exponent

			// normalized
			while ( ( m & 0x00800000 ) === 0 ) {

				m <<= 1;
				e -= 0x00800000; // decrement exponent

			}

			m &= ~ 0x00800000; // clear leading 1 bit
			e += 0x38800000; // adjust bias

			this._mantissaTable[ i ] = m | e;

		}

		for ( let i = 1024; i < 2048; ++ i ) {

			this._mantissaTable[ i ] = 0x38000000 + ( ( i - 1024 ) << 13 );

		}

		for ( let i = 1; i < 31; ++ i ) {

			this._exponentTable[ i ] = i << 23;

		}

		this._exponentTable[ 31 ] = 0x47800000;
		this._exponentTable[ 32 ] = 0x80000000;

		for ( let i = 33; i < 63; ++ i ) {

			this._exponentTable[ i ] = 0x80000000 + ( ( i - 32 ) << 23 );

		}

		this._exponentTable[ 63 ] = 0xc7800000;

		for ( let i = 1; i < 64; ++ i ) {

			if ( i !== 32 ) {

				this._offsetTable[ i ] = 1024;

			}

		}

	}

}

export { DataUtils };
