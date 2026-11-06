import { assert, describe, test } from 'vitest';

import { CameraHelper } from '../../../../src/helpers/CameraHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

describe( 'Helpers', () => {

	describe( 'CameraHelper', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			assert.strictEqual(
				object instanceof LineSegments, true,
				'CameraHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			assert.ok( object, 'Can instantiate a CameraHelper.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			assert.ok(
				object.type === 'CameraHelper',
				'CameraHelper.type should be CameraHelper'
			);

		} );

		// PUBLIC

		test( 'dispose', () => {


			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			object.dispose();

		} );

	} );

} );
