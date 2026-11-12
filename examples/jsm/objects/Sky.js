import {
	BackSide,
	BoxGeometry,
	BufferGeometry,
	Float32BufferAttribute,
	HalfFloatType,
	LinearFilter,
	LinearMipmapLinearFilter,
	Mesh,
	OrthographicCamera,
	RedFormat,
	RepeatWrapping,
	ShaderMaterial,
	UniformsUtils,
	Vector3,
	Vector4,
	WebGLRenderTarget
} from 'three';

// The cloud noise is baked into a texture of NOISE_SIZE texels that tiles over NOISE_CELLS noise cells.
const NOISE_SIZE = 512;
const NOISE_CELLS = 32;

const _viewport = /*@__PURE__*/ new Vector4();

/**
 * Represents a skydome for scene backgrounds. Based on [A Practical Analytic Model for Daylight](https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight)
 * aka The Preetham Model, the de facto standard for analytical skydomes.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link SkyMesh}.
 *
 * More references:
 *
 * - {@link http://simonwallner.at/project/atmospheric-scattering/}
 * - {@link http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR}
 *
 *
 * ```js
 * const sky = new Sky();
 * sky.scale.setScalar( 10000 );
 * scene.add( sky );
 * ```
 *
 * It can be useful to hide the sun disc when generating an environment map to avoid artifacts
 *
 * ```js
 * // disable before rendering environment map
 * sky.material.uniforms.showSunDisc.value = false;
 * // ...
 * // re-enable before scene sky box rendering
 * sky.material.uniforms.showSunDisc.value = true;
 * ```
 *
 * @augments Mesh
 * @three_import import { Sky } from 'three/addons/objects/Sky.js';
 */
class Sky extends Mesh {

