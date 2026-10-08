import { float, gain, pcurve } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

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
