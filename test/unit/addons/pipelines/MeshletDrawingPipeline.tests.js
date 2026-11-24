import { Mesh, MeshStandardMaterial, MeshStandardNodeMaterial, PerspectiveCamera, TorusKnotGeometry } from 'three/webgpu';
import { MeshletDrawingPipeline } from '../../../../examples/jsm/pipelines/MeshletDrawingPipeline.js';
import { ready as clusterProcessingReady } from '../../../../examples/jsm/utils/MeshletGeometryUtils.js';

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

			QUnit.test( 'lodTransition separates opaque and dithered draw queues', async ( assert ) => {

				await clusterProcessingReady;

				const defaultPipeline = new MeshletDrawingPipeline();
				assert.strictEqual( defaultPipeline.lodTransition, 0, 'transitions are disabled by default' );
				defaultPipeline.dispose();

				const pipeline = new MeshletDrawingPipeline( { lodTransition: 0.15, occlusionCulling: false } );
				await Promise.resolve();
				assert.strictEqual( pipeline.lodTransition, 0.15, 'constructor sets lodTransition' );

				const renderer = {
					_callDepth: 0,
					_compilationPromises: [],
					backend: { isWebGPUBackend: true },
					library: { getMaterialNodeClass: () => MeshStandardNodeMaterial },
					shadowMap: { type: 0 },
					getRenderTarget: () => null,
					getDrawingBufferSize: ( target ) => target.set( 800, 600 ),
					getRenderObjectFunction: () => null,
					contextNode: { getFlowContextData: () => ( {} ) }
				};
				pipeline.renderer = renderer;

				const geometry = new TorusKnotGeometry( 1, 0.3, 128, 32 );
				const material = new MeshStandardMaterial();
				const mesh = new Mesh( geometry, material );
				mesh.updateMatrixWorld();

				const camera = new PerspectiveCamera( 50, 800 / 600, 0.1, 100 );
				camera.position.set( 0, 0, 5 );
				camera.updateMatrixWorld();
				camera.updateProjectionMatrix();

				const items = [];
				const renderList = {
					begin: () => {},
					push: ( object ) => items.push( object ),
					finish: () => {}
				};

				const clippingContext = { unionPlanes: [], intersectionPlanes: [] };

				for ( let i = 0; i < 2; i ++ ) {

					items.length = 0;
					pipeline.begin( camera, { frustumArray: null } );
					pipeline.beginRenderList( renderList );
					pipeline.pushRenderItem( renderList, mesh, geometry, material, 0, 0, null, clippingContext );
					pipeline.finishRenderList( renderList );

				}

				assert.strictEqual( items.length, 2, 'submits opaque and dithered meshes when lodTransition > 0' );
				assert.strictEqual( items[ 0 ].renderOrder, 0, 'opaque queue renders first' );
				assert.strictEqual( items[ 0 ].material.maskNode, null, 'opaque queue stays unmasked for early-Z' );
				assert.strictEqual( items[ 1 ].renderOrder, 1, 'dither queue renders after opaque draws' );
				assert.notStrictEqual( items[ 1 ].material.maskNode, null, 'dither queue carries screen-door mask' );

				pipeline.lodTransition = 0;
				items.length = 0;
				pipeline.begin( camera, { frustumArray: null } );
				pipeline.beginRenderList( renderList );
				pipeline.pushRenderItem( renderList, mesh, geometry, material, 0, 0, null, clippingContext );
				pipeline.finishRenderList( renderList );

				assert.strictEqual( items.length, 1, 'skips dithered mesh when lodTransition === 0' );
				assert.strictEqual( items[ 0 ].renderOrder, 0, 'retains opaque mesh' );

				pipeline.depthPrepass = true;
				items.length = 0;
				pipeline.begin( camera, { frustumArray: null } );
				pipeline.beginRenderList( renderList );
				pipeline.pushRenderItem( renderList, mesh, geometry, material, 0, 0, null, clippingContext );
				pipeline.finishRenderList( renderList );

				assert.deepEqual( items.map( ( item ) => item.renderOrder ), [ 0, - 1 ], 'depth prepass skips both dither meshes when lodTransition === 0' );

				pipeline.lodTransition = 0.15;
				items.length = 0;
				pipeline.begin( camera, { frustumArray: null } );
				pipeline.beginRenderList( renderList );
				pipeline.pushRenderItem( renderList, mesh, geometry, material, 0, 0, null, clippingContext );
				pipeline.finishRenderList( renderList );

				assert.deepEqual( items.map( ( item ) => item.renderOrder ), [ 0, - 1, 2, 1 ], 'depth prepass orders opaque prepass/shade before dither prepass/shade' );

				pipeline.dispose();
				geometry.dispose();
				material.dispose();

			} );

		} );

	} );

} );
