import { ShaderNode, add, sub, mul, div, pow2, max, sqrt, EPSILON } from '../../shadernode/ShaderNodeBaseElements.js';

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
const V_GGX_SmithCorrelated = new ShaderNode( ( inputs ) => {

	const { alpha, dotNL, dotNV } = inputs;

	const a2 = pow2( alpha );

	const gv = mul( dotNL, sqrt( add( a2, mul( sub( 1.0, a2 ), pow2( dotNV ) ) ) ) );
	const gl = mul( dotNV, sqrt( add( a2, mul( sub( 1.0, a2 ), pow2( dotNL ) ) ) ) );

	return div( 0.5, max( add( gv, gl ), EPSILON ) );

} ); // validated

export default V_GGX_SmithCorrelated;
