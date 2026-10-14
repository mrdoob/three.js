import { TextureLoader } from '../../../../src/loaders/TextureLoader.js';

import { ImageLoader } from '../../../../src/loaders/ImageLoader.js';
import { CubeTextureLoader } from '../../../../src/loaders/CubeTextureLoader.js';
import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'TextureLoader', () => {


		QUnit.test( 'nested images preserve disabled CORS', ( assert ) => {

			const originalLoad = ImageLoader.prototype.load;
			let requests = 0;
			ImageLoader.prototype.load = function () {

				requests ++;
				assert.strictEqual( this.crossOrigin, undefined, 'The child preserves explicitly disabled CORS.' );

			};

			try {

				new TextureLoader().setCrossOrigin( undefined ).load( 'image.jpg' );
				new CubeTextureLoader().setCrossOrigin( undefined ).load( [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ] );
				assert.strictEqual( requests, 7 );

			} finally {

				ImageLoader.prototype.load = originalLoad;

			}

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new TextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'TextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TextureLoader();
			assert.ok( object, 'Can instantiate a TextureLoader.' );

		} );

	} );

} );
