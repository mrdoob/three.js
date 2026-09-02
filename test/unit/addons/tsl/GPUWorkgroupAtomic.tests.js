import {
	Fn,
	instanceIndex, invocationLocalIndex,
	instancedArray, workgroupArray, workgroupBarrier,
	atomicAdd, atomicLoad, uint
} from 'three/tsl';
import { getSharedRenderer } from './gpu-test-utils.js';

// `readBuffer()` in gpu-test-utils.js always reinterprets the raw bytes as a
// `Float32Array`, which is wrong here: `output` below is a `uint` storage
// buffer, so its bytes must be read back as `Uint32Array` -- reinterpreting
// small uint values (e.g. 8) as float32 bit patterns would produce garbage,
// not the integers under test.
async function readUintBuffer( renderer, buffer ) {

	return new Uint32Array( await renderer.getArrayBufferAsync( buffer.value ) );

}

// Coverage for workgroup-scoped shared arrays and atomics
// (`workgroupArray()`, `.toAtomic()`, `atomicAdd()`, `workgroupBarrier()`) --
// see mrdoob/three.js#34428, which added `.toAtomic()` support to
// `workgroupArray()`. None of this is exercised by `gpuTest`/`gpuFuzzTest`
// (gpu-test-utils.js): those dispatch one compute invocation per assertion
// and never rely on multiple invocations of the *same* workgroup cooperating
// through shared/atomic memory, which is exactly the behavior these nodes
// add. So these tests build their own small compute kernels directly,
// dispatching several invocations per workgroup and reading the shared
// result back once per workgroup finishes.
//
// WebGPU-only: `workgroupArray()`/atomics aren't implemented for the WebGL2
// fallback backend (no `getScopedArray()` there), so these only register
// against the 'webgpu' backend.

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'workgroup arrays and atomics', () => {

		QUnit.test( 'workgroupArray: plain (non-atomic) shared read/write survives a barrier', async ( assert ) => {

			const renderer = await getSharedRenderer( 'webgpu' );

			if ( renderer === null ) {

				assert.ok( true, 'SKIPPED: "webgpu" backend is not available in this environment.' );
				return;

			}

			// Regression guard: PR #34428 threads an `isAtomic` flag through
			// `WorkgroupInfoNode`/`WGSLNodeBuilder.getScopedArray()` -- this
			// confirms the default (non-atomic) path still declares and
			// round-trips a plain `array<uint, N>` in the `workgroup` address
			// space exactly as before.
			const workgroupSize = 8;
			const dispatchCount = 32; // 4 workgroups of 8
			const output = instancedArray( dispatchCount, 'uint' );

			const kernel = Fn( () => {

				const shared = workgroupArray( 'uint', workgroupSize );

				// Every invocation writes a distinct non-zero value into its own
				// slot, then reads back the value written by its right-hand
				// neighbor. Using non-zero values ensures this cannot pass from
				// workgroup memory's default initialization alone.
				shared.element( invocationLocalIndex ).assign( invocationLocalIndex.add( uint( 1 ) ) );

				workgroupBarrier();

				const neighborLocalIndex = invocationLocalIndex.add( uint( 1 ) ).mod( uint( workgroupSize ) );
				output.element( instanceIndex ).assign( shared.element( neighborLocalIndex ) );

			} )().compute( dispatchCount, [ workgroupSize ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < dispatchCount; i ++ ) {

				const localIndex = i % workgroupSize;
				const expected = ( ( localIndex + 1 ) % workgroupSize ) + 1;

				assert.strictEqual( data[ i ], expected, `invocation ${ i }: should read its right neighbor's non-zero value (${ expected })` );

			}

		} );

		QUnit.test( 'workgroupArray.toAtomic(): concurrent atomicAdd sums exactly once per invocation, per workgroup', async ( assert ) => {

			const renderer = await getSharedRenderer( 'webgpu' );

			if ( renderer === null ) {

				assert.ok( true, 'SKIPPED: "webgpu" backend is not available in this environment.' );
				return;

			}

			const workgroupSize = 8;
			const workgroupCount = 4;
			const dispatchCount = workgroupSize * workgroupCount;
			const output = instancedArray( dispatchCount, 'uint' );

			const kernel = Fn( () => {

				// A single atomic counter, shared by the whole workgroup. WGSL
				// zero-initializes `workgroup`-address-space variables (atomic
				// ones included) once per workgroup, so no explicit reset is
				// needed here -- and a plain `.assign()` on an atomic element
				// wouldn't be valid WGSL anyway (writes must go through
				// `atomicStore`/`atomicAdd`/etc.).
				const counter = workgroupArray( 'uint', 1 ).toAtomic();

				// Every invocation in the workgroup increments the same
				// atomic slot concurrently -- this only produces the exact
				// expected sum if `getScopedArray()` genuinely declared the
				// element as `atomic<u32>` (PR #34428); a plain (non-atomic)
				// `array<u32, 1>` here would race and typically undercount.
				atomicAdd( counter.element( uint( 0 ) ), uint( 1 ) );

				workgroupBarrier();

				// WGSL forbids reading an `atomic<u32>` element with a plain
				// load/assign -- it must go through `atomicLoad()`.
				output.element( instanceIndex ).assign( atomicLoad( counter.element( uint( 0 ) ) ) );

			} )().compute( dispatchCount, [ workgroupSize ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < dispatchCount; i ++ ) {

				assert.strictEqual( data[ i ], workgroupSize, `invocation ${ i }: atomic counter should equal workgroupSize (${ workgroupSize }) -- every invocation in its workgroup added exactly once` );

			}

		} );

	} );

} );
