import { assert, describe, test } from 'vitest';

import { CubeTextureLoader } from '../../../../src/loaders/CubeTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'CubeTextureLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CubeTextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'CubeTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CubeTextureLoader();
			assert.ok( object, 'Can instantiate a CubeTextureLoader.' );

		} );

	} );

} );
