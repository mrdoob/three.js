import { mix } from '../math/MathNode.js';
import { Fn } from '../tsl/TSLCore.js';

/**
 * Converts the given color value from sRGB to linear-sRGB color space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} color - The sRGB color.
 * @return {Node<vec3>} The linear-sRGB color.
 */
export const sRGBTransferEOTF = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.mul( 0.9478672986 ).add( 0.0521327014 ).pow( 2.4 );
	const b = color.mul( 0.0773993808 );
	const factor = color.lessThanEqual( 0.04045 );

	const rgbResult = mix( a, b, factor );

	return rgbResult;

}, { color: 'vec3', return: 'vec3' } );

/**
 * Converts the given color value from linear-sRGB to sRGB color space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} color - The linear-sRGB color.
 * @return {Node<vec3>} The sRGB color.
 */
export const sRGBTransferOETF = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.pow( 0.41666 ).mul( 1.055 ).sub( 0.055 );
	const b = color.mul( 12.92 );
	const factor = color.lessThanEqual( 0.0031308 );

	const rgbResult = mix( a, b, factor );

	return rgbResult;

}, { color: 'vec3', return: 'vec3' } );
