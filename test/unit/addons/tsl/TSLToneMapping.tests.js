import {
	float, vec3,
	linearToneMapping, reinhardToneMapping, cineonToneMapping,
	acesFilmicToneMapping, agxToneMapping, neutralToneMapping
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Tone-mapping function coverage (src/nodes/display/ToneMappingFunctions.js).
// Every expected value below is derived independently -- either a
// hand-checkable closed form (linear/reinhard/cineon), or a from-scratch
// plain-JS port of the *documented* algorithm (ACESFilmic/AgX/Neutral,
// which involve 3x3 matrices and several stages), computed with Node's own
// `Math`, never by re-running the TSL expression under test -- see
// TSLMath.tests.js's file header for why that matters
// (https://ben3d.ca/blog/the-rise-of-test-theater). Numeric expectations for
// the three multi-stage operators were produced once via an independent JS
// port kept out of this file (not shipped, not imported) and hardcoded here.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'tone mapping functions', () => {

		gpuTest( 'linearToneMapping() -- color * exposure, clamped to [0,1]', ( { assert } ) => {

			assert.closeAbs( linearToneMapping( vec3( 0.5, 1.5, - 0.2 ), float( 2 ) ), vec3( 1, 1, 0 ), 1e-5, 'linearToneMapping((0.5,1.5,-0.2), 2) clamps both above 1 and below 0' );
			assert.closeAbs( linearToneMapping( vec3( 0.25 ), float( 2 ) ), vec3( 0.5 ), 1e-5, 'linearToneMapping(0.25, 2) == 0.5 -- within range, no clamping' );

		} );

		gpuTest( 'reinhardToneMapping() -- color / (color + 1)', ( { assert } ) => {

			assert.closeAbs( reinhardToneMapping( vec3( 3 ), float( 1 ) ), vec3( 0.75 ), 1e-5, 'reinhardToneMapping(3, 1) == 3/4 == 0.75' );
			assert.closeAbs( reinhardToneMapping( vec3( 0 ), float( 1 ) ), vec3( 0 ), 1e-6, 'reinhardToneMapping(0, 1) == 0' );
			assert.closeAbs( reinhardToneMapping( vec3( 1 ), float( 0 ) ), vec3( 0 ), 1e-6, 'reinhardToneMapping(x, 0) == 0 -- zero exposure crushes everything to black' );

		} );

		gpuTest( 'cineonToneMapping() -- Hejl/Burgess-Dawson filmic curve', ( { assert } ) => {

			// Below the 0.004 toe threshold, max(color-0.004, 0) clamps to
			// exactly 0, and a==0 -> a/b==0 -> pow(0, 2.2)==0, regardless of b.
			assert.closeAbs( cineonToneMapping( vec3( 0.004 ), float( 1 ) ), vec3( 0 ), 1e-6, 'cineonToneMapping(0.004, 1) == 0 -- exactly at the toe threshold' );
			assert.closeAbs( cineonToneMapping( vec3( 0 ), float( 1 ) ), vec3( 0 ), 1e-6, 'cineonToneMapping(0, 1) == 0' );

			// color=0.204 was chosen so color-0.004 == 0.2 exactly, keeping the
			// hand/JS-computed reference simple: a = 0.348, b = 0.648,
			// a/b = 29/54, result = (29/54)^2.2.
			assert.closeAbs( cineonToneMapping( vec3( 0.204 ), float( 1 ) ), vec3( 0.254688 ), 2e-4, 'cineonToneMapping(0.204, 1) matches the independently-computed filmic curve' );
			assert.closeAbs( cineonToneMapping( vec3( 1 ), float( 1 ) ), vec3( 0.683542 ), 2e-4, 'cineonToneMapping(1, 1) matches the independently-computed filmic curve' );

		} );

		gpuTest( 'acesFilmicToneMapping() matches an independent JS port of the ACES RRT+ODT fit', ( { assert } ) => {

			// A uniform gray input is a specifically useful check here: both
			// ACESInputMat and ACESOutputMat have rows that each sum to (very
			// nearly) 1.0 -- a genuine property of these published matrices,
			// not an artifact of the code under test -- so a uniform vec3
			// passes through both matrix multiplications completely unchanged,
			// isolating the nonlinear RRTAndODTFit curve as the only thing
			// actually being exercised by this particular assertion.
			assert.closeAbs( acesFilmicToneMapping( vec3( 0.18 ), float( 1 ) ), vec3( 0.214097 ), 5e-4, 'acesFilmicToneMapping(0.18 gray, 1) matches the independent JS port' );
			assert.closeAbs( acesFilmicToneMapping( vec3( 0 ), float( 1 ) ), vec3( 0 ), 1e-4, 'acesFilmicToneMapping(0, 1) == 0' );
			assert.closeAbs( acesFilmicToneMapping( vec3( 1 ), float( 1 ) ), vec3( 0.765833 ), 5e-4, 'acesFilmicToneMapping(1 gray, 1) matches the independent JS port -- white does not clip to 1' );

			// Zero exposure crushes everything to black regardless of input color.
			assert.closeAbs( acesFilmicToneMapping( vec3( 0.5, 0.8, 0.2 ), float( 0 ) ), vec3( 0 ), 1e-4, 'acesFilmicToneMapping(x, 0) == 0' );

		} );

		gpuTest( 'agxToneMapping() matches an independent JS port of the AgX algorithm', ( { assert } ) => {

			// Every 3x3 matrix in this pipeline (LINEAR_SRGB_TO_LINEAR_REC2020,
			// AgXInsetMatrix, AgXOutsetMatrix, LINEAR_REC2020_TO_LINEAR_SRGB)
			// has rows that each sum to (very nearly) 1.0 -- verified directly
			// from the published constants, independent of this file -- and
			// every other step in the pipeline (log2, clamp, the contrast
			// polynomial, pow) is applied elementwise. So a perfectly uniform
			// gray input must come out perfectly uniform too (a matrix with
			// row-sum 1 maps a uniform vector to itself; an elementwise
			// function trivially preserves uniformity) -- confirmed below, and
			// a real, useful sanity check independent of the exact numeric
			// values also being asserted.
			assert.closeAbs( agxToneMapping( vec3( 0.18 ), float( 1 ) ), vec3( 0.214549, 0.214502, 0.214499 ), 1e-4, 'agxToneMapping(0.18 gray, 1) matches the independent JS port and stays uniform for a uniform input' );
			assert.closeAbs( agxToneMapping( vec3( 0 ), float( 1 ) ), vec3( 0 ), 1e-4, 'agxToneMapping(0, 1) == 0' );
			assert.closeAbs( agxToneMapping( vec3( 1 ), float( 1 ) ), vec3( 0.590229, 0.590136, 0.590102 ), 1e-4, 'agxToneMapping(1 gray, 1) matches the independent JS port and stays (nearly) uniform' );
			assert.closeAbs( agxToneMapping( vec3( 0.5, 0.2, 0.1 ), float( 1 ) ), vec3( 0.441477, 0.236864, 0.150757 ), 1e-4, 'agxToneMapping(asymmetric color, 1) matches the independent JS port' );

		} );

		// neutralToneMapping() is split into three separate gpuTest() calls
		// (one assertion each), unlike this file's other tone-mapping tests --
		// see the "neutralToneMapping() multi-call" finding in
		// tsl-unit-test-findings.md for why calling it more than once inside a
		// single gpuTest's shared kernel throws a harness-side error.

		gpuTest( 'neutralToneMapping() leaves low-intensity colors past the desaturation offset unchanged (flat offset branch)', ( { assert } ) => {

			// x = min(r,g,b) = 0.1, not below the 0.08 inner-threshold, so the
			// desaturation offset is the flat 0.04 branch: color - 0.04. The
			// resulting peak (0.26) is below StartCompression (0.76), so the
			// function's `If(peak < StartCompression) return color` fires and
			// no highlight compression is applied -- this exercises TSL's
			// real early-return-from-If semantics (used pervasively elsewhere
			// in this codebase, e.g. PhysicalLightingModel.js/MaterialXNoise.js).
			assert.closeAbs( neutralToneMapping( vec3( 0.1, 0.2, 0.3 ), float( 1 ) ), vec3( 0.06, 0.16, 0.26 ), 1e-4, 'neutralToneMapping((0.1,0.2,0.3), 1) applies only the flat 0.04 desaturation offset' );

		} );

		gpuTest( 'neutralToneMapping() leaves low-intensity colors past the desaturation offset unchanged (quadratic offset branch)', ( { assert } ) => {

			// x = min(r,g,b) = 0.05, below the 0.08 inner-threshold, so the
			// offset uses the quadratic branch: x - 6.25*x^2 = 0.05 - 0.015625
			// = 0.034375. Peak is still below StartCompression here too.
			assert.closeAbs( neutralToneMapping( vec3( 0.05, 0.5, 0.5 ), float( 1 ) ), vec3( 0.015625, 0.465625, 0.465625 ), 1e-4, 'neutralToneMapping((0.05,0.5,0.5), 1) applies the quadratic low-end desaturation offset' );

		} );

		gpuTest( 'neutralToneMapping() compresses highlights above the desaturation offset', ( { assert } ) => {

			// A bright, non-uniform color whose peak (0.96, after the flat 0.04
			// offset) exceeds StartCompression (0.76): both the highlight
			// rolloff (newPeak) and the desaturating mix() toward it are
			// exercised -- matched against an independent JS port.
			assert.closeAbs( neutralToneMapping( vec3( 1, 0.9, 0.5 ), float( 1 ) ), vec3( 0.869091, 0.779779, 0.422529 ), 1e-4, 'neutralToneMapping((1,0.9,0.5), 1) matches the independent JS port of the highlight-compression branch' );

		} );

	} );

} );
