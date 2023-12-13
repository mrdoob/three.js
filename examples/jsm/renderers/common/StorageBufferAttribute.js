import { InstancedBufferAttribute } from 'three';

class StorageBufferAttribute extends InstancedBufferAttribute {

	constructor( type, size, count ) {


		if ( navigator.gpu === undefined ) {

			if ( size === 3 ) size = 4;

		}

		super( new type( count * size ), size );

		this.isStorageBufferAttribute = true;

	}

}

export default StorageBufferAttribute;
