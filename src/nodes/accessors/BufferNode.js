import { registerNode } from '../core/Node.js';
import UniformNode from '../core/UniformNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

class BufferNode extends UniformNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getElementType( builder ) {

		return this.getNodeType( builder );

	}

	getInputType( /*builder*/ ) {

		return 'buffer';

	}

}

export default BufferNode;

BufferNode.type = /*@__PURE__*/ registerNode( 'Buffer', BufferNode );

export const buffer = ( value, type, count ) => nodeObject( new BufferNode( value, type, count ) );
