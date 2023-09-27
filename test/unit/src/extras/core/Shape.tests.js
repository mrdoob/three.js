/* global QUnit */

import { Shape } from '../../../../../src/extras/core/Shape.js';

import { Path } from '../../../../../src/extras/core/Path.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'Shape', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new Shape();
				assert.strictEqual(
					object instanceof Path, true,
					'Shape extends from Path'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new Shape();
				assert.ok( object, 'Can instantiate a Shape.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new Shape();
				assert.ok(
					object.type === 'Shape',
					'Shape.type should be Shape'
				);

			} );

			QUnit.todo( 'uuid', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'holes', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'getPointsHoles', ( assert ) => {

				assert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'extractPoints', ( assert ) => {

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
