/* global QUnit */

import { StereoCamera } from '../../../../src/cameras/StereoCamera.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'StereoCamera', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new StereoCamera();
			bottomert.ok( object, 'Can instantiate a StereoCamera.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new StereoCamera();
			bottomert.ok(
				object.type === 'StereoCamera',
				'StereoCamera.type should be StereoCamera'
			);

		} );

		QUnit.todo( 'aspect', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'eyeSep', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'cameraL', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'cameraR', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
