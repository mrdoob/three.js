//
// Shared boilerplate for GPU-native compute tests that need full control over
// dispatch shape (workgroupSize, multiple workgroups, raw typed-array
// readback) -- i.e. tests that can't be expressed as `gpuTest`/`gpuFuzzTest`
// assertions (gpu-test-utils.js), because those dispatch exactly one compute
// invocation per assertion and never let multiple invocations of the same
// workgroup cooperate through shared/atomic memory or inspect built-in
// workgroup/subgroup identity values.
//
// `rawComputeTest(name, options, run)` registers one QUnit.test that:
//  - resolves the shared renderer for `options.backend` (default 'webgpu'),
//    soft-skipping (not failing) if that backend isn't available here --
//    same policy as gpu-test-utils.js's `declareTest`.
//  - soft-skips if `options.requiredFeature` is set and the renderer doesn't
//    report it (`renderer.hasFeature(...)`) -- used for subgroup tests, which
//    many GPUs/software backends don't implement.
//  - calls `run({ assert, renderer })`; the test body builds and dispatches
//    its own TSL compute kernel and reads results back itself.
//
import { getSharedRenderer } from './gpu-test-utils.js';

export function rawComputeTest( name, options, run ) {

	const { backend = 'webgpu', requiredFeature } = options;

	QUnit.test( name, async ( assert ) => {

		const renderer = await getSharedRenderer( backend );

		if ( renderer === null ) {

			assert.ok( true, `SKIPPED: "${ backend }" backend is not available in this environment.` );
			return;

		}

		if ( requiredFeature !== undefined && renderer.hasFeature( requiredFeature ) !== true ) {

			assert.ok( true, `SKIPPED: "${ backend }" backend does not support required feature "${ requiredFeature }" in this environment.` );
			return;

		}

		await run( { assert, renderer } );

	} );

}

// Every uint/int storage buffer read back in these tests needs the *typed
// integer* view of the raw bytes, not `gpu-test-utils.js`'s `readBuffer()`
// (which always reinterprets as `Float32Array` -- reinterpreting a small
// uint like 8 as float32 bits produces garbage, not the integer under test).
export async function readUintBuffer( renderer, buffer ) {

	return new Uint32Array( await renderer.getArrayBufferAsync( buffer.value ) );

}

export async function readIntBuffer( renderer, buffer ) {

	return new Int32Array( await renderer.getArrayBufferAsync( buffer.value ) );

}
