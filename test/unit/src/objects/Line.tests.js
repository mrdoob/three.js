import { Line } from '../../../../src/objects/Line.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Line', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const line = new Line();
			assert.strictEqual(
				line instanceof Object3D, true,
				'Line extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Line();
			assert.ok( object, 'Can instantiate a Line.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Line();
			assert.ok(
				object.type === 'Line',
				'Line.type should be Line'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLine', ( assert ) => {

			const object = new Line();
			assert.ok(
				object.isLine,
				'Line.isLine should be true'
			);

		} );

		QUnit.test( 'copy/material', ( assert ) => {

			// Material arrays are cloned
			const mesh1 = new Line();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			assert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Line();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			assert.strictEqual( mesh2.material, copy2.material );

		} );

	} );

} );
