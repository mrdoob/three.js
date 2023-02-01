/* global QUnit */

import { ImageBitmapLoader } from '../../../../src/loaders/ImageBitmapLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ImageBitmapLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ImageBitmapLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ImageBitmapLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES
		QUnit.test( 'options', ( assert ) => {

			const actual = new ImageBitmapLoader().options;
			const expected = { premultiplyAlpha: 'none' };
			assert.deepEqual( actual, expected, 'ImageBitmapLoader defines options.' );

		} );

		// PUBLIC
		QUnit.test( 'isImageBitmapLoader', ( assert ) => {

			const object = new ImageBitmapLoader();
			assert.ok(
				object.isImageBitmapLoader,
				'ImageBitmapLoader.isImageBitmapLoader should be true'
			);

		} );

		QUnit.todo( 'setOptions', ( assert ) => {

			// setOptions( options )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'load', ( assert ) => {

			// load( url, onLoad, onProgress, onError )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
