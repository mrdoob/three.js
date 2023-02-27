/* global QUnit */

import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'CurvePath', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new CurvePath();
				assert.strictEqual(
					object instanceof Curve, true,
					'CurvePath extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new CurvePath();
				assert.ok( object, 'Can instantiate a CurvePath.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new Curve();
				assert.ok(
					object.type === 'Curve',
					'Curve.type should be Curve'
				);

			} );

			QUnit.todo( 'curves', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'autoClose', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'add', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'closePath', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPoint', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getLength', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'updateArcLengths', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getCurveLengths', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getSpacedPoints', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPoints', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'copy', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'toJSON', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'fromJSON', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

		} );

	} );

} );
