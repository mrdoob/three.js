import { assert, describe, test } from 'vitest';

import { PlaneHelper } from '../../../../src/helpers/PlaneHelper.js';

import { Line } from '../../../../src/objects/Line.js';

describe( 'Helpers', () => {

	describe( 'PlaneHelper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new PlaneHelper();
			assert.strictEqual(
				object instanceof Line, true,
				'PlaneHelper extends from Line'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PlaneHelper();
			assert.ok( object, 'Can instantiate a PlaneHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new PlaneHelper();
			assert.ok(
				object.type === 'PlaneHelper',
				'PlaneHelper.type should be PlaneHelper'
			);

		} );

		// PUBLIC

		test( 'dispose', () => {


			const object = new PlaneHelper();
			object.dispose();

		} );

	} );

} );
