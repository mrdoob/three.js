/* global QUnit */

import { Camera } from '../../../../src/cameras/Camera';
import { Vector3 } from '../../../../src/math/Vector3';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'Camera', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isCamera", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "copy", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getWorldDirection", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "updateMatrixWorld", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "clone", ( assert ) => {

			var cam = new Camera();

			// fill the matrices with any nonsense values just to see if they get copied
			cam.matrixWorldInverse.set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			cam.projectionMatrix.set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );

			var clonedCam = cam.clone();

			// TODO: Uuuummmhhh DO NOT relie equality on object methods !
			// TODO: What's append if matrix.equal is wrongly implemented ???
			// TODO: this MUST be check by assert
			assert.ok( cam.matrixWorldInverse.equals( clonedCam.matrixWorldInverse ), "matrixWorldInverse is equal" );
			assert.ok( cam.projectionMatrix.equals( clonedCam.projectionMatrix ), "projectionMatrix is equal" );

		} );

		// OTHERS
		// TODO: this should not be here !!! This is Object3D stuff !!!
		QUnit.test( "lookAt", ( assert ) => {

			var cam = new Camera();
			cam.lookAt( new Vector3( 0, 1, - 1 ) );

			assert.numEqual( cam.rotation.x * ( 180 / Math.PI ), 45, "x is equal" );

		} );

	} );

} );
