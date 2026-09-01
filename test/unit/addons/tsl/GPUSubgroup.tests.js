import {
	Fn,
	instanceIndex, invocationSubgroupIndex,
	instancedArray, subgroupSize,
	subgroupAdd, subgroupMul, subgroupMin, subgroupMax,
	subgroupAnd, subgroupOr, subgroupXor,
	subgroupInclusiveAdd, subgroupExclusiveAdd,
	subgroupElect, subgroupBallot,
	subgroupBroadcast, subgroupShuffle,
	uint, shiftLeft, bool
} from 'three/tsl';
import { rawComputeTest, readUintBuffer, readIntBuffer } from './gpu-raw-test-utils.js';

// Coverage for SubgroupFunctionNode.js -- previously entirely untested (zero
// hits for any `subgroup*`/`quad*` TSL function anywhere in test/). Gated on
// `renderer.hasFeature('subgroups')`: many GPUs/software backends don't
// implement the WebGPU `'subgroups'` feature, in which case every test here
// soft-skips rather than failing (see `rawComputeTest`'s `requiredFeature`
// option) -- confirmed *not* the case in this sandbox (subgroupSize reads
// back as a real, non-skipped 32), so these do exercise real subgroup
// hardware/driver behavior here.
//
// Deliberately NOT covered here:
//  - `subgroupAll()`/`subgroupAny()`: calling either with the one boolean
//    argument the WGSL spec requires is rejected as declared in this
//    codebase (wrong `setParameterLength`) -- see the sibling bugfix branch.
//  - `subgroupBroadcastFirst()`: same story, wrong `setParameterLength` the
//    other way -- see its own sibling bugfix branch.
//  - `quadSwapX/Y/Diagonal` and `quadBroadcast` (also declared in
//    SubgroupFunctionNode.js) -- they operate on 2x2 "quad" groupings that
//    are a natural fit for fragment-shader derivatives and have no
//    well-defined compute-shader lane grouping to test against
//    independently of the function under test itself, unlike every function
//    covered below. Left as a known gap, not a bug.
//
// Approach: which physical invocations land in the same subgroup, and in
// what lane order, is implementation-defined -- so every test here first
// reads back each invocation's own `invocationSubgroupIndex` (lane id) and
// `subgroupSize` (its subgroup's size) as ground truth topology, *from the
// same dispatch*, and derives the expected reduction/scan/broadcast value
// as a closed-form function of (laneId, groupSize) computed independently
// in JS -- never by re-deriving it from another subgroup call, so these
// can't degrade into test theater (see TSLMath.tests.js's header for the
// same principle applied to plain math functions).

const WORKGROUP_SIZE = 64;
const WORKGROUP_COUNT = 4; // several workgroups, several subgroups per workgroup
const DISPATCH_COUNT = WORKGROUP_SIZE * WORKGROUP_COUNT; // 256

