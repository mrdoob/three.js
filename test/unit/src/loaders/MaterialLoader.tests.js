/* global QUnit */

import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'MaterialLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MaterialLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'MaterialLoader extends from Loader'
			);

		} );

		// PROPERTIES
		QUnit.test( 'textures', ( assert ) => {

			const actual = new MaterialLoader().textures;
			const expected = {};
			assert.deepEqual( actual, expected, 'MaterialLoader defines textures.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MaterialLoader();
			assert.ok( object, 'Can instantiate a MaterialLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parse', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setTextures', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'createMaterialFromType', ( assert ) => {

			// static createMaterialFromType( type )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
