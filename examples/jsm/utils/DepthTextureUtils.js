import { Vector2, Vector3 } from 'three';

const NDC = new Vector3();
const cursorNDC = new Vector2();
const z_Axis = new Vector3( 0, 0, - 1 );
/**
 * Converts depth to view position.
 * @param {Vector2} cursorNDC - Normalized device coordinates of the cursor.
 * @param {number} depth - Depth value.
 * @param {Camera} camera - Camera object.
 * @returns {Vector3} - View position.
 */
function depthToViewPosition( cursorNDC, depth, camera ) {

	// depth to Z NDC
	const zNDC = 2.0 * depth - 1.0;

	NDC.set( cursorNDC.x, cursorNDC.y, zNDC );

	const viewPosition = NDC.applyMatrix4( camera.projectionMatrixInverse );

	return viewPosition;

}

/**
 * Converts logarithmic depth to view position.
 * @param {Vector2} cursorNDC - Normalized device coordinates of the cursor.
 * @param {number} logDepth - Logarithmic depth value.
 * @param {Camera} camera - Camera object.
 * @returns {Vector3} - View position.
 */
function logDepthToViewPosition( cursorNDC, logDepth, camera ) {

	const w = ( camera.far + 1.0 ) ** logDepth - 1;

	NDC.set( cursorNDC.x, cursorNDC.y, - 1 );
	const viewPosition = NDC.applyMatrix4( camera.projectionMatrixInverse );

	const angle = viewPosition.angleTo( z_Axis );
	viewPosition.setLength( w / Math.cos( angle ) );

	return viewPosition;

}

const buffer = new Float32Array( 4 );

/**
 * Computes the 3D world position corresponding to a given 2D mouse position on the screen,
 * using depth information from a render target.
 *
 * @param {Object} mouse - The mouse position in screen coordinates.
 * @param {number} mouse.x - The x-coordinate of the mouse on the screen.
 * @param {number} mouse.y - The y-coordinate of the mouse on the screen.
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer used to access the render target and canvas size.
 * @param {THREE.WebGLRenderTarget} renderTarget - The render target that contains depth data.
 * @param {THREE.Camera} camera - The camera used for the scene. Supports both perspective and orthographic cameras.
 * @param {THREE.Vector3} target - A pre-allocated Vector3 to store the resulting world position.
 * @returns {THREE.Vector3} The computed world position corresponding to the mouse input.
 *
 * This function:
 * 1. Converts the mouse position from screen space to canvas space.
 * 2. Reads the depth value from the render target at that position.
 * 3. Converts the position from normalized device coordinates (NDC) and depth into view space.
 * 4. Transforms the result into world space using the camera's world matrix.
 *
 * It supports both regular and logarithmic depth buffers.
 */

const pickWorldPosition = ( mouse, renderer, renderTarget, camera, target ) => {

	const canvasRect = renderer.domElement.getBoundingClientRect();

	const left = mouse.x - canvasRect.left;
	const bottom = canvasRect.bottom - mouse.y;

	renderer.readRenderTargetPixels( renderTarget, left, bottom, 1, 1, buffer );

	const depth = buffer[ 0 ];

	cursorNDC.setX( ( left / canvasRect.width ) * 2 - 1 );
	cursorNDC.setY( ( bottom / canvasRect.height ) * 2 - 1 );

	if ( renderer.capabilities.logarithmicDepthBuffer && camera.isPerspectiveCamera ) {

		target.copy( logDepthToViewPosition( cursorNDC, depth, camera ) );

	} else {

		target.copy( depthToViewPosition( cursorNDC, depth, camera ) );

	}

	target.applyMatrix4( camera.matrixWorld );

	return target;

};

export { pickWorldPosition };
