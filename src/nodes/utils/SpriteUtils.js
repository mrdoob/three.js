import { modelWorldMatrix } from '../accessors/ModelNode.js';
import { cameraViewMatrix, cameraProjectionMatrix } from '../accessors/Camera.js';
import { positionLocal } from '../accessors/Position.js';
import { Fn, defined } from '../tsl/TSLBase.js';

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
 * @param {?Node<vec3>} [config.position=null] - Can be used to define the vertex positions in world space.
 * @param {boolean} [config.horizontal=true] - Whether to follow the camera rotation horizontally or not.
 * @param {boolean} [config.vertical=false] - Whether to follow the camera rotation vertically or not.
 * @return {Node<vec3>} The updated vertex position in clip space.
 */
export const billboarding = /*@__PURE__*/ Fn( ( { position = null, horizontal = true, vertical = false } ) => {

	let worldMatrix;

	if ( position !== null ) {

		worldMatrix = modelWorldMatrix.toVar();
		worldMatrix[ 3 ][ 0 ] = position.x;
		worldMatrix[ 3 ][ 1 ] = position.y;
		worldMatrix[ 3 ][ 2 ] = position.z;

	} else {

		worldMatrix = modelWorldMatrix;

	}

	const modelViewMatrix = cameraViewMatrix.mul( worldMatrix );

	if ( defined( horizontal ) ) {

		modelViewMatrix[ 0 ][ 0 ] = modelWorldMatrix[ 0 ].length();
		modelViewMatrix[ 0 ][ 1 ] = 0;
		modelViewMatrix[ 0 ][ 2 ] = 0;

	}

	if ( defined( vertical ) ) {

		modelViewMatrix[ 1 ][ 0 ] = 0;
		modelViewMatrix[ 1 ][ 1 ] = modelWorldMatrix[ 1 ].length();
		modelViewMatrix[ 1 ][ 2 ] = 0;

	}

	modelViewMatrix[ 2 ][ 0 ] = 0;
	modelViewMatrix[ 2 ][ 1 ] = 0;
	modelViewMatrix[ 2 ][ 2 ] = 1;

	return cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionLocal );

} );
