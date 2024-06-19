import UniformBuffer from '../UniformBuffer.js';

let _id = 0;

class NodeUniformBuffer extends UniformBuffer {

	constructor( nodeUniform, groupNode ) {

		super( 'UniformBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.groupNode = groupNode;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeUniformBuffer;
