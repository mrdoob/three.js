import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { cameraViewMatrix } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { tslFn, vec4 } from '../shadernode/ShaderNode.js';

export const tangentGeometry = /*#__PURE__*/ tslFn( ( stack, builder ) => {

	if ( builder.geometry.hasAttribute( 'tangent' ) === false ) {

		builder.geometry.computeTangents();

	}

	return attribute( 'tangent', 'vec4' );

} )();

export const tangentLocal = /*#__PURE__*/ varying( tangentGeometry.xyz, 'tangentLocal' );
export const tangentView = /*#__PURE__*/ varying( modelViewMatrix.mul( vec4( tangentLocal, 0 ) ).xyz, 'tangentView' ).normalize();
export const tangentWorld = /*#__PURE__*/ varying( tangentView.transformDirection( cameraViewMatrix ), 'tangentWorld' ).normalize();
export const transformedTangentView = /*#__PURE__*/ tangentView.toVar( 'transformedTangentView' );
export const transformedTangentWorld = /*#__PURE__*/ transformedTangentView.transformDirection( cameraViewMatrix ).normalize();
