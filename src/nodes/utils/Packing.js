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
 * Unpacks RG-packed normals by reconstructing their Z component by projecting it to the hemisphere.
 * The XY coordinates of the input normal are expected to be in the [-1, 1] range.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} normal - The packed normal to unpack.
 * @return {Node<vec3>} The unpacked normal.
 */
export const unpackRGNormal = ( normal ) => vec3( normal.xy, sqrt( saturate( float( 1.0 ).sub( dot( normal.xy, normal.xy ) ) ) ) );

/**
 * Unpacks GA-packed normals by reconstructing their Z component by projecting it to the hemisphere.
 * The XY coordinates of the input normal are expected to be in the [-1, 1] range.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} normal - The packed normal to unpack.
 * @return {Node<vec3>} The unpacked normal.
 */
export const unpackGANormal = ( normal ) => vec3( normal.yw, sqrt( saturate( float( 1.0 ).sub( dot( normal.yw, normal.yw ) ) ) ) );
