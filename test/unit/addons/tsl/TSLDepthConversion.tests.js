import {
	float,
	viewZToOrthographicDepth, orthographicDepthToViewZ,
	viewZToPerspectiveDepth, perspectiveDepthToViewZ,
	viewZToReversedOrthographicDepth, viewZToReversedPerspectiveDepth,
	viewZToLogarithmicDepth, logarithmicDepthToViewZ
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for the viewZ <-> depth conversion helpers in
// src/nodes/display/ViewportDepthNode.js. Every expected value below is a
// plain-JS transliteration of each function's own documented formula.
//
// orthographicDepthToViewZ()/perspectiveDepthToViewZ() branch internally on
// `builder.renderer.reversedDepthBuffer`, which both the WebGPU and WebGL
// backends default to `false` (see Renderer.js) and this harness never
// overrides -- so every assertion below exercises the non-reversed branch
// of each formula.
//
// viewZ is negative for points in front of the camera (see this module's
// own "NOTE" comment) -- every viewZ value below is chosen negative to
// match that convention.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'depth conversions', () => {

		gpuTest( 'orthographic viewZ<->depth conversion matches its documented formula and round-trips', ( { assert } ) => {

			const near = 1, far = 100, viewZ = - 25;

			// viewZToOrthographicDepth(viewZ, near, far) == (viewZ+near)/(near-far)
			const expectedDepth = ( viewZ + near ) / ( near - far );
			const depth = viewZToOrthographicDepth( float( viewZ ), float( near ), float( far ) );
			assert.closeAbs( depth, float( expectedDepth ), 1e-5, 'viewZToOrthographicDepth matches (viewZ+near)/(near-far)' );

			// orthographicDepthToViewZ (non-reversed branch): (near-far)*depth - near
			const expectedViewZ = ( near - far ) * expectedDepth - near;
			assert.closeAbs( orthographicDepthToViewZ( float( expectedDepth ), float( near ), float( far ) ), float( expectedViewZ ), 1e-4, 'orthographicDepthToViewZ matches (near-far)*depth-near' );

			// Round trip: converting to depth and back must recover the
			// original viewZ, since these are meant to be exact inverses.
			assert.closeAbs( orthographicDepthToViewZ( depth, float( near ), float( far ) ), float( viewZ ), 1e-3, 'orthographicDepthToViewZ(viewZToOrthographicDepth(viewZ)) recovers viewZ' );

		} );

		gpuTest( 'reversed-orthographic viewZ->depth matches its documented formula', ( { assert } ) => {

			// viewZToReversedOrthographicDepth(viewZ, near, far) == (viewZ+far)/(far-near)
			const near = 1, far = 100, viewZ = - 25;
			const expected = ( viewZ + far ) / ( far - near );
			assert.closeAbs( viewZToReversedOrthographicDepth( float( viewZ ), float( near ), float( far ) ), float( expected ), 1e-5, 'viewZToReversedOrthographicDepth matches (viewZ+far)/(far-near)' );

			// Reversed depth runs 1 (near) -> 0 (far), the opposite direction
			// from the non-reversed form -- confirmed by comparing the two
			// at the same viewZ: they must sum to 1 only in the trivial case
			// where near+far cancels, so instead just check the documented
			// endpoints directly: at viewZ == -near, reversed depth == 1.
			assert.closeAbs( viewZToReversedOrthographicDepth( float( - near ), float( near ), float( far ) ), float( 1 ), 1e-5, 'reversed orthographic depth is 1 at the near plane' );
			assert.closeAbs( viewZToReversedOrthographicDepth( float( - far ), float( near ), float( far ) ), float( 0 ), 1e-5, 'reversed orthographic depth is 0 at the far plane' );

		} );

		gpuTest( 'perspective viewZ<->depth conversion matches its documented formula and round-trips', ( { assert } ) => {

			const near = 1, far = 100, viewZ = - 25;

			// viewZToPerspectiveDepth(viewZ, near, far) == (near+viewZ)*far / ((far-near)*viewZ)
			const expectedDepth = ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
			const depth = viewZToPerspectiveDepth( float( viewZ ), float( near ), float( far ) );
			assert.closeAbs( depth, float( expectedDepth ), 1e-5, 'viewZToPerspectiveDepth matches (near+viewZ)*far/((far-near)*viewZ)' );

			// perspectiveDepthToViewZ (non-reversed branch): near*far / ((far-near)*depth - far)
			const expectedViewZ = ( near * far ) / ( ( far - near ) * expectedDepth - far );
			assert.closeAbs( perspectiveDepthToViewZ( float( expectedDepth ), float( near ), float( far ) ), float( expectedViewZ ), 1e-3, 'perspectiveDepthToViewZ matches near*far/((far-near)*depth-far)' );

			// Round trip: converting to depth and back must recover the
			// original viewZ.
			assert.closeAbs( perspectiveDepthToViewZ( depth, float( near ), float( far ) ), float( viewZ ), 1e-3, 'perspectiveDepthToViewZ(viewZToPerspectiveDepth(viewZ)) recovers viewZ' );

		} );

		gpuTest( 'reversed-perspective viewZ->depth matches its documented formula', ( { assert } ) => {

			// viewZToReversedPerspectiveDepth(viewZ, near, far) == near*(viewZ+far) / (viewZ*(near-far))
			const near = 1, far = 100, viewZ = - 25;
			const expected = ( near * ( viewZ + far ) ) / ( viewZ * ( near - far ) );
			assert.closeAbs( viewZToReversedPerspectiveDepth( float( viewZ ), float( near ), float( far ) ), float( expected ), 1e-4, 'viewZToReversedPerspectiveDepth matches near*(viewZ+far)/(viewZ*(near-far))' );

			// Documented endpoints: reversed perspective depth is 1 at the
			// near plane and 0 at the far plane (opposite direction from the
			// non-reversed form, same as the orthographic case above).
			assert.closeAbs( viewZToReversedPerspectiveDepth( float( - near ), float( near ), float( far ) ), float( 1 ), 1e-4, 'reversed perspective depth is 1 at the near plane' );
			assert.closeAbs( viewZToReversedPerspectiveDepth( float( - far ), float( near ), float( far ) ), float( 0 ), 1e-4, 'reversed perspective depth is 0 at the far plane' );

		} );

		gpuTest( 'logarithmic viewZ<->depth conversion matches its documented formula and round-trips', ( { assert } ) => {

			const near = 0.1, far = 1000, viewZ = - 25;

			// viewZToLogarithmicDepth(viewZ, near, far) == log2(-viewZ/near) / log2(far/near)
			// (near is clamped to at least 1e-6 first, irrelevant here since near=0.1).
			const expectedDepth = Math.log2( - viewZ / near ) / Math.log2( far / near );
			const depth = viewZToLogarithmicDepth( float( viewZ ), float( near ), float( far ) );
			assert.closeAbs( depth, float( expectedDepth ), 1e-4, 'viewZToLogarithmicDepth matches log2(-viewZ/near)/log2(far/near)' );

			// logarithmicDepthToViewZ(depth, near, far) == -(near * e^(depth*ln(far/near)))
			const expectedViewZ = - ( near * Math.exp( expectedDepth * Math.log( far / near ) ) );
			assert.closeAbs( logarithmicDepthToViewZ( float( expectedDepth ), float( near ), float( far ) ), float( expectedViewZ ), 1e-2, 'logarithmicDepthToViewZ matches -(near*e^(depth*ln(far/near)))' );

			// Round trip: converting to depth and back must recover the
			// original viewZ.
			assert.closeAbs( logarithmicDepthToViewZ( depth, float( near ), float( far ) ), float( viewZ ), 1e-2, 'logarithmicDepthToViewZ(viewZToLogarithmicDepth(viewZ)) recovers viewZ' );

			// Documented endpoints: depth is 0 exactly at the near plane and
			// 1 exactly at the far plane.
			assert.closeAbs( viewZToLogarithmicDepth( float( - near ), float( near ), float( far ) ), float( 0 ), 1e-4, 'logarithmic depth is 0 at the near plane' );
			assert.closeAbs( viewZToLogarithmicDepth( float( - far ), float( near ), float( far ) ), float( 1 ), 1e-4, 'logarithmic depth is 1 at the far plane' );

		} );

	} );

} );
