import { assert, describe, test } from 'vitest';

import { SpriteMaterial } from '../../../../src/materials/SpriteMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'SpriteMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new SpriteMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'SpriteMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new SpriteMaterial();
			assert.ok( object, 'Can instantiate a SpriteMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new SpriteMaterial();
			assert.ok(
				object.type === 'SpriteMaterial',
				'SpriteMaterial.type should be SpriteMaterial'
			);

		} );

		// PUBLIC
		test( 'isSpriteMaterial', () => {

			const object = new SpriteMaterial();
			assert.ok(
				object.isSpriteMaterial,
				'SpriteMaterial.isSpriteMaterial should be true'
			);

		} );

	} );

} );
