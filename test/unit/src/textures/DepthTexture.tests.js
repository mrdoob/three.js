import { assert, describe, test } from 'vitest';

import { DepthTexture } from '../../../../src/textures/DepthTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'DepthTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DepthTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'DepthTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DepthTexture();
			assert.ok( object, 'Can instantiate a DepthTexture.' );

		} );

		// PUBLIC
		test( 'isDepthTexture', () => {

			const object = new DepthTexture();
			assert.ok(
				object.isDepthTexture,
				'DepthTexture.isDepthTexture should be true'
			);

		} );

	} );

} );