	/**
	 * Constructs a new skydome.
	 */
	constructor() {

		const shader = Sky.SkyShader;

		const material = new ShaderMaterial( {
			name: shader.name,
			uniforms: UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			side: BackSide,
			depthWrite: false
		} );

		super( new BoxGeometry( 1, 1, 1 ), material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSky = true;

		// The clouds read their gradient noise from a tiling, mipmapped texture. It is
		// rendered once on the GPU, the first time the sky is drawn.

		/**
		 * The render target holding the baked cloud noise.
		 *
		 * @private
		 * @type {WebGLRenderTarget}
		 */
		this._noiseTarget = new WebGLRenderTarget( NOISE_SIZE, NOISE_SIZE, {
			type: HalfFloatType,
			format: RedFormat,
			depthBuffer: false,
			generateMipmaps: true,
			minFilter: LinearMipmapLinearFilter,
			magFilter: LinearFilter,
			wrapS: RepeatWrapping,
			wrapT: RepeatWrapping
		} );

		const noiseGeometry = new BufferGeometry();
		noiseGeometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
		noiseGeometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

		/**
		 * The full-screen triangle that renders the cloud noise.
		 *
		 * @private
		 * @type {Mesh}
		 */
		this._noiseMesh = new Mesh( noiseGeometry, new ShaderMaterial( {
			name: NoiseShader.name,
			vertexShader: NoiseShader.vertexShader,
			fragmentShader: NoiseShader.fragmentShader,
			depthTest: false,
			depthWrite: false
		} ) );
		this._noiseMesh.frustumCulled = false;

		const noiseCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		const noiseTarget = this._noiseTarget;
		const noiseMesh = this._noiseMesh;
		let noiseNeedsUpdate = true;

		material.uniforms.noiseMap.value = noiseTarget.texture;

		material.onBeforeRender = function ( renderer, scene, camera ) {

			if ( noiseNeedsUpdate === true ) {

				noiseNeedsUpdate = false;
				renderNoise( renderer, camera );

			}

			// the angle covered by one pixel at the centre of the view, and the view direction,
			// to pick the mipmap level of the cloud noise

			renderer.getCurrentViewport( _viewport );

			material.uniforms.pixelAngle.value = 2 / ( camera.projectionMatrix.elements[ 5 ] * _viewport.w );
			material.uniforms.cameraDirection.value.setFromMatrixColumn( camera.matrixWorld, 2 ).negate();

		};

		function renderNoise( renderer, camera ) {

			const currentRenderTarget = renderer.getRenderTarget();
			const currentActiveCubeFace = renderer.getActiveCubeFace();
			const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false;
			renderer.shadowMap.autoUpdate = false;

			renderer.setRenderTarget( noiseTarget );
			renderer.render( noiseMesh, noiseCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );

			// restore the viewport of the camera being rendered, e.g. for array cameras

			const viewport = camera.viewport;

			if ( viewport !== undefined ) renderer.state.viewport( viewport );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the sky is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

		this._noiseTarget.dispose();
		this._noiseMesh.geometry.dispose();
		this._noiseMesh.material.dispose();

	}

}

// Renders tiling gradient noise into the cloud noise texture.
const NoiseShader = {

	name: 'SkyNoiseShader',

	vertexShader: /* glsl */`
		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = vec4( position.xy, 0.0, 1.0 );

		}`,

	fragmentShader: /* glsl */`
		varying vec2 vUv;

		const float NOISE_CELLS = ${ NOISE_CELLS }.0;

		// gradient at a lattice corner, wrapped so the texture tiles; sinless hash so every GPU produces the same clouds
		vec2 gradient( vec2 i ) {
			vec3 p = fract( mod( i, NOISE_CELLS ).xyx * vec3( 0.1031, 0.1030, 0.0973 ) );
			p += dot( p, p.yzx + 33.33 );
			return fract( ( p.xx + p.yz ) * p.zy ) * 2.0 - 1.0;
		}

		// 2D gradient noise: isotropic lobes like Perlin at value-noise cost
		float noise( vec2 p ) {
			vec2 i = floor( p );
			vec2 f = fract( p );
			vec2 u = f * f * f * ( f * ( f * 6.0 - 15.0 ) + 10.0 ); // quintic fade
			float a = dot( gradient( i ), f );
			float b = dot( gradient( i + vec2( 1.0, 0.0 ) ), f - vec2( 1.0, 0.0 ) );
			float c = dot( gradient( i + vec2( 0.0, 1.0 ) ), f - vec2( 0.0, 1.0 ) );
			float d = dot( gradient( i + vec2( 1.0, 1.0 ) ), f - vec2( 1.0, 1.0 ) );
			return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ) * 1.6; // ~[-1,1]
		}

		void main() {

			gl_FragColor = vec4( noise( vUv * NOISE_CELLS ), 0.0, 0.0, 1.0 );

		}`

};

Sky.SkyShader = {

	name: 'SkyShader',

	uniforms: {
		'turbidity': { value: 2 },
		'rayleigh': { value: 1 },
		'mieCoefficient': { value: 0.005 },
		'mieDirectionalG': { value: 0.8 },
		'sunPosition': { value: new Vector3() },
		'cloudScale': { value: 0.0002 },
		'cloudSpeed': { value: 0.00002 },
		'cloudCoverage': { value: 0.4 },
		'cloudDensity': { value: 0.4 },
		'cloudElevation': { value: 0.5 },
		'showSunDisc': { value: 1 },
		'time': { value: 0.0 },
		'noiseMap': { value: null },
		'pixelAngle': { value: 0.001 },
		'cameraDirection': { value: new Vector3( 0, 0, - 1 ) }
	},

	vertexShader: /* glsl */`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying vec3 vSunE;
		varying vec3 vSunFex;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calculation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - exp( -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#ifdef USE_REVERSED_DEPTH_BUFFER

				gl_Position.z = 0.0; // set z to camera.far

			#else

				gl_Position.z = gl_Position.w; // set z to camera.far

			#endif

			vSunDirection = normalize( sunPosition );

			// stratospheric ozone (Chappuis band) absorption along incoming sun path
			float sunCos = max( 0.0, vSunDirection.y );
			float sunOzoneAirMass = 1.0 / sqrt( sunCos * sunCos + 0.004 );
			vSunE = sunIntensity( vSunDirection.y ) * exp( -vec3( 0.005, 0.016, 0.0007 ) * sunOzoneAirMass );

			float sunfade = 1.0 - clamp( 1.0 - exp( vSunDirection.y ), 0.0, 1.0 );

			float rayleighCoefficient = max( 0.0, rayleigh - ( 1.0 - sunfade ) );

			// extinction (absorption + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

			// sun-path transmittance through lower troposphere to cloud altitude (~2km)
			float sunCloudCos = max( 0.0, vSunDirection.y + 0.03 );
			float sunCloudAirMass = 2.0 / ( sunCloudCos + sqrt( sunCloudCos * sunCloudCos + 0.012 ) );
			vSunFex = exp( -( ( vBetaR * 4600.0 + vBetaM * 190.0 ) * sunCloudAirMass ) );

		}`,

	fragmentShader: /* glsl */`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying vec3 vSunE;
		varying vec3 vSunFex;

		uniform float mieDirectionalG;
		uniform float cloudScale;
		uniform float cloudSpeed;
		uniform float cloudCoverage;
		uniform float cloudDensity;
		uniform float cloudElevation;
		uniform float showSunDisc;
		uniform float time;
		uniform sampler2D noiseMap;
		uniform float pixelAngle;
		uniform vec3 cameraDirection;

		const float NOISE_SIZE = ${ NOISE_SIZE }.0;
		const float NOISE_CELLS = ${ NOISE_CELLS }.0;
		const float OCTAVE_LEVEL = 1.0566; // log2( 2.08 ), the mipmap step between noise octaves

		// gradient noise baked into a tiling texture; level picks the mipmap that fits the pixel footprint
		float noise( vec2 p, float level ) {
			return textureLod( noiseMap, p / NOISE_CELLS, level ).r;
		}

		// Fast scalar value noise for low-frequency macro weather modulation
		float hash( vec2 i ) {
			vec3 p = fract( vec3( i.xyx ) * 0.1031 );
			p += dot( p, p.yzx + 33.33 );
			return fract( ( p.x + p.y ) * p.z );
		}

		float vnoise( vec2 p ) {
			vec2 i = floor( p );
			vec2 f = fract( p );
			vec2 u = f * f * ( 3.0 - 2.0 * f );
			return mix(
				mix( hash( i ), hash( i + vec2( 1.0, 0.0 ) ), u.x ),
				mix( hash( i + vec2( 0.0, 1.0 ) ), hash( i + vec2( 1.0, 1.0 ) ), u.x ),
				u.y
			) * 2.0 - 1.0;
		}

		// Advance one rotated FBM octave (3-4-5 Pythagorean rotation avoids grid alignment)
		vec2 nextOctave( vec2 p, float drift ) {
			return vec2( p.x * 0.8 + p.y * 0.6, p.y * 0.8 - p.x * 0.6 ) * 2.08 + drift;
		}

		// 2-octave turret field for directional sun self-shadowing
		float cloudShadow( vec2 uv, float drift, float level ) {
			vec2 p = uv * 600.0;
			float base = 0.58 * noise( p, level );
			p = nextOctave( p, drift );
			base += 0.32 * noise( p, level + OCTAVE_LEVEL );
			return base * 0.72 + 0.5;
		}

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + cosTheta * cosTheta );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = g * g;
			float invSqrt = inversesqrt( max( 1e-4, 1.0 - 2.0 * g * cosTheta + g2 ) );
			return ONE_OVER_FOURPI * ( 1.0 - g2 ) * ( invSqrt * invSqrt * invSqrt );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length (rational Kasten-Young air mass fit, <0.06% error on [0, 1])
			float cosZenith = max( 0.0, direction.y );
			float inverse = 1.0 / ( cosZenith + 0.02739 / ( 1.0 + cosZenith * ( 18.6 + 26.0 * cosZenith ) ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );
			float horizonMask = smoothstep( -0.15, 0.0, direction.y );

			float rPhase = rayleighPhase( ( cosTheta * horizonMask ) * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG ) * smoothstep( -0.06, 0.0, direction.y );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 betaScatOverExt = ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM );
			vec3 LinBase = max( vec3( 0.0 ), vSunE * betaScatOverExt * ( 1.0 - Fex ) );
			vec3 Lin = LinBase * sqrt( LinBase );
			float sunHorizon = clamp( 1.0 - vSunDirection.y, 0.0, 1.0 );
			float sunHorizon2 = sunHorizon * sunHorizon;
			Lin *= mix( vec3( 1.0 ), sqrt( max( vec3( 0.0 ), vSunE * betaScatOverExt * Fex ) ), sunHorizon2 * sunHorizon2 * sunHorizon );

			// nightsky
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc with photospheric limb darkening: a linear law per channel
			// ( u ~ 0.54, 0.62, 0.73 ), normalized so the disc keeps its average color
			float mu2 = clamp( ( cosTheta - sunAngularDiameterCos ) * 23082.0, 0.0, 1.0 );
			float mu = sqrt( mu2 );
			vec3 sundisc = smoothstep( 0.0, 0.1, mu2 ) * ( vec3( 0.561, 0.479, 0.3568 ) + vec3( 0.6585, 0.7815, 0.9648 ) * mu ) * showSunDisc * smoothstep( -0.002, 0.002, direction.y );
			vec3 sundiscColor = ( 760.0 * sundisc ) * min( vSunE * Fex, 80.0 );

			vec3 skyInscatter = Lin * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
			vec3 texColor = skyInscatter + L0 * 0.04 + sundiscColor;

			// Volumetric Cloud Slab
			if ( direction.y > 0.0 && cloudCoverage > 0.0 ) {

				// Intersect view ray with base and top of a curved planetary cloud slab
				float elevation = mix( 1.0, 0.1, cloudElevation );
				float slabThickness = 0.26 * mix( 0.45, 1.0, smoothstep( 0.02, 0.20, direction.y ) );
				float shellBase = 2.0 / ( sqrt( direction.y * direction.y + 0.015 ) + direction.y );
				float shellTop = 2.0 * ( 1.0 + slabThickness ) / ( sqrt( direction.y * direction.y + 0.015 * ( 1.0 + slabThickness ) ) + direction.y );

				vec2 driftUV = vec2( time * cloudSpeed );
				vec2 uvBase = direction.xz * ( shellBase / elevation ) * cloudScale + driftUV;
				vec2 uvTop = direction.xz * ( shellTop / elevation ) * cloudScale + driftUV + vec2( 0.75, 0.3 ) * cloudScale;

				// mipmap level of the cloud noise, from the footprint of one pixel on the cloud layer:
				// the larger of the tangential and radial rates at which the shell coordinates change with view angle
				float shell = sqrt( direction.y * direction.y + 0.015 );
				float tangentialRate = 0.5 * shellBase;
				float radialRate = direction.y * tangentialRate + ( 1.0 - direction.y * direction.y ) * tangentialRate * tangentialRate * ( 1.0 + direction.y / shell );
				float footprint = pixelAngle * max( dot( direction, cameraDirection ), 0.05 ) * max( tangentialRate, radialRate );
				float noiseLevel = log2( footprint * cloudScale * ( 1200.0 * NOISE_SIZE / NOISE_CELLS ) / elevation + 1e-8 );

				float evolve = time * cloudSpeed * 200.0;
				float covEnv = cloudCoverage * ( 1.0 - cloudCoverage );
				float minThreshold = 1.0 - min( 1.0, cloudCoverage + covEnv * 0.75 );

				// Evaluate 2-octave macro field at slab base first to reject clear sky in 2 noise calls
				vec2 pBase = uvBase * 600.0;
				float macroBase = 0.55 * noise( pBase, noiseLevel );
				pBase = nextOctave( pBase, evolve );
				macroBase = ( macroBase + 0.275 * noise( pBase, noiseLevel + OCTAVE_LEVEL ) ) * 0.72 + 0.5;

				if ( macroBase + 0.34 > minThreshold ) {

					// Subtle large-scale weather modulation for natural cloud banks and storm breaks
					float weather = covEnv > 0.005 ? vnoise( ( uvBase + uvTop ) * 75.0 + vec2( 2.1, 1.3 ) ) : 0.0;
					float localCov = clamp( cloudCoverage + weather * covEnv * 0.65, 0.0, 1.0 );
					float threshold = 1.0 - localCov;

					if ( localCov > 0.005 && macroBase + 0.34 > threshold ) {

						vec2 pTop = uvTop * 600.0;
						float macroTop = 0.55 * noise( pTop, noiseLevel );
						pTop = nextOctave( pTop, evolve );
						macroTop = ( macroTop + 0.275 * noise( pTop, noiseLevel + OCTAVE_LEVEL ) ) * 0.72 + 0.5;

						if ( max( macroBase, macroTop ) + 0.24 > threshold ) {

							// Estimate smooth front-surface hit height to sample turret & billow detail once in 3D
							float baseHit = smoothstep( threshold - 0.12, threshold + 0.18, macroBase );
							float slopeDiff = macroTop - macroBase;
							float hPeak = clamp( 0.5 + 0.45 * slopeDiff / ( abs( slopeDiff ) + 0.12 ), 0.15, 0.82 );
							float hProbe = mix( hPeak, 0.18, baseHit * 0.80 );

							vec2 pHit = nextOctave( mix( pBase, pTop, hProbe ), evolve );
							float n3 = noise( pHit, noiseLevel + 2.0 * OCTAVE_LEVEL );
							pHit = nextOctave( pHit, evolve );
							float n4 = noise( pHit, noiseLevel + 3.0 * OCTAVE_LEVEL );

							// Feathery fractal wisps at fringes, transitioning to cauliflower billows on cumulus bodies
							float detailFade = smoothstep( 0.025, 0.24, direction.y );
							float micro = 0.0;
							float midMax = max( macroBase, macroTop ) + 0.12 * n3 + 0.06 * n4 * detailFade;

							if ( detailFade > 0.01 && midMax + 0.10 > threshold ) {

								pHit = nextOctave( pHit, evolve );
								float n5 = noise( pHit, noiseLevel + 4.0 * OCTAVE_LEVEL );
								vec2 ep = vec2( pHit.x * 0.8 + pHit.y * 0.6, pHit.y * 0.8 - pHit.x * 0.6 ) * 2.15 - evolve * 0.7;
								float n6 = noise( ep, noiseLevel + 4.0 * OCTAVE_LEVEL + 1.1043 ); // ep is scaled by 2.15, log2( 2.15 ) = 1.1043

								float wispy = 0.65 * n5 + 0.35 * n6;
								float billow = ( 0.66 * abs( n5 ) + 0.34 * abs( n6 ) - 0.46 ) * 1.45;
								float bodyMask = smoothstep( threshold - 0.01, threshold + 0.15, midMax );
								micro = mix( wispy * 0.09, billow * 0.16, bodyMask );

							}

							float sculpt = 0.12 * n3 + ( 0.06 * n4 + micro ) * detailFade;
							float fieldBase = clamp( macroBase + sculpt * mix( 0.90, 0.60, clamp( macroBase, 0.0, 1.0 ) ), 0.0, 1.0 );
							float fieldTop = clamp( macroTop + sculpt * mix( 1.20, 0.80, clamp( macroTop, 0.0, 1.0 ) ), 0.0, 1.0 );

							if ( max( fieldBase, fieldTop ) > threshold ) {

								float depthNorm = max( 0.18, 0.88 - threshold * 0.88 );
								float pathStretch = 1.0 / max( direction.y, 0.28 );
								float stepSigma = cloudDensity * ( 22.0 / 4.0 ) * mix( 1.0, pathStretch, 0.55 );

								float vis = 1.0;
								float densitySum = 0.0;
								float accumH = 0.0;
								float accumTower = 0.0;
								float accumField = 0.0;

								// Branchless 4-step slab integration (zero noise, sqrt, or exp inside loop)
								for ( int i = 0; i < 4; i ++ ) {

									float h = ( float( i ) + 0.5 ) * 0.25;
									float colNoise = mix( fieldBase, fieldTop, h );
									float colClamped = clamp( ( colNoise - threshold ) / depthNorm, 0.0, 1.0 );
									float towerHeight = ( 2.25 * colClamped ) / ( 1.0 + 1.25 * colClamped );

									float baseShape = smoothstep( 0.0, 0.13, h );
									float crownCap = smoothstep( 0.0, 0.32, towerHeight - h + 0.07 );
									float localDensity = colClamped * ( 0.45 + 0.75 * baseShape ) * crownCap;

									float x = localDensity * stepSigma;
									float stepTrans = 1.0 / ( 1.0 + x + 0.5 * x * x );
									float w = vis * ( 1.0 - stepTrans );
									accumH += w * h;
									accumTower += w * towerHeight;
									accumField += w * colNoise;
									vis *= stepTrans;
									densitySum += localDensity;

								}

								float horizonFade = smoothstep( 0.0, 0.015 + 0.03 * cloudElevation, direction.y );
								float alpha = ( 1.0 - exp( -densitySum * stepSigma ) ) * horizonFade;

								if ( alpha > 0.001 ) {

									float invW = 1.0 / max( 1.0 - vis, 1e-4 );
									float hEff = accumH * invW;
									float towerEff = accumTower * invW;
									float fieldEff = accumField * invW;

									// Project from 3D scattering point toward the sun for turret & belly self-shadowing
									vec2 uvHit = mix( uvBase, uvTop, hEff );
									float sunDist = mix( 0.95, 0.50, max( 0.0, vSunDirection.y ) ) * ( 1.15 - 0.50 * hEff );
									vec2 sunStep = vSunDirection.xz * ( ( sunDist / elevation ) * cloudScale );
									float sunRaw = cloudShadow( uvHit + sunStep, evolve, noiseLevel );
									float sunColDepth = clamp( ( sunRaw - threshold ) / depthNorm, 0.0, 1.0 );
									float sunTower = ( 2.25 * sunColDepth ) / ( 1.0 + 1.25 * sunColDepth );

									float sunRise = max( 0.0, vSunDirection.y ) * 0.26;
									float shadow3D = max( 0.0, sunTower - ( hEff + sunRise ) );
									float slopeShadow = max( 0.0, sunRaw - fieldEff );
									float overheadDepth = max( 0.0, towerEff - hEff );
									float densityExt = cloudDensity * ( 0.70 + 1.30 * cloudDensity );
									float tau = densityExt * ( shadow3D * 3.8 + slopeShadow * 6.0 + overheadDepth * mix( 0.8, 3.0, max( 0.0, vSunDirection.y ) ) + sunColDepth * 0.8 );

									// Dual-lobe Henyey-Greenstein phase + Beer-powder multiple scattering
									float fwdInv = inversesqrt( 1.5184 - 1.44 * cosTheta );
									float hgFwd = min( 0.4816 * fwdInv * fwdInv * fwdInv, 4.5 );
									float backInv = inversesqrt( 1.0625 + 0.5 * cosTheta );
									float hgBack = 0.9375 * backInv * backInv * backInv;
									float phase = mix( hgBack, hgFwd, 0.6 );

									float optDepth = densitySum * stepSigma;
									float powder = mix( 1.0 - 0.36 * exp( -optDepth * 1.3 ), 1.0, max( 0.0, cosTheta ) );
									// direct sunlight fades exponentially with depth; multiply scattered sunlight
									// fades with the slower two-stream law, which keeps thick clouds gray
									float scatter = exp( -tau ) * phase * powder
										+ 0.48 / ( 1.0 + 0.32 * tau ) * mix( 1.0, min( phase, 1.3 ), 0.28 );

									// Attenuate overhead sky ambient through column above hEff to shade flat cloud bases
									float dayFactor = max( smoothstep( -0.1, 0.02, vSunDirection.y ), 0.03 );
									vec3 sunColor = vSunE * vSunFex * mix( 0.011, 0.028, smoothstep( 0.0, 0.5, vSunDirection.y ) );
									vec3 ambientScat = ( vBetaR * ( THREE_OVER_SIXTEENPI * 1.5 ) + vBetaM * ONE_OVER_FOURPI ) / ( vBetaR + vBetaM );
									vec3 ambientBase = max( vec3( 0.0 ), vSunE * ambientScat * ( 1.0 - Fex ) );
									vec3 skyAmbientTop = ambientBase * sqrt( ambientBase ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

									float baseAlbedo = mix( 0.42, 0.20, cloudDensity );
									float skyAccess = exp( -overheadDepth * ( 0.65 + 1.65 * cloudDensity ) );
									float heightBounce = baseAlbedo + ( 1.08 - baseAlbedo ) * skyAccess * mix( 0.72, 1.0, hEff );
									vec3 cloudColor = ( skyAmbientTop * heightBounce + sunColor * scatter ) * dayFactor;

									// Composite through sub-cloud airlight while occluding solar disc and nightsky behind clouds
									float airFraction = mix( 0.35, 0.08, cloudElevation );
									float cloudOpticalDepth = dot( vBetaR * sR * airFraction + vBetaM * sM * min( 1.0, airFraction * 2.5 ), vec3( 0.2126, 0.7152, 0.0722 ) );
									float cloudTransmittance = exp( -cloudOpticalDepth );
									vec3 aerialCloud = mix( skyInscatter, cloudColor, cloudTransmittance );
									texColor = mix( texColor, aerialCloud, alpha );

								}

							}

						}

					}

				}

			}

			gl_FragColor = vec4( texColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`

};

export { Sky };
