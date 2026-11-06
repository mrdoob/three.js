import { assert, describe, test } from 'vitest';

import { DiscreteInterpolant } from '../../../../../src/math/interpolants/DiscreteInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

describe( 'Maths', () => {

	describe( 'Interpolants', () => {

		describe( 'DiscreteInterpolant', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new DiscreteInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'DiscreteInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new DiscreteInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a DiscreteInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS

		} );

	} );

} );
