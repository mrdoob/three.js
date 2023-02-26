/* global QUnit */

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
			QUnit.todo( 'intervalChanged_', ( assert ) => {

				// intervalChanged_( i1, t0, t1 )
				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'interpolate_', ( assert ) => {

				// interpolate_( i1, t0, t, t1 )
				// return equal to base class Interpolant.resultBuffer after call
				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
