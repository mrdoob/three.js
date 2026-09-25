import {
	vec3, vec4,
	blendBurn, blendDodge, blendScreen, blendOverlay, blendColor
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Blend-mode function coverage (src/nodes/display/BlendModes.js). Every
// expected value below is the plain closed-form formula for that blend mode,
// hand-evaluated in plain JS/comments -- not derived by re-running the TSL
// expression under test -- see TSLMath.tests.js's file header for why that
// matters (https://ben3d.ca/blog/the-rise-of-test-theater).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'blend mode functions', () => {

		gpuTest( 'blendBurn() darkens base using blend -- min(1, (1-base)/blend), inverted', ( { assert } ) => {

			// A white blend layer (1) leaves the base unchanged: 1-min(1,(1-b)/1) = b.
			assert.closeAbs( blendBurn( vec3( 0.3, 0.6, 0.9 ), vec3( 1, 1, 1 ) ), vec3( 0.3, 0.6, 0.9 ), 1e-4, 'blendBurn() with white blend is a no-op' );

			// General case: burn(b, e) = 1 - min(1, (1-b)/e).
			// base=0.5, blend=0.5 -> 1 - min(1, 0.5/0.5) = 1 - 1 = 0.
			assert.closeAbs( blendBurn( vec3( 0.5 ), vec3( 0.5 ) ), vec3( 0 ), 1e-4, 'blendBurn(0.5, 0.5) == 0' );

			// base=0.8, blend=0.4 -> 1 - min(1, 0.2/0.4) = 1 - 0.5 = 0.5.
			assert.closeAbs( blendBurn( vec3( 0.8 ), vec3( 0.4 ) ), vec3( 0.5 ), 1e-4, 'blendBurn(0.8, 0.4) == 0.5' );

		} );

		gpuTest( 'blendDodge() lightens base using blend -- min(base/(1-blend), 1)', ( { assert } ) => {

			// A black blend layer (0) leaves the base unchanged: min(b/(1-0), 1) = b.
			assert.closeAbs( blendDodge( vec3( 0.3, 0.6, 0.9 ), vec3( 0, 0, 0 ) ), vec3( 0.3, 0.6, 0.9 ), 1e-4, 'blendDodge() with black blend is a no-op' );

			// dodge(b, e) = min(b/(1-e), 1).
			// base=0.5, blend=0.5 -> min(0.5/0.5, 1) = 1.
			assert.closeAbs( blendDodge( vec3( 0.5 ), vec3( 0.5 ) ), vec3( 1 ), 1e-4, 'blendDodge(0.5, 0.5) == 1 (saturates)' );

			// base=0.2, blend=0.5 -> min(0.2/0.5, 1) = 0.4.
			assert.closeAbs( blendDodge( vec3( 0.2 ), vec3( 0.5 ) ), vec3( 0.4 ), 1e-4, 'blendDodge(0.2, 0.5) == 0.4' );

		} );

		gpuTest( 'blendScreen() -- 1 - (1-base)*(1-blend)', ( { assert } ) => {

			// screen(b, e) = 1 - (1-b)(1-e).
			assert.closeAbs( blendScreen( vec3( 0 ), vec3( 0 ) ), vec3( 0 ), 1e-6, 'blendScreen(0, 0) == 0' );
			assert.closeAbs( blendScreen( vec3( 1 ), vec3( 0.5 ) ), vec3( 1 ), 1e-4, 'blendScreen(1, x) == 1 -- white base always stays white' );
			assert.closeAbs( blendScreen( vec3( 0.5 ), vec3( 0.5 ) ), vec3( 1 - 0.5 * 0.5 ), 1e-4, 'blendScreen(0.5, 0.5) == 0.75' );
			assert.closeAbs( blendScreen( vec3( 0.2 ), vec3( 0.6 ) ), vec3( 1 - 0.8 * 0.4 ), 1e-4, 'blendScreen(0.2, 0.6) == 0.68' );

		} );

		gpuTest( 'blendOverlay() -- multiply below 0.5, screen above', ( { assert } ) => {

			// base < 0.5 branch: overlay(b, e) = 2*b*e.
			assert.closeAbs( blendOverlay( vec3( 0.2 ), vec3( 0.5 ) ), vec3( 2 * 0.2 * 0.5 ), 1e-4, 'blendOverlay(0.2, 0.5) uses the multiply branch (base < 0.5)' );

			// base >= 0.5 branch (step(0.5, base) is inclusive of the edge):
			// overlay(b, e) = 1 - 2*(1-b)*(1-e).
			assert.closeAbs( blendOverlay( vec3( 0.5 ), vec3( 0.5 ) ), vec3( 1 - 2 * 0.5 * 0.5 ), 1e-4, 'blendOverlay(0.5, 0.5) is exactly on the branch boundary -- uses the screen branch (step is inclusive)' );
			assert.closeAbs( blendOverlay( vec3( 0.8 ), vec3( 0.6 ) ), vec3( 1 - 2 * 0.2 * 0.4 ), 1e-4, 'blendOverlay(0.8, 0.6) uses the screen branch (base >= 0.5)' );

			// Overlay is continuous at the boundary: both formulas agree at base=0.5
			// only when e cancels out symmetrically, which the 0.5/0.5 case above
			// already exercises directly.

		} );

		gpuTest( 'blendColor() -- standard "over" alpha compositing, non-premultiplied inputs', ( { assert } ) => {

			// Fully opaque blend layer completely replaces the base, regardless
			// of the base's own color or alpha.
			assert.closeAbs(
				blendColor( vec4( 0.2, 0.4, 0.6, 0.5 ), vec4( 1, 0, 0, 1 ) ),
				vec4( 1, 0, 0, 1 ), 1e-4,
				'blendColor() with an opaque blend layer fully replaces the base'
			);

			// Fully transparent blend layer leaves the base fully unchanged.
			assert.closeAbs(
				blendColor( vec4( 0.2, 0.4, 0.6, 0.7 ), vec4( 1, 1, 1, 0 ) ),
				vec4( 0.2, 0.4, 0.6, 0.7 ), 1e-4,
				'blendColor() with a fully transparent blend layer is a no-op'
			);

			// General "over" compositing: outAlpha = eA + bA*(1-eA);
			// outRGB = (e.rgb*eA + b.rgb*bA*(1-eA)) / outAlpha.
			// base = (1,0,0, 0.5), blend = (0,1,0, 0.5)
			// outAlpha = 0.5 + 0.5*0.5 = 0.75
			// outRGB = ((0,1,0)*0.5 + (1,0,0)*0.5*0.5) / 0.75 = ((0.25,0.5,0)) / 0.75
			const outAlpha = 0.75;
			const outR = ( 1 * 0.5 * 0.5 ) / outAlpha; // base.r * base.a * (1-blend.a) / outAlpha
			const outG = ( 1 * 0.5 ) / outAlpha; // blend.g * blend.a / outAlpha
			assert.closeAbs(
				blendColor( vec4( 1, 0, 0, 0.5 ), vec4( 0, 1, 0, 0.5 ) ),
				vec4( outR, outG, 0, outAlpha ), 1e-4,
				'blendColor() general case matches hand-computed "over" compositing'
			);

		} );

	} );

} );
