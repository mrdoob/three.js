import { BatchedMesh } from '../../../../src/objects/BatchedMesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { Float32BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { GLBufferAttribute } from '../../../../src/core/GLBufferAttribute.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'BatchedMesh', () => {

		// PUBLIC

		QUnit.test( 'canAddGeometry', ( assert ) => {

			const box = new BoxGeometry();
			const batch = new BatchedMesh( 2, 48, 72, new MeshBasicMaterial() );

			assert.true( batch.canAddGeometry( box.toNonIndexed() ), 'can start with non-indexed geometry' );
			assert.true( batch.canAddGeometry( box ), 'can still start with indexed geometry' );
			assert.deepEqual( batch.geometry.attributes, {}, 'query does not initialize the layout' );
			assert.strictEqual( batch.geometry.getIndex(), null, 'query does not allocate an index buffer' );

			assert.false( batch.canAddGeometry( new BufferGeometry() ), 'rejects missing position data' );
			const gpuGeometry = new BufferGeometry();
			gpuGeometry.setAttribute( 'position', new GLBufferAttribute( null, 5126, 3, 4, 3 ) );
			assert.false( batch.canAddGeometry( gpuGeometry ), 'rejects GPU-only attributes' );

			const id = batch.addGeometry( box );
			assert.strictEqual( id, 0, 'query does not reserve a geometry ID' );
			assert.false( batch.canAddGeometry( box.toNonIndexed() ), 'rejects mismatched indexing' );
			assert.false( batch.canAddGeometry( box.clone().deleteAttribute( 'normal' ) ), 'rejects a missing batch attribute' );
			const normalizedBox = box.clone();
			normalizedBox.getAttribute( 'normal' ).normalized = true;
			assert.false( batch.canAddGeometry( normalizedBox ), 'rejects a mismatched attribute layout' );

			assert.false( batch.canAddGeometry( box, 23 ), 'rejects a reservation smaller than the geometry' );
			assert.false( batch.canAddGeometry( box, - 1, 35 ), 'rejects an index reservation smaller than the geometry' );
			assert.false( batch.canAddGeometry( box, 25 ), 'rejects a reservation larger than the remaining vertex space' );
			assert.false( batch.canAddGeometry( box, - 1, 37 ), 'rejects a reservation larger than the remaining index space' );
			assert.true( batch.canAddGeometry( box ), 'accepts a geometry that exactly fits' );
			batch.addGeometry( box );

			batch.deleteGeometry( id );
			assert.false( batch.canAddGeometry( box ), 'deletion does not immediately free space at the end' );
			batch.optimize();
			assert.true( batch.canAddGeometry( box ), 'uses the space reclaimed by optimization' );

		} );

		QUnit.test( 'addGeometry does not reserve space on failure', ( assert ) => {

			const box = new BoxGeometry();
			const batch = new BatchedMesh( 2, 48, 72, new MeshBasicMaterial() );
			const largerAttribute = box.clone();
			largerAttribute.setAttribute( 'normal', new Float32BufferAttribute( new Float32Array( 25 * 3 ), 3 ) );

			assert.false( batch.canAddGeometry( largerAttribute ), 'rejects an attribute larger than its reservation' );
			assert.true( batch.canAddGeometry( largerAttribute, 25 ), 'accepts a reservation that also fits the larger attribute' );
			assert.throws( () => batch.addGeometry( largerAttribute ), /not large enough/, 'rejects an attribute that would overrun its slot' );

			assert.throws( () => batch.addGeometry( box, 23 ), /not large enough/, 'rejects an undersized reservation' );
			assert.throws( () => batch.addGeometry( box, 49 ), /maximum buffer size/, 'rejects an oversized reservation' );
			assert.deepEqual( batch.geometry.attributes, {}, 'failed adds leave the layout unset' );
			assert.strictEqual( batch.addGeometry( box.toNonIndexed() ), 0, 'first successful add can still choose its layout and ID' );

			const unindexed = box.toNonIndexed();
			unindexed.setAttribute( 'normal', new Float32BufferAttribute( new Float32Array( 37 * 3 ), 3 ) );
			assert.throws( () => batch.setGeometryAt( 0, unindexed ), /not large enough/, 'replacement respects its existing slot' );

		} );

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