// `.compute(count, ws)` with a plain numeric `count` makes ComputeNode
// auto-insert an `if (instanceIndex < count) { ... }` bounds-check branch
// around the whole kernel body (see ComputeNode.js's `count` vs
// `dispatchSize` doc comments) -- even when, as here, count is an exact
// multiple of the dispatch so no invocation is ever actually excluded.
// WGSL's subgroup functions require being called from *uniform* control
// flow, and that auto-inserted branch is enough to violate it ("must only
// be called from subgroup uniform control flow" -- confirmed by triggering
// it during this file's development). Dispatching via the explicit
// `[workgroupCount, 1, 1]` array form instead skips that guard entirely.
const DISPATCH_SIZE = [ WORKGROUP_COUNT, 1, 1 ];

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'subgroup functions', () => {

		rawComputeTest( 'subgroupSize is a plausible, non-skipped value', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const output = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				output.element( instanceIndex ).assign( subgroupSize );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				assert.ok( data[ i ] >= 1 && data[ i ] <= 128, `invocation ${ i }: subgroupSize (${ data[ i ] }) should be a plausible subgroup size` );

			}

		} );

		rawComputeTest( 'subgroupAdd, subgroupMin, subgroupMax reduce across the whole subgroup', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const laneIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const groupSizeOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const addOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const minOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const maxOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				// value(lane) = lane + 1, so the sum has a simple closed form
				// (a triangular number) and min/max are unambiguous (0 is
				// never contributed, so min > 0 genuinely exercises the
				// reduction rather than trivially reading back a contributed 0).
				const value = invocationSubgroupIndex.add( uint( 1 ) );

				laneIdOut.element( instanceIndex ).assign( invocationSubgroupIndex );
				groupSizeOut.element( instanceIndex ).assign( subgroupSize );
				addOut.element( instanceIndex ).assign( subgroupAdd( value ) );
				minOut.element( instanceIndex ).assign( subgroupMin( value ) );
				maxOut.element( instanceIndex ).assign( subgroupMax( value ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const laneIdData = await readUintBuffer( renderer, laneIdOut );
			const groupSizeData = await readUintBuffer( renderer, groupSizeOut );
			const addData = await readUintBuffer( renderer, addOut );
			const minData = await readUintBuffer( renderer, minOut );
			const maxData = await readUintBuffer( renderer, maxOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const n = groupSizeData[ i ];
				const expectedSum = ( n * ( n + 1 ) ) / 2; // sum_{lane=0}^{n-1} (lane+1)

				assert.strictEqual( addData[ i ], expectedSum, `invocation ${ i } (lane ${ laneIdData[ i ] }, group size ${ n }): subgroupAdd` );
				assert.strictEqual( minData[ i ], 1, `invocation ${ i }: subgroupMin should be 1 (lane 0's value)` );
				assert.strictEqual( maxData[ i ], n, `invocation ${ i }: subgroupMax should be ${ n } (last lane's value)` );

			}

		} );

		rawComputeTest( 'subgroupMul multiplies contributions from exactly two lanes', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const output = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				// Every lane contributes the multiplicative identity (1)
				// except lanes 0 and 1, which contribute 2 and 3 -- keeps the
				// product exactly 6 regardless of subgroup size (a genuinely
				// unbounded per-lane value would overflow uint32 on wide
				// subgroups), while still exercising a real multi-lane
				// combination rather than a single-contributor trivial case.
				const value = invocationSubgroupIndex
					.equal( uint( 0 ) ).select( uint( 2 ),
						invocationSubgroupIndex.equal( uint( 1 ) ).select( uint( 3 ), uint( 1 ) ) );

				output.element( instanceIndex ).assign( subgroupMul( value ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const data = await readUintBuffer( renderer, output );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				assert.strictEqual( data[ i ], 6, `invocation ${ i }: subgroupMul should be 2 * 3 * 1^(n-2) = 6` );

			}

		} );

		rawComputeTest( 'subgroupAnd, subgroupOr, subgroupXor combine one distinguishing bit per lane', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const groupSizeOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const andOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const orOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const xorOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				// Same "one bit per lane" construction as the storage-buffer
				// atomic bitwise tests (GPUAtomicsStorage.tests.js), scoped
				// to a subgroup instead of the whole dispatch: bit position
				// wraps at 32 (a uint's width), matching what the JS-side
				// expected-value computation below also wraps at.
				const bit = shiftLeft( uint( 1 ), invocationSubgroupIndex.mod( uint( 32 ) ) );

				groupSizeOut.element( instanceIndex ).assign( subgroupSize );
				// AND starts from all-ones and each lane clears its own bit
				// (contributes ~bit, identity 0xffffffff elsewhere).
				andOut.element( instanceIndex ).assign( subgroupAnd( bit.bitNot() ) );
				orOut.element( instanceIndex ).assign( subgroupOr( bit ) );
				xorOut.element( instanceIndex ).assign( subgroupXor( bit ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const groupSizeData = await readUintBuffer( renderer, groupSizeOut );
			const andData = await readUintBuffer( renderer, andOut );
			const orData = await readUintBuffer( renderer, orOut );
			const xorData = await readUintBuffer( renderer, xorOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const n = groupSizeData[ i ];
				let expectedOr = 0;
				let expectedXor = 0;

				for ( let lane = 0; lane < n; lane ++ ) {

					const bit = 1 << ( lane % 32 );
					expectedOr |= bit;
					expectedXor ^= bit;

				}

				// AND of (~bit) over every lane clears exactly the bits that
				// were contributed by at least one lane -- i.e. the bitwise
				// complement of the OR result.
				const expectedAnd = ( ~ expectedOr ) >>> 0;

				assert.strictEqual( andData[ i ] >>> 0, expectedAnd, `invocation ${ i } (group size ${ n }): subgroupAnd` );
				assert.strictEqual( orData[ i ] >>> 0, expectedOr >>> 0, `invocation ${ i } (group size ${ n }): subgroupOr` );
				assert.strictEqual( xorData[ i ] >>> 0, expectedXor >>> 0, `invocation ${ i } (group size ${ n }): subgroupXor` );

			}

		} );

		rawComputeTest( 'subgroupInclusiveAdd and subgroupExclusiveAdd compute correct prefix sums', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const laneIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const inclusiveOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const exclusiveOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				const value = invocationSubgroupIndex.add( uint( 1 ) ); // 1, 2, 3, ...

				laneIdOut.element( instanceIndex ).assign( invocationSubgroupIndex );
				inclusiveOut.element( instanceIndex ).assign( subgroupInclusiveAdd( value ) );
				exclusiveOut.element( instanceIndex ).assign( subgroupExclusiveAdd( value ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const laneIdData = await readUintBuffer( renderer, laneIdOut );
			const inclusiveData = await readUintBuffer( renderer, inclusiveOut );
			const exclusiveData = await readUintBuffer( renderer, exclusiveOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const l = laneIdData[ i ];
				// inclusive prefix sum of (1, 2, ..., l+1) = (l+1)(l+2)/2
				const expectedInclusive = ( ( l + 1 ) * ( l + 2 ) ) / 2;
				// exclusive prefix sum of (1, 2, ..., l) = l(l+1)/2 (0 at lane 0)
				const expectedExclusive = ( l * ( l + 1 ) ) / 2;

				assert.strictEqual( inclusiveData[ i ], expectedInclusive, `invocation ${ i } (lane ${ l }): subgroupInclusiveAdd` );
				assert.strictEqual( exclusiveData[ i ], expectedExclusive, `invocation ${ i } (lane ${ l }): subgroupExclusiveAdd` );

			}

		} );

		// subgroupAll()/subgroupAny() are NOT covered here: calling either
		// with the one boolean predicate argument the WGSL spec requires
		// (`subgroupAll(e: bool) -> bool`) is rejected by this codebase with
		// "parameter length exceeds limit" -- both are declared with
		// `setParameterLength(0)` in SubgroupFunctionNode.js, so as shipped
		// neither is callable for its actual purpose. See the sibling branch
		// with the fix + the (now-passing) test for this.

		rawComputeTest( 'subgroupElect is true for exactly lane 0', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const laneIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const electOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				laneIdOut.element( instanceIndex ).assign( invocationSubgroupIndex );
				electOut.element( instanceIndex ).assign( subgroupElect().select( uint( 1 ), uint( 0 ) ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const laneIdData = await readUintBuffer( renderer, laneIdOut );
			const electData = await readUintBuffer( renderer, electOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const expected = laneIdData[ i ] === 0 ? 1 : 0;
				assert.strictEqual( electData[ i ], expected, `invocation ${ i } (lane ${ laneIdData[ i ] }): subgroupElect should be true only for lane 0` );

			}

		} );

		rawComputeTest( 'subgroupBallot sets exactly bits [0, groupSize) for an always-true predicate', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const groupSizeOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const ballotXOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const ballotYOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				const ballot = subgroupBallot( bool( true ) );

				groupSizeOut.element( instanceIndex ).assign( subgroupSize );
				// A subgroup wider than 32 would need .z/.w too -- this
				// sandbox's subgroupSize (32) only ever needs .x, and .y
				// should stay 0, which the check below asserts explicitly.
				ballotXOut.element( instanceIndex ).assign( ballot.x );
				ballotYOut.element( instanceIndex ).assign( ballot.y );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const groupSizeData = await readUintBuffer( renderer, groupSizeOut );
			const ballotXData = await readUintBuffer( renderer, ballotXOut );
			const ballotYData = await readUintBuffer( renderer, ballotYOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const n = groupSizeData[ i ];

				assert.ok( n <= 32, `invocation ${ i }: this test only checks .x/.y -- group size ${ n } would need .z/.w too` );

				// Per the WGSL spec, subgroupBallot's nth bit corresponds to
				// the invocation with subgroup_invocation_id == n -- so for
				// an always-true predicate, bits [0, n) are set.
				const expectedX = n >= 32 ? 0xffffffff : ( ( 1 << n ) - 1 ) >>> 0;

				assert.strictEqual( ballotXData[ i ] >>> 0, expectedX, `invocation ${ i } (group size ${ n }): subgroupBallot(true).x` );
				assert.strictEqual( ballotYData[ i ], 0, `invocation ${ i }: subgroupBallot(true).y should be 0 for a <=32-lane subgroup` );

			}

		} );

		// subgroupBroadcastFirst() is NOT covered here: calling it with the
		// one argument the WGSL spec requires (`subgroupBroadcastFirst(e: T)
		// -> T` -- no lane id, unlike subgroupBroadcast) is rejected by this
		// codebase with "parameter length is less than minimum required" --
		// it's declared with `setParameterLength(2)` in
		// SubgroupFunctionNode.js, so three.js auto-pads a bogus second
		// argument, producing invalid WGSL. See the sibling branch with the
		// fix + the (now-passing) test for this.

		rawComputeTest( 'subgroupBroadcast reads a specific lane\'s value', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const broadcastOut = instancedArray( DISPATCH_COUNT, 'uint' );

			const kernel = Fn( () => {

				const value = invocationSubgroupIndex.add( uint( 100 ) ); // 100, 101, 102, ...

				// Every lane asks for lane 0's value explicitly.
				broadcastOut.element( instanceIndex ).assign( subgroupBroadcast( value, uint( 0 ) ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const broadcastData = await readUintBuffer( renderer, broadcastOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				assert.strictEqual( broadcastData[ i ], 100, `invocation ${ i }: subgroupBroadcast(value, 0) should read back lane 0's value (100)` );

			}

		} );

		rawComputeTest( 'subgroupShuffle reverses lane order within the subgroup', { requiredFeature: 'subgroups' }, async ( { assert, renderer } ) => {

			const laneIdOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const groupSizeOut = instancedArray( DISPATCH_COUNT, 'uint' );
			const shuffledOut = instancedArray( DISPATCH_COUNT, 'int' );

			const kernel = Fn( () => {

				const laneId = invocationSubgroupIndex;
				const targetLane = subgroupSize.sub( uint( 1 ) ).sub( laneId );

				laneIdOut.element( instanceIndex ).assign( laneId );
				groupSizeOut.element( instanceIndex ).assign( subgroupSize );
				// Each lane fetches the value from its mirror-image lane
				// (targetLane) -- so the value it fetches is that lane's own
				// id, and the expected result is fully determined by
				// (laneId, groupSize) alone.
				shuffledOut.element( instanceIndex ).assign( subgroupShuffle( laneId.toInt(), targetLane ) );

			} )().compute( DISPATCH_SIZE, [ WORKGROUP_SIZE ] );

			await renderer.computeAsync( kernel );

			const laneIdData = await readUintBuffer( renderer, laneIdOut );
			const groupSizeData = await readUintBuffer( renderer, groupSizeOut );
			const shuffledData = await readIntBuffer( renderer, shuffledOut );

			for ( let i = 0; i < DISPATCH_COUNT; i ++ ) {

				const laneId = laneIdData[ i ];
				const n = groupSizeData[ i ];
				const expected = n - 1 - laneId;

				assert.strictEqual( shuffledData[ i ], expected, `invocation ${ i } (lane ${ laneId }, group size ${ n }): subgroupShuffle should fetch the mirror lane's id (${ expected })` );

			}

		} );

	} );

} );
