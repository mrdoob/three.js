import { MeshNormalMaterial } from '../../../../src/materials/MeshNormalMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'MeshNormalMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'MeshNormalMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.ok( object, 'Can instantiate a MeshNormalMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.ok(
				object.type === 'MeshNormalMaterial',
				'MeshNormalMaterial.type should be MeshNormalMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isMeshNormalMaterial', ( assert ) => {

			const object = new MeshNormalMaterial();
			assert.ok(
				object.isMeshNormalMaterial,
				'MeshNormalMaterial.isMeshNormalMaterial should be true'
			);

		} );

	} );

} );
