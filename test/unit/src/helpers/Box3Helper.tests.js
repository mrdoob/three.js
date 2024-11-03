/* global QUnit */

import { Box3Helper } from '../../../../src/helpers/Box3Helper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'Box3Helper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new Box3Helper();
			bottomert.strictEqual(
				object instanceof LineSegments, true,
				'Box3Helper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Box3Helper();
			bottomert.ok( object, 'Can instantiate a Box3Helper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Box3Helper();
			bottomert.ok(
				object.type === 'Box3Helper',
				'Box3Helper.type should be Box3Helper'
			);

		} );

		QUnit.todo( 'box', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'updateMatrixWorld', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new Box3Helper();
			object.dispose();

		} );

	} );

} );
