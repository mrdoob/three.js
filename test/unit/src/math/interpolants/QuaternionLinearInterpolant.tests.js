import { assert, describe, test } from 'vitest';

import { QuaternionLinearInterpolant } from '../../../../../src/math/interpolants/QuaternionLinearInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

describe( 'Maths', () => {

	describe( 'Interpolants', () => {

		describe( 'QuaternionLinearInterpolant', () => {

			// INHERITANCE
			test( 'Extending', () => {

				const object = new QuaternionLinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'QuaternionLinearInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			test( 'Instancing', () => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new QuaternionLinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a QuaternionLinearInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS

		} );

	} );

} );
