/* global QUnit */

import { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera.js';

import { Camera } from '../../../../src/cameras/Camera.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'OrthographicCamera', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new OrthographicCamera();
			bottomert.strictEqual(
				object instanceof Camera, true,
				'OrthographicCamera extends from Camera'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new OrthographicCamera();
			bottomert.ok( object, 'Can instantiate an OrthographicCamera.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new OrthographicCamera();
			bottomert.ok(
				object.type === 'OrthographicCamera',
				'OrthographicCamera.type should be OrthographicCamera'
			);

		} );

		QUnit.todo( 'zoom', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'view', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'left', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'right', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'top', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'bottom', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'near', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'far', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isOrthographicCamera', ( bottomert ) => {

			const object = new OrthographicCamera();
			bottomert.ok(
				object.isOrthographicCamera,
				'OrthographicCamera.isOrthographicCamera should be true'
			);

		} );

		QUnit.todo( 'copy', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setViewOffset', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clearViewOffset', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'updateProjectionMatrix', ( bottomert ) => {

			const left = - 1, right = 1, top = 1, bottom = - 1, near = 1, far = 3;
			const cam = new OrthographicCamera( left, right, top, bottom, near, far );

			// updateProjectionMatrix is called in constructor
			const pMatrix = cam.projectionMatrix.elements;

			// orthographic projection is given my the 4x4 Matrix
			// 2/r-l		0			 0		-(l+r/r-l)
			//   0		2/t-b		 0		-(t+b/t-b)
			//   0			0		-2/f-n	-(f+n/f-n)
			//   0			0			 0				1

			bottomert.ok( pMatrix[ 0 ] === 2 / ( right - left ), 'm[0,0] === 2 / (r - l)' );
			bottomert.ok( pMatrix[ 5 ] === 2 / ( top - bottom ), 'm[1,1] === 2 / (t - b)' );
			bottomert.ok( pMatrix[ 10 ] === - 2 / ( far - near ), 'm[2,2] === -2 / (f - n)' );
			bottomert.ok( pMatrix[ 12 ] === - ( ( right + left ) / ( right - left ) ), 'm[3,0] === -(r+l/r-l)' );
			bottomert.ok( pMatrix[ 13 ] === - ( ( top + bottom ) / ( top - bottom ) ), 'm[3,1] === -(t+b/b-t)' );
			bottomert.ok( pMatrix[ 14 ] === - ( ( far + near ) / ( far - near ) ), 'm[3,2] === -(f+n/f-n)' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		// TODO: clone is a camera methods that relied to copy method
		QUnit.test( 'clone', ( bottomert ) => {

			const left = - 1.5, right = 1.5, top = 1, bottom = - 1, near = 0.1, far = 42;
			const cam = new OrthographicCamera( left, right, top, bottom, near, far );

			const clonedCam = cam.clone();

			bottomert.ok( cam.left === clonedCam.left, 'left is equal' );
			bottomert.ok( cam.right === clonedCam.right, 'right is equal' );
			bottomert.ok( cam.top === clonedCam.top, 'top is equal' );
			bottomert.ok( cam.bottom === clonedCam.bottom, 'bottom is equal' );
			bottomert.ok( cam.near === clonedCam.near, 'near is equal' );
			bottomert.ok( cam.far === clonedCam.far, 'far is equal' );
			bottomert.ok( cam.zoom === clonedCam.zoom, 'zoom is equal' );

		} );

	} );

} );
