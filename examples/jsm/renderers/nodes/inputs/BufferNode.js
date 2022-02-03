import InputNode from '../core/InputNode.js';

class BufferNode extends InputNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( 'buffer' );

		this.value = value;
		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getNodeType( /* builder */ ) {

		return this.bufferType;

	}

}

BufferNode.prototype.isBufferNode = true;

export default BufferNode;
