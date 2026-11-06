import { assert, describe, test } from 'vitest';

import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshBasicMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshBasicMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshBasicMaterial();
			assert.ok( object, 'Can instantiate a MeshBasicMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new MeshBasicMaterial();
			assert.ok(
				object.type === 'MeshBasicMaterial',
				'MeshBasicMaterial.type should be MeshBasicMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshBasicMaterial', () => {

			const object = new MeshBasicMaterial();
			assert.ok(
				object.isMeshBasicMaterial,
				'MeshBasicMaterial.isMeshBasicMaterial should be true'
			);

		} );

	} );

} );
