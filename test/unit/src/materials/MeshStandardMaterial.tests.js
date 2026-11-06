import { MeshStandardMaterial } from '../../../../src/materials/MeshStandardMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshStandardMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshStandardMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshStandardMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshStandardMaterial();
			assert.ok( object, 'Can instantiate a MeshStandardMaterial.' );

		} );

		// PROPERTIES

		QUnit.test( 'type', ( assert ) => {

			const object = new MeshStandardMaterial();
			assert.ok(
				object.type === 'MeshStandardMaterial',
				'MeshStandardMaterial.type should be MeshStandardMaterial'
			);

		} );

		QUnit.test( 'envMapDiffuseEnabled', ( assert ) => {

			const object = new MeshStandardMaterial();
			assert.strictEqual( object.envMapDiffuseEnabled, true, 'envMapDiffuseEnabled defaults to true.' );

			const source = new MeshStandardMaterial( { envMapDiffuseEnabled: false } );
			assert.strictEqual( new MeshStandardMaterial().copy( source ).envMapDiffuseEnabled, false, 'copy() preserves envMapDiffuseEnabled.' );

			const json = source.toJSON();
			object.fromJSON( json );

			assert.strictEqual( json.envMapDiffuseEnabled, false, 'toJSON() serializes envMapDiffuseEnabled.' );
			assert.strictEqual( object.envMapDiffuseEnabled, false, 'fromJSON() restores envMapDiffuseEnabled.' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshStandardMaterial', ( assert ) => {

			const object = new MeshStandardMaterial();
			assert.ok(
				object.isMeshStandardMaterial,
				'MeshStandardMaterial.isMeshStandardMaterial should be true'
			);

		} );

	} );

} );
