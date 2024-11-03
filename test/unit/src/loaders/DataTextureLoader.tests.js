/* global QUnit */

import { DataTextureLoader } from '../../../../src/loaders/DataTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'DataTextureLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new DataTextureLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'DataTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new DataTextureLoader();
			bottomert.ok( object, 'Can instantiate a DataTextureLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
