/**
 * @author jsantell / https://www.jsantell.com/
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../../math/Vector3.js';

var cameraLPos = new Vector3();
var cameraRPos = new Vector3();

/**
 * Assumes 2 cameras that are perpendicular and share an X-axis, and that
 * the cameras' projection and world matrices have already been set.
 * And that near and far planes are identical for both cameras.
 */
function setProjectionFromUnion( camera, cameraL, cameraR ) {

	cameraLPos.setFromMatrixPosition( cameraL.matrixWorld );
	cameraRPos.setFromMatrixPosition( cameraR.matrixWorld );

	var ipd = cameraLPos.distanceTo( cameraRPos );

	var projL = cameraL.projectionMatrix.elements;
	var projR = cameraR.projectionMatrix.elements;

	// VR systems will have identical far and near planes, and
	// most likely identical top and bottom frustum extents.
	// via: https://computergraphics.stackexchange.com/a/4765
	var near = projL[ 14 ] / ( projL[ 10 ] - 1 );
	var far = projL[ 14 ] / ( projL[ 10 ] + 1 );

	var leftFovL = ( projL[ 8 ] - 1 ) / projL[ 0 ];
	var rightFovR = ( projR[ 8 ] + 1 ) / projR[ 0 ];
	var leftL = leftFovL * near;
	var rightR = rightFovR * near;
	var topL = near * ( projL[ 9 ] + 1 ) / projL[ 5 ];
	var topR = near * ( projR[ 9 ] + 1 ) / projR[ 5 ];
	var bottomL = near * ( projL[ 9 ] - 1 ) / projL[ 5 ];
	var bottomR = near * ( projR[ 9 ] - 1 ) / projR[ 5 ];

	// Calculate the new camera's position offset from the
	// left camera.
	var zOffset = ipd / ( Math.abs( leftFovL ) + Math.abs( rightFovR ) );
	var xOffset = zOffset * leftFovL;

	// TODO: Better way to apply this offset?
	cameraL.matrixWorld.decompose( camera.position, camera.quaternion, camera.scale );
	camera.translateX( xOffset );
	camera.translateZ( - zOffset );
	camera.matrixWorld.compose( camera.position, camera.quaternion, camera.scale );
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	// Find the union of the frustum values of the cameras and scale
	// the values so that the near plane's position does not change in world space,
	// although must now be relative to the new union camera.
	var near2 = near + zOffset;
	var far2 = far + zOffset;
	var left = leftL - xOffset;
	var right = rightR + ( ipd - xOffset );
	var top = Math.max( topL, topR );
	var bottom = Math.min( bottomL, bottomR );

	camera.projectionMatrix.makePerspective( left, right, top, bottom, near2, far2 );

}

export { setProjectionFromUnion };
