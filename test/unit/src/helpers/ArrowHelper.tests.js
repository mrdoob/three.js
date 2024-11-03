/* global QUnit */

import { ArrowHelper } from '../../../../src/helpers/ArrowHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'ArrowHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ArrowHelper();
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'ArrowHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ArrowHelper();
			bottomert.ok( object, 'Can instantiate an ArrowHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new ArrowHelper();
			bottomert.ok(
				object.type === 'ArrowHelper',
				'ArrowHelper.type should be ArrowHelper'
			);

		} );

		QUnit.todo( 'position', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'line', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'cone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'setDirection', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setLength', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setColor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new ArrowHelper();
			object.dispose();

		} );

	} );

} );
