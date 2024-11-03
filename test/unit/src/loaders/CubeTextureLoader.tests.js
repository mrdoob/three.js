/* global QUnit */

import { CubeTextureLoader } from '../../../../src/loaders/CubeTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'CubeTextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CubeTextureLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'CubeTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CubeTextureLoader();
			bottomert.ok( object, 'Can instantiate a CubeTextureLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
