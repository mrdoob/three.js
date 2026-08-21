import {
	float, sinc
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Regression coverage for a sinc() singularity bug: sinc(x, k) ==
// sin(arg)/arg where arg = PI*(k*x - 1). Mathematically this has a
// removable singularity at arg == 0 (the limit is 1, the function's peak),
// but the implementation evaluated the division unconditionally. For
// compile-time-constant inputs that hit the peak exactly (as below),
// WGSL's compiler constant-folds the whole expression tree and hits
// "'0.0 / 0.0' cannot be represented as 'abstract-float'" -- a hard
// shader-compile error, not a wrong answer. For non-constant runtime
// inputs it would silently produce NaN at exactly that one input value.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'sinc()', () => {

		gpuTest( 'sinc() starts and ends at zero over one full bounce period', ( { assert } ) => {

			// sinc(x, k) == sin(PI*(k*x-1)) / (PI*(k*x-1)) -- from the function's
			// own doc comment. At x=0 the argument is -PI, giving sin(-PI)/(-PI) == 0.
			assert.closeAbs( sinc( float( 0 ), float( 1 ) ), float( 0 ), 1e-4, 'sinc(0, k=1) == 0' );

			// At x == 1/k the argument is exactly 0 -- naively that's sin(0)/0,
			// but sinc()'s removable-singularity guard (see MathUtils.js) returns
			// the analytic limit of 1 instead of evaluating the 0/0 division, so
			// this is exercised at full precision, not just approximately.
			assert.closeAbs( sinc( float( 1 ), float( 1 ) ), float( 1 ), 1e-4, 'sinc(1/k, k) == 1 -- the sinc() peak' );

			// At x == 2/k the argument is +PI, giving sin(PI)/PI == 0 again.
			assert.closeAbs( sinc( float( 2 ), float( 1 ) ), float( 0 ), 1e-3, 'sinc(2/k, k) == 0 again' );

		} );

	} );

} );
