import { float, vec3, triNoise3D } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for triNoise3D() (src/nodes/math/TriNoise3D.js), a small
// deterministic procedural noise function (4 unrolled loop iterations, no
// randomness). Expected values come from an independent plain-JS port of
// the algorithm below -- kept out of the shipped source, not imported --
// rather than by re-running the TSL expression under test, following the
// same approach used for TSLToneMapping.tests.js's AgX/ACES/Neutral ports
// (see that file's header for why: https://ben3d.ca/blog/the-rise-of-test-theater).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'triNoise3D()', () => {

		gpuTest( 'triNoise3D() matches an independent plain-JS port of its documented algorithm', ( { assert } ) => {

			const fract = ( x ) => x - Math.floor( x );
			const tri = ( x ) => Math.abs( fract( x ) - 0.5 );
			const tri3 = ( p ) => [
				tri( p[ 2 ] + tri( p[ 1 ] ) ),
				tri( p[ 2 ] + tri( p[ 0 ] ) ),
				tri( p[ 1 ] + tri( p[ 0 ] ) )
			];

			const triNoise3DPort = ( position, speed, time ) => {

				let p = position.slice();
				let z = 1.4;
				let rz = 0.0;
				let bp = position.slice();

				for ( let i = 0; i <= 3; i ++ ) {

					const dg = tri3( bp.map( c => c * 2.0 ) );
					p = p.map( ( c, i ) => c + dg[ i ] + time * ( 0.1 * speed ) );
					bp = bp.map( c => c * 1.8 );
					z *= 1.5;
					p = p.map( c => c * 1.2 );

					const t = tri( p[ 2 ] + tri( p[ 0 ] + tri( p[ 1 ] ) ) );
					rz += t / z;
					bp = bp.map( c => c + 0.14 );

				}

				return rz;

			};

			const position = [ 1.5, - 0.7, 2.3 ], speed = 0.5, time = 3.0;
			const expected = triNoise3DPort( position, speed, time );

			assert.closeAbs(
				triNoise3D( vec3( ...position ), float( speed ), float( time ) ),
				float( expected ), 1e-3, 'triNoise3D matches the independent plain-JS port'
			);

			// A second, different set of inputs, so this can't pass by
			// coincidentally matching only one hand-picked point.
			const position2 = [ - 4.1, 0.9, - 1.2 ], speed2 = 1.3, time2 = 0.25;
			const expected2 = triNoise3DPort( position2, speed2, time2 );

			assert.closeAbs(
				triNoise3D( vec3( ...position2 ), float( speed2 ), float( time2 ) ),
				float( expected2 ), 1e-3, 'triNoise3D matches the independent plain-JS port at a second, different point'
			);

		} );

		gpuTest( 'triNoise3D() is deterministic -- the same inputs always produce the same output', ( { assert } ) => {

			const position = vec3( 2.0, 2.0, 2.0 ), speed = float( 1.0 ), time = float( 1.0 );
			assert.eq( triNoise3D( position, speed, time ), triNoise3D( position, speed, time ), 'triNoise3D(p, s, t) called twice with identical inputs returns identical output' );

		} );

	} );

} );
