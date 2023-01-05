/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Line', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var line = new Line();
	
			assert.strictEqual( line instanceof Object3D, true, 'Line extends from Object3D' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isLine', ( assert ) => {

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
