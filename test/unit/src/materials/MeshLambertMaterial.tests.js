import { assert, describe, test } from 'vitest';

import { MeshLambertMaterial } from '../../../../src/materials/MeshLambertMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshLambertMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshLambertMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshLambertMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshLambertMaterial();
			assert.ok( object, 'Can instantiate a MeshLambertMaterial.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new MeshLambertMaterial();
			assert.ok(
				object.type === 'MeshLambertMaterial',
				'MeshLambertMaterial.type should be MeshLambertMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshLambertMaterial', () => {

			const object = new MeshLambertMaterial();
			assert.ok(
				object.isMeshLambertMaterial,
				'MeshLambertMaterial.isMeshLambertMaterial should be true'
			);

		} );

	} );

} );
