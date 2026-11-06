import { assert, describe, test } from 'vitest';

import { MeshDistanceMaterial } from '../../../../src/materials/MeshDistanceMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshDistanceMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshDistanceMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshDistanceMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshDistanceMaterial();
			assert.ok( object, 'Can instantiate a MeshDistanceMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new MeshDistanceMaterial();
			assert.ok(
				object.type === 'MeshDistanceMaterial',
				'MeshDistanceMaterial.type should be MeshDistanceMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshDistanceMaterial', () => {

			const object = new MeshDistanceMaterial();
			assert.ok(
				object.isMeshDistanceMaterial,
				'MeshDistanceMaterial.isMeshDistanceMaterial should be true'
			);

		} );

	} );

} );
