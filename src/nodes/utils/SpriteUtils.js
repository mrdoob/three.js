import { modelWorldMatrix } from '../accessors/ModelNode.js';
import { cameraViewMatrix, cameraProjectionMatrix, cameraPosition } from '../accessors/Camera.js';
import { positionGeometry, positionWorld } from '../accessors/Position.js';
import { Fn, defined, nodeObject, vec3, vec4 } from '../tsl/TSLBase.js';

/**
 * This can be used to achieve a billboarding behavior for flat meshes. That means they are
 * oriented always towards the camera.
 *
 * ```js
 * material.vertexNode = billboarding();
 * ```
 *
 * @tsl
 * @function
 * @param {Object} config - The configuration object.
 * @param {?Node<vec3>} [config.position=null] - Can be used to define the billboard center position directly.
 * When null, the center is derived automatically from `positionWorld`.
 * @param {boolean} [config.horizontal=true] - Whether to follow the camera rotation horizontally or not.
 * @param {boolean} [config.vertical=false] - Whether to follow the camera rotation vertically or not.
 * @param {boolean} [config.horizontalRotation=false] - Whether to rotate around the Y axis to face the camera.
 * @return {Node<vec3>} The updated vertex position in clip space.
 */
export const billboarding = /*@__PURE__*/ Fn( ( { position = null, horizontal = true, vertical = false, horizontalRotation = false } ) => {

	let center;

	if ( position !== null ) {

		center = nodeObject( position );

	} else {

		center = positionWorld.sub( modelWorldMatrix.mul( vec4( positionGeometry, 0 ) ).xyz );

	}

	const worldMatrix = modelWorldMatrix.toVar();
	worldMatrix[ 3 ][ 0 ] = center.x;
	worldMatrix[ 3 ][ 1 ] = center.y;
	worldMatrix[ 3 ][ 2 ] = center.z;

	const modelViewMatrix = cameraViewMatrix.mul( worldMatrix );

	const scaleX = modelWorldMatrix[ 0 ].length();
	const scaleY = modelWorldMatrix[ 1 ].length();
	const scaleZ = modelWorldMatrix[ 2 ].length();

	let right, up, forward;

	if ( defined( horizontalRotation ) ) {

		const worldPosition = worldMatrix[ 3 ].xyz;
		const look = cameraPosition.sub( worldPosition );
		const lookXZ = vec3( look.x, 0, look.z ).normalize();

		const right_w = vec3( lookXZ.z, 0, lookXZ.x.negate() );

		right = cameraViewMatrix.mul( vec4( right_w, 0 ) ).xyz.mul( scaleX );
		up = cameraViewMatrix[ 1 ].xyz.mul( scaleY );
		forward = cameraViewMatrix.mul( vec4( lookXZ, 0 ) ).xyz.mul( scaleZ );

	} else {

		if ( defined( horizontal ) ) right = vec3( scaleX, 0, 0 );
		if ( defined( vertical ) ) up = vec3( 0, scaleY, 0 );

		forward = vec3( 0, 0, 1 );

	}

	if ( right ) {

		modelViewMatrix[ 0 ][ 0 ] = right.x;
		modelViewMatrix[ 0 ][ 1 ] = right.y;
		modelViewMatrix[ 0 ][ 2 ] = right.z;

	}

	if ( up ) {

		modelViewMatrix[ 1 ][ 0 ] = up.x;
		modelViewMatrix[ 1 ][ 1 ] = up.y;
		modelViewMatrix[ 1 ][ 2 ] = up.z;

	}

	if ( forward ) {

		modelViewMatrix[ 2 ][ 0 ] = forward.x;
		modelViewMatrix[ 2 ][ 1 ] = forward.y;
		modelViewMatrix[ 2 ][ 2 ] = forward.z;

	}

	return cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionGeometry );

} );
