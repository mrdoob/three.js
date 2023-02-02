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
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

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

		QUnit.todo( 'dispose', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
