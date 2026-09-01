import { Fn, If, vec3, float, min, cameraPosition, positionWorld } from 'three/tsl';

/**
 * @module GroundedSkybox
 * @three_import import { getGroundProjectedNormal } from 'three/addons/tsl/utils/GroundedSkybox.js';
 */

/**
 * Projects the world position onto a sphere whose bottom is clipped by a ground disk,
 * then returns a vector usable for sampling an environment cube map.
 *
 * @tsl
 * @function
 * @param {Node<float>} radiusNode - The radius of the projection sphere. Must be large enough to ensure the scene's camera stays inside.
 * @param {Node<float>} heightNode - The height is how far the camera that took the photo was above the ground. A larger value will magnify the downward part of the image.
 * @return {Node<vec3>} A direction vector for sampling the environment cube map.
 */
export const getGroundProjectedNormal = Fn( ( [ radiusNode, heightNode ] ) => {

	const p = positionWorld.sub( cameraPosition ).normalize().toConst();
	const camPos = cameraPosition.toVar();
	camPos.y.subAssign( heightNode );

	// sphereIntersect( camPos, p, vec3( 0 ), radius )
	const b = camPos.dot( p ).toConst();
	const c = camPos.dot( camPos ).sub( radiusNode.mul( radiusNode ) ).toConst();
	const h = b.mul( b ).sub( c ).toConst();

	const intersection = h.greaterThanEqual( 0 ).select( h.sqrt().sub( b ), - 1 );

	const projected = vec3( 0, 1, 0 ).toVar();

	If( intersection.greaterThan( 0 ), () => {

		// diskIntersectWithBackFaceCulling( camPos, p, diskCenter, n, radius )
		const diskCenter = vec3( 0, heightNode.negate(), 0 ).toConst();
		const n = vec3( 0, 1, 0 ).toConst();
		const d = p.dot( n ).toConst();

		const intersection2 = float( 1e6 ).toVar();

		If( d.lessThanEqual( 0 ), () => {

			const o = camPos.sub( diskCenter ).toConst();
			const t = n.dot( o ).negate().div( d ).toConst();
			const q = o.add( p.mul( t ) ).toConst();

			If( q.dot( q ).lessThan( radiusNode.mul( radiusNode ) ), () => {

				intersection2.assign( t );

			} );

		} );

		projected.assign( camPos.add( p.mul( min( intersection, intersection2 ) ) ).div( radiusNode ) );

	} );

	return projected;

} );
