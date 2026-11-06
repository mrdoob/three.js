import { assert, describe, test } from 'vitest';

import { TextureLoader } from '../../../../src/loaders/TextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'TextureLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new TextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'TextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new TextureLoader();
			assert.ok( object, 'Can instantiate a TextureLoader.' );

		} );

	} );

} );
