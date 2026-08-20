import { positionWorldDirection } from '../accessors/Position.js';
import { uv as UV } from '../accessors/UV.js';
import { Fn, vec2, vec3 } from '../tsl/TSLCore.js';

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
 * @param {?Node<vec3>} [direction=positionWorldDirection] - A direction vector for sampling which is by default `positionWorldDirection`.
 * @returns {Node<vec2>}
 */
export const equirectUV = /*@__PURE__*/ Fn( ( [ direction = positionWorldDirection ] ) => {

	const u = direction.z.atan( direction.x ).mul( 1 / ( Math.PI * 2 ) ).add( 0.5 );
	const v = direction.y.clamp( - 1.0, 1.0 ).asin().mul( 1 / Math.PI ).add( 0.5 );

	return vec2( u, v );

} );

/**
 * TSL function for creating an equirect direction node.
 *
 * Can be used to compute a direction vector from the given equirectangular
 * UV coordinates.
 *
 * @tsl
 * @function
 * @param {?Node<vec2>} [uv=UV()] - The equirectangular UV coordinates.
 * @returns {Node<vec3>} The computed direction vector.
 */
export const equirectDirection = /*@__PURE__*/ Fn( ( [ uv = UV() ] ) => {

	const theta = uv.x.sub( 0.5 ).mul( Math.PI * 2 );
	const phi = uv.y.sub( 0.5 ).mul( Math.PI );
	const cosPhi = phi.cos();
	const x = cosPhi.mul( theta.cos() );
	const y = phi.sin();
	const z = cosPhi.mul( theta.sin() );

	return vec3( x, y, z );

} );
