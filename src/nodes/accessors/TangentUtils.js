import { uv as getUV } from './UV.js';
import { positionView } from './Position.js';
import { normalView } from './Normal.js';

/**
 * Computes the tangent and bitangent vectors in view space for normal mapping without precomputed tangents.
 *
 * This utility constructs a tangent frame using the derivatives of the position and UV coordinates,
 * following the method described at http://www.thetenthplanet.de/archives/1180.
 *
 * @constant
 * @type {{ tangentView: Node<vec3>, bitangentView: Node<vec3>, normalView: Node<vec3> }}
 * @property {Node<vec3>} tangentView - The computed tangent vector in view space.
 * @property {Node<vec3>} bitangentView - The computed bitangent vector in view space.
 * @property {Node<vec3>} normalView - The normal vector in view space.
 */
export const tangentFrame = /*#__PURE__*/ ( () => {

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

	const tangentView = T.mul( scale ).toVar( 'tangentViewFrame' );
 	const bitangentView = B.mul( scale ).toVar( 'bitangentViewFrame' );

	return {
		tangentView,
		bitangentView,
		normalView
	};

} )();
