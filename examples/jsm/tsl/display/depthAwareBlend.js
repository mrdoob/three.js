import { abs, color, float, Fn, Loop, mix, nodeObject, perspectiveDepthToViewZ, reference, textureSize, uv, vec2, vec4, viewZToOrthographicDepth, int, If, array, ivec2 } from 'three/tsl';

/**
 * Performs a depth-aware blend between a base scene and a secondary effect (like godrays).
 * This function uses a Poisson disk sampling pattern to detect depth discontinuities
 * in the neighborhood of the current pixel. If an edge is detected, it shifts the
 * sampling coordinate for the blend node away from the edge to prevent light leaking/haloing.
 *
 * @param {Node} baseNode - The main scene/beauty pass texture node.
 * @param {Node} blendNode - The effect to be blended (e.g., Godrays, Bloom).
 * @param {Node} depthNode - The scene depth texture node.
 * @param {Camera} camera - The camera used for the scene.
 * @param {Object} [options={}] - Configuration for the blend effect.
 * @param {Node|Color} [options.blendColor=Color(0xff0000)] - The color applied to the blend node.
 * @param {Node<int> | number} [options.edgeRadius=2] - The search radius (in pixels) for detecting depth edges.
 * @param {Node<float> | number} [options.edgeStrength=2] - How far to "push" the UV away from detected edges.
 * @returns {Node<vec4>} The resulting blended color node.
 */
export const depthAwareBlend = /*#__PURE__*/ Fn( ( [ baseNode, blendNode, depthNode, camera, options = {} ] ) => {

	const uvNode = baseNode.uvNode || uv();

	const cameraNear = reference( 'near', 'float', camera );
	const cameraFar = reference( 'far', 'float', camera );

	const blendColor = nodeObject( options.blendColor ) || color( 0xffffff );
	const edgeRadius = nodeObject( options.edgeRadius ) || int( 2 );
	const edgeStrength = nodeObject( options.edgeStrength ) || float( 2 );

	const viewZ = perspectiveDepthToViewZ( depthNode, cameraNear, cameraFar );
	const correctDepth = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

	const pushDir = vec2( 0.0 ).toVar();
	const count = float( 0 ).toVar();

	const resolution = ivec2( textureSize( baseNode ) ).toConst();
	const pixelStep = vec2( 1 ).div( resolution );

	const poissonDisk = array( [
		vec2( 0.493393, 0.394269 ),
		vec2( 0.798547, 0.885922 ),
		vec2( 0.259143, 0.650754 ),
		vec2( 0.605322, 0.023588 ),
		vec2( - 0.574681, 0.137452 ),
		vec2( - 0.430397, - 0.638423 ),
		vec2( - 0.849487, - 0.366258 ),
		vec2( 0.170621, - 0.569941 )
	] );

	Loop( 8, ( { i } ) => {

		const offset = poissonDisk.element( i ).mul( edgeRadius );

		const sampleUv = uvNode.add( offset.mul( pixelStep ) );
		const sampleDepth = depthNode.sample( sampleUv );

		const sampleViewZ = perspectiveDepthToViewZ( sampleDepth, cameraNear, cameraFar );
		const sampleLinearDepth = viewZToOrthographicDepth( sampleViewZ, cameraNear, cameraFar );

		If( abs( sampleLinearDepth.sub( correctDepth ) ).lessThan( float( 0.05 ).mul( correctDepth ) ), () => {

			pushDir.addAssign( offset );
			count.addAssign( 1 );

		} );

	} );

	count.assign( count.equal( 0 ).select( 1, count ) );

	pushDir.divAssign( count ).normalize();

	const sampleUv = pushDir.length().greaterThan( 0 ).select( uvNode.add( edgeStrength.mul( pushDir.div( resolution ) ) ), uvNode );

	const bestChoice = blendNode.sample( sampleUv ).r;
	const baseColor = baseNode.sample( uvNode );

	return vec4( mix( baseColor, vec4( blendColor, 1 ), bestChoice ) );

} );
