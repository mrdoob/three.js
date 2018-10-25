/**
 * @author jsantell / https://www.jsantell.com/
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../../math/Vector3.js';

var cameraLPos = new Vector3();
var cameraRPos = new Vector3();

/**
 * Assumes 2 cameras that are parallel and share an X-axis, and that
 * the cameras' projection and world matrices have already been set.
 * And that near and far planes are identical for both cameras.
 * Visualization of this technique: https://computergraphics.stackexchange.com/a/4765
 */
function setProjectionFromUnion( camera, cameraL, cameraR ) {

	cameraLPos.setFromMatrixPosition( cameraL.matrixWorld );
	cameraRPos.setFromMatrixPosition( cameraR.matrixWorld );

	var ipd = cameraLPos.distanceTo( cameraRPos );

	var projL = cameraL.projectionMatrix.elements;
	var projR = cameraR.projectionMatrix.elements;

	// VR systems will have identical far and near planes, and
	// most likely identical top and bottom frustum extents.
	// Use the left camera for these values.
	var near = projL[ 14 ] / ( projL[ 10 ] - 1 );
	var far = projL[ 14 ] / ( projL[ 10 ] + 1 );
	var topFov = ( projL[ 9 ] + 1 ) / projL[ 5 ];
	var bottomFov  = ( projL[ 9 ] - 1 ) / projL[ 5 ];
	var top = near * topFov;
	var bottom = near * bottomFov;

	var leftFov = ( projL[ 8 ] - 1 ) / projL[ 0 ];
	var rightFov = ( projR[ 8 ] + 1 ) / projR[ 0 ];
	var left = near * leftFov;
	var right = near * rightFov;

	// Calculate the new camera's position offset from the
	// left camera. xOffset should be roughly half `ipd`.
	var zOffset = ipd / ( - leftFov + rightFov );
	var xOffset = zOffset * - leftFov;

	// TODO: Better way to apply this offset?
	cameraL.matrixWorld.decompose( camera.position, camera.quaternion, camera.scale );
	camera.translateX( xOffset );
	camera.translateZ( zOffset );
	camera.matrixWorld.compose( camera.position, camera.quaternion, camera.scale );
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	// Find the union of the frustum values of the cameras and scale
	// the values so that the near plane's position does not change in world space,
	// although must now be relative to the new union camera.
	var near2 = near + zOffset;
	var far2 = far + zOffset;
	var left2 = left - xOffset;
	var right2 = right + ( ipd - xOffset );
	var top2 = topFov * far / far2 * near2;
	var bottom2 = bottomFov * far / far2 * near2;

	camera.projectionMatrix.makePerspective( left2, right2, top2, bottom2, near2, far2 );

}

export { setProjectionFromUnion };
