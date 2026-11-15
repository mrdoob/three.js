import { PerspectiveCamera } from 'three';
import { MeshletDrawingPipeline } from '../../../../examples/jsm/pipelines/MeshletDrawingPipeline.js';

function createFixture() {

	const pipeline = new MeshletDrawingPipeline();
	const renderer = {
		_callDepth: 1,
		backend: { isWebGPUBackend: true },
		getRenderTarget: () => null,
		getRenderObjectFunction: () => null,
		contextNode: { getFlowContextData: () => ( {} ) }
	};
	pipeline.renderer = renderer;

	const removed = {
		vertexArray: new Float32Array( 32 ),
		indexArray: new Uint32Array( [ 0, 1, 2, 0, 2, 3 ] ),
		stride: 2
	};
	const kept = {
		vertexArray: new Float32Array( 24 ).fill( 7 ),
		indexArray: new Uint32Array( [ 0, 1, 2 ] ),
		stride: 2
	};
	const pool = pipeline._geometryPool;
	pool.add( removed );
	pool.add( kept );
	pool.remove( removed );

	const index = pool.indexAttribute;
	let disposals = 0;
	index.addEventListener( 'dispose', () => disposals ++ );

	return { pipeline, renderer, pool, index, disposals: () => disposals };

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Pipelines', () => {

		QUnit.module( 'MeshletDrawingPipeline', () => {

			QUnit.test( 'nested renders retain the parent geometry pool buffers', ( assert ) => {

				for ( const depth of [ 1, 2 ] ) {

					const f = createFixture();
					f.renderer._callDepth = depth;
					f.pipeline.begin( new PerspectiveCamera(), { frustumArray: null } );
					assert.strictEqual( f.pool.indexAttribute, f.index, 'parent buffer remains valid' );
					assert.strictEqual( f.disposals(), 0, 'nested render does not dispose the buffer' );
					assert.strictEqual( f.pool.version, 0, 'compaction is deferred' );

					f.renderer._callDepth = 0;
					f.pipeline.begin( new PerspectiveCamera(), { frustumArray: null } );
					assert.notStrictEqual( f.pool.indexAttribute, f.index, 'next outer render compacts the pool' );
					assert.strictEqual( f.disposals(), 1, 'old buffer is disposed once' );
					assert.strictEqual( f.pool.version, 1, 'pool compacts once' );
					assert.deepEqual( Array.from( f.pool.indexArray.slice( 0, 3 ) ), [ 0, 2, 4 ], 'kept indices are relocated' );
					assert.deepEqual( Array.from( f.pool.vertexArray.slice( 0, 24 ) ), new Array( 24 ).fill( 7 ), 'kept vertices are preserved' );
					f.pipeline.dispose();

				}

			} );

			QUnit.test( 'outer renders and standalone precompilation reclaim unused geometry', ( assert ) => {

				for ( const depth of [ 0, - 1 ] ) {

					const f = createFixture();
					f.renderer._callDepth = depth;
					f.pipeline.begin( new PerspectiveCamera(), { frustumArray: null } );
					assert.strictEqual( f.disposals(), 1, 'unused geometry is reclaimed' );
					assert.strictEqual( f.pool.version, 1, 'pool compacts once' );
					f.pipeline.dispose();

				}

			} );

		} );

	} );

} );
