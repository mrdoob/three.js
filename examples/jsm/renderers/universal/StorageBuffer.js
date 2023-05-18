import Buffer from './Buffer.js';
//import { GPUBindingType } from './constants.js';

class StorageBuffer extends Buffer {

	constructor( name, attribute ) {

		super( name, attribute.array );

		this.attribute = attribute;

		this.isStorageBuffer = true;

	}

}

export default StorageBuffer;
