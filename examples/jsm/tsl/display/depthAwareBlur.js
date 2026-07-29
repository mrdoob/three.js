import { abs, exp, float, Fn, int, logarithmicDepthToViewZ, Loop, max, perspectiveDepthToViewZ, reference, uv } from 'three/tsl';

/**
 * Applies one pass of a separable, depth-aware (bilateral) blur to a screen-space signal.
 *
 * The spatial term is a fixed 5-tap gaussian along `directionNode`; the edge-stopping term
 * rejects neighbours whose view-space depth differs from the center, so the signal is smoothed
 * across surfaces but not across silhouettes. Depth rejection is measured relative to `radius`,
 * which keeps it scale invariant. Run it twice (horizontal then vertical) for a full separable
 * blur. Handy for denoising a half-resolution effect such as ambient occlusion.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} inputNode - The texture node to blur; its red channel is filtered.
 * @param {Node<float>} depthNode - The scene depth texture node.
 * @param {Node<vec2>} directionNode - One texel step along the blur axis, e.g. `vec2( 1 / width, 0 )`.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {Node<float> | number} [sharpness=2] - How strongly a depth difference rejects a neighbour.
 * @param {Node<float> | number} [radius=1] - The world-space scale the depth rejection is relative to.
 * @returns {Node<float>} The blurred value.
 */
export const depthAwareBlur = /*#__PURE__*/ Fn( ( [ inputNode, depthNode, directionNode, camera, sharpness = 2, radius = 1 ], builder ) => {

	const cameraNear = reference( 'near', 'float', camera );
	const cameraFar = reference( 'far', 'float', camera );

	const viewZ = ( uvNode ) => {

		const depth = depthNode.sample( uvNode ).r;

		if ( builder.renderer.logarithmicDepthBuffer === true ) {

			return logarithmicDepthToViewZ( depth, cameraNear, cameraFar );

		}

		return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

	};

	const uvNode = uv();
	const centerViewZ = viewZ( uvNode ).toVar();

	const sum = float( 0 ).toVar();
	const weightSum = float( 0 ).toVar();

	Loop( { start: int( - 2 ), end: int( 3 ), type: 'int', condition: '<' }, ( { i } ) => {

		const fi = float( i );
		const sampleUv = uvNode.add( directionNode.mul( fi ) );

		const spatialWeight = exp( fi.mul( fi ).mul( - 0.5 ) );
		const depthWeight = exp( abs( viewZ( sampleUv ).sub( centerViewZ ) ).div( radius ).mul( sharpness ).negate() );
		const weight = spatialWeight.mul( depthWeight );

		sum.addAssign( inputNode.sample( sampleUv ).r.mul( weight ) );
		weightSum.addAssign( weight );

	} );

	return sum.div( max( weightSum, float( 0.0001 ) ) );

} );
