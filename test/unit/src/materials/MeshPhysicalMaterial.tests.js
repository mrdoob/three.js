import { assert, describe, test } from 'vitest';

import { MeshPhysicalMaterial } from '../../../../src/materials/MeshPhysicalMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

describe( 'Materials', () => {

	describe( 'MeshPhysicalMaterial', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new MeshPhysicalMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshPhysicalMaterial extends from Material'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new MeshPhysicalMaterial();
			assert.ok( object, 'Can instantiate a MeshPhysicalMaterial.' );

		} );

		// PROPERTIES

		test( 'type', () => {

			const object = new MeshPhysicalMaterial();
			assert.ok(
				object.type === 'MeshPhysicalMaterial',
				'MeshPhysicalMaterial.type should be MeshPhysicalMaterial'
			);

		} );

		test( 'retroreflectivity', () => {

			const object = new MeshPhysicalMaterial();
			assert.strictEqual( object.retroreflectivity, 0, 'retroreflectivity defaults to 0.' );

			object.retroreflectivity = 0.75;
			assert.strictEqual( object.retroreflectivity, 0.75, 'Can set retroreflectivity.' );

		} );

		test( 'copy copies retroreflectivity', () => {

			const source = new MeshPhysicalMaterial( { retroreflectivity: 0.5 } );
			const object = new MeshPhysicalMaterial();

			object.copy( source );

			assert.strictEqual( object.retroreflectivity, 0.5, 'copy() preserves retroreflectivity.' );

		} );

		test( 'fromJSON restores retroreflectivity', () => {

			const source = new MeshPhysicalMaterial( { retroreflectivity: 0.25 } );
			const json = source.toJSON();
			const object = new MeshPhysicalMaterial();

			object.fromJSON( json );

			assert.strictEqual( json.retroreflectivity, 0.25, 'toJSON() serializes retroreflectivity.' );
			assert.strictEqual( object.retroreflectivity, 0.25, 'fromJSON() restores retroreflectivity.' );

		} );

		// PUBLIC
		test( 'isMeshPhysicalMaterial', () => {

			const object = new MeshPhysicalMaterial();
			assert.ok(
				object.isMeshPhysicalMaterial,
				'MeshPhysicalMaterial.isMeshPhysicalMaterial should be true'
			);

		} );

	} );

} );
