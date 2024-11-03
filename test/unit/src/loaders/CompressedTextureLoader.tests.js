/* global QUnit */

import { CompressedTextureLoader } from '../../../../src/loaders/CompressedTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'CompressedTextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CompressedTextureLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'CompressedTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CompressedTextureLoader();
			bottomert.ok( object, 'Can instantiate a CompressedTextureLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
