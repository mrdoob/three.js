/* global QUnit */

import { AxesHelper } from '../../../../src/helpers/AxesHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'AxesHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new AxesHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'AxesHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new AxesHelper();
			assert.ok( object, 'Can instantiate an AxesHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new AxesHelper();
			assert.ok(
				object.type === 'AxesHelper',
				'AxesHelper.type should be AxesHelper'
			);

		} );

		// PUBLIC
		QUnit.todo( 'setColors', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new AxesHelper();
			object.dispose();

		} );

	} );

} );
