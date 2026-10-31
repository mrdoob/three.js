import { FileLoader } from '../../../../src/loaders/FileLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { Cache } from '../../../../src/loaders/Cache.js';
import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'FileLoader', ( hooks ) => {

		let cacheEnabled, cacheFiles;

		hooks.beforeEach( () => {

			cacheEnabled = Cache.enabled;
			cacheFiles = Cache.files;
			Cache.enabled = false;
			Cache.clear();

		} );

		hooks.afterEach( () => {

			Cache.enabled = cacheEnabled;
			Cache.files = cacheFiles;

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new FileLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'FileLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new FileLoader();
			assert.ok( object, 'Can instantiate a FileLoader.' );

		} );

		QUnit.test( 'concurrent response types', async ( assert ) => {

			const url = 'data:text/plain,hello';

			for ( const types of [[ '', 'arraybuffer' ], [ 'arraybuffer', '' ]] ) {

				const results = await Promise.all( types.map( type => new FileLoader().setResponseType( type ).loadAsync( url ) ) );

				for ( let i = 0; i < types.length; i ++ ) {

					if ( types[ i ] === 'arraybuffer' ) {

						assert.ok( results[ i ] instanceof ArrayBuffer, 'ArrayBuffer response type is preserved.' );
						assert.strictEqual( new TextDecoder().decode( results[ i ] ), 'hello', 'ArrayBuffer content is preserved.' );

					} else {

						assert.strictEqual( results[ i ], 'hello', 'Text response type and content are preserved.' );

					}

				}

			}

		} );

		QUnit.test( 'cached response types', async ( assert ) => {

			Cache.enabled = true;
			const url = 'data:application/json,%7B%22value%22%3A1%7D';
			const text = await new FileLoader().loadAsync( url );
			const buffer = await new FileLoader().setResponseType( 'arraybuffer' ).loadAsync( url );
			const blob = await new FileLoader().setResponseType( 'blob' ).loadAsync( url );
			const json = await new FileLoader().setResponseType( 'json' ).loadAsync( url );

			assert.strictEqual( text, '{"value":1}', 'Text is cached separately.' );
			assert.ok( buffer instanceof ArrayBuffer, 'ArrayBuffer is cached separately.' );
			assert.ok( blob instanceof Blob, 'Blob is cached separately.' );
			assert.deepEqual( json, { value: 1 }, 'JSON is cached separately.' );
			assert.strictEqual( await new FileLoader().setResponseType( 'json' ).loadAsync( url ), json, 'Matching requests still use the cached value.' );

		} );

		QUnit.test( 'text mime types', async ( assert ) => {

			Cache.enabled = true;
			const url = 'data:text/plain,%E9';
			const latin = new FileLoader().setMimeType( 'text/plain;charset=windows-1252' );
			const utf8 = new FileLoader().setMimeType( 'text/plain;charset=utf-8' );
			const results = await Promise.all( [ latin.loadAsync( url ), utf8.loadAsync( url ) ] );

			assert.deepEqual( results, [ 'é', '\ufffd' ], 'Concurrent requests use their own character encoding.' );
			assert.strictEqual( await latin.loadAsync( url ), 'é', 'The cached Latin-1 response is preserved.' );
			assert.strictEqual( await utf8.loadAsync( url ), '\ufffd', 'The cached UTF-8 response is preserved.' );

		} );

		QUnit.test( 'document mime types', async ( assert ) => {

			Cache.enabled = true;
			const url = 'data:text/plain,%3Croot%3Evalue%3C%2Froot%3E';
			const html = new FileLoader().setResponseType( 'document' ).setMimeType( 'text/html' );
			const xml = new FileLoader().setResponseType( 'document' ).setMimeType( 'application/xml' );
			const results = await Promise.all( [ html.loadAsync( url ), xml.loadAsync( url ) ] );

			assert.strictEqual( results[ 0 ].documentElement.nodeName, 'HTML', 'HTML documents use the requested parser.' );
			assert.strictEqual( results[ 1 ].documentElement.nodeName, 'root', 'XML documents use the requested parser.' );
			assert.strictEqual( await xml.loadAsync( url ), results[ 1 ], 'The matching document is cached.' );

		} );

		QUnit.test( 'matching requests', async ( assert ) => {

			const url = 'data:application/json,%7B%22value%22%3A1%7D';
			const progress = [ 0, 0 ];
			const results = await Promise.all( progress.map( ( value, index ) => new FileLoader().setResponseType( 'json' ).loadAsync( url, event => {

				progress[ index ] = event.loaded;

			} ) ) );

			assert.strictEqual( results[ 0 ], results[ 1 ], 'Matching concurrent requests share one parsed response.' );
			assert.deepEqual( progress, [ 11, 11 ], 'Progress is delivered to both matching requests.' );

			let itemsTotal;
			const manager = new LoadingManager();
			const complete = new Promise( resolve => manager.onLoad = resolve );
			manager.onProgress = ( url, loaded, total ) => itemsTotal = total;

			await Promise.all( [
				new FileLoader( manager ).loadAsync( url ),
				new FileLoader( manager ).setResponseType( 'text' ).loadAsync( url )
			] );
			await complete;

			assert.strictEqual( itemsTotal, 1, 'Default and explicit text requests still share one load.' );

		} );

		QUnit.test( 'blob URLs are not cached', async ( assert ) => {

			Cache.enabled = true;
			const url = URL.createObjectURL( new Blob( [ 'hello' ] ) );

			try {

				const loader = new FileLoader().setResponseType( 'arraybuffer' );
				const first = await loader.loadAsync( url );
				const second = await loader.loadAsync( url );

				assert.ok( first instanceof ArrayBuffer && second instanceof ArrayBuffer, 'Blob URLs load successfully.' );
				assert.notStrictEqual( first, second, 'A subsequent blob URL load is not served from the cache.' );
				assert.deepEqual( Cache.files, {}, 'Blob URLs are excluded from the cache.' );

			} finally {

				URL.revokeObjectURL( url );

			}

		} );

		QUnit.test( 'response errors are isolated and cleaned up', async ( assert ) => {

			Cache.enabled = true;
			const url = 'data:text/plain,not-json';
			const json = new FileLoader().setResponseType( 'json' );
			const results = await Promise.allSettled( [ json.loadAsync( url ), json.loadAsync( url ), new FileLoader().loadAsync( url ) ] );

			assert.strictEqual( results[ 0 ].status, 'rejected', 'Invalid JSON rejects the first JSON request.' );
			assert.strictEqual( results[ 1 ].status, 'rejected', 'Invalid JSON rejects the duplicate JSON request.' );
			assert.strictEqual( results[ 0 ].reason, results[ 1 ].reason, 'Duplicate JSON requests share the error.' );
			assert.deepEqual( results[ 2 ], { status: 'fulfilled', value: 'not-json' }, 'A JSON parse error does not reject a text request.' );

			const retry = await Promise.allSettled( [ json.loadAsync( url ) ] );

			assert.strictEqual( retry[ 0 ].status, 'rejected', 'The failed request can be retried.' );
			assert.notStrictEqual( retry[ 0 ].reason, results[ 0 ].reason, 'The retry starts a new request.' );

		} );

	} );

} );
