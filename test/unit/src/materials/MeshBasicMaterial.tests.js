import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshBasicMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.ok( object, 'Can instantiate a MeshBasicMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.ok(
				object.type === 'MeshBasicMaterial',
				'MeshBasicMaterial.type should be MeshBasicMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshBasicMaterial', ( assert ) => {

			const object = new MeshBasicMaterial();
			assert.ok(
				object.isMeshBasicMaterial,
				'MeshBasicMaterial.isMeshBasicMaterial should be true'
			);

		} );

	} );

} );
