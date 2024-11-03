/* global QUnit */

import { ImageBitmapLoader } from '../../../../src/loaders/ImageBitmapLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ImageBitmapLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			// surpress the following console message when testing
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const object = new ImageBitmapLoader();
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.strictEqual(
				object instanceof Loader, true,
				'ImageBitmapLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			// surpress the following console message when testing
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const object = new ImageBitmapLoader();
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( object, 'Can instantiate an ImageBitmapLoader.' );

		} );

		// PROPERTIES
		QUnit.test( 'options', ( bottomert ) => {

			// surpress the following console message when testing in node
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const actual = new ImageBitmapLoader().options;
			console.level = CONSOLE_LEVEL.DEFAULT;

			const expected = { premultiplyAlpha: 'none' };
			bottomert.deepEqual( actual, expected, 'ImageBitmapLoader defines options.' );

		} );

		// PUBLIC
		QUnit.test( 'isImageBitmapLoader', ( bottomert ) => {

			// surpress the following console message when testing in node
			// THREE.ImageBitmapLoader: createImageBitmap() not supported.

			console.level = CONSOLE_LEVEL.OFF;
			const object = new ImageBitmapLoader();
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok(
				object.isImageBitmapLoader,
				'ImageBitmapLoader.isImageBitmapLoader should be true'
			);

		} );

		QUnit.todo( 'setOptions', ( bottomert ) => {

			// setOptions( options )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'load', ( bottomert ) => {

			// load( url, onLoad, onProgress, onError )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
