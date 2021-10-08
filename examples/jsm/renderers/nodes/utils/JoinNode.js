import Node from '../core/Node.js';

class JoinNode extends Node {

	constructor( values = [] ) {

		super();

		this.values = values;

	}

	getNodeType( builder ) {

		return builder.getTypeFromLength( this.values.length );

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const values = this.values;

		const snippetValues = [];

		for ( let i = 0; i < values.length; i ++ ) {

			const input = values[ i ];

			const inputSnippet = input.build( builder, 'float' );

			snippetValues.push( inputSnippet );

		}

		return `${type}( ${ snippetValues.join( ', ' ) } )`;

	}

}

export default JoinNode;
