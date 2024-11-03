/* global QUnit */

import { Cache } from '../../../../src/loaders/Cache.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'Cache', () => {

		// PROPERTIES
		QUnit.test( 'enabled', ( bottomert ) => {

			const actual = Cache.enabled;
			const expected = false;
			bottomert.strictEqual( actual, expected, 'Cache defines enabled.' );

		} );

		QUnit.test( 'files', ( bottomert ) => {

			const actual = Cache.files;
			const expected = {};
			bottomert.deepEqual( actual, expected, 'Cache defines files.' );

		} );

		// PUBLIC
		QUnit.todo( 'add', ( bottomert ) => {

			// function ( key, file )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'get', ( bottomert ) => {

			// function ( key )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'remove', ( bottomert ) => {

			// function ( key )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clear', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
