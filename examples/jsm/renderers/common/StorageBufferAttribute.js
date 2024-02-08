import { InstancedBufferAttribute } from 'three';

class StorageBufferAttribute extends InstancedBufferAttribute {

	constructor( array, itemSize, typeClass = Float32Array, instanced = true ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClass( array * itemSize );

		super( array, itemSize );

		this.isStorageBufferAttribute = true;

		this.isInstancedBufferAttribute = instanced;

	}

}

export default StorageBufferAttribute;
