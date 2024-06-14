import StorageBuffer from '../StorageBuffer.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
