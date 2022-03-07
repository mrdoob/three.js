import UniformNode from '../core/UniformNode.js';

class BufferNode extends UniformNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, 'buffer' );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

}

BufferNode.prototype.isBufferNode = true;

export default BufferNode;
