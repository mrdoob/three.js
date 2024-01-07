import { InstancedBufferAttribute } from 'three';

class StorageBufferAttribute extends InstancedBufferAttribute {

	constructor( type, size, count ) {

		super( new type( count * size ), size );

		this.isStorageBufferAttribute = true;

	}

}

export default StorageBufferAttribute;
