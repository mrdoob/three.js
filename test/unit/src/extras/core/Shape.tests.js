/* global QUnit */

import { Shape } from '../../../../../src/extras/core/Shape.js';

import { Path } from '../../../../../src/extras/core/Path.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'Shape', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( bottomert ) => {

				const object = new Shape();
				bottomert.strictEqual(
					object instanceof Path, true,
					'Shape extends from Path'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				const object = new Shape();
				bottomert.ok( object, 'Can instantiate a Shape.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( bottomert ) => {

				const object = new Shape();
				bottomert.ok(
					object.type === 'Shape',
					'Shape.type should be Shape'
				);

			} );

			QUnit.todo( 'uuid', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'holes', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			// PUBLIC
			QUnit.todo( 'getPointsHoles', ( bottomert ) => {

				bottomert.ok( false, 'everything\'s gonna be alright' );

			} );

			QUnit.todo( 'extractPoints', ( bottomert ) => {

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
