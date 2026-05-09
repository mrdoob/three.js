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
