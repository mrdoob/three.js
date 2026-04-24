import { CubicInterpolant } from '../../../../../src/math/interpolants/CubicInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'CubicInterpolant', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new CubicInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'CubicInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new CubicInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a CubicInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS

		} );

	} );

} );
