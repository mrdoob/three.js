import TempNode from '../core/TempNode.js';

/**
 * This module is part of the TSL core and usually not used in app level code.
 * It represents a join operation during the shader generation process.
 * For example in can compose/join two single floats into a `vec2` type.
 *
 * @augments TempNode
 */
class JoinNode extends TempNode {

	static get type() {

		return 'JoinNode';

	}

	/**
	 * Constructs a new join node.
	 *
	 * @param {Array<Node>} nodes - An array of nodes that should be joined.
	 * @param {String?} [nodeType=null] - The node type.
	 */
	constructor( nodes = [], nodeType = null ) {

		super( nodeType );

		/**
		 * An array of nodes that should be joined.
		 *
		 * @type {Array<Node>}
		 */
		this.nodes = nodes;

	}

	/**
	 * This method is overwritten since the node type must be inferred from the
	 * joined data length if not explicitly defined.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		if ( this.nodeType !== null ) {

			return builder.getVectorType( this.nodeType );

		}

		return builder.getTypeFromLength( this.nodes.reduce( ( count, cur ) => count + builder.getTypeLength( cur.getNodeType( builder ) ), 0 ) );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const nodes = this.nodes;

		const primitiveType = builder.getComponentType( type );

		const snippetValues = [];

		for ( const input of nodes ) {

			let inputSnippet = input.build( builder );

			const inputPrimitiveType = builder.getComponentType( input.getNodeType( builder ) );

			if ( inputPrimitiveType !== primitiveType ) {

				inputSnippet = builder.format( inputSnippet, inputPrimitiveType, primitiveType );

			}

			snippetValues.push( inputSnippet );

		}

		const snippet = `${ builder.getType( type ) }( ${ snippetValues.join( ', ' ) } )`;

		return builder.format( snippet, type, output );

	}

}

export default JoinNode;
