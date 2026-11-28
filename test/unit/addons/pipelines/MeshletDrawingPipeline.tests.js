import { AttachedBindMode, Bone, CylinderGeometry, DetachedBindMode, Float32BufferAttribute, Mesh, MeshStandardMaterial, MeshStandardNodeMaterial, PerspectiveCamera, Skeleton, SkinnedMesh, TorusKnotGeometry, Uint16BufferAttribute, Vector3 } from 'three/webgpu';
import { MeshletDrawingPipeline, MeshletSkeletonPool } from '../../../../examples/jsm/pipelines/MeshletDrawingPipeline.js';
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

// a cylinder skinned to a chain of three bones, like a limb

function createLimb( bindMode = AttachedBindMode ) {

	const geometry = new CylinderGeometry( 0.2, 0.2, 3, 8, 24 ).translate( 0, 1.5, 0 );
	const position = geometry.attributes.position;
	const skinIndex = new Uint16Array( position.count * 4 );
	const skinWeight = new Float32Array( position.count * 4 );

	for ( let i = 0; i < position.count; i ++ ) {

		const y = position.getY( i );
		const bone = Math.min( 2, Math.floor( y ) );
		const t = y - bone;

		skinIndex.set( [ bone, Math.min( 2, bone + 1 ), 0, 0 ], i * 4 );
		skinWeight.set( [ 1 - t * 0.5, t * 0.5, 0, 0 ], i * 4 );

	}

	geometry.setAttribute( 'skinIndex', new Uint16BufferAttribute( skinIndex, 4 ) );
	geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( skinWeight, 4 ) );

	const bones = [ new Bone(), new Bone(), new Bone() ];
	bones[ 1 ].position.y = 1;
	bones[ 2 ].position.y = 1;
	bones[ 0 ].add( bones[ 1 ] );
	bones[ 1 ].add( bones[ 2 ] );

	const mesh = new SkinnedMesh( geometry, new MeshStandardMaterial() );
	mesh.bindMode = bindMode;
	mesh.add( bones[ 0 ] );
	mesh.updateMatrixWorld( true );
	mesh.bind( new Skeleton( bones ) );

	return { mesh, bones, geometry };

}

// the farthest skinned vertex outside of the sphere the culling tests: the bounding sphere of the geometry in the world,
// grown by the margin

