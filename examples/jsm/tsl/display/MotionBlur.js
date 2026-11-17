import { Fn, float, uv, Loop, int, vec4 } from 'three/tsl';

/**
 * Applies a motion blur effect to the given input node.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} inputNode - The input node to apply the motion blur for.
 * @param {Node<vec2>} velocity - The motion vectors of the beauty pass.
 * @param {Node<int>} [numSamples=int(16)] - How many samples the effect should use. A higher value results in better quality but is also more expensive.
 * @return {Node<vec4>} The input node with the motion blur effect applied.
 */
export const motionBlur = /*@__PURE__*/ Fn( ( [ inputNode, velocity, numSamples = int( 16 ) ] ) => {

	const sampleColor = ( uv ) => inputNode.sample( uv );

	const uvs = uv();

	const colorResult = vec4( 0 ).toVar();
	const fSamples = float( numSamples );

	// taps span [ -0.5, 0.5 ] * velocity, a single tap sits at the center
	const center = fSamples.sub( 1 ).mul( 0.5 );
	const spacing = fSamples.sub( 1 ).max( 1 );

	Loop( { start: int( 0 ), end: numSamples, type: 'int', condition: '<' }, ( { i } ) => {

		const offset = velocity.mul( float( i ).sub( center ).div( spacing ) );
		colorResult.addAssign( sampleColor( uvs.add( offset ) ) );

	} );

	colorResult.divAssign( fSamples );

	return colorResult;

} );
