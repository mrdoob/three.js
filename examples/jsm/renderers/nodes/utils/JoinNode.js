import Node from '../core/Node.js';

class JoinNode extends Node {

	constructor( values = [] ) {

		super();

		this.values = values;

	}

	getType( builder ) {

		return builder.getTypeFromLength( this.values.length );

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const values = this.values;

		const snippetValues = [];

		for ( let i = 0; i < values.length; i ++ ) {

			const input = values[ i ];

			const inputSnippet = input.build( builder, 'float' );

			snippetValues.push( inputSnippet );

		}

		const snippet = `${type}( ${ snippetValues.join( ', ' ) } )`;

		return builder.format( snippet, type, output );

	}

}

export default JoinNode;
