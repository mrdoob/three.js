import Node from '../core/Node.js';

/**
 * Base class for representing element access on an array-like
 * node data structures.
 *
 * @augments Node
 */
class ArrayElementNode extends Node { // @TODO: If extending from TempNode it breaks webgpu_compute

	static get type() {

		return 'ArrayElementNode';

	}

	/**
	 * Constructs an array element node.
	 *
	 * @param {Node} node - The array-like node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( node, indexNode ) {

		super();

		/**
		 * The array-like node.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The index node that defines the element access.
		 *
		 * @type {Node}
		 */
		this.indexNode = indexNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayElementNode = true;

	}

	/**
	 * This method is overwritten since the node type is inferred from the array-like node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		return this.node.getElementType( builder );

	}

	generate( builder ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;
