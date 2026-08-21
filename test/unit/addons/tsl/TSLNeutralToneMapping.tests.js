import {
	float, vec3, neutralToneMapping
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Regression coverage for a NodeBuilder.addFlowCodeHierarchy() crash
// ("Cannot read properties of undefined (reading 'get')") that fired
// whenever a cached temp node's *first* reference was unconditional and a
// *later* reference was inside a conditional block.
//
// `flowCodeBlock` is created lazily by `addLineFlowCodeBlock()`, but only
// when the node's first build happened inside some enclosing conditional
// block. If the first build instead happens at the top level of a function
// body, `flowCodeBlock` stays `undefined` -- and if that same node is later
// referenced again from inside an `If()`, `addFlowCodeHierarchy()` used to
// crash outright calling `.get()` on `undefined`.
//
// neutralToneMapping() (src/nodes/display/ToneMappingFunctions.js) hits this
// exactly: it builds min()/max()-style MathNode temps unconditionally near
// the top of the function, then references one of them again from inside
// its own `If(peak.lessThan(StartCompression), () => { return color; })`.
// This test's own gpuTest() harness wraps each assertion write in an If()
// too, which is what actually triggers the crash reliably on both backends.
//
// neutralToneMapping() is split into three separate gpuTest() calls (one
// assertion each), unlike most of this codebase's other tone-mapping
// tests -- calling it more than once inside a single gpuTest's shared
// kernel triggers a separate, unrelated harness-side error, so splitting
// keeps this test isolated to the one bug it's meant to cover.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'addFlowCodeHierarchy() / neutralToneMapping()', () => {

		gpuTest( 'neutralToneMapping() leaves low-intensity colors past the desaturation offset unchanged (flat offset branch)', ( { assert } ) => {

			// x = min(r,g,b) = 0.1, not below the 0.08 inner-threshold, so the
			// desaturation offset is the flat 0.04 branch: color - 0.04. The
			// resulting peak (0.26) is below StartCompression (0.76), so the
			// function's `If(peak < StartCompression) return color` fires and
			// no highlight compression is applied -- this exercises TSL's
			// real early-return-from-If semantics.
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
