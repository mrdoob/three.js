import { describe, test } from 'vitest';
import { assert } from '../../utils/test-utils.js';

import { Camera } from '../../../../src/cameras/Camera.js';

import { Vector3 } from '../../../../src/math/Vector3.js';
import { Object3D } from '../../../../src/core/Object3D.js';

describe( 'Cameras', () => {

	describe( 'Camera', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new Camera();
			assert.strictEqual(
				object instanceof Object3D, true,
				'Camera extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Camera();
			assert.ok( object, 'Can instantiate a Camera.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Camera();
			assert.ok(
				object.type === 'Camera',
				'Camera.type should be Camera'
			);

		} );

		// PUBLIC
		test( 'isCamera', () => {

			const object = new Camera();
			assert.ok(
				object.isCamera,
				'Camera.isCamera should be true'
			);

		} );

		test( 'clone', () => {

			const cam = new Camera();

			// fill the matrices with any nonsense values just to see if they get copied
			cam.matrixWorldInverse.set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			cam.projectionMatrix.set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );

			const clonedCam = cam.clone();

			// TODO: do not rely equality on object methods
			// TODO: What's append if matrix.equal is wrongly implemented
			// TODO: this MUST be check by assert
			assert.ok( cam.matrixWorldInverse.equals( clonedCam.matrixWorldInverse ), 'matrixWorldInverse is equal' );
			assert.ok( cam.projectionMatrix.equals( clonedCam.projectionMatrix ), 'projectionMatrix is equal' );

		} );

		// OTHERS
		// TODO: this should not be here, Object3D related
		test( 'lookAt', () => {

			const cam = new Camera();
			cam.lookAt( new Vector3( 0, 1, - 1 ) );

			assert.numEqual( cam.rotation.x * ( 180 / Math.PI ), 45, 'x is equal' );

		} );

	} );

} );
