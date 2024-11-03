/* global QUnit */

import { Line } from '../../../../src/objects/Line.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { Material } from '../../../../src/materials/Material.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Line', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const line = new Line();
			bottomert.strictEqual(
				line instanceof Object3D, true,
				'Line extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Line();
			bottomert.ok( object, 'Can instantiate a Line.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Line();
			bottomert.ok(
				object.type === 'Line',
				'Line.type should be Line'
			);

		} );

		QUnit.todo( 'geometry', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isLine', ( bottomert ) => {

			const object = new Line();
			bottomert.ok(
				object.isLine,
				'Line.isLine should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy/material', ( bottomert ) => {

			// Material arrays are cloned
			const mesh1 = new Line();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			bottomert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Line();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			bottomert.strictEqual( mesh2.material, copy2.material );

		} );

		QUnit.todo( 'computeLineDistances', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMorphTargets', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			// inherited from Object3D, test instance specific behaviour.
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
