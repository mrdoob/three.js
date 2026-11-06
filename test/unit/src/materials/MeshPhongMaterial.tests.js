import { assert, describe, test } from 'vitest';

import { MeshPhongMaterial } from '../../../../src/materials/MeshPhongMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshPhongMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshPhongMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshPhongMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshPhongMaterial();
			assert.ok( object, 'Can instantiate a MeshPhongMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new MeshPhongMaterial();
			assert.ok(
				object.type === 'MeshPhongMaterial',
				'MeshPhongMaterial.type should be MeshPhongMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshPhongMaterial', () => {

			const object = new MeshPhongMaterial();
			assert.ok(
				object.isMeshPhongMaterial,
				'MeshPhongMaterial.isMeshPhongMaterial should be true'
			);

		} );

	} );

} );
