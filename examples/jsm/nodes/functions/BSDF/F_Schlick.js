import { ShaderNode, sub, mul, exp2 } from '../../shadernode/ShaderNodeBaseElements.js';

const F_Schlick = new ShaderNode( ( inputs ) => {

	const { f0, f90, dotVH } = inputs;

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	const fresnel = exp2( mul( - 5.55473, dotVH ).sub( 6.98316 ).mul( dotVH ) );

	return f0.mul( sub( 1.0, fresnel ) ).add( f90.mul( fresnel ) );

} ); // validated

export default F_Schlick;
