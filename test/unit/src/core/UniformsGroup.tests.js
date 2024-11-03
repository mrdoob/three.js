/* global QUnit */

import { UniformsGroup } from '../../../../src/core/UniformsGroup.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'UniformsGroup', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new UniformsGroup();
			bottomert.strictEqual(
				object instanceof EventDispatcher, true,
				'UniformsGroup extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new UniformsGroup();
			bottomert.ok( object, 'Can instantiate a UniformsGroup.' );

		} );

		// PROPERTIES
		QUnit.todo( 'id', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'name', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'usage', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uniforms', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isUniformsGroup', ( bottomert ) => {

			const object = new UniformsGroup();
			bottomert.ok(
				object.isUniformsGroup,
				'UniformsGroup.isUniformsGroup should be true'
			);

		} );

		QUnit.todo( 'add', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'remove', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setName', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setUsage', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const object = new UniformsGroup();
			object.dispose();

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
