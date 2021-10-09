import InputNode from '../core/InputNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import UVNode from '../accessors/UVNode.js';
import ColorSpaceNode from '../display/ColorSpaceNode.js';

class BufferNode extends InputNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( 'buffer' );

		this.value = value;
		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getNodeType( builder ) {

		return this.bufferType;

	}

}

BufferNode.prototype.isBufferNode = true;

export default BufferNode;
