/* global QUnit */

import { CompressedTextureLoader } from '../../../../src/loaders/CompressedTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'CompressedTextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CompressedTextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'CompressedTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CompressedTextureLoader();
			assert.ok( object, 'Can instantiate a CompressedTextureLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
