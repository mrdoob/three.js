/* global QUnit */

import { Box3Helper } from '../../../../src/helpers/Box3Helper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'Box3Helper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Box3Helper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'Box3Helper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Box3Helper();
			assert.ok( object, 'Can instantiate a Box3Helper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Box3Helper();
			assert.ok(
				object.type === 'Box3Helper',
				'Box3Helper.type should be Box3Helper'
			);

		} );

		QUnit.todo( 'box', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new Box3Helper();
			object.dispose();

		} );

	} );

} );
