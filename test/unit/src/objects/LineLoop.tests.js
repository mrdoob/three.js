import { assert, describe, test } from 'vitest';

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineLoop } from '../../../../src/objects/LineLoop.js';

describe( 'Objects', () => {

	describe( 'LineLoop', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const lineLoop = new LineLoop();

			assert.strictEqual( lineLoop instanceof Object3D, true, 'LineLoop extends from Object3D' );
			assert.strictEqual( lineLoop instanceof Line, true, 'LineLoop extends from Line' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new LineLoop();
			assert.ok( object, 'Can instantiate a LineLoop.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new LineLoop();
			assert.ok(
				object.type === 'LineLoop',
				'LineLoop.type should be LineLoop'
			);

		} );

		// PUBLIC
		test( 'isLineLoop', () => {

			const object = new LineLoop();
			assert.ok(
				object.isLineLoop,
				'LineLoop.isLineLoop should be true'
			);

		} );

	} );

} );
