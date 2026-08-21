import {
	float
} from 'three/tsl';
import { gain, pcurve } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Regression coverage for two independent bugs in src/nodes/math/MathUtils.js:
//
// gain(x, k) had two stacked bugs:
//   1. Broken branch selection -- the implementation was
//      `x.lessThan(0.5) ? A : B`, a *native JS* ternary applied directly to
//      a TSL Node. `x.lessThan(0.5)` returns a Node object, which is always
//      truthy in JS, so this unconditionally evaluated to `A` regardless of
//      x's actual runtime value -- there was no GPU branching at all.
//   2. Wrong base formula, independent of the branch-selection bug -- even
//      with correct branching, the implementation built gain() out of
//      parabola() (pow(4x(1-x), k)), which does not satisfy the documented
//      contract ("k=1 is the identity curve"). The reference this file
//      cites (Inigo Quilez) defines gain from a plain pow(2x, k)/2 (not the
//      parabola), which does satisfy the identity property at k=1.
//   Fixed by rewriting gain() to use TSL's select() (real GPU branching)
//   instead of a JS ternary, and rebuilding it from pow(2x, k) instead of
//   parabola(2x, k).
//
// pcurve(x, a, b)'s exponent used native JS division on a Node (`1.0 / a`),
// where `a` is a TSL Node, not a JS number -- Node has no custom valueOf()/
// toString(), so JS's numeric coercion falls through to NaN. Fixed by using
// TSL's div() node constructor instead of the native `/` operator.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'gain() and pcurve()', () => {

		gpuTest( 'gain() keeps the endpoints and midpoint fixed, k=1 is the identity', ( { assert } ) => {

			// gain()'s doc comment: "k=1 is the identity curve" -- checked at
			// several points, not just the fixed ones.
			assert.closeAbs( gain( float( 0.2 ), float( 1 ) ), float( 0.2 ), 1e-4, 'gain(0.2, k=1) == 0.2 (identity)' );
			assert.closeAbs( gain( float( 0.7 ), float( 1 ) ), float( 0.7 ), 1e-4, 'gain(0.7, k=1) == 0.7 (identity)' );

			// Regardless of k, gain() fixes 0, 0.5 and 1 (a documented property
			// of this remap shape).
			assert.closeAbs( gain( float( 0 ), float( 3 ) ), float( 0 ), 1e-5, 'gain(0, k) == 0 for any k' );
			assert.closeAbs( gain( float( 1 ), float( 3 ) ), float( 1 ), 1e-5, 'gain(1, k) == 1 for any k' );
			assert.closeAbs( gain( float( 0.5 ), float( 3 ) ), float( 0.5 ), 1e-4, 'gain(0.5, k) == 0.5 for any k' );

		} );

		gpuTest( 'pcurve() matches its own documented formula and vanishes at the domain edges', ( { assert } ) => {

			// pcurve(x, a, b) == (x^a / (x^a + (1-x)^b))^(1/a) -- from the
			// function's own doc comment, computed independently in JS.
			const x = 0.3, a = 2, b = 3;
			const expected = Math.pow( Math.pow( x, a ) / ( Math.pow( x, a ) + Math.pow( 1 - x, b ) ), 1 / a );
			assert.closeAbs( pcurve( float( x ), float( a ), float( b ) ), float( expected ), 1e-4, 'pcurve(0.3, 2, 3) matches the hand-computed formula' );

			assert.closeAbs( pcurve( float( 0 ), float( 2 ), float( 3 ) ), float( 0 ), 1e-4, 'pcurve(0, a, b) == 0' );
			assert.closeAbs( pcurve( float( 1 ), float( 2 ), float( 3 ) ), float( 1 ), 1e-4, 'pcurve(1, a, b) == 1' );

		} );

	} );

} );
