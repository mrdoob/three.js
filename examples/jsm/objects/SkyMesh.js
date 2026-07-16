import {
	BackSide,
	BoxGeometry,
	Mesh,
	Vector3,
	NodeMaterial
} from 'three/webgpu';

import { Fn, float, floor, fract, vec2, vec3, acos, add, mul, clamp, cos, dot, exp, max, min, mix, modelViewProjection, normalize, positionWorld, pow, smoothstep, sub, varyingProperty, vec4, uniform, cameraPosition, time, If, Loop } from 'three/tsl';

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
 * It can be useful to hide the sun disc when generating an environment map to avoid artifacts
 *
 * ```js
 * // disable before rendering environment map
 * sky.showSunDisc.value = false;
 * // ...
 * // re-enable before scene sky box rendering
 * sky.showSunDisc.value = true;
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
		 * Whether to render the solar disc.
		 *
		 * @type {UniformNode<float>}
		 */
		this.showSunDisc = uniform( 1 );

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
			const e = float( 2.718281828459045 );
			// const pi = float( 3.141592653589793 );

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
			const pi = float( 3.141592653589793 );

			// optical length at zenith for molecules
			const rayleighZenithLength = float( 8.4E3 );
			const mieZenithLength = float( 1.25E3 );
			// 66 arc seconds -> degrees, and the cosine of that
			const sunAngularDiameterCos = float( 0.9999566769464484 );

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
			const sundisc = clamp( cosTheta.sub( sunAngularDiameterCos ).mul( 50000.0 ), 0.0, 1.0 ).mul( this.showSunDisc );
			const sundiscColor = min( vSunE.mul( Fex ), 80.0 ).mul( 760.0 ).mul( sundisc ); // 760 = 19000 * 0.04, capped below the half-float range

			const texColor = add( Lin, L0 ).mul( 0.04 ).add( sundiscColor ).add( vec3( 0.0, 0.0003, 0.00075 ) ).toVar();

			// gradient at a lattice corner; sinless hash so every GPU produces the same clouds
			const gradient = Fn( ( [ i ] ) => {

				const p = fract( i.xyx.mul( vec3( 0.1031, 0.1030, 0.0973 ) ) ).toVar();
				p.addAssign( dot( p, p.yzx.add( 33.33 ) ) );

				return fract( p.xx.add( p.yz ).mul( p.zy ) ).mul( 2.0 ).sub( 1.0 );

			} );

			// 2D gradient noise: isotropic lobes like Perlin at value-noise cost
			const noise = Fn( ( [ p ] ) => {

				const i = floor( p );
				const f = fract( p );
				const u = f.mul( f ).mul( f ).mul( f.mul( f.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) ); // quintic fade

				const a = dot( gradient( i ), f );
				const b = dot( gradient( i.add( vec2( 1.0, 0.0 ) ) ), f.sub( vec2( 1.0, 0.0 ) ) );
				const c = dot( gradient( i.add( vec2( 0.0, 1.0 ) ) ), f.sub( vec2( 0.0, 1.0 ) ) );
				const d = dot( gradient( i.add( vec2( 1.0, 1.0 ) ) ), f.sub( vec2( 1.0, 1.0 ) ) );

				return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ).mul( 1.6 ); // ~[-1,1]

			} );

			// fbm; per-octave drift makes clouds billow instead of scrolling as a rigid stamp
			const fbm = Fn( ( [ position, drift ] ) => {

				const p = vec2( position ).toVar();
				const result = float( 0.0 ).toVar();
				const amplitude = float( 1.0 ).toVar();

				Loop( 4, () => {

					result.addAssign( amplitude.mul( noise( p ) ) );
					amplitude.mulAssign( 0.5 );
					p.mulAssign( 2.0 ).addAssign( drift );

				} );

				return result;

			} );

			// Clouds
			If( direction.y.greaterThan( 0.0 ).and( this.cloudCoverage.greaterThan( 0.0 ) ), () => {

				// Project to cloud plane (higher elevation = clouds appear lower/closer)
				const elevation = mix( 1.0, 0.1, this.cloudElevation );
				const cloudUV = direction.xz.div( direction.y.mul( elevation ) ).toVar();
				cloudUV.mulAssign( this.cloudScale );
				cloudUV.addAssign( time.mul( this.cloudSpeed ) );

				// Cloud density field
				const evolve = time.mul( this.cloudSpeed ).mul( 300.0 );
				const cloudNoise = fbm( cloudUV.mul( 1000.0 ), evolve ).mul( 0.7 ).add( 0.5 ).clamp( 0.0, 1.0 ).toVar();

				// Large-scale coverage variation: clear gaps next to dense banks
				const region = noise( cloudUV.mul( 300.0 ) ).mul( 0.37 ).add( 0.5 );
				const cov = clamp( this.cloudCoverage.add( region.sub( 0.5 ).mul( 0.6 ) ), 0.0, 1.0 );

				// Carve clouds where noise rises above the coverage level
				const threshold = sub( 1.0, cov ).toVar();
				const cloudMask = smoothstep( threshold, threshold.add( 0.3 ), cloudNoise ).toVar();

				// Fade clouds near horizon (adjusted by elevation)
				const horizonFade = smoothstep( 0.0, add( 0.03, mul( 0.06, this.cloudElevation ) ), direction.y );
				cloudMask.mulAssign( horizonFade );

				// Cloud lighting from the sky's own radiance
				const dayFactor = smoothstep( - 0.08, 0.3, vSunDirection.y );
				const sunColor = vSunE.mul( Fex ).mul( 0.22 ).mul( 0.04 ).toVar(); // 0.22 ~ albedo/pi, 0.04 = exposure; the aerial composite adds the eye-leg extinction
				const skyAmbient = Lin.mul( 0.04 ).add( vec3( 0.0, 0.0003, 0.00075 ) );

				// Beer-powder self-shadow from the sampled density
				const depth = max( 0.0, cloudNoise.sub( threshold ) ).toVar();
				const beer = exp( depth.mul( - 4.0 ) ).toVar();
				const powder = sub( 1.0, beer.mul( beer ) ); // beer*beer == exp(-8*depth)
				const shade = mix( 0.45, 1.0, beer.mul( powder ).mul( 2.6 ).clamp( 0.0, 1.0 ) ); // 2.6 = 1/0.385, normalizes beer*powder peak to 1

				// Henyey-Greenstein forward lobe ( g = 0.7 ): silver lining on rims toward the sun
				const silver = float( 0.51 ).div( pow( sub( 1.49, cosTheta.mul( 1.4 ) ), 1.5 ) ).clamp( 0.0, 3.0 ); // 0.51=1-g^2, 1.49=1+g^2, 1.4=2g
				const edge = cloudMask.mul( sub( 1.0, cloudMask ) ).mul( 4.0 );

				const cloudColor = skyAmbient.add( sunColor.mul( shade ) ).toVar();
				cloudColor.addAssign( sunColor.mul( silver ).mul( edge ).mul( 0.6 ) );
				cloudColor.mulAssign( dayFactor.max( 0.03 ) );

				// Cloud opacity via Beer's law: density sets how solid the clouds get
				const alpha = sub( 1.0, exp( depth.mul( this.cloudDensity ).mul( - 12.0 ) ) ).mul( horizonFade ).toVar();

				// Occlude the sun disc/glow behind opaque cloud
				texColor.subAssign( L0.mul( 0.04 ).add( sundiscColor ).mul( alpha ) );

				// Composite through the atmosphere so distant clouds dissolve into haze
				const cloudAerial = mix( texColor, cloudColor, Fex );
				texColor.assign( mix( texColor, cloudAerial, alpha ) );

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
