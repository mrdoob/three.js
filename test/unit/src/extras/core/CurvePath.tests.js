/* global QUnit */

import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'CurvePath', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new CurvePath();
				bottomert.strictEqual(
					object instanceof Curve, true,
					'CurvePath extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				const object = new CurvePath();
				bottomert.ok( object, 'Can instantiate a CurvePath.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( bottomert ) => {

				const object = new Curve();
				bottomert.ok(
					object.type === 'Curve',
					'Curve.type should be Curve'
				);

			} );

			QUnit.todo( 'curves', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'autoClose', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'add', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'closePath', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPoint', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getLength', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'updateArcLengths', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getCurveLengths', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getSpacedPoints', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPoints', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'copy', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'toJSON', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'fromJSON', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
