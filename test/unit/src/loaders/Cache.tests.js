import { assert, describe, test } from 'vitest';

import { Cache } from '../../../../src/loaders/Cache.js';

describe( 'Loaders', () => {

	describe( 'Cache', () => {

		// PROPERTIES
		test( 'enabled', () => {

			const actual = Cache.enabled;
			const expected = false;
			assert.strictEqual( actual, expected, 'Cache defines enabled.' );

		} );

		test( 'files', () => {

			const actual = Cache.files;
			const expected = {};
			assert.deepEqual( actual, expected, 'Cache defines files.' );

		} );

	} );

} );
