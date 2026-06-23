import { Fn, If, PI, clamp, cos, cross, dot, equirectUV, float, log, max, mix, normalize, pow, reflect, sin, sqrt, struct, vec3 } from 'three/tsl';

/**
 * Specular / microfacet BRDF helpers: VNDF sampling, GTR distribution, Smith geometry,
 * Fresnel, reflection importance sampling, parallax-corrected ray-length terms, and
 * equirectangular environment sampling / MIS helpers.
 * Pure TSL functions of their inputs (no scene/camera state).
 */

/**
 * Sentinel ray length the SSR pass writes for environment misses (no screen-space hit), set far above
 * any real hit distance so a single magnitude test separates misses from hits and survives `.max( 0 )`.
 *
 * @type {number}
 */
export const ENV_RAY_LENGTH = 1e4;

/**
 * Classification threshold for {@link ENV_RAY_LENGTH}: above this is an env miss, below a real hit.
 * An order of magnitude under the sentinel, robust to fp16 storage and bilinear blending at borders.
 *
 * @type {number}
 */
export const ENV_RAY_LENGTH_THRESHOLD = 1e3;

// Bounded-VNDF sampler (Eto & Tokuyoshi 2023; spherical-cap form, Dupuy & Benyoub 2023)
const SampleGGXVNDF = Fn( ( [ V, ax, ay, r1, r2 ] ) => {

	// Warp the view direction to the hemisphere ("standard") configuration.
	const wiStd = normalize( vec3( ax.mul( V.x ), ay.mul( V.y ), V.z ) ).toVar();

	// Isotropic bound on the spherical cap (Eto & Tokuyoshi eq. 5). alpha ∈ [0,1] here,
	// so the sign term in `s` is always +1 and is dropped.
	const a = ax.min( ay ).toVar();
	const s = float( 1.0 ).add( V.xy.length() ).toVar();
	const a2 = a.mul( a ).toVar();
	const s2 = s.mul( s ).toVar();
	const k = a2.oneMinus().mul( s2 ).div( s2.add( a2.mul( V.z ).mul( V.z ) ) ).toVar();

	// Tighten the cap with the bound (upper hemisphere; N·V ≥ 0 in our usage).
	const b = wiStd.z.mul( k ).toVar();

	// Sample the (bounded) spherical cap.
	const phi = float( 6.283185307179586 ).mul( r1 ).toVar(); // 2*pi
	const z = r2.oneMinus().mul( float( 1.0 ).add( b ) ).sub( b ).toVar();
	const sinTheta = sqrt( max( float( 0.0 ), float( 1.0 ).sub( z.mul( z ) ) ) ).toVar();
	const c = vec3( sinTheta.mul( cos( phi ) ), sinTheta.mul( sin( phi ) ), z ).toVar();

	// Microfacet normal in the standard config, then warp back to the ellipsoid (unstretch).
	const wmStd = c.add( wiStd ).toVar();
	const Ne = normalize( vec3(
		ax.mul( wmStd.x ),
		ay.mul( wmStd.y ),
		max( float( 0.0 ), wmStd.z )
	) ).toVar();

	return Ne;

}, {
	name: 'SampleGGXVNDF',
	type: 'vec3',
	inputs: [
		{ name: 'V', type: 'vec3' },
		{ name: 'ax', type: 'float' },
		{ name: 'ay', type: 'float' },
		{ name: 'r1', type: 'float' },
		{ name: 'r2', type: 'float' },
	]
} );

// Generalized Trowbridge-Reitz (GTR). For GGX set k=2.
// D_GTR(roughness, NoH, k) where roughness = α (not α²).
export const D_GTR = Fn( ( [ roughness, NoH, k ] ) => {

	// see: Filament - Normal distribution function (specular D) - 4.4.1
	const a2 = roughness.mul( roughness ).toVar(); // α²
	const NoH2 = NoH.mul( NoH ).toVar();
	const base = NoH2.mul( a2.sub( float( 1.0 ) ) ).add( float( 1.0 ) ).toVar();
	// a² / (π * base^k)
	return a2.div( PI.mul( pow( base, k ) ) ).toVar(); // float

} );

