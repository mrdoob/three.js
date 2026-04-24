import { LineBasicMaterial } from '../../../../src/materials/LineBasicMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'LineBasicMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'LineBasicMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.ok( object, 'Can instantiate a LineBasicMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.ok(
				object.type === 'LineBasicMaterial',
				'LineBasicMaterial.type should be LineBasicMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLineBasicMaterial', ( assert ) => {

			const object = new LineBasicMaterial();
			assert.ok(
				object.isLineBasicMaterial,
				'LineBasicMaterial.isLineBasicMaterial should be true'
			);

		} );

	} );

} );
