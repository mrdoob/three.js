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

		QUnit.test( 'constructor parameters', ( assert ) => {

			const parameter = {
				path: '/examples/textures/',
				crossOrigin: 'use-credentials',
				priority: 'high',
				cache: 'no-store',
				load: null,
				manager: null
			};
			const loader = new ImageLoader( undefined, parameter );
			assert.strictEqual( loader.path, parameter.path );
			assert.strictEqual( loader.crossOrigin, parameter.crossOrigin );
			assert.strictEqual( loader.priority, parameter.priority );
			assert.strictEqual( loader.cache, parameter.cache );
			assert.strictEqual( typeof loader.load, 'function', 'Unknown settings cannot replace methods' );
			assert.ok( loader.manager, 'Unknown settings cannot replace the manager' );
			parameter.priority = 'low';
			assert.strictEqual( loader.priority, 'high', 'Settings are copied at construction' );

			const defaults = new ImageLoader( undefined, { path: undefined, crossOrigin: undefined, priority: undefined, cache: undefined } );
			assert.strictEqual( defaults.path, '' );
			assert.strictEqual( defaults.crossOrigin, 'anonymous' );
			assert.strictEqual( defaults.priority, 'auto' );
			assert.strictEqual( defaults.cache, 'default' );
			const empty = new ImageLoader( undefined, { path: '', crossOrigin: '' } );
			assert.strictEqual( empty.path, '', 'Empty paths are retained' );
			assert.strictEqual( empty.crossOrigin, '', 'Empty CORS policies are retained' );

		} );

		QUnit.test( 'constructor settings apply to image requests and setters override them', async ( assert ) => {

			const loader = new ImageLoader( undefined, {
				path: '/examples/textures/',
				crossOrigin: 'anonymous',
				priority: 'high'
			} );
			const image = await loader.loadAsync( 'uv_grid_opengl.jpg' );
			assert.ok( image.naturalWidth > 0, 'The constructed loader loads the image' );
			assert.ok( image.src.endsWith( '/examples/textures/uv_grid_opengl.jpg' ), 'The constructor path resolves the request' );
			assert.strictEqual( image.crossOrigin, 'anonymous' );
			assert.strictEqual( image.fetchPriority, 'high' );

			loader.setPath( '/examples/textures/' ).setCrossOrigin( 'use-credentials' ).setPriority( 'low' ).setCache( 'no-cache' );
			const overridden = await loader.loadAsync( 'uv_grid_opengl.jpg?image-loader-parameters' );
			assert.ok( overridden.naturalWidth > 0, 'Setters still support loading' );
			assert.strictEqual( overridden.crossOrigin, 'use-credentials' );
			assert.strictEqual( overridden.fetchPriority, 'low' );
			assert.strictEqual( loader.cache, 'no-cache', 'The cache setter still overrides the copied setting' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ImageLoader();
			assert.ok( object, 'Can instantiate an ImageLoader.' );

		} );

	} );

} );
