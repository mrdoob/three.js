import {
	float, vec2, vec4,
	premultiplyAlpha, unpremultiplyAlpha,
	rotateUV, spherizeUV, checker
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Standalone utility-function coverage: alpha premultiplication
// (src/nodes/display/PremultiplyAlphaFunctions.js), UV transforms
// (src/nodes/utils/UVUtils.js), and the procedural checkerboard
// (src/nodes/procedural/Checker.js). Every expected value below is derived
// independently (hand-computed from the documented formula), never by
// re-running the same TSL expression under test -- see TSLMath.tests.js's
// file header for why that matters
// (https://ben3d.ca/blog/the-rise-of-test-theater).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'alpha premultiplication', () => {

		gpuTest( 'premultiplyAlpha() scales RGB by alpha, leaves alpha unchanged', ( { assert } ) => {

			assert.closeAbs( premultiplyAlpha( vec4( 1, 0.5, 0.2, 0.5 ) ), vec4( 0.5, 0.25, 0.1, 0.5 ), 1e-5, 'premultiplyAlpha() scales rgb by a=0.5' );
			assert.closeAbs( premultiplyAlpha( vec4( 0.4, 0.8, 1, 1 ) ), vec4( 0.4, 0.8, 1, 1 ), 1e-5, 'premultiplyAlpha() with a=1 is a no-op' );
			assert.closeAbs( premultiplyAlpha( vec4( 1, 1, 1, 0 ) ), vec4( 0, 0, 0, 0 ), 1e-5, 'premultiplyAlpha() with a=0 zeroes rgb entirely' );

		} );

		gpuTest( 'unpremultiplyAlpha() divides RGB by alpha, and special-cases a=0 to avoid a NaN from 0/0', ( { assert } ) => {

			assert.closeAbs( unpremultiplyAlpha( vec4( 0.5, 0.25, 0.1, 0.5 ) ), vec4( 1, 0.5, 0.2, 0.5 ), 1e-5, 'unpremultiplyAlpha() divides rgb by a=0.5 -- inverse of the premultiplyAlpha() case above' );
			assert.closeAbs( unpremultiplyAlpha( vec4( 0.4, 0.8, 1, 1 ) ), vec4( 0.4, 0.8, 1, 1 ), 1e-5, 'unpremultiplyAlpha() with a=1 is a no-op' );

			// a==0 takes the explicit select() branch returning vec4(0) outright,
			// rather than evaluating rgb/0 (which would be NaN/Inf on a GPU,
			// same IEEE-754 hazard the sinc()/pcurve() findings in
			// tsl-unit-test-findings.md ran into for other functions).
			assert.closeAbs( unpremultiplyAlpha( vec4( 0.3, 0.6, 0.9, 0 ) ), vec4( 0, 0, 0, 0 ), 1e-5, 'unpremultiplyAlpha() with a=0 returns vec4(0) instead of dividing by zero' );

		} );

		gpuTest( 'premultiplyAlpha()/unpremultiplyAlpha() round-trip for non-zero alpha', ( { assert } ) => {

			const original = vec4( 0.7, 0.3, 0.9, 0.42 );
			assert.closeAbs( unpremultiplyAlpha( premultiplyAlpha( original ) ), original, 1e-4, 'unpremultiplyAlpha(premultiplyAlpha(x)) == x for a != 0' );

		} );

	} );

	QUnit.module( 'UV transforms', () => {

		gpuTest( 'rotateUV() rotates counter-clockwise about a center point, matching rotate()\'s own documented convention', ( { assert } ) => {

			// rotateUV(uv, angle, center) == rotate(uv - center, angle) + center.
			// rotate() itself is independently verified (and its correct CCW
			// convention documented) in TSLCurveUtils.tests.js -- this only
			// checks that rotateUV() correctly re-centers around a non-origin
			// point, using the same CCW convention.
			// uv=(1.5, 1) about center=(0.5, 1) -> offset (1, 0), rotated 90°
			// CCW -> (0, 1), + center -> (0.5, 2).
			assert.closeAbs( rotateUV( vec2( 1.5, 1 ), float( Math.PI / 2 ), vec2( 0.5, 1 ) ), vec2( 0.5, 2 ), 1e-4, 'rotateUV() by 90° CCW about a non-origin center' );

			// The center point itself is always a fixed point of the rotation.
			assert.closeAbs( rotateUV( vec2( 0.5, 0.5 ), float( 1.234 ), vec2( 0.5, 0.5 ) ), vec2( 0.5, 0.5 ), 1e-4, 'rotateUV() leaves the center point itself unchanged, for any angle' );

			// Default center is (0.5, 0.5) when omitted.
			assert.closeAbs( rotateUV( vec2( 1, 0.5 ), float( Math.PI ) ), vec2( 0, 0.5 ), 1e-4, 'rotateUV() defaults center to (0.5, 0.5) -- 180° about it maps (1,0.5) to (0,0.5)' );

		} );

		gpuTest( 'spherizeUV() warps uv by an amount that grows with distance^4 from the center', ( { assert } ) => {

			// spherizeUV(uv, strength, center) == uv + delta * (dot(delta,delta)^2 * strength),
			// where delta = uv - center.
			// uv=(0.6, 0.5), center=(0.5, 0.5), strength=2:
			//   delta = (0.1, 0), delta2 = 0.01, delta4 = 0.0001,
			//   deltaOffset = 0.0001 * 2 = 0.0002
			//   result = (0.6 + 0.1*0.0002, 0.5 + 0*0.0002) = (0.60002, 0.5)
			assert.closeAbs( spherizeUV( vec2( 0.6, 0.5 ), float( 2 ), vec2( 0.5, 0.5 ) ), vec2( 0.60002, 0.5 ), 1e-6, 'spherizeUV() matches the hand-computed delta^4 warp formula' );

			// The center point is a fixed point (delta == 0 -> no offset at all).
			assert.closeAbs( spherizeUV( vec2( 0.5, 0.5 ), float( 5 ), vec2( 0.5, 0.5 ) ), vec2( 0.5, 0.5 ), 1e-6, 'spherizeUV() leaves the center point unchanged' );

			// strength=0 is a no-op everywhere, regardless of distance from center.
			assert.closeAbs( spherizeUV( vec2( 0.9, 0.9 ), float( 0 ), vec2( 0.5, 0.5 ) ), vec2( 0.9, 0.9 ), 1e-6, 'spherizeUV() with strength=0 is a no-op' );

		} );

	} );

	QUnit.module( 'procedural functions', () => {

		gpuTest( 'checker() produces a 2x2-per-unit checkerboard, GLSL-style mod() for negative coordinates included', ( { assert } ) => {

			// checker(coord) == sign(mod(floor(2*coord.x) + floor(2*coord.y), 2)),
			// where mod() is GLSL-style (result always in [0, 2), even for
			// negative inputs -- unlike JS's `%`, which can return negative).
			assert.eq( checker( vec2( 0, 0 ) ), float( 0 ), 'checker(0,0): uv=(0,0), cx=0, cy=0, sum=0 -> 0' );
			assert.eq( checker( vec2( 0.5, 0 ) ), float( 1 ), 'checker(0.5,0): uv=(1,0), cx=1, cy=0, sum=1 -> 1' );
			assert.eq( checker( vec2( 0.5, 0.5 ) ), float( 0 ), 'checker(0.5,0.5): uv=(1,1), cx=1, cy=1, sum=2, mod(2,2)=0 -> 0' );
			assert.eq( checker( vec2( 0.75, 0.25 ) ), float( 1 ), 'checker(0.75,0.25): uv=(1.5,0.5), cx=1, cy=0, sum=1 -> 1' );

			// GLSL-style mod() always returns a non-negative result (unlike
			// JS's `%`, which can go negative) -- checked explicitly with
			// coordinates below the origin, since this is exactly the kind of
			// edge case a naive JS-`%`-based port would get wrong.
			assert.eq( checker( vec2( - 0.25, 0 ) ), float( 1 ), 'checker(-0.25,0): uv=(-0.5,0), cx=-1, cy=0, sum=-1, GLSL mod(-1,2)=1 -> 1' );
			assert.eq( checker( vec2( - 0.75, 0 ) ), float( 0 ), 'checker(-0.75,0): uv=(-1.5,0), cx=-2, cy=0, sum=-2, GLSL mod(-2,2)=0 -> 0' );

			// Default coord parameter is uv() when omitted -- not exercised
			// numerically here (it depends on the current render/compute
			// context's own UV attribute), but the explicit-coord form above
			// covers checker()'s actual math in full.

		} );

	} );

} );
