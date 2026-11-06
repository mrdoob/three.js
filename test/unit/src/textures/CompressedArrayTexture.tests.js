import { assert, describe, test } from 'vitest';

import { CompressedArrayTexture } from '../../../../src/textures/CompressedArrayTexture.js';

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

describe( 'Textures', () => {

	describe( 'CompressedArrayTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CompressedArrayTexture();
			assert.strictEqual(
				object instanceof CompressedTexture, true,
				'CompressedArrayTexture extends from CompressedTexture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CompressedArrayTexture();
			assert.ok( object, 'Can instantiate a CompressedArrayTexture.' );

		} );

		// PUBLIC
		test( 'isCompressedArrayTexture', () => {

			const object = new CompressedArrayTexture();
			assert.ok(
				object.isCompressedArrayTexture,
				'CompressedArrayTexture.isCompressedArrayTexture should be true'
			);

		} );

	} );

} );
