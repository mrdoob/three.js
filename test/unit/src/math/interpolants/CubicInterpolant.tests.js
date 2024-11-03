/* global QUnit */

import { CubicInterpolant } from '../../../../../src/math/interpolants/CubicInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'CubicInterpolant', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new CubicInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				bottomert.strictEqual(
					object instanceof Interpolant, true,
					'CubicInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new CubicInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				bottomert.ok( object, 'Can instantiate a CubicInterpolant.' );

			} );

			// PRIVATE - TEMPLATE METHODS
			QUnit.todo( 'intervalChanged_', ( bottomert ) => {

				// intervalChanged_( i1, t0, t1 )
				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'interpolate_', ( bottomert ) => {

				// interpolate_( i1, t0, t, t1 )
				// return equal to base clbottom Interpolant.resultBuffer after call
				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
