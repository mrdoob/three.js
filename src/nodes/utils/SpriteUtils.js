import { modelWorldMatrix } from '../accessors/ModelNode.js';
import { cameraViewMatrix, cameraProjectionMatrix } from '../accessors/Camera.js';
import { positionLocal } from '../accessors/Position.js';
import { Fn, defined } from '../tsl/TSLBase.js';

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
