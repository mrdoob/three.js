import {
	Fn, If,
	instanceIndex, invocationLocalIndex,
	instancedArray, storageBarrier, textureBarrier,
	textureStore, storageTexture,
	uvec2, vec4, uint, float
} from 'three/tsl';
import { StorageTexture, FloatType } from 'three/webgpu';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

// Coverage for the two barrier variants BarrierNode.js declares beyond
// `workgroupBarrier()` (already covered in GPUWorkgroupAtomic.tests.js):
// `storageBarrier()` and `textureBarrier()`. Neither had any test, and
// `textureBarrier()` in particular has no usage anywhere in the codebase
// (src, examples, or tests) to model against -- see the second test's
// comments for what had to be worked out from scratch.

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'barriers', () => {

		rawComputeTest( 'storageBarrier: a workgroup-mate\'s storage write is visible after the barrier', {}, async ( { assert, renderer } ) => {

			const workgroupSize = 8;
			const dispatchCount = 32; // 4 workgroups of 8

			const shared = instancedArray( dispatchCount, 'uint' );
			const output = instancedArray( dispatchCount, 'uint' );

			const kernel = Fn( () => {

				// Every invocation writes its own local index into its own
				// slot of a *storage* (not workgroup) buffer, then reads the
				// slot written by the invocation "to its left" within the
				// same workgroup (wrapping at 0) -- only correct if
				// storageBarrier() actually ordered that write before this
				// read for every invocation in the workgroup, not just
				// program order for the writer itself.
				shared.element( instanceIndex ).assign( invocationLocalIndex );

				storageBarrier();

				const neighborLocalId = invocationLocalIndex.add( uint( workgroupSize - 1 ) ).mod( uint( workgroupSize ) );
				const neighborGlobalSlot = instanceIndex.sub( invocationLocalIndex ).add( neighborLocalId );

				output.element( instanceIndex ).assign( shared.element( neighborGlobalSlot ) );

			} )().compute( dispatchCount, [ workgroupSize ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < dispatchCount; i ++ ) {

				const localId = i % workgroupSize;
				const expected = ( localId + workgroupSize - 1 ) % workgroupSize;

				assert.strictEqual( data[ i ], expected, `invocation ${ i } (local ${ localId }): should read its left neighbor's local index (${ expected }) via the storage buffer` );

			}

		} );

		rawComputeTest( 'textureBarrier: a workgroup-mate\'s storage-texture write is visible after the barrier', {}, async ( { assert, renderer } ) => {

			// No existing code in this repo calls textureBarrier() (checked:
			// zero hits across src/examples/test besides its own
			// declaration) -- built from the WGSL/WebGPU spec instead:
			// textureBarrier() only orders *storage-texture* accesses within
			// a workgroup, the texture analogue of storageBarrier() for
			// buffers. `FloatType` avoids the default rgba8unorm storage
			// format's quantization, so the round-tripped values below can
			// be compared exactly rather than with a tolerance.
			const width = 4;
			const storageTex = new StorageTexture( width, 1 );
			storageTex.type = FloatType;

			const output = instancedArray( 1, 'float' );

			const kernel = Fn( () => {

				// Each of the 4 invocations (one workgroup) writes a
				// distinct, identifiable value into its own texel.
				const coord = uvec2( instanceIndex, uint( 0 ) );
				textureStore( storageTex, coord, vec4( float( instanceIndex ).add( 1 ), 0, 0, 1 ) ).toReadWrite();

				textureBarrier();

				// Only invocation 0 reads all 4 texels back and sums them --
				// only correct if every other invocation's write above is
				// actually visible to invocation 0 by the time it runs this,
				// i.e. if textureBarrier() did its job. Reading a storage
				// texture back (as opposed to a plain sampled texture) needs
				// the dedicated `storageTexture()` node -- `texture()`/
				// `textureLoad()` build a *sampled*-texture node (with an
				// implicit mip-level argument), which doesn't type-check
				// against a `texture_storage_2d` binding in WGSL.
				If( instanceIndex.equal( uint( 0 ) ), () => {

					let sum = storageTexture( storageTex, uvec2( uint( 0 ), uint( 0 ) ) ).setSampler( false ).toReadWrite().r;

					for ( let i = 1; i < width; i ++ ) {

						sum = sum.add( storageTexture( storageTex, uvec2( uint( i ), uint( 0 ) ) ).setSampler( false ).toReadWrite().r );

					}

					output.element( uint( 0 ) ).assign( sum );

				} );

			} )().compute( width, [ width ] );

			await renderer.computeAsync( kernel );

			const data = new Float32Array( await renderer.getArrayBufferAsync( output.value ) );

			// Texel values are 1, 2, 3, 4 -- sum = 10.
			assert.strictEqual( data[ 0 ], 10, 'sum of all 4 texels, read back after textureBarrier(), should be exactly 10' );

		} );

	} );

} );
