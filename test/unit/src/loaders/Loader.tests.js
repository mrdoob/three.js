import { assert, describe, test } from 'vitest';

import { Loader } from '../../../../src/loaders/Loader.js';

import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

describe( 'Loaders', () => {

	describe( 'Loader', () => {

		test( 'request settings', () => {

			const loader = new Loader();
			assert.strictEqual( loader.priority, 'auto' );
			assert.strictEqual( loader.cache, 'default' );
			assert.strictEqual( loader.setPriority( 'high' ), loader );
			assert.strictEqual( loader.setCache( 'no-store' ), loader );
			assert.strictEqual( loader.priority, 'high' );
			assert.strictEqual( loader.cache, 'no-store' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Loader();
			assert.ok( object, 'Can instantiate a Loader.' );

		} );

		// PROPERTIES
		test( 'manager', () => {

			// uses default LoadingManager if not supplied in constructor
			const object = new Loader().manager;
			assert.strictEqual(
				object instanceof LoadingManager, true,
				'Loader defines a default manager if not supplied in constructor.'
			);

		} );

		test( 'crossOrigin', () => {

			const actual = new Loader().crossOrigin;
			const expected = 'anonymous';
			assert.strictEqual( actual, expected, 'Loader defines crossOrigin.' );

		} );

		test( 'withCredentials', () => {

			const actual = new Loader().withCredentials;
			const expected = false;
			assert.strictEqual( actual, expected, 'Loader defines withCredentials.' );

		} );

		test( 'path', () => {

			const actual = new Loader().path;
			const expected = '';
			assert.strictEqual( actual, expected, 'Loader defines path.' );

		} );

		test( 'resourcePath', () => {

			const actual = new Loader().resourcePath;
			const expected = '';
			assert.strictEqual( actual, expected, 'Loader defines resourcePath.' );

		} );

		test( 'requestHeader', () => {

			const actual = new Loader().requestHeader;
			const expected = {};
			assert.deepEqual( actual, expected, 'Loader defines requestHeader.' );

		} );

	} );

} );
