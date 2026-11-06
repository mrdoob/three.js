import { assert, describe, test } from 'vitest';

import { CubicInterpolant } from '../../../../../src/math/interpolants/CubicInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

describe( 'Maths', () => {

	describe( 'Interpolants', () => {

		describe( 'CubicInterpolant', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new CubicInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'CubicInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new CubicInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a CubicInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS

		} );

	} );

} );
