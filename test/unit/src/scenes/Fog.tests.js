/* global QUnit */

import { Fog } from '../../../../src/scenes/Fog.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'Fog', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			// Fog( color, near = 1, far = 1000 )

			// no params
			const object = new Fog();
			bottomert.ok( object, 'Can instantiate a Fog.' );

			// color
			const object_color = new Fog( 0xffffff );
			bottomert.ok( object_color, 'Can instantiate a Fog with color.' );

			// color, near, far
			const object_all = new Fog( 0xffffff, 0.015, 100 );
			bottomert.ok( object_all, 'Can instantiate a Fog with color, near, far.' );

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'near', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'far', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isFog', ( bottomert ) => {

			const object = new Fog();
			bottomert.ok(
				object.isFog,
				'Fog.isFog should be true'
			);

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
