import { FileLoader } from '../../../../src/loaders/FileLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'FileLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new FileLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'FileLoader extends from Loader'
			);

		} );

		QUnit.test( 'fetch request settings', async ( assert ) => {

			const originalFetch = window.fetch;
			const OriginalRequest = window.Request;
			let options;
			window.Request = function ( url, init ) {

				options = init;
				return new OriginalRequest( url, init );

			};

			window.fetch = async ( request ) => {

				assert.strictEqual( request.cache, 'no-store' );
				return new Response( 'asset' );

			};

			try {

				const data = await new FileLoader().setPriority( 'high' ).setCache( 'no-store' ).loadAsync( 'https://example.org/request-settings' );
				assert.strictEqual( options.priority, 'high' );
				assert.strictEqual( data, 'asset' );

			} finally {

				window.fetch = originalFetch;
				window.Request = OriginalRequest;

			}

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new FileLoader();
			assert.ok( object, 'Can instantiate a FileLoader.' );

		} );

	} );

} );
