/* global QUnit */

import { Cache } from '../../../../src/loaders/Cache.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'Cache', () => {

		// PROPERTIES
		QUnit.test( 'enabled', ( assert ) => {

			const actual = Cache.enabled;
			const expected = false;
			assert.strictEqual( actual, expected, 'Cache defines enabled.' );

		} );

		QUnit.test( 'files', ( assert ) => {

			const actual = Cache.files;
			const expected = {};
			assert.deepEqual( actual, expected, 'Cache defines files.' );

		} );

		// PUBLIC
		QUnit.todo( 'add', ( assert ) => {

			// function ( key, file )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'get', ( assert ) => {

			// function ( key )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'remove', ( assert ) => {

			// function ( key )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clear', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
