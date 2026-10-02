import {
	float, int, uint,
	abs, sign, floor, ceil, round, trunc, fract,
	sin, cos, tan, asin, acos, atan,
	exp, exp2, log, log2, sqrt, inverseSqrt, pow,
	min, max, clamp, saturate, mix, step, smoothstep,
	mod, reciprocal,
	degrees, radians,
	PI, HALF_PI, TWO_PI
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Core TSL math-function coverage. Every expected value below is derived
// independently (hand-computed or from plain JS Math), never by re-running
// the same TSL expression under test -- so these can't degrade into "test
// theater" (https://ben3d.ca/blog/the-rise-of-test-theater), assertions that
// always pass because they only check a function agrees with itself.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'math library', () => {

		gpuTest( 'trigonometric functions at known angles', ( { assert } ) => {

			assert.closeAbs( sin( float( 0 ) ), float( 0 ), 1e-6, 'sin(0)' );
			assert.closeAbs( sin( float( Math.PI / 2 ) ), float( 1 ), 1e-6, 'sin(PI/2)' );
			assert.closeAbs( sin( float( Math.PI ) ), float( 0 ), 1e-5, 'sin(PI)' );
			assert.closeAbs( cos( float( 0 ) ), float( 1 ), 1e-6, 'cos(0)' );
			assert.closeAbs( cos( float( Math.PI ) ), float( -1 ), 1e-6, 'cos(PI)' );
			assert.closeAbs( cos( float( Math.PI / 3 ) ), float( 0.5 ), 1e-5, 'cos(PI/3)' );
			assert.closeAbs( tan( float( Math.PI / 4 ) ), float( 1 ), 1e-5, 'tan(PI/4)' );
			assert.closeAbs( tan( float( 0 ) ), float( 0 ), 1e-6, 'tan(0)' );

		} );

		gpuTest( 'inverse trigonometric functions at domain boundaries', ( { assert } ) => {

			// asin/acos are only defined for |x| <= 1 -- testing exactly at the
			// boundary (rather than beyond it) exercises the real domain edge
			// without relying on implementation-defined out-of-domain behavior.
			assert.closeAbs( asin( float( 1 ) ), float( Math.PI / 2 ), 1e-5, 'asin(1)' );
			assert.closeAbs( asin( float( -1 ) ), float( -Math.PI / 2 ), 1e-5, 'asin(-1)' );
			assert.closeAbs( asin( float( 0 ) ), float( 0 ), 1e-6, 'asin(0)' );
			assert.closeAbs( acos( float( 1 ) ), float( 0 ), 1e-6, 'acos(1)' );
			assert.closeAbs( acos( float( -1 ) ), float( Math.PI ), 1e-5, 'acos(-1)' );
			assert.closeAbs( acos( float( 0 ) ), float( Math.PI / 2 ), 1e-5, 'acos(0)' );

		} );

		gpuTest( 'atan2-style quadrant handling (2-arg atan)', ( { assert } ) => {

			// three/tsl has no separate `atan2` export -- 2-arg `atan(y, x)` is
			// the quadrant-aware form. Cover all four quadrants plus the two
			// axis-aligned cases per quadrant, mirroring Math.atan2 exactly
			// (deliberately NOT testing atan(0, 0), which is undefined by the
			// GLSL/WGSL spec and implementation-defined).
			const cases = [
				[ 1, 1 ], [ 1, -1 ], [ -1, -1 ], [ -1, 1 ],
				[ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, 0 ]
			];

			for ( const [ y, x ] of cases ) {

				assert.closeAbs( atan( float( y ), float( x ) ), float( Math.atan2( y, x ) ), 1e-5, `atan(${ y }, ${ x })` );

			}

		} );

		gpuTest( 'exponential and logarithmic functions', ( { assert } ) => {

			assert.closeAbs( exp( float( 0 ) ), float( 1 ), 1e-6, 'exp(0)' );
			assert.closeAbs( exp( float( 1 ) ), float( Math.E ), 1e-4, 'exp(1)' );
			assert.closeAbs( log( float( 1 ) ), float( 0 ), 1e-6, 'log(1)' );
			assert.closeAbs( log( float( Math.E ) ), float( 1 ), 1e-5, 'log(E)' );
			assert.closeAbs( log2( float( 8 ) ), float( 3 ), 1e-5, 'log2(8)' );
			assert.closeAbs( exp2( float( 3 ) ), float( 8 ), 1e-4, 'exp2(3)' );
			assert.closeAbs( sqrt( float( 4 ) ), float( 2 ), 1e-6, 'sqrt(4)' );
			assert.closeAbs( sqrt( float( 0 ) ), float( 0 ), 1e-6, 'sqrt(0)' );
			assert.closeAbs( inverseSqrt( float( 4 ) ), float( 0.5 ), 1e-5, 'inverseSqrt(4)' );
			assert.closeAbs( inverseSqrt( float( 0.25 ) ), float( 2 ), 1e-4, 'inverseSqrt(0.25)' );
			assert.closeAbs( pow( float( 2 ), float( 10 ) ), float( 1024 ), 1e-2, 'pow(2,10)' );
			assert.closeAbs( pow( float( 2 ), float( 0 ) ), float( 1 ), 1e-6, 'pow(2,0)' );
			assert.closeAbs( pow( float( 0 ), float( 5 ) ), float( 0 ), 1e-6, 'pow(0,5)' );

		} );

		gpuTest( 'rounding functions at negative and fractional edge values', ( { assert } ) => {

			// Negative-input rounding is where floor/ceil/trunc/fract most
			// commonly get confused with each other -- exercised explicitly here.
			assert.eq( floor( float( -1.5 ) ), float( -2 ), 'floor(-1.5)' );
			assert.eq( floor( float( 1.5 ) ), float( 1 ), 'floor(1.5)' );
			assert.eq( ceil( float( -1.5 ) ), float( -1 ), 'ceil(-1.5)' );
			assert.eq( ceil( float( 1.5 ) ), float( 2 ), 'ceil(1.5)' );
			assert.eq( trunc( float( -1.9 ) ), float( -1 ), 'trunc(-1.9)' );
			assert.eq( trunc( float( 1.9 ) ), float( 1 ), 'trunc(1.9)' );
			assert.closeAbs( fract( float( -1.5 ) ), float( 0.5 ), 1e-5, 'fract(-1.5) == -1.5 - floor(-1.5) == 0.5' );
			assert.closeAbs( fract( float( 2.25 ) ), float( 0.25 ), 1e-5, 'fract(2.25)' );

			// round()'s rounding direction at the exact x.5 midpoint is left
			// implementation-defined by both the GLSL and WGSL specs -- so we
			// only assert the unambiguous, non-midpoint cases here rather than
			// baking in a rounding direction that could legitimately differ
			// between backends/drivers.
			assert.eq( round( float( 2.4 ) ), float( 2 ), 'round(2.4)' );
			assert.eq( round( float( 2.6 ) ), float( 3 ), 'round(2.6)' );
			assert.eq( round( float( -2.4 ) ), float( -2 ), 'round(-2.4)' );
			assert.eq( round( float( -2.6 ) ), float( -3 ), 'round(-2.6)' );

		} );

		gpuTest( 'sign and abs at zero and negative values', ( { assert } ) => {

			assert.eq( sign( float( 0 ) ), float( 0 ), 'sign(0)' );
			assert.eq( sign( float( -5 ) ), float( -1 ), 'sign(-5)' );
			assert.eq( sign( float( 5 ) ), float( 1 ), 'sign(5)' );
			assert.eq( abs( float( -3.5 ) ), float( 3.5 ), 'abs(-3.5)' );
			assert.eq( abs( float( 0 ) ), float( 0 ), 'abs(0)' );

		} );

		gpuTest( 'min/max/clamp/saturate', ( { assert } ) => {

			assert.eq( min( float( 3 ), float( 1 ) ), float( 1 ), 'min(3,1)' );
			assert.eq( max( float( 3 ), float( 1 ) ), float( 3 ), 'max(3,1)' );
			assert.eq( clamp( float( 5 ), float( 0 ), float( 1 ) ), float( 1 ), 'clamp(5,0,1)' );
			assert.eq( clamp( float( -5 ), float( 0 ), float( 1 ) ), float( 0 ), 'clamp(-5,0,1)' );
			assert.eq( clamp( float( 0.5 ), float( 0 ), float( 1 ) ), float( 0.5 ), 'clamp(0.5,0,1) passes through' );
			assert.eq( saturate( float( -5 ) ), float( 0 ), 'saturate(-5)' );
			assert.eq( saturate( float( 5 ) ), float( 1 ), 'saturate(5)' );

		} );

		gpuTest( 'mix/step/smoothstep', ( { assert } ) => {

			assert.closeAbs( mix( float( 0 ), float( 10 ), float( 0.3 ) ), float( 3 ), 1e-5, 'mix(0,10,0.3)' );
			// mix() does not clamp its interpolation factor -- t outside [0,1]
			// legally extrapolates. Confirms that's really what happens rather
			// than silently clamping.
			assert.closeAbs( mix( float( 0 ), float( 10 ), float( 1.5 ) ), float( 15 ), 1e-4, 'mix(0,10,1.5) extrapolates past b' );
			assert.closeAbs( mix( float( 0 ), float( 10 ), float( -0.5 ) ), float( -5 ), 1e-4, 'mix(0,10,-0.5) extrapolates before a' );

			assert.eq( step( float( 0.5 ), float( 0.3 ) ), float( 0 ), 'step(edge=0.5, x=0.3) -- x < edge' );
			assert.eq( step( float( 0.5 ), float( 0.7 ) ), float( 1 ), 'step(edge=0.5, x=0.7) -- x >= edge' );
			assert.eq( step( float( 0.5 ), float( 0.5 ) ), float( 1 ), 'step(edge=0.5, x=0.5) -- x == edge counts as >= edge' );

			assert.closeAbs( smoothstep( float( 0 ), float( 1 ), float( 0.5 ) ), float( 0.5 ), 1e-5, 'smoothstep midpoint is exactly 0.5' );
			assert.eq( smoothstep( float( 0 ), float( 1 ), float( -1 ) ), float( 0 ), 'smoothstep clamps below edge0' );
			assert.eq( smoothstep( float( 0 ), float( 1 ), float( 2 ) ), float( 1 ), 'smoothstep clamps above edge1' );

		} );

		gpuTest( 'reciprocal and degrees/radians conversions', ( { assert } ) => {

			assert.closeAbs( reciprocal( float( 4 ) ), float( 0.25 ), 1e-5, 'reciprocal(4)' );
			assert.closeAbs( reciprocal( float( 0.25 ) ), float( 4 ), 1e-4, 'reciprocal(0.25)' );
			assert.closeAbs( degrees( float( Math.PI ) ), float( 180 ), 1e-3, 'degrees(PI)' );
			assert.closeAbs( radians( float( 180 ) ), float( Math.PI ), 1e-5, 'radians(180)' );
			assert.closeAbs( PI, float( Math.PI ), 1e-6, 'PI constant' );
			assert.closeAbs( HALF_PI, float( Math.PI / 2 ), 1e-6, 'HALF_PI constant' );
			assert.closeAbs( TWO_PI, float( Math.PI * 2 ), 1e-5, 'TWO_PI constant' );

		} );

		// --- mod(): a real, verified cross-type behavioral divergence -----
		//
		// `mod()` is a single TSL entry point (OperatorNode, '%'), but its
		// codegen branches on operand type (see OperatorNode.js's '%' case):
		// integer operands compile to the native `%` operator (C-style
		// truncated division, sign follows the dividend), while float
		// operands compile to the GLSL/WGSL `mod()` builtin (floored
		// division, sign follows the divisor). For negative operands these
		// give genuinely different mathematical results from the *same*
		// TSL function name -- this is not a bug (both are spec-correct for
		// their respective codegen paths) but it is a sharp edge worth
		// locking down so a future refactor can't silently unify the two
		// and change behavior.
		gpuTest( 'mod(): integer truncated vs. float floored semantics diverge on negative operands', ( { assert } ) => {

			// Every operand below is forced through `.toVar()` -- a genuine
			// runtime variable -- rather than left as a bare compile-time
			// constant. This sidesteps a *separate*, real bug (documented in
			// tsl-unit-test-findings.md): constant-folded numeric literals are
			// re-emitted via `NodeBuilder.generateConst()`, which uses
			// `Math.round()` regardless of target type, so a constant int
			// expression can silently round instead of using real integer
			// arithmetic. Forcing a `.toVar()` here means this test exercises
			// mod()'s actual shader-level codegen (the thing under test),
			// not that unrelated constant-folding path.

			// float path: floored mod, x - y*floor(x/y) -- sign follows the divisor.
			assert.closeAbs( mod( float( -5 ).toVar(), float( 3 ).toVar() ), float( 1 ), 1e-5, 'mod(-5.0, 3.0) floored == 1' );
			assert.closeAbs( mod( float( 5 ).toVar(), float( -3 ).toVar() ), float( -1 ), 1e-5, 'mod(5.0, -3.0) floored == -1' );

			// integer path: truncated mod (C-style '%') -- sign follows the dividend.
			assert.eq( mod( int( -5 ).toVar(), int( 3 ).toVar() ), int( -2 ), 'mod(-5, 3) truncated == -2 (differs from the float case above!)' );
			assert.eq( mod( int( 5 ).toVar(), int( -3 ).toVar() ), int( 2 ), 'mod(5, -3) truncated == 2 (differs from the float case above!)' );

			// Positive operands agree between both codegen paths, as expected.
			assert.closeAbs( mod( float( 5 ).toVar(), float( 3 ).toVar() ), float( 2 ), 1e-5, 'mod(5.0, 3.0)' );
			assert.eq( mod( int( 5 ).toVar(), int( 3 ).toVar() ), int( 2 ), 'mod(5, 3)' );

		} );

		gpuTest( 'uint/int/float type-cast round trips', ( { assert } ) => {

			assert.eq( uint( int( 5 ) ).toInt(), int( 5 ), 'uint<->int round trip for a positive value' );
			assert.eq( float( int( 7 ) ), float( 7 ), 'int -> float cast' );

			// `.toVar()` forces a real runtime cast rather than a compile-time
			// constant fold -- see the `mod()` test above for why that
			// distinction matters here.
			assert.eq( int( float( 7.9 ).toVar() ), int( 7 ), 'float -> int cast truncates toward zero' );
			assert.eq( int( float( -7.9 ).toVar() ), int( -7 ), 'float -> int cast truncates toward zero (negative)' );

		} );

	} );

} );
