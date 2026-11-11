import { D_GGX, Fn, If, clamp, cos, cross, dot, float, log, max, mix, normalize, reflect, sin, sqrt, struct, vec3 } from 'three/tsl';

/**
 * Specular / microfacet BRDF helpers: VNDF sampling, Smith geometry, Fresnel,
 * reflection importance sampling and parallax-corrected ray-length terms.
 * Pure TSL functions of their inputs (no scene/camera state).
 */

/**
 * Sentinel hit distance the SSR pass writes for misses (no screen-space hit), set far above any
 * real hit distance so a single magnitude test separates misses from hits.
 *
 * @type {number}
 */
export const ENV_RAY_LENGTH = 1e4;

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
	V: 'vec3',
	ax: 'float',
	ay: 'float',
	r1: 'float',
	r2: 'float',
	return: 'vec3'
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

}, { NDotX: 'float', alpha: 'float', return: 'float' } );

// Geometry term G = G1(N·L, α_G) * G1(N·V, α_G)  (α_G is NOT squared here)
export const GeometryTerm = Fn( ( [ NoL, NoV, alphaG ] ) => {

	const G1v = SmithG( NoV, alphaG ).toVar();
	const G1l = SmithG( NoL, alphaG ).toVar();
	return G1v.mul( G1l ).toVar();

}, { NoL: 'float', NoV: 'float', alphaG: 'float', return: 'float' } );

/**
 * Fresnel reflectance for the Schlick approximation.
 */
export const F_Schlick = Fn( ( [ f0, theta, f90 = float( 1 ) ] ) => {

	const oneMinus = float( 1.0 ).sub( theta ).toVar();
	const oneMinus2 = oneMinus.mul( oneMinus ).toVar();
	const oneMinus5 = oneMinus2.mul( oneMinus2 ).mul( oneMinus ).toVar();
	return f0.add( vec3( f90 ).sub( f0 ).mul( oneMinus5 ) ).toVar(); // vec3

}, { f0: 'vec3', theta: 'float', f90: 'float', return: 'vec3' } );

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

}, { NoV: 'float', roughness: 'float', return: 'float' } );

/**
 * A single GGX reflection sample: `reflectDir` and `sampleWeight` drive the SSR ray-march
 * and compositing, `NdotV` the specular dominant factor, and `pdf` the reuse of the ray by
 * neighboring pixels.
 */
const ggxReflectionStruct = struct( {
	reflectDir: 'vec3', // view-space reflected ray direction
	sampleWeight: 'vec3', // chromatic weight (incl. Fresnel tint) to multiply gathered radiance by
	NdotV: 'float',
	pdf: 'float' // solid-angle pdf of the reflected direction, bounded VNDF (Eto & Tokuyoshi eq. 8)
} );

// Core of `ggxReflectionSample()` with explicit F0/F90.
const ggxReflectionSampleWithReflectance = Fn( ( [ N, V, roughness, f0, f90, Xi ] ) => {

	// GGX alpha (use r^2, clamp to avoid degenerate)
	const a = roughness.mul( roughness ).max( 0.001 ).toVar();
	const ax = a.toVar();
	const ay = a.toVar();

	// TBN from view-space normal
	const up = N.z.abs().lessThan( 0.999 ).select( vec3( 0, 0, 1 ), vec3( 1, 0, 0 ) );
	const T = cross( up, N ).normalize().toVar();
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
	const VdotH = max( float( 0.0 ), dot( V, H ) ).toVar();

	// Chromatic Fresnel reflectance: for metals f0 = albedo, so the reflection is tinted and desaturates
	// toward white at grazing angles. Kept as vec3 so colored metals reflect with the correct chroma.
	const fresnelWeight = F_Schlick( f0, VdotH, f90 ).toVar(); // vec3

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
	const pdf = D_GGX( { alpha: ax, dotNH: dot( N, H ).max( 0 ) } ).div( kB.mul( NdotV ).add( tB ).mul( 2 ) );

	const glossyWeight = fresnelWeight
		.mul( GeometryTerm( NdotL, NdotV, ax ) )
		.mul( kB.mul( NdotV ).add( tB ) )
		.div( float( 2.0 ).mul( NdotV ).max( 1e-4 ) ).toVar();

	return ggxReflectionStruct( viewReflectDir, glossyWeight, NdotV, pdf );

} );

/**
 * Importance-samples the GGX/VNDF specular lobe for one pixel and returns the reflected
 * ray direction plus the Monte-Carlo weight to apply to the gathered radiance.
 *
 * @tsl
 * @param {Node<vec3>} N - View-space shading normal (normalized).
 * @param {Node<vec3>} V - View-space surface→camera direction (normalized).
 * @param {Node<float>} roughness - Perceptual roughness in `[0,1]`.
 * @param {Node<float>} metalness - Metalness in `[0,1]`; only used when `f0` is omitted.
 * @param {Node<vec3>} albedo - Surface base color; tints the metal F0 when `f0` is omitted.
 * @param {Node<vec4>} Xi - Per-pixel random numbers; only `.xy` are used.
 * @param {?Node<vec3>} [f0=null] - Normal-incidence reflectance. Defaults to `mix( 0.04, albedo, metalness )`.
 * @param {Node<float>|number} [f90=1] - Grazing reflectance.
 * @return {ggxReflectionStruct}
 */
export const ggxReflectionSample = ( N, V, roughness, metalness, albedo, Xi, f0 = null, f90 = 1 ) =>

	ggxReflectionSampleWithReflectance( N, V, roughness, f0 ?? mix( vec3( 0.04 ), albedo, metalness ), float( f90 ), Xi );
