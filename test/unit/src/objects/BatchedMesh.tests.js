import { BatchedMesh } from '../../../../src/objects/BatchedMesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { Color } from '../../../../src/math/Color.js';

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

		QUnit.test( 'copy', ( assert ) => {

			const box = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial();

			// initialize and add an instance of a geometry into the batched mesh
			const batchedMesh = new BatchedMesh( 4, 5000, 10000, material );
			const instanceId = batchedMesh.addInstance( batchedMesh.addGeometry( box ) );

			// set a color for the instance
			batchedMesh.setColorAt( instanceId, new Color( 0xff0000 ) );

			// colors are copied
			const clone = batchedMesh.clone();
			assert.strictEqual( clone.getColorAt( instanceId, new Color() ).getHex(), 0xff0000, 'instance color is copied' );

			// copying a batch without colors into a batch with colors
			const plainBatchedMesh = new BatchedMesh( 4, 5000, 10000, material );
			plainBatchedMesh.addInstance( plainBatchedMesh.addGeometry( box ) );
			clone.copy( plainBatchedMesh );
			assert.strictEqual( clone.getColorAt( instanceId, new Color() ).getHex(), 0xffffff, 'instance colors are removed' );

		} );

	} );

} );
