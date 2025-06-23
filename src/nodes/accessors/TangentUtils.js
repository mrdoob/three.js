import { uv as getUV } from './UV.js';
import { positionView } from './Position.js';
import { normalView } from './Normal.js';

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const uv = getUV();

const q0 = positionView.dFdx();
const q1 = positionView.dFdy();
const st0 = uv.dFdx();
const st1 = uv.dFdy();

const N = normalView;

const q1perp = q1.cross( N );
const q0perp = N.cross( q0 );

const T = q1perp.mul( st0.x ).add( q0perp.mul( st1.x ) );
const B = q1perp.mul( st0.y ).add( q0perp.mul( st1.y ) );

const det = T.dot( T ).max( B.dot( B ) );
const scale = det.equal( 0.0 ).select( 0.0, det.inverseSqrt() );

/**
 * Tangent vector in view space, computed dynamically from geometry and UV derivatives.
 * Useful for normal mapping without precomputed tangents.
 *
 * Reference: http://www.thetenthplanet.de/archives/1180
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const tangentViewFrame = /*@__PURE__*/ T.mul( scale ).toVar( 'tangentViewFrame' );

/**
 * Bitangent vector in view space, computed dynamically from geometry and UV derivatives.
 * Complements the tangentViewFrame for constructing the tangent space basis.
 *
 * Reference: http://www.thetenthplanet.de/archives/1180
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const bitangentViewFrame = /*@__PURE__*/ B.mul( scale ).toVar( 'bitangentViewFrame' );
