import * as THREE from 'three/webgpu';
import {
	Fn, If, Loop, instanceIndex, storage, texture, uniform, vec2, float, int, uint, ivec2, sin,
	workgroupArray, workgroupBarrier, workgroupId, globalId, localId
} from 'three/tsl';
import { getSharedRenderer } from './gpu-test-utils.js';

// Minimal reproduction for a WebGPU bind-group caching bug: when a storage buffer node's
// `.value` is repointed at a different `BufferAttribute` (`node.value = otherAttribute`) between
// `renderer.compute()` calls, the new attribute wasn't folded into the bind group's cache
// key/version, so a stale bind group -- still wired to the previous attribute -- could be reused.
// Each test below builds a compute kernel once, then repoints its storage node(s) immediately
// before each dispatch, with no `await` in between, and checks that every dispatch actually wrote
// to the buffer it was pointed at.

function makeBuffer( count, initialValue ) {

	const data = new Float32Array( count ).fill( initialValue );

	return new THREE.StorageBufferAttribute( data, 1 );

}

async function readBuffer( renderer, attribute, count ) {

	const data = new Float32Array( await renderer.getArrayBufferAsync( attribute ) );

	return data.slice( 0, count );

}

// `vec2`-typed buffer, for tests that exercise a 2-component element type instead of `float`.
function makeVec2Buffer( count, initialX, initialY ) {

	const data = new Float32Array( count * 2 );

	for ( let i = 0; i < count; i ++ ) {

		data[ i * 2 ] = initialX;
		data[ i * 2 + 1 ] = initialY;

	}

	return new THREE.StorageBufferAttribute( data, 2 );

}

