import { assert, describe, test } from 'vitest';

import { Data3DTexture } from '../../../../src/textures/Data3DTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'Data3DTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Data3DTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'Data3DTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Data3DTexture();
			assert.ok( object, 'Can instantiate a Data3DTexture.' );

		} );

		// PUBLIC
		test( 'isData3DTexture', () => {

			const object = new Data3DTexture();
			assert.ok(
				object.isData3DTexture,
				'Data3DTexture.isData3DTexture should be true'
			);

		} );

	} );

} );
