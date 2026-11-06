import { assert, describe, test } from 'vitest';

import { DataTextureLoader } from '../../../../src/loaders/DataTextureLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'DataTextureLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DataTextureLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'DataTextureLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DataTextureLoader();
			assert.ok( object, 'Can instantiate a DataTextureLoader.' );

		} );

	} );

} );
