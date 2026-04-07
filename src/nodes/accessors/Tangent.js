import { attribute } from '../core/AttributeNode.js';
import { cameraViewMatrix } from './Camera.js';
import { modelViewMatrix } from './ModelNode.js';
import { Fn, vec4 } from '../tsl/TSLBase.js';
import { tangentViewFrame } from './TangentUtils.js';
import { directionToFaceDirection } from '../display/FrontFacingNode.js';

/**
 * TSL object that represents the tangent attribute of the current rendered object.
 *
 * @tsl
 * @type {Node<vec4>}
 */
export const tangentGeometry = /*@__PURE__*/ attribute( 'tangent', 'vec4' );

/**
 * TSL object that represents the vertex tangent in local space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const tangentLocal = /*@__PURE__*/ tangentGeometry.xyz.toVar( 'tangentLocal' );

/**
 * TSL object that represents the vertex tangent in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const tangentView = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.subBuildFn === 'VERTEX' || builder.geometry.hasAttribute( 'tangent' ) ) {

		node = modelViewMatrix.mul( vec4( tangentLocal, 0 ) ).xyz.toVarying( 'v_tangentView' ).normalize();

	} else {

		node = tangentViewFrame;

	}

	if ( builder.isFlatShading() !== true ) {

		node = directionToFaceDirection( node );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'tangentView' );

/**
 * TSL object that represents the vertex tangent in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const tangentWorld = /*@__PURE__*/ tangentView.transformDirection( cameraViewMatrix ).toVarying( 'v_tangentWorld' ).normalize().toVar( 'tangentWorld' );
