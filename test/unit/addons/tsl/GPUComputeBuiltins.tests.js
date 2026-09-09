import {
	Fn, instanceIndex, instancedArray,
	localId, workgroupId, globalId, numWorkgroups,
	uint
} from 'three/tsl';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

// Coverage for the compute-scope builtins in ComputeBuiltinNode.js
// (`localId`, `workgroupId`, `globalId`, `numWorkgroups`) -- previously
// untested. `subgroupSize` (also declared in ComputeBuiltinNode.js) is
// covered in GPUSubgroup.tests.js instead, since -- unlike these four --
// it requires the WebGPU `'subgroups'` feature to even be declared as a
// shader builtin (see `WGSLNodeBuilder.getSubgroupSize()`'s
// `enableSubGroups()` call) and so needs the same feature-detection gate as
// the rest of the subgroup functions.
//
// Verified against a 1D dispatch with an exact multiple of workgroupSize
// (`dispatchCount = workgroupSize * workgroupCount`), so every relationship
// below is unambiguous -- no partially-filled last workgroup to reason
// about.

const WORKGROUP_SIZE = 8;
const WORKGROUP_COUNT = 5;
const DISPATCH_COUNT = WORKGROUP_SIZE * WORKGROUP_COUNT; // 40

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'compute builtins', () => {

		rawComputeTest( 'localId, workgroupId, globalId and numWorkgroups match their WGSL definitions', {}, async ( { assert, renderer } ) => {

			const localIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const workgroupIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const globalIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const numWorkgroupsOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				localIdOut.element( instanceIndex ).assign( localId.x );
				workgroupIdOut.element( instanceIndex ).assign( workgroupId.x );
				globalIdOut.element( instanceIndex ).assign( globalId.x );
				numWorkgroupsOut.element( instanceIndex ).assign( numWorkgroups.x );

			} )().compute( DISPATCH_COUNT, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const localIdData = await readUintBuffer( renderer, localIdOut );
			const workgroupIdData = await readUintBuffer( renderer, workgroupIdOut );
			const globalIdData = await readUintBuffer( renderer, globalIdOut );
			const numWorkgroupsData = await readUintBuffer( renderer, numWorkgroupsOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const expectedLocalId = i % WORKGROUP_SIZE;
				const expectedWorkgroupId = Math.floor( i / WORKGROUP_SIZE );

				assert.strictEqual( localIdData[ i ], expectedLocalId, `invocation ${ i }: localId.x` );
				assert.strictEqual( workgroupIdData[ i ], expectedWorkgroupId, `invocation ${ i }: workgroupId.x` );
				// By the WGSL spec, global_invocation_id = workgroup_id * workgroup_size + local_invocation_id
				// -- which for a 1D dispatch collapses to exactly the flat invocation index.
				assert.strictEqual( globalIdData[ i ], i, `invocation ${ i }: globalId.x should equal workgroupId.x * ${ WORKGROUP_SIZE } + localId.x` );
				assert.strictEqual( numWorkgroupsData[ i ], WORKGROUP_COUNT, `invocation ${ i }: numWorkgroups.x should equal the dispatched workgroup count (${ WORKGROUP_COUNT })` );

			}

		} );

		rawComputeTest( 'workgroupId spans all three dimensions for a multi-dimensional dispatch', {}, async ( { assert, renderer } ) => {

			// A small 3x3x1 grid of single-invocation workgroups -- covers
			// workgroupId.y (and confirms .z stays 0 for an unused dimension)
			// which the 1D test above can't reach.
			const gridX = 3;
			const gridY = 3;
			const count = gridX * gridY;

			const xOut = instancedArray( count, 'uint' );
			const yOut = instancedArray( count, 'uint' );
			const zOut = instancedArray( count, 'uint' );

			const kernel = Fn( () => {

				// One invocation per workgroup, so instanceIndex directly
				// addresses each workgroup's own output slot in row-major
				// (x fastest) order, matching how `.compute()` dispatches a
				// [gridX, gridY, 1] workgroup grid.
				const slot = workgroupId.y.mul( uint( gridX ) ).add( workgroupId.x );

				xOut.element( slot ).assign( workgroupId.x );
				yOut.element( slot ).assign( workgroupId.y );
				zOut.element( slot ).assign( workgroupId.z );

				// `.compute()`'s first argument is either a plain invocation
				// *count* (number -- dispatches ceil(count / invocationsPerWorkgroup)
				// workgroups along X only) or, as used here, an explicit
				// per-axis *dispatch size* (array -- one workgroup per grid
				// cell, workgroupSize elements per workgroup) -- see
				// `ComputeNode`'s `count` vs `dispatchSize` fields.

			} )().compute( [ gridX, gridY, 1 ], [ 1, 1, 1 ] );

			await renderer.computeAsync( kernel );

			const xData = await readUintBuffer( renderer, xOut );
			const yData = await readUintBuffer( renderer, yOut );
			const zData = await readUintBuffer( renderer, zOut );

			for ( let gy = 0; gy < gridY; gy ++ ) {

				for ( let gx = 0; gx < gridX; gx ++ ) {

					const slot = gy * gridX + gx;

					assert.strictEqual( xData[ slot ], gx, `workgroup (${ gx }, ${ gy }): workgroupId.x` );
					assert.strictEqual( yData[ slot ], gy, `workgroup (${ gx }, ${ gy }): workgroupId.y` );
					assert.strictEqual( zData[ slot ], 0, `workgroup (${ gx }, ${ gy }): workgroupId.z should stay 0 (unused dimension)` );

				}

			}

		} );

	} );

} );
