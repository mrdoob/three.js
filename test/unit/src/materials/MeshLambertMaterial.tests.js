import { MeshLambertMaterial } from '../../../../src/materials/MeshLambertMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshLambertMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshLambertMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshLambertMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshLambertMaterial();
			assert.ok( object, 'Can instantiate a MeshLambertMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshLambertMaterial();
			assert.ok(
				object.type === 'MeshLambertMaterial',
				'MeshLambertMaterial.type should be MeshLambertMaterial'
			);

		} );

		QUnit.test( 'envMapDiffuseEnabled', ( assert ) => {

			const object = new MeshLambertMaterial();
			assert.strictEqual( object.envMapDiffuseEnabled, true, 'envMapDiffuseEnabled defaults to true.' );

			const source = new MeshLambertMaterial( { envMapDiffuseEnabled: false } );
			assert.strictEqual( new MeshLambertMaterial().copy( source ).envMapDiffuseEnabled, false, 'copy() preserves envMapDiffuseEnabled.' );

			const json = source.toJSON();
			object.fromJSON( json );

			assert.strictEqual( json.envMapDiffuseEnabled, false, 'toJSON() serializes envMapDiffuseEnabled.' );
			assert.strictEqual( object.envMapDiffuseEnabled, false, 'fromJSON() restores envMapDiffuseEnabled.' );

		} );

		// PUBLIC
		QUnit.test( 'isMeshLambertMaterial', ( assert ) => {

			const object = new MeshLambertMaterial();
			assert.ok(
				object.isMeshLambertMaterial,
				'MeshLambertMaterial.isMeshLambertMaterial should be true'
			);

		} );

	} );

} );
