import BufferNode from './BufferNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class StorageBufferNode extends BufferNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType, bufferCount );

		this.isStorageBufferNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'storageBuffer';

	}

}

export default StorageBufferNode;

export const storage = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ) );

addNodeClass( StorageBufferNode );
