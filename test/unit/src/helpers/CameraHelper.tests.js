import { CameraHelper } from '../../../../src/helpers/CameraHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { Scene } from '../../../../src/scenes/Scene.js';

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

		QUnit.test( 'clone', ( assert ) => {

			const camera = new PerspectiveCamera();
			camera.position.set( 1, 2, 3 );
			camera.updateMatrixWorld();

			const helper = new CameraHelper( camera );
			helper.name = 'frustum';

			const clone = helper.clone();

			assert.ok( clone instanceof CameraHelper, 'clone is a CameraHelper' );
			assert.notStrictEqual( clone, helper, 'clone is a distinct object' );
			assert.strictEqual( clone.camera, camera, 'clone visualizes the same camera' );
			assert.strictEqual( clone.matrix, camera.matrixWorld, 'clone.matrix stays bound to camera.matrixWorld' );
			assert.strictEqual( clone.matrixAutoUpdate, false, 'clone does not overwrite the camera matrix' );
			assert.strictEqual( clone.name, 'frustum', 'clone copies the helper name' );

			camera.position.set( 4, 5, 6 );
			camera.updateMatrixWorld();

			assert.strictEqual(
				clone.matrix.elements[ 12 ],
				camera.matrixWorld.elements[ 12 ],
				'clone keeps tracking the camera world matrix'
			);

			clone.update();

			const position = clone.geometry.getAttribute( 'position' );
			assert.ok( Number.isFinite( position.getX( 0 ) ), 'clone.update() writes frustum positions' );

			const scene = new Scene();
			scene.add( helper );

			const sceneClone = scene.clone();
			const helperClone = sceneClone.children[ 0 ];

			assert.ok( helperClone instanceof CameraHelper, 'scene.clone() clones a child CameraHelper' );
			assert.strictEqual( helperClone.camera, camera, 'cloned scene helper keeps the original camera' );

		} );

	} );

} );
