import { positionWorld } from '../../accessors/Position.js';
import { Fn, min, normalize, EPSILON } from '../../tsl/TSLBase.js';

/**
 * This computes a parallax corrected normal which is used for box-projected cube mapping (BPCEM).
 *
 * Reference: {@link https://devlog-martinsh.blogspot.com/2011/09/box-projected-cube-environment-mapping.html}
 *
 * ```js
 * const uvNode = getParallaxCorrectNormal( reflectVector, vec3( 200, 100, 100 ), vec3( 0, - 50, 0 ) );
 * material.envNode = pmremTexture( renderTarget.texture, uvNode );
 * ```
 *
 * @tsl
 * @function
 * @param {Node<vec3>} normal - The normal to correct.
 * @param {Node<vec3>} cubeSize - The cube size should reflect the size of the environment (BPCEM is usually applied in closed environments like rooms).
 * @param {Node<vec3>} cubePos - The cube position.
 * @return {Node<vec3>} The parallax corrected normal.
 */
const getParallaxCorrectNormal = /*@__PURE__*/ Fn( ( [ normal, cubeSize, cubePos ] ) => {

	const nDir = normalize( normal ).toConst();
	const positive = nDir.greaterThanEqual( 0 );

	// keep axis-aligned directions away from zero so the distances stay finite
	const safeDir = positive.select( nDir.max( EPSILON ), nDir.min( EPSILON.negate() ) );
	const extent = cubeSize.mul( 0.5 ).toConst();
	const distances = positive.select( extent, extent.negate() ).add( cubePos ).sub( positionWorld ).div( safeDir ).toConst();

	const correction = min( distances.x, distances.y, distances.z ).toConst();
	return positionWorld.add( nDir.mul( correction ) ).sub( cubePos );

} );

export default getParallaxCorrectNormal;
