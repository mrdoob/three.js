import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import DFGApprox from './BSDF/DFGApprox.js';
import { lightingModel } from '../core/LightingModel.js';
import { temp } from '../core/VarNode.js';
import { diffuseColor, specularColor, roughness } from '../core/PropertyNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { ShaderNode, float, vec3 } from '../shadernode/ShaderNode.js';

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
const computeMultiscattering = ( singleScatter, multiScatter, specularF90 = float( 1 ) ) => {

	const fab = DFGApprox.call( { roughness } );

	const FssEss = specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

	const Ess = fab.x.add( fab.y );
	const Ems = Ess.oneMinus();

	const Favg = specularColor.add( specularColor.oneMinus().mul( 0.047619 ) ); // 1/21
	const Fms = FssEss.mul( Favg ).div( Ems.mul( Favg ).oneMinus() );

	singleScatter.addAssign( FssEss );
	multiScatter.addAssign( Fms.mul( Ems ) );

};

const RE_IndirectSpecular_Physical = new ShaderNode( ( inputs ) => {

	const { radiance, iblIrradiance, reflectedLight } = inputs;

	// Both indirect specular and indirect diffuse light accumulate here

	const singleScattering = temp( vec3() );
	const multiScattering = temp( vec3() );
	const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

	computeMultiscattering( singleScattering, multiScattering );

	const totalScattering = singleScattering.add( multiScattering );

	const diffuse = diffuseColor.mul( totalScattering.r.max( totalScattering.g ).max( totalScattering.b ).oneMinus() );

	reflectedLight.indirectSpecular.addAssign( radiance.mul( singleScattering ) );
	reflectedLight.indirectSpecular.addAssign( multiScattering.mul( cosineWeightedIrradiance ) );

	reflectedLight.indirectDiffuse.addAssign( diffuse.mul( cosineWeightedIrradiance ) );

} );

const RE_IndirectDiffuse_Physical = new ShaderNode( ( inputs ) => {

	const { irradiance, reflectedLight } = inputs;

	reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert.call( { diffuseColor } ) ) );

} );

const RE_Direct_Physical = new ShaderNode( ( inputs ) => {

	const { lightDirection, lightColor, reflectedLight } = inputs;

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const irradiance = dotNL.mul( lightColor );

	reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert.call( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX.call( { lightDirection, f0: specularColor, f90: 1, roughness } ) ) );

} );

const RE_AmbientOcclusion_Physical = new ShaderNode( ( { ambientOcclusion, reflectedLight } ) => {

	const dotNV = transformedNormalView.dot( positionViewDirection ).clamp();

	const aoNV = dotNV.add( ambientOcclusion );
	const aoExp = roughness.mul( - 16.0 ).oneMinus().negate().exp2();

	const aoNode = ambientOcclusion.sub( aoNV.pow( aoExp ).oneMinus() ).clamp();

	reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	reflectedLight.indirectSpecular.mulAssign( aoNode );


} );

const physicalLightingModel = lightingModel( RE_Direct_Physical, RE_IndirectDiffuse_Physical, RE_IndirectSpecular_Physical, RE_AmbientOcclusion_Physical );

export default physicalLightingModel;
