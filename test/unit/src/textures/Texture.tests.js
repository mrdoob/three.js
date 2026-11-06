import { assert, describe, test } from 'vitest';

import { Texture } from '../../../../src/textures/Texture.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

describe( 'Textures', () => {

	describe( 'Texture', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Texture();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'Texture extends from EventDispatcher'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			// no params
			const object = new Texture();
			assert.ok( object, 'Can instantiate a Texture.' );

		} );

		// PUBLIC
		test( 'isTexture', () => {

			const object = new Texture();
			assert.ok(
				object.isTexture,
				'Texture.isTexture should be true'
			);

		} );

		test( 'dispose', () => {


			const object = new Texture();
			object.dispose();

		} );

	} );

} );
