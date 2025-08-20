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
	 * Constructs a member node.
	 *
	 * @param {Node} structNode - The struct node.
	 * @param {string} property - The property name.
	 */
	constructor( structNode, property ) {

		super();

		/**
		 * The struct node.
		 *
		 * @type {Node}
		 */
		this.structNode = structNode;

		/**
		 * The property name.
		 *
		 * @type {Node}
		 */
		this.property = property;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMemberNode = true;

	}

	hasMember( builder ) {

		if ( this.structNode.isMemberNode ) {

			if ( this.structNode.hasMember( builder ) === false ) {

				return false;

			}

		}

		return this.structNode.getMemberType( builder, this.property ) !== 'void';

	}

	getNodeType( builder ) {

		if ( this.hasMember( builder ) === false ) {

			// default type if member does not exist

			return 'float';

		}

		return this.structNode.getMemberType( builder, this.property );

	}

	getMemberType( builder, name ) {

		if ( this.hasMember( builder ) === false ) {

			// default type if member does not exist

			return 'float';

		}

		const type = this.getNodeType( builder );
		const struct = builder.getStructTypeNode( type );

		return struct.getMemberType( builder, name );

	}

	generate( builder ) {

		if ( this.hasMember( builder ) === false ) {

			console.warn( `THREE.TSL: Member "${ this.property }" does not exist in struct.` );

			const type = this.getNodeType( builder );

			return builder.generateConst( type );

		}

		const propertyName = this.structNode.build( builder );

		return propertyName + '.' + this.property;

	}

}

export default MemberNode;
