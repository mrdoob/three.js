import { MeshDepthMaterial } from '../../../../src/materials/MeshDepthMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshDepthMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshDepthMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.ok( object, 'Can instantiate a MeshDepthMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.ok(
				object.type === 'MeshDepthMaterial',
				'MeshDepthMaterial.type should be MeshDepthMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshDepthMaterial', ( assert ) => {

			const object = new MeshDepthMaterial();
			assert.ok(
				object.isMeshDepthMaterial,
				'MeshDepthMaterial.isMeshDepthMaterial should be true'
			);

		} );

	} );

} );
