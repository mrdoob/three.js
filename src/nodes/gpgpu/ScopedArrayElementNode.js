import ArrayElementNode from '../utils/ArrayElementNode.js';

/**
 * Represents an element of a scoped array.
 *
 * @augments ArrayElementNode
 */
class ScopedArrayElementNode extends ArrayElementNode {

	/**
	 * Constructs a new scoped array element node.
	 *
	 * @param {ScopedArrayNode} scopedArrayNode - The scoped array node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( scopedArrayNode, indexNode ) {

		super( scopedArrayNode, indexNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isScopedArrayElementNode = true;

	}

	generate( builder, output ) {

		let snippet = super.generate( builder );

		if ( builder.isContextAssign() !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		return snippet;

	}

}

export default ScopedArrayElementNode;
