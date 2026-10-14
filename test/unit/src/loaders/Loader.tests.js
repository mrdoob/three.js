import { AnimationLoader } from '../../../../src/loaders/AnimationLoader.js';
import { AudioLoader } from '../../../../src/loaders/AudioLoader.js';
import { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';
import { CompressedTextureLoader } from '../../../../src/loaders/CompressedTextureLoader.js';
import { CubeTextureLoader } from '../../../../src/loaders/CubeTextureLoader.js';
import { DataTextureLoader } from '../../../../src/loaders/DataTextureLoader.js';
import { FileLoader } from '../../../../src/loaders/FileLoader.js';
import { ImageBitmapLoader } from '../../../../src/loaders/ImageBitmapLoader.js';
import { ImageLoader } from '../../../../src/loaders/ImageLoader.js';
import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';
import { TextureLoader } from '../../../../src/loaders/TextureLoader.js';
import NodeLoader from '../../../../src/loaders/nodes/NodeLoader.js';
import NodeMaterialLoader from '../../../../src/loaders/nodes/NodeMaterialLoader.js';
import NodeObjectLoader from '../../../../src/loaders/nodes/NodeObjectLoader.js';
import { Loader } from '../../../../src/loaders/Loader.js';

import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'Loader', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Loader();
			assert.ok( object, 'Can instantiate a Loader.' );

		} );

		QUnit.test( 'request settings', ( assert ) => {

			const loader = new Loader();
			assert.strictEqual( loader.priority, 'auto' );
			assert.strictEqual( loader.cache, 'default' );
			assert.strictEqual( loader.setPriority( 'high' ), loader );
			assert.strictEqual( loader.setCache( 'no-store' ), loader );
			assert.strictEqual( loader.priority, 'high' );
			assert.strictEqual( loader.cache, 'no-store' );

		} );

		QUnit.test( 'constructor parameters', ( assert ) => {

			const manager = new LoadingManager();
			const parameters = Object.create( { path: 'assets/' } );
			Object.assign( parameters, {
				crossOrigin: '',
				withCredentials: true,
				resourcePath: 'textures/',
				requestHeader: { Accept: 'application/json' },
				priority: 'high',
				cache: 'no-store',
				manager: null,
				load: null
			} );
			const loader = new Loader( manager, parameters );

			assert.strictEqual( loader.manager, manager, 'The first argument determines the manager.' );
			assert.strictEqual( typeof loader.load, 'function', 'Unknown parameters cannot overwrite methods.' );
			for ( const property of [ 'crossOrigin', 'withCredentials', 'path', 'resourcePath', 'requestHeader', 'priority', 'cache' ] ) {

				assert.strictEqual( loader[ property ], parameters[ property ], property );

			}

			parameters.path = 'changed/';
			assert.strictEqual( loader.path, 'assets/', 'Settings are copied once.' );
			assert.strictEqual( loader.setPath( '' ), loader, 'Setters remain chainable.' );
			assert.strictEqual( loader.path, '', 'Setters override constructor settings.' );

			assert.strictEqual( new Loader( undefined, { crossOrigin: undefined } ).crossOrigin, undefined, 'Explicit undefined disables image CORS.' );

			const defaults = new Loader();
			const undefinedSettings = {};
			for ( const property of [ 'crossOrigin', 'withCredentials', 'path', 'resourcePath', 'requestHeader', 'priority', 'cache' ] ) {

				if ( property !== 'crossOrigin' ) undefinedSettings[ property ] = undefined;

			}

			assert.deepEqual( new Loader( undefined, undefinedSettings ), defaults, 'Undefined preserves defaults except for the image CORS policy.' );
			assert.notStrictEqual( defaults.requestHeader, new Loader().requestHeader, 'Default headers are unique to each loader.' );
			assert.strictEqual( new Loader( undefined, { withCredentials: false } ).withCredentials, false, 'False is retained.' );

		} );

		QUnit.test( 'subclasses forward constructor parameters', ( assert ) => {

			const manager = new LoadingManager();
			const parameters = { path: 'assets/', resourcePath: 'textures/', crossOrigin: 'use-credentials', withCredentials: true, requestHeader: { Accept: 'application/json' }, priority: 'low', cache: 'reload' };

			for ( const LoaderClass of [ AnimationLoader, AudioLoader, BufferGeometryLoader, CompressedTextureLoader, CubeTextureLoader, DataTextureLoader, FileLoader, ImageBitmapLoader, ImageLoader, MaterialLoader, ObjectLoader, TextureLoader, NodeLoader, NodeMaterialLoader, NodeObjectLoader ] ) {

				const loader = new LoaderClass( manager, parameters );
				assert.strictEqual( loader.manager, manager, `${ LoaderClass.name }: manager` );
				for ( const property of Object.keys( parameters ) ) {

					assert.strictEqual( loader[ property ], parameters[ property ], `${ LoaderClass.name }: ${ property }` );

				}

			}

		} );

		// PROPERTIES
		QUnit.test( 'manager', ( assert ) => {

			// uses default LoadingManager if not supplied in constructor
			const object = new Loader().manager;
			assert.strictEqual(
				object instanceof LoadingManager, true,
				'Loader defines a default manager if not supplied in constructor.'
			);

		} );

		QUnit.test( 'crossOrigin', ( assert ) => {

			const actual = new Loader().crossOrigin;
			const expected = 'anonymous';
			assert.strictEqual( actual, expected, 'Loader defines crossOrigin.' );

		} );

		QUnit.test( 'withCredentials', ( assert ) => {

			const actual = new Loader().withCredentials;
			const expected = false;
			assert.strictEqual( actual, expected, 'Loader defines withCredentials.' );

		} );

		QUnit.test( 'path', ( assert ) => {

			const actual = new Loader().path;
			const expected = '';
			assert.strictEqual( actual, expected, 'Loader defines path.' );

		} );

		QUnit.test( 'resourcePath', ( assert ) => {

			const actual = new Loader().resourcePath;
			const expected = '';
			assert.strictEqual( actual, expected, 'Loader defines resourcePath.' );

		} );

		QUnit.test( 'requestHeader', ( assert ) => {

			const actual = new Loader().requestHeader;
			const expected = {};
			assert.deepEqual( actual, expected, 'Loader defines requestHeader.' );

		} );

	} );

} );
