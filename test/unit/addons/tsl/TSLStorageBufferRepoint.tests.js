import * as THREE from 'three/webgpu';
import { Fn, instanceIndex, storage, texture, int, uint, ivec2, vec2, renderGroup } from 'three/tsl';
import { getSharedRenderer } from './gpu-test-utils.js';

// Minimal reproduction for a WebGPU bind-group caching bug: when a storage buffer node's
// `.value` is repointed at a different `BufferAttribute` (`node.value = otherAttribute`) between
// `renderer.compute()` calls, the new attribute wasn't folded into the bind group's cache
// key/version, so a stale bind group -- still wired to the previous attribute -- could be reused.
// Fixed in `Bindings.js` by folding the attribute's id/version into the same cache key used for
// sampled textures. Each test below builds a compute kernel once, then repoints its storage
// node(s) immediately before each dispatch, with no `await` in between, and checks that every
// dispatch actually wrote to the buffer it was pointed at.
//
// Two related bugs, in the same function, are also covered here:
// - The attribute-sync/cache-key logic above was (and, for the identity-sync half, always had
//   been) gated behind `updateGroup()`, which for a storage node explicitly assigned to a
//   non-default group (`renderGroup`/`frameGroup` via `.setGroup()`) can permanently return
//   `false` after the first check -- since nothing ever calls `.update()` on those shared group
//   nodes to bump their version. That silently dropped every repoint after the first for such a
//   node. See the "non-default group" test below.
// - A sampler's key (built from wrap/filter/anisotropy) was only recomputed when the bound
//   texture's `version` changed, and even then was never folded into the bind-group cache key.
//   Sampler-only setting changes don't bump `texture.version`, so a bind group could keep
//   serving a stale sampler indefinitely. See the "sampler settings" test below.
//
// The cache-key fix above also means storage-only bind groups are now actually cached (they
// previously always rebuilt from scratch, see the note on the first two tests below), so a
// disposed attribute needs its cached entries evicted the same way `Textures.js` already does for
// disposed textures -- otherwise `bindingsData.groups`/`versions` grow one entry per distinct
// attribute id forever. The "dispose eviction" test below reaches into renderer internals
// (`renderer._bindings`) to confirm that cleanup actually runs; there's no public API surface to
// observe it through, so a black-box test can't tell a leaked cache entry from a correctly-evicted
// one.

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

		// Note: this test (and the interleaved-kernels one below it) would pass even without the
		// cache-key fix -- a storage-only bind group never had a texture/uniform buffer binding to
		// contribute a non-empty cache key, so it was always rebuilt from scratch regardless of
		// caching correctness. They're kept as cheap regression/soak coverage over many repointed
		// dispatches; the "texture+storage" and "non-default group" tests further down are what
		// actually exercise the two bugs this file fixes.
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

		// The non-default-group case this fix covers: a storage node explicitly assigned to
		// `renderGroup` (via `.setGroup()`) instead of the default per-object group. Nothing ever
		// bumps `renderGroup`'s own version for a compute-only kernel like this one, so
		// `updateGroup()` returns `true` on the very first check and `false` on every one after --
		// meaning the storage-buffer identity/cache-key sync has to run unconditionally, not
		// gated behind that check, or every repoint after the first is silently dropped.
		repointTest( 'storage node assigned to a non-default group (renderGroup) still tracks repointed dispatches', async ( assert, renderer ) => {

			const count = 64;
			const iterations = 32;
			const initialValue = 1;

			const attrA = makeBuffer( count, initialValue );
			const attrB = makeBuffer( count, 0 );

			const readNode = storage( attrA, 'float', count ).toReadOnly().setGroup( renderGroup );
			const writeNode = storage( attrB, 'float', count ).setGroup( renderGroup );

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
			const firstWrong = firstMismatch( count, ( i ) => result[ i ] !== expected );

			assert.ok( firstWrong === - 1, firstWrong === - 1
				? `all ${ count } elements equal ${ expected } after ${ iterations } repointed dispatches on a non-default (renderGroup) storage node`
				: `element ${ firstWrong } was ${ result[ firstWrong ] }, expected ${ expected } after ${ iterations } repointed dispatches on a non-default (renderGroup) storage node (first mismatch)`
			);

			attrA.dispose?.();
			attrB.dispose?.();

		} );

		// A second, independent bug living in the same cache mechanism: a sampler's key (built
		// from wrap/filter/anisotropy) is only recomputed when the bound texture's `version`
		// changes, and even then wasn't folded into the bind-group cache key. Changing only
		// `wrapS` between dispatches -- with the same texture object, same `version` -- must
		// still produce a fresh bind group with the new sampler, not a cached one still wired to
		// the old wrap mode.
		repointTest( 'reused texture+sampler kernel picks up a wrap-mode-only change with no version bump', async ( assert, renderer ) => {

			const width = 4, height = 1;

			// four distinct texels along x, byte-encoded in the red channel: 50, 100, 150, 200
			// (normalized on sample to roughly 0.196, 0.392, 0.588, 0.784)
			const sourceData = new Uint8Array( width * height * 4 );

			for ( let i = 0; i < width; i ++ ) {

				sourceData[ i * 4 ] = ( i + 1 ) * 50;
				sourceData[ i * 4 + 1 ] = 0;
				sourceData[ i * 4 + 2 ] = 0;
				sourceData[ i * 4 + 3 ] = 255;

			}

			// UnsignedByteType (the default) so the texture stays filterable without depending on
			// a `float32Filterable` backend feature -- LinearFilter is required for this test since
			// NearestFilter alone makes a texture "unfilterable" and skips creating a sampler
			// binding entirely (see `WGSLNodeBuilder.isUnfilterable()`), which would make this test
			// not exercise the sampler code path at all.
			const sourceTexture = new THREE.DataTexture( sourceData, width, height, THREE.RGBAFormat );
			sourceTexture.magFilter = THREE.LinearFilter;
			sourceTexture.minFilter = THREE.LinearFilter;
			sourceTexture.wrapS = THREE.RepeatWrapping;
			sourceTexture.needsUpdate = true;

			const attr = makeBuffer( 1, - 1 );

			const sourceNode = texture( sourceTexture );
			const writeNode = storage( attr, 'float', 1 );

			// u = 1.125 sits exactly on texel 0's center once wrapped (1.125 mod 1 = 0.125, and
			// texel centers are at 0.125/0.375/0.625/0.875 across 4 texels) -- so RepeatWrapping
			// reads texel 0 (~0.196) with no bilinear blending. ClampToEdgeWrapping instead clamps
			// the coordinate to the last texel (~0.784), also blend-free since 1.125 is well past
			// the last texel's half-texel boundary. `sourceNode` and its texture object are never
			// repointed -- only `wrapS` changes, with no `needsUpdate`/version bump, between calls.
			const sampleKernel = Fn( () => {

				writeNode.element( 0 ).assign( sourceNode.sample( vec2( 1.125, 0.5 ) ).r );

			} )().compute( 1 );

			async function sampleOnce() {

				renderer.compute( sampleKernel );

				const data = await readBuffer( renderer, attr, 1 );

				return data[ 0 ];

			}

			const tolerance = 0.03;
			const texel0 = 50 / 255;
			const texel3 = 200 / 255;

			sourceTexture.wrapS = THREE.RepeatWrapping;
			const repeatValue = await sampleOnce();

			sourceTexture.wrapS = THREE.ClampToEdgeWrapping;
			const clampValue = await sampleOnce();

			sourceTexture.wrapS = THREE.RepeatWrapping;
			const repeatValueAgain = await sampleOnce();

			assert.ok( Math.abs( repeatValue - texel0 ) < tolerance,
				`RepeatWrapping wraps u=1.125 to texel 0 (~${ texel0.toFixed( 3 ) }), got ${ repeatValue }` );
			assert.ok( Math.abs( clampValue - texel3 ) < tolerance,
				`ClampToEdgeWrapping clamps u=1.125 to the last texel (~${ texel3.toFixed( 3 ) }), got ${ clampValue }; a stale sampler would still report ~${ texel0.toFixed( 3 ) }` );
			assert.ok( Math.abs( repeatValueAgain - texel0 ) < tolerance,
				`switching wrapS back to RepeatWrapping (again with no version bump) is picked up, got ${ repeatValueAgain }` );

			attr.dispose?.();
			sourceTexture.dispose();

		} );

		// White-box: confirms `Bindings._destroyStorageBufferBindGroups()` actually runs and evicts
		// the disposed attribute's cache entries, rather than just trusting that the code exists.
		// This reaches into `renderer._bindings` since bind-group cache state isn't exposed
		// publicly.
		repointTest( 'disposing a storage attribute evicts its cached bind-group entries', async ( assert, renderer ) => {

			const count = 8;

			const attrA = makeBuffer( count, 1 );
			const attrB = makeBuffer( count, 0 );

			const readNode = storage( attrA, 'float', count ).toReadOnly();
			const writeNode = storage( attrB, 'float', count );

			const kernel = Fn( () => {

				const v = readNode.element( instanceIndex ).toVar();
				writeNode.element( instanceIndex ).assign( v.add( 1 ) );

			} )().compute( count );

			// dispatch once to build the bind group, then repoint and dispatch again so at least
			// two distinct cache-key entries accumulate for this bind group before disposal
			renderer.compute( kernel );

			readNode.value = attrB;
			writeNode.value = attrA;
			renderer.compute( kernel );

			const bindings = renderer._bindings;
			const bindGroups = bindings.getForCompute( kernel );

			// find the bind group holding the storage binding now pointed at `attrA`
			let storageBindGroup = null;

			for ( const bindGroup of bindGroups ) {

				if ( bindGroup.bindings.some( ( binding ) => binding.isStorageBuffer && binding.attribute === attrA ) ) {

					storageBindGroup = bindGroup;

				}

			}

			assert.ok( storageBindGroup !== null, 'found the bind group holding the repointed storage attribute' );

			const attributeData = bindings.attributes.get( attrA );

			assert.ok( attributeData.bindGroups instanceof Set && attributeData.bindGroups.has( storageBindGroup ),
				'Bindings tracks that this bind group references attrA' );

			const bindGroupData = bindings.backend.get( storageBindGroup );

			assert.ok( bindGroupData.groups && Object.keys( bindGroupData.groups ).length > 0,
				'the bind group has at least one cached GPU bind-group entry before disposal' );

			attrA.dispose();

			assert.strictEqual( attributeData.bindGroups.size, 0,
				'the attribute-to-bind-group tracking set is cleared after dispose' );
			assert.strictEqual( bindGroupData.groups, undefined,
				'the disposed attribute\'s cached GPU bind-group entries are evicted' );
			assert.strictEqual( bindGroupData.versions, undefined,
				'the disposed attribute\'s cached version entries are evicted' );

			attrB.dispose?.();

		} );

	} );

} );
