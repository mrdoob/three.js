import { OrthographicCamera, Vector3, WebGPURenderer, WebGPUCoordinateSystem } from '../../../../../src/Three.WebGPU.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Renderer', () => {

		QUnit.test( '_updateCamera with XR disabled while presenting', ( assert ) => {

			const renderer = new WebGPURenderer();
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

			renderer.xr.isPresenting = true;
			renderer.xr.enabled = false;

			const result = renderer._updateCamera( camera, true );

			assert.strictEqual( result, camera, 'Uses the supplied camera for the output pass.' );
			assert.strictEqual( camera.coordinateSystem, WebGPUCoordinateSystem, 'Updates the camera coordinate system.' );
			assert.strictEqual( new Vector3().applyMatrix4( camera.projectionMatrix ).z, 0, 'The output triangle is inside the WebGPU clip volume.' );

		} );

		QUnit.test( '_updateCamera while presenting', ( assert ) => {

			const renderer = new WebGPURenderer();
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
			const projectionMatrix = camera.projectionMatrix.clone();

			renderer.xr.isPresenting = true;
			renderer.xr.enabled = true;
			renderer.xr.cameraAutoUpdate = false;

			const result = renderer._updateCamera( camera, true );

			assert.strictEqual( result, renderer.xr.getCamera(), 'Uses the XR camera.' );
			assert.ok( camera.projectionMatrix.equals( projectionMatrix ), 'Preserves the supplied camera projection.' );

		} );

		QUnit.test( '_updateCamera for an offscreen pass while presenting', ( assert ) => {

			const renderer = new WebGPURenderer();
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

			renderer.xr.isPresenting = true;
			renderer.xr.enabled = true;

			const result = renderer._updateCamera( camera, false );

			assert.strictEqual( result, camera, 'Uses the supplied camera for offscreen rendering.' );
			assert.strictEqual( camera.coordinateSystem, WebGPUCoordinateSystem, 'Updates the camera coordinate system.' );

		} );

	} );

} );
