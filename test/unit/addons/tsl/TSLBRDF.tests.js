import {
	float, vec3,
	D_GGX, D_GGX_Anisotropic, F_Schlick, Schlick_to_F0,
	V_GGX_SmithCorrelated, V_GGX_SmithCorrelated_Anisotropic,
	BRDF_Lambert, BRDF_GGX, getDistanceAttenuation
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for the physically-based BRDF building blocks in
// src/nodes/functions/BSDF/*.js and src/nodes/lighting/LightUtils.js.
// Every expected value below is a plain-JS transliteration of each
// function's own documented formula (their source comments cite the
// reference papers directly -- Karis/Epic's GGX notes, Filament's BRDF
// implementation, the Frostbite PBR course notes), never by re-running the
// TSL expression under test.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'BSDF building blocks', () => {

		gpuTest( 'D_GGX() matches the normal distribution function formula', ( { assert } ) => {

			// D_GGX(alpha, dotNH) == alpha^2 / (PI * (dotNH^2*(alpha^2-1)+1)^2)
			// -- Disney/UE4 GGX normal distribution, source comment cites
			// "Microfacet Models for Refraction through Rough Surfaces", eq. 33.
			const ggxD = ( alpha, dotNH ) => {

				const a2 = alpha * alpha;
				const denom = 1 - dotNH * dotNH * ( 1 - a2 );
				return a2 / ( denom * denom ) / Math.PI;

			};

			assert.closeAbs( D_GGX( { alpha: float( 0.5 ), dotNH: float( 0.9 ) } ), float( ggxD( 0.5, 0.9 ) ), 1e-4, 'D_GGX(0.5, 0.9) matches the hand-computed formula' );
			assert.closeAbs( D_GGX( { alpha: float( 0.2 ), dotNH: float( 0.3 ) } ), float( ggxD( 0.2, 0.3 ) ), 1e-4, 'D_GGX(0.2, 0.3) matches the hand-computed formula' );

			// At normal incidence (dotNH == 1) the denominator collapses to
			// exactly alpha^2, so D_GGX(alpha, 1) == 1 / (PI * alpha^2) -- a
			// useful closed-form special case independent of the general
			// formula above.
			assert.closeAbs( D_GGX( { alpha: float( 0.5 ), dotNH: float( 1 ) } ), float( 1 / ( Math.PI * 0.25 ) ), 1e-4, 'D_GGX(0.5, 1) == 1/(PI*alpha^2)' );

		} );

		gpuTest( 'D_GGX_Anisotropic() reduces to D_GGX() in the isotropic, on-axis case', ( { assert } ) => {

			// When alphaT == alphaB == alpha and the half vector's tangent/
			// bitangent components are both zero (dotTH == dotBH == 0, i.e.
			// the half vector lies exactly along the normal, dotNH == 1),
			// D_GGX_Anisotropic's own formula (v = (0, 0, alpha^2), w2 =
			// alpha^2/v2 = 1/alpha^2, D = (1/PI)*alpha^2*w2^2) simplifies to
			// exactly 1/(PI*alpha^2) -- the same closed form D_GGX(alpha, 1)
			// reduces to above. This cross-checks the anisotropic formula
			// against the isotropic one at the one point where they must
			// agree, without assuming anything about the general case.
			const alpha = 0.4;
			const anisoOnAxis = D_GGX_Anisotropic( { alphaT: float( alpha ), alphaB: float( alpha ), dotNH: float( 1 ), dotTH: float( 0 ), dotBH: float( 0 ) } );
			assert.closeAbs( anisoOnAxis, float( 1 / ( Math.PI * alpha * alpha ) ), 1e-4, 'D_GGX_Anisotropic reduces to 1/(PI*alpha^2) when isotropic and on-axis' );

			// General off-axis case, hand-computed directly from the source
			// formula: a2 = alphaT*alphaB; v = (alphaB*dotTH, alphaT*dotBH,
			// a2*dotNH); w2 = a2 / dot(v,v); D = (1/PI) * a2 * w2^2.
			const alphaT = 0.3, alphaB = 0.6, dotNH = 0.8, dotTH = 0.2, dotBH = 0.1;
			const a2 = alphaT * alphaB;
			const v = [ alphaB * dotTH, alphaT * dotBH, a2 * dotNH ];
			const v2 = v[ 0 ] * v[ 0 ] + v[ 1 ] * v[ 1 ] + v[ 2 ] * v[ 2 ];
			const w2 = a2 / v2;
			const expected = ( 1 / Math.PI ) * a2 * w2 * w2;

			assert.closeAbs(
				D_GGX_Anisotropic( { alphaT: float( alphaT ), alphaB: float( alphaB ), dotNH: float( dotNH ), dotTH: float( dotTH ), dotBH: float( dotBH ) } ),
				float( expected ), 1e-4, 'D_GGX_Anisotropic matches the hand-computed general-case formula'
			);

		} );

		gpuTest( 'F_Schlick() reduces to f0 at normal incidence and to f90 at grazing incidence', ( { assert } ) => {

			// F_Schlick uses Epic's optimized exp2()-based variant of the
			// Schlick approximation (source comment cites the SIGGRAPH '13
			// slides): fresnel = 2^(dotVH*(-5.55473*dotVH - 6.98316)).
			// At dotVH == 0 (grazing incidence) the exponent is 0, so
			// fresnel == 1 and F == f90 exactly.
			assert.closeAbs( F_Schlick( { f0: float( 0.04 ), f90: float( 1.0 ), dotVH: float( 0 ) } ), float( 1.0 ), 1e-5, 'F_Schlick at dotVH=0 (grazing) returns f90 exactly' );

			// At dotVH == 1 (normal incidence) the exponent is a large
			// negative number, so fresnel is vanishingly small and F is
			// very close to f0.
			assert.closeAbs( F_Schlick( { f0: float( 0.04 ), f90: float( 1.0 ), dotVH: float( 1 ) } ), float( 0.04 ), 1e-3, 'F_Schlick at dotVH=1 (normal incidence) is close to f0' );

			// General case, hand-computed from the documented exp2() formula.
			const dotVH = 0.6, f0 = 0.04, f90 = 1.0;
			const fresnel = Math.pow( 2, dotVH * ( - 5.55473 * dotVH - 6.98316 ) );
			const expected = f0 * ( 1 - fresnel ) + f90 * fresnel;
			assert.closeAbs( F_Schlick( { f0: float( f0 ), f90: float( f90 ), dotVH: float( dotVH ) } ), float( expected ), 1e-4, 'F_Schlick(0.6) matches the hand-computed exp2() formula' );

		} );

		gpuTest( 'Schlick_to_F0() matches the classic-Schlick-inversion formula', ( { assert } ) => {

			// Schlick_to_F0 inverts the *classic* x^5 Schlick approximation
			// (not F_Schlick's own exp2() variant above): given f (the
			// observed reflectance at this angle) and f90, it solves
			// f = f0*(1-x^5) + f90*x^5 for f0, where x = saturate(1-dotVH).
			const dotVH = 0.7, f90 = 1.0;
			const x = Math.min( Math.max( 1 - dotVH, 0 ), 1 );
			const x5 = Math.min( Math.max( Math.pow( x, 5 ), 0 ), 0.9999 );
			const f = 0.5; // an arbitrary observed reflectance
			const expected = ( f - f90 * x5 ) / ( 1 - x5 );

			assert.closeAbs( Schlick_to_F0( { f: vec3( f, f, f ), f90: float( f90 ), dotVH: float( dotVH ) } ), vec3( expected, expected, expected ), 1e-4, 'Schlick_to_F0 matches the hand-computed inversion formula' );

			// Round trip: plugging f0 into the classic x^5 Schlick formula to
			// get f, then inverting with Schlick_to_F0, must recover the
			// original f0 (this is the formula Schlick_to_F0 is the
			// documented inverse of -- distinct from F_Schlick's exp2()
			// approximation used elsewhere in this file).
			const f0 = 0.08;
			const fFromClassicSchlick = f0 * ( 1 - x5 ) + f90 * x5;
			assert.closeAbs(
				Schlick_to_F0( { f: vec3( fFromClassicSchlick, fFromClassicSchlick, fFromClassicSchlick ), f90: float( f90 ), dotVH: float( dotVH ) } ),
				vec3( f0, f0, f0 ), 1e-4, 'Schlick_to_F0 recovers f0 from the classic x^5 Schlick formula it inverts'
			);

		} );

		gpuTest( 'V_GGX_SmithCorrelated() matches the Smith-correlated visibility formula', ( { assert } ) => {

			// Frostbite course notes, page 12, listing 2:
			// gv = dotNL * sqrt(a2 + (1-a2)*dotNV^2)
			// gl = dotNV * sqrt(a2 + (1-a2)*dotNL^2)
			// V = 0.5 / max(gv+gl, EPSILON)
			const alpha = 0.5, dotNL = 0.8, dotNV = 0.6;
			const a2 = alpha * alpha;
			const gv = dotNL * Math.sqrt( a2 + ( 1 - a2 ) * dotNV * dotNV );
			const gl = dotNV * Math.sqrt( a2 + ( 1 - a2 ) * dotNL * dotNL );
			const expected = 0.5 / Math.max( gv + gl, 1e-6 );

			assert.closeAbs( V_GGX_SmithCorrelated( { alpha: float( alpha ), dotNL: float( dotNL ), dotNV: float( dotNV ) } ), float( expected ), 1e-4, 'V_GGX_SmithCorrelated matches the hand-computed formula' );

		} );

		gpuTest( 'V_GGX_SmithCorrelated_Anisotropic() matches its own documented formula', ( { assert } ) => {

			// Filament's anisotropic Smith-correlated visibility term:
			// gv = dotNL * length((alphaT*dotTV, alphaB*dotBV, dotNV))
			// gl = dotNV * length((alphaT*dotTL, alphaB*dotBL, dotNL))
			// V = 0.5 / max(gv+gl, EPSILON)
			//
			// Note this is a genuinely different visibility formulation from
			// V_GGX_SmithCorrelated() above (a vec3-length term, not a
			// sqrt(a2+(1-a2)*x^2) term) -- it does NOT reduce to
			// V_GGX_SmithCorrelated() in the on-axis case (dotTV=dotBV=
			// dotTL=dotBL=0 just simplifies the length() to |dotNV| / |dotNL|
			// directly, giving gv=dotNL*dotNV, not the isotropic gv above),
			// so this is checked directly against its own formula instead of
			// cross-checked against the isotropic function.
			const alphaT = 0.3, alphaB = 0.6, dotTV = 0.2, dotBV = 0.4, dotTL = 0.1, dotBL = 0.3, dotNV = 0.5, dotNL = 0.7;

			const length3 = ( x, y, z ) => Math.sqrt( x * x + y * y + z * z );
			const gv = dotNL * length3( alphaT * dotTV, alphaB * dotBV, dotNV );
			const gl = dotNV * length3( alphaT * dotTL, alphaB * dotBL, dotNL );
			const expected = 0.5 / Math.max( gv + gl, 1e-6 );

			const result = V_GGX_SmithCorrelated_Anisotropic( {
				alphaT: float( alphaT ), alphaB: float( alphaB ),
				dotTV: float( dotTV ), dotBV: float( dotBV ), dotTL: float( dotTL ), dotBL: float( dotBL ),
				dotNV: float( dotNV ), dotNL: float( dotNL )
			} );

			assert.closeAbs( result, float( expected ), 1e-4, 'V_GGX_SmithCorrelated_Anisotropic matches the hand-computed formula' );

		} );

		gpuTest( 'BRDF_Lambert() is diffuseColor / PI', ( { assert } ) => {

			// Punctual-light Lambertian diffuse term -- the function's own
			// source comment: "diffuseColor.mul(1/Math.PI)".
			assert.closeAbs( BRDF_Lambert( { diffuseColor: vec3( 0.8, 0.4, 0.2 ) } ), vec3( 0.8 / Math.PI, 0.4 / Math.PI, 0.2 / Math.PI ), 1e-5, 'BRDF_Lambert(c) == c/PI' );

		} );

	} );

	QUnit.module( 'BRDF_GGX()', () => {

		gpuTest( 'BRDF_GGX() (no iridescence/anisotropy) is F * V * D from its own standalone building blocks', ( { assert } ) => {

			// With USE_IRIDESCENCE/USE_ANISOTROPY both undefined, BRDF_GGX's
			// own source reduces to exactly F_Schlick(...) * V_GGX_SmithCorrelated(...)
			// * D_GGX(...), computed from the same dot products BRDF_GGX
			// derives internally from lightDirection/viewDirection/normalView.
			// normalView and viewDirection are passed explicitly (both
			// parameters BRDF_GGX accepts overrides for) so this doesn't
			// depend on any real scene/camera/material context.
			const normal = vec3( 0, 0, 1 );
			const viewDirection = vec3( 0, 0, 1 );
			const lightDirection = vec3( 0, 0.6, 0.8 ); // already unit length
			const roughness = 0.5;
			const f0 = 0.04, f90 = 1.0;

			// Hand-derive the same dot products BRDF_GGX computes internally
			// (all inputs above are already unit vectors, and view/normal
			// are both +Z, so the half vector is easy to reason about).
			const halfDir = [ 0, 0.6, 1.8 ];
			const halfLen = Math.sqrt( halfDir[ 0 ] ** 2 + halfDir[ 1 ] ** 2 + halfDir[ 2 ] ** 2 );
			const h = halfDir.map( c => c / halfLen );

			const dotNL = Math.min( Math.max( 0 * 0 + 0 * 0.6 + 1 * 0.8, 0 ), 1 );
			const dotNV = Math.min( Math.max( 0 * 0 + 0 * 0 + 1 * 1, 0 ), 1 );
			const dotNH = Math.min( Math.max( h[ 2 ], 0 ), 1 );
			const dotVH = Math.min( Math.max( 0 * h[ 0 ] + 0 * h[ 1 ] + 1 * h[ 2 ], 0 ), 1 );

			const alpha = roughness * roughness;

			const fresnel = Math.pow( 2, dotVH * ( - 5.55473 * dotVH - 6.98316 ) );
			const F = f0 * ( 1 - fresnel ) + f90 * fresnel;

			const a2 = alpha * alpha;
			const gv = dotNL * Math.sqrt( a2 + ( 1 - a2 ) * dotNV * dotNV );
			const gl = dotNV * Math.sqrt( a2 + ( 1 - a2 ) * dotNL * dotNL );
			const V = 0.5 / Math.max( gv + gl, 1e-6 );

			const denom = 1 - dotNH * dotNH * ( 1 - a2 );
			const D = a2 / ( denom * denom ) / Math.PI;

			const expected = F * V * D;

			const result = BRDF_GGX( { lightDirection, f0: float( f0 ), f90: float( f90 ), roughness: float( roughness ), normalView: normal, viewDirection } );

			assert.closeAbs( result, float( expected ), 1e-3, 'BRDF_GGX matches F_Schlick * V_GGX_SmithCorrelated * D_GGX composed independently' );

		} );

	} );

	QUnit.module( 'getDistanceAttenuation()', () => {

		gpuTest( 'getDistanceAttenuation() without a cutoff is the inverse-power falloff', ( { assert } ) => {

			// cutoffDistance <= 0 skips the windowing term entirely:
			// distanceFalloff == 1 / max(lightDistance^decayExponent, 0.01).
			// cutoffDistance is routed through `.toVar()` so it isn't folded
			// into a compile-time constant -- `ternary()` still builds the
			// (untaken) windowed branch too, which divides by cutoffDistance,
			// and WGSL rejects an exact `x / 0.0` constant fold even in a
			// branch that never actually runs (see the sinc() singularity
			// finding in TSLMath.tests.js for the same underlying issue).
			const lightDistance = 4, decayExponent = 2;
			const expected = 1 / Math.max( Math.pow( lightDistance, decayExponent ), 0.01 );

			assert.closeAbs(
				getDistanceAttenuation( { lightDistance: float( lightDistance ), cutoffDistance: float( 0 ).toVar(), decayExponent: float( decayExponent ) } ),
				float( expected ), 1e-4, 'getDistanceAttenuation with no cutoff matches 1/lightDistance^decayExponent'
			);

		} );

		gpuTest( 'getDistanceAttenuation() with a cutoff applies the smooth windowing term', ( { assert } ) => {

			// Frostbite course notes page 32, eq. 26: with cutoffDistance > 0,
			// the falloff above is additionally multiplied by
			// clamp(1 - (lightDistance/cutoffDistance)^4, 0, 1)^2.
			const lightDistance = 4, decayExponent = 2, cutoffDistance = 10;
			const falloff = 1 / Math.max( Math.pow( lightDistance, decayExponent ), 0.01 );
			const window = Math.min( Math.max( 1 - Math.pow( lightDistance / cutoffDistance, 4 ), 0 ), 1 );
			const expected = falloff * window * window;

			assert.closeAbs(
				getDistanceAttenuation( { lightDistance: float( lightDistance ), cutoffDistance: float( cutoffDistance ), decayExponent: float( decayExponent ) } ),
				float( expected ), 1e-4, 'getDistanceAttenuation with a cutoff matches the windowed formula'
			);

			// Beyond the cutoff distance the window clamps to 0, so the
			// attenuation must be exactly 0 regardless of the falloff term.
			assert.closeAbs(
				getDistanceAttenuation( { lightDistance: float( 20 ), cutoffDistance: float( cutoffDistance ), decayExponent: float( decayExponent ) } ),
				float( 0 ), 1e-5, 'getDistanceAttenuation is 0 beyond the cutoff distance'
			);

		} );

	} );

} );
