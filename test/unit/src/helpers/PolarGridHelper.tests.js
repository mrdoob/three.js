/* global QUnit */

import { PolarGridHelper } from '../../../../src/helpers/PolarGridHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PolarGridHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new PolarGridHelper();
			bottomert.strictEqual(
				object instanceof LineSegments, true,
				'PolarGridHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new PolarGridHelper();
			bottomert.ok( object, 'Can instantiate a PolarGridHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new PolarGridHelper();
			bottomert.ok(
				object.type === 'PolarGridHelper',
				'PolarGridHelper.type should be PolarGridHelper'
			);

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new PolarGridHelper();
			object.dispose();

		} );

	} );

} );
