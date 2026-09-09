import {
	Fn, instanceIndex, instancedArray,
	atomicAdd, atomicSub, atomicMax, atomicMin, atomicAnd, atomicOr, atomicXor,
	atomicLoad, atomicStore,
	uint, shiftLeft, bitNot
} from 'three/tsl';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

// Coverage for every `atomicFunc()`-family op (AtomicFunctionNode.js) on a
// *storage* buffer (`instancedArray(...).toAtomic()`) -- as opposed to
// mrdoob/three.js#34428's `workgroupArray(...).toAtomic()`, which is scoped
// to a single workgroup. A storage buffer is visible to *every* invocation
// across *every* workgroup in the dispatch, so these tests deliberately
// spread invocations across several workgroups (`workgroupSize` far smaller
// than `dispatchCount`) to exercise cross-workgroup atomicity, not just
// within-workgroup atomicity (already covered separately for the workgroup
// case).
//
// Each op that needs a specific starting value (`Sub`/`Max`/`Min`/`And`/`Or`/
// `Xor`) is seeded with its own small "init" compute dispatch first, awaited
// (`computeAsync`) before the "op" dispatch runs, so the two never race each
// other -- only the op dispatch's *own* invocations are racing, which is
// exactly what's under test.
//
// Reading the buffer back afterwards uses the raw storage bytes directly
// (`getArrayBufferAsync` -- see `readUintBuffer`), not a further
// `atomicLoad()` kernel: `atomic<u32>` has the same in-memory layout as
// plain `u32`, atomics are a WGSL type-checking construct, not a different
// storage format, so a host-side readback after all GPU work has completed
// is exactly the final value.

const WORKGROUP_SIZE = 8;

function makeCounter() {

	return instancedArray( 1, 'uint' ).toAtomic();

}

async function seed( renderer, counter, value ) {

	const kernel = Fn( () => {

		atomicStore( counter.element( uint( 0 ) ), uint( value ) );

	} )().compute( 1 );

	await renderer.computeAsync( kernel );

}

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'storage buffer atomics', () => {

		rawComputeTest( 'atomicAdd: concurrent adds across multiple workgroups sum exactly once each', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 64; // 8 workgroups of WORKGROUP_SIZE
			const counter = makeCounter();

			const kernel = Fn( () => {

				atomicAdd( counter.element( uint( 0 ) ), uint( 1 ) );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ], dispatchCount, `expected ${ dispatchCount } (one add per invocation, across ${ dispatchCount / WORKGROUP_SIZE } workgroups)` );

		} );

		rawComputeTest( 'atomicSub: concurrent subs across multiple workgroups drain exactly once each', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 64;
			const counter = makeCounter();

			await seed( renderer, counter, dispatchCount );

			const kernel = Fn( () => {

				atomicSub( counter.element( uint( 0 ) ), uint( 1 ) );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ], 0, 'expected 0 (one sub per invocation, draining the seeded count exactly)' );

		} );

		rawComputeTest( 'atomicMax: concurrent max across multiple workgroups converges to the true maximum', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 37; // deliberately not a multiple of WORKGROUP_SIZE
			const counter = makeCounter();

			await seed( renderer, counter, 0 );

			const kernel = Fn( () => {

				atomicMax( counter.element( uint( 0 ) ), instanceIndex );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ], dispatchCount - 1, `expected ${ dispatchCount - 1 } (the largest instanceIndex)` );

		} );

		rawComputeTest( 'atomicMin: concurrent min across multiple workgroups converges to the true minimum', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 37;
			const counter = makeCounter();

			await seed( renderer, counter, 0xffffffff );

			const kernel = Fn( () => {

				atomicMin( counter.element( uint( 0 ) ), instanceIndex );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ], 0, 'expected 0 (the smallest instanceIndex)' );

		} );

		rawComputeTest( 'atomicAnd: each invocation clears one distinct bit, all clears land', {}, async ( { assert, renderer } ) => {

			// 32 invocations, each clearing a different one of the 32 bits --
			// only passes if every single invocation's AND actually took
			// effect (a lost update would leave a stray 1 bit set).
			const dispatchCount = 32;
			const counter = makeCounter();

			await seed( renderer, counter, 0xffffffff );

			const kernel = Fn( () => {

				const bit = shiftLeft( uint( 1 ), instanceIndex );
				atomicAnd( counter.element( uint( 0 ) ), bitNot( bit ) );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ], 0, 'expected 0x00000000 (every one of the 32 bits cleared exactly once)' );

		} );

		rawComputeTest( 'atomicOr: each invocation sets one distinct bit, all sets land', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 32;
			const counter = makeCounter();

			await seed( renderer, counter, 0 );

			const kernel = Fn( () => {

				const bit = shiftLeft( uint( 1 ), instanceIndex );
				atomicOr( counter.element( uint( 0 ) ), bit );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ] >>> 0, 0xffffffff, 'expected 0xffffffff (every one of the 32 bits set exactly once)' );

		} );

		rawComputeTest( 'atomicXor: each invocation flips one distinct bit, all flips land', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 32;
			const counter = makeCounter();

			await seed( renderer, counter, 0 );

			const kernel = Fn( () => {

				const bit = shiftLeft( uint( 1 ), instanceIndex );
				atomicXor( counter.element( uint( 0 ) ), bit );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, counter );
			assert.strictEqual( data[ 0 ] >>> 0, 0xffffffff, 'expected 0xffffffff (every one of the 32 bits toggled from 0 to 1 exactly once)' );

		} );

		rawComputeTest( 'atomicStore + atomicLoad: a store from one dispatch is visible to a later dispatch\'s loads', {}, async ( { assert, renderer } ) => {

			const dispatchCount = 16;
			const counter = makeCounter();
			const output = instancedArray( dispatchCount, 'uint' );

			await seed( renderer, counter, 424242 );

			const kernel = Fn( () => {

				output.element( instanceIndex ).assign( atomicLoad( counter.element( uint( 0 ) ) ) );

			} )().compute( dispatchCount, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < dispatchCount; i ++ ) {

				assert.strictEqual( data[ i ], 424242, `invocation ${ i }: atomicLoad should read back the earlier atomicStore's value` );

			}

		} );

	} );

} );
