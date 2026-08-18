import ScopedArrayElementNode from './ScopedArrayElementNode.js';
import ScopedVariableNode from './ScopedVariableNode.js';

/**
 * A node allowing the user to create a scoped array buffer within the context
 * of a compute shader. Typically, `workgroup` scoped buffers are created to
 * hold data that is transferred from a global storage scope into a local
 * workgroup scope. For invocations within a workgroup, data access speeds on
 * `workgroup` scoped buffers can be significantly faster than similar access
 * operations on globally accessible storage buffers.
 *
 * Elements are accessed via {@link ScopedArrayNode#element}. Use
 * {@link ScopedVariableNode} when a single value is required instead.
 *
 * This node can only be used with a WebGPU backend.
 *
 * @augments ScopedVariableNode
 */
class ScopedArrayNode extends ScopedVariableNode {

	/**
	 * Constructs a new scoped array node.
	 *
	 * @param {string} scope - The address space the buffer is scoped to.
	 * @param {string} type - The data type of the buffer's elements.
	 * @param {number} [count] - The number of elements in the array.
	 */
	constructor( scope, type, count = null ) {

		super( scope, type );

		/**
		 * The count of the array variable.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.count = count;

		/**
		 * The data type of the array buffer.
		 *
		 * @type {string}
		 */
		this.elementType = type;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isScopedArrayNode = true;

	}

	/**
	 * Returns the number of elements in the node array.
	 *
	 * @return {?number} The number of elements in the node array.
	 */
	getArrayCount( /*builder*/ ) {

		return this.count;

	}

	/**
	 * The data type of the array buffer.
	 *
	 * @return {string} The element type.
	 */
	getElementType() {

		return this.elementType;

	}

	/**
	 * Overwrites the default implementation since the input type
	 * is inferred from the scope.
	 *
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return `${this.scope.toUpperCase()}Array`;

	}

	getScopedName() {

		return ( this.name !== '' ) ? this.name : `${this.scope}Array_${this.id}`;

	}

	/**
	 * This method can be used to access elements via an index node.
	 *
	 * @param {IndexNode} indexNode - indexNode.
	 * @return {ScopedArrayElementNode} A reference to an element.
	 */
	element( indexNode ) {

		return new ScopedArrayElementNode( this, indexNode );

	}

}

export default ScopedArrayNode;

/**
 * TSL function for creating a scoped array node.
 * Creates a new 'workgroup' scoped array buffer.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of a 'workgroup' scoped buffer element.
 * @param {number} [count] - The number of elements in the buffer.
 * @returns {ScopedArrayNode}
 */
export const workgroupArray = ( type, count ) => new ScopedArrayNode( 'workgroup', type, count );

/**
 * TSL function for creating a scoped array node.
 * Creates a new 'private' scoped array buffer.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of a 'workgroup' scoped buffer element.
 * @param {number} [count] - The number of elements in the buffer.
 * @returns {ScopedArrayNode}
 */
export const privateArray = ( type, count ) => new ScopedArrayNode( 'private', type, count );

/**
 * TSL function for creating a scoped array node.
 * Creates a new 'function' scoped array buffer.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of a 'workgroup' scoped buffer element.
 * @param {number} [count] - The number of elements in the buffer.
 * @returns {ScopedArrayNode}
 */
export const functionArray = ( type, count ) => new ScopedArrayNode( 'function', type, count );
