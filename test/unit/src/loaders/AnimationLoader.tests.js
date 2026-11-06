import { assert, describe, test } from 'vitest';

import { AnimationLoader } from '../../../../src/loaders/AnimationLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'AnimationLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new AnimationLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'AnimationLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new AnimationLoader();
			assert.ok( object, 'Can instantiate an AnimationLoader.' );

		} );

	} );

} );
