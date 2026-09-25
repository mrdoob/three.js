import { DataTexture, PerspectiveCamera } from 'three';
import { createGaussianSplatGeometry } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';
import { GaussianSplatGroup } from '../../../../examples/jsm/objects/GaussianSplatGroup.js';

// Builds a minimal splat cloud geometry with `count` splats - real enough to drive
// `GaussianSplatGroup`'s buffer bookkeeping and CPU fallback logic without needing a GPU.
function createTestSplatGeometry( count ) {

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8Array( count * 4 ).fill( 255 );

	for ( let i = 0; i < count; i ++ ) {

		centers[ i * 3 + 2 ] = i;

		covariances[ i * 6 ] = 1;
		covariances[ i * 6 + 3 ] = 1;
		covariances[ i * 6 + 5 ] = 1;

	}

	return createGaussianSplatGeometry( centers, covariances, colors );

}

// Packing is only done lazily, the next time it's needed (`splatCount`, `compact()`,
// `onBeforeRender`, ...) - see the class documentation. Reading `splatCount` after each
// mutation below forces that deterministically, so each assertion observes the buffer state
// as of that point rather than only the final state.
function sync( group ) {

	return group.splatCount;

}

function record( group, id ) {

	return group._records.get( id );

}

// The record index each slot in [start, start + count) points at.
function slotRecords( group, start, count ) {

	const centers = group._buffers.centerAttribute.array;
	const result = [];

	for ( let i = start; i < start + count; i ++ ) result.push( centers[ i * 4 + 3 ] );

	return result;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Objects', () => {

		QUnit.module( 'GaussianSplatGroup', () => {

			QUnit.test( 'defaults', ( assert ) => {

				const group = new GaussianSplatGroup();

				assert.strictEqual( group._maxSphericalHarmonicsDegree, 2, 'shDegree defaults to 2' );
				assert.strictEqual( sync( group ), 0, 'splatCount starts at 0' );
				assert.strictEqual( group.capacity, 1, 'buffers start at the 1-slot floor' );

				group.dispose();

			} );

			QUnit.test( 'adds pack into free space and only grow (by doubling) when out of room', ( assert ) => {

				const group = new GaussianSplatGroup();

				const a = group.addSplat( createTestSplatGeometry( 10 ) );

				assert.strictEqual( sync( group ), 10, 'splatCount reflects added splats' );
				assert.strictEqual( group.capacity, 10, 'capacity grows to fit the first cloud' );
				assert.strictEqual( record( group, a ).offset, 0, 'first cloud packs at slot 0' );
				assert.strictEqual( record( group, a ).recordIndex, 1, 'record slot 0 is reserved, first cloud takes slot 1' );

				const b = group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 15, 'splatCount reflects both splat clouds' );
				assert.strictEqual( group.capacity, 20, 'capacity doubles rather than growing to exactly fit' );
				assert.strictEqual( record( group, b ).offset, 10, 'second cloud packs after the first' );
				assert.strictEqual( record( group, a ).offset, 0, 'growing keeps the first cloud where it was' );
				assert.deepEqual( slotRecords( group, 0, 1 ), [ 1 ], 'grown buffers keep the old contents' );

				const centerAttribute = group._buffers.centerAttribute;
				const c = group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 20, 'splatCount reflects all three' );
				assert.strictEqual( group.capacity, 20, 'a cloud that fits does not resize' );
				assert.strictEqual( group._buffers.centerAttribute, centerAttribute, 'a cloud that fits does not reallocate the buffers' );
				assert.strictEqual( record( group, c ).offset, 15, 'third cloud packs into the remaining free range' );
				assert.deepEqual( group._dirtySplatRanges.at( - 1 ), { start: 15, count: 5 }, 'the new cloud\'s range is queued for upload' );

				group.dispose();

			} );

			QUnit.test( 'deleting frees the range for reuse and points its slots at the dead record', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 8 } );

				const a = group.addSplat( createTestSplatGeometry( 4 ) );
				const b = group.addSplat( createTestSplatGeometry( 4 ) );

				sync( group );

				group.deleteSplat( a );

				assert.strictEqual( sync( group ), 4, 'splatCount shrinks after delete' );
				assert.strictEqual( group.capacity, 8, 'capacity does not shrink on its own' );
				assert.deepEqual( group._freeRanges, [ { start: 0, count: 4 } ], 'the deleted range is free' );
				assert.deepEqual( slotRecords( group, 0, 4 ), [ 0, 0, 0, 0 ], 'freed slots point at the reserved dead record' );
				assert.strictEqual( record( group, b ).offset, 4, 'the surviving cloud is not moved' );

				const c = group.addSplat( createTestSplatGeometry( 2 ) );

				sync( group );

				assert.strictEqual( record( group, c ).offset, 0, 'a new cloud reuses the freed range' );
				assert.strictEqual( record( group, c ).recordIndex, 1, 'a new cloud reuses the freed record slot' );
				assert.deepEqual( slotRecords( group, 0, 4 ), [ 1, 1, 0, 0 ], 'only the reused slots point at the new record' );
				assert.deepEqual( group._freeRanges, [ { start: 2, count: 2 } ], 'the leftover of the freed range stays free' );

				group.deleteSplat( c );
				group.deleteSplat( b );

				assert.strictEqual( sync( group ), 0, 'splatCount is 0 with nothing left' );
				assert.deepEqual( group._freeRanges, [ { start: 0, count: 8 } ], 'adjacent freed ranges coalesce' );

				group.dispose();

			} );

			QUnit.test( 'hiding keeps a cloud packed and only changes the drawn count', ( assert ) => {

				const group = new GaussianSplatGroup();

				const a = group.addSplat( createTestSplatGeometry( 10 ) );
				group.addSplat( createTestSplatGeometry( 5 ) );

				sync( group );

				const centerAttribute = group._buffers.centerAttribute;
				const queuedUploads = group._dirtySplatRanges.length;

				group.setVisibleAt( a, false );

				assert.strictEqual( sync( group ), 5, 'hidden splats are not counted' );
				assert.strictEqual( group.geometry.instanceCount, 5, 'hidden splats are not drawn' );
				assert.strictEqual( record( group, a ).offset, 0, 'the hidden cloud stays packed' );
				assert.strictEqual( group._buffers.centerAttribute, centerAttribute, 'hiding does not touch the shared buffers' );
				assert.strictEqual( group._dirtySplatRanges.length, queuedUploads, 'hiding queues no splat uploads' );

				group.setVisibleAt( a, true );

				assert.strictEqual( sync( group ), 15, 'showing restores the count' );

				group.dispose();

			} );

			QUnit.test( 'compact() repacks to exactly fit, and is otherwise a no-op', ( assert ) => {

				const group = new GaussianSplatGroup();

				const a = group.addSplat( createTestSplatGeometry( 10 ) );
				const b = group.addSplat( createTestSplatGeometry( 5 ) );

				sync( group );
				group.deleteSplat( a );
				group.setVisibleAt( b, false );

				assert.strictEqual( group.capacity, 15, 'capacity still holds the earlier peak before compact()' );

				group.compact();

				assert.strictEqual( group.capacity, 5, 'compact() shrinks capacity to fit every cloud, hidden or not' );
				assert.strictEqual( record( group, b ).offset, 0, 'the remaining cloud is repacked to the start' );
				assert.deepEqual( group._freeRanges, [], 'no free space remains' );

				const centerAttribute = group._buffers.centerAttribute;

				group.compact();

				assert.strictEqual( group._buffers.centerAttribute, centerAttribute, 'a second compact() with nothing to shrink is a no-op' );

				group.dispose();

			} );

			QUnit.test( 'initialSize preallocates capacity', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 1000 } );

				assert.strictEqual( group.capacity, 1000, 'buffers are preallocated to initialSize up front' );
				assert.strictEqual( sync( group ), 0, 'splatCount starts at 0 even though capacity is preallocated' );

				group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 5, 'splatCount reflects the added splat cloud' );
				assert.strictEqual( group.capacity, 1000, 'capacity is unchanged - still well within the preallocated size' );

				group.dispose();

			} );

			QUnit.test( 'initialSize still grows past its preallocated size if exceeded', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 4 } );

				group.addSplat( createTestSplatGeometry( 10 ) );

				assert.strictEqual( sync( group ), 10, 'splatCount reflects the added splat cloud' );
				assert.strictEqual( group.capacity, 10, 'capacity grows past initialSize once exceeded' );

				group.dispose();

			} );

			QUnit.test( 'the record buffer grows without touching the splat buffers', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 16 } );
				const ids = [];

				for ( let i = 0; i < 4; i ++ ) ids.push( group.addSplat( createTestSplatGeometry( 1 ) ) );

				sync( group );

				const centerAttribute = group._buffers.centerAttribute;

				assert.strictEqual( group._buffers.recordCapacity, 8, 'record capacity doubled from its initial 2 to hold 4 clouds plus the dead slot' );
				assert.strictEqual( group._buffers.centerAttribute, centerAttribute, 'splat buffers were not reallocated' );
				assert.deepEqual( ids.map( ( id ) => record( group, id ).recordIndex ), [ 1, 2, 3, 4 ], 'record slots are handed out from 1' );

				group.dispose();

			} );

			QUnit.test( 'CPU sort puts hidden and freed slots past the drawn range', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 8, shDegree: 0 } );
				const camera = new PerspectiveCamera();
				camera.position.z = 50;
				camera.updateMatrixWorld();

				const a = group.addSplat( createTestSplatGeometry( 2 ) );
				const b = group.addSplat( createTestSplatGeometry( 2 ) );
				const c = group.addSplat( createTestSplatGeometry( 2 ) );

				sync( group );
				group.setVisibleAt( a, false );
				group.deleteSplat( c );

				group.onBeforeRender( { backend: { isWebGLBackend: true } }, null, camera );

				const order = Array.from( group._sort.orderAttribute.array );
				const drawn = order.slice( 0, group.geometry.instanceCount ).sort();
				const skipped = order.slice( group.geometry.instanceCount ).sort();

				assert.strictEqual( group.geometry.instanceCount, 2, 'only the visible cloud is drawn' );
				assert.deepEqual( drawn, [ 2, 3 ], 'the drawn range holds exactly the visible cloud\'s slots' );
				assert.deepEqual( skipped, [ 0, 1, 4, 5, 6, 7 ], 'hidden, freed and never-used slots sort past the drawn range' );
				assert.strictEqual( group._buffers.recordDataAttribute.array[ record( group, b ).recordIndex * 16 + 15 ], 1, 'the visible record is flagged' );
				assert.strictEqual( group._buffers.recordDataAttribute.array[ record( group, a ).recordIndex * 16 + 15 ], 0, 'the hidden record is not flagged' );

				group.dispose();

			} );

			QUnit.test( 'checks the current sort direction when layout already requires sorting', ( assert ) => {

				const group = new GaussianSplatGroup( { shDegree: 0 } );

				group.addSplat( createTestSplatGeometry( 1 ) );
				sync( group );

				let directionChecked = false;
				let sorted = false;

				group._needsSort = () => {

					directionChecked = true;

					return false;

				};

				group._updateSortUniforms = () => {};

				group._sort.compute = () => {

					sorted = true;

				};

				group.onBeforeRender( {}, null, {} );

				assert.true( directionChecked, 'the direction is captured even when layout already requires a sort' );
				assert.true( sorted, 'the packed data is sorted' );

				group.dispose();

			} );

			QUnit.test( 'pads lower-degree spherical harmonics with neutral coefficients', ( assert ) => {

				const group = new GaussianSplatGroup( { shDegree: 3 } );
				const neutral = 0x80808080;

				group.addSplat( createGaussianSplatGeometry(
					new Float32Array( [ 1, 2, 3 ] ),
					new Float32Array( [ 1, 0, 0, 1, 0, 1 ] ),
					new Uint8Array( [ 255, 255, 255, 255 ] ),
					{
						sh1: new Uint32Array( [ 1, 2, 3 ] ),
						sh2: new Uint32Array( [ 4, 5, 6, 7 ] ),
						sh3: new Uint32Array( [ 8, 9, 10, 11, 12, 13 ] )
					}
				) );
				group.addSplat( createTestSplatGeometry( 1 ) );

				sync( group );

				assert.strictEqual( group._maxSphericalHarmonicsDegree, 3, 'the packed group uses its fixed SH degree' );
				assert.deepEqual( Array.from( group._buffers.sphericalHarmonics1Attribute.array.slice( 3, 6 ) ), [ neutral, neutral, neutral ], 'degree 1 padding is neutral' );
				assert.deepEqual( Array.from( group._buffers.sphericalHarmonics2Attribute.array.slice( 4, 8 ) ), [ neutral, neutral, neutral, neutral ], 'degree 2 padding is neutral' );
				assert.deepEqual( Array.from( group._buffers.sphericalHarmonics3Attribute.array.slice( 6, 12 ) ), [ neutral, neutral, neutral, neutral, neutral, neutral ], 'degree 3 padding is neutral' );

				group.dispose();

			} );

			QUnit.test( 'uses fixed shDegree instead of upgrading when higher-degree splats are added', ( assert ) => {

				const group = new GaussianSplatGroup( { shDegree: 2 } );

				group.addSplat( createGaussianSplatGeometry(
					new Float32Array( [ 1, 2, 3 ] ),
					new Float32Array( [ 1, 0, 0, 1, 0, 1 ] ),
					new Uint8Array( [ 255, 255, 255, 255 ] ),
					{
						sh1: new Uint32Array( [ 1, 2, 3 ] ),
						sh2: new Uint32Array( [ 4, 5, 6, 7 ] ),
						sh3: new Uint32Array( [ 8, 9, 10, 11, 12, 13 ] )
					}
				) );

				sync( group );

				assert.strictEqual( group._maxSphericalHarmonicsDegree, 2, 'fixed degree does not upgrade to the source degree' );
				assert.ok( group._buffers.sphericalHarmonics1Attribute, 'degree 1 buffer is allocated' );
				assert.ok( group._buffers.sphericalHarmonics2Attribute, 'degree 2 buffer is allocated' );
				assert.strictEqual( group._buffers.sphericalHarmonics3Attribute, undefined, 'degree 3 buffer is not allocated' );

				group.dispose();

			} );

			QUnit.test( 'WebGL backend uses CPU sort without dispatching merge compute', ( assert ) => {

				const group = new GaussianSplatGroup( { shDegree: 0 } );
				const id = group.addSplat( createGaussianSplatGeometry(
					new Float32Array( [ 1, 2, 3 ] ),
					new Float32Array( [ 1, 0, 0, 1, 0, 1 ] ),
					new Uint8Array( [ 10, 20, 30, 255 ] )
				) );
				const matrix = group.matrixWorld.clone().makeTranslation( 4, 5, 6 );
				let computeCalls = 0;
				let sorted = false;

				group.setMatrixAt( id, matrix );
				sync( group );

				group._needsSort = () => false;

				group._updateSortUniforms = () => {};

				group._sortCPU = () => {

					sorted = true;

				};

				group.onBeforeRender( {
					backend: { isWebGLBackend: true },
					compute() {

						computeCalls ++;

					}
				}, null, {} );

				const centers = group._buffers.centerAttribute.array;
				const recordData = group._buffers.recordDataAttribute.array;

				assert.strictEqual( computeCalls, 0, 'the packed WebGL path does not dispatch merge compute work' );
				assert.deepEqual( Array.from( centers.slice( 0, 4 ) ), [ 1, 2, 3, 1 ], 'source centers stay packed in local space, tagged with record slot 1' );
				assert.deepEqual( Array.from( recordData.slice( 16, 20 ) ), [ 1, 0, 0, 4 ], 'matrix row 0 is uploaded into record data' );
				assert.deepEqual( Array.from( recordData.slice( 20, 24 ) ), [ 0, 1, 0, 5 ], 'matrix row 1 is uploaded into record data' );
				assert.deepEqual( Array.from( recordData.slice( 24, 28 ) ), [ 0, 0, 1, 6 ], 'matrix row 2 is uploaded into record data' );
				assert.strictEqual( recordData[ 31 ], 1, 'the record is flagged visible' );
				assert.true( group._buffers.webGLBuffersEnabled, 'the packed buffers are enabled for WebGL reads' );
				assert.true( sorted, 'the shared sort is performed on the CPU' );

				group.dispose();

			} );

			QUnit.test( 'compact replaces WebGL PBO textures when the layout size changes', ( assert ) => {

				const group = new GaussianSplatGroup( { shDegree: 0 } );
				const largeId = group.addSplat( createTestSplatGeometry( 64 ) );
				group.addSplat( createTestSplatGeometry( 4 ) );
				sync( group );

				const oldAttribute = group._buffers.centerAttribute;
				const oldPBO = new DataTexture( oldAttribute.array, 8, 8 );
				let disposed = false;
				oldPBO.addEventListener( 'dispose', () => {

					disposed = true;

				} );
				oldAttribute.pbo = oldPBO;
				oldAttribute.pboNode = { value: oldPBO };

				group.deleteSplat( largeId );
				group.compact();
				sync( group );

				const newAttribute = group._buffers.centerAttribute;

				assert.notStrictEqual( newAttribute.pbo, oldPBO, 'a new PBO texture is created for the compacted size' );
				assert.strictEqual( newAttribute.pboNode.value, newAttribute.pbo, 'the storage node keeps its PBO node and points it at the new texture' );
				assert.true( disposed, 'the previous PBO texture is disposed' );
				assert.strictEqual( newAttribute.pbo.image.width, 2, 'compacted PBO width matches the new packed layout' );
				assert.strictEqual( newAttribute.pbo.image.height, 2, 'compacted PBO height matches the new packed layout' );

				group.dispose();

			} );

		} );

	} );

} );
