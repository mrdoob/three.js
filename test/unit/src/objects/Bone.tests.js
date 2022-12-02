/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Bone } from '../../../../src/objects/Bone.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Bone', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var bone = new Bone();

			assert.strictEqual( bone instanceof Object3D, true, 'Bone extends from Object3D' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isBone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );


	} );

} );
