/* global QUnit */

import { FogExp2 } from '../../../../src/scenes/FogExp2.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'FoxExp2', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			// FoxExp2( color, density = 0.00025 )

			// no params
			const object = new FogExp2();
			bottomert.ok( object, 'Can instantiate a FogExp2.' );

			// color
			const object_color = new FogExp2( 0xffffff );
			bottomert.ok( object_color, 'Can instantiate a FogExp2 with color.' );

			// color, density
			const object_all = new FogExp2( 0xffffff, 0.00030 );
			bottomert.ok( object_all, 'Can instantiate a FogExp2 with color, density.' );

		} );

		// PROPERTIES
		QUnit.todo( 'name', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'color', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'density', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isFogExp2', ( bottomert ) => {

			const object = new FogExp2();
			bottomert.ok(
				object.isFogExp2,
				'FogExp2.isFogExp2 should be true'
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
