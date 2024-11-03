/* global QUnit */

import { AxesHelper } from '../../../../src/helpers/AxesHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'AxesHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new AxesHelper();
			bottomert.strictEqual(
				object instanceof LineSegments, true,
				'AxesHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new AxesHelper();
			bottomert.ok( object, 'Can instantiate an AxesHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new AxesHelper();
			bottomert.ok(
				object.type === 'AxesHelper',
				'AxesHelper.type should be AxesHelper'
			);

		} );

		// PUBLIC
		QUnit.todo( 'setColors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new AxesHelper();
			object.dispose();

		} );

	} );

} );
