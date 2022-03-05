import UniformNode from './UniformNode.js';

class BufferNode extends UniformNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( 'buffer', value );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

}

BufferNode.prototype.isBufferNode = true;

export default BufferNode;
