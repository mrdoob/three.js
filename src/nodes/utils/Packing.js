import { nodeObject, vec3, float } from '../tsl/TSLBase.js';
import { dot, sqrt, saturate } from '../math/MathNode.js';
import { warnOnce } from '../../utils.js';

/**
 * Packs a normal vector into a color value.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} node - The direction to pack.
 * @return {Node<vec3>} The color.
 */
export const packNormalToRGB = ( node ) => nodeObject( node ).mul( 0.5 ).add( 0.5 );

/**
 * Unpacks a color value into a normal vector.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} node - The color to unpack.
 * @return {Node<vec3>} The direction.
 */
export const unpackRGBToNormal = ( node ) => nodeObject( node ).mul( 2.0 ).sub( 1 );

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

/**
 * @tsl
 * @function
 * @deprecated since r185. Use {@link packNormalToRGB} instead.
 * @param {Node<vec3>} node - The direction to pack.
 * @returns {Node<vec3>}
 */
export const directionToColor = ( node ) => {

	warnOnce( 'TSL: "directionToColor()" has been renamed to "packNormalToRGB()".' ); // @deprecated r185

	return packNormalToRGB( node );

};

/**
 * @tsl
 * @function
 * @deprecated since r185. Use {@link unpackRGBToNormal} instead.
 * @param {Node<vec3>} node - The color to unpack.
 * @returns {Node<vec3>}
 */
export const colorToDirection = ( node ) => {

	warnOnce( 'TSL: "colorToDirection()" has been renamed to "unpackRGBToNormal()".' ); // @deprecated r185

	return unpackRGBToNormal( node );

};
