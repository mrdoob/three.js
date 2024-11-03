/* global QUnit */

import { ArrayCamera } from '../../../../src/cameras/ArrayCamera.js';

import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'ArrayCamera', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ArrayCamera();
			bottomert.strictEqual(
				object instanceof PerspectiveCamera, true,
				'ArrayCamera extends from PerspectiveCamera'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ArrayCamera();
			bottomert.ok( object, 'Can instantiate an ArrayCamera.' );

		} );

		// PROPERTIES
		QUnit.todo( 'cameras', ( bottomert ) => {

			// array
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isArrayCamera', ( bottomert ) => {

			const object = new ArrayCamera();
			bottomert.ok(
				object.isArrayCamera,
				'ArrayCamera.isArrayCamera should be true'
			);

		} );

	} );

} );
