import { attribute } from '../core/AttributeNode.js';
import { cameraWorldMatrix } from './Camera.js';
import { modelViewMatrix } from './ModelNode.js';
import { Fn, vec3, vec4, select, abs, lengthSq } from '../tsl/TSLBase.js';
import { normalGeometry } from './Normal.js';
import { tangentViewFrame } from './TangentUtils.js';
import { negateOnBackSide } from '../display/FrontFacingNode.js';

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
export const tangentLocal = /*@__PURE__*/ select(
	lengthSq( tangentGeometry.xyz ).greaterThan( 0 ),
	tangentGeometry.xyz,
	// a zero-length tangent, as left where a vertex's uvs are degenerate, would normalize to NaN, so
	// any direction perpendicular to the normal is used instead
	normalGeometry.cross( select( abs( normalGeometry.x ).lessThan( 0.9 ), vec3( 1, 0, 0 ), vec3( 0, 1, 0 ) ) )
).toVar( 'tangentLocal' );

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

		node = negateOnBackSide( node );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'tangentView' );

/**
 * TSL object that represents the vertex tangent in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const tangentWorld = /*@__PURE__*/ tangentView.transformDirection( cameraWorldMatrix ).toVarying( 'v_tangentWorld' ).normalize().toVar( 'tangentWorld' );
