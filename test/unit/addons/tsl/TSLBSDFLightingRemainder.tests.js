import {
	float, vec2, vec3, mat3,
	directPointLight, getDistanceAttenuation,
	LTC_Evaluate, LTC_Evaluate_Volume, LTC_Uv
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for the remaining, previously-uncovered BSDF/lighting building
// blocks: src/nodes/lighting/PointLightNode.js's `directPointLight`, and the
// LTC (Linearly Transformed Cosines) area-light math in
// src/nodes/functions/BSDF/LTC.js. (getShIrradianceAt() coverage moved to
// TSL.Irradiance.tests.js.) Every expected value below is a plain-JS
// transliteration of each function's own documented formula, computed
// independently -- never by re-running the TSL expression under test.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'directPointLight()', () => {

		gpuTest( 'directPointLight() combines normalize(lightVector) with color * getDistanceAttenuation()', ( { assert } ) => {

			// directPointLight's own source (PointLightNode.js):
			//   lightDirection = normalize(lightVector)
			//   lightColor = color * getDistanceAttenuation(lightDistance, cutoffDistance, decayExponent)
			// where lightDistance = length(lightVector). getDistanceAttenuation's
			// own windowed formula is already independently verified in
			// TSLBRDF.tests.js ("getDistanceAttenuation()" module) -- reused here
			// (not re-derived) purely as the attenuation component of the
			// expected lightColor.
			const attenuation = ( lightDistance, cutoffDistance, decayExponent ) => {

				const falloff = 1 / Math.max( Math.pow( lightDistance, decayExponent ), 0.01 );

				if ( cutoffDistance <= 0 ) return falloff;

				const window = Math.min( Math.max( 1 - Math.pow( lightDistance / cutoffDistance, 4 ), 0 ), 1 );
				return falloff * window * window;

			};

			// General case: lightVector = (3,4,0) -> length 5, well inside the
			// cutoff distance of 10.
			const color = [ 1, 0.5, 0.25 ];
			const lightVector = [ 3, 4, 0 ];
			const lightDistance = Math.sqrt( 3 * 3 + 4 * 4 );
			const cutoffDistance = 10, decayExponent = 2;
			const atten = attenuation( lightDistance, cutoffDistance, decayExponent );

			const result = directPointLight( {
				color: vec3( ...color ),
				lightVector: vec3( ...lightVector ),
				cutoffDistance: float( cutoffDistance ),
				decayExponent: float( decayExponent )
			} );

			assert.closeAbs( result.lightDirection, vec3( 0.6, 0.8, 0 ), 1e-5, 'directPointLight: lightDirection == normalize(lightVector)' );
			assert.closeAbs( result.lightColor, vec3( color[ 0 ] * atten, color[ 1 ] * atten, color[ 2 ] * atten ), 1e-4, 'directPointLight: lightColor == color * getDistanceAttenuation(...)' );

		} );

		gpuTest( 'directPointLight() with no cutoff falls back to the plain inverse-power falloff', ( { assert } ) => {

			// cutoffDistance is routed through `.toVar()` so it isn't folded into
			// a compile-time constant -- see the matching note in
			// TSLBRDF.tests.js's getDistanceAttenuation() coverage for why this
			// matters on WGSL (an untaken `ternary()` branch that divides by a
			// literal 0.0 still gets constant-folded and rejected at compile time).
			const color = [ 1, 1, 1 ];
			const lightVector = [ 0, 0, 5 ];
			const lightDistance = 5, decayExponent = 2;
			const atten = 1 / Math.max( Math.pow( lightDistance, decayExponent ), 0.01 );

			const result = directPointLight( {
				color: vec3( ...color ),
				lightVector: vec3( ...lightVector ),
				cutoffDistance: float( 0 ).toVar(),
				decayExponent: float( decayExponent )
			} );

			assert.closeAbs( result.lightDirection, vec3( 0, 0, 1 ), 1e-5, 'directPointLight: lightDirection == normalize(lightVector) with no cutoff' );
			assert.closeAbs( result.lightColor, vec3( atten, atten, atten ), 1e-4, 'directPointLight: lightColor == color * (1/lightDistance^decayExponent) with no cutoff' );

		} );

		gpuTest( 'directPointLight() beyond the cutoff distance zeroes lightColor but still normalizes lightDirection', ( { assert } ) => {

			// Beyond cutoffDistance, getDistanceAttenuation's windowing term
			// clamps to exactly 0 (see TSLBRDF.tests.js's matching edge-case
			// assertion), so lightColor must be exactly zero regardless of the
			// falloff term -- while lightDirection is entirely independent of
			// attenuation and must still be the plain normalized lightVector.
			const lightVector = [ 0, 20, 0 ]; // length 20, beyond cutoffDistance 10
			const cutoffDistance = 10, decayExponent = 2;

			const result = directPointLight( {
				color: vec3( 1, 1, 1 ),
				lightVector: vec3( ...lightVector ),
				cutoffDistance: float( cutoffDistance ),
				decayExponent: float( decayExponent )
			} );

			assert.closeAbs( result.lightDirection, vec3( 0, 1, 0 ), 1e-5, 'directPointLight: lightDirection is still normalized beyond the cutoff' );
			assert.closeAbs( result.lightColor, vec3( 0, 0, 0 ), 1e-5, 'directPointLight: lightColor is exactly 0 beyond the cutoff distance' );

		} );

		gpuTest( 'directPointLight() cross-check: getDistanceAttenuation() called directly matches the attenuation folded into lightColor', ( { assert } ) => {

			// Sanity cross-check against the already-covered getDistanceAttenuation()
			// (TSLBRDF.tests.js) rather than only a hand-rolled JS copy of its
			// formula: color=(1,1,1), so lightColor must equal
			// getDistanceAttenuation(...) exactly, component-wise.
			const lightVector = [ 6, 8, 0 ]; // length 10
			const cutoffDistance = 15, decayExponent = 1.5;

			const result = directPointLight( {
				color: vec3( 1, 1, 1 ),
				lightVector: vec3( ...lightVector ),
				cutoffDistance: float( cutoffDistance ),
				decayExponent: float( decayExponent )
			} );

			const atten = getDistanceAttenuation( {
				lightDistance: float( 10 ),
				cutoffDistance: float( cutoffDistance ),
				decayExponent: float( decayExponent )
			} );

			assert.closeAbs( result.lightColor, vec3( atten, atten, atten ), 1e-5, 'directPointLight: lightColor with color=(1,1,1) matches getDistanceAttenuation(...) directly' );

		} );

	} );

	QUnit.module( 'LTC area-light math', () => {

		gpuTest( 'LTC_Uv() matches the roughness/dotNV texture parameterization formula', ( { assert } ) => {

			// LTC_Uv's own formula (LTC.js): uv = (roughness, sqrt(1 - saturate(dot(N,V))))
			// * LUT_SCALE + LUT_BIAS, with LUT_SIZE = 64.
			const LUT_SIZE = 64.0;
			const LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
			const LUT_BIAS = 0.5 / LUT_SIZE;

			const expectedUv = ( dotNV, roughness ) => {

				const clamped = Math.min( Math.max( dotNV, 0 ), 1 );
				const u = roughness * LUT_SCALE + LUT_BIAS;
				const v = Math.sqrt( 1 - clamped ) * LUT_SCALE + LUT_BIAS;
				return [ u, v ];

			};

			// General case: N=(0,0,1), V=(0,0.6,0.8) (unit length), dotNV = 0.8.
			const roughness = 0.3;
			const [ u1, v1 ] = expectedUv( 0.8, roughness );

			assert.closeAbs(
				LTC_Uv( { N: vec3( 0, 0, 1 ), V: vec3( 0, 0.6, 0.8 ), roughness: float( roughness ) } ),
				vec2( u1, v1 ), 1e-4, 'LTC_Uv general case matches the hand-computed formula'
			);

			// Edge case: N and V pointing opposite ways -> dot(N,V) = -1,
			// saturated to 0, so v == sqrt(1) * LUT_SCALE + LUT_BIAS exactly.
			const [ u2, v2 ] = expectedUv( - 1, roughness );

			assert.closeAbs(
				LTC_Uv( { N: vec3( 0, 0, 1 ), V: vec3( 0, 0, - 1 ), roughness: float( roughness ) } ),
				vec2( u2, v2 ), 1e-5, 'LTC_Uv saturates a negative dot(N,V) to 0 before the sqrt() term'
			);

		} );

		// --- Shared plain-JS transliterations of LTC_EdgeVectorFormFactor and
		// LTC_ClippedSphereFormFactor (LTC.js), used by both LTC_Evaluate and
		// LTC_Evaluate_Volume below. These are ports of the functions' own
		// documented formulas (a rational-polynomial approximation to
		// theta/sin(theta)/2PI, and Heitz et al.'s horizon-clipped form-factor
		// approximation), not re-runs of the TSL expressions under test.
		const dot3 = ( a, b ) => a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];
		const cross3 = ( a, b ) => [
			a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ],
			a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ],
			a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ]
		];
		const sub3 = ( a, b ) => [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ], a[ 2 ] - b[ 2 ] ];
		const length3 = ( a ) => Math.sqrt( dot3( a, a ) );
		const normalize3 = ( a ) => {

			const l = length3( a );
			return [ a[ 0 ] / l, a[ 1 ] / l, a[ 2 ] / l ];

		};

		const edgeVectorFormFactor = ( v1, v2 ) => {

			const x = dot3( v1, v2 );
			const y = Math.abs( x );

			const a = ( y * 0.0145206 + 0.4965155 ) * y + 0.8543985;
			const b = ( y + 4.1616724 ) * y + 3.4175940;
			const v = a / b;

			const thetaSinTheta = x > 0.0
				? v
				: 0.5 / Math.sqrt( Math.max( 1 - x * x, 1e-7 ) ) - v;

			const c = cross3( v1, v2 );
			return [ c[ 0 ] * thetaSinTheta, c[ 1 ] * thetaSinTheta, c[ 2 ] * thetaSinTheta ];

		};

		const clippedSphereFormFactor = ( f ) => {

			const l = length3( f );
			return Math.max( ( l * l + f[ 2 ] ) / ( l + 1.0 ), 0 );

		};

		const vectorFormFactorSum = ( coords ) => {

			let sum = [ 0, 0, 0 ];

			for ( let i = 0; i < 4; i ++ ) {

				const e = edgeVectorFormFactor( coords[ i ], coords[ ( i + 1 ) % 4 ] );
				sum = [ sum[ 0 ] + e[ 0 ], sum[ 1 ] + e[ 1 ], sum[ 2 ] + e[ 2 ] ];

			}

			return sum;

		};

		gpuTest( 'LTC_Evaluate_Volume() matches the hand-computed horizon-clipped form factor (no basis transform)', ( { assert } ) => {

			// General case: P at the origin, a CCW-wound (as seen from P) square
			// light one unit above it, corners at z=1. LTC_Evaluate_Volume has
			// no N/V/mInv dependence at all -- it projects (p_i - P) straight
			// onto the unit sphere, so this is checkable purely from p0..p3 and P.
			const P = [ 0, 0, 0 ];
			const p0 = [ - 1, - 1, 1 ], p1 = [ - 1, 1, 1 ], p2 = [ 1, 1, 1 ], p3 = [ 1, - 1, 1 ];

			// front-side check: lightNormal = cross(p1-p0, p3-p0); must have
			// dot(lightNormal, P-p0) >= 0 for the light to contribute at all.
			const lightNormal = cross3( sub3( p1, p0 ), sub3( p3, p0 ) );
			if ( dot3( lightNormal, sub3( P, p0 ) ) < 0 ) throw new Error( 'test setup error: P is on the back side of the light plane' );

			const coords = [ p0, p1, p2, p3 ].map( ( p ) => normalize3( sub3( p, P ) ) );
			const vff = vectorFormFactorSum( coords ).map( Math.abs ); // LTC_Evaluate_Volume takes abs() of the summed form factor
			const expected = clippedSphereFormFactor( vff );

			const result = LTC_Evaluate_Volume( {
				P: vec3( ...P ),
				p0: vec3( ...p0 ), p1: vec3( ...p1 ), p2: vec3( ...p2 ), p3: vec3( ...p3 )
			} );

			assert.closeAbs( result, vec3( expected, expected, expected ), 1e-4, 'LTC_Evaluate_Volume matches the hand-computed form factor' );

		} );

		gpuTest( 'LTC_Evaluate_Volume() is exactly zero when P is behind the light plane', ( { assert } ) => {

			// Same light quad as the general case above, but P moved to the
			// side where dot(lightNormal, P - p0) < 0 -- the function's own
			// `If` guard means the result vector (initialized to vec3(0)) is
			// never written in that case, so it must read back as exactly 0.
			const P = [ 0, 0, 10 ];
			const p0 = [ - 1, - 1, 1 ], p1 = [ - 1, 1, 1 ], p2 = [ 1, 1, 1 ], p3 = [ 1, - 1, 1 ];

			const lightNormal = cross3( sub3( p1, p0 ), sub3( p3, p0 ) );
			if ( dot3( lightNormal, sub3( P, p0 ) ) >= 0 ) throw new Error( 'test setup error: P is not actually on the back side of the light plane' );

			const result = LTC_Evaluate_Volume( {
				P: vec3( ...P ),
				p0: vec3( ...p0 ), p1: vec3( ...p1 ), p2: vec3( ...p2 ), p3: vec3( ...p3 )
			} );

			assert.closeAbs( result, vec3( 0, 0, 0 ), 1e-6, 'LTC_Evaluate_Volume is 0 when P is behind the light plane' );

		} );

		gpuTest( 'LTC_Evaluate() with an identity mInv matches the hand-computed form factor in the T1/T2/N orthonormal-basis frame', ( { assert } ) => {

			// With mInv == identity, LTC_Evaluate's `mat` (LTC.js) reduces to
			// exactly transpose(mat3(T1, T2, N)) -- and since the 3-Node-argument
			// mat3(...) constructor is COLUMN-major (see tsl-unit-test-findings.md's
			// "mat3(vec3,vec3,vec3) is COLUMN-major" entry: mat3(T1,T2,N) has
			// columns T1,T2,N), its transpose has ROWS T1,T2,N. So
			// mat.mul(v) == (dot(T1,v), dot(T2,v), dot(N,v)) -- i.e. v expressed
			// in the T1/T2/N orthonormal frame. That's independently verifiable
			// from LTC_Evaluate's own T1/T2 construction:
			//   T1 = normalize(V - N*dot(V,N))
			//   T2 = -cross(N, T1)
			// which is hand-derived below for a concrete N/V pair, rather than
			// assumed.
			const N = [ 0, 0, 1 ];
			const V = [ 0, 1 / Math.sqrt( 2 ), 1 / Math.sqrt( 2 ) ]; // already unit length

			const dotVN = dot3( V, N );
			const T1 = normalize3( sub3( V, [ N[ 0 ] * dotVN, N[ 1 ] * dotVN, N[ 2 ] * dotVN ] ) );
			const T2raw = cross3( N, T1 );
			const T2 = [ - T2raw[ 0 ], - T2raw[ 1 ], - T2raw[ 2 ] ];

			// Confirms the closed-form basis this concrete N/V pair produces
			// (T1=(0,1,0), T2=(1,0,0), N=(0,0,1)) -- a cross-check on the
			// hand-derivation above before it's used to build `expected` below.
			assert.closeAbs( vec3( ...T1 ), vec3( 0, 1, 0 ), 1e-6, 'sanity check: T1 for this N/V pair is (0,1,0)' );
			assert.closeAbs( vec3( ...T2 ), vec3( 1, 0, 0 ), 1e-6, 'sanity check: T2 for this N/V pair is (1,0,0)' );

			const toLocal = ( v ) => [ dot3( T1, v ), dot3( T2, v ), dot3( N, v ) ];

			const P = [ 0, 0, 0 ];
			// CCW-wound (as seen from P) square light at z=2.
			const p0 = [ - 1, - 1, 2 ], p1 = [ - 1, 1, 2 ], p2 = [ 1, 1, 2 ], p3 = [ 1, - 1, 2 ];

			const lightNormal = cross3( sub3( p1, p0 ), sub3( p3, p0 ) );
			if ( dot3( lightNormal, sub3( P, p0 ) ) < 0 ) throw new Error( 'test setup error: P is on the back side of the light plane' );

			const coords = [ p0, p1, p2, p3 ].map( ( p ) => normalize3( toLocal( sub3( p, P ) ) ) );
			const vff = vectorFormFactorSum( coords );
			const expected = clippedSphereFormFactor( vff );

			const identity = mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );

			const result = LTC_Evaluate( {
				N: vec3( ...N ), V: vec3( ...V ), P: vec3( ...P ), mInv: identity,
				p0: vec3( ...p0 ), p1: vec3( ...p1 ), p2: vec3( ...p2 ), p3: vec3( ...p3 )
			} );

			assert.closeAbs( result, vec3( expected, expected, expected ), 1e-4, 'LTC_Evaluate (identity mInv) matches the hand-computed T1/T2/N-frame form factor' );

		} );

		gpuTest( 'LTC_Evaluate() is exactly zero when P is behind the light plane', ( { assert } ) => {

			// Same N/V/mInv/light quad as the case directly above, but P moved
			// to the back side -- must read back as exactly vec3(0) regardless
			// of the basis-transform math, since the `If` guard skips the whole
			// computation and `result` starts at vec3(0).
			const N = [ 0, 0, 1 ];
			const V = [ 0, 1 / Math.sqrt( 2 ), 1 / Math.sqrt( 2 ) ];
			const P = [ 0, 0, 10 ];
			const p0 = [ - 1, - 1, 2 ], p1 = [ - 1, 1, 2 ], p2 = [ 1, 1, 2 ], p3 = [ 1, - 1, 2 ];

			const lightNormal = cross3( sub3( p1, p0 ), sub3( p3, p0 ) );
			if ( dot3( lightNormal, sub3( P, p0 ) ) >= 0 ) throw new Error( 'test setup error: P is not actually on the back side of the light plane' );

			const identity = mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );

			const result = LTC_Evaluate( {
				N: vec3( ...N ), V: vec3( ...V ), P: vec3( ...P ), mInv: identity,
				p0: vec3( ...p0 ), p1: vec3( ...p1 ), p2: vec3( ...p2 ), p3: vec3( ...p3 )
			} );

			assert.closeAbs( result, vec3( 0, 0, 0 ), 1e-6, 'LTC_Evaluate is 0 when P is behind the light plane' );

		} );

		gpuTest( 'LTC_Evaluate() and LTC_Evaluate_Volume() both produce correct, independent results when called in the SAME shader', ( { assert } ) => {

			// Regression test for a real source bug this coverage pass found
			// and fixed: LTC_Evaluate_Volume's setLayout() named its generated
			// shader function 'LTC_Evaluate' (a copy/paste leftover from
			// LTC_Evaluate's own layout, just above it in LTC.js) instead of
			// 'LTC_Evaluate_Volume'. Each is otherwise a distinct, separately-
			// cached FunctionNode (keyed by JS object identity, not by that
			// name), so the collision was invisible as long as the two
			// functions were never both included in one compiled shader -- true
			// today (LTC_Evaluate is only reachable from PhysicalLightingModel.js,
			// LTC_Evaluate_Volume only from VolumetricLightingModel.js, always
			// compiled into separate shader programs) but not guaranteed by
			// anything in the node graph itself, and exactly the kind of thing a
			// future material combining both lighting models would hit as a
			// hard WGSL "duplicate function definition" compile error (GLSL:
			// same idea, second definition silently shadows/redefines the
			// first). This test forces both into the very same buildFn (and
			// therefore the very same compiled kernel) specifically to catch
			// that: with the fix, both compile and produce their own correct,
			// independent results in this one shader.
			const P = [ 0, 0, 0 ];
			const p0 = [ - 1, - 1, 1 ], p1 = [ - 1, 1, 1 ], p2 = [ 1, 1, 1 ], p3 = [ 1, - 1, 1 ];

			const coordsVolume = [ p0, p1, p2, p3 ].map( ( p ) => normalize3( sub3( p, P ) ) );
			const expectedVolume = clippedSphereFormFactor( vectorFormFactorSum( coordsVolume ).map( Math.abs ) );

			const N = [ 0, 0, 1 ];
			const V = [ 0, 1 / Math.sqrt( 2 ), 1 / Math.sqrt( 2 ) ];
			const p0e = [ - 1, - 1, 2 ], p1e = [ - 1, 1, 2 ], p2e = [ 1, 1, 2 ], p3e = [ 1, - 1, 2 ];
			const toLocal = ( v ) => [ v[ 1 ], v[ 0 ], v[ 2 ] ]; // (dot(T1,v), dot(T2,v), dot(N,v)) for this N/V pair -- see the identity-mInv test above
			const coordsEvaluate = [ p0e, p1e, p2e, p3e ].map( ( p ) => normalize3( toLocal( sub3( p, P ) ) ) );
			const expectedEvaluate = clippedSphereFormFactor( vectorFormFactorSum( coordsEvaluate ) );

			const identity = mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );

			const volumeResult = LTC_Evaluate_Volume( {
				P: vec3( ...P ),
				p0: vec3( ...p0 ), p1: vec3( ...p1 ), p2: vec3( ...p2 ), p3: vec3( ...p3 )
			} );

			const evaluateResult = LTC_Evaluate( {
				N: vec3( ...N ), V: vec3( ...V ), P: vec3( ...P ), mInv: identity,
				p0: vec3( ...p0e ), p1: vec3( ...p1e ), p2: vec3( ...p2e ), p3: vec3( ...p3e )
			} );

			assert.closeAbs( volumeResult, vec3( expectedVolume, expectedVolume, expectedVolume ), 1e-4, 'LTC_Evaluate_Volume() still matches its own formula when compiled alongside LTC_Evaluate() in the same shader' );
			assert.closeAbs( evaluateResult, vec3( expectedEvaluate, expectedEvaluate, expectedEvaluate ), 1e-4, 'LTC_Evaluate() still matches its own formula when compiled alongside LTC_Evaluate_Volume() in the same shader' );

		} );

	} );

} );
