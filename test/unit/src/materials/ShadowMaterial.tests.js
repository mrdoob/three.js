import { assert, describe, test } from 'vitest';

import { ShadowMaterial } from '../../../../src/materials/ShadowMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'ShadowMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ShadowMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'ShadowMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ShadowMaterial();
			assert.ok( object, 'Can instantiate a ShadowMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new ShadowMaterial();
			assert.ok(
				object.type === 'ShadowMaterial',
				'ShadowMaterial.type should be ShadowMaterial'
			);

		} );

		// PUBLIC
		test( 'isShadowMaterial', () => {

			const object = new ShadowMaterial();
			assert.ok(
				object.isShadowMaterial,
				'ShadowMaterial.isShadowMaterial should be true'
			);

		} );

	} );

} );
