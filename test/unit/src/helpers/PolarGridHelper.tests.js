import { assert, describe, test } from 'vitest';

import { PolarGridHelper } from '../../../../src/helpers/PolarGridHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';

describe( 'Helpers', () => {

	describe( 'PolarGridHelper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new PolarGridHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'PolarGridHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PolarGridHelper();
			assert.ok( object, 'Can instantiate a PolarGridHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new PolarGridHelper();
			assert.ok(
				object.type === 'PolarGridHelper',
				'PolarGridHelper.type should be PolarGridHelper'
			);

		} );

		// PUBLIC
		test( 'dispose', () => {


			const object = new PolarGridHelper();
			object.dispose();

		} );

	} );

} );
