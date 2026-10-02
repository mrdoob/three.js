import {
	float, vec3, vec4,
	vibrance, cdl
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Additional color-adjustment coverage that doesn't already live in
// TSLConversion.tests.js: vibrance() and cdl() (grayscale/saturation/hue/
// luminance/posterize are covered there). Kept as a separate file to avoid
// colliding with other in-flight edits to that file, matching the existing
// TSLMathExtra.tests.js convention.
//
// Every expected value below is derived independently (hand-computed from
// the documented formula), never by re-running the same TSL expression
// under test -- see TSLMath.tests.js's file header for why that matters
// (https://ben3d.ca/blog/the-rise-of-test-theater).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'color adjustment (extra)', () => {

		gpuTest( 'vibrance() pushes less-saturated channels toward the max channel', ( { assert } ) => {

			// adjustment=0 is a no-op (amt = (mx-avg)*0*(-3) = 0, so
			// mix(color, mx, 0) == color).
			assert.closeAbs( vibrance( vec3( 0.2, 0.5, 0.8 ), float( 0 ) ), vec3( 0.2, 0.5, 0.8 ), 1e-5, 'vibrance(x, 0) is a no-op' );

			// General case, hand-computed from the documented formula:
			//   average = (r+g+b)/3
			//   mx = max(r,g,b)
			//   amt = (mx - average) * adjustment * -3
			//   result = mix(color, mx, amt).max(0)
			// color=(0.2,0.5,0.8), adjustment=0.5:
			//   average = 0.5, mx = 0.8, amt = (0.8-0.5)*0.5*-3 = -0.45
			//   result = color*(1-amt) + mx*amt = color*1.45 - 0.36
			//          = (0.29-0.36, 0.725-0.36, 1.16-0.36) = (-0.07, 0.365, 0.8)
			//   clamped to >= 0 -> (0, 0.365, 0.8)
			assert.closeAbs( vibrance( vec3( 0.2, 0.5, 0.8 ), float( 0.5 ) ), vec3( 0, 0.365, 0.8 ), 1e-4, 'vibrance(x, 0.5) matches the hand-computed formula, clamped at 0' );

			// The max channel itself is always left unchanged by construction
			// (mix(mx, mx, amt) == mx for any amt), independent of adjustment.
			assert.closeAbs( vibrance( vec3( 0.2, 0.5, 0.8 ), float( 2 ) ).b, float( 0.8 ), 1e-4, 'vibrance() never changes the already-maximal channel' );

		} );

		gpuTest( 'cdl() applies slope/offset/power then saturation, in log-like space', ( { assert } ) => {

			const lumCoeff = vec3( 0.2126, 0.7152, 0.0722 ); // Rec. 709, matching cdl()'s own default

			// Identity parameters (slope=1, offset=0, power=1, saturation=1)
			// leave a positive-valued color unchanged.
			assert.closeAbs(
				cdl( vec4( 0.2, 0.5, 0.8, 1 ), vec3( 1 ), vec3( 0 ), vec3( 1 ), float( 1 ), lumCoeff ),
				vec4( 0.2, 0.5, 0.8, 1 ), 1e-4,
				'cdl() with identity parameters is a no-op'
			);

			// slope=2 alone (power=1, saturation=1): v = max(color*2, 0), then
			// the saturation step is also an identity at saturation=1, so the
			// result is simply color*2.
			assert.closeAbs(
				cdl( vec4( 0.1, 0.2, 0.3, 1 ), vec3( 2 ), vec3( 0 ), vec3( 1 ), float( 1 ), lumCoeff ),
				vec4( 0.2, 0.4, 0.6, 1 ), 1e-4,
				'cdl() slope=2 doubles the color when power/saturation are identity'
			);

			// General case with saturation != 1, hand-computed from the
			// documented formula:
			//   luma = dot(color.rgb, lumCoeff)
			//   v = max(color*slope + offset, 0); v = pow(v, power) where v > 0
			//   v = max(luma + (v - luma)*saturation, 0)
			// color=(0.2,0.5,0.8), slope=1, offset=0, power=1, saturation=2:
			//   luma = 0.2*0.2126 + 0.5*0.7152 + 0.8*0.0722
			//        = 0.04252 + 0.3576 + 0.05776 = 0.45788
			//   v (post slope/offset/power=1) = (0.2, 0.5, 0.8) unchanged
			//   v = luma + (v - luma)*2 = 2v - luma
			//     = (0.4-0.45788, 1-0.45788, 1.6-0.45788)
			//     = (-0.05788, 0.54212, 1.14212) -> clamp -> (0, 0.54212, 1.14212)
			const luma = 0.2 * 0.2126 + 0.5 * 0.7152 + 0.8 * 0.0722;
			const expected = vec3( Math.max( 2 * 0.2 - luma, 0 ), 2 * 0.5 - luma, 2 * 0.8 - luma );
			assert.closeAbs(
				cdl( vec4( 0.2, 0.5, 0.8, 1 ), vec3( 1 ), vec3( 0 ), vec3( 1 ), float( 2 ), lumCoeff ),
				vec4( expected, 1 ), 1e-4,
				'cdl() saturation=2 matches the hand-computed luma-relative scaling'
			);

			// alpha passes through unchanged, independent of every other parameter.
			assert.closeAbs(
				cdl( vec4( 0.2, 0.5, 0.8, 0.37 ), vec3( 3 ), vec3( 0.1 ), vec3( 1.5 ), float( 0.5 ), lumCoeff ).a,
				float( 0.37 ), 1e-6,
				'cdl() passes the alpha channel through unchanged'
			);

		} );

	} );

} );
