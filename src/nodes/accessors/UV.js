import { attribute } from '../core/AttributeNode.js';

/** @module UV **/

/**
 * TSL function for creating an uv attribute node with the given index.
 *
 * @function
 * @param {Number} index - The uv index.
 * @return {AttributeNode<vec2>} The uv attribute node.
 */
export const uv = ( index ) => attribute( 'uv' + ( index > 0 ? index : '' ), 'vec2' );
