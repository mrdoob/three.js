import {
	int, uint, ivec4, uvec4,
	bitAnd, shiftRight
} from 'three/tsl';
import {
	dot4I8Packed, dot4U8Packed,
	pack4xI8, pack4xI8Clamp, pack4xU8, pack4xU8Clamp,
	unpack4xI8, unpack4xU8
} from '../../../../examples/jsm/tsl/math/Packed4x8IntegerNode.js';
import { gpuTest } from './gpu-test-utils.js';

const LANGUAGE_FEATURE = 'packed_4x8_integer_dot_product';
const hasLanguageFeature = navigator.gpu?.wgslLanguageFeatures?.has( LANGUAGE_FEATURE ) === true;

function packed4x8Test( name, buildFn ) {

	if ( hasLanguageFeature ) {

		gpuTest( name, buildFn, { backends: [ 'webgpu' ] } );

	} else {

		QUnit.test( name, ( assert ) => {

			assert.ok( true, `SKIPPED: WGSL language feature "${LANGUAGE_FEATURE}" is not available.` );

		} );

	}

}

function byte( value, offset ) {

	return bitAnd( shiftRight( value, uint( offset ) ), uint( 0xff ) );

}

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'packed 4x8 integer operations', () => {

		packed4x8Test( 'packed integer dot products', ( { assert } ) => {

			assert.eq(
				dot4U8Packed( uint( 0x01020304 ), uint( 0x02040405 ) ),
				uint( 42 ),
				'dot4U8Packed matches the WGSL specification example'
			);

			const signedA = pack4xI8( ivec4( 1, - 1, 2, - 2 ) );
			const signedB = pack4xI8( ivec4( 3, 4, - 1, - 1 ) );

			assert.eq(
				dot4I8Packed( signedA, signedB ),
				int( - 1 ),
				'dot4I8Packed sign-extends each packed byte'
			);

		} );

		packed4x8Test( 'pack4xU8 and pack4xI8 bit layout', ( { assert } ) => {

			const packedUnsigned = pack4xU8( uvec4( 1, 2, 3, 4 ) );

			assert.eq( byte( packedUnsigned, 0 ), uint( 1 ), 'pack4xU8 stores x in bits 0..7' );
			assert.eq( byte( packedUnsigned, 8 ), uint( 2 ), 'pack4xU8 stores y in bits 8..15' );
			assert.eq( byte( packedUnsigned, 16 ), uint( 3 ), 'pack4xU8 stores z in bits 16..23' );
			assert.eq( byte( packedUnsigned, 24 ), uint( 4 ), 'pack4xU8 stores w in bits 24..31' );

			const packedSigned = pack4xI8( ivec4( - 1, - 2, 127, - 128 ) );

			assert.eq( byte( packedSigned, 0 ), uint( 0xff ), 'pack4xI8 stores the two\'s-complement x byte' );
			assert.eq( byte( packedSigned, 8 ), uint( 0xfe ), 'pack4xI8 stores the two\'s-complement y byte' );
			assert.eq( byte( packedSigned, 16 ), uint( 0x7f ), 'pack4xI8 stores the positive z byte' );
			assert.eq( byte( packedSigned, 24 ), uint( 0x80 ), 'pack4xI8 stores the negative w byte' );

		} );

		packed4x8Test( 'pack4xU8Clamp and pack4xI8Clamp ranges', ( { assert } ) => {

			const packedUnsigned = pack4xU8Clamp( uvec4( 0, 256, 1000, 255 ) );

			assert.eq( byte( packedUnsigned, 0 ), uint( 0 ), 'pack4xU8Clamp preserves zero' );
			assert.eq( byte( packedUnsigned, 8 ), uint( 255 ), 'pack4xU8Clamp clamps 256' );
			assert.eq( byte( packedUnsigned, 16 ), uint( 255 ), 'pack4xU8Clamp clamps larger values' );
			assert.eq( byte( packedUnsigned, 24 ), uint( 255 ), 'pack4xU8Clamp preserves 255' );

			const packedSigned = pack4xI8Clamp( ivec4( 200, - 200, 127, - 128 ) );

			assert.eq( byte( packedSigned, 0 ), uint( 0x7f ), 'pack4xI8Clamp clamps above 127' );
			assert.eq( byte( packedSigned, 8 ), uint( 0x80 ), 'pack4xI8Clamp clamps below -128' );
			assert.eq( byte( packedSigned, 16 ), uint( 0x7f ), 'pack4xI8Clamp preserves 127' );
			assert.eq( byte( packedSigned, 24 ), uint( 0x80 ), 'pack4xI8Clamp preserves -128' );

		} );

		packed4x8Test( 'unpack4xU8 and unpack4xI8 extension', ( { assert } ) => {

			assert.eq(
				unpack4xU8( uint( 0x04030201 ) ),
				uvec4( 1, 2, 3, 4 ),
				'unpack4xU8 zero-extends all four bytes'
			);

			assert.eq(
				unpack4xI8( uint( 0x807ffeff ) ),
				ivec4( - 1, - 2, 127, - 128 ),
				'unpack4xI8 sign-extends all four bytes'
			);

		} );

	} );

} );
