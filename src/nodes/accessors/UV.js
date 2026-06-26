import { attribute } from '../core/AttributeNode.js';

/**
 * TSL function for creating an uv attribute node with the given index.
 *
 * @tsl
 * @function
 * @param {number} [index=0] - The uv index.
 * @return {AttributeNode<vec2>} The uv attribute node.
 */
export const uv = ( index = 0 ) => attribute( 'uv' + ( index > 0 ? index : '' ), 'vec2' );
