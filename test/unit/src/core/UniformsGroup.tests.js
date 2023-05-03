/* global QUnit */

import { UniformsGroup } from '../../../../src/core/UniformsGroup.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'UniformsGroup', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new UniformsGroup();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'UniformsGroup extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new UniformsGroup();
			assert.ok( object, 'Can instantiate a UniformsGroup.' );

		} );

		// PROPERTIES
		QUnit.todo( 'id', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'name', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'usage', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uniforms', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isUniformsGroup', ( assert ) => {

			const object = new UniformsGroup();
			assert.ok(
				object.isUniformsGroup,
				'UniformsGroup.isUniformsGroup should be true'
			);

		} );

		QUnit.todo( 'add', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'remove', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setName', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setUsage', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new UniformsGroup();
			object.dispose();

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
