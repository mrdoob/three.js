import { BatchedMesh } from '../../../../src/objects/BatchedMesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'BatchedMesh', () => {

		// PUBLIC

		QUnit.test( 'setInstanceCount', ( assert ) => {

			const box = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0x00ff00 } );

			// initialize and add a geometry into the batched mesh
			const batchedMesh = new BatchedMesh( 4, 5000, 10000, material );
			const boxGeometryId = batchedMesh.addGeometry( box );

			// create instances of this geometry
			const boxInstanceIds = [];
			for ( let i = 0; i < 4; i ++ ) {

				boxInstanceIds.push( batchedMesh.addInstance( boxGeometryId ) );

			}

			batchedMesh.deleteInstance( boxInstanceIds[ 2 ] );
			batchedMesh.deleteInstance( boxInstanceIds[ 3 ] );

			// shrink the instance count
			batchedMesh.setInstanceCount( 2 );

			assert.ok( batchedMesh.instanceCount === 2, 'instance count unequal 2' );

		} );

		QUnit.test( 'addInstance reuses the smallest deleted id', ( assert ) => {

			const material = new MeshBasicMaterial();
			const batchedMesh = new BatchedMesh( 8, 1000, 2000, material );
			const geometryId = batchedMesh.addGeometry( new BoxGeometry() );

			for ( let i = 0; i < 8; i ++ ) batchedMesh.addInstance( geometryId );

			const deleted = [ 6, 2, 5, 0, 7, 3 ];
			for ( const id of deleted ) batchedMesh.deleteInstance( id );

			const reused = deleted.map( () => batchedMesh.addInstance( geometryId ) );
			assert.deepEqual( reused, [ 0, 2, 3, 5, 6, 7 ], 'ids are reused in ascending order' );

		} );

		QUnit.test( 'addGeometry reuses the smallest deleted id', ( assert ) => {

			const material = new MeshBasicMaterial();
			const batchedMesh = new BatchedMesh( 1, 5000, 10000, material );

			for ( let i = 0; i < 4; i ++ ) batchedMesh.addGeometry( new BoxGeometry() );

			batchedMesh.deleteGeometry( 2 );
			batchedMesh.deleteGeometry( 1 );

			assert.strictEqual( batchedMesh.addGeometry( new BoxGeometry() ), 1, 'reuses id 1 first' );

		} );

		QUnit.test( 'deleteGeometry deletes only the instances using that geometry', ( assert ) => {

			const material = new MeshBasicMaterial();
			const batchedMesh = new BatchedMesh( 16, 5000, 10000, material );

			const geometryA = batchedMesh.addGeometry( new BoxGeometry() );
			const geometryB = batchedMesh.addGeometry( new BoxGeometry() );
			const geometryC = batchedMesh.addGeometry( new BoxGeometry() );

			// 0: A, 1: B, 2: A, 3: C, 4: B, 5: A
			const geometryOrder = [ geometryA, geometryB, geometryA, geometryC, geometryB, geometryA ];
			for ( const geometryId of geometryOrder ) batchedMesh.addInstance( geometryId );

			const activeIds = () => batchedMesh._instanceInfo.map( ( info, i ) => info.active ? i : - 1 ).filter( i => i !== - 1 );

			batchedMesh.deleteInstance( 2 );
			batchedMesh.deleteGeometry( geometryA );
			assert.deepEqual( activeIds(), [ 1, 3, 4 ], 'instances of geometry A are deleted' );

			// instances changed after the first deleteGeometry() must be tracked as well
			batchedMesh.setGeometryIdAt( 1, geometryC );
			const added = batchedMesh.addInstance( geometryB );
			assert.strictEqual( added, 0, 'deleted instance id is reused' );

			batchedMesh.deleteGeometry( geometryB );
			assert.deepEqual( activeIds(), [ 1, 3 ], 'instances of geometry B are deleted, re-assigned instance is kept' );

			batchedMesh.deleteGeometry( geometryC );
			assert.deepEqual( activeIds(), [], 'instances of geometry C are deleted, including the re-assigned one' );
			assert.strictEqual( batchedMesh.instanceCount, 0, 'no instances left' );

			// deleting a geometry that was never instanced is fine
			const geometryD = batchedMesh.addGeometry( new BoxGeometry() );
			batchedMesh.deleteGeometry( geometryD );
			assert.strictEqual( batchedMesh.instanceCount, 0, 'still no instances' );

		} );

		QUnit.test( 'deleteGeometry after setInstanceCount', ( assert ) => {

			const material = new MeshBasicMaterial();
			const batchedMesh = new BatchedMesh( 2, 5000, 10000, material );

			const geometryA = batchedMesh.addGeometry( new BoxGeometry() );
			const geometryB = batchedMesh.addGeometry( new BoxGeometry() );
			batchedMesh.addInstance( geometryA );
			batchedMesh.addInstance( geometryB );

			// build the lookup, then grow the instance capacity and add instances past the old capacity
			batchedMesh.deleteGeometry( geometryB );
			batchedMesh.setInstanceCount( 8 );
			for ( let i = 0; i < 6; i ++ ) batchedMesh.addInstance( geometryA );

			batchedMesh.deleteGeometry( geometryA );
			assert.strictEqual( batchedMesh.instanceCount, 0, 'all instances of geometry A are deleted' );

		} );

		QUnit.test( 'deleteGeometry after copy', ( assert ) => {

			const material = new MeshBasicMaterial();
			const source = new BatchedMesh( 8, 5000, 10000, material );

			const geometryA = source.addGeometry( new BoxGeometry() );
			const geometryB = source.addGeometry( new BoxGeometry() );
			source.addInstance( geometryA );
			source.addInstance( geometryB );

			// build the lookup on the target before copying into it
			const target = new BatchedMesh( 8, 5000, 10000, material );
			target.addGeometry( new BoxGeometry() );
			target.addInstance( 0 );
			target.addInstance( 0 );
			target.deleteGeometry( 0 );

			target.copy( source );
			target.deleteGeometry( geometryB );

			assert.strictEqual( target._instanceInfo[ 0 ].active, true, 'instance of geometry A is kept' );
			assert.strictEqual( target._instanceInfo[ 1 ].active, false, 'instance of geometry B is deleted' );
			assert.strictEqual( source._instanceInfo[ 1 ].active, true, 'source is unchanged' );

		} );

		QUnit.test( 'setGeometrySize', ( assert ) => {

			const material = new MeshBasicMaterial();
			const camera = new PerspectiveCamera();
			camera.updateMatrixWorld();

			const batchedMesh = new BatchedMesh( 4, 1000, 2000, material );
			batchedMesh.perObjectFrustumCulled = false;
			batchedMesh.sortObjects = false;
			batchedMesh.addGeometry( new BoxGeometry() );
			const geometryId = batchedMesh.addGeometry( new BoxGeometry() );
			batchedMesh.addInstance( geometryId );

			batchedMesh.onBeforeRender( {}, null, camera, batchedMesh.geometry, material );

			// growing beyond 65535 vertices switches the index buffer to 32 bit
			batchedMesh.setGeometrySize( 70000, 2000 );
			batchedMesh.onBeforeRender( {}, null, camera, batchedMesh.geometry, material );

			const { start } = batchedMesh.getGeometryRangeAt( geometryId );
			assert.strictEqual( batchedMesh._multiDrawStarts[ 0 ], start * 4, 'draw offsets are updated for the new index type' );

			assert.throws( () => batchedMesh.setGeometrySize( 10, 2000 ), /outside the range 10\./, 'error reports the vertex limit' );

		} );

	} );

} );
