import { ShaderNode } from '../../shadernode/ShaderNode.js';

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
const D_GGX = new ShaderNode( ( inputs ) => {

	const { alpha, dotNH } = inputs;

	const a2 = alpha.pow2();

	const denom = dotNH.pow2().mul( a2.oneMinus() ).oneMinus(); // avoid alpha = 0 with dotNH = 1

	return a2.div( denom.pow2() ).mul( 1 / Math.PI );

} ); // validated

export default D_GGX;
