import { assert, describe, test } from 'vitest';

import { DataArrayTexture } from '../../../../src/textures/DataArrayTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'DataArrayTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DataArrayTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'DataArrayTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DataArrayTexture();
			assert.ok( object, 'Can instantiate a DataArrayTexture.' );

		} );

		// PUBLIC
		test( 'isDataArrayTexture', () => {

			const object = new DataArrayTexture();
			assert.ok(
				object.isDataArrayTexture,
				'DataArrayTexture.isDataArrayTexture should be true'
			);

		} );

	} );

} );
