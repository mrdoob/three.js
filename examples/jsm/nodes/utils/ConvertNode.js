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

		const convertToSnippet = builder.getType( convertTo );
		const nodeSnippet = this.node.build( builder, convertTo );

		return `${ convertToSnippet }( ${ nodeSnippet } )`;

	}

}

export default ConvertNode;
