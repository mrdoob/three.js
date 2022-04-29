import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import {
	ShaderNode, mul, saturate, dot, transformedNormalView,
	diffuseColor, specularColor, roughness
} from '../shadernode/ShaderNodeBaseElements.js';

const RE_Direct_Physical = new ShaderNode( ( inputs ) => {

	const { lightDirection, lightColor, reflectedLight } = inputs;

	const dotNL = saturate( dot( transformedNormalView, lightDirection ) );
	const irradiance = mul( dotNL, lightColor );

	reflectedLight.directSpecular.add( mul( irradiance, BRDF_GGX.call( { lightDirection, f0: specularColor, f90: 1, roughness } ) ) );

	reflectedLight.directDiffuse.add( mul( irradiance, BRDF_Lambert.call( { diffuseColor: diffuseColor.rgb } ) ) );

} );

const PhysicalLightingModel = new ShaderNode( ( inputs/*, builder*/ ) => {

	RE_Direct_Physical.call( inputs );

} );

export default PhysicalLightingModel;
