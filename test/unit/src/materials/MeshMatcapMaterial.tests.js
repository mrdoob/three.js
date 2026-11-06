import { assert, describe, test } from 'vitest';

import { MeshMatcapMaterial } from '../../../../src/materials/MeshMatcapMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshMatcapMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshMatcapMaterial();

			assert.strictEqual(
				object instanceof Material, true,
				'MeshMatcapMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshMatcapMaterial();
			assert.ok( object, 'Can instantiate a MeshMatcapMaterial.' );

		} );

		// PROPERTIES
		test( 'defines', () => {

			const actual = new MeshMatcapMaterial().defines;
			const expected = { 'MATCAP': '' };
			assert.deepEqual( actual, expected, 'Contains a MATCAP definition.' );

		} );

		test( 'type', () => {

			const object = new MeshMatcapMaterial();
			assert.ok(
				object.type === 'MeshMatcapMaterial',
				'MeshMatcapMaterial.type should be MeshMatcapMaterial'
			);

		} );

		// PUBLIC
		test( 'isMeshMatcapMaterial', () => {

			const object = new MeshMatcapMaterial();
			assert.ok(
				object.isMeshMatcapMaterial,
				'MeshMatcapMaterial.isMeshMatcapMaterial should be true'
			);

		} );

	} );

} );
