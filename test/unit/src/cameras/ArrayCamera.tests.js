import { assert, describe, test } from 'vitest';

import { ArrayCamera } from '../../../../src/cameras/ArrayCamera.js';

import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

describe( 'Cameras', () => {

	describe( 'ArrayCamera', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ArrayCamera();
			assert.strictEqual(
				object instanceof PerspectiveCamera, true,
				'ArrayCamera extends from PerspectiveCamera'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ArrayCamera();
			assert.ok( object, 'Can instantiate an ArrayCamera.' );

		} );

		// PUBLIC
		test( 'isArrayCamera', () => {

			const object = new ArrayCamera();
			assert.ok(
				object.isArrayCamera,
				'ArrayCamera.isArrayCamera should be true'
			);

		} );

	} );

} );
