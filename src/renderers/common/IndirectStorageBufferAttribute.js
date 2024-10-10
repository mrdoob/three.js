import StorageBufferAttribute from './StorageBufferAttribute.js';

class IndirectStorageBufferAttribute extends StorageBufferAttribute {

	constructor( array, itemSize ) {

		super( array, itemSize, Uint32Array );

		this.isIndirectStorageBufferAttribute = true;

	}

}

export default IndirectStorageBufferAttribute;
