import StorageBuffer from '../StorageBuffer.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform, readOnly) {
    readOnly = readOnly ? readOnly : false;
    const namePrefix = readOnly ? 'StorageReadOnlyBuffer_' : 'StorageBuffer_'
		super( namePrefix + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
    this.readOnly = readOnly;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
