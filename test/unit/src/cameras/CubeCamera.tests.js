import { assert, describe, test } from 'vitest';

import { CubeCamera } from '../../../../src/cameras/CubeCamera.js';

import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Cameras', () => {

	describe( 'CubeCamera', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CubeCamera();
			assert.strictEqual(
				object instanceof Object3D, true,
				'CubeCamera extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CubeCamera();
			assert.ok( object, 'Can instantiate a CubeCamera.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new CubeCamera();
			assert.ok(
				object.type === 'CubeCamera',
				'CubeCamera.type should be CubeCamera'
			);

		} );

	} );

} );
