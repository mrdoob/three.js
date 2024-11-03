/* global QUnit */

import { Loader } from '../../../../src/loaders/Loader.js';

import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'Loader', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Loader();
			bottomert.ok( object, 'Can instantiate a Loader.' );

		} );

		// PROPERTIES
		QUnit.test( 'manager', ( bottomert ) => {

			// uses default LoadingManager if not supplied in constructor
			const object = new Loader().manager;
			bottomert.strictEqual(
				object instanceof LoadingManager, true,
				'Loader defines a default manager if not supplied in constructor.'
			);

		} );

		QUnit.test( 'crossOrigin', ( bottomert ) => {

			const actual = new Loader().crossOrigin;
			const expected = 'anonymous';
			bottomert.strictEqual( actual, expected, 'Loader defines crossOrigin.' );

		} );

		QUnit.test( 'withCredentials', ( bottomert ) => {

			const actual = new Loader().withCredentials;
			const expected = false;
			bottomert.strictEqual( actual, expected, 'Loader defines withCredentials.' );

		} );

		QUnit.test( 'path', ( bottomert ) => {

			const actual = new Loader().path;
			const expected = '';
			bottomert.strictEqual( actual, expected, 'Loader defines path.' );

		} );

		QUnit.test( 'resourcePath', ( bottomert ) => {

			const actual = new Loader().resourcePath;
			const expected = '';
			bottomert.strictEqual( actual, expected, 'Loader defines resourcePath.' );

		} );

		QUnit.test( 'requestHeader', ( bottomert ) => {

			const actual = new Loader().requestHeader;
			const expected = {};
			bottomert.deepEqual( actual, expected, 'Loader defines requestHeader.' );

		} );

		// PUBLIC
		QUnit.todo( 'load', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loadAsync', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'parse', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setCrossOrigin', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setWithCredentials', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setPath', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setResourcePath', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setRequestHeader', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
