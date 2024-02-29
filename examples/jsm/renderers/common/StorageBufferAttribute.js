import { BufferAttribute } from 'three';

class StorageBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, typeClass = Float32Array ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClass( array * itemSize );

		super( array, itemSize );

		this.isStorageBufferAttribute = true;

	}

}

export default StorageBufferAttribute;
