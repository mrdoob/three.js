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
		QUnit.test( 'constructor parameters preserve defaults and setters', ( assert ) => {

			const manager = new Loader().manager;
			const parameters = Object.create( { path: 'assets/', priority: 'low' } );
			parameters.withCredentials = false;
			parameters.responseType = 'json';
			parameters.mimeType = 'application/json';
			parameters.cache = 'no-cache';
			parameters.requestHeader = { Accept: 'application/json' };
			parameters.manager = {};
			parameters.load = 'unsupported';
			const loader = new FileLoader( manager, parameters );

			assert.strictEqual( loader.manager, manager, 'The first argument determines the manager.' );
			assert.strictEqual( typeof loader.load, 'function', 'Unknown parameters cannot overwrite methods.' );
			assert.strictEqual( loader.path, 'assets/', 'Inherited defined properties are accepted.' );
			assert.strictEqual( loader.requestHeader, parameters.requestHeader, 'Headers retain setter reference semantics.' );
			assert.strictEqual( loader.mimeType, 'application/json' );
			assert.strictEqual( loader.withCredentials, false );
			parameters.path = 'changed/';
			assert.strictEqual( loader.path, 'assets/', 'Settings are copied once.' );
			assert.strictEqual( loader.setPath( '' ).setPriority( 'high' ).setCache( 'reload' ).setResponseType( '' ).setMimeType( '' ).setRequestHeader( {} ).setWithCredentials( true ), loader, 'Existing setters remain chainable.' );
			assert.strictEqual( loader.path, '', 'Setters can override constructor settings.' );
			assert.strictEqual( loader.priority, 'high' );
			assert.strictEqual( loader.withCredentials, true );

			const defaults = new FileLoader();
			const undefinedSettings = new FileLoader( undefined, { path: undefined, requestHeader: undefined, withCredentials: undefined, priority: undefined, cache: undefined, responseType: undefined, mimeType: undefined } );
			for ( const property of [ 'path', 'requestHeader', 'withCredentials', 'priority', 'cache', 'responseType', 'mimeType' ] ) {

				assert.deepEqual( undefinedSettings[ property ], defaults[ property ], `${ property }: undefined preserves the default.` );

			}

			const emptySettings = new FileLoader( undefined, { path: '', responseType: '', mimeType: '', withCredentials: false } );
			assert.strictEqual( emptySettings.path, '' );
			assert.strictEqual( emptySettings.responseType, '' );
			assert.strictEqual( emptySettings.mimeType, '' );
			assert.strictEqual( emptySettings.withCredentials, false );

		} );

		QUnit.test( 'constructor parameters configure requests and decoding', async ( assert ) => {

			const originalFetch = window.fetch;
			const OriginalRequest = window.Request;
			let options;
			window.Request = function ( url, init ) {

				options = init;
				return new OriginalRequest( url, init );

			};

			window.fetch = async ( request ) => {

				assert.strictEqual( request.url, 'https://example.org/constructor-settings/asset.json' );
				assert.strictEqual( request.credentials, 'include' );
				assert.strictEqual( request.headers.get( 'Accept' ), 'application/json' );
				assert.strictEqual( request.cache, 'no-store' );
				return new Response( '{"ok":true}' );

			};

			try {

				const loader = new FileLoader( undefined, { path: 'https://example.org/constructor-settings/', requestHeader: { Accept: 'application/json' }, withCredentials: true, priority: 'high', cache: 'no-store', responseType: 'json' } );
				assert.deepEqual( await loader.loadAsync( 'asset.json' ), { ok: true }, 'The response type controls decoding.' );
				assert.strictEqual( options.priority, 'high' );

			} finally {

				window.fetch = originalFetch;
				window.Request = OriginalRequest;

			}

		} );

		QUnit.test( 'Instancing', ( assert ) => {

			const object = new FileLoader();
			assert.ok( object, 'Can instantiate a FileLoader.' );

		} );

	} );

} );
