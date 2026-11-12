import {
	BackSide,
	BoxGeometry,
	LinearFilter,
	LinearMipmapLinearFilter,
	Mesh,
	RedFormat,
	RepeatWrapping,
	Vector3,
	Vector4,
	NodeMaterial
} from 'three/webgpu';

import { Fn, float, floor, fract, vec2, vec3, abs, acos, add, mul, clamp, dot, exp, inverseSqrt, max, min, mix, modelViewProjection, normalize, positionWorld, smoothstep, sqrt, sub, varyingProperty, vec4, uniform, cameraPosition, time, If, Loop, rtt, uv, log2 } from 'three/tsl';

// The cloud noise is baked into a texture of NOISE_SIZE texels that tiles over NOISE_CELLS noise cells.
const NOISE_SIZE = 512;
const NOISE_CELLS = 32;
const OCTAVE_LEVEL = 1.0566; // log2( 2.08 ), the mipmap step between noise octaves

const _viewport = /*@__PURE__*/ new Vector4();

// gradient at a lattice corner, wrapped so the texture tiles; sinless hash so every GPU produces the same clouds
const gradient = /*@__PURE__*/ Fn( ( [ i ] ) => {

	const p = fract( i.mod( NOISE_CELLS ).xyx.mul( vec3( 0.1031, 0.1030, 0.0973 ) ) ).toVar();
	p.addAssign( dot( p, p.yzx.add( 33.33 ) ) );

	return fract( p.xx.add( p.yz ).mul( p.zy ) ).mul( 2.0 ).sub( 1.0 );

}, { i: 'vec2', return: 'vec2' } );

