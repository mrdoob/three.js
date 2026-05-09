import { positionWorldDirection } from '../accessors/Position.js';
import { Fn, vec2 } from '../tsl/TSLBase.js';

/**
 * TSL function for creating an equirect uv node.
 *
 * Can be used to compute texture coordinates for projecting an
 * equirectangular texture onto a mesh for using it as the scene's
 * background.
 *
 * ```js
 * scene.backgroundNode = texture( equirectTexture, equirectUV() );
 * ```
 *
 * @tsl
 * @function
 * @param {?Node<vec3>} [dirNode=positionWorldDirection] - A direction vector for sampling which is by default `positionWorldDirection`.
 * @returns {Node<vec2>}
 */
export const equirectUV = /*@__PURE__*/ Fn( ( [ dir = positionWorldDirection ] ) => {

	const u = dir.z.atan( dir.x ).mul( 1 / ( Math.PI * 2 ) ).add( 0.5 );
	const v = dir.y.clamp( - 1.0, 1.0 ).asin().mul( 1 / Math.PI ).add( 0.5 );

	return vec2( u, v );

} );
