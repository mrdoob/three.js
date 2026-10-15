import { MeshPhongMaterial } from '../../../../src/materials/MeshPhongMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshPhongMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshPhongMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.ok( object, 'Can instantiate a MeshPhongMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.ok(
				object.type === 'MeshPhongMaterial',
				'MeshPhongMaterial.type should be MeshPhongMaterial'
			);

		} );

		QUnit.test( 'envMapDiffuseEnabled', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.strictEqual( object.envMapDiffuseEnabled, true, 'envMapDiffuseEnabled defaults to true.' );

			const source = new MeshPhongMaterial( { envMapDiffuseEnabled: false } );
			assert.strictEqual( new MeshPhongMaterial().copy( source ).envMapDiffuseEnabled, false, 'copy() preserves envMapDiffuseEnabled.' );

			const json = source.toJSON();
			object.fromJSON( json );

			assert.strictEqual( json.envMapDiffuseEnabled, false, 'toJSON() serializes envMapDiffuseEnabled.' );
			assert.strictEqual( object.envMapDiffuseEnabled, false, 'fromJSON() restores envMapDiffuseEnabled.' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshPhongMaterial', ( assert ) => {

			const object = new MeshPhongMaterial();
			assert.ok(
				object.isMeshPhongMaterial,
				'MeshPhongMaterial.isMeshPhongMaterial should be true'
			);

		} );

	} );

} );