// 2D gradient noise: isotropic lobes like Perlin at value-noise cost
const noise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p );
	const u = f.mul( f ).mul( f ).mul( f.mul( f.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) ); // quintic fade

	const a = dot( gradient( i ), f );
	const b = dot( gradient( i.add( vec2( 1.0, 0.0 ) ) ), f.sub( vec2( 1.0, 0.0 ) ) );
	const c = dot( gradient( i.add( vec2( 0.0, 1.0 ) ) ), f.sub( vec2( 0.0, 1.0 ) ) );
	const d = dot( gradient( i.add( vec2( 1.0, 1.0 ) ) ), f.sub( vec2( 1.0, 1.0 ) ) );

	return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ).mul( 1.6 ); // ~[-1,1]

}, { p: 'vec2', return: 'float' } );

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
		 * The atmospheric turbidity which controls the amount of haze.
		 * Higher values produce a hazier sky.
		 *
		 * @type {UniformNode<float>}
		 */
		this.turbidity = uniform( 2 );

		/**
		 * The strength of Rayleigh scattering by air molecules
		 * which is responsible for the blue color of the sky.
		 * Higher values produce a brighter sky.
		 *
		 * @type {UniformNode<float>}
		 */
		this.rayleigh = uniform( 1 );

		/**
		 * The strength of Mie scattering by aerosol particles
		 * which controls the intensity of the glow around the sun.
		 * Higher values produce a brighter glow.
		 *
		 * @type {UniformNode<float>}
		 */
		this.mieCoefficient = uniform( 0.005 );

		/**
		 * The directionality of Mie scattering which controls
		 * the size of the glow around the sun. Values closer to `1`
		 * produce a smaller and more concentrated halo.
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
		this.cloudSpeed = uniform( 0.00002 );

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
		const vSunE = varyingProperty( 'vec3' );
		const vSunFex = varyingProperty( 'vec3' );
		const vBetaR = varyingProperty( 'vec3' );
		const vBetaM = varyingProperty( 'vec3' );

		const vertexNode = /*@__PURE__*/ Fn( ( builder ) => {

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

			const angle = sunDirection.y;
			const zenithAngleCos = clamp( angle, - 1, 1 );
			const sunIntensity = EE.mul( max( 0.0, float( 1.0 ).sub( exp( cutoffAngle.sub( acos( zenithAngleCos ) ).div( steepness ).negate() ) ) ) );

			// stratospheric ozone (Chappuis band) absorption along incoming sun path
			const sunCos = max( 0.0, angle );
			const sunOzoneAirMass = float( 1.0 ).div( sqrt( sunCos.mul( sunCos ).add( 0.004 ) ) );
			vSunE.assign( exp( vec3( 0.005, 0.016, 0.0007 ).mul( sunOzoneAirMass ).negate() ).mul( sunIntensity ) );

			// sun fade

			const sunfade = float( 1.0 ).sub( clamp( float( 1.0 ).sub( exp( sunDirection.y ) ), 0, 1 ) );

			// varying vBetaR

			const rayleighCoefficient = max( 0.0, this.rayleigh.sub( float( 1.0 ).sub( sunfade ) ) );
			const betaR = totalRayleigh.mul( rayleighCoefficient );

			// extinction (absorption + out scattering)
			// rayleigh coefficients
			vBetaR.assign( betaR );

			// varying vBetaM

			const c = float( 0.2 ).mul( this.turbidity ).mul( 10E-18 );
			const totalMie = float( 0.434 ).mul( c ).mul( MieConst );
			const betaM = totalMie.mul( this.mieCoefficient );

			vBetaM.assign( betaM );

			// sun-path transmittance through lower troposphere to cloud altitude (~2km)

			const sunCloudCos = max( 0.0, angle.add( 0.03 ) );
			const sunCloudAirMass = float( 2.0 ).div( sunCloudCos.add( sqrt( sunCloudCos.mul( sunCloudCos ).add( 0.012 ) ) ) );
			vSunFex.assign( exp( betaR.mul( 4600.0 ).add( betaM.mul( 190.0 ) ).mul( sunCloudAirMass ).negate() ) );

			// position

			const position = modelViewProjection;
			position.z.assign( builder.renderer.reversedDepthBuffer === true ? 0 : position.w ); // set z to camera.far

			return position;

		} )();

		// The clouds read their gradient noise from a tiling, mipmapped texture. It is
		// rendered once on the GPU, the first time the sky is drawn.

		const noiseTexture = rtt( noise( uv().mul( NOISE_CELLS ) ), NOISE_SIZE, NOISE_SIZE, {
			format: RedFormat,
			depthBuffer: false,
			generateMipmaps: true,
			minFilter: LinearMipmapLinearFilter,
			magFilter: LinearFilter,
			wrapS: RepeatWrapping,
			wrapT: RepeatWrapping,
			autoUpdate: false
		} );

		/**
		 * The node holding the baked cloud noise.
		 *
		 * @private
		 * @type {RTTNode}
		 */
		this._noiseTexture = noiseTexture;

		// the angle covered by one pixel at the centre of the view, and the view direction,
		// to pick the mipmap level of the cloud noise

		const pixelAngle = uniform( 0.001 ).onRenderUpdate( ( { renderer, camera } ) => {

			const renderTarget = renderer.getRenderTarget();
			const height = renderTarget !== null ? renderTarget.viewport.w : renderer.getViewport( _viewport ).w * renderer.getPixelRatio();

			return 2 / ( camera.projectionMatrix.elements[ 5 ] * height );

		} );

		const viewDirection = new Vector3( 0, 0, - 1 );
		const cameraDirection = uniform( viewDirection ).onRenderUpdate( ( { camera } ) => viewDirection.setFromMatrixColumn( camera.matrixWorld, 2 ).negate() );

		const colorNode = /*@__PURE__*/ Fn( () => {

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

			// optical length (rational Kasten-Young air mass fit, <0.06% error on [0, 1])
			const cosZenith = max( 0.0, direction.y );
			const inverse = float( 1.0 ).div( cosZenith.add( float( 0.02739 ).div( cosZenith.mul( cosZenith.mul( 26.0 ).add( 18.6 ) ).add( 1.0 ) ) ) );
			const sR = rayleighZenithLength.mul( inverse );
			const sM = mieZenithLength.mul( inverse );

			// combined extinction factor
			const Fex = exp( mul( vBetaR, sR ).add( mul( vBetaM, sM ) ).negate() );

			// in scattering
			const cosTheta = dot( direction, vSunDirection );
			const horizonMask = smoothstep( - 0.15, 0.0, direction.y );

			// betaRTheta

			const c = cosTheta.mul( horizonMask ).mul( 0.5 ).add( 0.5 );
			const rPhase = THREE_OVER_SIXTEENPI.mul( float( 1.0 ).add( c.mul( c ) ) );
			const betaRTheta = vBetaR.mul( rPhase );

			// betaMTheta

			const g2 = this.mieDirectionalG.mul( this.mieDirectionalG );
			const invSqrt = inverseSqrt( max( 1e-4, float( 1.0 ).sub( float( 2.0 ).mul( this.mieDirectionalG ).mul( cosTheta ) ).add( g2 ) ) );
			const mPhase = ONE_OVER_FOURPI.mul( float( 1.0 ).sub( g2 ) ).mul( invSqrt.mul( invSqrt ).mul( invSqrt ) ).mul( smoothstep( - 0.06, 0.0, direction.y ) );
			const betaMTheta = vBetaM.mul( mPhase );

			const betaScatOverExt = add( betaRTheta, betaMTheta ).div( add( vBetaR, vBetaM ) );
			const LinBase = max( vec3( 0.0 ), vSunE.mul( betaScatOverExt ).mul( sub( 1.0, Fex ) ) );
			const Lin = LinBase.mul( sqrt( LinBase ) ).toVar();
			const sunHorizon = clamp( sub( 1.0, vSunDirection.y ), 0.0, 1.0 );
			const sunHorizon2 = sunHorizon.mul( sunHorizon );
			Lin.mulAssign( mix( vec3( 1.0 ), sqrt( max( vec3( 0.0 ), vSunE.mul( betaScatOverExt ).mul( Fex ) ) ), sunHorizon2.mul( sunHorizon2 ).mul( sunHorizon ) ) );

			// nightsky

			const L0 = vec3( 0.1 ).mul( Fex );

			// composition + solar disc with photospheric limb darkening: a linear law per channel
			// ( u ~ 0.54, 0.62, 0.73 ), normalized so the disc keeps its average color
			const mu2 = clamp( cosTheta.sub( sunAngularDiameterCos ).mul( 23082.0 ), 0.0, 1.0 );
			const mu = sqrt( mu2 );
			const sundisc = smoothstep( 0.0, 0.1, mu2 ).mul( vec3( 0.561, 0.479, 0.3568 ).add( vec3( 0.6585, 0.7815, 0.9648 ).mul( mu ) ) ).mul( this.showSunDisc ).mul( smoothstep( - 0.002, 0.002, direction.y ) );
			const sundiscColor = min( vSunE.mul( Fex ), 80.0 ).mul( 760.0 ).mul( sundisc );

			const skyInscatter = Lin.mul( 0.04 ).add( vec3( 0.0, 0.0003, 0.00075 ) ).toVar();
			const texColor = skyInscatter.add( L0.mul( 0.04 ) ).add( sundiscColor ).toVar();

			// gradient noise baked into a tiling texture; level picks the mipmap that fits the pixel footprint
			const sampleNoise = ( p, level ) => noiseTexture.sample( p.div( NOISE_CELLS ) ).level( level ).r;

			// Fast scalar value noise for low-frequency macro weather modulation
			const hash = Fn( ( [ i ] ) => {

				const p = fract( vec3( i.xyx ).mul( 0.1031 ) ).toVar();
				p.addAssign( dot( p, p.yzx.add( 33.33 ) ) );

				return fract( p.x.add( p.y ).mul( p.z ) );

			}, { i: 'vec2', return: 'float' } );

			const vnoise = Fn( ( [ p ] ) => {

				const i = floor( p );
				const f = fract( p );
				const u = f.mul( f ).mul( sub( 3.0, f.mul( 2.0 ) ) );

				const a = hash( i );
				const b = hash( i.add( vec2( 1.0, 0.0 ) ) );
				const c = hash( i.add( vec2( 0.0, 1.0 ) ) );
				const d = hash( i.add( vec2( 1.0, 1.0 ) ) );

				return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ).mul( 2.0 ).sub( 1.0 );

			}, { p: 'vec2', return: 'float' } );

			// Advance one rotated FBM octave (3-4-5 Pythagorean rotation avoids grid alignment)
			const nextOctave = ( p, drift ) => vec2( p.x.mul( 0.8 ).add( p.y.mul( 0.6 ) ), p.y.mul( 0.8 ).sub( p.x.mul( 0.6 ) ) ).mul( 2.08 ).add( drift );

			// 2-octave turret field for directional sun self-shadowing
			const cloudShadow = ( uv, drift, level ) => {

				const p = uv.mul( 600.0 ).toVar();
				const base = sampleNoise( p, level ).mul( 0.58 ).toVar();
				p.assign( nextOctave( p, drift ) );
				base.addAssign( sampleNoise( p, level.add( OCTAVE_LEVEL ) ).mul( 0.32 ) );

				return base.mul( 0.72 ).add( 0.5 );

			};

			// Volumetric Cloud Slab
			If( direction.y.greaterThan( 0.0 ).and( this.cloudCoverage.greaterThan( 0.0 ) ), () => {

				// Intersect view ray with base and top of a curved planetary cloud slab
				const elevation = mix( 1.0, 0.1, this.cloudElevation );
				const slabThickness = mix( 0.45, 1.0, smoothstep( 0.02, 0.20, direction.y ) ).mul( 0.26 );
				const shellBase = float( 2.0 ).div( sqrt( direction.y.mul( direction.y ).add( 0.015 ) ).add( direction.y ) );
				const topScale = add( 1.0, slabThickness );
				const shellTop = topScale.mul( 2.0 ).div( sqrt( direction.y.mul( direction.y ).add( mul( 0.015, topScale ) ) ).add( direction.y ) );

				const driftUV = vec2( time.mul( this.cloudSpeed ) );
				const uvBase = direction.xz.mul( shellBase.div( elevation ) ).mul( this.cloudScale ).add( driftUV );
				const uvTop = direction.xz.mul( shellTop.div( elevation ) ).mul( this.cloudScale ).add( driftUV ).add( vec2( 0.75, 0.3 ).mul( this.cloudScale ) );

				// mipmap level of the cloud noise, from the footprint of one pixel on the cloud layer:
				// the larger of the tangential and radial rates at which the shell coordinates change with view angle
				const shell = sqrt( direction.y.mul( direction.y ).add( 0.015 ) );
				const tangentialRate = shellBase.mul( 0.5 );
				const radialRate = direction.y.mul( tangentialRate ).add( sub( 1.0, direction.y.mul( direction.y ) ).mul( tangentialRate ).mul( tangentialRate ).mul( direction.y.div( shell ).add( 1.0 ) ) );
				const footprint = pixelAngle.mul( max( dot( direction, cameraDirection ), 0.05 ) ).mul( max( tangentialRate, radialRate ) );
				const noiseLevel = log2( footprint.mul( this.cloudScale ).mul( 1200.0 * NOISE_SIZE / NOISE_CELLS ).div( elevation ).add( 1e-8 ) ).toVar();

				const evolve = time.mul( this.cloudSpeed ).mul( 200.0 );
				const covEnv = this.cloudCoverage.mul( sub( 1.0, this.cloudCoverage ) );
				const minThreshold = sub( 1.0, min( 1.0, this.cloudCoverage.add( covEnv.mul( 0.75 ) ) ) );

				// Evaluate 2-octave macro field at slab base first to reject clear sky in 2 noise calls
				const pBase = uvBase.mul( 600.0 ).toVar();
				const macroBase = sampleNoise( pBase, noiseLevel ).mul( 0.55 ).toVar();
				pBase.assign( nextOctave( pBase, evolve ) );
				macroBase.assign( macroBase.add( sampleNoise( pBase, noiseLevel.add( OCTAVE_LEVEL ) ).mul( 0.275 ) ).mul( 0.72 ).add( 0.5 ) );

				If( macroBase.add( 0.34 ).greaterThan( minThreshold ), () => {

					// Subtle large-scale weather modulation for natural cloud banks and storm breaks
					const localCov = float( this.cloudCoverage ).toVar();
					If( covEnv.greaterThan( 0.005 ), () => {

						const weather = vnoise( add( uvBase, uvTop ).mul( 75.0 ).add( vec2( 2.1, 1.3 ) ) );
						localCov.assign( clamp( this.cloudCoverage.add( weather.mul( covEnv ).mul( 0.65 ) ), 0.0, 1.0 ) );

					} );
					const threshold = sub( 1.0, localCov );

					If( localCov.greaterThan( 0.005 ).and( macroBase.add( 0.34 ).greaterThan( threshold ) ), () => {

						const pTop = uvTop.mul( 600.0 ).toVar();
						const macroTop = sampleNoise( pTop, noiseLevel ).mul( 0.55 ).toVar();
						pTop.assign( nextOctave( pTop, evolve ) );
						macroTop.assign( macroTop.add( sampleNoise( pTop, noiseLevel.add( OCTAVE_LEVEL ) ).mul( 0.275 ) ).mul( 0.72 ).add( 0.5 ) );

						If( max( macroBase, macroTop ).add( 0.24 ).greaterThan( threshold ), () => {

							// Estimate smooth front-surface hit height to sample turret & billow detail once in 3D
							const baseHit = smoothstep( threshold.sub( 0.12 ), threshold.add( 0.18 ), macroBase );
							const slopeDiff = macroTop.sub( macroBase );
							const hPeak = clamp( add( 0.5, slopeDiff.mul( 0.45 ).div( abs( slopeDiff ).add( 0.12 ) ) ), 0.15, 0.82 );
							const hProbe = mix( hPeak, 0.18, baseHit.mul( 0.80 ) );

							const pHit = nextOctave( mix( pBase, pTop, hProbe ), evolve ).toVar();
							const n3 = sampleNoise( pHit, noiseLevel.add( 2 * OCTAVE_LEVEL ) ).toVar();
							pHit.assign( nextOctave( pHit, evolve ) );
							const n4 = sampleNoise( pHit, noiseLevel.add( 3 * OCTAVE_LEVEL ) ).toVar();

							// Feathery fractal wisps at fringes, transitioning to cauliflower billows on cumulus bodies
							const detailFade = smoothstep( 0.025, 0.24, direction.y ).toVar();
							const micro = float( 0.0 ).toVar();
							const midMax = max( macroBase, macroTop ).add( n3.mul( 0.12 ) ).add( n4.mul( 0.06 ).mul( detailFade ) ).toVar();

							If( detailFade.greaterThan( 0.01 ).and( midMax.add( 0.10 ).greaterThan( threshold ) ), () => {

								pHit.assign( nextOctave( pHit, evolve ) );
								const n5 = sampleNoise( pHit, noiseLevel.add( 4 * OCTAVE_LEVEL ) ).toVar();
								const ep = vec2( pHit.x.mul( 0.8 ).add( pHit.y.mul( 0.6 ) ), pHit.y.mul( 0.8 ).sub( pHit.x.mul( 0.6 ) ) ).mul( 2.15 ).sub( evolve.mul( 0.7 ) );
								const n6 = sampleNoise( ep, noiseLevel.add( 4 * OCTAVE_LEVEL + 1.1043 ) ).toVar(); // ep is scaled by 2.15, log2( 2.15 ) = 1.1043

								const wispy = n5.mul( 0.65 ).add( n6.mul( 0.35 ) );
								const billow = abs( n5 ).mul( 0.66 ).add( abs( n6 ).mul( 0.34 ) ).sub( 0.46 ).mul( 1.45 );
								const bodyMask = smoothstep( threshold.sub( 0.01 ), threshold.add( 0.15 ), midMax );
								micro.assign( mix( wispy.mul( 0.09 ), billow.mul( 0.16 ), bodyMask ) );

							} );

							const sculpt = n3.mul( 0.12 ).add( n4.mul( 0.06 ).add( micro ).mul( detailFade ) ).toVar();
							const fieldBase = clamp( macroBase.add( sculpt.mul( mix( 0.90, 0.60, clamp( macroBase, 0.0, 1.0 ) ) ) ), 0.0, 1.0 ).toVar();
							const fieldTop = clamp( macroTop.add( sculpt.mul( mix( 1.20, 0.80, clamp( macroTop, 0.0, 1.0 ) ) ) ), 0.0, 1.0 ).toVar();

							If( max( fieldBase, fieldTop ).greaterThan( threshold ), () => {

								const depthNorm = max( 0.18, sub( 0.88, threshold.mul( 0.88 ) ) );
								const pathStretch = float( 1.0 ).div( max( direction.y, 0.28 ) );
								const stepSigma = this.cloudDensity.mul( 22.0 / 4.0 ).mul( mix( 1.0, pathStretch, 0.55 ) );

								const vis = float( 1.0 ).toVar();
								const densitySum = float( 0.0 ).toVar();
								const accumH = float( 0.0 ).toVar();
								const accumTower = float( 0.0 ).toVar();
								const accumField = float( 0.0 ).toVar();

								// Branchless 4-step slab integration (zero noise, sqrt, or exp inside loop)
								Loop( 4, ( { i } ) => {

									const h = float( i ).add( 0.5 ).mul( 0.25 ).toVar();
									const colNoise = mix( fieldBase, fieldTop, h ).toVar();
									const colClamped = clamp( colNoise.sub( threshold ).div( depthNorm ), 0.0, 1.0 ).toVar();
									const towerHeight = colClamped.mul( 2.25 ).div( add( 1.0, colClamped.mul( 1.25 ) ) ).toVar();

									const baseShape = smoothstep( 0.0, 0.13, h );
									const crownCap = smoothstep( 0.0, 0.32, towerHeight.sub( h ).add( 0.07 ) );
									const localDensity = colClamped.mul( add( 0.45, baseShape.mul( 0.75 ) ) ).mul( crownCap ).toVar();

									const x = localDensity.mul( stepSigma ).toVar();
									const stepTrans = float( 1.0 ).div( add( 1.0, x.add( x.mul( x ).mul( 0.5 ) ) ) ).toVar();
									const w = vis.mul( sub( 1.0, stepTrans ) ).toVar();
									accumH.addAssign( w.mul( h ) );
									accumTower.addAssign( w.mul( towerHeight ) );
									accumField.addAssign( w.mul( colNoise ) );
									vis.mulAssign( stepTrans );
									densitySum.addAssign( localDensity );

								} );

								const horizonFade = smoothstep( 0.0, add( 0.015, mul( 0.03, this.cloudElevation ) ), direction.y );
								const alpha = sub( 1.0, exp( densitySum.mul( stepSigma ).negate() ) ).mul( horizonFade );

								If( alpha.greaterThan( 0.001 ), () => {

									const invW = float( 1.0 ).div( max( sub( 1.0, vis ), 1e-4 ) );
									const hEff = accumH.mul( invW );
									const towerEff = accumTower.mul( invW );
									const fieldEff = accumField.mul( invW );

									// Project from 3D scattering point toward the sun for turret & belly self-shadowing
									const uvHit = mix( uvBase, uvTop, hEff );
									const sunDist = mix( 0.95, 0.50, max( 0.0, vSunDirection.y ) ).mul( sub( 1.15, hEff.mul( 0.50 ) ) );
									const sunStep = vSunDirection.xz.mul( sunDist.div( elevation ).mul( this.cloudScale ) );
									const sunRaw = cloudShadow( uvHit.add( sunStep ), evolve, noiseLevel ).toVar();
									const sunColDepth = clamp( sunRaw.sub( threshold ).div( depthNorm ), 0.0, 1.0 ).toVar();
									const sunTower = sunColDepth.mul( 2.25 ).div( add( 1.0, sunColDepth.mul( 1.25 ) ) );

									const sunRise = max( 0.0, vSunDirection.y ).mul( 0.26 );
									const shadow3D = max( 0.0, sunTower.sub( hEff.add( sunRise ) ) );
									const slopeShadow = max( 0.0, sunRaw.sub( fieldEff ) );
									const overheadDepth = max( 0.0, towerEff.sub( hEff ) );
									const densityExt = this.cloudDensity.mul( add( 0.70, this.cloudDensity.mul( 1.30 ) ) );
									const tau = densityExt.mul( shadow3D.mul( 3.8 ).add( slopeShadow.mul( 6.0 ) ).add( overheadDepth.mul( mix( 0.8, 3.0, max( 0.0, vSunDirection.y ) ) ) ).add( sunColDepth.mul( 0.8 ) ) );

									// Dual-lobe Henyey-Greenstein phase + Beer-powder multiple scattering
									const fwdInv = inverseSqrt( sub( 1.5184, cosTheta.mul( 1.44 ) ) );
									const hgFwd = min( fwdInv.mul( fwdInv ).mul( fwdInv ).mul( 0.4816 ), 4.5 );
									const backInv = inverseSqrt( add( 1.0625, cosTheta.mul( 0.5 ) ) );
									const hgBack = backInv.mul( backInv ).mul( backInv ).mul( 0.9375 );
									const phase = mix( hgBack, hgFwd, 0.6 );

									const optDepth = densitySum.mul( stepSigma );
									const powder = mix( sub( 1.0, exp( optDepth.mul( - 1.3 ) ).mul( 0.36 ) ), 1.0, max( 0.0, cosTheta ) );
									// direct sunlight fades exponentially with depth; multiply scattered sunlight
									// fades with the slower two-stream law, which keeps thick clouds gray
									const scatter = exp( tau.negate() ).mul( phase ).mul( powder )
										.add( float( 0.48 ).div( tau.mul( 0.32 ).add( 1.0 ) ).mul( mix( 1.0, min( phase, 1.3 ), 0.28 ) ) );

									// Attenuate overhead sky ambient through column above hEff to shade flat cloud bases
									const dayFactor = max( smoothstep( - 0.1, 0.02, vSunDirection.y ), 0.03 );
									const sunColor = vSunE.mul( vSunFex ).mul( mix( 0.011, 0.028, smoothstep( 0.0, 0.5, vSunDirection.y ) ) );
									const ambientScat = vBetaR.mul( THREE_OVER_SIXTEENPI.mul( 1.5 ) ).add( vBetaM.mul( ONE_OVER_FOURPI ) ).div( add( vBetaR, vBetaM ) );
									const ambientBase = max( vec3( 0.0 ), vSunE.mul( ambientScat ).mul( sub( 1.0, Fex ) ) );
									const skyAmbientTop = ambientBase.mul( sqrt( ambientBase ) ).mul( 0.04 ).add( vec3( 0.0, 0.0003, 0.00075 ) );

									const baseAlbedo = mix( 0.42, 0.20, this.cloudDensity );
									const skyAccess = exp( overheadDepth.mul( add( 0.65, this.cloudDensity.mul( 1.65 ) ) ).negate() );
									const heightBounce = add( baseAlbedo, sub( 1.08, baseAlbedo ).mul( skyAccess ).mul( mix( 0.72, 1.0, hEff ) ) );
									const cloudColor = skyAmbientTop.mul( heightBounce ).add( sunColor.mul( scatter ) ).mul( dayFactor );

									// Composite through sub-cloud airlight while occluding solar disc and nightsky behind clouds
									const airFraction = mix( 0.35, 0.08, this.cloudElevation );
									const cloudOpticalDepth = dot( mul( vBetaR, sR ).mul( airFraction ).add( mul( vBetaM, sM ).mul( min( 1.0, airFraction.mul( 2.5 ) ) ) ), vec3( 0.2126, 0.7152, 0.0722 ) );
									const cloudTransmittance = exp( cloudOpticalDepth.negate() );
									const aerialCloud = mix( skyInscatter, cloudColor, cloudTransmittance );
									texColor.assign( mix( texColor, aerialCloud, alpha ) );

								} );

							} );

						} );

					} );

				} );

			} );

			return vec4( texColor, 1.0 );

		} )();

		material.side = BackSide;
		material.depthWrite = false;
		material.fog = false;

		material.vertexNode = vertexNode;
		material.colorNode = colorNode;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the sky is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

		this._noiseTexture.dispose();

	}

}

export { SkyMesh };
