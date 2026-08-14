import { ArrayCamera } from '../../../../src/cameras/ArrayCamera.js';

import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { Frustum } from '../../../../src/math/Frustum.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Cameras', () => {

	QUnit.module( 'ArrayCamera', () => {

		const NDC_INSET = [
			[ 0, 0, 0 ],
			[ - 0.9, - 0.9, - 0.9 ], [ 0.9, - 0.9, - 0.9 ],
			[ - 0.9, 0.9, - 0.9 ], [ 0.9, 0.9, - 0.9 ],
			[ - 0.9, - 0.9, 0.9 ], [ 0.9, - 0.9, 0.9 ],
			[ - 0.9, 0.9, 0.9 ], [ 0.9, 0.9, 0.9 ]
		];

		function createEyeCamera( x, rotationY, rotationZ, left, right, top, bottom, near, far ) {

			const camera = new PerspectiveCamera();
			camera.position.set( x, 0, 0 );
			camera.rotation.set( 0, rotationY, rotationZ );

			if ( far === Infinity ) {

				const te = camera.projectionMatrix.elements;
				const xScale = 2 * near / ( right - left );
				const yScale = 2 * near / ( top - bottom );
				const a = ( right + left ) / ( right - left );
				const b = ( top + bottom ) / ( top - bottom );
				te[ 0 ] = xScale; te[ 4 ] = 0; te[ 8 ] = a; te[ 12 ] = 0;
				te[ 1 ] = 0; te[ 5 ] = yScale; te[ 9 ] = b; te[ 13 ] = 0;
				te[ 2 ] = 0; te[ 6 ] = 0; te[ 10 ] = - 1; te[ 14 ] = - 2 * near;
				te[ 3 ] = 0; te[ 7 ] = 0; te[ 11 ] = - 1; te[ 15 ] = 0;

			} else {

				camera.projectionMatrix.makePerspective( left, right, top, bottom, near, far );

			}

			camera.projectionMatrixInverse.copy( camera.projectionMatrix ).invert();
			camera.updateMatrixWorld( true );
			return camera;

		}

		function sampleEyePoints( camera, infiniteFar ) {

			const origin = new Vector3().setFromMatrixPosition( camera.matrixWorld );
			const points = [];
			const count = infiniteFar ? 5 : NDC_INSET.length;

			for ( let i = 0; i < count; i ++ ) {

				const ndc = NDC_INSET[ i ];
				const point = new Vector3( ndc[ 0 ], ndc[ 1 ], ndc[ 2 ] );
				point.applyMatrix4( camera.projectionMatrixInverse );
				point.applyMatrix4( camera.matrixWorld );
				points.push( point );

				if ( infiniteFar === true && i > 0 && i < 5 ) {

					points.push( point.clone().sub( origin ).normalize().multiplyScalar( 40 ).add( origin ) );

				}

			}

			return points;

		}

		function unionContainsEyePoints( camera, cameraL, cameraR, infiniteFar ) {

			const projScreen = new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			const frustum = new Frustum().setFromProjectionMatrix( projScreen );
			const points = sampleEyePoints( cameraL, infiniteFar ).concat( sampleEyePoints( cameraR, infiniteFar ) );

			for ( let i = 0; i < points.length; i ++ ) {

				if ( frustum.containsPoint( points[ i ] ) === false ) {

					return false;

				}

			}

			return true;

		}

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ArrayCamera();
			assert.strictEqual(
				object instanceof PerspectiveCamera, true,
				'ArrayCamera extends from PerspectiveCamera'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ArrayCamera();
			assert.ok( object, 'Can instantiate an ArrayCamera.' );

		} );

		// PUBLIC
		QUnit.test( 'isArrayCamera', ( assert ) => {

			const object = new ArrayCamera();
			assert.ok(
				object.isArrayCamera,
				'ArrayCamera.isArrayCamera should be true'
			);

		} );

		QUnit.test( 'setProjectionFromUnion/parallel cameras', ( assert ) => {

			const near = 0.1;
			const far = 100;
			const cameraL = createEyeCamera( - 0.032, 0, 0, - 0.08, 0.06, 0.07, - 0.07, near, far );
			const cameraR = createEyeCamera( 0.032, 0, 0, - 0.06, 0.08, 0.07, - 0.07, near, far );
			const camera = new ArrayCamera();

			camera.setProjectionFromUnion( cameraL, cameraR );

			assert.ok(
				unionContainsEyePoints( camera, cameraL, cameraR, false ),
				'Union frustum contains both parallel eye view volumes'
			);

			const projScreen = new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			const frustum = new Frustum().setFromProjectionMatrix( projScreen );
			assert.ok(
				frustum.containsPoint( new Vector3( 0, 0, 10 ) ) === false,
				'Point behind the stereo pair is culled'
			);

		} );

		QUnit.test( 'setProjectionFromUnion/non-parallel cameras', ( assert ) => {

			// Eye-tracked / Magic Leap style: unique FOVs plus a relative rotation.
			const near = 0.1;
			const far = 100;
			const toeIn = 10 * Math.PI / 180;
			const roll = 6 * Math.PI / 180;
			const cameraL = createEyeCamera( - 0.032, toeIn, roll, - 0.08, 0.06, 0.07, - 0.07, near, far );
			const cameraR = createEyeCamera( 0.032, - toeIn, - roll, - 0.06, 0.08, 0.075, - 0.065, near, far );
			const camera = new ArrayCamera();

			camera.setProjectionFromUnion( cameraL, cameraR );

			assert.ok(
				unionContainsEyePoints( camera, cameraL, cameraR, false ),
				'Union frustum contains both non-parallel eye view volumes'
			);

			const projScreen = new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			const frustum = new Frustum().setFromProjectionMatrix( projScreen );
			assert.ok(
				frustum.containsPoint( new Vector3( 0, 0, 10 ) ) === false,
				'Point behind the stereo pair is culled'
			);

		} );

		QUnit.test( 'setProjectionFromUnion/infinite far plane', ( assert ) => {

			const near = 0.1;
			const toeIn = 10 * Math.PI / 180;
			const cameraL = createEyeCamera( - 0.032, toeIn, 0, - 0.08, 0.06, 0.07, - 0.07, near, Infinity );
			const cameraR = createEyeCamera( 0.032, - toeIn, 0, - 0.06, 0.08, 0.07, - 0.07, near, Infinity );
			const camera = new ArrayCamera();

			camera.setProjectionFromUnion( cameraL, cameraR );

			assert.strictEqual(
				camera.projectionMatrix.elements[ 10 ],
				- 1,
				'Union projection keeps an infinite far plane'
			);
			assert.ok(
				unionContainsEyePoints( camera, cameraL, cameraR, true ),
				'Union frustum contains both infinite eye view volumes'
			);

		} );

	} );

} );
