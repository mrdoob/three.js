/* global QUnit */

import { FogExp2 } from '../../../../src/scenes/FogExp2.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'FoxExp2', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// FoxExp2( color, density = 0.00025 )

			// no params
			const object = new FogExp2();
			assert.ok( object, 'Can instantiate a FogExp2.' );

			// color
			const object_color = new FogExp2( 0xffffff );
			assert.ok( object_color, 'Can instantiate a FogExp2 with color.' );

			// color, density
			const object_all = new FogExp2( 0xffffff, 0.00030 );
			assert.ok( object_all, 'Can instantiate a FogExp2 with color, density.' );

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'density', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isFogExp2', ( assert ) => {

			const object = new FogExp2();
			assert.ok(
				object.isFogExp2,
				'FogExp2.isFogExp2 should be true'
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
