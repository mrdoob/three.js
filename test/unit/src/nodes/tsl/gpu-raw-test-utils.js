import { assert, test } from 'vitest';
//
// Shared boilerplate for GPU-native compute tests that need full control over
// dispatch shape (workgroupSize, multiple workgroups, raw typed-array
// readback) -- i.e. tests that can't be expressed as `gpuTest`/`gpuFuzzTest`
// assertions (gpu-test-utils.js), because those dispatch exactly one compute
// invocation per assertion and never let multiple invocations of the same
// workgroup cooperate through shared/atomic memory or inspect built-in
// workgroup/subgroup identity values.
//
// Register raw compute tests for this backend. Unavailable backends and
// optional GPU features use explicit Vitest skips.
import { getSharedRenderer } from './gpu-test-utils.js';

export function rawComputeTest( name, options, run ) {

	const { backend = 'webgpu', requiredFeature } = options;

	test.runIf( backend === import.meta.env.THREE_GPU_BACKEND )( name, async ( context ) => {

		const renderer = await getSharedRenderer( backend, context );

		if ( requiredFeature !== undefined && renderer.hasFeature( requiredFeature ) !== true ) {

			context.skip( `GPU does not support feature "${ requiredFeature }".` );
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
