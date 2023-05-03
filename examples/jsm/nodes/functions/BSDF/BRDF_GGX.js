import F_Schlick from './F_Schlick.js';
import V_GGX_SmithCorrelated from './V_GGX_SmithCorrelated.js';
import D_GGX from './D_GGX.js';
import { transformedNormalView } from '../../accessors/NormalNode.js';
import { positionViewDirection } from '../../accessors/PositionNode.js';
import { ShaderNode } from '../../shadernode/ShaderNode.js';

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
const BRDF_GGX = new ShaderNode( ( inputs ) => {

	const { lightDirection, f0, f90, roughness } = inputs;

	const alpha = roughness.pow2(); // UE4's roughness

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const dotNV = transformedNormalView.dot( positionViewDirection ).clamp();
	const dotNH = transformedNormalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	const F = F_Schlick.call( { f0, f90, dotVH } );
	const V = V_GGX_SmithCorrelated.call( { alpha, dotNL, dotNV } );
	const D = D_GGX.call( { alpha, dotNH } );

	return F.mul( V ).mul( D );

} ); // validated

export default BRDF_GGX;
