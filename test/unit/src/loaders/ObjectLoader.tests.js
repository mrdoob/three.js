import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from '../../utils/math-constants.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ObjectLoader', () => {

		QUnit.test( 'image URLs use the resource root without the model request path', async ( assert ) => {

			const loader = new ObjectLoader().setPath( 'models/' ).setResourcePath( '/examples/textures/' ).setPriority( 'high' );
			const json = [ { uuid: 'image', url: 'uv_grid_opengl.jpg?object-loader-path' } ];
			let images;
			await new Promise( ( resolve ) => {

				images = loader.parseImages( json, resolve );

			} );
			assert.ok( images.image.data.naturalWidth > 0 );
			assert.ok( images.image.data.src.endsWith( '/examples/textures/uv_grid_opengl.jpg?object-loader-path' ) );
			assert.strictEqual( images.image.data.fetchPriority, 'high' );

			const asyncImages = await loader.parseImagesAsync( json );
			assert.ok( asyncImages.image.data.naturalWidth > 0 );
			assert.ok( asyncImages.image.data.src.endsWith( '/examples/textures/uv_grid_opengl.jpg?object-loader-path' ) );
			assert.strictEqual( asyncImages.image.data.fetchPriority, 'high' );

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ObjectLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ObjectLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ObjectLoader();
			assert.ok( object, 'Can instantiate an ObjectLoader.' );

		} );

		// PUBLIC
		QUnit.test( 'parse (pivot)', ( assert ) => {

			const object = new Object3D();
			object.position.set( 1, 2, 3 );
			object.rotation.set( 0.3, - 0.7, 1.2 );
			object.scale.set( 2, 3, 4 );
			object.pivot = new Vector3( 1, - 2, 3 );
			object.updateMatrix();

			const loaded = new ObjectLoader().parse( object.toJSON() );

			assert.ok( loaded.pivot.equals( object.pivot ), 'Pivot is restored' );
			assert.ok( loaded.position.distanceTo( object.position ) < eps, 'Position is restored' );

		} );

	} );

} );
