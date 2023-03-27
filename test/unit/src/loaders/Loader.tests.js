/* global QUnit */

import { Loader } from '../../../../src/loaders/Loader.js';

import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'Loader', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Loader();
			assert.ok( object, 'Can instantiate a Loader.' );

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

		// PUBLIC
		QUnit.todo( 'load', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loadAsync', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parse', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setCrossOrigin', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setWithCredentials', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setPath', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setResourcePath', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setRequestHeader', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
