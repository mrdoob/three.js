/* global QUnit */

import { TextureLoader } from '../../../../src/loaders/TextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'TextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new TextureLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'TextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new TextureLoader();
			bottomert.ok( object, 'Can instantiate a TextureLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
