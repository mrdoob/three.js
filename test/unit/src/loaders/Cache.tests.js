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

	} );

} );
