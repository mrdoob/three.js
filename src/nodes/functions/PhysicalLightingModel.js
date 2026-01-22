import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_GGX from './BSDF/BRDF_GGX.js';
import BRDF_GGX_Multiscatter from './BSDF/BRDF_GGX_Multiscatter.js';
import DFGLUT from './BSDF/DFGLUT.js';
import EnvironmentBRDF from './BSDF/EnvironmentBRDF.js';
import F_Schlick from './BSDF/F_Schlick.js';
import Schlick_to_F0 from './BSDF/Schlick_to_F0.js';
import BRDF_Sheen from './BSDF/BRDF_Sheen.js';
import { LTC_Evaluate, LTC_Uv } from './BSDF/LTC.js';
import LightingModel from '../core/LightingModel.js';
import { diffuseColor, diffuseContribution, specularColor, specularColorBlended, specularF90, roughness, metalness, clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness, ior, thickness, transmission, attenuationDistance, attenuationColor, dispersion } from '../core/PropertyNode.js';
import { normalView, clearcoatNormalView, normalWorld } from '../accessors/Normal.js';
import { positionViewDirection, positionView, positionWorld } from '../accessors/Position.js';
import { Fn, float, vec2, vec3, vec4, mat3, If } from '../tsl/TSLBase.js';
import { mix, normalize, refract, length, clamp, log2, log, exp, smoothstep } from '../math/MathNode.js';
import { div } from '../math/OperatorNode.js';
import { cameraPosition, cameraProjectionMatrix, cameraViewMatrix } from '../accessors/Camera.js';
import { modelWorldMatrix } from '../accessors/ModelNode.js';
import { screenSize } from '../display/ScreenNode.js';
import { viewportMipTexture, viewportOpaqueMipTexture } from '../display/ViewportTextureNode.js';
import { textureBicubicLevel } from '../accessors/TextureBicubic.js';
import { Loop } from '../utils/LoopNode.js';
import { BackSide } from '../../constants.js';

//
// Transmission
//

