import { assert, describe, test } from 'vitest';

import { CanvasTexture } from '../../../../src/textures/CanvasTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'CanvasTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CanvasTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CanvasTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CanvasTexture();
			assert.ok( object, 'Can instantiate a CanvasTexture.' );

		} );

		// PUBLIC
		test( 'isCanvasTexture', () => {

			const object = new CanvasTexture();
			assert.ok(
				object.isCanvasTexture,
				'CanvasTexture.isCanvasTexture should be true'
			);

		} );

	} );

} );
