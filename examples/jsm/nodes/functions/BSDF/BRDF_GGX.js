import F_Schlick from './F_Schlick.js';
import V_GGX_SmithCorrelated from './V_GGX_SmithCorrelated.js';
import D_GGX from './D_GGX.js';
import {
	ShaderNode, dotNV, add, mul, clamp, dot, pow2, normalize,
	transformedNormalView, positionViewDirection
} from '../../shadernode/ShaderNodeBaseElements.js';

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
const BRDF_GGX = new ShaderNode( ( inputs ) => {

	const { lightDirection, f0, f90, roughness } = inputs;

	const alpha = pow2( roughness ); // UE4's roughness

	const halfDir = normalize( add( lightDirection, positionViewDirection ) );

	const dotNL = clamp( dot( transformedNormalView, lightDirection ) );
	//const dotNV = clamp( dot( transformedNormalView, positionViewDirection ) );
	const dotNH = clamp( dot( transformedNormalView, halfDir ) );
	const dotVH = clamp( dot( positionViewDirection, halfDir ) );

	const F = F_Schlick.call( { f0, f90, dotVH } );

	const V = V_GGX_SmithCorrelated.call( { alpha, dotNL, dotNV } );

	const D = D_GGX.call( { alpha, dotNH } );

	return mul( F, mul( V, D ) );

} ); // validated

export default BRDF_GGX;
