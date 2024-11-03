import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import DFGApprox from './BSDF/DFGApprox.js';
import EnvironmentBRDF from './BSDF/EnvironmentBRDF.js';
import F_Schlick from './BSDF/F_Schlick.js';
import Schlick_to_F0 from './BSDF/Schlick_to_F0.js';
import BRDF_Sheen from './BSDF/BRDF_Sheen.js';
import { LTC_Evaluate, LTC_Uv } from './BSDF/LTC.js';
import LightingModel from '../core/LightingModel.js';
import { diffuseColor, specularColor, specularF90, roughness, clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness, ior, thickness, transmission, attenuationDistance, attenuationColor, dispersion } from '../core/PropertyNode.js';
import { transformedNormalView, transformedClearcoatNormalView, transformedNormalWorld } from '../accessors/Normal.js';
import { positionViewDirection, positionView, positionWorld } from '../accessors/Position.js';
import { Fn, float, vec2, vec3, vec4, mat3, If } from '../tsl/TSLBase.js';
import { select } from '../math/ConditionalNode.js';
import { mix, normalize, refract, length, clamp, log2, log, exp, smoothstep } from '../math/MathNode.js';
import { div } from '../math/OperatorNode.js';
import { cameraPosition, cameraProjectionMatrix, cameraViewMatrix } from '../accessors/Camera.js';
import { modelWorldMatrix } from '../accessors/ModelNode.js';
import { screenSize } from '../display/ScreenNode.js';
import { viewportMipTexture } from '../display/ViewportTextureNode.js';
import { textureBicubic } from '../accessors/TextureBicubic.js';
import { Loop } from '../utils/LoopNode.js';
import { BackSide } from '../../constants.js';

//
// Transmission
//

const getVolumeTransmissionRay = /*@__PURE__*/ Fn( ( [ n, v, thickness, ior, modelMatrix ] ) => {

	// Direction of refracted light.
	const refractionVector = vec3( refract( v.negate(), normalize( n ), div( 1.0, ior ) ) );

	// Compute rotation-independant scaling of the model matrix.
	const modelScale = vec3(
		length( modelMatrix[ 0 ].xyz ),
		length( modelMatrix[ 1 ].xyz ),
		length( modelMatrix[ 2 ].xyz )
	);

	// The thickness is specified in local space.
	return normalize( refractionVector ).mul( thickness.mul( modelScale ) );

} ).setLayout( {
	name: 'getVolumeTransmissionRay',
	type: 'vec3',
	inputs: [
		{ name: 'n', type: 'vec3' },
		{ name: 'v', type: 'vec3' },
		{ name: 'thickness', type: 'float' },
		{ name: 'ior', type: 'float' },
		{ name: 'modelMatrix', type: 'mat4' }
	]
} );

const applyIorToRoughness = /*@__PURE__*/ Fn( ( [ roughness, ior ] ) => {

	// Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
	// an IOR of 1.5 results in the default amount of microfacet refraction.
	return roughness.mul( clamp( ior.mul( 2.0 ).sub( 2.0 ), 0.0, 1.0 ) );

} ).setLayout( {
	name: 'applyIorToRoughness',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'ior', type: 'float' }
	]
} );

const viewportBackSideTexture = /*@__PURE__*/ viewportMipTexture();
const viewportFrontSideTexture = /*@__PURE__*/ viewportMipTexture();

const getTransmissionSample = /*@__PURE__*/ Fn( ( [ fragCoord, roughness, ior ], { material } ) => {

	const vTexture = material.side == BackSide ? viewportBackSideTexture : viewportFrontSideTexture;

	const transmissionSample = vTexture.uv( fragCoord );
	//const transmissionSample = viewportMipTexture( fragCoord );

	const lod = log2( screenSize.x ).mul( applyIorToRoughness( roughness, ior ) );

	return textureBicubic( transmissionSample, lod );

} );

