import { Fn } from '../tsl/TSLBase.js';

/**
 * Calculates, at a given distance from a light, the falloff of the light's brightness.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {Node<float>} inputs.lightDistance - The distance of the light's position to the current fragment position.
 * @param {Node<float>} inputs.cutoffDistance - The light's cutoff distance.
 * @param {Node<float>} inputs.decayExponent - The light's decay exponent.
 * @return {Node<float>} The distance falloff.
 */
export const getDistanceAttenuation = /*@__PURE__*/ Fn( ( { lightDistance, cutoffDistance, decayExponent } ) => {

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	const distanceFalloff = lightDistance.pow( decayExponent ).max( 0.01 ).reciprocal();

	return cutoffDistance.greaterThan( 0 ).select(
		distanceFalloff.mul( lightDistance.div( cutoffDistance ).pow4().oneMinus().clamp().pow2() ),
		distanceFalloff
	);

<<<<<<< HEAD
}, { lightDistance: 'float', cutoffDistance: 'float', decayExponent: 'float', return: 'float' } ); // validated
=======
} ).setLayout( {
	name: 'getDistanceAttenuation',
	type: 'float',
	inputs: [
		{ name: 'lightDistance', type: 'float' },
		{ name: 'cutoffDistance', type: 'float' },
		{ name: 'decayExponent', type: 'float' }
	]
} );
>>>>>>> 9c1b752288 (fix getDistanceAttenuation doc)
