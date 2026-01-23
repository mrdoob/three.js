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
