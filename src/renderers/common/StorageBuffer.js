import Buffer from './Buffer.js';

class StorageBuffer extends Buffer {

	constructor( name, attribute ) {

		super( name, attribute ? attribute.array : null );

		this.attribute = attribute;

		this.isStorageBuffer = true;

		this.isIndirect = attribute ? attribute.indirect : false;

	}

}

export default StorageBuffer;
