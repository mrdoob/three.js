/* global QUnit */

import { CubeCamera } from '../../../../src/cameras/CubeCamera.js';

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'CubeCamera', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new CubeCamera();
			bottomert.strictEqual(
				object instanceof Object3D, true,
				'CubeCamera extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new CubeCamera();
			bottomert.ok( object, 'Can instantiate a CubeCamera.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new CubeCamera();
			bottomert.ok(
				object.type === 'CubeCamera',
				'CubeCamera.type should be CubeCamera'
			);

		} );

		QUnit.todo( 'renderTarget', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'update', ( bottomert ) => {

			// update( renderer, scene )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
