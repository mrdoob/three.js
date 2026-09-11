import {
	float, vec3,
	grayscale, saturation, hue, luminance, posterize,
	remap, remapClamp,
	viewZToPerspectiveDepth, perspectiveDepthToViewZ,
	viewZToOrthographicDepth, orthographicDepthToViewZ,
	viewZToLogarithmicDepth
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Rec. 709 luminance coefficients, passed explicitly to every luminance()
// call below rather than relying on the default (which reads
// ColorManagement's *current* working color space -- a global that other
// tests/renderers could mutate). Using an explicit, known coefficient set
// keeps these tests' expected values independently hand-computable.
const REC709 = vec3( 0.2126, 0.7152, 0.0722 );

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'color conversion', () => {

		gpuTest( 'luminance() matches hand-computed Rec.709 dot product', ( { assert } ) => {

			assert.closeAbs( luminance( vec3( 1, 0, 0 ), REC709 ), float( 0.2126 ), 1e-5, 'pure red' );
			assert.closeAbs( luminance( vec3( 0, 1, 0 ), REC709 ), float( 0.7152 ), 1e-5, 'pure green' );
			assert.closeAbs( luminance( vec3( 0, 0, 1 ), REC709 ), float( 0.0722 ), 1e-5, 'pure blue' );
			assert.closeAbs( luminance( vec3( 1, 1, 1 ), REC709 ), float( 1.0 ), 1e-5, 'white sums to 1' );

		} );

		gpuTest( 'grayscale() actually returns a scalar luminance, despite its @return {Node<vec3>} docstring', ( { assert } ) => {

			// Real doc/implementation mismatch (see tsl-unit-test-findings.md):
			// grayscale()'s JSDoc promises `@return {Node<vec3>} The grayscale
			// color`, but the implementation is just `return luminance(color.rgb)`
			// -- and luminance() is a plain `dot(color, coefficients)`, i.e. a
			// float. There is no vec3 broadcast anywhere in the function. This
			// locks down the *actual* (float) behavior so it can't regress
			// silently, and stands as a regression check for whichever fix is
			// chosen: broadcasting the implementation to match the docs, or
			// correcting the docs to match the implementation.
			const gray = grayscale( vec3( 1, 0, 0 ) );

			// grayscale() has no coefficients parameter -- it always uses
			// ColorManagement's current working color space (linear-sRGB by
			// default, whose Rec.709 luminance coefficients match REC709 above).
			assert.closeAbs( gray, float( 0.2126 ), 2e-3, "grayscale(red) is red's scalar luminance, NOT a vec3" );

		} );

		gpuTest( 'saturation() at its two defining endpoints', ( { assert } ) => {

			const color = vec3( 0.8, 0.2, 0.4 );

			// adjustment == 0 must fully desaturate to the color's own luminance
			// (gray) -- an independent identity, not just "whatever the code
			// currently returns".
			const desaturated = saturation( color, float( 0 ) );
			const gray = luminance( color );
			assert.closeAbs( desaturated, vec3( gray, gray, gray ), 1e-4, 'adjustment=0 fully desaturates to luminance gray' );

			// adjustment == 1 must be a no-op (mix(luminance, color, 1) == color).
			assert.closeAbs( saturation( color, float( 1 ) ), color, 1e-5, 'adjustment=1 leaves the color unchanged' );

		} );

		gpuTest( 'hue() rotation identities', ( { assert } ) => {

			const color = vec3( 0.8, 0.2, 0.4 );

			// A 0-radian rotation must be a no-op.
			assert.closeAbs( hue( color, float( 0 ) ), color, 1e-5, 'hue(color, 0) is the identity' );

			// A full 2*PI rotation returns to the start (up to floating-point drift).
			assert.closeAbs( hue( color, float( Math.PI * 2 ) ), color, 1e-3, 'hue(color, 2*PI) returns to the original color' );

		} );

		gpuTest( 'posterize() known step counts', ( { assert } ) => {

			// posterize(x, steps) == floor(x * steps) / steps.
			assert.closeAbs( posterize( float( 0.37 ), float( 4 ) ), float( Math.floor( 0.37 * 4 ) / 4 ), 1e-5, 'posterize(0.37, 4)' );
			assert.closeAbs( posterize( float( 1.0 ), float( 4 ) ), float( 1.0 ), 1e-5, 'posterize(1.0, 4) stays at the top step' );
			assert.closeAbs( posterize( float( 0.0 ), float( 4 ) ), float( 0.0 ), 1e-5, 'posterize(0.0, 4)' );

			// Known real edge case (found while surveying this file): steps=0
			// makes posterize() compute floor(x*0)/0 == 0/0 == NaN for any x.
			// Not exercised as a hard assertion here (NaN-vs-NaN equality is
			// not meaningfully testable and would be a flaky, uninformative
			// check), but documented so a future caller doesn't pass steps=0
			// expecting graceful clamping.

		} );

		gpuTest( 'remap() and remapClamp()', ( { assert } ) => {

			// remap(0.4, 0.3, 0.5, 0, 1) -- the example from remap()'s own doc comment.
			assert.closeAbs( remap( float( 0.4 ), float( 0.3 ), float( 0.5 ) ), float( 0.5 ), 1e-5, 'remap() doc-comment example' );

			// Non-normalized output range.
			assert.closeAbs( remap( float( 5 ), float( 0 ), float( 10 ), float( 100 ), float( 200 ) ), float( 150 ), 1e-4, 'remap into an arbitrary output range' );

			// remap() (without clamping) legitimately extrapolates past the input range.
			assert.closeAbs( remap( float( 20 ), float( 0 ), float( 10 ), float( 0 ), float( 1 ) ), float( 2 ), 1e-4, 'remap() extrapolates past inHigh' );

			// remapClamp() must clamp the *output* to [outLow, outHigh] for the same input.
			assert.eq( remapClamp( float( 20 ), float( 0 ), float( 10 ), float( 0 ), float( 1 ) ), float( 1 ), 'remapClamp() clamps past inHigh' );
			assert.eq( remapClamp( float( -20 ), float( 0 ), float( 10 ), float( 0 ), float( 1 ) ), float( 0 ), 'remapClamp() clamps below inLow' );

		} );

		gpuTest( 'viewZ <-> perspective depth round trip', ( { assert } ) => {

			const near = float( 0.1 );
			const far = float( 100 );

			for ( const viewZ of [ -0.1, -1, -10, -50, -99.9 ] ) {

				const depth = viewZToPerspectiveDepth( float( viewZ ), near, far );
				const roundTrip = perspectiveDepthToViewZ( depth, near, far );
				assert.closeRel( roundTrip, float( viewZ ), 1e-3, `viewZ=${ viewZ } round-trips through perspective depth` );

			}

		} );

		gpuTest( 'viewZ <-> orthographic depth round trip', ( { assert } ) => {

			const near = float( 0.1 );
			const far = float( 100 );

			for ( const viewZ of [ -0.1, -1, -10, -50, -99.9 ] ) {

				const depth = viewZToOrthographicDepth( float( viewZ ), near, far );
				const roundTrip = orthographicDepthToViewZ( depth, near, far );
				assert.closeAbs( roundTrip, float( viewZ ), 1e-3, `viewZ=${ viewZ } round-trips through orthographic depth` );

			}

		} );

		gpuTest( 'viewZToLogarithmicDepth is monotonic and bounded to [0, 1] at near/far', ( { assert } ) => {

			const near = float( 0.1 );
			const far = float( 100 );

			// At viewZ == -near, depth must be exactly 0; at viewZ == -far, depth must be exactly 1
			// (this is the entire point of the formula -- log2(near/near)/log2(far/near) == 0,
			// log2(far/near)/log2(far/near) == 1).
			assert.closeAbs( viewZToLogarithmicDepth( float( -0.1 ), near, far ), float( 0 ), 1e-4, 'depth at the near plane is 0' );
			assert.closeAbs( viewZToLogarithmicDepth( float( -100 ), near, far ), float( 1 ), 1e-4, 'depth at the far plane is 1' );

			// A midpoint (in log space) must land at 0.5.
			const midViewZ = -Math.sqrt( 0.1 * 100 ); // geometric mean of near/far
			assert.closeAbs( viewZToLogarithmicDepth( float( midViewZ ), near, far ), float( 0.5 ), 1e-4, 'the geometric-mean viewZ maps to depth 0.5' );

		} );

	} );

} );