// Smith G1 (Heitz): expects alpha (not squared); it squares internally
export const SmithG = Fn( ( [ NDotX, alpha ] ) => {

	// see: Filament - Geometric shadowing (specular G) - 4.4.2

	const a2 = alpha.mul( alpha ).toVar(); // α²
	const NDotX2 = NDotX.mul( NDotX ).toVar(); // (N·X)²
	return float( 2.0 ).mul( NDotX ).div(
		NDotX.add( sqrt(
			a2.add( a2.oneMinus().mul( NDotX2 ) )
		) )
	);

} );

// Geometry term G = G1(N·L, α_G) * G1(N·V, α_G)  (α_G is NOT squared here)
export const GeometryTerm = Fn( ( [ NoL, NoV, alphaG ] ) => {

	const G1v = SmithG( NoV, alphaG ).toVar();
	const G1l = SmithG( NoL, alphaG ).toVar();
	return G1v.mul( G1l ).toVar();

} );

// Bounded VNDF direction PDF (reflection mapping), matching SampleGGXVNDF above.
// p(L) = D_GTR(roughness, NoH, 2) / ( 2 * (k * N·V + t) )   (Eto & Tokuyoshi eq. 8)
// with the isotropic cap bound k and t = ‖(α·V.xy, V.z)‖. Here 'roughness' is α, not α².
const GGXVNDFPdf = Fn( ( [ NoH, NoV, roughness ] ) => {

	const D = D_GTR( roughness, NoH, float( 2.0 ) ).toVar();
	const a2 = roughness.mul( roughness ).toVar();
	const sinV2 = max( float( 0.0 ), float( 1.0 ).sub( NoV.mul( NoV ) ) ).toVar(); // ‖V.xy‖²
	const s = float( 1.0 ).add( sqrt( sinV2 ) ).toVar();
	const s2 = s.mul( s ).toVar();
	const k = float( 1.0 ).sub( a2 ).mul( s2 ).div( s2.add( a2.mul( NoV ).mul( NoV ) ) ).toVar();
	const t = sqrt( a2.mul( sinV2 ).add( NoV.mul( NoV ) ) ).toVar();
	return D.div( max( float( 1e-6 ), float( 2.0 ).mul( k.mul( NoV ).add( t ) ) ) ).toVar();

} );

/**
 * Fresnel reflectance for the Schlick approximation.
 */
export const F_Schlick = Fn( ( [ f0, theta ] ) => {

	const oneMinus = float( 1.0 ).sub( theta ).toVar();
	const oneMinus2 = oneMinus.mul( oneMinus ).toVar();
	const oneMinus5 = oneMinus2.mul( oneMinus2 ).mul( oneMinus ).toVar();
	return f0.add( vec3( 1.0 ).sub( f0 ).mul( oneMinus5 ) ).toVar(); // vec3

} );

/**
 * Specular dominant factor for parallax-corrected ray length.
 * From REBLUR: A Hierarchical Recurrent Denoiser (NRD).
 */
export const getSpecularDominantFactor = Fn( ( [ NoV, roughness ] ) => {

	const a = float( 0.298475 ).mul(
		log( float( 39.4115 ).sub( float( 39.0029 ).mul( roughness ) ) )
	);
	const f = float( 1.0 ).sub( NoV ).pow( 10.8649 )
		.mul( float( 1.0 ).sub( a ) )
		.add( a );
	return clamp( f );

} ).setLayout( {
	name: 'getSpecularDominantFactor',
	type: 'float',
	inputs: [
		{ name: 'NoV', type: 'float' },
		{ name: 'roughness', type: 'float' }
	]
} );

/**
 * Everything a single GGX reflection sample produces. `reflectDir` and `sampleWeight`
 * drive the SSR ray-march and compositing; `pdf`, `NdotV`, `alpha` and `f0` are the GGX
 * terms the env-miss MIS fallback needs so the caller never re-derives microfacet math.
 */
