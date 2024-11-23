import {
	BackSide,
	BoxGeometry,
	Mesh,
	Vector3,
	NodeMaterial
} from 'three/webgpu';

import { Fn, float, vec3, acos, add, mul, clamp, cos, dot, exp, max, mix, modelViewProjection, normalize, positionWorld, pow, smoothstep, sub, varying, varyingProperty, vec4, uniform, cameraPosition } from 'three/tsl';

/**
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight
 *
 * First implemented by Simon Wallner
 * http://simonwallner.at/project/atmospheric-scattering/
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/

class SkyMesh extends Mesh {

	constructor() {

		const material = new NodeMaterial();

		super( new BoxGeometry( 1, 1, 1 ), material );

		this.turbidity = uniform( 2 );
		this.rayleigh = uniform( 1 );
		this.mieCoefficient = uniform( 0.005 );
		this.mieDirectionalG = uniform( 0.8 );
		this.sunPosition = uniform( new Vector3() );
		this.upUniform = uniform( new Vector3( 0, 1, 0 ) );

		this.isSky = true;

		const vertexNode = /*@__PURE__*/ Fn( () => {

			// constants for atmospheric scattering
			const e = float( 2.71828182845904523536028747135266249775724709369995957 );
			// const pi = float( 3.141592653589793238462643383279502884197169 );

			// wavelength of used primaries, according to preetham
			// const lambda = vec3( 680E-9, 550E-9, 450E-9 );
			// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
			// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
			const totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

			// mie stuff
			// K coefficient for the primaries
			// const v = float( 4.0 );
			// const K = vec3( 0.686, 0.678, 0.666 );
			// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
			const MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

			// earth shadow hack
			// cutoffAngle = pi / 1.95;
			const cutoffAngle = float( 1.6110731556870734 );
			const steepness = float( 1.5 );
			const EE = float( 1000.0 );

			// varying sun position

			const vSunDirection = normalize( this.sunPosition );
			varyingProperty( 'vec3', 'vSunDirection' ).assign( vSunDirection );

			// varying sun intensity

			const angle = dot( vSunDirection, this.upUniform );
			const zenithAngleCos = clamp( angle, - 1, 1 );
			const sunIntensity = EE.mul( max( 0.0, float( 1.0 ).sub( pow( e, cutoffAngle.sub( acos( zenithAngleCos ) ).div( steepness ).negate() ) ) ) );
			varyingProperty( 'float', 'vSunE' ).assign( sunIntensity );

			// varying sun fade

			const vSunfade = float( 1.0 ).sub( clamp( float( 1.0 ).sub( exp( this.sunPosition.y.div( 450000.0 ) ) ), 0, 1 ) );
			varyingProperty( 'float', 'vSunfade' ).assign( vSunfade );

			// varying vBetaR

			const rayleighCoefficient = this.rayleigh.sub( float( 1.0 ).mul( float( 1.0 ).sub( vSunfade ) ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			varyingProperty( 'vec3', 'vBetaR' ).assign( totalRayleigh.mul( rayleighCoefficient ) );

			// varying vBetaM

			const c = float( 0.2 ).mul( this.turbidity ).mul( 10E-18 );
			const totalMie = float( 0.434 ).mul( c ).mul( MieConst );

			varyingProperty( 'vec3', 'vBetaM' ).assign( totalMie.mul( this.mieCoefficient ) );

			// position

			const position = modelViewProjection();
			position.z.assign( position.w ); // set z to camera.far

			return position;

		} )();

		const fragmentNode = /*@__PURE__*/ Fn( () => {

			const vSunDirection = varying( vec3(), 'vSunDirection' );
			const vSunE = varying( float(), 'vSunE' );
			const vSunfade = varying( float(), 'vSunfade' );
			const vBetaR = varying( vec3(), 'vBetaR' );
			const vBetaM = varying( vec3(), 'vBetaM' );

			// constants for atmospheric scattering
			const pi = float( 3.141592653589793238462643383279502884197169 );

			// optical length at zenith for molecules
			const rayleighZenithLength = float( 8.4E3 );
			const mieZenithLength = float( 1.25E3 );
			// 66 arc seconds -> degrees, and the cosine of that
			const sunAngularDiameterCos = float( 0.999956676946448443553574619906976478926848692873900859324 );

			// 3.0 / ( 16.0 * pi )
			const THREE_OVER_SIXTEENPI = float( 0.05968310365946075 );
			// 1.0 / ( 4.0 * pi )
			const ONE_OVER_FOURPI = float( 0.07957747154594767 );

			//

			const direction = normalize( positionWorld.sub( cameraPosition ) );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			const zenithAngle = acos( max( 0.0, dot( this.upUniform, direction ) ) );
			const inverse = float( 1.0 ).div( cos( zenithAngle ).add( float( 0.15 ).mul( pow( float( 93.885 ).sub( zenithAngle.mul( 180.0 ).div( pi ) ), - 1.253 ) ) ) );
			const sR = rayleighZenithLength.mul( inverse );
			const sM = mieZenithLength.mul( inverse );

			// combined extinction factor
			const Fex = exp( mul( vBetaR, sR ).add( mul( vBetaM, sM ) ).negate() );

			// in scattering
			const cosTheta = dot( direction, vSunDirection );

			// betaRTheta

			const c = cosTheta.mul( 0.5 ).add( 0.5 );
			const rPhase = THREE_OVER_SIXTEENPI.mul( float( 1.0 ).add( pow( c, 2.0 ) ) );
			const betaRTheta = vBetaR.mul( rPhase );

			// betaMTheta

			const g2 = pow( this.mieDirectionalG, 2.0 );
			const inv = float( 1.0 ).div( pow( float( 1.0 ).sub( float( 2.0 ).mul( this.mieDirectionalG ).mul( cosTheta ) ).add( g2 ), 1.5 ) );
			const mPhase = ONE_OVER_FOURPI.mul( float( 1.0 ).sub( g2 ) ).mul( inv );
			const betaMTheta = vBetaM.mul( mPhase );

			const Lin = pow( vSunE.mul( add( betaRTheta, betaMTheta ).div( add( vBetaR, vBetaM ) ) ).mul( sub( 1.0, Fex ) ), vec3( 1.5 ) );
			Lin.mulAssign( mix( vec3( 1.0 ), pow( vSunE.mul( add( betaRTheta, betaMTheta ).div( add( vBetaR, vBetaM ) ) ).mul( Fex ), vec3( 1.0 / 2.0 ) ), clamp( pow( sub( 1.0, dot( this.upUniform, vSunDirection ) ), 5.0 ), 0.0, 1.0 ) ) );

			// nightsky

			const L0 = vec3( 0.1 ).mul( Fex );

			// composition + solar disc
			const sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos.add( 0.00002 ), cosTheta );
			L0.addAssign( vSunE.mul( 19000.0 ).mul( Fex ).mul( sundisk ) );

			const texColor = add( Lin, L0 ).mul( 0.04 ).add( vec3( 0.0, 0.0003, 0.00075 ) );

			const retColor = pow( texColor, vec3( float( 1.0 ).div( float( 1.2 ).add( vSunfade.mul( 1.2 ) ) ) ) );

			return vec4( retColor, 1.0 );

		} )();

		material.side = BackSide;
		material.depthWrite = false;

		material.vertexNode = vertexNode;
		material.fragmentNode = fragmentNode;

	}

}

export { SkyMesh };
