/* global QUnit */

import { ImageBitmapLoader } from '../../../../src/loaders/ImageBitmapLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ImageBitmapLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			// suppress the following console message when testing
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const object = new ImageBitmapLoader();
			console.level = CONSOLE_LEVEL.DEFAULT;

			assert.strictEqual(
				object instanceof Loader, true,
				'ImageBitmapLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// suppress the following console message when testing
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const object = new ImageBitmapLoader();
			console.level = CONSOLE_LEVEL.DEFAULT;

			assert.ok( object, 'Can instantiate an ImageBitmapLoader.' );

		} );

		// PROPERTIES
		QUnit.test( 'options', ( assert ) => {

			// suppress the following console message when testing in node
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const actual = new ImageBitmapLoader().options;
			console.level = CONSOLE_LEVEL.DEFAULT;

			const expected = { premultiplyAlpha: 'none' };
			assert.deepEqual( actual, expected, 'ImageBitmapLoader defines options.' );

		} );

		// PUBLIC
		QUnit.test( 'isImageBitmapLoader', ( assert ) => {

			// suppress the following console message when testing in node
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const object = new ImageBitmapLoader();
			console.level = CONSOLE_LEVEL.DEFAULT;

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
