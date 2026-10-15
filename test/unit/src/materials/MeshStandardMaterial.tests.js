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

		QUnit.test( 'envMapDiffuse', ( assert ) => {

			const object = new MeshStandardMaterial();
			assert.strictEqual( object.envMapDiffuse, true, 'envMapDiffuse defaults to true.' );

			const source = new MeshStandardMaterial( { envMapDiffuse: false } );
			assert.strictEqual( new MeshStandardMaterial().copy( source ).envMapDiffuse, false, 'copy() preserves envMapDiffuse.' );

			const json = source.toJSON();
			object.fromJSON( json );

			assert.strictEqual( json.envMapDiffuse, false, 'toJSON() serializes envMapDiffuse.' );
			assert.strictEqual( object.envMapDiffuse, false, 'fromJSON() restores envMapDiffuse.' );

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
