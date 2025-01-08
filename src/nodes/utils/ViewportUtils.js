import { Fn } from '../tsl/TSLBase.js';
import { screenUV } from '../display/ScreenNode.js';
import { viewportDepthTexture } from '../display/ViewportDepthTextureNode.js';
import { linearDepth } from '../display/ViewportDepthNode.js';

/** @module ViewportUtils **/

/**
 * A special version of a screen uv function that involves a depth comparison
 * when computing the final uvs. The function mitigates visual errors when
 * using viewport texture nodes for refraction purposes. Without this function
 * objects in front of a refractive surface might appear on the refractive surface
 * which is incorrect.
 *
 * @method
 * @param {Node<vec2>?} uv - Optional uv coordinates. By default `screenUV` is used.
 * @return {Node<vec2>} The update uv coordinates.
 */
export const viewportSafeUV = /*@__PURE__*/ Fn( ( [ uv = null ] ) => {

	const depth = linearDepth();
	const depthDiff = linearDepth( viewportDepthTexture( uv ) ).sub( depth );
	const finalUV = depthDiff.lessThan( 0 ).select( screenUV, uv );

	return finalUV;

} );
