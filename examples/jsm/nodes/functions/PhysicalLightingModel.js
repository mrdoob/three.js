import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import DFGApprox from './BSDF/DFGApprox.js';
import EnvironmentBRDF from './BSDF/EnvironmentBRDF.js';
import F_Schlick from './BSDF/F_Schlick.js';
import BRDF_Sheen from './BSDF/BRDF_Sheen.js';
import { lightingModel } from '../core/LightingModel.js';
import { diffuseColor, specularColor, roughness, clearcoat, clearcoatRoughness, sheen, sheenRoughness } from '../core/PropertyNode.js';
import { transformedNormalView, transformedClearcoatNormalView } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { tslFn, float, vec3 } from '../shadernode/ShaderNode.js';
import { cond } from '../math/CondNode.js';

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = vec3( 1 );

// This is a curve-fit approxmation to the "Charlie sheen" BRDF integrated over the hemisphere from
// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF". The analysis can be found
// in the Sheen section of https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
const IBLSheenBRDF = ( normal, viewDir, roughness ) => {

	const dotNV = normal.dot( viewDir ).saturate();

	const r2 = roughness.pow2();

	const a = cond(
		roughness.lessThan( 0.25 ),
		float( - 339.2 ).mul( r2 ).add( float( 161.4 ).mul( roughness ) ).sub( 25.9 ),
		float( - 8.48 ).mul( r2 ).add( float( 14.3 ).mul( roughness ) ).sub( 9.95 )
	);

	const b = cond(
		roughness.lessThan( 0.25 ),
		float( 44.0 ).mul( r2 ).sub( float( 23.7 ).mul( roughness ) ).add( 3.26 ),
		float( 1.97 ).mul( r2 ).sub( float( 3.27 ).mul( roughness ) ).add( 0.72 )
	);

	const DG = cond( roughness.lessThan( 0.25 ), 0.0, float( 0.1 ).mul( roughness ).sub( 0.025 ) ).add( a.mul( dotNV ).add( b ).exp() );

	return DG.mul( 1.0 / Math.PI ).saturate();

};

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
const computeMultiscattering = ( singleScatter, multiScatter, specularF90 = float( 1 ) ) => {

	const fab = DFGApprox( { roughness } );

	const FssEss = specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

	const Ess = fab.x.add( fab.y );
	const Ems = Ess.oneMinus();

	const Favg = specularColor.add( specularColor.oneMinus().mul( 0.047619 ) ); // 1/21
	const Fms = FssEss.mul( Favg ).div( Ems.mul( Favg ).oneMinus() );

	singleScatter.addAssign( FssEss );
	multiScatter.addAssign( Fms.mul( Ems ) );

};

const LM_Init = tslFn( ( context, stack, builder ) => {

	if ( builder.includes( clearcoat ) ) {

		context.clearcoatRadiance = vec3().temp();
		context.reflectedLight.clearcoatSpecular = vec3().temp();

		const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

		const Fcc = F_Schlick( {
			dotVH: dotNVcc,
			f0: clearcoatF0,
			f90: clearcoatF90
		} );

		const outgoingLight = context.reflectedLight.total;
		const clearcoatLight = outgoingLight.mul( clearcoat.mul( Fcc ).oneMinus() ).add( context.reflectedLight.clearcoatSpecular.mul( clearcoat ) );

		outgoingLight.assign( clearcoatLight );

	}

	if ( builder.includes( sheen ) ) {

		context.reflectedLight.sheenSpecular = vec3().temp();

		const outgoingLight = context.reflectedLight.total;

		const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( 0.157 ).oneMinus();
		const sheenLight = outgoingLight.mul( sheenEnergyComp ).add( context.reflectedLight.sheenSpecular );

		outgoingLight.assign( sheenLight );

	}

} );

const RE_IndirectSpecular_Physical = tslFn( ( context ) => {

	const { radiance, iblIrradiance, reflectedLight } = context;

	if ( reflectedLight.sheenSpecular ) {

		reflectedLight.sheenSpecular.addAssign( iblIrradiance.mul(
			sheen,
			IBLSheenBRDF( transformedNormalView, positionViewDirection, sheenRoughness )
		) );

	}

	if ( reflectedLight.clearcoatSpecular ) {

		const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

		const clearcoatEnv = EnvironmentBRDF( {
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

const RE_IndirectDiffuse_Physical = tslFn( ( context ) => {

	const { irradiance, reflectedLight } = context;

	reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

} );

const RE_Direct_Physical = tslFn( ( inputs ) => {

	const { lightDirection, lightColor, reflectedLight } = inputs;

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const irradiance = dotNL.mul( lightColor );

	if ( reflectedLight.sheenSpecular ) {

		reflectedLight.sheenSpecular.addAssign( irradiance.mul( BRDF_Sheen( { lightDirection } ) ) );

	}

	if ( reflectedLight.clearcoatSpecular ) {

		const dotNLcc = transformedClearcoatNormalView.dot( lightDirection ).clamp();
		const ccIrradiance = dotNLcc.mul( lightColor );

		reflectedLight.clearcoatSpecular.addAssign( ccIrradiance.mul( BRDF_GGX( { lightDirection, f0: clearcoatF0, f90: clearcoatF90, roughness: clearcoatRoughness, normalView: transformedClearcoatNormalView } ) ) );

	}

	reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX( { lightDirection, f0: specularColor, f90: 1, roughness } ) ) );

} );

const RE_AmbientOcclusion_Physical = tslFn( ( context ) => {

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
