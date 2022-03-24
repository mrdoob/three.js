import Node from '../core/Node.js';

class ConvertNode extends Node {

	constructor( node, convertTo ) {

		super();

		this.node = node;
		this.convertTo = convertTo;

	}

	getNodeType( /*builder*/ ) {

		return this.convertTo;

	}

	generate( builder ) {

		const convertTo = this.convertTo;
		const node = this.node;

		if ( builder.isReference( convertTo ) === false ) {

			const convertToSnippet = builder.getType( convertTo );
			const nodeSnippet = node.build( builder, convertTo );

			return `${ builder.getVectorType( convertToSnippet ) }( ${ nodeSnippet } )`;

		} else {

			return node.build( builder, convertTo );

		}

	}

}

export default ConvertNode;
