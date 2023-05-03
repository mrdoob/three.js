/* global QUnit */

import { PlaneHelper } from '../../../../src/helpers/PlaneHelper.js';

import { Line } from '../../../../src/objects/Line.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PlaneHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PlaneHelper();
			assert.strictEqual(
				object instanceof Line, true,
				'PlaneHelper extends from Line'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PlaneHelper();
			assert.ok( object, 'Can instantiate a PlaneHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PlaneHelper();
			assert.ok(
				object.type === 'PlaneHelper',
				'PlaneHelper.type should be PlaneHelper'
			);

		} );

		QUnit.todo( 'plane', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'size', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'updateMatrixWorld', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new PlaneHelper();
			object.dispose();

		} );

	} );

} );
