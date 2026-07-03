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

		QUnit.test( 'retroreflective', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.strictEqual( object.retroreflective, 0, 'retroreflective defaults to 0.' );

			object.retroreflective = 0.75;
			assert.strictEqual( object.retroreflective, 0.75, 'Can set retroreflective.' );

		} );

		QUnit.test( 'copy copies retroreflective', ( assert ) => {

			const source = new MeshPhysicalMaterial( { retroreflective: 0.5 } );
			const object = new MeshPhysicalMaterial();

			object.copy( source );

			assert.strictEqual( object.retroreflective, 0.5, 'copy() preserves retroreflective.' );

		} );

		QUnit.test( 'fromJSON restores retroreflective', ( assert ) => {

			const source = new MeshPhysicalMaterial( { retroreflective: 0.25 } );
			const json = source.toJSON();
			const object = new MeshPhysicalMaterial();

			object.fromJSON( json );

			assert.strictEqual( json.retroreflective, 0.25, 'toJSON() serializes retroreflective.' );
			assert.strictEqual( object.retroreflective, 0.25, 'fromJSON() restores retroreflective.' );

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
