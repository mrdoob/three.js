import Buffer from './Buffer.js';

class StorageBuffer extends Buffer {

	constructor( name, attribute ) {

		super( name, attribute ? attribute.array : null );

		this.attribute = attribute;

		this.isStorageBuffer = true;

	}

}

export default StorageBuffer;
