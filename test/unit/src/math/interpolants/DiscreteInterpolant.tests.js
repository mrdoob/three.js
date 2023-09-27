/* global QUnit */

import { DiscreteInterpolant } from '../../../../../src/math/interpolants/DiscreteInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'DiscreteInterpolant', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new DiscreteInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'DiscreteInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new DiscreteInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a DiscreteInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS
			QUnit.todo( 'interpolate_', ( assert ) => {

				// interpolate_( i1 /*, t0, t, t1 */ )
				// return equal to base class Interpolant.resultBuffer after call
				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
