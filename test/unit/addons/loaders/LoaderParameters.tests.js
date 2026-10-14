import { Rhino3dmLoader } from '../../../../examples/jsm/loaders/3DMLoader.js';
import { DRACOLoader } from '../../../../examples/jsm/loaders/DRACOLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'Loader parameters', () => {

			QUnit.test( 'Rhino model requests preserve selective settings and binary decoding', async ( assert ) => {

				const originalFetch = window.fetch;
				window.fetch = async ( request ) => {

					assert.strictEqual( request.url, 'https://example.org/models/constructor.3dm' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'model' );
					assert.strictEqual( request.credentials, 'same-origin', 'Model credentials were not previously inherited.' );
					assert.strictEqual( request.cache, 'no-store' );
					return new Response( new Uint8Array( [ 1, 2, 3 ] ) );

				};

				try {

					const loader = new Rhino3dmLoader();
					loader.setPath( 'https://example.org/models/' );
					loader.setPriority( 'low' );
					loader.setCache( 'no-store' );
					loader.setRequestHeader( { 'X-Asset': 'model' } );
					loader.setWithCredentials( true );
					loader.decodeObjects = async buffer => {

						assert.ok( buffer instanceof ArrayBuffer, 'The constructor override requests binary data.' );
						assert.strictEqual( buffer.byteLength, 3 );
						return { userData: {} };

					};

					await loader.loadAsync( 'constructor.3dm' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

			QUnit.test( 'Draco decoder requests do not inherit model paths or headers', async ( assert ) => {

				const originalFetch = window.fetch;
				window.fetch = async ( request ) => {

					assert.strictEqual( request.url, 'https://example.org/decoder/constructor.js' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), null );
					assert.strictEqual( request.credentials, 'include' );
					assert.strictEqual( request.cache, 'no-store' );
					return new Response( 'decoder' );

				};

				try {

					const loader = new DRACOLoader();
					loader.setPath( 'https://example.org/models/' );
					loader.setPriority( 'low' );
					loader.setCache( 'no-store' );
					loader.setRequestHeader( { 'X-Asset': 'model' } );
					loader.setWithCredentials( true );
					assert.strictEqual( await loader._loadLibrary( 'https://example.org/decoder/constructor.js', 'text' ), 'decoder' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

		} );

	} );

} );
