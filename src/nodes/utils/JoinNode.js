import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';

class JoinNode extends TempNode {

	constructor( nodes = [], nodeType = null ) {

		super( nodeType );

		this.nodes = nodes;

	}

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

JoinNode.type = /*@__PURE__*/ registerNode( 'Join', JoinNode );
