import { max, min, textureSize, vec2 } from 'three/tsl';

/**
 * Finds the depth nearest to the camera among the four depth texels around the
 * given coordinate. Reduced resolution effects shade each of their texels at this
 * depth, since blending depths across a silhouette produces banding.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - The depth texture.
 * @param {Node<vec2>} uv - The coordinate to gather the four depth texels around.
 * @param {NodeBuilder} builder - The current node builder.
 * @returns {{nearest: Node<float>, farthest: Node<float>, uv: Node<vec2>}} The nearest and farthest of the four depths and the texel center of the nearest one.
 */
export const gatherNearestDepth = ( depthNode, uv, builder ) => {

	const g = depthNode.gather().sample( uv ).toConst();
	const minDepth = min( min( g.x, g.y ), min( g.z, g.w ) ).toConst();
	const maxDepth = max( max( g.x, g.y ), max( g.z, g.w ) ).toConst();

	const reversed = builder.renderer.reversedDepthBuffer === true;
	const nearest = reversed ? maxDepth : minDepth;
	const farthest = reversed ? minDepth : maxDepth;

	const size = vec2( textureSize( depthNode, 0 ) );
	const offset = g.w.equal( nearest ).select( vec2( 0.5, 0.5 ), g.z.equal( nearest ).select( vec2( 1.5, 0.5 ), g.y.equal( nearest ).select( vec2( 1.5, 1.5 ), vec2( 0.5, 1.5 ) ) ) );

	return { nearest, farthest, uv: uv.mul( size ).sub( 0.5 ).floor().add( offset ).div( size ) };

};
