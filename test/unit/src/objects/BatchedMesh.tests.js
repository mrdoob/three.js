import { BatchedMesh } from '../../../../src/objects/BatchedMesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

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

		QUnit.test( 'toJSON', ( assert ) => {

			const box = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial();

			const batchedMesh = new BatchedMesh( 4, 5000, 10000, material );
			const boxGeometryId = batchedMesh.addGeometry( box );
			const deletedGeometryId = batchedMesh.addGeometry( box );
			batchedMesh.deleteGeometry( deletedGeometryId );

			const instanceId = batchedMesh.addInstance( boxGeometryId );
			batchedMesh.addInstance( boxGeometryId );
			batchedMesh.deleteInstance( instanceId );

			const json = batchedMesh.toJSON();
			const loadedMesh = new ObjectLoader().parse( json );

			assert.strictEqual( loadedMesh.instanceCount, 1, 'Reloaded mesh has the same instance count' );
			assert.strictEqual( loadedMesh.addInstance( boxGeometryId ), instanceId, 'Reloaded mesh reuses the deleted instance id' );
			assert.strictEqual( loadedMesh.addGeometry( box ), deletedGeometryId, 'Reloaded mesh reuses the deleted geometry id' );

		} );

	} );

} );
