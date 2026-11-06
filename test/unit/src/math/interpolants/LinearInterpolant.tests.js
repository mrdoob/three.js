import { assert, describe, test } from 'vitest';

import { LinearInterpolant } from '../../../../../src/math/interpolants/LinearInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

describe( 'Maths', () => {

	describe( 'Interpolants', () => {

		describe( 'LinearInterpolant', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new LinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'LinearInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new LinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a LinearInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS

		} );

	} );

} );
