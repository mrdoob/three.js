/* global QUnit */

import { PolarGridHelper } from '../../../../src/helpers/PolarGridHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PolarGridHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PolarGridHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'PolarGridHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PolarGridHelper();
			assert.ok( object, 'Can instantiate a PolarGridHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PolarGridHelper();
			assert.ok(
				object.type === 'PolarGridHelper',
				'PolarGridHelper.type should be PolarGridHelper'
			);

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new PolarGridHelper();
			object.dispose();

		} );

	} );

} );
