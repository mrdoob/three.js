import { clamp } from '../math/MathUtils.js';

// Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf

const _tables = /*@__PURE__*/ _generateTables();

function _generateTables() {

	// float32 to float16 helpers

	const buffer = new ArrayBuffer( 4 );
	const floatView = new Float32Array( buffer );
	const uint32View = new Uint32Array( buffer );

	const baseTable = new Uint32Array( 512 );
	const shiftTable = new Uint32Array( 512 );

	for ( let i = 0; i < 256; ++ i ) {

		const e = i - 127;

		// very small number (0, -0)

		if ( e < - 27 ) {

			baseTable[ i ] = 0x0000;
			baseTable[ i | 0x100 ] = 0x8000;
			shiftTable[ i ] = 24;
			shiftTable[ i | 0x100 ] = 24;

			// small number (denorm)

		} else if ( e < - 14 ) {

			baseTable[ i ] = 0x0400 >> ( - e - 14 );
			baseTable[ i | 0x100 ] = ( 0x0400 >> ( - e - 14 ) ) | 0x8000;
			shiftTable[ i ] = - e - 1;
			shiftTable[ i | 0x100 ] = - e - 1;

			// normal number

		} else if ( e <= 15 ) {

			baseTable[ i ] = ( e + 15 ) << 10;
			baseTable[ i | 0x100 ] = ( ( e + 15 ) << 10 ) | 0x8000;
			shiftTable[ i ] = 13;
			shiftTable[ i | 0x100 ] = 13;

			// large number (Infinity, -Infinity)

		} else if ( e < 128 ) {

			baseTable[ i ] = 0x7c00;
			baseTable[ i | 0x100 ] = 0xfc00;
			shiftTable[ i ] = 24;
			shiftTable[ i | 0x100 ] = 24;

			// stay (NaN, Infinity, -Infinity)

		} else {

			baseTable[ i ] = 0x7c00;
			baseTable[ i | 0x100 ] = 0xfc00;
			shiftTable[ i ] = 13;
			shiftTable[ i | 0x100 ] = 13;

		}

	}

	// float16 to float32 helpers

	const mantissaTable = new Uint32Array( 2048 );
	const exponentTable = new Uint32Array( 64 );
	const offsetTable = new Uint32Array( 64 );

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

		mantissaTable[ i ] = m | e;

	}

	for ( let i = 1024; i < 2048; ++ i ) {

		mantissaTable[ i ] = 0x38000000 + ( ( i - 1024 ) << 13 );

	}

	for ( let i = 1; i < 31; ++ i ) {

		exponentTable[ i ] = i << 23;

	}

	exponentTable[ 31 ] = 0x47800000;
	exponentTable[ 32 ] = 0x80000000;

	for ( let i = 33; i < 63; ++ i ) {

		exponentTable[ i ] = 0x80000000 + ( ( i - 32 ) << 23 );

	}

	exponentTable[ 63 ] = 0xc7800000;

	for ( let i = 1; i < 64; ++ i ) {

		if ( i !== 32 ) {

			offsetTable[ i ] = 1024;

		}

	}

	return {
		floatView: floatView,
		uint32View: uint32View,
		baseTable: baseTable,
		shiftTable: shiftTable,
		mantissaTable: mantissaTable,
		exponentTable: exponentTable,
		offsetTable: offsetTable
	};

}

// float32 to float16

function toHalfFloat( val ) {

	if ( Math.abs( val ) > 65504 ) console.warn( 'THREE.DataUtils.toHalfFloat(): Value out of range.' );

	val = clamp( val, - 65504, 65504 );

	_tables.floatView[ 0 ] = val;
	const f = _tables.uint32View[ 0 ];
	const e = ( f >> 23 ) & 0x1ff;
	return _tables.baseTable[ e ] + ( ( f & 0x007fffff ) >> _tables.shiftTable[ e ] );

}

// float16 to float32

function fromHalfFloat( val ) {

	const m = val >> 10;
	_tables.uint32View[ 0 ] = _tables.mantissaTable[ _tables.offsetTable[ m ] + ( val & 0x3ff ) ] + _tables.exponentTable[ m ];
	return _tables.floatView[ 0 ];

}

// RGB9E5 packing/unpacking

const RGB9E5_MANTISSA_BITS = 9;
const RGB9E5_EXP_BIAS = 15;
const RGB9E5_MAX_VALID_BIASED_EXP = 31;

const MAX_RGB9E5_EXP = ( RGB9E5_MAX_VALID_BIASED_EXP - RGB9E5_EXP_BIAS );
const RGB9E5_MANTISSA_VALUES = ( 1 << RGB9E5_MANTISSA_BITS );
const MAX_RGB9E5_MANTISSA = ( RGB9E5_MANTISSA_VALUES - 1 );
const MAX_RGB9E5 = ( ( MAX_RGB9E5_MANTISSA ) / RGB9E5_MANTISSA_VALUES * ( 1 << MAX_RGB9E5_EXP ) );

function ClampRange_for_rgb9e5( x ) {

	if ( x > 0.0 ) {

		if ( x >= MAX_RGB9E5 ) {

			return MAX_RGB9E5;

		} else {

			return x;

		}

	} else {

		/* NaN gets here too since comparisons with NaN always fail! */
		return 0.0;

	}

}

function FloorLog2( x ) {

	return Math.floor( Math.log2( x ) );

}

// reference https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_shared_exponent.txt

function toRGB9E5( r, g, b, target ) {

	const rc = ClampRange_for_rgb9e5( r );
	const gc = ClampRange_for_rgb9e5( g );
	const bc = ClampRange_for_rgb9e5( b );

	const maxrgb = Math.max( rc, gc, bc );
	let exp_shared = Math.max( - RGB9E5_EXP_BIAS - 1, FloorLog2( maxrgb ) ) + 1 + RGB9E5_EXP_BIAS;

	let denom = Math.pow( 2, exp_shared - RGB9E5_EXP_BIAS - RGB9E5_MANTISSA_BITS );
	const maxm = Math.floor( maxrgb / denom + 0.5 );

	if ( maxm == MAX_RGB9E5_MANTISSA + 1 ) {

		denom *= 2;
		exp_shared += 1;

	}

	const rm = Math.floor( rc / denom + 0.5 );
	const gm = Math.floor( gc / denom + 0.5 );
	const bm = Math.floor( bc / denom + 0.5 );

	//

	target[ 0 ] = ( rm << 0 ) | ( gm << 9 ) | ( bm << 18 ) | ( exp_shared << 27 );

	return target;

}

function fromRGB9E5( val, target ) {

	const r = ( val[ 0 ] >> 0 ) & 0x1FF;
	const g = ( val[ 0 ] >> 9 ) & 0x1FF;
	const b = ( val[ 0 ] >> 18 ) & 0x1FF;
	const e = ( val[ 0 ] >> 27 ) & 0x01F;

	const exponent = e - RGB9E5_EXP_BIAS - RGB9E5_MANTISSA_BITS;
	const scale = Math.pow( 2, exponent );

	target[ 0 ] = r * scale;
	target[ 1 ] = g * scale;
	target[ 2 ] = b * scale;

	return target;

}

const DataUtils = {
	toHalfFloat: toHalfFloat,
	fromHalfFloat: fromHalfFloat,
	toRGB9E5: toRGB9E5,
	fromRGB9E5: fromRGB9E5
};

export {
	toHalfFloat,
	fromHalfFloat,
	toRGB9E5,
	fromRGB9E5,
	DataUtils
};
