import { float, vec3, triNoise3D } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for triNoise3D() (src/nodes/math/TriNoise3D.js). This is
// deliberately light: triNoise3D() is a 4-iteration accumulation of nested
// tri(x) = |fract(x)-0.5| triangle-wave terms, and porting that whole
// algorithm to independent plain JS just to re-derive exact expected values
// is more machinery than it's worth here -- so this only checks properties
// derivable without a full port: determinism, and the value staying inside
// the range the accumulation can mathematically produce.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'triNoise3D()', () => {

		gpuTest( 'triNoise3D() is deterministic -- the same inputs always produce the same output', ( { assert } ) => {

			const position = vec3( 2.0, 2.0, 2.0 ), speed = float( 1.0 ), time = float( 1.0 );
			assert.eq( triNoise3D( position, speed, time ), triNoise3D( position, speed, time ), 'triNoise3D(p, s, t) called twice with identical inputs returns identical output' );

		} );

		gpuTest( 'triNoise3D() stays within the range its accumulation can mathematically produce', ( { assert } ) => {

			// Each of the 4 loop iterations adds tri(x)/z, where tri(x) is
			// in [0, 0.5] (it's |fract(x)-0.5|) and z is 1.4 scaled by 1.5
			// *before* each addition (z = 2.1, 3.15, 4.725, 7.0875 across
			// the 4 iterations) -- so the whole sum is bounded above by
			// 0.5 * (1/2.1 + 1/3.15 + 1/4.725 + 1/7.0875), regardless of
			// input, and can never be negative (every term is >= 0).
			const upperBound = 0.5 * ( 1 / 2.1 + 1 / 3.15 + 1 / 4.725 + 1 / 7.0875 );

			const samples = [
				triNoise3D( vec3( 1.5, - 0.7, 2.3 ), float( 0.5 ), float( 3.0 ) ),
				triNoise3D( vec3( - 4.1, 0.9, - 1.2 ), float( 1.3 ), float( 0.25 ) ),
				triNoise3D( vec3( 0, 0, 0 ), float( 0 ), float( 0 ) )
			];

			for ( const sample of samples ) {

				assert.greaterThanOrEqual( sample, float( 0 ), 'triNoise3D output is never negative' );
				assert.lessThanOrEqual( sample, float( upperBound ), `triNoise3D output is at most ${ upperBound.toFixed( 4 ) }` );

			}

		} );

	} );

} );
