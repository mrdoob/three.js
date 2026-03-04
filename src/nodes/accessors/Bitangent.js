import { Fn } from '../tsl/TSLCore.js';
import { normalGeometry, normalLocal, normalView, normalWorld } from './Normal.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld } from './Tangent.js';
import { bitangentViewFrame } from './TangentUtils.js';
import { directionToFaceDirection } from '../display/FrontFacingNode.js';

/**
 * Returns the bitangent node and assigns it to a varying if the material is not flat shaded.
 *
 * @tsl
 * @private
 * @param {Node<vec3>} crossNormalTangent - The cross product of the normal and tangent vectors.
 * @param {string} varyingName - The name of the varying to assign the bitangent to.
 * @returns {Node<vec3>} The bitangent node.
 */
const getBitangent = /*@__PURE__*/ Fn( ( [ crossNormalTangent, varyingName ], builder ) => {

	let bitangent = crossNormalTangent.mul( tangentGeometry.w ).xyz;

	if ( builder.subBuildFn === 'NORMAL' && builder.isFlatShading() !== true ) {

		bitangent = bitangent.toVarying( varyingName );

	}

	return bitangent;

} ).once( [ 'NORMAL' ] );

/**
 * TSL object that represents the bitangent attribute of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentGeometry = /*@__PURE__*/ getBitangent( normalGeometry.cross( tangentGeometry ), 'v_bitangentGeometry' ).normalize().toVar( 'bitangentGeometry' );

/**
 * TSL object that represents the vertex bitangent in local space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentLocal = /*@__PURE__*/ getBitangent( normalLocal.cross( tangentLocal ), 'v_bitangentLocal' ).normalize().toVar( 'bitangentLocal' );

/**
 * TSL object that represents the vertex bitangent in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentView = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.subBuildFn === 'VERTEX' || builder.geometry.hasAttribute( 'tangent' ) ) {

		node = getBitangent( normalView.cross( tangentView ), 'v_bitangentView' ).normalize();

	} else {

		node = bitangentViewFrame;

	}

	if ( builder.isFlatShading() !== true ) {

		node = directionToFaceDirection( node );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'bitangentView' );

/**
 * TSL object that represents the vertex bitangent in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentWorld = /*@__PURE__*/ getBitangent( normalWorld.cross( tangentWorld ), 'v_bitangentWorld' ).normalize().toVar( 'bitangentWorld' );
