import { assert, describe, test } from 'vitest';

import { FileLoader } from '../../../../src/loaders/FileLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'FileLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new FileLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'FileLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new FileLoader();
			assert.ok( object, 'Can instantiate a FileLoader.' );

		} );

	} );

} );