const getVolumeTransmissionRay = /*@__PURE__*/ Fn( ( [ n, v, thickness, ior, modelMatrix ] ) => {

	// Direction of refracted light.
	const refractionVector = vec3( refract( v.negate(), normalize( n ), div( 1.0, ior ) ) );

	// Compute rotation-independent scaling of the model matrix.
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
const viewportFrontSideTexture = /*@__PURE__*/ viewportOpaqueMipTexture();

const getTransmissionSample = /*@__PURE__*/ Fn( ( [ fragCoord, roughness, ior ], { material } ) => {

	const vTexture = material.side === BackSide ? viewportBackSideTexture : viewportFrontSideTexture;

	const transmissionSample = vTexture.sample( fragCoord );
	//const transmissionSample = viewportMipTexture( fragCoord );

	const lod = log2( screenSize.x ).mul( applyIorToRoughness( roughness, ior ) );

	return textureBicubicLevel( transmissionSample, lod );

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

// This is a curve-fit approximation to the "Charlie sheen" BRDF integrated over the hemisphere from
// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF".
const IBLSheenBRDF = /*@__PURE__*/ Fn( ( { normal, viewDir, roughness } ) => {

	const dotNV = normal.dot( viewDir ).saturate();
	const r2 = roughness.mul( roughness );
	const rInv = roughness.add( 0.1 ).reciprocal();

	const a = float( - 1.9362 ).add( roughness.mul( 1.0678 ) ).add( r2.mul( 0.4573 ) ).sub( rInv.mul( 0.8469 ) );
	const b = float( - 0.6014 ).add( roughness.mul( 0.5538 ) ).sub( r2.mul( 0.4670 ) ).sub( rInv.mul( 0.1255 ) );

	const DG = a.mul( dotNV ).add( b ).exp();

	return DG.saturate();

} );

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = float( 1 );


/**
 * Represents the lighting model for a PBR material.
 *
 * @augments LightingModel
 */
class PhysicalLightingModel extends LightingModel {

	/**
	 * Constructs a new physical lighting model.
	 *
	 * @param {boolean} [clearcoat=false] - Whether clearcoat is supported or not.
	 * @param {boolean} [sheen=false] - Whether sheen is supported or not.
	 * @param {boolean} [iridescence=false] - Whether iridescence is supported or not.
	 * @param {boolean} [anisotropy=false] - Whether anisotropy is supported or not.
	 * @param {boolean} [transmission=false] - Whether transmission is supported or not.
	 * @param {boolean} [dispersion=false] - Whether dispersion is supported or not.
	 */
	constructor( clearcoat = false, sheen = false, iridescence = false, anisotropy = false, transmission = false, dispersion = false ) {

		super();

		/**
		 * Whether clearcoat is supported or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.clearcoat = clearcoat;

		/**
		 * Whether sheen is supported or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.sheen = sheen;

		/**
		 * Whether iridescence is supported or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.iridescence = iridescence;

		/**
		 * Whether anisotropy is supported or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.anisotropy = anisotropy;

		/**
		 * Whether transmission is supported or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.transmission = transmission;

		/**
		 * Whether dispersion is supported or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.dispersion = dispersion;

		/**
		 * The clear coat radiance.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.clearcoatRadiance = null;

		/**
		 * The clear coat specular direct.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.clearcoatSpecularDirect = null;

		/**
		 * The clear coat specular indirect.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.clearcoatSpecularIndirect = null;

		/**
		 * The sheen specular direct.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.sheenSpecularDirect = null;

		/**
		 * The sheen specular indirect.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.sheenSpecularIndirect = null;

		/**
		 * The iridescence Fresnel.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.iridescenceFresnel = null;

		/**
		 * The iridescence F0.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.iridescenceF0 = null;

		/**
		 * The iridescence F0 dielectric.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.iridescenceF0Dielectric = null;

		/**
		 * The iridescence F0 metallic.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.iridescenceF0Metallic = null;

	}

	/**
	 * Depending on what features are requested, the method prepares certain node variables
	 * which are later used for lighting computations.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	start( builder ) {

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

			const dotNVi = normalView.dot( positionViewDirection ).clamp();

			const iridescenceFresnelDielectric = evalIridescence( {
				outsideIOR: float( 1.0 ),
				eta2: iridescenceIOR,
				cosTheta1: dotNVi,
				thinFilmThickness: iridescenceThickness,
				baseF0: specularColor
			} );

			const iridescenceFresnelMetallic = evalIridescence( {
				outsideIOR: float( 1.0 ),
				eta2: iridescenceIOR,
				cosTheta1: dotNVi,
				thinFilmThickness: iridescenceThickness,
				baseF0: diffuseColor.rgb
			} );

			this.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, metalness );

			this.iridescenceF0Dielectric = Schlick_to_F0( { f: iridescenceFresnelDielectric, f90: 1.0, dotVH: dotNVi } );
			this.iridescenceF0Metallic = Schlick_to_F0( { f: iridescenceFresnelMetallic, f90: 1.0, dotVH: dotNVi } );

			this.iridescenceF0 = mix( this.iridescenceF0Dielectric, this.iridescenceF0Metallic, metalness );

		}

		if ( this.transmission === true ) {

			const position = positionWorld;
			const v = cameraPosition.sub( positionWorld ).normalize(); // TODO: Create Node for this, same issue in MaterialX
			const n = normalWorld;

			const context = builder.context;

			context.backdrop = getIBLVolumeRefraction(
				n,
				v,
				roughness,
				diffuseContribution,
				specularColorBlended,
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

		super.start( builder );

	}

	// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
	// Approximates multi-scattering in order to preserve energy.
	// http://www.jcgt.org/published/0008/01/03/

	computeMultiscattering( singleScatter, multiScatter, specularF90, f0, iridescenceF0 = null ) {

		const dotNV = normalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

		const fab = DFGLUT( { roughness, dotNV } );

		const Fr = iridescenceF0 ? iridescence.mix( f0, iridescenceF0 ) : f0;

		const FssEss = Fr.mul( fab.x ).add( specularF90.mul( fab.y ) );

		const Ess = fab.x.add( fab.y );
		const Ems = Ess.oneMinus();

		const Favg = Fr.add( Fr.oneMinus().mul( 0.047619 ) ); // 1/21
		const Fms = FssEss.mul( Favg ).div( Ems.mul( Favg ).oneMinus() );

		singleScatter.addAssign( FssEss );
		multiScatter.addAssign( Fms.mul( Ems ) );

	}

	/**
	 * Implements the direct light.
	 *
	 * @param {Object} lightData - The light data.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	direct( { lightDirection, lightColor, reflectedLight }, /* builder */ ) {

		const dotNL = normalView.dot( lightDirection ).clamp();
		const irradiance = dotNL.mul( lightColor ).toVar();

		if ( this.sheen === true ) {

			this.sheenSpecularDirect.addAssign( irradiance.mul( BRDF_Sheen( { lightDirection } ) ) );

			const sheenAlbedoV = IBLSheenBRDF( { normal: normalView, viewDir: positionViewDirection, roughness: sheenRoughness } );
			const sheenAlbedoL = IBLSheenBRDF( { normal: normalView, viewDir: lightDirection, roughness: sheenRoughness } );

			const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( sheenAlbedoV.max( sheenAlbedoL ) ).oneMinus();

			irradiance.mulAssign( sheenEnergyComp );

		}

		if ( this.clearcoat === true ) {

			const dotNLcc = clearcoatNormalView.dot( lightDirection ).clamp();
			const ccIrradiance = dotNLcc.mul( lightColor );

			this.clearcoatSpecularDirect.addAssign( ccIrradiance.mul( BRDF_GGX( { lightDirection, f0: clearcoatF0, f90: clearcoatF90, roughness: clearcoatRoughness, normalView: clearcoatNormalView } ) ) );

		}

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseContribution } ) ) );

		reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX_Multiscatter( { lightDirection, f0: specularColorBlended, f90: 1, roughness, f: this.iridescenceFresnel, USE_IRIDESCENCE: this.iridescence, USE_ANISOTROPY: this.anisotropy } ) ) );

	}

	/**
	 * This method is intended for implementing the direct light term for
	 * rect area light nodes.
	 *
	 * @param {Object} input - The input data.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	directRectArea( { lightColor, lightPosition, halfWidth, halfHeight, reflectedLight, ltc_1, ltc_2 }, /* builder */ ) {

		const p0 = lightPosition.add( halfWidth ).sub( halfHeight ); // counterclockwise; light shines in local neg z direction
		const p1 = lightPosition.sub( halfWidth ).sub( halfHeight );
		const p2 = lightPosition.sub( halfWidth ).add( halfHeight );
		const p3 = lightPosition.add( halfWidth ).add( halfHeight );

		const N = normalView;
		const V = positionViewDirection;
		const P = positionView.toVar();

		const uv = LTC_Uv( { N, V, roughness } );

		const t1 = ltc_1.sample( uv ).toVar();
		const t2 = ltc_2.sample( uv ).toVar();

		const mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3( 0, 1, 0 ),
			vec3( t1.z, 0, t1.w )
		).toVar();

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		const fresnel = specularColorBlended.mul( t2.x ).add( specularF90.sub( specularColorBlended ).mul( t2.y ) ).toVar();

		reflectedLight.directSpecular.addAssign( lightColor.mul( fresnel ).mul( LTC_Evaluate( { N, V, P, mInv, p0, p1, p2, p3 } ) ) );

		reflectedLight.directDiffuse.addAssign( lightColor.mul( diffuseContribution ).mul( LTC_Evaluate( { N, V, P, mInv: mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 ), p0, p1, p2, p3 } ) ) );

		if ( this.clearcoat === true ) {

			const Ncc = clearcoatNormalView;

			const uvClearcoat = LTC_Uv( { N: Ncc, V, roughness: clearcoatRoughness } );

			const t1Clearcoat = ltc_1.sample( uvClearcoat );
			const t2Clearcoat = ltc_2.sample( uvClearcoat );

			const mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3( 0, 1, 0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);

			// LTC Fresnel Approximation for clearcoat
			const fresnelClearcoat = clearcoatF0.mul( t2Clearcoat.x ).add( clearcoatF90.sub( clearcoatF0 ).mul( t2Clearcoat.y ) );

			this.clearcoatSpecularDirect.addAssign( lightColor.mul( fresnelClearcoat ).mul( LTC_Evaluate( { N: Ncc, V, P, mInv: mInvClearcoat, p0, p1, p2, p3 } ) ) );

		}

	}

	/**
	 * Implements the indirect lighting.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirect( builder ) {

		this.indirectDiffuse( builder );
		this.indirectSpecular( builder );
		this.ambientOcclusion( builder );

	}

	/**
	 * Implements the indirect diffuse term.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirectDiffuse( builder ) {

		const { irradiance, reflectedLight } = builder.context;

		const diffuse = irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseContribution } ) ).toVar();

		if ( this.sheen === true ) {

			const sheenAlbedo = IBLSheenBRDF( { normal: normalView, viewDir: positionViewDirection, roughness: sheenRoughness } );

			const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( sheenAlbedo ).oneMinus();

			diffuse.mulAssign( sheenEnergyComp );

		}

		reflectedLight.indirectDiffuse.addAssign( diffuse );

	}

	/**
	 * Implements the indirect specular term.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirectSpecular( builder ) {

		const { radiance, iblIrradiance, reflectedLight } = builder.context;

		if ( this.sheen === true ) {

			this.sheenSpecularIndirect.addAssign( iblIrradiance.mul(
				sheen,
				IBLSheenBRDF( {
					normal: normalView,
					viewDir: positionViewDirection,
					roughness: sheenRoughness
				} )
			) );

		}

		if ( this.clearcoat === true ) {

			const dotNVcc = clearcoatNormalView.dot( positionViewDirection ).clamp();

			const clearcoatEnv = EnvironmentBRDF( {
				dotNV: dotNVcc,
				specularColor: clearcoatF0,
				specularF90: clearcoatF90,
				roughness: clearcoatRoughness
			} );

			this.clearcoatSpecularIndirect.addAssign( this.clearcoatRadiance.mul( clearcoatEnv ) );

		}

		// Both indirect specular and indirect diffuse light accumulate here
		// Compute multiscattering separately for dielectric and metallic, then mix

		const singleScatteringDielectric = vec3().toVar( 'singleScatteringDielectric' );
		const multiScatteringDielectric = vec3().toVar( 'multiScatteringDielectric' );
		const singleScatteringMetallic = vec3().toVar( 'singleScatteringMetallic' );
		const multiScatteringMetallic = vec3().toVar( 'multiScatteringMetallic' );

		this.computeMultiscattering( singleScatteringDielectric, multiScatteringDielectric, specularF90, specularColor, this.iridescenceF0Dielectric );
		this.computeMultiscattering( singleScatteringMetallic, multiScatteringMetallic, specularF90, diffuseColor.rgb, this.iridescenceF0Metallic );

		// Mix based on metalness
		const singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, metalness );
		const multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, metalness );

		// Diffuse energy conservation uses dielectric path
		const totalScatteringDielectric = singleScatteringDielectric.add( multiScatteringDielectric );

		const diffuse = diffuseContribution.mul( totalScatteringDielectric.oneMinus() );

		const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

		const indirectSpecular = radiance.mul( singleScattering ).add( multiScattering.mul( cosineWeightedIrradiance ) ).toVar();
		const indirectDiffuse = diffuse.mul( cosineWeightedIrradiance ).toVar();

		if ( this.sheen === true ) {

			const sheenAlbedo = IBLSheenBRDF( { normal: normalView, viewDir: positionViewDirection, roughness: sheenRoughness } );

			const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( sheenAlbedo ).oneMinus();

			indirectSpecular.mulAssign( sheenEnergyComp );
			indirectDiffuse.mulAssign( sheenEnergyComp );

		}

		reflectedLight.indirectSpecular.addAssign( indirectSpecular );

		reflectedLight.indirectDiffuse.addAssign( indirectDiffuse );

	}

	/**
	 * Implements the ambient occlusion term.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	ambientOcclusion( builder ) {

		const { ambientOcclusion, reflectedLight } = builder.context;

		const dotNV = normalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

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

	/**
	 * Used for final lighting accumulations depending on the requested features.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	finish( { context } ) {

		const { outgoingLight } = context;

		if ( this.clearcoat === true ) {

			const dotNVcc = clearcoatNormalView.dot( positionViewDirection ).clamp();

			const Fcc = F_Schlick( {
				dotVH: dotNVcc,
				f0: clearcoatF0,
				f90: clearcoatF90
			} );

			const clearcoatLight = outgoingLight.mul( clearcoat.mul( Fcc ).oneMinus() ).add( this.clearcoatSpecularDirect.add( this.clearcoatSpecularIndirect ).mul( clearcoat ) );

			outgoingLight.assign( clearcoatLight );

		}

		if ( this.sheen === true ) {

			const sheenLight = outgoingLight.add( this.sheenSpecularDirect, this.sheenSpecularIndirect.mul( 1.0 / Math.PI ) );

			outgoingLight.assign( sheenLight );

		}

	}

}

export default PhysicalLightingModel;
