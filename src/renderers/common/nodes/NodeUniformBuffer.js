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

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeUniformBuffer = true;

	}

	/**
	 * The array of update ranges.
	 *
	 * @param {Array<{start: number, count: number}>} value - The update ranges.
	 */
	set updateRanges( value ) {

		this.nodeUniform.updateRanges = value;

	}

	/**
	 * The array of update ranges.
	 *
	 * @type {Array<{start: number, count: number}>}
	 */
	get updateRanges() {

		return this.nodeUniform.updateRanges;

	}

	/**
	 * Adds a range of data in the data array to be updated on the GPU.
	 *
	 * @param {number} start - Position at which to start update.
	 * @param {number} count - The number of components to update.
	 */
	addUpdateRange( start, count ) {

		this.nodeUniform.addUpdateRange( start, count );

	}

	/**
	 * Clears all update ranges.
	 */
	clearUpdateRanges() {

		this.nodeUniform.clearUpdateRanges();

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
