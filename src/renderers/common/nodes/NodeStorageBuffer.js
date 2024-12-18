import StorageBuffer from '../StorageBuffer.js';
import { NodeAccess } from '../../../nodes/core/constants.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform, groupNode ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.access = nodeUniform ? nodeUniform.access : NodeAccess.READ_WRITE;
		this.groupNode = groupNode;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
