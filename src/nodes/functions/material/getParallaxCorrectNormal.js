import { positionWorld } from '../../accessors/Position.js';
import { float, Fn, min, normalize, sub, vec3 } from '../../tsl/TSLBase.js';

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

	const nDir = normalize( normal ).toVar( 'nDir' );
	const rbmax = sub( float( 0.5 ).mul( cubeSize.sub( cubePos ) ), positionWorld ).div( nDir ).toVar( 'rbmax' );
	const rbmin = sub( float( - 0.5 ).mul( cubeSize.sub( cubePos ) ), positionWorld ).div( nDir ).toVar( 'rbmin' );
	const rbminmax = vec3().toVar( 'rbminmax' );
	rbminmax.x = nDir.x.greaterThan( float( 0 ) ).select( rbmax.x, rbmin.x );
	rbminmax.y = nDir.y.greaterThan( float( 0 ) ).select( rbmax.y, rbmin.y );
	rbminmax.z = nDir.z.greaterThan( float( 0 ) ).select( rbmax.z, rbmin.z );

	const correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z ).toVar( 'correction' );
	const boxIntersection = positionWorld.add( nDir.mul( correction ) ).toVar( 'boxIntersection' );
	return boxIntersection.sub( cubePos );

} );

export default getParallaxCorrectNormal;
