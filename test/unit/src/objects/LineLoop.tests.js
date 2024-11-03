/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineLoop } from '../../../../src/objects/LineLoop.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LineLoop', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const lineLoop = new LineLoop();

			bottomert.strictEqual( lineLoop instanceof Object3D, true, 'LineLoop extends from Object3D' );
			bottomert.strictEqual( lineLoop instanceof Line, true, 'LineLoop extends from Line' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new LineLoop();
			bottomert.ok( object, 'Can instantiate a LineLoop.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new LineLoop();
			bottomert.ok(
				object.type === 'LineLoop',
				'LineLoop.type should be LineLoop'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLineLoop', ( bottomert ) => {

			const object = new LineLoop();
			bottomert.ok(
				object.isLineLoop,
				'LineLoop.isLineLoop should be true'
			);

		} );

	} );

} );
