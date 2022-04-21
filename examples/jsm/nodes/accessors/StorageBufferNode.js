import BufferNode from './BufferNode.js';

class StorageBufferNode extends BufferNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType, bufferCount );

	}

	getInputType( /*builder*/ ) {

		return 'storageBuffer';

	}

}

StorageBufferNode.prototype.isStorageBufferNode = true;

export default StorageBufferNode;
