import { assert, describe, test } from 'vitest';

import { LoaderUtils } from '../../../../src/loaders/LoaderUtils.js';

describe( 'Loaders', () => {

	describe( 'LoaderUtils', () => {

		// STATIC

		test( 'extractUrlBase', () => {

			assert.equal( '/path/to/', LoaderUtils.extractUrlBase( '/path/to/model.glb' ) );
			assert.equal( './', LoaderUtils.extractUrlBase( 'model.glb' ) );
			assert.equal( '/', LoaderUtils.extractUrlBase( '/model.glb' ) );

		} );

	} );

} );
