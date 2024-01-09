import { InstancedBufferAttribute } from 'three';

class StorageBufferAttribute extends InstancedBufferAttribute {

	constructor( array, itemSize ) {

		super( array, itemSize );

		this.isStorageBufferAttribute = true;

	}

	static create( count, itemSize, typeClass = Float32Array ) {

		return new StorageBufferAttribute( new typeClass( count * itemSize ), itemSize );

	}

}

export default StorageBufferAttribute;
