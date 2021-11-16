import Node from '../core/Node.js';

class JoinNode extends Node {

	constructor( nodes = [] ) {

		super();

		this.nodes = nodes;

	}

	getNodeType( builder ) {

		return builder.getTypeFromLength( this.nodes.length );

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const nodes = this.nodes;

		const snippetValues = [];

		for ( let i = 0; i < nodes.length; i ++ ) {

			const input = nodes[ i ];

			const inputSnippet = input.build( builder, 'float' );

			snippetValues.push( inputSnippet );

		}

		return `${ builder.getType( type ) }( ${ snippetValues.join( ', ' ) } )`;

	}

}

export default JoinNode;
