import { ImageBitmapLoader } from '../../../../src/loaders/ImageBitmapLoader.js';

import { Cache } from '../../../../src/loaders/Cache.js';
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

		QUnit.test( 'load', async ( assert ) => {

			const canvas = document.createElement( 'canvas' );
			canvas.width = 8;
			canvas.height = 8;

			const url = canvas.toDataURL( 'image/png' );

			const enabled = Cache.enabled;
			Cache.enabled = true;

			try {

				// concurrent requests for the same URL share the cached promise

				const [ first, second ] = await Promise.all( [
					new ImageBitmapLoader().loadAsync( url ),
					new ImageBitmapLoader().loadAsync( url )
				] );

				assert.ok(
					first instanceof ImageBitmap,
					'The first request resolves with an image bitmap.'
				);

				assert.ok(
					second instanceof ImageBitmap,
					'The second request resolves with an image bitmap.'
				);

			} finally {

				Cache.remove( `image-bitmap:${url}` );
				Cache.enabled = enabled;

			}

		} );

	} );

} );
