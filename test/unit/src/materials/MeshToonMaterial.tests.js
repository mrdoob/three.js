import { assert, describe, test } from 'vitest';

import { MeshToonMaterial } from '../../../../src/materials/MeshToonMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshToonMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshToonMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshToonMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshToonMaterial();
			assert.ok( object, 'Can instantiate a MeshToonMaterial.' );

		} );

		// PROPERTIES

		test( 'type', () => {

			const object = new MeshToonMaterial();
			assert.ok(
				object.type === 'MeshToonMaterial',
				'MeshToonMaterial.type should be MeshToonMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshToonMaterial', () => {

			const object = new MeshToonMaterial();
			assert.ok(
				object.isMeshToonMaterial,
				'MeshToonMaterial.isMeshToonMaterial should be true'
			);

		} );

	} );

} );