function getOvershoot( mesh, margin ) {

	const geometry = mesh.geometry;
	geometry.computeBoundingSphere();

	const sphere = geometry.boundingSphere.clone().applyMatrix4( mesh.matrixWorld );
	const vertex = new Vector3();

	let overshoot = - Infinity;

	for ( let i = 0; i < geometry.attributes.position.count; i ++ ) {

		mesh.getVertexPosition( i, vertex ).applyMatrix4( mesh.matrixWorld );
		overshoot = Math.max( overshoot, vertex.distanceTo( sphere.center ) - sphere.radius - margin );

	}

	return overshoot;

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

			QUnit.test( 'skinned meshes are drawn with the matrices of their skeleton', async ( assert ) => {

				await clusterProcessingReady;

				const pipeline = new MeshletDrawingPipeline( { occlusionCulling: false } );
				await Promise.resolve();

				const renderer = {
					_callDepth: 0,
					_compilationPromises: [],
					info: { frame: 1 },
					backend: { isWebGPUBackend: true },
					library: { getMaterialNodeClass: () => MeshStandardNodeMaterial },
					shadowMap: { type: 0 },
					getRenderTarget: () => null,
					getDrawingBufferSize: ( target ) => target.set( 800, 600 ),
					getRenderObjectFunction: () => null,
					contextNode: { getFlowContextData: () => ( {} ) }
				};
				pipeline.renderer = renderer;

				const { mesh, bones, geometry } = createLimb();
				bones[ 1 ].rotation.z = 0.8;
				mesh.updateMatrixWorld( true );

				const camera = new PerspectiveCamera( 50, 800 / 600, 0.1, 100 );
				camera.position.set( 0, 1.5, 8 );
				camera.updateMatrixWorld();
				camera.updateProjectionMatrix();

				const items = [];
				const renderList = { begin: () => {}, push: ( object ) => items.push( object ), finish: () => {} };
				const clippingContext = { unionPlanes: [], intersectionPlanes: [] };

				for ( let i = 0; i < 2; i ++ ) {

					renderer.info.frame ++;
					items.length = 0;
					pipeline.begin( camera, { frustumArray: null } );
					pipeline.beginRenderList( renderList );
					pipeline.pushRenderItem( renderList, mesh, geometry, mesh.material, 0, 0, null, clippingContext );
					pipeline.finishRenderList( renderList );

				}

				assert.ok( items.length > 0 && items.every( ( item ) => item !== mesh ), 'the skinned mesh is drawn by the pipeline' );

				const pool = pipeline._skeletonPool;
				const offset = pool.offsets.get( mesh.skeleton );

				assert.notStrictEqual( offset, undefined, 'its skeleton is in the skeleton pool' );
				assert.deepEqual( Array.from( pool.array.subarray( offset * 4, offset * 4 + 48 ) ), Array.from( mesh.skeleton.boneMatrices ), 'with the bone matrices of the current pose' );

				pipeline.dispose();
				geometry.dispose();
				mesh.material.dispose();

			} );

			QUnit.test( 'a skeleton is written once a frame however many of its meshes are drawn', ( assert ) => {

				const pool = new MeshletSkeletonPool();
				const first = createLimb();
				const second = createLimb();

				const offset = pool.offset( first.mesh.skeleton, 1 );

				assert.strictEqual( pool.offset( first.mesh.skeleton, 1 ), offset, 'a second mesh of the skeleton shares its matrices' );
				assert.strictEqual( pool.offset( second.mesh.skeleton, 1 ), offset + 3 * 4, 'another skeleton is written after it' );
				assert.deepEqual( pool.attribute.updateRanges, [ { start: 0, count: 2 * 3 * 16 } ], 'both are uploaded in one range' );
				assert.strictEqual( pool.offset( second.mesh.skeleton, 2 ), 0, 'the pool starts again each frame' );

				pool.dispose();

			} );

			QUnit.test( 'the bounds of a skinned mesh hold every vertex in any pose', ( assert ) => {

				const pool = new MeshletSkeletonPool();
				let frame = 0;

				for ( const bindMode of [ AttachedBindMode, DetachedBindMode ] ) {

					const { mesh, bones, geometry } = createLimb( bindMode );
					mesh.position.set( 5, - 2, 7 );
					mesh.rotation.set( 0.3, 1.1, - 0.4 );
					mesh.scale.setScalar( 1.7 );

					for ( const pose of [[ 0, 0, 0 ], [ 0.8, - 1.2, 0.5 ], [ - 1.5, 1.5, 2.0 ], [ 3.0, - 2.5, 1.1 ]] ) {

						bones[ 0 ].rotation.z = pose[ 0 ];
						bones[ 1 ].rotation.x = pose[ 1 ];
						bones[ 2 ].rotation.z = pose[ 2 ];
						mesh.updateMatrixWorld( true );
						mesh.skeleton.update();

						frame ++;
						const margin = pool.margin( mesh, geometry, frame );

						assert.ok( getOvershoot( mesh, margin ) <= 1e-4, `${ bindMode } bind mode, pose ${ pose }: no vertex outside the bounds` );

					}

				}

				// control: folded back on itself, the limb leaves the sphere of its geometry

				const { mesh, bones } = createLimb();
				bones[ 0 ].rotation.z = 1.2;
				bones[ 1 ].rotation.z = Math.PI * 0.9;
				mesh.updateMatrixWorld( true );
				mesh.skeleton.update();

				assert.ok( getOvershoot( mesh, 0 ) > 0.1, 'control: a folded pose needs a margin' );

				pool.dispose();

			} );

			QUnit.test( 'the previous bone matrices of a skeleton are those of the frame before', ( assert ) => {

				const pool = new MeshletSkeletonPool();
				const { mesh, bones } = createLimb();
				const matricesAt = ( offset ) => Array.from( pool.array.subarray( offset * 4, offset * 4 + 48 ) );

				const first = pool.previousOffset( mesh.skeleton, 1 );
				assert.strictEqual( first, pool.offset( mesh.skeleton, 1 ), 'drawn for the first time: no motion, the current matrices' );

				const before = Array.from( mesh.skeleton.boneMatrices );
				bones[ 1 ].rotation.z = 0.9;
				mesh.updateMatrixWorld( true );

				const current = pool.offset( mesh.skeleton, 2 );
				const previous = pool.previousOffset( mesh.skeleton, 2 );

				assert.notStrictEqual( previous, current, 'the next frame keeps both poses' );
				assert.deepEqual( matricesAt( previous ), before, 'the previous matrices are the last frame\'s' );
				assert.deepEqual( matricesAt( current ), Array.from( mesh.skeleton.boneMatrices ), 'the current ones are this frame\'s' );
				assert.strictEqual( pool.previousOffset( mesh.skeleton, 2 ), previous, 'written once a frame' );

				pool.offset( mesh.skeleton, 5 );
				assert.strictEqual( pool.previousOffset( mesh.skeleton, 5 ), pool.offset( mesh.skeleton, 5 ), 'not drawn in the frame before: no motion' );

				pool.dispose();

			} );

			QUnit.test( 'a skinned mesh bound again is measured again', ( assert ) => {

				const pool = new MeshletSkeletonPool();
				const { mesh, bones, geometry } = createLimb();

				bones[ 1 ].rotation.z = 1.3;
				mesh.updateMatrixWorld( true );
				mesh.skeleton.update();
				pool.margin( mesh, geometry, 1 );

				// bound again with the joints bunched at the base: the vertices of the upper limb lie far from their bones

				bones[ 1 ].rotation.z = 0;
				bones[ 1 ].position.y = 0.2;
				bones[ 2 ].position.y = 0.2;
				mesh.updateMatrixWorld( true );
				mesh.skeleton.calculateInverses();

				// then posed: the upper limb swings around the bunched joints

				bones[ 0 ].rotation.z = 1.4;
				bones[ 1 ].rotation.x = - 1.1;
				mesh.updateMatrixWorld( true );
				mesh.skeleton.update();

				const fresh = new MeshletSkeletonPool();
				const expected = fresh.margin( mesh, geometry, 2 );
				const margin = pool.margin( mesh, geometry, 2 );

				assert.ok( getOvershoot( mesh, margin ) <= 1e-4, 'no vertex outside the bounds of the new binding' );
				assert.ok( margin >= expected - 1e-5, 'as wide as a pool that only saw the new binding' );
				assert.ok( getOvershoot( mesh, 0 ) > 0.1, 'control: this pose needs a margin' );

				fresh.dispose();

				pool.dispose();

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
