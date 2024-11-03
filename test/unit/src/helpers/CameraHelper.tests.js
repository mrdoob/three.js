/* global QUnit */

import { CameraHelper } from '../../../../src/helpers/CameraHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'CameraHelper', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			bottomert.strictEqual(
				object instanceof LineSegments, true,
				'CameraHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			bottomert.ok( object, 'Can instantiate a CameraHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			bottomert.ok(
				object.type === 'CameraHelper',
				'CameraHelper.type should be CameraHelper'
			);

		} );

		QUnit.todo( 'camera', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'pointMap', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'setColors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( bottomert ) => {

			bottomert.expect( 0 );

			const camera = new PerspectiveCamera();
			const object = new CameraHelper( camera );
			object.dispose();

		} );

	} );

} );
