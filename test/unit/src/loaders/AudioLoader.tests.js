import { assert, describe, test } from 'vitest';

import { AudioLoader } from '../../../../src/loaders/AudioLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'AudioLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new AudioLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'AudioLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new AudioLoader();
			assert.ok( object, 'Can instantiate an AudioLoader.' );

		} );

	} );

} );
