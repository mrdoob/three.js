/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineLoop } from '../../../../src/objects/LineLoop.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LineLoop', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const lineLoop = new LineLoop();

			assert.strictEqual( lineLoop instanceof Object3D, true, 'LineLoop extends from Object3D' );
			assert.strictEqual( lineLoop instanceof Line, true, 'LineLoop extends from Line' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new LineLoop();
			assert.ok( object, 'Can instantiate a LineLoop.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LineLoop();
			assert.ok(
				object.type === 'LineLoop',
				'LineLoop.type should be LineLoop'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLineLoop', ( assert ) => {

			const object = new LineLoop();
			assert.ok(
				object.isLineLoop,
				'LineLoop.isLineLoop should be true'
			);

		} );

	} );

} );
