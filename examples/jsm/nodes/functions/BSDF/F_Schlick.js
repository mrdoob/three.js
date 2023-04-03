import { ShaderNode } from '../../shadernode/ShaderNode.js';

const F_Schlick = new ShaderNode( ( inputs ) => {

	const { f0, f90, dotVH } = inputs;

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	const fresnel = dotVH.mul( - 5.55473 ).sub( 6.98316 ).mul( dotVH ).exp2();

	return f0.mul( fresnel.oneMinus() ).add( f90.mul( fresnel ) );

} ); // validated

export default F_Schlick;
