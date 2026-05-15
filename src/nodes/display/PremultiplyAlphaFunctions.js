import { Fn, vec4 } from '../tsl/TSLCore.js';

/**
 * Premultiplies the RGB channels of a color by its alpha channel.
 *
 * This function is useful for converting a non-premultiplied alpha color
 * into a premultiplied alpha format, where the RGB values are scaled
 * by the alpha value. Premultiplied alpha is often used in graphics
 * rendering for certain operations, such as compositing and image processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} color - The input color with non-premultiplied alpha.
 * @return {Node<vec4>} The color with premultiplied alpha.
 */
export const premultiplyAlpha = /*@__PURE__*/ Fn( ( [ color ] ) => {

	return vec4( color.rgb.mul( color.a ), color.a );

}, { color: 'vec4', return: 'vec4' } );

/**
 * Unpremultiplies the RGB channels of a color by its alpha channel.
 *
 * This function is useful for converting a premultiplied alpha color
 * back into a non-premultiplied alpha format, where the RGB values are
 * divided by the alpha value. Unpremultiplied alpha is often used in graphics
 * rendering for certain operations, such as compositing and image processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} color - The input color with premultiplied alpha.
 * @return {Node<vec4>} The color with non-premultiplied alpha.
 */
export const unpremultiplyAlpha = /*@__PURE__*/ Fn( ( [ color ] ) => {

	return color.a.equal( 0 ).select( vec4( 0 ), vec4( color.rgb.div( color.a ), color.a ) );

}, { color: 'vec4', return: 'vec4' } );
