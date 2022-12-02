/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineLoop } from '../../../../src/objects/LineLoop.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LineLoop', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			var lineLoop = new LineLoop();
	
			assert.strictEqual( lineLoop instanceof Object3D, true, 'LineLoop extends from Object3D' );
			assert.strictEqual( lineLoop instanceof Line, true, 'LineLoop extends from Line' );
	
		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isLineLoop', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );


	} );

} );
