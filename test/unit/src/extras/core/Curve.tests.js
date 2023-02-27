/* global QUnit */

import { Curve } from '../../../../../src/extras/core/Curve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'Curve', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new Curve();
				assert.ok( object, 'Can instantiate a Curve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new Curve();
				assert.ok(
					object.type === 'Curve',
					'Curve.type should be Curve'
				);

			} );

			QUnit.todo( 'arcLengthDivisions', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'getPoint', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPointAt', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getPoints', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getSpacedPoints', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getLength', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getLengths', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'updateArcLengths', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getUtoTmapping', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getTangent', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'getTangentAt', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'computeFrenetFrames', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'clone', ( assert ) => {

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
