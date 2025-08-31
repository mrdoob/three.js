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
	 * @param {?string} [nodeType=null] - The node type.
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
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		if ( this.nodeType !== null ) {

			return builder.getVectorType( this.nodeType );

		}

		return builder.getTypeFromLength( this.nodes.reduce( ( count, cur ) => count + builder.getTypeLength( cur.getNodeType( builder ) ), 0 ) );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const maxLength = builder.getTypeLength( type );

		const nodes = this.nodes;

		const primitiveType = builder.getComponentType( type );

		const snippetValues = [];

		let length = 0;

		for ( const input of nodes ) {

			if ( length >= maxLength ) {

				console.error( `THREE.TSL: Length of parameters exceeds maximum length of function '${ type }()' type.` );
				break;

			}

			let inputType = input.getNodeType( builder );
			let inputTypeLength = builder.getTypeLength( inputType );
			let inputSnippet;

			if ( length + inputTypeLength > maxLength ) {

				console.error( `THREE.TSL: Length of '${ type }()' data exceeds maximum length of output type.` );

				inputTypeLength = maxLength - length;
				inputType = builder.getTypeFromLength( inputTypeLength );

			}

			length += inputTypeLength;
			inputSnippet = input.build( builder, inputType );

			const inputPrimitiveType = builder.getComponentType( inputType );

			if ( inputPrimitiveType !== primitiveType ) {

				const targetType = builder.getTypeFromLength( inputTypeLength, primitiveType );

				inputSnippet = builder.format( inputSnippet, inputType, targetType );

			}

			snippetValues.push( inputSnippet );

		}

		const snippet = `${ builder.getType( type ) }( ${ snippetValues.join( ', ' ) } )`;

		return builder.format( snippet, type, output );

	}

}

export default JoinNode;
