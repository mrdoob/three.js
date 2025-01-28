import Node from '../core/Node.js';

/**
 * Base class for representing member access on an object-like
 * node data structures.
 *
 * @augments Node
 */
class MemberNode extends Node {

	static get type() {

		return 'MemberNode';

	}

	/**
	 * Constructs an array element node.
	 *
	 * @param {Node} node - The array-like node.
	 * @param {String} property - The property name.
	 */
	constructor( node, property ) {

		super();

		/**
		 * The array-like node.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The property name.
		 *
		 * @type {Node}
		 */
		this.property = property;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isMemberNode = true;

	}

	getNodeType( builder ) {

		return this.node.getMemberType( builder, this.property );

	}

	generate( builder ) {

		const propertyName = this.node.build( builder );

		return propertyName + '.' + this.property;

	}

}

export default MemberNode;