const volumeAttenuation = /*@__PURE__*/ Fn( ( [ transmissionDistance, attenuationColor, attenuationDistance ] ) => {

	If( attenuationDistance.notEqual( 0 ), () => {

		// Compute light attenuation using Beer's law.
		const attenuationCoefficient = log( attenuationColor ).negate().div( attenuationDistance );
		const transmittance = exp( attenuationCoefficient.negate().mul( transmissionDistance ) );

		return transmittance;

	} );

	// Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
	return vec3( 1.0 );

} ).setLayout( {
	name: 'volumeAttenuation',
	type: 'vec3',
	inputs: [
		{ name: 'transmissionDistance', type: 'float' },
		{ name: 'attenuationColor', type: 'vec3' },
		{ name: 'attenuationDistance', type: 'float' }
	]
} );

const getIBLVolumeRefraction = /*@__PURE__*/ Fn( ( [ n, v, roughness, diffuseColor, specularColor, specularF90, position, modelMatrix, viewMatrix, projMatrix, ior, thickness, attenuationColor, attenuationDistance, dispersion ] ) => {

	let transmittedLight, transmittance;

	if ( dispersion ) {

		transmittedLight = vec4().toVar();
		transmittance = vec3().toVar();

		const halfSpread = ior.sub( 1.0 ).mul( dispersion.mul( 0.025 ) );
		const iors = vec3( ior.sub( halfSpread ), ior, ior.add( halfSpread ) );

		Loop( { start: 0, end: 3 }, ( { i } ) => {

			const ior = iors.element( i );

			const transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			const refractedRayExit = position.add( transmissionRay );

			// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
			const ndcPos = projMatrix.mul( viewMatrix.mul( vec4( refractedRayExit, 1.0 ) ) );
			const refractionCoords = vec2( ndcPos.xy.div( ndcPos.w ) ).toVar();
			refractionCoords.addAssign( 1.0 );
			refractionCoords.divAssign( 2.0 );
			refractionCoords.assign( vec2( refractionCoords.x, refractionCoords.y.oneMinus() ) ); // webgpu

			// Sample framebuffer to get pixel the refracted ray hits.
			const transmissionSample = getTransmissionSample( refractionCoords, roughness, ior );

			transmittedLight.element( i ).assign( transmissionSample.element( i ) );
			transmittedLight.a.addAssign( transmissionSample.a );

			transmittance.element( i ).assign( diffuseColor.element( i ).mul( volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance ).element( i ) ) );

		} );

		transmittedLight.a.divAssign( 3.0 );

	} else {

		const transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		const refractedRayExit = position.add( transmissionRay );

		// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
		const ndcPos = projMatrix.mul( viewMatrix.mul( vec4( refractedRayExit, 1.0 ) ) );
		const refractionCoords = vec2( ndcPos.xy.div( ndcPos.w ) ).toVar();
		refractionCoords.addAssign( 1.0 );
		refractionCoords.divAssign( 2.0 );
		refractionCoords.assign( vec2( refractionCoords.x, refractionCoords.y.oneMinus() ) ); // webgpu

		// Sample framebuffer to get pixel the refracted ray hits.
		transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		transmittance = diffuseColor.mul( volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance ) );

	}

	const attenuatedColor = transmittance.rgb.mul( transmittedLight.rgb );
	const dotNV = n.dot( v ).clamp();

	// Get the specular component.
	const F = vec3( EnvironmentBRDF( { // n, v, specularColor, specularF90, roughness
		dotNV,
		specularColor,
		specularF90,
		roughness
	} ) );

	// As less light is transmitted, the opacity should be increased. This simple approximation does a decent job
	// of modulating a CSS background, and has no effect when the buffer is opaque, due to a solid object or clear color.
	const transmittanceFactor = transmittance.r.add( transmittance.g, transmittance.b ).div( 3.0 );

	return vec4( F.oneMinus().mul( attenuatedColor ), transmittedLight.a.oneMinus().mul( transmittanceFactor ).oneMinus() );

} );

