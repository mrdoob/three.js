import Node from '../core/Node.js';

/**
 * This module is part of the TSL core and usually not used in app level code.
 * It represents a convert operation during the shader generation process
 * meaning it converts the data type of a node to a target data type.
 *
 * @augments Node
 */
class ConvertNode extends Node {

	static get type() {

		return 'ConvertNode';

	}

	/**
	 * Constructs a new convert node.
	 *
	 * @param {Node} node - The node which type should be converted.
	 * @param {String} convertTo - The target node type. Multiple types can be defined by separating them with a `|` sign.
	 */
	constructor( node, convertTo ) {

		super();

		/**
		 * The node which type should be converted.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The target node type. Multiple types can be defined by separating them with a `|` sign.
		 *
		 * @type {String}
		 */
		this.convertTo = convertTo;

	}

	/**
	 * This method is overwritten since the implementation tries to infer the best
	 * matching type from the {@link ConvertNode#convertTo} property.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		const requestType = this.node.getNodeType( builder );

		let convertTo = null;

		for ( const overloadingType of this.convertTo.split( '|' ) ) {

			if ( convertTo === null || builder.getTypeLength( requestType ) === builder.getTypeLength( overloadingType ) ) {

				convertTo = overloadingType;

			}

		}

		return convertTo;

	}

	serialize( data ) {

		super.serialize( data );

		data.convertTo = this.convertTo;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.convertTo = data.convertTo;

	}

	generate( builder, output ) {

		const node = this.node;
		const type = this.getNodeType( builder );

		const snippet = node.build( builder, type );

		return builder.format( snippet, type, output );

	}

}

export default ConvertNode;
