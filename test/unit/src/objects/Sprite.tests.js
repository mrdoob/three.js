import { assert, describe, test } from 'vitest';

import { Object3D } from '../../../../src/core/Object3D.js';
import { Sprite } from '../../../../src/objects/Sprite.js';

describe( 'Objects', () => {

	describe( 'Sprite', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const sprite = new Sprite();
			assert.strictEqual(
				sprite instanceof Object3D, true,
				'Sprite extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Sprite();
			assert.ok( object, 'Can instantiate a Sprite.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Sprite();
			assert.ok(
				object.type === 'Sprite',
				'Sprite.type should be Sprite'
			);

		} );

		// PUBLIC
		test( 'isSprite', () => {

			const object = new Sprite();
			assert.ok(
				object.isSprite,
				'Sprite.isSprite should be true'
			);

		} );

	} );

} );
