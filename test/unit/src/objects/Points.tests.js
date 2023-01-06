/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Points } from '../../../../src/objects/Points.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Points', () => {

		// INHERITANCE
		QUnit.test( 'isPoints', ( assert ) => {

			var points = new Points();

			assert.strictEqual( points instanceof Object3D, true, 'Points extends from Object3D' );

		} );

		// INSTANCING
		QUnit.todo( 'raycast', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
