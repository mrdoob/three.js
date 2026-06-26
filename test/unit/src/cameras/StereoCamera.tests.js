import { StereoCamera } from '../../../../src/cameras/StereoCamera.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'StereoCamera', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new StereoCamera();
			assert.ok( object, 'Can instantiate a StereoCamera.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new StereoCamera();
			assert.ok(
				object.type === 'StereoCamera',
				'StereoCamera.type should be StereoCamera'
			);

		} );

	} );

} );
