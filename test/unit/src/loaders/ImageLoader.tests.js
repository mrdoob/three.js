/* global QUnit */

import { ImageLoader } from '../../../../src/loaders/ImageLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ImageLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ImageLoader();
			bottomert.strictEqual(
				object instanceof Loader, true,
				'ImageLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ImageLoader();
			bottomert.ok( object, 'Can instantiate an ImageLoader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
