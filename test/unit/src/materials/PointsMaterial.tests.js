import { PointsMaterial } from '../../../../src/materials/PointsMaterial.js';

import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'PointsMaterial', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PointsMaterial();
			assert.strictEqual(
				object instanceof Material, true,
				'PointsMaterial extends from Material'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PointsMaterial();
			assert.ok( object, 'Can instantiate a PointsMaterial.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PointsMaterial();
			assert.ok(
				object.type === 'PointsMaterial',
				'PointsMaterial.type should be PointsMaterial'
			);

		} );

		// PUBLIC
		QUnit.test( 'isPointsMaterial', ( assert ) => {

			const object = new PointsMaterial();
			assert.ok(
				object.isPointsMaterial,
				'PointsMaterial.isPointsMaterial should be true'
			);

		} );

	} );

} );
