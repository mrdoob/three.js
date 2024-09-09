import { attribute } from '../core/AttributeNode.js';
import { cameraViewMatrix } from './Camera.js';
import { modelViewMatrix } from './ModelNode.js';
import { Fn, vec4 } from '../tsl/TSLBase.js';

export const tangentGeometry = /*@__PURE__*/ Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'tangent' ) === false ) {

		builder.geometry.computeTangents();

	}

	return attribute( 'tangent', 'vec4' );

} )();

export const tangentLocal = /*@__PURE__*/ tangentGeometry.xyz.toVar( 'tangentLocal' );
export const tangentView = /*@__PURE__*/ modelViewMatrix.mul( vec4( tangentLocal, 0 ) ).xyz.varying( 'v_tangentView' ).normalize().toVar( 'tangentView' );
export const tangentWorld = /*@__PURE__*/ tangentView.transformDirection( cameraViewMatrix ).varying( 'v_tangentWorld' ).normalize().toVar( 'tangentWorld' );
export const transformedTangentView = /*@__PURE__*/ tangentView.toVar( 'transformedTangentView' );
export const transformedTangentWorld = /*@__PURE__*/ transformedTangentView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedTangentWorld' );
