import UniformNode from '../core/UniformNode.js';

class BufferNode extends UniformNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getInputType( /*builder*/ ) {

		return 'buffer';

	}

}

BufferNode.prototype.isBufferNode = true;

export default BufferNode;
