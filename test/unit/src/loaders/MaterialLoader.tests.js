import { assert, describe, test } from 'vitest';

import { MaterialLoader } from '../../../../src/loaders/MaterialLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';

describe( 'Loaders', () => {

	describe( 'MaterialLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MaterialLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'MaterialLoader extends from Loader'
			);

		} );

		// PROPERTIES
		test( 'textures', () => {

			const actual = new MaterialLoader().textures;
			const expected = {};
			assert.deepEqual( actual, expected, 'MaterialLoader defines textures.' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MaterialLoader();
			assert.ok( object, 'Can instantiate a MaterialLoader.' );

		} );

	} );

} );
