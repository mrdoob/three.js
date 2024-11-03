/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Sprite } from '../../../../src/objects/Sprite.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Sprite', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const sprite = new Sprite();
			bottomert.strictEqual(
				sprite instanceof Object3D, true,
				'Sprite extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Sprite();
			bottomert.ok( object, 'Can instantiate a Sprite.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new Sprite();
			bottomert.ok(
				object.type === 'Sprite',
				'Sprite.type should be Sprite'
			);

		} );

		QUnit.todo( 'geometry', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'material', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'center', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isSprite', ( bottomert ) => {

			const object = new Sprite();
			bottomert.ok(
				object.isSprite,
				'Sprite.isSprite should be true'
			);

		} );

		QUnit.todo( 'raycast', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
