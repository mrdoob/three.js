import { varying } from '../core/VaryingNode.js';
import { Fn } from '../tsl/TSLCore.js';
import { normalGeometry, normalLocal, normalView, normalWorld } from './Normal.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld } from './Tangent.js';

/**
 * Returns the bitangent node and assigns it to a varying if the material is not flat shaded.
 *
 * @tsl
 * @private
 * @param {Node<vec3>} crossNormalTangent - The cross product of the normal and tangent vectors.
 * @returns {Node<vec3>} The bitangent node.
 */
const getBitangent = /*@__PURE__*/ Fn( ( [ crossNormalTangent ], builder ) => {

	return crossNormalTangent.mul( tangentGeometry.w ).xyz;

} );

/**
 * TSL object that represents the bitangent attribute of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentGeometry = /*@__PURE__*/ getBitangent( normalGeometry.cross( tangentGeometry ) ).normalize().toVar( 'bitangentGeometry' );

/**
 * TSL object that represents the vertex bitangent in local space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentLocal = /*@__PURE__*/ getBitangent( normalLocal.cross( tangentLocal ) ).normalize().toVar( 'bitangentLocal' );

/**
 * TSL object that represents the transformed vertex bitangent in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentView = getBitangent( normalView.cross( tangentView ) ).normalize().toVar( 'bitangentView' );

/**
 * TSL object that represents the transformed vertex bitangent in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentWorld = /*@__PURE__*/ getBitangent( normalWorld.cross( tangentWorld ) ).normalize().toVar( 'bitangentWorld' );
