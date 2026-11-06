import { assert, describe, test } from 'vitest';

import { CubeTexture } from '../../../../src/textures/CubeTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'CubeTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CubeTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'CubeTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CubeTexture();
			assert.ok( object, 'Can instantiate a CubeTexture.' );

		} );

		// PUBLIC
		test( 'isCubeTexture', () => {

			const object = new CubeTexture();
			assert.ok(
				object.isCubeTexture,
				'CubeTexture.isCubeTexture should be true'
			);

		} );

	} );

} );
