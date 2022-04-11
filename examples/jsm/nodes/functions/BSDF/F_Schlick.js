import ShaderNode from '../../shadernode/ShaderNode.js';
import { add, sub, mul, exp2 } from '../../shadernode/ShaderNodeElements.js';

const F_Schlick = new ShaderNode( ( inputs ) => {

	const { f0, f90, dotVH } = inputs;

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	const fresnel = exp2( mul( sub( mul( - 5.55473, dotVH ), 6.98316 ), dotVH ) );

	return add( mul( f0, sub( 1.0, fresnel ) ), mul( f90, fresnel ) );

} ); // validated

export default F_Schlick;
