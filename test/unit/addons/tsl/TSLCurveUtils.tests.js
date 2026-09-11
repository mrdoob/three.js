import {
	float,
	parabola,
	oscSine, oscSquare, oscTriangle, oscSawtooth,
	floatBitsToInt, floatBitsToUint, intBitsToFloat, uintBitsToFloat,
	int, uint
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for standalone TSL "curve"/remap-shape helpers not already covered
// by TSLGainPcurve.tests.js/TSLSinc.tests.js/TSLRotate.tests.js
// (src/nodes/math/MathUtils.js, src/nodes/utils/RotateNode.js), timer-driven
// oscillators (src/nodes/utils/Oscillators.js), and bit-reinterpretation
// casts (src/nodes/math/BitcastNode.js). Every expected value below is
// derived independently (hand-computed from each function's own documented
// formula, or from plain JS Math), never by re-running the same TSL
// expression under test -- see TSLMath.tests.js's file header for why that
// matters (https://ben3d.ca/blog/the-rise-of-test-theater).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'curve/remap-shape helpers', () => {

		gpuTest( 'parabola() maps [0,1] corners to 0 and the center to 1', ( { assert } ) => {

			// parabola(x, k) == (4*x*(1-x))^k -- from the function's own doc
			// comment/formula, computed independently in JS.
			assert.closeAbs( parabola( float( 0 ), float( 1 ) ), float( 0 ), 1e-5, 'parabola(0, 1) == 0 -- left corner' );
			assert.closeAbs( parabola( float( 1 ), float( 1 ) ), float( 0 ), 1e-5, 'parabola(1, 1) == 0 -- right corner' );
			assert.closeAbs( parabola( float( 0.5 ), float( 1 ) ), float( 1 ), 1e-5, 'parabola(0.5, 1) == 1 -- center' );

			// k=2 squares the parabola's shape: parabola(0.5, k) is always 1
			// (1^k == 1), but a non-center point should differ from the k=1 case.
			const p25k1 = Math.pow( 4 * 0.25 * ( 1 - 0.25 ), 1 );
			const p25k2 = Math.pow( 4 * 0.25 * ( 1 - 0.25 ), 2 );
			assert.closeAbs( parabola( float( 0.25 ), float( 1 ) ), float( p25k1 ), 1e-5, 'parabola(0.25, 1) matches the hand-computed formula' );
			assert.closeAbs( parabola( float( 0.25 ), float( 2 ) ), float( p25k2 ), 1e-5, 'parabola(0.25, 2) matches the hand-computed formula (different from k=1)' );

		} );

	} );

	QUnit.module( 'timer-driven oscillators', () => {

		gpuTest( 'oscSine/oscSquare/oscTriangle/oscSawtooth at known phases', ( { assert } ) => {

			// Every oscillator here is fed an explicit `t`, never the default
			// (real-time) timer -- that keeps every expected value a pure,
			// independently hand-computed function of t.

			// oscSine(t) == 0.5*sin(2*PI*(t+0.75)) + 0.5 -- the +0.75 phase
			// offset puts the trough at t=0 and the peak at t=0.5 (not the
			// t=0.25/t=0.75 a naive sin() phase might suggest).
			assert.closeAbs( oscSine( float( 0 ) ), float( 0.5 * Math.sin( 2 * Math.PI * 0.75 ) + 0.5 ), 1e-4, 'oscSine(0)' );
			assert.closeAbs( oscSine( float( 0.5 ) ), float( 1 ), 1e-4, 'oscSine(0.5) reaches its peak of 1' );
			assert.closeAbs( oscSine( float( 0 ) ), float( 0 ), 1e-4, 'oscSine(0) reaches its trough of 0' );

			// oscSquare(t) == round(fract(t)) -- 0 for the first half of each
			// unit period, 1 for the second half.
			assert.eq( oscSquare( float( 0.2 ) ), float( 0 ), 'oscSquare(0.2) is in the low half' );
			assert.eq( oscSquare( float( 0.8 ) ), float( 1 ), 'oscSquare(0.8) is in the high half' );
			assert.eq( oscSquare( float( 1.2 ) ), float( 0 ), 'oscSquare(1.2) repeats the low half of the next period' );

			// oscTriangle(t) == abs(2*fract(t+0.5)-1) -- 0 at integer t, 1 at
			// the half-integer point, ramping linearly between.
			assert.closeAbs( oscTriangle( float( 0 ) ), float( 0 ), 1e-5, 'oscTriangle(0) is at its trough' );
			assert.closeAbs( oscTriangle( float( 0.5 ) ), float( 1 ), 1e-5, 'oscTriangle(0.5) is at its peak' );
			assert.closeAbs( oscTriangle( float( 0.25 ) ), float( 0.5 ), 1e-4, 'oscTriangle(0.25) is exactly midway up the ramp' );

			// oscSawtooth(t) == fract(t) -- a plain linear ramp per period.
			assert.closeAbs( oscSawtooth( float( 0.3 ) ), float( 0.3 ), 1e-5, 'oscSawtooth(0.3) == 0.3' );
			assert.closeAbs( oscSawtooth( float( 1.3 ) ), float( 0.3 ), 1e-5, 'oscSawtooth(1.3) wraps back to 0.3' );

		} );

	} );

	QUnit.module( 'bit-reinterpretation casts', () => {

		gpuTest( 'floatBitsToInt/floatBitsToUint/intBitsToFloat/uintBitsToFloat round trip and match IEEE-754 bit patterns', ( { assert } ) => {

			// 1.0f's IEEE-754 bit pattern is the well-known constant
			// 0x3F800000 == 1065353216 -- an independently known fact about
			// float encoding, not something derived from the node under test.
			assert.eq( floatBitsToInt( float( 1.0 ) ), int( 1065353216 ), 'floatBitsToInt(1.0) == 0x3F800000' );
			assert.eq( floatBitsToUint( float( 1.0 ) ), uint( 1065353216 ), 'floatBitsToUint(1.0) == 0x3F800000' );

			// -2.0f's bit pattern is 0xC0000000, which as a signed 32-bit int
			// is -1073741824 (sign bit set) -- again, an independently known
			// IEEE-754 fact.
			assert.eq( floatBitsToInt( float( -2.0 ) ), int( -1073741824 ), 'floatBitsToInt(-2.0) == 0xC0000000 (signed)' );

			// Round trips: reinterpreting bits out and back must recover the
			// exact original value (bit-reinterpretation is lossless, unlike a
			// numeric cast).
			assert.eq( intBitsToFloat( floatBitsToInt( float( 3.140625 ) ) ), float( 3.140625 ), 'int bit round trip recovers the exact float' );
			assert.eq( uintBitsToFloat( floatBitsToUint( float( -7.5 ) ) ), float( -7.5 ), 'uint bit round trip recovers the exact float' );

		} );

	} );

} );
