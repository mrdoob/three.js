/* global QUnit */

import { GridHelper } from '../../../../src/helpers/GridHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'GridHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new GridHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'GridHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new GridHelper();
			assert.ok( object, 'Can instantiate a GridHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new GridHelper();
			assert.ok(
				object.type === 'GridHelper',
				'GridHelper.type should be GridHelper'
			);

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new GridHelper();
			object.dispose();

		} );

	} );

} );
