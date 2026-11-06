import { assert, describe, test } from 'vitest';

import { Box3Helper } from '../../../../src/helpers/Box3Helper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

describe( 'Helpers', () => {

	describe( 'Box3Helper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Box3Helper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'Box3Helper extends from LineSegments'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Box3Helper();
			assert.ok( object, 'Can instantiate a Box3Helper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Box3Helper();
			assert.ok(
				object.type === 'Box3Helper',
				'Box3Helper.type should be Box3Helper'
			);

		} );

		// PUBLIC

		test( 'dispose', () => {


			const object = new Box3Helper();
			object.dispose();

		} );

	} );

} );
