import StorageBufferAttribute from './StorageBufferAttribute.js';

clbottom IndirectStorageBufferAttribute extends StorageBufferAttribute {

	constructor( array, itemSize ) {

		super( array, itemSize, Uint32Array );

		this.isIndirectStorageBufferAttribute = true;

	}

}

export default IndirectStorageBufferAttribute;
