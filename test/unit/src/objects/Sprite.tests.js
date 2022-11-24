/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Sprite } from '../../../../src/objects/Sprite.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Sprite', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var sprite = new Sprite();
	
			assert.strictEqual( sprite instanceof Object3D, true, 'Sprite extends from Object3D' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isSprite', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'raycast', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
