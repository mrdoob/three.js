import {
	ShaderNode, div, max, sub, mul, saturate, pow, pow2, pow4, cond, greaterThan
} from '../../shadernode/ShaderNodeBaseElements.js';

const getDistanceAttenuation = new ShaderNode( ( inputs ) => {

	const { lightDistance, cutoffDistance, decayExponent } = inputs;

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	const distanceFalloff = div( 1.0, max( pow( lightDistance, decayExponent ), 0.01 ) );

	return cond(
		greaterThan( cutoffDistance, 0 ),
		mul( distanceFalloff, pow2( saturate( sub( 1.0, pow4( div( lightDistance, cutoffDistance ) ) ) ) ) ),
		distanceFalloff
	);

} ); // validated

export default getDistanceAttenuation;
