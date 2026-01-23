import { MeshMatcapMaterial } from '../../../../src/materials/MeshMatcapMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshMatcapMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshMatcapMaterial();

			assert.strictEqual(
				object instanceof Material, true,
				'MeshMatcapMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshMatcapMaterial();
			assert.ok( object, 'Can instantiate a MeshMatcapMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'defines', ( assert ) => {

			const actual = new MeshMatcapMaterial().defines;
			const expected = { 'MATCAP': '' };
			assert.deepEqual( actual, expected, 'Contains a MATCAP definition.' );

		} );

		QUnit.test( 'type', ( assert ) => {

			const object = new MeshMatcapMaterial();
			assert.ok(
				object.type === 'MeshMatcapMaterial',
				'MeshMatcapMaterial.type should be MeshMatcapMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshMatcapMaterial', ( assert ) => {

			const object = new MeshMatcapMaterial();
			assert.ok(
				object.isMeshMatcapMaterial,
				'MeshMatcapMaterial.isMeshMatcapMaterial should be true'
			);

		} );

	} );

} );
