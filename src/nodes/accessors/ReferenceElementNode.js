import ArrayElementNode from '../utils/ArrayElementNode.js';

/**
 * This class is only relevant if the referenced property is array-like.
 * In this case, `ReferenceElementNode` allows to refer to a specific
 * element inside the data structure via an index.
 *
 * @augments ArrayElementNode
 */
class ReferenceElementNode extends ArrayElementNode {

	static get type() {

		return 'ReferenceElementNode';

	}

	/**
	 * Constructs a new reference element node.
	 *
	 * @param {(ReferenceBaseNode|ReferenceNode)} referenceNode - The reference node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( referenceNode, indexNode ) {

		super( referenceNode, indexNode );

		/**
		 * Similar to {@link ReferenceNode#reference}, an additional
		 * property references to the current node.
		 *
		 * @type {?(ReferenceBaseNode|ReferenceNode)}
		 * @default null
		 */
		this.referenceNode = referenceNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReferenceElementNode = true;

	}

	/**
	 * This method is overwritten since the node type is inferred from
	 * the uniform type of the reference node.
	 *
	 * @return {string} The node type.
	 */
	generateNodeType() {

		return this.referenceNode.uniformType;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const arrayType = this.referenceNode.getNodeType( builder );
		const elementType = this.getNodeType( builder );

		return builder.format( snippet, arrayType, elementType );

	}

}

export default ReferenceElementNode;
