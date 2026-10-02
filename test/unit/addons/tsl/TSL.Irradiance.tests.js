import { SphericalHarmonics3, Vector3 } from 'three';
import { vec3, array, getShIrradianceAt } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for src/nodes/functions/material/getShIrradianceAt.js. Its 9-term
// spherical harmonics evaluation is a direct port of
// SphericalHarmonics3.getIrradianceAt() (src/math/SphericalHarmonics3.js) --
// same band constants (0.886227, 2*0.511664, 2*0.429043, 0.743125/0.247708,
// etc.) -- so the math-library method itself is used as the independent
// reference here, rather than a hand-rolled JS transliteration of the node's
// own formula.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'getShIrradianceAt()', () => {

		// A fixed, arbitrary-but-deterministic set of 9 SH coefficient triples
		// (one per color channel) shared by every case below.
		const shValues = [
			[ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ],
			[ 0.5, 0.5, 0 ], [ 0.2, 0, 0.3 ], [ 0, 0.4, 0 ],
			[ 0.1, 0.1, 0.1 ], [ 0, 0, 0.6 ], [ 0.3, 0, 0 ]
		];

		const makeShArray = ( values ) => array( values.map( ( v ) => vec3( ...v ) ) );

		gpuTest( 'getShIrradianceAt() matches SphericalHarmonics3.getIrradianceAt() for several normals', ( { assert } ) => {

			const shArray = makeShArray( shValues );
			const sh = new SphericalHarmonics3().set( shValues.map( ( v ) => new Vector3( ...v ) ) );

			const cases = [
				[ 0, 0, 1 ],
				[ 1, 0, 0 ],
				[ 1 / Math.sqrt( 3 ), 1 / Math.sqrt( 3 ), 1 / Math.sqrt( 3 ) ]
			];

			for ( const normal of cases ) {

				const expected = sh.getIrradianceAt( new Vector3( ...normal ), new Vector3() );

				assert.closeAbs(
					getShIrradianceAt( vec3( ...normal ), shArray ),
					vec3( expected.x, expected.y, expected.z ), 1e-4,
					`getShIrradianceAt(normal=${ JSON.stringify( normal ) }) matches SphericalHarmonics3.getIrradianceAt()`
				);

			}

		} );

		gpuTest( 'getShIrradianceAt() is exactly zero for all-zero SH coefficients, regardless of normal', ( { assert } ) => {

			const zeroValues = new Array( 9 ).fill( [ 0, 0, 0 ] );
			const shArray = makeShArray( zeroValues );

			assert.closeAbs( getShIrradianceAt( vec3( 0, 1, 0 ), shArray ), vec3( 0, 0, 0 ), 1e-6, 'getShIrradianceAt is 0 with all-zero SH coefficients (normal (0,1,0))' );
			assert.closeAbs( getShIrradianceAt( vec3( 0.6, 0, 0.8 ), shArray ), vec3( 0, 0, 0 ), 1e-6, 'getShIrradianceAt is 0 with all-zero SH coefficients (normal (0.6,0,0.8))' );

		} );

	} );

} );
