import { MeshPhysicalMaterial } from '../../../../src/materials/MeshPhysicalMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshPhysicalMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshPhysicalMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.ok( object, 'Can instantiate a MeshPhysicalMaterial.' );

		} );

		// PROPERTIES

		QUnit.test( 'type', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.ok(
				object.type === 'MeshPhysicalMaterial',
				'MeshPhysicalMaterial.type should be MeshPhysicalMaterial'
			);

		} );

		QUnit.test( 'retroreflectivity', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.strictEqual( object.retroreflectivity, 0, 'retroreflectivity defaults to 0.' );

			object.retroreflectivity = 0.75;
			assert.strictEqual( object.retroreflectivity, 0.75, 'Can set retroreflectivity.' );

		} );

		QUnit.test( 'copy copies retroreflectivity', ( assert ) => {

			const source = new MeshPhysicalMaterial( { retroreflectivity: 0.5 } );
			const object = new MeshPhysicalMaterial();

			object.copy( source );

			assert.strictEqual( object.retroreflectivity, 0.5, 'copy() preserves retroreflectivity.' );

		} );

		QUnit.test( 'fromJSON restores retroreflectivity', ( assert ) => {

			const source = new MeshPhysicalMaterial( { retroreflectivity: 0.25 } );
			const json = source.toJSON();
			const object = new MeshPhysicalMaterial();

			object.fromJSON( json );

			assert.strictEqual( json.retroreflectivity, 0.25, 'toJSON() serializes retroreflectivity.' );
			assert.strictEqual( object.retroreflectivity, 0.25, 'fromJSON() restores retroreflectivity.' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshPhysicalMaterial', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.ok(
				object.isMeshPhysicalMaterial,
				'MeshPhysicalMaterial.isMeshPhysicalMaterial should be true'
			);

		} );

	} );

} );
