/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
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

		QUnit.todo( 'geometry', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isPoints', ( assert ) => {

			const object = new Points();
			assert.ok(
				object.isPoints,
				'Points.isPoints should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateMorphTargets', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
