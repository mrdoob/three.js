import StorageBuffer from '../StorageBuffer.js';
import { StorageBufferAccessType } from '../../../nodes/accessors/StorageBufferNode.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform ) {

		const access = nodeUniform ? nodeUniform.access : StorageBufferAccessType.ReadWrite;
		const namePrefix = access === StorageBufferAccessType.Read ? 'StorageReadOnlyBuffer_' : 'StorageBuffer_';

		super( namePrefix + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.access = access;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
