import { BufferAttribute } from '../../core/BufferAttribute.js';

class IndirectStorageBufferAttribute extends BufferAttribute {

	constructor( array, itemSize = 1, typeClass = Uint32Array ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClass( array * itemSize );

		super( array, itemSize );

		this.isIndirectStorageBufferAttribute = true;

	}

}

export default IndirectStorageBufferAttribute;
