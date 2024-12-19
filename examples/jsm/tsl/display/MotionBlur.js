import { Fn, float, uv, Loop, int } from 'three/tsl';

/** @module MotionBlur **/

/**
 * Applies a motion blur effect to the given input node.
 *
 * @function
 * @param {Node<vec4>} inputNode - The input node to apply the motion blur for.
 * @param {Node<vec2>} velocity - The motion vectors of the beauty pass.
 * @param {Node<int>} [numSamples=int(16)] - How many samples the effect should use. A higher value results in better quality but is also more expensive.
 * @return {Node<vec4>} The input node with the motion blur effect applied.
 */
export const motionBlur = /*@__PURE__*/ Fn( ( [ inputNode, velocity, numSamples = int( 16 ) ] ) => {

	const sampleColor = ( uv ) => inputNode.sample( uv );

	const uvs = uv();

	const colorResult = sampleColor( uvs ).toVar();
	const fSamples = float( numSamples );

	Loop( { start: int( 1 ), end: numSamples, type: 'int', condition: '<=' }, ( { i } ) => {

		const offset = velocity.mul( float( i ).div( fSamples.sub( 1 ) ).sub( 0.5 ) );
		colorResult.addAssign( sampleColor( uvs.add( offset ) ) );

	} );

	colorResult.divAssign( fSamples );

	return colorResult;

} );
