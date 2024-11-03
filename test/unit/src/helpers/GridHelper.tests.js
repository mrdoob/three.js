/* global QUnit */

import { GridHelper } from '../../../../src/helpers/GridHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'GridHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new GridHelper();
			bottomert.strictEqual(
				object instanceof LineSegments, true,
				'GridHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new GridHelper();
			bottomert.ok( object, 'Can instantiate a GridHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new GridHelper();
			bottomert.ok(
				object.type === 'GridHelper',
				'GridHelper.type should be GridHelper'
			);

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new GridHelper();
			object.dispose();

		} );

	} );

} );
