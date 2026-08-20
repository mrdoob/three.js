import { Fn, float, positionView, viewportDepthTexture, perspectiveDepthToViewZ, cameraNear, cameraFar } from 'three/tsl';

/**
 * @module SoftParticles
 * @three_import import { softParticles } from 'three/addons/tsl/utils/SoftParticles.js';
 */

/**
 * A symmetric contrast curve, as described in the "Soft Particles" white paper
 * (NVIDIA, Tristan Lorach).
 *
 * @tsl
 * @function
 * @private
 * @param {Node<float>} input - The value to remap, expected in the `[0, 1]` range.
 * @param {Node<float>} power - The contrast power. `1` is linear, higher values sharpen the transition.
 * @return {Node<float>} The remapped value.
 */
const contrastCurve = /*@__PURE__*/ Fn( ( [ input, power ] ) => {

	const aboveHalf = input.greaterThan( 0.5 ).toConst();
	const folded = aboveHalf.select( input.oneMinus(), input ).toConst();
	const output = folded.mul( 2 ).saturate().pow( power ).mul( 0.5 ).toConst();

	return aboveHalf.select( output.oneMinus(), output );

} ).setLayout( {
	name: 'contrastCurve',
	type: 'float',
	inputs: [
		{ name: 'input', type: 'float' },
		{ name: 'power', type: 'float' }
	]
} );

/**
 * Computes an opacity node for soft particles, based on the "Soft Particles" white
 * paper (NVIDIA, Tristan Lorach).
 *
 * @tsl
 * @function
 * @param {Object} [parameters={}] - The configuration parameters.
 * @param {Node<float>} [parameters.opacity=float(1)] - The sprite's base opacity, which the soft fade is multiplied with.
 * @param {Node<float>|number} [parameters.distance=1] - The world-space distance over which the sprite fades out against the scene.
 * @param {Node<float>|number} [parameters.contrast=2] - The contrast power of the fade curve. `1` is linear, higher values sharpen the transition.
 * @param {Node<float>} [parameters.viewportDepth=viewportDepthTexture()] - The opaque scene depth the particles fade against.
 * @return {Node<float>} The opacity node to assign to `material.opacityNode`.
 */
export function softParticles( { opacity = float( 1 ), distance = 1, contrast = 2, viewportDepth = viewportDepthTexture() } = {} ) {

	// Read the opaque scene depth captured before the particle pass and convert both
	// the scene depth and the particle's depth to view space, so the gap between them
	// can be measured in world units.
	const sceneViewZ = perspectiveDepthToViewZ( viewportDepth, cameraNear, cameraFar ).toConst();
	const depthDelta = positionView.z.sub( sceneViewZ ).div( distance ).saturate();

	// Fade out as the particle approaches the scene; stay opaque when well in front of it.
	return opacity.mul( contrastCurve( depthDelta, contrast ) );

}
