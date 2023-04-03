/* global QUnit */

import { Scene } from '../../../../src/scenes/Scene.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Scenes', () => {

	QUnit.module( 'Scene', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new Scene();
			assert.strictEqual(
				object instanceof Object3D, true,
				'Scene extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Scene();
			assert.ok( object, 'Can instantiate a Scene.' );

		} );

		// PROPERTIES
		QUnit.todo( 'type', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'background', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'environment', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fog', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'backgroundBlurriness', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'backgroundIntensity', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'overrideMaterial', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isScene', ( assert ) => {

			const object = new Scene();
			assert.ok(
				object.isScene,
				'Scene.isScene should be true'
			);

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
