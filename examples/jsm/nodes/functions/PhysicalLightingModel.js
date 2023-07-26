import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import DFGApprox from './BSDF/DFGApprox.js';
import EnvironmentBRDF from './BSDF/EnvironmentBRDF.js';
import F_Schlick from './BSDF/F_Schlick.js';
import Schlick_to_F0 from './BSDF/Schlick_to_F0.js';
import BRDF_Sheen from './BSDF/BRDF_Sheen.js';
import LightingModel from '../core/LightingModel.js';
import { diffuseColor, specularColor, roughness, clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness } from '../core/PropertyNode.js';
import { transformedNormalView, transformedClearcoatNormalView } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { float, vec3, mat3 } from '../shadernode/ShaderNode.js';
import { cond } from '../math/CondNode.js';
import { mix, smoothstep } from '../math/MathNode.js';

//
// Iridescence
//

// XYZ to linear-sRGB color space
const XYZ_TO_REC709 = mat3(
	3.2404542, - 0.9692660, 0.0556434,
	- 1.5371385, 1.8760108, - 0.2040259,
	- 0.4985314, 0.0415560, 1.0572252
);

// Assume air interface for top
// Note: We don't handle the case fresnel0 == 1
const Fresnel0ToIor = ( fresnel0 ) => {

	const sqrtF0 = fresnel0.sqrt();
	return vec3( 1.0 ).add( sqrtF0 ).div( vec3( 1.0 ).sub( sqrtF0 ) );

};

// ior is a value between 1.0 and 3.0. 1.0 is air interface
const IorToFresnel0 = ( transmittedIor, incidentIor ) => {

	return transmittedIor.sub( incidentIor ).div( transmittedIor.add( incidentIor ) ).pow2();

};

// Fresnel equations for dielectric/dielectric interfaces.
// Ref: https://belcour.github.io/blog/research/2017/05/01/brdf-thin-film.html
// Evaluation XYZ sensitivity curves in Fourier space
const evalSensitivity = ( OPD, shift ) => {

	const phase = OPD.mul( 2.0 * Math.PI * 1.0e-9 );
	const val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
	const pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
	const VAR = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );

	const x = float( 9.7470e-14 * Math.sqrt( 2.0 * Math.PI * 4.5282e+09 ) ).mul( phase.mul( 2.2399e+06 ).add( shift.x ).cos() ).mul( phase.pow2().mul( - 4.5282e+09 ).exp() );

	let xyz = val.mul( VAR.mul( 2.0 * Math.PI ).sqrt() ).mul( pos.mul( phase ).add( shift ).cos() ).mul( phase.pow2().negate().mul( VAR ).exp() );
	xyz = vec3( xyz.x.add( x ), xyz.y, xyz.z ).div( 1.0685e-7 );

	const rgb = XYZ_TO_REC709.mul( xyz );
	return rgb;

};

const evalIridescence = ( outsideIOR, eta2, cosTheta1, thinFilmThickness, baseF0 ) => {

	// Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0
	const iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
	// Evaluate the cosTheta on the base layer (Snell law)
	const sinTheta2Sq = outsideIOR.div( iridescenceIOR ).pow2().mul( float( 1 ).sub( cosTheta1.pow2() ) );

	// Handle TIR:
	const cosTheta2Sq = float( 1 ).sub( sinTheta2Sq );
	/*if ( cosTheta2Sq < 0.0 ) {

			return vec3( 1.0 );

	}*/

	const cosTheta2 = cosTheta2Sq.sqrt();

	// First interface
	const R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
	const R12 = F_Schlick( { f0: R0, f90: 1.0, dotVH: cosTheta1 } );
	//const R21 = R12;
	const T121 = R12.oneMinus();
	const phi12 = iridescenceIOR.lessThan( outsideIOR ).cond( Math.PI, 0.0 );
	const phi21 = float( Math.PI ).sub( phi12 );

	// Second interface
	const baseIOR = Fresnel0ToIor( baseF0.clamp( 0.0, 0.9999 ) ); // guard against 1.0
	const R1 = IorToFresnel0( baseIOR, iridescenceIOR.vec3() );
	const R23 = F_Schlick( { f0: R1, f90: 1.0, dotVH: cosTheta2 } );
	const phi23 = vec3(
		baseIOR.x.lessThan( iridescenceIOR ).cond( Math.PI, 0.0 ),
		baseIOR.y.lessThan( iridescenceIOR ).cond( Math.PI, 0.0 ),
		baseIOR.z.lessThan( iridescenceIOR ).cond( Math.PI, 0.0 )
	);

	// Phase shift
	const OPD = iridescenceIOR.mul( thinFilmThickness, cosTheta2, 2.0 );
	const phi = vec3( phi21 ).add( phi23 );

	// Compound terms
	const R123 = R12.mul( R23 ).clamp( 1e-5, 0.9999 );
	const r123 = R123.sqrt();
	const Rs = T121.pow2().mul( R23 ).div( vec3( 1.0 ).sub( R123 ) );

	// Reflectance term for m = 0 (DC term amplitude)
	const C0 = R12.add( Rs );
	let I = C0;

	// Reflectance term for m > 0 (pairs of diracs)
	let Cm = Rs.sub( T121 );
	for ( let m = 1; m <= 2; ++ m ) {

		Cm = Cm.mul( r123 );
		const Sm = evalSensitivity( float( m ).mul( OPD ), float( m ).mul( phi ) ).mul( 2.0 );
		I = I.add( Cm.mul( Sm ) );

	}

	// Since out of gamut colors might be produced, negative color values are clamped to 0.
	return I.max( vec3( 0.0 ) );

};

//
//	Sheen
//

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

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = vec3( 1 );

//

