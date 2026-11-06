import { assert, describe, test } from 'vitest';

import { ArrowHelper } from '../../../../src/helpers/ArrowHelper.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Helpers', () => {

	describe( 'ArrowHelper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ArrowHelper();
			assert.strictEqual(
				object instanceof Object3D, true,
				'ArrowHelper extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ArrowHelper();
			assert.ok( object, 'Can instantiate an ArrowHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new ArrowHelper();
			assert.ok(
				object.type === 'ArrowHelper',
				'ArrowHelper.type should be ArrowHelper'
			);

		} );

		// PUBLIC

		test( 'dispose', () => {


			const object = new ArrowHelper();
			object.dispose();

		} );

	} );

} );
