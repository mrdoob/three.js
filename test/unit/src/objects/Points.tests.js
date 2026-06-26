import { Object3D } from '../../../../src/core/Object3D.js';
import { Material } from '../../../../src/materials/Material.js';
import { Points } from '../../../../src/objects/Points.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Points', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const points = new Points();
			assert.strictEqual(
				points instanceof Object3D, true,
				'Points extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Points();
			assert.ok( object, 'Can instantiate a Points.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Points();
			assert.ok(
				object.type === 'Points',
				'Points.type should be Points'
			);

		} );

		// PUBLIC
		QUnit.test( 'isPoints', ( assert ) => {

			const object = new Points();
			assert.ok(
				object.isPoints,
				'Points.isPoints should be true'
			);

		} );

		QUnit.test( 'copy/material', ( assert ) => {

			// Material arrays are cloned
			const mesh1 = new Points();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			assert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Points();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			assert.strictEqual( mesh2.material, copy2.material );

		} );

	} );

} );
