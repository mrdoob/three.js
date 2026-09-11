import { DataTexture } from 'three';
import { createGaussianSplatGeometry } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';
import { GaussianSplatGroup } from '../../../../examples/jsm/objects/GaussianSplatGroup.js';

// Builds a minimal splat cloud geometry with `count` splats - real enough to drive
// `GaussianSplatGroup`'s buffer bookkeeping and CPU fallback logic without needing a GPU.
function createTestSplatGeometry( count ) {

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8Array( count * 4 ).fill( 255 );

	for ( let i = 0; i < count; i ++ ) {

		covariances[ i * 6 ] = 1;
		covariances[ i * 6 + 3 ] = 1;
		covariances[ i * 6 + 5 ] = 1;

	}

	return createGaussianSplatGeometry( centers, covariances, colors );

}

// Buffer sizing is only checked lazily, the next time it's needed (`splatCount`, `capacity`
// after a change, `compact()`, `onBeforeRender`, ...) - see the class documentation. Reading
// `splatCount` after each mutation below forces that check deterministically, so each
// assertion observes the buffer state as of that point rather than only the final state.
function sync( group ) {

	return group.splatCount;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Objects', () => {

		QUnit.module( 'GaussianSplatGroup', () => {

			QUnit.test( 'autoCompact defaults to true and initialSize is unset by default', ( assert ) => {

				const group = new GaussianSplatGroup();

				assert.strictEqual( group.autoCompact, true, 'autoCompact defaults to true' );
				assert.strictEqual( group._maxSphericalHarmonicsDegree, 2, 'shDegree defaults to 2' );
				assert.strictEqual( sync( group ), 0, 'splatCount starts at 0' );
				assert.strictEqual( group.capacity, 1, 'buffers settle at capacity 1 (max(1, 0 splats))' );

				group.dispose();

			} );

			QUnit.test( 'autoCompact:true keeps buffers exactly sized to the live total', ( assert ) => {

				const group = new GaussianSplatGroup( { autoCompact: true } );

				const a = group.addSplat( createTestSplatGeometry( 10 ) );

				assert.strictEqual( sync( group ), 10, 'splatCount reflects added splats' );
				assert.strictEqual( group.capacity, 10, 'capacity grows to exactly fit' );

				const b = group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 15, 'splatCount reflects both splat clouds' );
				assert.strictEqual( group.capacity, 15, 'capacity grows again to exactly fit' );

				group.deleteSplat( b );

				assert.strictEqual( sync( group ), 10, 'splatCount shrinks after delete' );
				assert.strictEqual( group.capacity, 10, 'capacity shrinks automatically' );

				group.deleteSplat( a );

				assert.strictEqual( sync( group ), 0, 'splatCount is 0 with nothing left' );
				assert.strictEqual( group.capacity, 1, 'capacity shrinks back down to the 1-splat floor' );

				group.dispose();

			} );

			QUnit.test( 'autoCompact:false only grows buffers, never shrinks them on its own', ( assert ) => {

				const group = new GaussianSplatGroup( { autoCompact: false } );

				const a = group.addSplat( createTestSplatGeometry( 10 ) );

				sync( group );

				const b = group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 15, 'splatCount reflects both splat clouds' );
				assert.strictEqual( group.capacity, 15, 'capacity grows to fit' );

				group.deleteSplat( b );

				assert.strictEqual( sync( group ), 10, 'splatCount shrinks after delete' );
				assert.strictEqual( group.capacity, 15, 'capacity does not shrink on its own' );

				group.deleteSplat( a );

				assert.strictEqual( sync( group ), 0, 'splatCount is 0 with nothing left' );
				assert.strictEqual( group.capacity, 15, 'capacity is still left over from the earlier peak' );

				group.dispose();

			} );

			QUnit.test( 'compact() shrinks a grow-only group down to fit, and is otherwise a no-op', ( assert ) => {

				const group = new GaussianSplatGroup( { autoCompact: false } );

				const a = group.addSplat( createTestSplatGeometry( 10 ) );

				sync( group );

				group.addSplat( createTestSplatGeometry( 5 ) );

				sync( group );

				group.deleteSplat( a );

				assert.strictEqual( sync( group ), 5, 'splatCount reflects the one remaining splat cloud' );
				assert.strictEqual( group.capacity, 15, 'capacity still holds the earlier peak before compact()' );

				group.compact();

				assert.strictEqual( group.capacity, 5, 'compact() shrinks capacity to exactly fit the live total' );

				group.compact();

				assert.strictEqual( group.capacity, 5, 'a second compact() with nothing to shrink is a no-op' );

				group.dispose();

			} );

			QUnit.test( 'initialSize preallocates capacity and implies autoCompact:false by default', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 1000 } );

				assert.strictEqual( group.autoCompact, false, 'autoCompact defaults to false when initialSize is given' );
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

			QUnit.test( 'an explicit autoCompact overrides the initialSize default', ( assert ) => {

				const group = new GaussianSplatGroup( { initialSize: 1000, autoCompact: true } );

				assert.strictEqual( group.autoCompact, true, 'explicit autoCompact:true wins over the initialSize default' );

				const a = group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 5, 'splatCount reflects the added splat cloud' );
				assert.strictEqual( group.capacity, 5, 'autoCompact:true still shrinks the preallocated buffers to fit' );

				group.deleteSplat( a );

				assert.strictEqual( sync( group ), 0, 'splatCount is 0 with nothing left' );
				assert.strictEqual( group.capacity, 1, 'autoCompact:true shrinks all the way back down once empty' );

				group.dispose();

			} );

			QUnit.test( 'autoCompact can be toggled at runtime, taking effect on the next change', ( assert ) => {

				const group = new GaussianSplatGroup( { autoCompact: true } );

				const a = group.addSplat( createTestSplatGeometry( 10 ) );

				assert.strictEqual( sync( group ), 10, 'splatCount reflects the added splat cloud' );
				assert.strictEqual( group.capacity, 10, 'starts auto-compacted' );

				group.autoCompact = false;

				const b = group.addSplat( createTestSplatGeometry( 5 ) );

				assert.strictEqual( sync( group ), 15, 'splatCount reflects both splat clouds' );
				assert.strictEqual( group.capacity, 15, 'still grows normally once autoCompact is turned off' );

				group.deleteSplat( b );

				assert.strictEqual( sync( group ), 10, 'splatCount shrinks after delete' );
				assert.strictEqual( group.capacity, 15, 'capacity no longer auto-shrinks once autoCompact is false' );

				group.autoCompact = true;
				group.deleteSplat( a );

				assert.strictEqual( sync( group ), 0, 'splatCount is 0 with nothing left' );
				assert.strictEqual( group.capacity, 1, 'turning autoCompact back on shrinks on the next change' );

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
				assert.deepEqual( Array.from( centers.slice( 0, 4 ) ), [ 1, 2, 3, 0 ], 'source centers stay packed in local space' );
				assert.deepEqual( Array.from( recordData.slice( 0, 4 ) ), [ 1, 0, 0, 4 ], 'matrix row 0 is uploaded into record data' );
				assert.deepEqual( Array.from( recordData.slice( 4, 8 ) ), [ 0, 1, 0, 5 ], 'matrix row 1 is uploaded into record data' );
				assert.deepEqual( Array.from( recordData.slice( 8, 12 ) ), [ 0, 0, 1, 6 ], 'matrix row 2 is uploaded into record data' );
				assert.true( group._buffers.webGLBuffersEnabled, 'the packed buffers are enabled for WebGL reads' );
				assert.true( sorted, 'the shared sort is performed on the CPU' );

				group.dispose();

			} );

			QUnit.test( 'compact replaces WebGL PBO textures when the layout size changes', ( assert ) => {

				const group = new GaussianSplatGroup( { autoCompact: false, shDegree: 0 } );
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

				group.setVisibleAt( largeId, false );
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
