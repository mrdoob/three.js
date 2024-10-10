import { BufferAttribute } from '../../core/BufferAttribute.js';

class StorageBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, indirect = false, typeClass = Float32Array ) {

		if ( indirect === true ) typeClass = Uint32Array;

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClass( array * itemSize );

		super( array, itemSize );

		this.isStorageBufferAttribute = true;

		this.isIndirect = indirect;

	}

}

export default StorageBufferAttribute;
