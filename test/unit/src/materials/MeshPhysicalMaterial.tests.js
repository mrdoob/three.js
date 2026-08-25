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

		QUnit.test( 'diffuseRoughness', ( assert ) => {

			const object = new MeshPhysicalMaterial();
			assert.strictEqual( object.diffuseRoughness, 0, 'diffuseRoughness defaults to 0.' );

			const initialVersion = object.version;
			object.diffuseRoughness = 0.75;
			assert.strictEqual( object.diffuseRoughness, 0.75, 'Can set diffuseRoughness.' );
			assert.strictEqual( object.version, initialVersion + 1, 'Enabling EON invalidates the shader.' );

			object.diffuseRoughness = 0.5;
			assert.strictEqual( object.version, initialVersion + 1, 'Changing an enabled EON roughness reuses the shader.' );

			object.diffuseRoughness = 0;
			assert.strictEqual( object.version, initialVersion + 2, 'Disabling EON invalidates the shader.' );

		} );

		QUnit.test( 'copy copies retroreflectivity', ( assert ) => {

			const source = new MeshPhysicalMaterial( { retroreflectivity: 0.5 } );
			const object = new MeshPhysicalMaterial();

			object.copy( source );

			assert.strictEqual( object.retroreflectivity, 0.5, 'copy() preserves retroreflectivity.' );

		} );

		QUnit.test( 'copy copies diffuseRoughness', ( assert ) => {

			const source = new MeshPhysicalMaterial( { diffuseRoughness: 0.6 } );
			const object = new MeshPhysicalMaterial();

			object.copy( source );

			assert.strictEqual( object.diffuseRoughness, 0.6, 'copy() preserves diffuseRoughness.' );

		} );

		QUnit.test( 'fromJSON restores retroreflectivity', ( assert ) => {

			const source = new MeshPhysicalMaterial( { retroreflectivity: 0.25 } );
			const json = source.toJSON();
			const object = new MeshPhysicalMaterial();

			object.fromJSON( json );

			assert.strictEqual( json.retroreflectivity, 0.25, 'toJSON() serializes retroreflectivity.' );
			assert.strictEqual( object.retroreflectivity, 0.25, 'fromJSON() restores retroreflectivity.' );

		} );

		QUnit.test( 'fromJSON restores diffuseRoughness', ( assert ) => {

			const source = new MeshPhysicalMaterial( { diffuseRoughness: 0.4 } );
			const json = source.toJSON();
			const object = new MeshPhysicalMaterial();

			object.fromJSON( json );

			assert.strictEqual( json.diffuseRoughness, 0.4, 'toJSON() serializes diffuseRoughness.' );
			assert.strictEqual( object.diffuseRoughness, 0.4, 'fromJSON() restores diffuseRoughness.' );

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
