import { CubeCamera } from '../../../../src/cameras/CubeCamera.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'CubeCamera', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CubeCamera();
			assert.strictEqual(
				object instanceof Object3D, true,
				'CubeCamera extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CubeCamera();
			assert.ok( object, 'Can instantiate a CubeCamera.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new CubeCamera();
			assert.ok(
				object.type === 'CubeCamera',
				'CubeCamera.type should be CubeCamera'
			);

		} );

	} );

} );
