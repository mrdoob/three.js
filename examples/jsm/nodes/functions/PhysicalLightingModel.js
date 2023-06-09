import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import DFGApprox from './BSDF/DFGApprox.js';
import EnvironmentBRDF from './BSDF/EnvironmentBRDF.js';
import F_Schlick from './BSDF/F_Schlick.js';
import { lightingModel } from '../core/LightingModel.js';
import { diffuseColor, specularColor, roughness, clearcoat, clearcoatRoughness } from '../core/PropertyNode.js';
import { transformedNormalView, transformedClearcoatNormalView } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { ShaderNode, float, vec3 } from '../shadernode/ShaderNode.js';

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = vec3( 1 );

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

const LM_Init = new ShaderNode( ( context, stack, builder ) => {

	if ( builder.includes( clearcoat ) ) {

		context.clearcoatRadiance = vec3().temp();
		context.reflectedLight.clearcoatSpecular = vec3().temp();

		const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

		const Fcc = F_Schlick.call( {
			dotVH: dotNVcc,
			f0: clearcoatF0,
			f90: clearcoatF90
		} );

		const outgoingLight = context.reflectedLight.total;
		const clearcoatLight = outgoingLight.mul( clearcoat.mul( Fcc ).oneMinus() ).add( context.reflectedLight.clearcoatSpecular.mul( clearcoat ) );

		outgoingLight.assign( clearcoatLight );

	}

} );

const RE_IndirectSpecular_Physical = new ShaderNode( ( context ) => {

	const { radiance, iblIrradiance, reflectedLight } = context;

	if ( reflectedLight.clearcoatSpecular ) {

		const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

		const clearcoatEnv = EnvironmentBRDF.call( {
			dotNV: dotNVcc,
			specularColor: clearcoatF0,
			specularF90: clearcoatF90,
			roughness: clearcoatRoughness
		} );

		reflectedLight.clearcoatSpecular.addAssign( context.clearcoatRadiance.mul( clearcoatEnv ) );

	}

	// Both indirect specular and indirect diffuse light accumulate here

	const singleScattering = vec3().temp();
	const multiScattering = vec3().temp();
	const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

	computeMultiscattering( singleScattering, multiScattering );

	const totalScattering = singleScattering.add( multiScattering );

	const diffuse = diffuseColor.mul( totalScattering.r.max( totalScattering.g ).max( totalScattering.b ).oneMinus() );

	reflectedLight.indirectSpecular.addAssign( radiance.mul( singleScattering ) );
	reflectedLight.indirectSpecular.addAssign( multiScattering.mul( cosineWeightedIrradiance ) );

	reflectedLight.indirectDiffuse.addAssign( diffuse.mul( cosineWeightedIrradiance ) );

} );

const RE_IndirectDiffuse_Physical = new ShaderNode( ( context ) => {

	const { irradiance, reflectedLight } = context;

	reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert.call( { diffuseColor } ) ) );

} );

const RE_Direct_Physical = new ShaderNode( ( inputs ) => {

	const { lightDirection, lightColor, reflectedLight } = inputs;

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const irradiance = dotNL.mul( lightColor );

	if ( reflectedLight.clearcoatSpecular ) {

		const dotNLcc = transformedClearcoatNormalView.dot( lightDirection ).clamp();
		const ccIrradiance = dotNLcc.mul( lightColor );

		reflectedLight.clearcoatSpecular.addAssign( ccIrradiance.mul( BRDF_GGX.call( { lightDirection, f0: clearcoatF0, f90: clearcoatF90, roughness: clearcoatRoughness, normalView: transformedClearcoatNormalView } ) ) );

	}

	reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert.call( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX.call( { lightDirection, f0: specularColor, f90: 1, roughness } ) ) );

} );

const RE_AmbientOcclusion_Physical = new ShaderNode( ( context ) => {

	const { ambientOcclusion, reflectedLight } = context;

	const dotNV = transformedNormalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

	const aoNV = dotNV.add( ambientOcclusion );
	const aoExp = roughness.mul( - 16.0 ).oneMinus().negate().exp2();

	const aoNode = ambientOcclusion.sub( aoNV.pow( aoExp ).oneMinus() ).clamp();

	reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	reflectedLight.indirectSpecular.mulAssign( aoNode );


} );

const physicalLightingModel = lightingModel( LM_Init, RE_Direct_Physical, RE_IndirectDiffuse_Physical, RE_IndirectSpecular_Physical, RE_AmbientOcclusion_Physical );

export default physicalLightingModel;