//
// Iridescence
//

// XYZ to linear-sRGB color space
const XYZ_TO_REC709 = /*@__PURE__*/ mat3(
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

const evalIridescence = /*@__PURE__*/ Fn( ( { outsideIOR, eta2, cosTheta1, thinFilmThickness, baseF0 } ) => {

	// Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0
	const iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
	// Evaluate the cosTheta on the base layer (Snell law)
	const sinTheta2Sq = outsideIOR.div( iridescenceIOR ).pow2().mul( cosTheta1.pow2().oneMinus() );

	// Handle TIR:
	const cosTheta2Sq = sinTheta2Sq.oneMinus();

	If( cosTheta2Sq.lessThan( 0 ), () => {

		return vec3( 1.0 );

	} );

	const cosTheta2 = cosTheta2Sq.sqrt();

	// First interface
	const R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
	const R12 = F_Schlick( { f0: R0, f90: 1.0, dotVH: cosTheta1 } );
	//const R21 = R12;
	const T121 = R12.oneMinus();
	const phi12 = iridescenceIOR.lessThan( outsideIOR ).select( Math.PI, 0.0 );
	const phi21 = float( Math.PI ).sub( phi12 );

	// Second interface
	const baseIOR = Fresnel0ToIor( baseF0.clamp( 0.0, 0.9999 ) ); // guard against 1.0
	const R1 = IorToFresnel0( baseIOR, iridescenceIOR.toVec3() );
	const R23 = F_Schlick( { f0: R1, f90: 1.0, dotVH: cosTheta2 } );
	const phi23 = vec3(
		baseIOR.x.lessThan( iridescenceIOR ).select( Math.PI, 0.0 ),
		baseIOR.y.lessThan( iridescenceIOR ).select( Math.PI, 0.0 ),
		baseIOR.z.lessThan( iridescenceIOR ).select( Math.PI, 0.0 )
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
	const I = C0.toVar();

	// Reflectance term for m > 0 (pairs of diracs)
	const Cm = Rs.sub( T121 ).toVar();

	Loop( { start: 1, end: 2, condition: '<=', name: 'm' }, ( { m } ) => {

		Cm.mulAssign( r123 );
		const Sm = evalSensitivity( float( m ).mul( OPD ), float( m ).mul( phi ) ).mul( 2.0 );
		I.addAssign( Cm.mul( Sm ) );

	} );

	// Since out of gamut colors might be produced, negative color values are clamped to 0.
	return I.max( vec3( 0.0 ) );

} ).setLayout( {
	name: 'evalIridescence',
	type: 'vec3',
	inputs: [
		{ name: 'outsideIOR', type: 'float' },
		{ name: 'eta2', type: 'float' },
		{ name: 'cosTheta1', type: 'float' },
		{ name: 'thinFilmThickness', type: 'float' },
		{ name: 'baseF0', type: 'vec3' }
	]
} );

//
//	Sheen
//

// This is a curve-fit approxmation to the "Charlie sheen" BRDF integrated over the hemisphere from
// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF". The analysis can be found
// in the Sheen section of https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
const IBLSheenBRDF = /*@__PURE__*/ Fn( ( { normal, viewDir, roughness } ) => {

	const dotNV = normal.dot( viewDir ).saturate();

	const r2 = roughness.pow2();

	const a = select(
		roughness.lessThan( 0.25 ),
		float( - 339.2 ).mul( r2 ).add( float( 161.4 ).mul( roughness ) ).sub( 25.9 ),
		float( - 8.48 ).mul( r2 ).add( float( 14.3 ).mul( roughness ) ).sub( 9.95 )
	);

	const b = select(
		roughness.lessThan( 0.25 ),
		float( 44.0 ).mul( r2 ).sub( float( 23.7 ).mul( roughness ) ).add( 3.26 ),
		float( 1.97 ).mul( r2 ).sub( float( 3.27 ).mul( roughness ) ).add( 0.72 )
	);

	const DG = select( roughness.lessThan( 0.25 ), 0.0, float( 0.1 ).mul( roughness ).sub( 0.025 ) ).add( a.mul( dotNV ).add( b ).exp() );

	return DG.mul( 1.0 / Math.PI ).saturate();

} );

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = float( 1 );

//

class PhysicalLightingModel extends LightingModel {

	constructor( clearcoat = false, sheen = false, iridescence = false, anisotropy = false, transmission = false, dispersion = false ) {

		super();

		this.clearcoat = clearcoat;
		this.sheen = sheen;
		this.iridescence = iridescence;
		this.anisotropy = anisotropy;
		this.transmission = transmission;
		this.dispersion = dispersion;

		this.clearcoatRadiance = null;
		this.clearcoatSpecularDirect = null;
		this.clearcoatSpecularIndirect = null;
		this.sheenSpecularDirect = null;
		this.sheenSpecularIndirect = null;
		this.iridescenceFresnel = null;
		this.iridescenceF0 = null;

	}

	start( context ) {

		if ( this.clearcoat === true ) {

			this.clearcoatRadiance = vec3().toVar( 'clearcoatRadiance' );
			this.clearcoatSpecularDirect = vec3().toVar( 'clearcoatSpecularDirect' );
			this.clearcoatSpecularIndirect = vec3().toVar( 'clearcoatSpecularIndirect' );

		}

		if ( this.sheen === true ) {

			this.sheenSpecularDirect = vec3().toVar( 'sheenSpecularDirect' );
			this.sheenSpecularIndirect = vec3().toVar( 'sheenSpecularIndirect' );

		}

		if ( this.iridescence === true ) {

			const dotNVi = transformedNormalView.dot( positionViewDirection ).clamp();

			this.iridescenceFresnel = evalIridescence( {
				outsideIOR: float( 1.0 ),
				eta2: iridescenceIOR,
				cosTheta1: dotNVi,
				thinFilmThickness: iridescenceThickness,
				baseF0: specularColor
			} );

			this.iridescenceF0 = Schlick_to_F0( { f: this.iridescenceFresnel, f90: 1.0, dotVH: dotNVi } );

		}

		if ( this.transmission === true ) {

			const position = positionWorld;
			const v = cameraPosition.sub( positionWorld ).normalize(); // TODO: Create Node for this, same issue in MaterialX
			const n = transformedNormalWorld;

			context.backdrop = getIBLVolumeRefraction(
				n,
				v,
				roughness,
				diffuseColor,
				specularColor,
				specularF90, // specularF90
				position, // positionWorld
				modelWorldMatrix, // modelMatrix
				cameraViewMatrix, // viewMatrix
				cameraProjectionMatrix, // projMatrix
				ior,
				thickness,
				attenuationColor,
				attenuationDistance,
				this.dispersion ? dispersion : null
			);

			context.backdropAlpha = transmission;

			diffuseColor.a.mulAssign( mix( 1, context.backdrop.a, transmission ) );

		}

	}

	// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
	// Approximates multiscattering in order to preserve energy.
	// http://www.jcgt.org/published/0008/01/03/

	computeMultiscattering( singleScatter, multiScatter, specularF90 ) {

		const dotNV = transformedNormalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

		const fab = DFGApprox( { roughness, dotNV } );

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

			this.sheenSpecularDirect.addAssign( irradiance.mul( BRDF_Sheen( { lightDirection } ) ) );

		}

		if ( this.clearcoat === true ) {

			const dotNLcc = transformedClearcoatNormalView.dot( lightDirection ).clamp();
			const ccIrradiance = dotNLcc.mul( lightColor );

			this.clearcoatSpecularDirect.addAssign( ccIrradiance.mul( BRDF_GGX( { lightDirection, f0: clearcoatF0, f90: clearcoatF90, roughness: clearcoatRoughness, normalView: transformedClearcoatNormalView } ) ) );

		}

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

		reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX( { lightDirection, f0: specularColor, f90: 1, roughness, iridescence: this.iridescence, f: this.iridescenceFresnel, USE_IRIDESCENCE: this.iridescence, USE_ANISOTROPY: this.anisotropy } ) ) );

	}

	directRectArea( { lightColor, lightPosition, halfWidth, halfHeight, reflectedLight, ltc_1, ltc_2 } ) {

		const p0 = lightPosition.add( halfWidth ).sub( halfHeight ); // counterclockwise; light shines in local neg z direction
		const p1 = lightPosition.sub( halfWidth ).sub( halfHeight );
		const p2 = lightPosition.sub( halfWidth ).add( halfHeight );
		const p3 = lightPosition.add( halfWidth ).add( halfHeight );

		const N = transformedNormalView;
		const V = positionViewDirection;
		const P = positionView.toVar();

		const uv = LTC_Uv( { N, V, roughness } );

		const t1 = ltc_1.uv( uv ).toVar();
		const t2 = ltc_2.uv( uv ).toVar();

		const mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3( 0, 1, 0 ),
			vec3( t1.z, 0, t1.w )
		).toVar();

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		const fresnel = specularColor.mul( t2.x ).add( specularColor.oneMinus().mul( t2.y ) ).toVar();

		reflectedLight.directSpecular.addAssign( lightColor.mul( fresnel ).mul( LTC_Evaluate( { N, V, P, mInv, p0, p1, p2, p3 } ) ) );

		reflectedLight.directDiffuse.addAssign( lightColor.mul( diffuseColor ).mul( LTC_Evaluate( { N, V, P, mInv: mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 ), p0, p1, p2, p3 } ) ) );

	}

	indirect( context, stack, builder ) {

		this.indirectDiffuse( context, stack, builder );
		this.indirectSpecular( context, stack, builder );
		this.ambientOcclusion( context, stack, builder );

	}

	indirectDiffuse( { irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

	}

	indirectSpecular( { radiance, iblIrradiance, reflectedLight } ) {

		if ( this.sheen === true ) {

			this.sheenSpecularIndirect.addAssign( iblIrradiance.mul(
				sheen,
				IBLSheenBRDF( {
					normal: transformedNormalView,
					viewDir: positionViewDirection,
					roughness: sheenRoughness
				} )
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

			this.clearcoatSpecularIndirect.addAssign( this.clearcoatRadiance.mul( clearcoatEnv ) );

		}

		// Both indirect specular and indirect diffuse light accumulate here

		const singleScattering = vec3().toVar( 'singleScattering' );
		const multiScattering = vec3().toVar( 'multiScattering' );
		const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

		this.computeMultiscattering( singleScattering, multiScattering, specularF90 );

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

		if ( this.clearcoat === true ) {

			this.clearcoatSpecularIndirect.mulAssign( ambientOcclusion );

		}

		if ( this.sheen === true ) {

			this.sheenSpecularIndirect.mulAssign( ambientOcclusion );

		}

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );
		reflectedLight.indirectSpecular.mulAssign( aoNode );

	}

	finish( context ) {

		const { outgoingLight } = context;

		if ( this.clearcoat === true ) {

			const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

			const Fcc = F_Schlick( {
				dotVH: dotNVcc,
				f0: clearcoatF0,
				f90: clearcoatF90
			} );

			const clearcoatLight = outgoingLight.mul( clearcoat.mul( Fcc ).oneMinus() ).add( this.clearcoatSpecularDirect.add( this.clearcoatSpecularIndirect ).mul( clearcoat ) );

			outgoingLight.assign( clearcoatLight );

		}

		if ( this.sheen === true ) {

			const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( 0.157 ).oneMinus();
			const sheenLight = outgoingLight.mul( sheenEnergyComp ).add( this.sheenSpecularDirect, this.sheenSpecularIndirect );

			outgoingLight.assign( sheenLight );

		}

	}

}

export default PhysicalLightingModel;
