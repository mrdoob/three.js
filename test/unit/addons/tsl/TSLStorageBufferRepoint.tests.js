import * as THREE from 'three/webgpu';
import { Fn, instanceIndex, storage, texture, int, uint, ivec2 } from 'three/tsl';
import { getSharedRenderer } from './gpu-test-utils.js';

// Minimal reproduction for a WebGPU bind-group caching bug: when a storage buffer node's
// `.value` is repointed at a different `BufferAttribute` (`node.value = otherAttribute`) between
// `renderer.compute()` calls, the new attribute wasn't folded into the bind group's cache
// key/version, so a stale bind group -- still wired to the previous attribute -- could be reused.
// Fixed in `Bindings.js` by folding the attribute's id/version into the same cache key used for
// sampled textures. Each test below builds a compute kernel once, then repoints its storage
// node(s) immediately before each dispatch, with no `await` in between, and checks that every
// dispatch actually wrote to the buffer it was pointed at.

function makeBuffer( count, initialValue ) {

	const data = new Float32Array( count ).fill( initialValue );

	return new THREE.StorageBufferAttribute( data, 1 );

}

async function readBuffer( renderer, attribute, count ) {

	const data = new Float32Array( await renderer.getArrayBufferAsync( attribute ) );

	return data.slice( 0, count );

}

// `vec2`-typed buffer, for the texture+storage test below.
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

function firstMismatch( count, isWrong ) {

	for ( let i = 0; i < count; i ++ ) {

		if ( isWrong( i ) ) return i;

	}

	return - 1;

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

		repointTest( 'single shared kernel survives rapid back-to-back repointed dispatches', async ( assert, renderer ) => {

			const count = 64;
			const iterations = 32;
			const initialValue = 1;

			const attrA = makeBuffer( count, initialValue );
			const attrB = makeBuffer( count, 0 );

			// One shared, repointable read/write node pair. Built once; every iteration below
			// reuses this same compiled kernel, only repointing `readNode`/`writeNode`'s `.value`
			// beforehand -- never rebuilding it.
			const readNode = storage( attrA, 'float', count ).toReadOnly();
			const writeNode = storage( attrB, 'float', count );

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
			const firstWrong = firstMismatch( count, ( i ) => result[ i ] !== expected );

			assert.ok( firstWrong === - 1, firstWrong === - 1
				? `all ${ count } elements equal ${ expected } after ${ iterations } repointed dispatches`
				: `element ${ firstWrong } was ${ result[ firstWrong ] }, expected ${ expected } after ${ iterations } repointed dispatches (first mismatch)`
			);

			attrA.dispose?.();
			attrB.dispose?.();

		} );

		repointTest( 'two distinct kernels sharing one repointed node pair stay correct when interleaved', async ( assert, renderer ) => {

			// Several *different* compiled kernels (not just one) all referencing the same shared
			// read/write node pair, dispatched in an interleaved sequence -- in case cross-kernel
			// bind-group aliasing on the shared nodes, rather than same-kernel reuse, is what
			// matters.

			const count = 64;
			const iterations = 32;

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

			const firstWrong = firstMismatch( count, ( i ) => result[ i ] !== expected );

			assert.ok( firstWrong === - 1, firstWrong === - 1
				? `all ${ count } elements equal ${ expected } after ${ iterations } interleaved dispatches across 2 kernels`
				: `element ${ firstWrong } was ${ result[ firstWrong ] }, expected ${ expected } (first mismatch)`
			);

			attrA.dispose?.();
			attrB.dispose?.();

		} );

		// The specific case this PR fixes: a kernel binds a *texture* alongside a storage buffer
		// in the same bind group. If the same texture object is reused unchanged across calls
		// while only the storage buffer's node is repointed to a different attribute, a bind-group
		// cache keyed only on the texture's identity/version could return a bind group still wired
		// to the previous storage attribute. This isolates exactly that: one texture, reused
		// across many calls, while the storage write target alternates every call.
		repointTest( 'texture+storage kernel reused with the same texture object across alternating storage targets', async ( assert, renderer ) => {

			const width = 64, height = 64;
			const count = width * height;
			const calls = 16;

			const sourceData = new Float32Array( count * 4 );

			for ( let i = 0; i < count; i ++ ) {

				sourceData[ i * 4 ] = 7;
				sourceData[ i * 4 + 1 ] = 3;
				sourceData[ i * 4 + 2 ] = 0;
				sourceData[ i * 4 + 3 ] = 1;

			}

			const sourceTexture = new THREE.DataTexture( sourceData, width, height, THREE.RGBAFormat, THREE.FloatType );
			sourceTexture.needsUpdate = true;

			const attrA = makeVec2Buffer( count, - 1, - 1 );
			const attrB = makeVec2Buffer( count, - 1, - 1 );

			const sourceNode = texture( sourceTexture );
			const writeNode = storage( attrA, 'vec2', count );

			// texture -> storage: a 2D-indexed texture read, flat storage write -- built once,
			// `sourceNode` never repointed (same texture every call), only `writeNode.value`
			// alternates.
			const loadKernel = Fn( () => {

				const x = instanceIndex.mod( uint( width ) );
				const y = instanceIndex.div( uint( width ) );

				writeNode.element( instanceIndex ).assign( sourceNode.load( ivec2( int( x ), int( y ) ) ).rg );

			} )().compute( count );

			let target = 'A';
			let firstWrong = - 1;
			let firstWrongCall = - 1;
			let firstWrongValue = null;
			let firstWrongOtherBuffer = null;

			for ( let call = 0; call < calls && firstWrong === - 1; call ++ ) {

				// Both buffers were seeded with (-1, -1) above, so a stale bind group that
				// silently keeps writing to the *other* buffer (or doesn't write at all) shows up
				// here as leftover (-1, -1) instead of the freshly loaded (7, 3).
				const targetAttribute = target === 'A' ? attrA : attrB;
				const otherAttribute = target === 'A' ? attrB : attrA;

				writeNode.value = targetAttribute;

				renderer.compute( loadKernel );

				const { x, y } = await readVec2Buffer( renderer, targetAttribute, count );

				firstWrong = firstMismatch( count, ( i ) => x[ i ] !== 7 || y[ i ] !== 3 );

				if ( firstWrong !== - 1 ) {

					firstWrongCall = call;
					firstWrongValue = { x: x[ firstWrong ], y: y[ firstWrong ] };
					firstWrongOtherBuffer = await readVec2Buffer( renderer, otherAttribute, count );

				}

				target = target === 'A' ? 'B' : 'A';

			}

			assert.ok( firstWrong === - 1, firstWrong === - 1
				? `all ${ calls } calls (alternating storage target, same reused texture) wrote (7, 3) correctly`
				: `call ${ firstWrongCall }: element ${ firstWrong } was (${ firstWrongValue.x }, ${ firstWrongValue.y }), expected (7, 3); other buffer's element ${ firstWrong } is (${ firstWrongOtherBuffer.x[ firstWrong ] }, ${ firstWrongOtherBuffer.y[ firstWrong ] })`
			);

			attrA.dispose?.();
			attrB.dispose?.();
			sourceTexture.dispose();

		} );

	} );

} );
