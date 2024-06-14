import UniformBuffer from '../UniformBuffer.js';

let _id = 0;

class NodeUniformBuffer extends UniformBuffer {

	constructor( nodeUniform ) {

		super( 'UniformBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeUniformBuffer;
