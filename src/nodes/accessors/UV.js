import { attribute } from '../core/AttributeNode.js';

/** @module UV **/

/**
 * TSL function for creating an uv attribute node with the given index.
 *
 * @function
 * @param {Number} [index=0] - The uv index.
 * @return {AttributeNode<vec2>} The uv attribute node.
 */
export const uv = ( index = 0 ) => attribute( 'uv' + ( index > 0 ? index : '' ), 'vec2' );
