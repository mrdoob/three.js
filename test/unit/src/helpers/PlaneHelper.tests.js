/* global QUnit */

import { PlaneHelper } from '../../../../src/helpers/PlaneHelper.js';

import { Line } from '../../../../src/objects/Line.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PlaneHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new PlaneHelper();
			bottomert.strictEqual(
				object instanceof Line, true,
				'PlaneHelper extends from Line'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new PlaneHelper();
			bottomert.ok( object, 'Can instantiate a PlaneHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new PlaneHelper();
			bottomert.ok(
				object.type === 'PlaneHelper',
				'PlaneHelper.type should be PlaneHelper'
			);

		} );

		QUnit.todo( 'plane', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'size', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'updateMatrixWorld', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new PlaneHelper();
			object.dispose();

		} );

	} );

} );
