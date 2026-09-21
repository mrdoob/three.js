import {
	Fn,
	instanceIndex, invocationSubgroupIndex,
	instancedArray,
	subgroupAll, subgroupAny,
	uint, bool
} from 'three/tsl';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

// Regression test for a bug fixed alongside this file: subgroupAll()/
// subgroupAny() were declared with `setParameterLength(0)` in
// SubgroupFunctionNode.js, so calling either with the one boolean predicate
// argument the WGSL spec requires (`subgroupAll(e: bool) -> bool`) was
// rejected outright ("parameter length exceeds limit") -- as shipped,
// neither function was callable for its documented purpose. See
// GPUSubgroup.tests.js for the rest of this codebase's subgroup coverage and
// the general approach (closed-form expected values derived from each
// invocation's own lane id / subgroup size, read back from the same
// dispatch).

const WORKGROUP_SIZE = 64;
const WORKGROUP_COUNT = 4;
const DISPATCH_COUNT = WORKGROUP_SIZE * WORKGROUP_COUNT;

// See GPUSubgroup.tests.js's matching comment: a plain numeric `count` in
// `.compute(count, ws)` auto-inserts a bounds-check branch that violates
// WGSL's "subgroup functions need uniform control flow" rule.
const DISPATCH_SIZE = [ WORKGROUP_COUNT, 1, 1 ];

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'subgroup functions', () => {

		rawComputeTest( 'subgroupAll and subgroupAny reflect a lane-0-only predicate', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const allOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const anyOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				// Lane 0 always exists in every active subgroup, and (for a
				// non-divergent compute shader like this one) every lane in
				// the subgroup is active -- so both predicates below have an
				// unambiguous, group-size-independent expected result.
				const isLaneZero = invocationSubgroupIndex.equal( uint( 0 ) );

				// Not every lane is lane 0 (unless the subgroup has exactly
				// 1 lane, which subgroupSize being >= 1 doesn't rule out --
				// but this sandbox's subgroupSize is 32, so this is false).
				allOut.element( instanceIndex ).assign( subgroupAll( bool( isLaneZero.not() ) ).select( uint( 1 ), uint( 0 ) ) );
				// Some lane (lane 0 itself) is lane 0 -- always true.
				anyOut.element( instanceIndex ).assign( subgroupAny( bool( isLaneZero ) ).select( uint( 1 ), uint( 0 ) ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const allData = await readUintBuffer( renderer, allOut );
			const anyData = await readUintBuffer( renderer, anyOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				assert.strictEqual( allData[ i ], 0, `invocation ${ i }: subgroupAll(laneId != 0) should be false (lane 0 fails it)` );
				assert.strictEqual( anyData[ i ], 1, `invocation ${ i }: subgroupAny(laneId == 0) should be true (lane 0 satisfies it)` );

			}

		} );

	} );

} );
