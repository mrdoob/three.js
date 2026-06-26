import { MeshToonMaterial } from '../../../../src/materials/MeshToonMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshToonMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshToonMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshToonMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshToonMaterial();
			assert.ok( object, 'Can instantiate a MeshToonMaterial.' );

		} );

		// PROPERTIES

		QUnit.test( 'type', ( assert ) => {

			const object = new MeshToonMaterial();
			assert.ok(
				object.type === 'MeshToonMaterial',
				'MeshToonMaterial.type should be MeshToonMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshToonMaterial', ( assert ) => {

			const object = new MeshToonMaterial();
			assert.ok(
				object.isMeshToonMaterial,
				'MeshToonMaterial.isMeshToonMaterial should be true'
			);

		} );

	} );

} );
