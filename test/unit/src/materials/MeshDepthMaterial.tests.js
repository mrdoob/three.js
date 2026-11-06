import { assert, describe, test } from 'vitest';

import { MeshDepthMaterial } from '../../../../src/materials/MeshDepthMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshDepthMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshDepthMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshDepthMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshDepthMaterial();
			assert.ok( object, 'Can instantiate a MeshDepthMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new MeshDepthMaterial();
			assert.ok(
				object.type === 'MeshDepthMaterial',
				'MeshDepthMaterial.type should be MeshDepthMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshDepthMaterial', () => {

			const object = new MeshDepthMaterial();
			assert.ok(
				object.isMeshDepthMaterial,
				'MeshDepthMaterial.isMeshDepthMaterial should be true'
			);

		} );

	} );

} );
