import {
	Fn,
	instanceIndex, invocationSubgroupIndex,
	instancedArray, quadBroadcast,
	uint
} from 'three/tsl';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

// quadBroadcast() takes the value and the quad lane to read it from
// (`quadBroadcast(e: T, id: I) -> T`), so it must accept two arguments.
// See GPUSubgroup.tests.js for the rest of this codebase's subgroup coverage.

const WORKGROUP_SIZE = 64;
const WORKGROUP_COUNT = 4;
const DISPATCH_COUNT = WORKGROUP_SIZE * WORKGROUP_COUNT;

// See GPUSubgroup.tests.js's matching comment: a plain numeric `count` in
// `.compute(count, ws)` auto-inserts a bounds-check branch that violates
// WGSL's "subgroup functions need uniform control flow" rule.
const DISPATCH_SIZE = [ WORKGROUP_COUNT, 1, 1 ];

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'subgroup functions', () => {

			rawComputeTest( 'quadBroadcast reads the value of the given quad lane', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

				const output = instancedArray( DISPATCH_COUNT, 'uint' );

				const kernel = Fn( () => {

					const lane = invocationSubgroupIndex;
					const quadStart = lane.sub( lane.mod( uint( 4 ) ) );

					// Lane 2 of each quad is quadStart + 2.
					output.element( instanceIndex ).assign( quadBroadcast( lane, uint( 2 ) ).sub( quadStart ) );

				} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

				await renderer.computeAsync( kernel );

				const data = await readUintBuffer( renderer, output );

				for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

					assert.strictEqual( data[ i ], 2, `invocation ${ i }: quadBroadcast(lane, 2) should read back lane 2 of its quad` );

				}

			} );

		} );

	} );

} );
