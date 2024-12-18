import { Fn, vec2 } from '../tsl/TSLBase.js';
import { rotate } from './RotateNode.js';

/** @module UVUtils **/

/**
 * Rotates the given uv coordinates around a center point
 *
 * @method
 * @param {Node<vec2>} uv - The uv coordinates.
 * @param {Node<float>} rotation - The rotation defined in radians.
 * @param {Node<vec2>} center - The center of rotation
 * @return {Node<vec2>} The rotated uv coordinates.
 */
export const rotateUV = /*@__PURE__*/ Fn( ( [ uv, rotation, center = vec2( 0.5 ) ] ) => {

	return rotate( uv.sub( center ), rotation ).add( center );

} );

/**
 * Applies a spherical warping effect to the given uv coordinates.
 *
 * @method
 * @param {Node<vec2>} uv - The uv coordinates.
 * @param {Node<float>} strength - The strength of the effect.
 * @param {Node<vec2>} center - The center point
 * @return {Node<vec2>} The updated uv coordinates.
 */
export const spherizeUV = /*@__PURE__*/ Fn( ( [ uv, strength, center = vec2( 0.5 ) ] ) => {

	const delta = uv.sub( center );
	const delta2 = delta.dot( delta );
	const delta4 = delta2.mul( delta2 );
	const deltaOffset = delta4.mul( strength );

	return uv.add( delta.mul( deltaOffset ) );

} );
