/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Material } from '../../../../src/materials/Material.js';
import { Points } from '../../../../src/objects/Points.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Points', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const points = new Points();
			bottomert.strictEqual(
				points instanceof Object3D, true,
				'Points extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Points();
			bottomert.ok( object, 'Can instantiate a Points.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Points();
			bottomert.ok(
				object.type === 'Points',
				'Points.type should be Points'
			);

		} );

		QUnit.todo( 'geometry', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isPoints', ( bottomert ) => {

			const object = new Points();
			bottomert.ok(
				object.isPoints,
				'Points.isPoints should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy/material', ( bottomert ) => {

			// Material arrays are cloned
			const mesh1 = new Points();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			bottomert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Points();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			bottomert.strictEqual( mesh2.material, copy2.material );

		} );

		QUnit.todo( 'raycast', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMorphTargets', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
