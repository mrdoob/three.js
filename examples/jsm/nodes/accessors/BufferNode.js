import UniformNode from '../core/UniformNode.js';

class BufferNode extends UniformNode {

	constructor( value, bufferType = 'float', bufferCount = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getInputType( /*builder*/ ) {

		return 'buffer';

	}

}

export default BufferNode;
