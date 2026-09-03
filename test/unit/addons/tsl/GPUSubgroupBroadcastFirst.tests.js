import {
	Fn,
	instanceIndex, invocationSubgroupIndex,
	instancedArray, subgroupBroadcastFirst,
	uint
} from 'three/tsl';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

// Regression test for a bug fixed alongside this file: subgroupBroadcastFirst()
// was declared with `setParameterLength(2)` in SubgroupFunctionNode.js, but
// per the WGSL spec it takes exactly one argument
// (`subgroupBroadcastFirst(e: T) -> T` -- no lane id, unlike
// subgroupBroadcast). Calling it correctly (one argument) made three.js
// auto-pad a bogus second argument, producing invalid WGSL ("no matching
// call to 'subgroupBroadcastFirst(f32, abstract-float)'"). See
// GPUSubgroup.tests.js for the rest of this codebase's subgroup coverage and
// the general approach.

const WORKGROUP_SIZE = 64;
const WORKGROUP_COUNT = 4;
const DISPATCH_COUNT = WORKGROUP_SIZE * WORKGROUP_COUNT;

// See GPUSubgroup.tests.js's matching comment: a plain numeric `count` in
// `.compute(count, ws)` auto-inserts a bounds-check branch that violates
// WGSL's "subgroup functions need uniform control flow" rule.
const DISPATCH_SIZE = [ WORKGROUP_COUNT, 1, 1 ];

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'subgroup functions', () => {

		rawComputeTest( 'subgroupBroadcastFirst reads the first active lane\'s value', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const output = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				const value = invocationSubgroupIndex.add( uint( 100 ) ); // 100, 101, 102, ...

				output.element( instanceIndex ).assign( subgroupBroadcastFirst( value ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				assert.strictEqual( data[ i ], 100, `invocation ${ i }: subgroupBroadcastFirst(value) should read back the first lane's value (100)` );

			}

		} );

	} );

} );
