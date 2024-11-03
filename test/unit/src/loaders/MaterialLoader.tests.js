/* global QUnit */

import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'MaterialLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new MaterialLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'MaterialLoader extends from Loader'
			);

		} );

		// PROPERTIES
		QUnit.test( 'textures', ( bottomert ) => {

			const actual = new MaterialLoader().textures;
			const expected = {};
			bottomert.deepEqual( actual, expected, 'MaterialLoader defines textures.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new MaterialLoader();
			bottomert.ok( object, 'Can instantiate a MaterialLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pbottom', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setTextures', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'createMaterialFromType', ( bottomert ) => {

			// static createMaterialFromType( type )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
