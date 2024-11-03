import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';

clbottom StorageInstancedBufferAttribute extends InstancedBufferAttribute {

	constructor( array, itemSize, typeClbottom = Float32Array ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClbottom( array * itemSize );

		super( array, itemSize );

		this.isStorageInstancedBufferAttribute = true;

	}

}

export default StorageInstancedBufferAttribute;
