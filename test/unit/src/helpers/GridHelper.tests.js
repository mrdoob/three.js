import { assert, describe, test } from 'vitest';

import { GridHelper } from '../../../../src/helpers/GridHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

describe( 'Helpers', () => {

	describe( 'GridHelper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new GridHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'GridHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new GridHelper();
			assert.ok( object, 'Can instantiate a GridHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new GridHelper();
			assert.ok(
				object.type === 'GridHelper',
				'GridHelper.type should be GridHelper'
			);

		} );

		// PUBLIC
		test( 'dispose', () => {


			const object = new GridHelper();
			object.dispose();

		} );

	} );

} );
