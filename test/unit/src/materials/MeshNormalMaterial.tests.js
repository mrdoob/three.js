import { assert, describe, test } from 'vitest';

import { MeshNormalMaterial } from '../../../../src/materials/MeshNormalMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshNormalMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshNormalMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshNormalMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshNormalMaterial();
			assert.ok( object, 'Can instantiate a MeshNormalMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new MeshNormalMaterial();
			assert.ok(
				object.type === 'MeshNormalMaterial',
				'MeshNormalMaterial.type should be MeshNormalMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshNormalMaterial', () => {

			const object = new MeshNormalMaterial();
			assert.ok(
				object.isMeshNormalMaterial,
				'MeshNormalMaterial.isMeshNormalMaterial should be true'
			);

		} );

	} );

} );