const ggxReflectionStruct = struct( {
	reflectDir: 'vec3', // view-space reflected ray direction
	sampleWeight: 'vec3', // chromatic weight (incl. Fresnel tint) to multiply gathered radiance by
	pdf: 'float', // VNDF direction pdf (for MIS against the env CDF)
	NdotV: 'float',
	alpha: 'float', // GGX alpha (roughness²), clamped
	f0: 'vec3' // Fresnel reflectance at normal incidence
} );

/**
 * Importance-samples the GGX/VNDF specular lobe for one pixel and returns the reflected
 * ray direction plus the Monte-Carlo weight to apply to the gathered radiance, along with
 * the GGX terms the SSR env-miss MIS fallback needs.
 *
 * @param {Node<vec3>} N - View-space shading normal (normalized).
 * @param {Node<vec3>} V - View-space surface→camera direction (normalized).
 * @param {Node<float>} roughness - Perceptual roughness in `[0,1]`.
 * @param {Node<float>} metalness - Metalness in `[0,1]`.
 * @param {Node<vec3>} albedo - Surface base color; tints the metal Fresnel reflectance (`f0`).
 * @param {Node<vec4>} Xi - Per-pixel random numbers; only `.xy` are used.
 * @return {ggxReflectionStruct}
 */
export const ggxReflectionSample = Fn( ( [ N, V, roughness, metalness, albedo, Xi ] ) => {

	// GGX alpha (use r^2, clamp to avoid degenerate)
	const a = roughness.mul( roughness ).max( 0.001 ).toVar();
	const ax = a.toVar();
	const ay = a.toVar();

	// TBN from view-space normal
	const up = vec3( 0, 0, 1 );
	let T = cross( up, N ).toVar();
	T = T.normalize().toVar();
	If( T.length().lessThan( 1e-3 ), () => {

		T.assign( cross( vec3( 0, 1, 0 ), N ).normalize() );

	} );
	const B = cross( N, T ).normalize().toVar();

	// transform V to LOCAL frame (N = +Z)
	const Vlocal = vec3( dot( T, V ), dot( B, V ), dot( N, V ) ).toVar();

	// VNDF sample **in local frame**
	const Hlocal = SampleGGXVNDF( Vlocal, ax, ay, Xi.x, Xi.y ).toVar();
	If( Hlocal.z.lessThan( 0 ), () => {

		Hlocal.assign( Hlocal.negate() );

	} );

	// transform H back to VIEW space
	const h = normalize( T.mul( Hlocal.x ).add( B.mul( Hlocal.y ) ).add( N.mul( Hlocal.z ) ) ).toVar();

	// reflect with V (surface->camera) and H
	const viewReflectDir = reflect( V.negate(), h ).normalize().toVar();

	// BRDF/PDF evaluation for the sampled direction
	// V: surface -> camera, L: reflected direction, N: normal, H: half-vector
	const L = viewReflectDir.toVar();
	const H = normalize( V.add( L ) ).toVar(); // ~h; recomputed for robustness

	const NdotV = max( float( 0.0 ), dot( N, V ) ).toVar();
	const NdotL = max( float( 0.0 ), dot( N, L ) ).toVar();
	const NdotH = max( float( 0.0 ), dot( N, H ) ).toVar();
	const VdotH = max( float( 0.0 ), dot( V, H ) ).toVar();

	const f0 = mix( vec3( 0.04 ), albedo, metalness ).toVar();
	// Chromatic Fresnel reflectance: for metals f0 = albedo, so the reflection is tinted and desaturates
	// toward white at grazing angles. Kept as vec3 so colored metals reflect with the correct chroma.
	const fresnelWeight = F_Schlick( f0, VdotH ).toVar(); // vec3

	// Bounded-VNDF direction pdf — still needed for the env-miss MIS path.
	const pdf = GGXVNDFPdf( NdotH, NdotV, ax ).toVar();

	// Numerically stable importance weight: brdf·NdotL/pdf ≡ fresnel·G2·(k·NdotV + t)/(2·NdotV), which
	// cancels the GGX D analytically. Evaluating D explicitly is catastrophic at low roughness
	// (D → 3e5 at α = 0.001 wrecks f32 precision); the cancelled form stays stable down to a mirror.
	// (k·NdotV + t) is the bounded-cap normalization; k shrinks the cap to drop below-horizon samples.
	const a2 = ax.mul( ax ).toVar();
	const sinV2 = NdotV.mul( NdotV ).oneMinus().max( 0.0 ).toVar(); // ‖V.xy‖²
	const sB = float( 1.0 ).add( sqrt( sinV2 ) ).toVar();
	const s2B = sB.mul( sB ).toVar();
	const kB = a2.oneMinus().mul( s2B ).div( s2B.add( a2.mul( NdotV ).mul( NdotV ) ) ).toVar();
	const tB = sqrt( a2.mul( sinV2 ).add( NdotV.mul( NdotV ) ) ).toVar();
	const glossyWeight = fresnelWeight
		.mul( GeometryTerm( NdotL, NdotV, ax ) )
		.mul( kB.mul( NdotV ).add( tB ) )
		.div( float( 2.0 ).mul( NdotV ).max( 1e-4 ) ).toVar();

	return ggxReflectionStruct( viewReflectDir, glossyWeight, pdf, NdotV, ax, f0 );

} );

