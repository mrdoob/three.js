import InstanceNode from '../../../../../src/nodes/accessors/InstanceNode.js';
import { InstancedBufferAttribute } from '../../../../../src/core/InstancedBufferAttribute.js';
import { InstancedInterleavedBuffer } from '../../../../../src/core/InstancedInterleavedBuffer.js';
import { NodeUpdateType } from '../../../../../src/nodes/core/constants.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'InstanceNode', () => {

			QUnit.test( 'syncs update ranges in the updateBefore phase', ( assert ) => {

				const node = new InstanceNode( 1, new InstancedBufferAttribute( new Float32Array( 16 ), 16 ) );

				assert.strictEqual( node.getUpdateBeforeType(), NodeUpdateType.FRAME );

			} );

			QUnit.test( 'mirrors instanceMatrix.updateRanges onto the upload buffer', ( assert ) => {

				const instanceMatrix = new InstancedBufferAttribute( new Float32Array( 2 * 16 ), 16 );
				const node = new InstanceNode( 2, instanceMatrix );
				node.buffer = new InstancedInterleavedBuffer( instanceMatrix.array, 16, 1 );

				instanceMatrix.clearUpdateRanges();
				instanceMatrix.addUpdateRange( 16, 16 );

				node.updateBefore();

				assert.deepEqual( node.buffer.updateRanges, [ { start: 16, count: 16 } ] );

			} );

		} );

	} );

} );
