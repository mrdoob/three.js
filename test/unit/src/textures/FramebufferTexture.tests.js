import { assert, describe, test } from 'vitest';

import { FramebufferTexture } from '../../../../src/textures/FramebufferTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'FramebufferTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new FramebufferTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'FramebufferTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new FramebufferTexture();
			assert.ok( object, 'Can instantiate a FramebufferTexture.' );

		} );

		// PUBLIC
		test( 'isFramebufferTexture', () => {

			const object = new FramebufferTexture();
			assert.ok(
				object.isFramebufferTexture,
				'FramebufferTexture.isFramebufferTexture should be true'
			);

		} );

	} );

} );
