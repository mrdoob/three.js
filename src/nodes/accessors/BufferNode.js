import UniformNode from '../core/UniformNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

/**
 * A special type of uniform node which represents array-like data
 * as uniform buffers. The access usually happens via `element()`
 * which returns an instance of {@link ArrayElementNode}. For example:
 *
 * ```js
 * const bufferNode = buffer( array, 'mat4', count );
 * const matrixNode = bufferNode.element( index ); // access a matrix from the buffer
 * ```
 * In general, it is recommended to use the more managed {@link UniformArrayNode}
 * since it handles more input types and automatically cares about buffer paddings.
 *
 * @augments UniformNode
 */
class BufferNode extends UniformNode {

	static get type() {

		return 'BufferNode';

	}

	/**
	 * Constructs a new buffer node.
	 *
	 * @param {Array<number>} value - Array-like buffer data.
	 * @param {string} bufferType - The data type of the buffer.
	 * @param {number} [bufferCount=0] - The count of buffer elements.
	 */
	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBufferNode = true;

		/**
		 * The data type of the buffer.
		 *
		 * @type {string}
		 */
		this.bufferType = bufferType;

		/**
		 * The uniform node that holds the value of the reference node.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.bufferCount = bufferCount;

	}

	/**
	 * The data type of the buffer elements.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The element type.
	 */
	getElementType( builder ) {

		return this.getNodeType( builder );

	}

	/**
	 * Overwrites the default implementation to return a fixed value `'buffer'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return 'buffer';

	}

}

export default BufferNode;

/**
 * TSL function for creating a buffer node.
 *
 * @tsl
 * @function
 * @param {Array<number>} value - Array-like buffer data.
 * @param {string} type - The data type of a buffer element.
 * @param {number} count - The count of buffer elements.
 * @returns {BufferNode}
 */
export const buffer = ( value, type, count ) => nodeObject( new BufferNode( value, type, count ) );
