import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GLTFLoader', () => {

			// https://github.com/mrdoob/three.js/issues/<issue-number>
			//
			// Two nodes reference the same mesh through EXT_mesh_gpu_instancing,
			// each with its own custom per-instance attribute (_BATCHID). The mesh
			// geometry is cached and shared between both nodes, so the extension must
			// not write the attribute onto the shared geometry — otherwise the second
			// node overwrites the first node's data.
			QUnit.test( 'EXT_mesh_gpu_instancing keeps per-node custom instance attributes', ( assert ) => {

				const done = assert.async();

				// Binary buffer: triangle positions, shared instance translations,
				// and two distinct _BATCHID accessors (one per node).
				const positions = new Float32Array( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ] );
				const translation = new Float32Array( [ 0, 0, 0, 5, 0, 0 ] );
				const batchIdA = new Float32Array( [ 10, 11 ] );
				const batchIdB = new Float32Array( [ 20, 21 ] );

				const arrays = [ positions, translation, batchIdA, batchIdB ];
				const totalBytes = arrays.reduce( ( sum, a ) => sum + a.byteLength, 0 );
				const bytes = new Uint8Array( totalBytes );
				const bufferViews = [];
				let offset = 0;

				for ( const a of arrays ) {

					bytes.set( new Uint8Array( a.buffer, a.byteOffset, a.byteLength ), offset );
					bufferViews.push( { buffer: 0, byteOffset: offset, byteLength: a.byteLength } );
					offset += a.byteLength;

				}

				let binary = '';
				for ( let i = 0; i < bytes.length; i ++ ) binary += String.fromCharCode( bytes[ i ] );
				const base64 = btoa( binary );

				const gltf = {
					asset: { version: '2.0' },
					extensionsUsed: [ 'EXT_mesh_gpu_instancing' ],
					buffers: [ { byteLength: totalBytes, uri: 'data:application/octet-stream;base64,' + base64 } ],
					bufferViews: bufferViews,
					accessors: [
						{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [ 0, 0, 0 ], max: [ 1, 1, 0 ] },
						{ bufferView: 1, componentType: 5126, count: 2, type: 'VEC3' },
						{ bufferView: 2, componentType: 5126, count: 2, type: 'SCALAR' },
						{ bufferView: 3, componentType: 5126, count: 2, type: 'SCALAR' }
					],
					meshes: [ { primitives: [ { attributes: { POSITION: 0 }, mode: 4 } ] } ],
					nodes: [
						{ mesh: 0, extensions: { EXT_mesh_gpu_instancing: { attributes: { TRANSLATION: 1, _BATCHID: 2 } } } },
						{ mesh: 0, extensions: { EXT_mesh_gpu_instancing: { attributes: { TRANSLATION: 1, _BATCHID: 3 } } } }
					],
					scenes: [ { nodes: [ 0, 1 ] } ],
					scene: 0
				};

				const loader = new GLTFLoader();

				loader.parse( JSON.stringify( gltf ), '', ( result ) => {

					const instancedMeshes = [];
					result.scene.traverse( ( object ) => {

						if ( object.isInstancedMesh ) instancedMeshes.push( object );

					} );

					assert.strictEqual( instancedMeshes.length, 2, 'Two InstancedMeshes are created.' );

					const batchIdA = instancedMeshes[ 0 ].geometry.getAttribute( '_BATCHID' );
					const batchIdB = instancedMeshes[ 1 ].geometry.getAttribute( '_BATCHID' );

					assert.ok( batchIdA && batchIdB, 'Both InstancedMeshes keep a _BATCHID attribute.' );

					assert.deepEqual(
						Array.from( batchIdA.array ),
						[ 10, 11 ],
						'First node keeps its own _BATCHID values.'
					);
					assert.deepEqual(
						Array.from( batchIdB.array ),
						[ 20, 21 ],
						'Second node keeps its own _BATCHID values.'
					);

					assert.notStrictEqual(
						instancedMeshes[ 0 ].geometry,
						instancedMeshes[ 1 ].geometry,
						'Instances with divergent per-instance attributes do not share one geometry.'
					);

					assert.strictEqual(
						instancedMeshes[ 0 ].geometry.getAttribute( 'position' ),
						instancedMeshes[ 1 ].geometry.getAttribute( 'position' ),
						'Vertex buffers are still shared between instances (shallow copy).'
					);

					assert.ok(
						batchIdA.isInstancedBufferAttribute,
						'Custom instance attributes are stored as InstancedBufferAttribute.'
					);

					done();

				}, ( error ) => {

					assert.ok( false, 'GLTFLoader.parse failed: ' + error );
					done();

				} );

			} );

		} );

	} );

} );
