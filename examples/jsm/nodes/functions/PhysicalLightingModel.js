import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import DFGApprox from './BSDF/DFGApprox.js';
import {
	ShaderNode,
	vec3, mul, clamp, add, sub, dot, div, transformedNormalView,
	pow, exp2, dotNV,
	diffuseColor, specularColor, roughness, temp
} from '../shadernode/ShaderNodeElements.js';

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
const computeMultiscattering = ( singleScatter, multiScatter, specularF90 = 1 ) => {

	const fab = DFGApprox.call( { roughness } );

	const FssEss = add( mul( specularColor, fab.x ), mul( specularF90, fab.y ) );

	const Ess = add( fab.x, fab.y );
	const Ems = sub( 1.0, Ess );

	const Favg = add( specularColor, mul( sub( 1.0, specularColor ), 0.047619 ) ); // 1/21
	const Fms = div( mul( FssEss, Favg ), sub( 1.0, mul( Ems, Favg ) ) );

	singleScatter.add( FssEss );
	multiScatter.add( mul( Fms, Ems ) );

};

const RE_IndirectSpecular_Physical = new ShaderNode( ( inputs ) => {

	const { radiance, iblIrradiance, reflectedLight } = inputs;

	// Both indirect specular and indirect diffuse light accumulate here

	const singleScattering = temp( vec3() );
	const multiScattering = temp( vec3() );
	const cosineWeightedIrradiance = mul( iblIrradiance, 1 / Math.PI );

	computeMultiscattering( singleScattering, multiScattering );

	const diffuse = mul( diffuseColor, sub( 1.0, add( singleScattering, multiScattering ) ) );

	reflectedLight.indirectSpecular.add( mul( radiance, singleScattering ) );
	reflectedLight.indirectSpecular.add( mul( multiScattering, cosineWeightedIrradiance ) );

	reflectedLight.indirectDiffuse.add( mul( diffuse, cosineWeightedIrradiance ) );

} );

const RE_IndirectDiffuse_Physical = new ShaderNode( ( inputs ) => {

	const { irradiance, reflectedLight } = inputs;

	reflectedLight.indirectDiffuse.add( mul( irradiance, BRDF_Lambert.call( { diffuseColor } ) ) );

} );

const RE_Direct_Physical = new ShaderNode( ( inputs ) => {

	const { lightDirection, lightColor, reflectedLight } = inputs;

	const dotNL = clamp( dot( transformedNormalView, lightDirection ) );
	const irradiance = mul( dotNL, lightColor );

	reflectedLight.directDiffuse.add( mul( irradiance, BRDF_Lambert.call( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.add( mul( irradiance, BRDF_GGX.call( { lightDirection, f0: specularColor, f90: 1, roughness } ) ) );

} );

const RE_AmbientOcclusion_Physical = new ShaderNode( ( { ambientOcclusion, reflectedLight } ) => {

	const aoNV = add( dotNV, ambientOcclusion );
	const aoExp = exp2( sub( mul( - 16.0, roughness ), 1.0 ) );

	const aoNode = clamp( add( sub( pow( aoNV, aoExp ), 1.0 ), ambientOcclusion ) );

	reflectedLight.indirectDiffuse.mul( ambientOcclusion );

	reflectedLight.indirectSpecular.mul( aoNode );


} );

const PhysicalLightingModel = {
	direct: RE_Direct_Physical,
	indirectDiffuse: RE_IndirectDiffuse_Physical,
	indirectSpecular: RE_IndirectSpecular_Physical,
	ambientOcclusion: RE_AmbientOcclusion_Physical
};

export default PhysicalLightingModel;
