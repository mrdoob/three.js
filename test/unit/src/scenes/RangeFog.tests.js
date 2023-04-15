/* global QUnit */

import { RangeFog } from '../../../../src/scenes/RangeFog.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'RangeFog', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// RangeFog( color, near = 1, far = 1000 )

			// no params
			const object = new RangeFog();
			assert.ok( object, 'Can instantiate a RangeFog.' );

			// color
			const object_color = new RangeFog( 0xffffff );
			assert.ok( object_color, 'Can instantiate a RangeFog with color.' );

			// color, near, far
			const object_all = new RangeFog( 0xffffff, 0.015, 100 );
			assert.ok( object_all, 'Can instantiate a RangeFog with color, near, far.' );

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'near', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'far', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isRangeFog', ( assert ) => {

			const object = new RangeFog();
			assert.ok(
				object.isRangeFog,
				'RangeFog.isRangeFog should be true'
			);

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
