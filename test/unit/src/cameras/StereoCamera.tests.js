import { assert, describe, test } from 'vitest';

import { StereoCamera } from '../../../../src/cameras/StereoCamera.js';

describe( 'Cameras', () => {

	describe( 'StereoCamera', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const object = new StereoCamera();
			assert.ok( object, 'Can instantiate a StereoCamera.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new StereoCamera();
			assert.ok(
				object.type === 'StereoCamera',
				'StereoCamera.type should be StereoCamera'
			);

		} );

	} );

} );
