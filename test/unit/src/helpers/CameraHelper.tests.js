import { CameraHelper } from '../../../../src/helpers/CameraHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'CameraHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			assert.strictEqual(
				object instanceof LineSegments, true,
				'CameraHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			assert.ok( object, 'Can instantiate a CameraHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			assert.ok(
				object.type === 'CameraHelper',
				'CameraHelper.type should be CameraHelper'
			);

		} );

		// PUBLIC

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			object.dispose();

		} );

	} );

} );
