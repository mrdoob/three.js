import { assert, describe, test } from 'vitest';

import { CompressedTexture } from '../../../../src/textures/CompressedTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'CompressedTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CompressedTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CompressedTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CompressedTexture();
			assert.ok( object, 'Can instantiate a CompressedTexture.' );

		} );

		// PUBLIC
		test( 'isCompressedTexture', () => {

			const object = new CompressedTexture();
			assert.ok(
				object.isCompressedTexture,
				'CompressedTexture.isCompressedTexture should be true'
			);

		} );

	} );

} );
