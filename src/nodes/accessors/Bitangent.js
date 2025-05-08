import { varying } from '../core/VaryingNode.js';
import { Fn } from '../tsl/TSLCore.js';
import { cameraViewMatrix } from './Camera.js';
import { normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView } from './Normal.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView } from './Tangent.js';

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

	if ( builder.material.flatShading !== true ) {

		bitangent = varying( bitangent, varyingName );

	}

	return bitangent;

} ).once();

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
export const bitangentView = getBitangent( normalView.cross( tangentView ), 'v_bitangentView' ).normalize().toVar( 'bitangentView' );

/**
 * TSL object that represents the vertex bitangent in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentWorld = /*@__PURE__*/ getBitangent( normalWorld.cross( tangentWorld ), 'v_bitangentWorld' ).normalize().toVar( 'bitangentWorld' );

/**
 * TSL object that represents the transformed vertex bitangent in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const transformedBitangentView = /*@__PURE__*/ getBitangent( transformedNormalView.cross( transformedTangentView ), 'v_transformedBitangentView' ).normalize().toVar( 'transformedBitangentView' );

/**
 * TSL object that represents the transformed vertex bitangent in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec4>}
 */
export const transformedBitangentWorld = /*@__PURE__*/ transformedBitangentView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedBitangentWorld' );
