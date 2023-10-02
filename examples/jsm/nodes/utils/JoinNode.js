import { addNodeClass } from '../core/Node.js';
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

		const snippetValues = [];

		for ( const input of nodes ) {

			const inputSnippet = input.build( builder );

			snippetValues.push( inputSnippet );

		}

		const snippet = `${ builder.getType( type ) }( ${ snippetValues.join( ', ' ) } )`;

		return builder.format( snippet, type, output );

	}

}

export default JoinNode;

addNodeClass( 'JoinNode', JoinNode );
