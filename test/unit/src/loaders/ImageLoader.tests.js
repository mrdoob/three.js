import { ImageLoader } from '../../../../src/loaders/ImageLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ImageLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ImageLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ImageLoader extends from Loader'
			);

		} );

		QUnit.test( 'image request priority', async ( assert ) => {

			const image = await new ImageLoader().setPriority( 'high' ).loadAsync( '/examples/textures/uv_grid_opengl.jpg' );
			assert.strictEqual( image.fetchPriority, 'high' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ImageLoader();
			assert.ok( object, 'Can instantiate an ImageLoader.' );

		} );

	} );

} );