// Equirectangular environment sampling

/**
 * Equirectangular direction / UV / PDF helpers and MIS weighting shared by environment sampling code.
 * Env-miss MIS integration lives in {@link ImportanceSampledEnvironment}.
 *
 * Equirectangular parameterization helpers used with CDF importance sampling are adapted from
 * [three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer).
 *
 * @see {@link https://github.com/gkjohnson/three-gpu-pathtracer}
 */

// uv -> direction (equirectangular)
export const equirectUvToDir = Fn( ( [ uvIn ] ) => {

	const phi = uvIn.x.mul( Math.PI * 2 ).sub( Math.PI );
	const lat = uvIn.y.sub( 0.5 ).mul( Math.PI );
	const cosLat = cos( lat );
	return normalize( vec3(
		cosLat.mul( cos( phi ) ),
		sin( lat ),
		cosLat.mul( sin( phi ) )
	) );

} ).setLayout( {
	name: 'equirectUvToDir',
	type: 'vec3',
	inputs: [ { name: 'uv', type: 'vec2' } ]
} );

// Solid-angle PDF of a direction under equirectangular parameterization.
export const equirectDirPdf = Fn( ( [ direction ] ) => {

	const uvDir = equirectUV( direction );
	const sinTheta = sin( uvDir.y.mul( Math.PI ) );
	return sinTheta.abs().lessThan( float( 1e-6 ) ).select(
		float( 0 ),
		float( 1 ).div( float( 2 * Math.PI * Math.PI ).mul( sinTheta ) )
	);

} ).setLayout( {
	name: 'equirectDirPdf',
	type: 'float',
	inputs: [ { name: 'direction', type: 'vec3' } ]
} );

/**
 * MIS power heuristic with β = 2: `pdfA² / (pdfA² + pdfB²)`.
 * Weights the contribution of the strategy that produced `pdfA` against the other strategy.
 *
 * @see Eric Veach, *Optimally Combining Sampling Techniques for Monte Carlo Rendering*
 * @tsl
 */
export const misPowerHeuristic = Fn( ( [ pdfA, pdfB ] ) => {

	const pdfASq = pdfA.mul( pdfA );
	const pdfBSq = pdfB.mul( pdfB );
	return pdfASq.div( pdfASq.add( pdfBSq ) );

} ).setLayout( {
	name: 'misPowerHeuristic',
	type: 'float',
	inputs: [
		{ name: 'pdfA', type: 'float' },
		{ name: 'pdfB', type: 'float' }
	]
} );

