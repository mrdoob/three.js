import {
	BackSide,
	BoxGeometry,
	Mesh,
	Vector3,
	NodeMaterial
} from 'three/webgpu';

import { Fn, float, vec2, vec3, acos, add, mul, clamp, cos, dot, exp, max, mix, modelViewProjection, normalize, positionWorld, pow, smoothstep, sub, varyingProperty, vec4, uniform, cameraPosition, fract, floor, sin, time, Loop, If } from 'three/tsl';

/**
 * Represents a skydome for scene backgrounds. Based on [A Practical Analytic Model for Daylight](https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight)
 * aka The Preetham Model, the de facto standard for analytical skydomes.
 *
 * Note that this class can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, use {@link Sky}.
 *
 * More references:
 *
 * - {@link http://simonwallner.at/project/atmospheric-scattering/}
 * - {@link http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR}
 *
 * ```js
 * const sky = new SkyMesh();
 * sky.scale.setScalar( 10000 );
 * scene.add( sky );
 * ```
 *
 * @augments Mesh
 * @three_import import { SkyMesh } from 'three/addons/objects/SkyMesh.js';
 */
class SkyMesh extends Mesh {

	/**
	 * Constructs a new skydome.
	 */
	constructor() {

		const material = new NodeMaterial();

		super( new BoxGeometry( 1, 1, 1 ), material );

		/**
		 * The turbidity uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.turbidity = uniform( 2 );

		/**
		 * The rayleigh uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.rayleigh = uniform( 1 );

		/**
		 * The mieCoefficient uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.mieCoefficient = uniform( 0.005 );

		/**
		 * The mieDirectionalG uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.mieDirectionalG = uniform( 0.8 );

		/**
		 * The sun position uniform.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.sunPosition = uniform( new Vector3() );

		/**
		 * The up position.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.upUniform = uniform( new Vector3( 0, 1, 0 ) );

		/**
		 * The cloud scale uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudScale = uniform( 0.0002 );

		/**
		 * The cloud speed uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudSpeed = uniform( 0.0001 );

		/**
		 * The cloud coverage uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudCoverage = uniform( 0.4 );

		/**
		 * The cloud density uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudDensity = uniform( 0.4 );

		/**
		 * The cloud elevation uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudElevation = uniform( 0.5 );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 * @deprecated Use isSkyMesh instead.
		 */
		this.isSky = true; // @deprecated, r182

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSkyMesh = true;

		// Varyings

		const vSunDirection = varyingProperty( 'vec3' );
		const vSunE = varyingProperty( 'float' );
		const vBetaR = varyingProperty( 'vec3' );
		const vBetaM = varyingProperty( 'vec3' );

		const vertexNode = /*@__PURE__*/ Fn( () => {

			// constants for atmospheric scattering
			const e = float( 2.71828182845904523536028747135266249775724709369995957 );
			// const pi = float( 3.141592653589793238462643383279502884197169 );

			// wavelength of used primaries, according to preetham
			// const lambda = vec3( 680E-9, 550E-9, 450E-9 );
			// this pre-calculation replaces older TotalRayleigh(vec3 lambda) function:
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

			const sunDirection = normalize( this.sunPosition );
			vSunDirection.assign( sunDirection );

			// varying sun intensity

			const angle = dot( sunDirection, this.upUniform );
			const zenithAngleCos = clamp( angle, - 1, 1 );
			const sunIntensity = EE.mul( max( 0.0, float( 1.0 ).sub( pow( e, cutoffAngle.sub( acos( zenithAngleCos ) ).div( steepness ).negate() ) ) ) );
			vSunE.assign( sunIntensity );

			// sun fade

			const sunfade = float( 1.0 ).sub( clamp( float( 1.0 ).sub( exp( this.sunPosition.y.div( 450000.0 ) ) ), 0, 1 ) );

			// varying vBetaR

			const rayleighCoefficient = this.rayleigh.sub( float( 1.0 ).mul( float( 1.0 ).sub( sunfade ) ) );

			// extinction (absorption + out scattering)
			// rayleigh coefficients
			vBetaR.assign( totalRayleigh.mul( rayleighCoefficient ) );

			// varying vBetaM

			const c = float( 0.2 ).mul( this.turbidity ).mul( 10E-18 );
			const totalMie = float( 0.434 ).mul( c ).mul( MieConst );

			vBetaM.assign( totalMie.mul( this.mieCoefficient ) );

			// position

			const position = modelViewProjection;
			position.z.assign( position.w ); // set z to camera.far

			return position;

		} )();

		const colorNode = /*@__PURE__*/ Fn( () => {

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

			const texColor = add( Lin, L0 ).mul( 0.04 ).add( vec3( 0.0, 0.0003, 0.00075 ) ).toVar();

			// Cloud noise functions
			const hash = Fn( ( [ p ] ) => {

				return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ).mul( 43758.5453123 ) );

			} );

			const noise = Fn( ( [ p_immutable ] ) => {

				const p = vec2( p_immutable ).toVar();
				const i = floor( p );
				const f = fract( p );
				const ff = f.mul( f ).mul( sub( 3.0, f.mul( 2.0 ) ) );

				const a = hash( i );
				const b = hash( add( i, vec2( 1.0, 0.0 ) ) );
				const c = hash( add( i, vec2( 0.0, 1.0 ) ) );
				const d = hash( add( i, vec2( 1.0, 1.0 ) ) );

				return mix( mix( a, b, ff.x ), mix( c, d, ff.x ), ff.y );

			} );

			const fbm = Fn( ( [ p_immutable ] ) => {

				const p = vec2( p_immutable ).toVar();
				const value = float( 0.0 ).toVar();
				const amplitude = float( 0.5 ).toVar();

				Loop( 5, () => {

					value.addAssign( amplitude.mul( noise( p ) ) );
					p.mulAssign( 2.0 );
					amplitude.mulAssign( 0.5 );

				} );

				return value;

			} );

			// Clouds
			If( direction.y.greaterThan( 0.0 ).and( this.cloudCoverage.greaterThan( 0.0 ) ), () => {

				// Project to cloud plane (higher elevation = clouds appear lower/closer)
				const elevation = mix( 1.0, 0.1, this.cloudElevation );
				const cloudUV = direction.xz.div( direction.y.mul( elevation ) ).toVar();
				cloudUV.mulAssign( this.cloudScale );
				cloudUV.addAssign( time.mul( this.cloudSpeed ) );

				// Multi-octave noise for fluffy clouds
				const cloudNoise = fbm( cloudUV.mul( 1000.0 ) ).add( fbm( cloudUV.mul( 2000.0 ).add( 3.7 ) ).mul( 0.5 ) ).toVar();
				cloudNoise.assign( cloudNoise.mul( 0.5 ).add( 0.5 ) );

				// Apply coverage threshold
				const cloudMask = smoothstep( sub( 1.0, this.cloudCoverage ), sub( 1.0, this.cloudCoverage ).add( 0.3 ), cloudNoise ).toVar();

				// Fade clouds near horizon (adjusted by elevation)
				const horizonFade = smoothstep( 0.0, add( 0.1, mul( 0.2, this.cloudElevation ) ), direction.y );
				cloudMask.mulAssign( horizonFade );

				// Cloud lighting based on sun position
				const sunInfluence = dot( direction, vSunDirection ).mul( 0.5 ).add( 0.5 );
				const daylight = max( 0.0, vSunDirection.y.mul( 2.0 ) );

				// Base cloud color affected by atmosphere
				const atmosphereColor = Lin.mul( 0.04 );
				const cloudColor = mix( vec3( 0.3 ), vec3( 1.0 ), daylight ).toVar();
				cloudColor.assign( mix( cloudColor, atmosphereColor.add( vec3( 1.0 ) ), sunInfluence.mul( 0.5 ) ) );
				cloudColor.mulAssign( vSunE.mul( 0.00002 ) );

				// Blend clouds with sky
				texColor.assign( mix( texColor, cloudColor, cloudMask.mul( this.cloudDensity ) ) );

			} );

			return vec4( texColor, 1.0 );

		} )();

		material.side = BackSide;
		material.depthWrite = false;

		material.vertexNode = vertexNode;
		material.colorNode = colorNode;

	}

}

export { SkyMesh };
