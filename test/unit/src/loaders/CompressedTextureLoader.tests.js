import { assert, describe, test } from 'vitest';

import { CompressedTextureLoader } from '../../../../src/loaders/CompressedTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'CompressedTextureLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CompressedTextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'CompressedTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CompressedTextureLoader();
			assert.ok( object, 'Can instantiate a CompressedTextureLoader.' );

		} );

	} );

} );
