import { assert, describe, test } from 'vitest';

import { MeshStandardMaterial } from '../../../../src/materials/MeshStandardMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshStandardMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshStandardMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshStandardMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshStandardMaterial();
			assert.ok( object, 'Can instantiate a MeshStandardMaterial.' );

		} );

		// PROPERTIES

		test( 'type', () => {

			const object = new MeshStandardMaterial();
			assert.ok(
				object.type === 'MeshStandardMaterial',
				'MeshStandardMaterial.type should be MeshStandardMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshStandardMaterial', () => {

			const object = new MeshStandardMaterial();
			assert.ok(
				object.isMeshStandardMaterial,
				'MeshStandardMaterial.isMeshStandardMaterial should be true'
			);

		} );

	} );

} );