class PhysicalLightingModel extends LightingModel {

	constructor( clearcoat = true, sheen = true, iridescence = true ) {

		super();

		this.clearcoat = clearcoat;
		this.sheen = sheen;
		this.iridescence = iridescence;

		this.clearcoatRadiance = null;
		this.clearcoatSpecular = null;
		this.sheenSpecular = null;
		this.iridescenceFresnel = null;
		this.iridescenceF0 = null;

	}

	init( { reflectedLight } ) {

		if ( this.clearcoat === true ) {

			this.clearcoatRadiance = vec3().temp();
			this.clearcoatSpecular = vec3().temp();

			const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

			const Fcc = F_Schlick( {
				dotVH: dotNVcc,
				f0: clearcoatF0,
				f90: clearcoatF90
			} );

			const outgoingLight = reflectedLight.total;
			const clearcoatLight = outgoingLight.mul( clearcoat.mul( Fcc ).oneMinus() ).add( this.clearcoatSpecular.mul( clearcoat ) );

			outgoingLight.assign( clearcoatLight );

		}

		if ( this.sheen === true ) {

			this.sheenSpecular = vec3().temp();

			const outgoingLight = reflectedLight.total;

			const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( 0.157 ).oneMinus();
			const sheenLight = outgoingLight.mul( sheenEnergyComp ).add( this.sheenSpecular );

			outgoingLight.assign( sheenLight );

		}

		if ( this.iridescence === true ) {

			const dotNVi = transformedNormalView.dot( positionViewDirection ).clamp();

			this.iridescenceFresnel = evalIridescence( float( 1.0 ), iridescenceIOR, dotNVi, iridescenceThickness, specularColor );
			this.iridescenceF0 = Schlick_to_F0( { f: this.iridescenceFresnel, f90: 1.0, dotVH: dotNVi } );

		}

	}

	// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
	// Approximates multiscattering in order to preserve energy.
	// http://www.jcgt.org/published/0008/01/03/

	computeMultiscattering( singleScatter, multiScatter, specularF90 = float( 1 ) ) {

		const fab = DFGApprox( { roughness } );

		const Fr = this.iridescenceF0 ? iridescence.mix( specularColor, this.iridescenceF0 ) : specularColor;

		const FssEss = Fr.mul( fab.x ).add( specularF90.mul( fab.y ) );

		const Ess = fab.x.add( fab.y );
		const Ems = Ess.oneMinus();

		const Favg = specularColor.add( specularColor.oneMinus().mul( 0.047619 ) ); // 1/21
		const Fms = FssEss.mul( Favg ).div( Ems.mul( Favg ).oneMinus() );

		singleScatter.addAssign( FssEss );
		multiScatter.addAssign( Fms.mul( Ems ) );

	}

	direct( { lightDirection, lightColor, reflectedLight } ) {

		const dotNL = transformedNormalView.dot( lightDirection ).clamp();
		const irradiance = dotNL.mul( lightColor );

		if ( this.sheen === true ) {

			this.sheenSpecular.addAssign( irradiance.mul( BRDF_Sheen( { lightDirection } ) ) );

		}

		if ( this.clearcoat === true ) {

			const dotNLcc = transformedClearcoatNormalView.dot( lightDirection ).clamp();
			const ccIrradiance = dotNLcc.mul( lightColor );

			this.clearcoatSpecular.addAssign( ccIrradiance.mul( BRDF_GGX( { lightDirection, f0: clearcoatF0, f90: clearcoatF90, roughness: clearcoatRoughness, normalView: transformedClearcoatNormalView } ) ) );

		}

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

		reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX( { lightDirection, f0: specularColor, f90: 1, roughness, iridescence: this.iridescence, iridescenceFresnel: this.iridescenceFresnel } ) ) );

	}

	indirectDiffuse( { irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

	}

	indirectSpecular( { radiance, iblIrradiance, reflectedLight, } ) {

		if ( this.sheen === true ) {

			this.sheenSpecular.addAssign( iblIrradiance.mul(
				sheen,
				IBLSheenBRDF( transformedNormalView, positionViewDirection, sheenRoughness )
			) );

		}

		if ( this.clearcoat === true ) {

			const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

			const clearcoatEnv = EnvironmentBRDF( {
				dotNV: dotNVcc,
				specularColor: clearcoatF0,
				specularF90: clearcoatF90,
				roughness: clearcoatRoughness
			} );

			this.clearcoatSpecular.addAssign( this.clearcoatRadiance.mul( clearcoatEnv ) );

		}

		// Both indirect specular and indirect diffuse light accumulate here

		const singleScattering = vec3().temp();
		const multiScattering = vec3().temp();
		const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

		this.computeMultiscattering( singleScattering, multiScattering );

		const totalScattering = singleScattering.add( multiScattering );

		const diffuse = diffuseColor.mul( totalScattering.r.max( totalScattering.g ).max( totalScattering.b ).oneMinus() );

		reflectedLight.indirectSpecular.addAssign( radiance.mul( singleScattering ) );
		reflectedLight.indirectSpecular.addAssign( multiScattering.mul( cosineWeightedIrradiance ) );

		reflectedLight.indirectDiffuse.addAssign( diffuse.mul( cosineWeightedIrradiance ) );

	}

	ambientOcclusion( { ambientOcclusion, reflectedLight } ) {

		const dotNV = transformedNormalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

		const aoNV = dotNV.add( ambientOcclusion );
		const aoExp = roughness.mul( - 16.0 ).oneMinus().negate().exp2();

		const aoNode = ambientOcclusion.sub( aoNV.pow( aoExp ).oneMinus() ).clamp();

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

		reflectedLight.indirectSpecular.mulAssign( aoNode );

	}

}

export default PhysicalLightingModel;
