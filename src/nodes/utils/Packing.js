import { nodeObject } from '../tsl/TSLBase.js';

/**
 * Packs a direction vector into a color value.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} node - The direction to pack.
 * @return {Node<vec3>} The color.
 */
export const directionToColor = ( node ) => nodeObject( node ).mul( 0.5 ).add( 0.5 );

/**
 * Unpacks a color value into a direction vector.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} node - The color to unpack.
 * @return {Node<vec3>} The direction.
 */
export const colorToDirection = ( node ) => nodeObject( node ).mul( 2.0 ).sub( 1 );
