import StorageBuffer from '../StorageBuffer.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;

		this.access = nodeUniform ? nodeUniform.access : GPUBufferBindingType.Storage;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
