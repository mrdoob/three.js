import {
	float, vec3,
	sinh, cosh, tanh, asinh, acosh, atanh,
	pow2, pow3, pow4, cbrt, lengthSq, difference,
	all, any, greaterThan
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Additional TSL math-function coverage that doesn't already live in
// TSLMath.tests.js: hyperbolic/inverse-hyperbolic functions, small
// power/root helper shorthands, and vector-to-scalar boolean reductions.
// Kept as a separate file (rather than appended to TSLMath.tests.js) to
// avoid colliding with other in-flight edits to that file.
//
// Every expected value below is derived independently (hand-computed or
// from plain JS Math), never by re-running the same TSL expression under
// test -- see TSLMath.tests.js's file header for why that matters
// (https://ben3d.ca/blog/the-rise-of-test-theater).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'math library (extra)', () => {

		gpuTest( 'hyperbolic and inverse hyperbolic functions', ( { assert } ) => {

			// sinh/cosh/tanh checked against their exponential-form definitions,
			// hand-computed in plain JS rather than re-deriving them from the
			// TSL expressions under test.
			assert.closeAbs( sinh( float( 0 ) ), float( 0 ), 1e-6, 'sinh(0)' );
			assert.closeAbs( sinh( float( 1 ) ), float( ( Math.E - 1 / Math.E ) / 2 ), 1e-4, 'sinh(1)' );
			assert.closeAbs( cosh( float( 0 ) ), float( 1 ), 1e-6, 'cosh(0)' );
			assert.closeAbs( cosh( float( 1 ) ), float( ( Math.E + 1 / Math.E ) / 2 ), 1e-4, 'cosh(1)' );
			assert.closeAbs( tanh( float( 0 ) ), float( 0 ), 1e-6, 'tanh(0)' );
			// tanh saturates hard for large |x| -- confirms it approaches +-1
			// rather than overflowing/diverging.
			assert.closeAbs( tanh( float( 20 ) ), float( 1 ), 1e-4, 'tanh(20) saturates to 1' );
			assert.closeAbs( tanh( float( -20 ) ), float( -1 ), 1e-4, 'tanh(-20) saturates to -1' );

			// Inverse hyperbolic functions are each checked against the same
			// independently hand-computed values used for the forward functions
			// above (not merely round-tripped through the TSL functions
			// themselves).
			assert.closeAbs( asinh( float( ( Math.E - 1 / Math.E ) / 2 ) ), float( 1 ), 1e-4, 'asinh(sinh(1)) == 1' );
			assert.closeAbs( acosh( float( ( Math.E + 1 / Math.E ) / 2 ) ), float( 1 ), 1e-4, 'acosh(cosh(1)) == 1' );
			assert.closeAbs( acosh( float( 1 ) ), float( 0 ), 1e-6, 'acosh(1) == 0 -- domain boundary' );
			assert.closeAbs( atanh( float( 0 ) ), float( 0 ), 1e-6, 'atanh(0)' );
			assert.closeAbs( atanh( float( 0.5 ) ), float( Math.log( 3 ) / 2 ), 1e-4, 'atanh(0.5) == 0.5*ln((1+x)/(1-x))' );

		} );

		gpuTest( 'power/root helpers and vector-reduction shorthands', ( { assert } ) => {

			// pow2/pow3/pow4 are plain repeated-multiplication shorthands --
			// checked against x*x, x*x*x, x*x*x*x computed independently in JS.
			assert.closeAbs( pow2( float( 3 ) ), float( 9 ), 1e-5, 'pow2(3) == 9' );
			assert.closeAbs( pow3( float( 3 ) ), float( 27 ), 1e-4, 'pow3(3) == 27' );
			assert.closeAbs( pow4( float( 3 ) ), float( 81 ), 1e-3, 'pow4(3) == 81' );
			assert.closeAbs( pow2( float( -2 ) ), float( 4 ), 1e-5, 'pow2(-2) == 4 -- sign vanishes for an even power' );

			// cbrt(x) == sign(x) * abs(x)^(1/3) -- explicitly handles negative
			// inputs, unlike a naive pow(x, 1/3) which is undefined for x < 0.
			assert.closeAbs( cbrt( float( 27 ) ), float( 3 ), 1e-4, 'cbrt(27) == 3' );
			assert.closeAbs( cbrt( float( -27 ) ), float( -3 ), 1e-4, 'cbrt(-27) == -3 -- negative inputs are supported, unlike plain pow(x, 1/3)' );
			assert.closeAbs( cbrt( float( 0 ) ), float( 0 ), 1e-6, 'cbrt(0) == 0' );

			// lengthSq(v) == dot(v,v), i.e. squared length without the sqrt --
			// checked against the same 3-4-5-style triangle used elsewhere in
			// this suite, so the expected value is independently known.
			assert.closeAbs( lengthSq( vec3( 3, 4, 0 ) ), float( 25 ), 1e-4, 'lengthSq(3,4,0) == 5^2 == 25' );

			// difference(a, b) == abs(a - b), verified with an asymmetric,
			// order-sensitive pair of vectors.
			assert.closeAbs( difference( vec3( 1, 5, -3 ), vec3( 4, 2, -3 ) ), vec3( 3, 3, 0 ), 1e-5, 'difference() is component-wise abs(a - b)' );

		} );

		gpuTest( 'all()/any() vector-to-scalar boolean reductions', ( { assert } ) => {

			// all()/any() return a bool -- cast to float(...) for comparison so
			// the harness doesn't need first-class bool support (0.0/1.0
			// following the usual GLSL/WGSL bool -> float cast convention).
			const allTrue = greaterThan( vec3( 1, 1, 1 ), vec3( 0, 0, 0 ) );
			const mixed = greaterThan( vec3( 1, -1, 1 ), vec3( 0, 0, 0 ) );
			const allFalse = greaterThan( vec3( -1, -1, -1 ), vec3( 0, 0, 0 ) );

			assert.eq( float( all( allTrue ) ), float( 1 ), 'all() is true when every component satisfies the condition' );
			assert.eq( float( all( mixed ) ), float( 0 ), 'all() is false as soon as one component fails' );
			assert.eq( float( any( mixed ) ), float( 1 ), 'any() is true when at least one component satisfies the condition' );
			assert.eq( float( any( allFalse ) ), float( 0 ), 'any() is false when no component satisfies the condition' );

		} );

	} );

} );
