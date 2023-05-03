/* global QUnit */

import { ArrowHelper } from '../../../../src/helpers/ArrowHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'ArrowHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ArrowHelper();
			assert.strictEqual(
				object instanceof Object3D, true,
				'ArrowHelper extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ArrowHelper();
			assert.ok( object, 'Can instantiate an ArrowHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ArrowHelper();
			assert.ok(
				object.type === 'ArrowHelper',
				'ArrowHelper.type should be ArrowHelper'
			);

		} );

		QUnit.todo( 'position', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'line', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'cone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'setDirection', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setLength', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setColor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new ArrowHelper();
			object.dispose();

		} );

	} );

} );
