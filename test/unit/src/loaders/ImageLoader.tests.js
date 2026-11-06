import { assert, describe, test } from 'vitest';

import { ImageLoader } from '../../../../src/loaders/ImageLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'ImageLoader', () => {

		test( 'image request priority', async () => {

			const image = await new ImageLoader().setPriority( 'high' ).loadAsync( '/examples/textures/uv_grid_opengl.jpg' );
			assert.strictEqual( image.fetchPriority, 'high' );

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ImageLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ImageLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ImageLoader();
			assert.ok( object, 'Can instantiate an ImageLoader.' );

		} );

	} );

} );
