import { ShaderNode, add, sub, mul, div, pow2 } from '../../shadernode/ShaderNodeBaseElements.js';

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
const D_GGX = new ShaderNode( ( inputs ) => {

	const { alpha, dotNH } = inputs;

	const a2 = pow2( alpha );

	const denom = add( mul( pow2( dotNH ), sub( a2, 1.0 ) ), 1.0 ); // avoid alpha = 0 with dotNH = 1

	return mul( 1 / Math.PI, div( a2, pow2( denom ) ) );

} ); // validated

export default D_GGX;
