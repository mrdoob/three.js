import { float, int, uint, ivec4, uvec4, bitcast, countLeadingZeros, countOneBits, countTrailingZeros, inversesqrt } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for the generic bitcast() constructor (src/nodes/math/BitcastNode.js
// -- distinct from the already-covered floatBitsToInt()/uintBitsToFloat()/etc.
// convenience wrappers in TSLCurveUtils.tests.js, which are themselves thin
// calls to this same node) and the 32-bit population/leading/trailing-zero
// count helpers (src/nodes/math/BitcountNode.js), plus inversesqrt().
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'bitcast()', () => {

		gpuTest( 'bitcast() reinterprets bits between int and float per known IEEE-754 patterns', ( { assert } ) => {

			// Same well-known IEEE-754 fact used in TSLCurveUtils.tests.js's
			// floatBitsToInt() coverage: 1.0f's bit pattern is 0x3F800000 ==
			// 1065353216.
			assert.eq( bitcast( float( 1.0 ), 'int' ), int( 1065353216 ), 'bitcast(1.0, "int") == 0x3F800000' );
			assert.eq( bitcast( int( 1065353216 ), 'float' ), float( 1.0 ), 'bitcast(0x3F800000, "float") == 1.0' );

			// Round trip: bitcast is lossless reinterpretation, so converting
			// out and back must recover the exact original bits.
			assert.eq( bitcast( bitcast( float( 3.140625 ), 'int' ), 'float' ), float( 3.140625 ), 'bitcast round trip recovers the exact float' );

		} );

		gpuTest( 'bitcast() reinterprets bits between ivec4 and uvec4', ( { assert } ) => {

			// Each component's two's-complement bit pattern read as unsigned:
			// -1 -> 0xFFFFFFFF, -2 -> 0xFFFFFFFE, positive values unchanged.
			assert.eq(
				bitcast( ivec4( - 1, 1, 2, - 2 ), 'uvec4' ),
				uvec4( 4294967295, 1, 2, 4294967294 ),
				'bitcast(ivec4, "uvec4") reinterprets each component'
			);

			// Round trip: bitcast is lossless reinterpretation, so converting
			// out and back must recover the exact original vector.
			assert.eq(
				bitcast( bitcast( ivec4( - 1, 1, 2, - 2 ), 'uvec4' ), 'ivec4' ),
				ivec4( - 1, 1, 2, - 2 ),
				'bitcast round trip recovers the exact ivec4'
			);

		} );

	} );

	QUnit.module( 'bit counting', () => {

		gpuTest( 'countOneBits() matches a hand-computed popcount', ( { assert } ) => {

			// popcount, computed independently in plain JS (not via any
			// bit-counting builtin) for a handful of known bit patterns.
			const popcount = ( x ) => {

				let n = 0;
				while ( x !== 0 ) { n += x & 1; x >>>= 1; }
				return n;

			};

			assert.eq( countOneBits( uint( 0 ) ), uint( popcount( 0 ) ), 'countOneBits(0) == 0' );
			assert.eq( countOneBits( uint( 0xF0 ) ), uint( popcount( 0xF0 ) ), 'countOneBits(0xF0) == 4' );
			assert.eq( countOneBits( uint( 0xFFFFFFFF ) ), uint( popcount( 0xFFFFFFFF ) ), 'countOneBits(0xFFFFFFFF) == 32' );

		} );

		gpuTest( 'countLeadingZeros() matches Math.clz32() for known bit patterns', ( { assert } ) => {

			// JS's own Math.clz32() counts leading zero bits in the 32-bit
			// representation of its argument -- exactly the definition
			// countLeadingZeros() implements for a uint, so it's usable
			// directly as the independent reference here (not re-running
			// the TSL node under test).
			assert.eq( countLeadingZeros( uint( 0 ) ), uint( Math.clz32( 0 ) ), 'countLeadingZeros(0) == 32' );
			assert.eq( countLeadingZeros( uint( 1 ) ), uint( Math.clz32( 1 ) ), 'countLeadingZeros(1) == 31' );
			assert.eq( countLeadingZeros( uint( 0xF0 ) ), uint( Math.clz32( 0xF0 ) ), 'countLeadingZeros(0xF0) == 24' );
			assert.eq( countLeadingZeros( uint( 0xFFFFFFFF ) ), uint( Math.clz32( 0xFFFFFFFF ) ), 'countLeadingZeros(0xFFFFFFFF) == 0' );

		} );

		gpuTest( 'countTrailingZeros() matches a hand-computed trailing-zero count', ( { assert } ) => {

			// Computed independently in plain JS: the position of the
			// lowest set bit, or 32 if there is none -- matching
			// countLeadingZeros(0)'s own "no bits set, count all 32"
			// convention (see BitcountNode.js's WebGL polyfill, which
			// explicitly special-cases zero the same way for both
			// functions).
			const ctz = ( x ) => {

				if ( x === 0 ) return 32;
				let n = 0;
				while ( ( x & 1 ) === 0 ) { n ++; x >>>= 1; }
				return n;

			};

			assert.eq( countTrailingZeros( uint( 0 ) ), uint( ctz( 0 ) ), 'countTrailingZeros(0) == 32' );
			assert.eq( countTrailingZeros( uint( 8 ) ), uint( ctz( 8 ) ), 'countTrailingZeros(8) == 3' );
			assert.eq( countTrailingZeros( uint( 0xF0 ) ), uint( ctz( 0xF0 ) ), 'countTrailingZeros(0xF0) == 4' );
			assert.eq( countTrailingZeros( uint( 1 ) ), uint( ctz( 1 ) ), 'countTrailingZeros(1) == 0' );

		} );

	} );

	QUnit.module( 'inversesqrt()', () => {

		gpuTest( 'inversesqrt() is 1/sqrt(x)', ( { assert } ) => {

			assert.closeAbs( inversesqrt( float( 4 ) ), float( 1 / Math.sqrt( 4 ) ), 1e-5, 'inversesqrt(4) == 0.5' );
			assert.closeAbs( inversesqrt( float( 1 ) ), float( 1 ), 1e-5, 'inversesqrt(1) == 1' );
			assert.closeAbs( inversesqrt( float( 0.25 ) ), float( 1 / Math.sqrt( 0.25 ) ), 1e-4, 'inversesqrt(0.25) == 2' );

		} );

	} );

} );
