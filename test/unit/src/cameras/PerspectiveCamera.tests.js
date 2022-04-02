/* global QUnit */

import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'PerspectiveCamera', () => {

		// see e.g. math/Matrix4.js
		var matrixEquals4 = function ( a, b, tolerance ) {

			tolerance = tolerance || 0.0001;
			if ( a.elements.length != b.elements.length ) {

				return false;

			}

			for ( var i = 0, il = a.elements.length; i < il; i ++ ) {

				var delta = a.elements[ i ] - b.elements[ i ];
				if ( delta > tolerance ) {

					return false;

				}

			}

			return true;

		};

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isPerspectiveCamera', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFocalLength', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFocalLength', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getEffectiveFOV', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFilmWidth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getFilmHeight', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setViewOffset', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clearViewOffset', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'updateProjectionMatrix', ( assert ) => {

			var cam = new PerspectiveCamera( 75, 16 / 9, 0.1, 300.0 );

			// updateProjectionMatrix is called in constructor
			var m = cam.projectionMatrix;

			// perspective projection is given my the 4x4 Matrix
			// 2n/r-l		0			l+r/r-l				 0
			//   0		2n/t-b	t+b/t-b				 0
			//   0			0		-(f+n/f-n)	-(2fn/f-n)
			//   0			0				-1					 0

			// this matrix was calculated by hand via glMatrix.perspective(75, 16 / 9, 0.1, 300.0, pMatrix)
			// to get a reference matrix from plain WebGL
			var reference = new Matrix4().set(
				0.7330642938613892, 0, 0, 0,
				0, 1.3032253980636597, 0, 0,
				0, 0, - 1.000666856765747, - 0.2000666856765747,
				0, 0, - 1, 0
			);

			// assert.ok( reference.equals(m) );
			assert.ok( matrixEquals4( reference, m, 0.000001 ) );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		// TODO: no no no clone is a camera methods that relied to copy method
		QUnit.test( 'clone', ( assert ) => {

			var near = 1,
				far = 3,
				aspect = 16 / 9,
				fov = 90;

			var cam = new PerspectiveCamera( fov, aspect, near, far );

			var clonedCam = cam.clone();

			assert.ok( cam.fov === clonedCam.fov, 'fov is equal' );
			assert.ok( cam.aspect === clonedCam.aspect, 'aspect is equal' );
			assert.ok( cam.near === clonedCam.near, 'near is equal' );
			assert.ok( cam.far === clonedCam.far, 'far is equal' );
			assert.ok( cam.zoom === clonedCam.zoom, 'zoom is equal' );
			assert.ok( cam.projectionMatrix.equals( clonedCam.projectionMatrix ), 'projectionMatrix is equal' );

		} );

	} );

} );
