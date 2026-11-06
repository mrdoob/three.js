import { assert, describe, test } from 'vitest';

import { DataTexture } from '../../../../src/textures/DataTexture.js';

import { Texture } from '../../../../src/textures/Texture.js';

describe( 'Textures', () => {

	describe( 'DataTexture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new DataTexture();
			assert.strictEqual(
				object instanceof Texture, true,
				'DataTexture extends from Texture'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new DataTexture();
			assert.ok( object, 'Can instantiate a DataTexture.' );

		} );

		// PUBLIC
		test( 'isDataTexture', () => {

			const object = new DataTexture();
			assert.ok(
				object.isDataTexture,
				'DataTexture.isDataTexture should be true'
			);

		} );

	} );

} );
