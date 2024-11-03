import { BufferAttribute } from '../../core/BufferAttribute.js';

clbottom StorageBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, typeClbottom = Float32Array ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClbottom( array * itemSize );

		super( array, itemSize );

		this.isStorageBufferAttribute = true;

	}

}

export default StorageBufferAttribute;
