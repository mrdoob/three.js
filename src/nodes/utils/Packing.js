import { nodeObject, vec3, float } from '../tsl/TSLBase.js';
import { dot, sqrt, saturate } from '../math/MathNode.js';

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

/**
 * Unpacks a tangent space normal, reconstructing the Z component by projecting the X,Y coordinates onto the hemisphere.
 * The X,Y coordinates are expected to be in the [-1, 1] range.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} xy - The X,Y coordinates of the normal.
 * @return {Node<vec3>} The resulting normal.
 */
export const unpackNormal = ( xy ) => vec3( xy, sqrt( saturate( float( 1.0 ).sub( dot( xy, xy ) ) ) ) );
