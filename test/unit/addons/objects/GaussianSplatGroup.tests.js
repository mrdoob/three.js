import { createGaussianSplatGeometry } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';
import { GaussianSplatGroup } from '../../../../examples/jsm/objects/GaussianSplatGroup.js';

// Builds a minimal splat cloud geometry with `count` splats - real enough to drive
// `GaussianSplatGroup`'s buffer bookkeeping without needing a GPU (these tests never call
// `onBeforeRender`/`renderer.compute`, only the CPU-side layout/capacity logic).
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

		} );

	} );

} );
