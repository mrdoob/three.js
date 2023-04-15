/* global QUnit */

import { DensityFog } from '../../../../src/scenes/DensityFog.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'FoxExp2', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// FoxExp2( color, density = 0.00025 )

			// no params
			const object = new DensityFog();
			assert.ok( object, 'Can instantiate a DensityFog.' );

			// color
			const object_color = new DensityFog( 0xffffff );
			assert.ok( object_color, 'Can instantiate a DensityFog with color.' );

			// color, density
			const object_color_density = new DensityFog( 0xffffff, 0.00030 );
			assert.ok( object_color_density, 'Can instantiate a DensityFog with color, density.' );

			// color, density, squared
			const object_all = new DensityFog( 0xffffff, 0.00030, false );
			assert.ok( object_all, 'Can instantiate a DensityFog with color, density, squared == false.' );

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

		QUnit.todo( 'squared', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isDensityFog', ( assert ) => {

			const object = new DensityFog();
			assert.ok(
				object.isDensityFog,
				'DensityFog.isDensityFog should be true'
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