async function readVec2Buffer( renderer, attribute, count ) {

	const data = new Float32Array( await renderer.getArrayBufferAsync( attribute ) );
	const x = new Float32Array( count );
	const y = new Float32Array( count );

	for ( let i = 0; i < count; i ++ ) {

		x[ i ] = data[ i * 2 ];
		y[ i ] = data[ i * 2 + 1 ];

	}

	return { x, y };

}

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'Storage buffer node repointing (GPGPU, WebGPU-only)', () => {

		function repointTest( name, run ) {

			QUnit.test( name, async ( assert ) => {

				const renderer = await getSharedRenderer( 'webgpu' );

				if ( renderer === null ) {

					assert.ok( true, 'SKIPPED: "webgpu" backend is not available in this environment.' );
					return;

				}

				await run( assert, renderer );

			} );

		}

		[ 8, 64, 256 ].forEach( ( iterations ) => {

			repointTest( `single shared kernel survives ${ iterations } rapid back-to-back repointed dispatches`, async ( assert, renderer ) => {

				const count = 64;
				const initialValue = 1;

				const attrA = makeBuffer( count, initialValue );
				const attrB = makeBuffer( count, 0 );

				// One shared, repointable read/write node pair.
				const readNode = storage( attrA, 'float', count ).toReadOnly();
				const writeNode = storage( attrB, 'float', count );

				// Built once; every iteration below reuses this same compiled kernel, only
				// repointing `readNode`/`writeNode`'s `.value` beforehand -- never rebuilding it.
				const kernel = Fn( () => {

					const v = readNode.element( instanceIndex ).toVar();
					writeNode.element( instanceIndex ).assign( v.add( 1 ) );

				} )().compute( count );

				let current = 'A'; // which attribute currently holds the live data

				for ( let i = 0; i < iterations; i ++ ) {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				}

				// After the loop, `current` names the buffer the *next* pass would read from --
				// i.e. the one the last dispatch just wrote to, which holds the live result.
				const liveAttribute = current === 'A' ? attrA : attrB;
				const result = await readBuffer( renderer, liveAttribute, count );

				const expected = initialValue + iterations;
				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( result[ i ] !== expected ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `all ${ count } elements equal ${ expected } after ${ iterations } repointed dispatches`
					: `element ${ firstWrong } was ${ result[ firstWrong ] }, expected ${ expected } after ${ iterations } repointed dispatches (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			} );

		} );

		repointTest( 'two distinct kernels sharing one repointed node pair stay correct when interleaved', async ( assert, renderer ) => {

			// Several *different* compiled kernels (not just one) all referencing the same shared
			// read/write node pair, dispatched in an interleaved sequence -- in case cross-kernel
			// bind-group aliasing on the shared nodes, rather than same-kernel reuse, is what
			// matters.

			const count = 64;
			const iterations = 64;

			const attrA = makeBuffer( count, 1 );
			const attrB = makeBuffer( count, 0 );

			const readNode = storage( attrA, 'float', count ).toReadOnly();
			const writeNode = storage( attrB, 'float', count );

			const incrementKernel = Fn( () => {

				const v = readNode.element( instanceIndex ).toVar();
				writeNode.element( instanceIndex ).assign( v.add( 1 ) );

			} )().compute( count );

			const doubleKernel = Fn( () => {

				const v = readNode.element( instanceIndex ).toVar();
				writeNode.element( instanceIndex ).assign( v.mul( 2 ) );

			} )().compute( count );

			let current = 'A';
			let expected = 1;

			for ( let i = 0; i < iterations; i ++ ) {

				readNode.value = current === 'A' ? attrA : attrB;
				writeNode.value = current === 'A' ? attrB : attrA;

				const useDouble = ( i % 3 === 0 );
				renderer.compute( useDouble ? doubleKernel : incrementKernel );
				expected = useDouble ? expected * 2 : expected + 1;

				current = current === 'A' ? 'B' : 'A';

			}

			const liveAttribute = current === 'A' ? attrA : attrB;
			const result = await readBuffer( renderer, liveAttribute, count );

			let firstWrong = -1;

			for ( let i = 0; i < count; i ++ ) {

				if ( result[ i ] !== expected ) {

					firstWrong = i;
					break;

				}

			}

			assert.ok( firstWrong === -1, firstWrong === -1
				? `all ${ count } elements equal ${ expected } after ${ iterations } interleaved dispatches across 2 kernels`
				: `element ${ firstWrong } was ${ result[ firstWrong ] }, expected ${ expected } (first mismatch)`
			);

			attrA.dispose?.();
			attrB.dispose?.();

		} );

		repointTest( 'repeated repoint-and-dispatch runs stay correct across many separate calls (not just one long chain)', async ( assert, renderer ) => {

			// Runs the single-kernel repoint chain from the first test many times over, each with
			// its own fresh buffers/kernel, to catch nondeterministic corruption that a single run
			// might not hit.

			const count = 64;
			const iterations = 32;
			const runs = 12;

			for ( let run = 0; run < runs; run ++ ) {

				const initialValue = run + 1;

				const attrA = makeBuffer( count, initialValue );
				const attrB = makeBuffer( count, 0 );

				const readNode = storage( attrA, 'float', count ).toReadOnly();
				const writeNode = storage( attrB, 'float', count );

				const kernel = Fn( () => {

					const v = readNode.element( instanceIndex ).toVar();
					writeNode.element( instanceIndex ).assign( v.add( 1 ) );

				} )().compute( count );

				let current = 'A';

				for ( let i = 0; i < iterations; i ++ ) {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				}

				const liveAttribute = current === 'A' ? attrA : attrB;
				const result = await readBuffer( renderer, liveAttribute, count );

				const expected = initialValue + iterations;
				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( result[ i ] !== expected ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `run ${ run }: all elements equal ${ expected }`
					: `run ${ run }: element ${ firstWrong } was ${ result[ firstWrong ] }, expected ${ expected } (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			}

		} );

		// From here down: larger scale (`vec2` elements, up to 1,048,576 elements) and a uniform
		// value changed on every dispatch in lockstep with the storage-node repointing, to check
		// that scale and a concurrently-changing uniform don't affect the fix.

		[ 65536, 1048576 ].forEach( ( count ) => {

			repointTest( `vec2 buffer at FFT2D scale (${ count } elements) survives 32 rapid repointed dispatches`, async ( assert, renderer ) => {

				const iterations = 32;

				const attrA = makeVec2Buffer( count, 1, -1 );
				const attrB = makeVec2Buffer( count, 0, 0 );

				const readNode = storage( attrA, 'vec2', count ).toReadOnly();
				const writeNode = storage( attrB, 'vec2', count );

				const kernel = Fn( () => {

					const v = readNode.element( instanceIndex ).toVar();
					writeNode.element( instanceIndex ).assign( vec2( v.x.add( 1 ), v.y.sub( 1 ) ) );

				} )().compute( count );

				let current = 'A';

				for ( let i = 0; i < iterations; i ++ ) {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				}

				const liveAttribute = current === 'A' ? attrA : attrB;
				const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

				const expectedX = 1 + iterations;
				const expectedY = -1 - iterations;
				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== expectedX || y[ i ] !== expectedY ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `all ${ count } elements equal (${ expectedX }, ${ expectedY }) after ${ iterations } repointed dispatches`
					: `element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expectedX }, ${ expectedY }) (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			} );

		} );

		repointTest( 'uniform value changed every dispatch alongside repointed storage nodes (per-stage fallback shape, 1048576 elements x 20 stages)', async ( assert, renderer ) => {

			// A uniform value and the storage-node repointing both change together immediately
			// before each `renderer.compute()` call, with zero `await` between stages.

			const count = 1048576; // 1024x1024
			const stages = 20;

			const attrA = makeVec2Buffer( count, 0, 0 );
			const attrB = makeVec2Buffer( count, 0, 0 );

			const readNode = storage( attrA, 'vec2', count ).toReadOnly();
			const writeNode = storage( attrB, 'vec2', count );
			const stageUniform = uniform( 1, 'uint' );

			// out[i] = in[i] + stageUniform, kept trivial so the expected result stays exactly
			// verifiable.
			const kernel = Fn( () => {

				const v = readNode.element( instanceIndex ).toVar();
				const s = float( stageUniform );
				writeNode.element( instanceIndex ).assign( vec2( v.x.add( s ), v.y ) );

			} )().compute( count );

			let current = 'A';
			let expected = 0;

			for ( let s = 0; s < stages; s ++ ) {

				stageUniform.value = 1 << s;

				readNode.value = current === 'A' ? attrA : attrB;
				writeNode.value = current === 'A' ? attrB : attrA;

				renderer.compute( kernel );

				expected += 1 << s;
				current = current === 'A' ? 'B' : 'A';

			}

			const liveAttribute = current === 'A' ? attrA : attrB;
			const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

			let firstWrong = -1;

			for ( let i = 0; i < count; i ++ ) {

				if ( x[ i ] !== expected || y[ i ] !== 0 ) {

					firstWrong = i;
					break;

				}

			}

			assert.ok( firstWrong === -1, firstWrong === -1
				? `all ${ count } elements equal ${ expected } after ${ stages } stages of repointed dispatches`
				: `element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expected }, 0) after ${ stages } stages (first mismatch)`
			);

			attrA.dispose?.();
			attrB.dispose?.();

		} );

		repointTest( 'per-stage fallback shape repeated across 6 separate runs (1048576 elements x 20 stages each)', async ( assert, renderer ) => {

			// Same as the previous test, but repeated -- to catch nondeterministic corruption a
			// single run might not hit.

			const count = 1048576;
			const stages = 20;
			const runs = 6;

			for ( let run = 0; run < runs; run ++ ) {

				const attrA = makeVec2Buffer( count, 0, 0 );
				const attrB = makeVec2Buffer( count, 0, 0 );

				const readNode = storage( attrA, 'vec2', count ).toReadOnly();
				const writeNode = storage( attrB, 'vec2', count );
				const stageUniform = uniform( 1, 'uint' );

				const kernel = Fn( () => {

					const v = readNode.element( instanceIndex ).toVar();
					const s = float( stageUniform );
					writeNode.element( instanceIndex ).assign( vec2( v.x.add( s ), v.y ) );

				} )().compute( count );

				let current = 'A';
				let expected = 0;

				for ( let s = 0; s < stages; s ++ ) {

					stageUniform.value = 1 << s;

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					expected += 1 << s;
					current = current === 'A' ? 'B' : 'A';

				}

				const liveAttribute = current === 'A' ? attrA : attrB;
				const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== expected || y[ i ] !== 0 ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `run ${ run }: all elements equal ${ expected }`
					: `run ${ run }: element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expected }, 0) (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			}

		} );

		// A tiled, workgroup-shared-memory, 2D-dispatched transpose kernel, with an explicit
		// `workgroupBarrier()` between the load and store phases -- structurally different from
		// the flat, global-memory-only, 1D-dispatched kernels used above, to check that kernels
		// alternating between these two shapes while sharing the same repointed nodes stay
		// correct. Since a transpose is a pure permutation (it moves values, never changes them),
		// composing transpose-forward + transpose-back is the identity -- so a value-preserving
		// invariant stays checkable even through the permutation.
		function buildTransposeKernel( rows, cols, tile, readNode, writeNode ) {

			const sharedTile = workgroupArray( 'vec2', tile * tile );

			const numWorkgroupsX = Math.ceil( cols / tile );
			const numWorkgroupsY = Math.ceil( rows / tile );

			return Fn( () => {

				const gx = globalId.x;
				const gy = globalId.y;
				const lx = localId.x;
				const ly = localId.y;
				const wx = workgroupId.x;
				const wy = workgroupId.y;

				If( gx.lessThan( uint( cols ) ).and( gy.lessThan( uint( rows ) ) ), () => {

					sharedTile.element( ly.mul( uint( tile ) ).add( lx ) ).assign( readNode.element( gy.mul( uint( cols ) ).add( gx ) ) );

				} );

				workgroupBarrier();

				const outX = wy.mul( uint( tile ) ).add( lx );
				const outY = wx.mul( uint( tile ) ).add( ly );

				If( outX.lessThan( uint( rows ) ).and( outY.lessThan( uint( cols ) ) ), () => {

					const v = sharedTile.element( lx.mul( uint( tile ) ).add( ly ) ).toVar();
					writeNode.element( outY.mul( uint( rows ) ).add( outX ) ).assign( v );

				} );

			} )().compute( [ numWorkgroupsX, numWorkgroupsY ], [ tile, tile ] );

		}

		[ [ 1024, 1024 ], [ 2048, 1024 ] ].forEach( ( [ width, height ] ) => {

			repointTest( `mixed global-memory / shared-memory kernels sharing repointed nodes, matching _runButterflyPasses' shape (${ width }x${ height })`, async ( assert, renderer ) => {

				// A row pass (several per-stage dispatches, global memory) -> transpose (one
				// dispatch, shared memory + barrier) -> column pass (several per-stage dispatches,
				// global memory) -> transpose back (one dispatch, shared memory + barrier) -- all
				// sharing the same 2 repointed nodes, no `await` anywhere in the sequence. The
				// row/column math is a simple, position-independent `x += stageValue` so the
				// expected result stays exactly checkable regardless of how the transposes permute
				// element positions.

				const count = width * height;
				const tile = 16;
				const rowStages = Math.round( Math.log2( width ) );
				const colStages = Math.round( Math.log2( height ) );

				const attrA = makeVec2Buffer( count, 0, 0 );
				const attrB = makeVec2Buffer( count, 0, 0 );

				const readNode = storage( attrA, 'vec2', count ).toReadOnly();
				const writeNode = storage( attrB, 'vec2', count );
				const stageUniform = uniform( 1, 'uint' );

				const addKernel = Fn( () => {

					const v = readNode.element( instanceIndex ).toVar();
					const s = float( stageUniform );
					writeNode.element( instanceIndex ).assign( vec2( v.x.add( s ), v.y ) );

				} )().compute( count );

				const transposeFwdKernel = buildTransposeKernel( height, width, tile, readNode, writeNode );
				const transposeBackKernel = buildTransposeKernel( width, height, tile, readNode, writeNode );

				let current = 'A';
				let expected = 0;

				const dispatchPingPong = ( kernel ) => {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				};

				for ( let s = 0; s < rowStages; s ++ ) {

					stageUniform.value = 1 << s;
					dispatchPingPong( addKernel );
					expected += 1 << s;

				}

				dispatchPingPong( transposeFwdKernel );

				for ( let s = 0; s < colStages; s ++ ) {

					stageUniform.value = 1 << s;
					dispatchPingPong( addKernel );
					expected += 1 << s;

				}

				dispatchPingPong( transposeBackKernel );

				const liveAttribute = current === 'A' ? attrA : attrB;
				const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== expected || y[ i ] !== 0 ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `all ${ count } elements equal ${ expected } after the full row/transpose/col/transpose-back sequence`
					: `element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expected }, 0) (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			} );

		} );

		repointTest( 'mixed global-memory / shared-memory kernel sequence repeated across 6 separate runs (1024x1024)', async ( assert, renderer ) => {

			// Same sequence as above, repeated, since a single run is not enough to trust a pass
			// against nondeterministic corruption.

			const width = 1024, height = 1024;
			const count = width * height;
			const tile = 16;
			const rowStages = Math.round( Math.log2( width ) );
			const colStages = Math.round( Math.log2( height ) );
			const runs = 6;

			for ( let run = 0; run < runs; run ++ ) {

				const attrA = makeVec2Buffer( count, 0, 0 );
				const attrB = makeVec2Buffer( count, 0, 0 );

				const readNode = storage( attrA, 'vec2', count ).toReadOnly();
				const writeNode = storage( attrB, 'vec2', count );
				const stageUniform = uniform( 1, 'uint' );

				const addKernel = Fn( () => {

					const v = readNode.element( instanceIndex ).toVar();
					const s = float( stageUniform );
					writeNode.element( instanceIndex ).assign( vec2( v.x.add( s ), v.y ) );

				} )().compute( count );

				const transposeFwdKernel = buildTransposeKernel( height, width, tile, readNode, writeNode );
				const transposeBackKernel = buildTransposeKernel( width, height, tile, readNode, writeNode );

				let current = 'A';
				let expected = 0;

				const dispatchPingPong = ( kernel ) => {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				};

				for ( let s = 0; s < rowStages; s ++ ) {

					stageUniform.value = 1 << s;
					dispatchPingPong( addKernel );
					expected += 1 << s;

				}

				dispatchPingPong( transposeFwdKernel );

				for ( let s = 0; s < colStages; s ++ ) {

					stageUniform.value = 1 << s;
					dispatchPingPong( addKernel );
					expected += 1 << s;

				}

				dispatchPingPong( transposeBackKernel );

				const liveAttribute = current === 'A' ? attrA : attrB;
				const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== expected || y[ i ] !== 0 ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `run ${ run }: all elements equal ${ expected }`
					: `run ${ run }: element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expected }, 0) (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			}

		} );

		// Every kernel above is cheap -- a handful of ALU ops per invocation. FFT2D's real
		// butterfly kernels do meaningfully more work per invocation (cos/sin twiddle factors,
		// several reads/writes), so real dispatches run measurably longer on the GPU. If the
		// corruption is a genuine race between the CPU re-pointing nodes and what the GPU has
		// actually consumed -- rather than a pure JS-side binding bug, which should be timing-
		// independent -- a longer-running kernel gives that race a bigger window. This burns real
		// GPU cycles (many `sin` calls) per invocation while keeping the arithmetic result exactly
		// verifiable: `sin(i) - sin(i)` is exactly 0 in IEEE754 (same computed value subtracted
		// from itself), so the busy-work never perturbs the expected total.
		function buildSlowAddKernel( count, busyIterations, readNode, writeNode ) {

			return Fn( () => {

				const v = readNode.element( instanceIndex ).toVar();
				const acc = float( 0 ).toVar();

				Loop( { start: 0, end: busyIterations, type: 'int' }, ( { i } ) => {

					const angle = float( i ).add( instanceIndex.toFloat() );
					acc.assign( acc.add( sin( angle ) ).sub( sin( angle ) ) );

				} );

				writeNode.element( instanceIndex ).assign( vec2( v.x.add( 1 ).add( acc ), v.y.add( acc ) ) );

			} )().compute( count );

		}

		[ 4, 64 ].forEach( ( busyIterations ) => {

			repointTest( `slow kernel (${ busyIterations }x busy-work per invocation) sharing repointed nodes survives 64 rapid dispatches (1048576 elements)`, async ( assert, renderer ) => {

				const count = 1048576;
				const iterations = 64;

				const attrA = makeVec2Buffer( count, 0, 0 );
				const attrB = makeVec2Buffer( count, 0, 0 );

				const readNode = storage( attrA, 'vec2', count ).toReadOnly();
				const writeNode = storage( attrB, 'vec2', count );

				const kernel = buildSlowAddKernel( count, busyIterations, readNode, writeNode );

				let current = 'A';

				for ( let i = 0; i < iterations; i ++ ) {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				}

				const liveAttribute = current === 'A' ? attrA : attrB;
				const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

				const expectedX = iterations;
				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== expectedX || y[ i ] !== 0 ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `all ${ count } elements equal (${ expectedX }, 0) after ${ iterations } dispatches of a slow kernel`
					: `element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expectedX }, 0) (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			} );

		} );

		// Combines the slow kernel with the mixed global-memory/shared-memory transpose sequence
		// from above, at hardwood's actual scale, repeated -- the most demanding single test in
		// this file: real element count, real mixed kernel shapes, and per-invocation duration
		// closer to the real butterfly math than anything tested so far.
		repointTest( 'slow kernels + transpose sequence sharing repointed nodes, repeated 4x (2048x1024)', async ( assert, renderer ) => {

			const width = 2048, height = 1024;
			const count = width * height;
			const tile = 16;
			const busyIterations = 16;
			const rowStages = Math.round( Math.log2( width ) );
			const colStages = Math.round( Math.log2( height ) );
			const runs = 4;

			for ( let run = 0; run < runs; run ++ ) {

				const attrA = makeVec2Buffer( count, 0, 0 );
				const attrB = makeVec2Buffer( count, 0, 0 );

				const readNode = storage( attrA, 'vec2', count ).toReadOnly();
				const writeNode = storage( attrB, 'vec2', count );

				const addKernel = buildSlowAddKernel( count, busyIterations, readNode, writeNode );
				const transposeFwdKernel = buildTransposeKernel( height, width, tile, readNode, writeNode );
				const transposeBackKernel = buildTransposeKernel( width, height, tile, readNode, writeNode );

				let current = 'A';

				const dispatchPingPong = ( kernel ) => {

					readNode.value = current === 'A' ? attrA : attrB;
					writeNode.value = current === 'A' ? attrB : attrA;

					renderer.compute( kernel );

					current = current === 'A' ? 'B' : 'A';

				};

				for ( let s = 0; s < rowStages; s ++ ) dispatchPingPong( addKernel );

				dispatchPingPong( transposeFwdKernel );

				for ( let s = 0; s < colStages; s ++ ) dispatchPingPong( addKernel );

				dispatchPingPong( transposeBackKernel );

				const liveAttribute = current === 'A' ? attrA : attrB;
				const { x, y } = await readVec2Buffer( renderer, liveAttribute, count );

				const expected = rowStages + colStages;
				let firstWrong = -1;

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== expected || y[ i ] !== 0 ) {

						firstWrong = i;
						break;

					}

				}

				assert.ok( firstWrong === -1, firstWrong === -1
					? `run ${ run }: all elements equal (${ expected }, 0)`
					: `run ${ run }: element ${ firstWrong } was (${ x[ firstWrong ] }, ${ y[ firstWrong ] }), expected (${ expected }, 0) (first mismatch)`
				);

				attrA.dispose?.();
				attrB.dispose?.();

			}

		} );

		// A different untested factor: `_load`/`_store` bind a *texture* alongside a storage
		// buffer in the same kernel. The WebGPU backend's bind-group cache key is built ONLY from
		// texture identity/version (`cacheKey += texture.id + ','`, `version += texture.version`
		// in Bindings.js) -- a storage buffer's attribute changing contributes nothing to that key.
		// So if the *same* texture object is reused across calls (exactly what happens when
		// webgpu_fft_2d.html's `resourceCache` reuses `complexSource[c]` across preset switches of
		// the same size) while only the storage side has been repointed, a cache lookup keyed
		// purely on the unchanged texture could return a bind group still wired to the *previous*
		// storage attribute. This isolates exactly that: one texture, reused across many calls,
		// while the storage write target alternates every call.
		repointTest( 'texture+storage kernel reused with the same texture object across alternating storage targets (1024x1024)', async ( assert, renderer ) => {

			const width = 1024, height = 1024;
			const count = width * height;
			const calls = 64;

			const sourceData = new Float32Array( count * 4 );

			for ( let i = 0; i < count; i ++ ) {

				sourceData[ i * 4 ] = 7;
				sourceData[ i * 4 + 1 ] = 3;
				sourceData[ i * 4 + 2 ] = 0;
				sourceData[ i * 4 + 3 ] = 1;

			}

			const sourceTexture = new THREE.DataTexture( sourceData, width, height, THREE.RGBAFormat, THREE.FloatType );
			sourceTexture.needsUpdate = true;

			const attrA = makeVec2Buffer( count, -1, -1 );
			const attrB = makeVec2Buffer( count, -1, -1 );

			const sourceNode = texture( sourceTexture );
			const writeNode = storage( attrA, 'vec2', count );

			// texture -> storage, exactly FFT2D._load's shape (2D-indexed texture read, flat
			// storage write) -- built once, `sourceNode` never repointed (same texture every
			// call), only `writeNode.value` alternates.
			const loadKernel = Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				writeNode.element( instanceIndex ).assign( sourceNode.load( ivec2( int( x ), int( y ) ) ).rg );

			} )().compute( count );

			let target = 'A';
			let firstWrong = -1;
			let firstWrongCall = -1;
			let firstWrongValue = null;
			let firstWrongOtherBuffer = null;

			for ( let call = 0; call < calls && firstWrong === -1; call ++ ) {

				// Both buffers were seeded with (-1, -1) above, so a stale bind group that
				// silently keeps writing to the *other* buffer (or doesn't write at all) shows up
				// here as leftover (-1, -1) instead of the freshly loaded (7, 3).
				const targetAttribute = target === 'A' ? attrA : attrB;
				const otherAttribute = target === 'A' ? attrB : attrA;

				writeNode.value = targetAttribute;

				renderer.compute( loadKernel );

				const { x, y } = await readVec2Buffer( renderer, targetAttribute, count );

				for ( let i = 0; i < count; i ++ ) {

					if ( x[ i ] !== 7 || y[ i ] !== 3 ) {

						firstWrong = i;
						firstWrongCall = call;
						firstWrongValue = { x: x[ i ], y: y[ i ] };
						firstWrongOtherBuffer = await readVec2Buffer( renderer, otherAttribute, count );
						break;

					}

				}

				target = target === 'A' ? 'B' : 'A';

			}

			assert.ok( firstWrong === -1, firstWrong === -1
				? `all ${ calls } calls (alternating storage target, same reused texture) wrote (7, 3) correctly`
				: `call ${ firstWrongCall }: element ${ firstWrong } was (${ firstWrongValue.x }, ${ firstWrongValue.y }), expected (7, 3); other buffer's element ${ firstWrong } is (${ firstWrongOtherBuffer.x[ firstWrong ] }, ${ firstWrongOtherBuffer.y[ firstWrong ] })`
			);

			attrA.dispose?.();
			attrB.dispose?.();
			sourceTexture.dispose();

		} );

	} );

} );
