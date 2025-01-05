import StorageBuffer from '../StorageBuffer.js';
import { NodeAccess } from '../../../nodes/core/constants.js';

let _id = 0;

/**
 * A special form of storage buffer binding type.
 * It's buffer value is managed by a node object.
 *
 * @private
 * @augments StorageBuffer
 */
class NodeStorageBuffer extends StorageBuffer {

	/**
	 * Constructs a new node-based storage buffer.
	 *
	 * @param {StorageBufferNode} nodeUniform - The storage buffer node.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 */
	constructor( nodeUniform, groupNode ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		/**
		 * The node uniform.
		 *
		 * @type {StorageBufferNode}
		 */
		this.nodeUniform = nodeUniform;

		/**
		 * The access type.
		 *
		 * @type {String}
		 */
		this.access = nodeUniform ? nodeUniform.access : NodeAccess.READ_WRITE;

		/**
		 * The uniform group node.
		 *
		 * @type {UniformGroupNode}
		 */
		this.groupNode = groupNode;

	}

	/**
	 * The storage buffer.
	 *
	 * @type {BufferAttribute}
	 */
	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
