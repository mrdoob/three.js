import UniformBuffer from '../UniformBuffer.js';

let _id = 0;

/**
 * A special form of uniform buffer binding type.
 * It's buffer value is managed by a node object.
 *
 * @private
 * @augments UniformBuffer
 */
class NodeUniformBuffer extends UniformBuffer {

	/**
	 * Constructs a new node-based uniform buffer.
	 *
	 * @param {BufferNode} nodeUniform - The uniform buffer node.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 */
	constructor( nodeUniform, groupNode ) {

		super( 'UniformBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		/**
		 * The uniform buffer node.
		 *
		 * @type {BufferNode}
		 */
		this.nodeUniform = nodeUniform;

		/**
		 * The uniform group node.
		 *
		 * @type {UniformGroupNode}
		 */
		this.groupNode = groupNode;

	}

	/**
	 * The uniform buffer.
	 *
	 * @type {Float32Array}
	 */
	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeUniformBuffer;
