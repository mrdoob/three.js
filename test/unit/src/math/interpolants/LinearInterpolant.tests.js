/* global QUnit */

import { LinearInterpolant } from '../../../../../src/math/interpolants/LinearInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'LinearInterpolant', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new LinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'LinearInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new LinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a LinearInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS
			QUnit.todo( 'interpolate_', ( assert ) => {

				// interpolate_( i1, t0, t, t1 )
				// return equal to base class Interpolant.resultBuffer after call
				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
