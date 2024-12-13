import { varying } from '../core/VaryingNode.js';
import { cameraViewMatrix } from './Camera.js';
import { normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView } from './Normal.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView } from './Tangent.js';

/** @module Bitangent **/

const getBitangent = ( crossNormalTangent ) => crossNormalTangent.mul( tangentGeometry.w ).xyz;

/**
 * TSL object that represents the bitangent attribute of the current rendered object.
 *
 * @type {Node<vec3>}
 */
export const bitangentGeometry = /*@__PURE__*/ varying( getBitangent( normalGeometry.cross( tangentGeometry ) ), 'v_bitangentGeometry' ).normalize().toVar( 'bitangentGeometry' );

/**
 * TSL object that represents the vertex bitangent in local space of the current rendered object.
 *
 * @type {Node<vec3>}
 */
export const bitangentLocal = /*@__PURE__*/ varying( getBitangent( normalLocal.cross( tangentLocal ) ), 'v_bitangentLocal' ).normalize().toVar( 'bitangentLocal' );

/**
 * TSL object that represents the vertex bitangent in view space of the current rendered object.
 *
 * @type {Node<vec4>}
 */
export const bitangentView = /*@__PURE__*/ varying( getBitangent( normalView.cross( tangentView ) ), 'v_bitangentView' ).normalize().toVar( 'bitangentView' );

/**
 * TSL object that represents the vertex bitangent in world space of the current rendered object.
 *
 * @type {Node<vec4>}
 */
export const bitangentWorld = /*@__PURE__*/ varying( getBitangent( normalWorld.cross( tangentWorld ) ), 'v_bitangentWorld' ).normalize().toVar( 'bitangentWorld' );

/**
 * TSL object that represents the transformed vertex bitangent in view space of the current rendered object.
 *
 * @type {Node<vec4>}
 */
export const transformedBitangentView = /*@__PURE__*/ getBitangent( transformedNormalView.cross( transformedTangentView ) ).normalize().toVar( 'transformedBitangentView' );

/**
 * TSL object that represents the transformed vertex bitangent in world space of the current rendered object.
 *
 * @type {Node<vec4>}
 */
export const transformedBitangentWorld = /*@__PURE__*/ transformedBitangentView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedBitangentWorld' );
