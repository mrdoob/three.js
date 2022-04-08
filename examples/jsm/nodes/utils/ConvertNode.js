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

			const nodeSnippet = node.build( builder, convertTo );

			return builder.format( nodeSnippet, this.getNodeType( builder ), convertTo );

		} else {

			return node.build( builder, convertTo );

		}

	}

}

export default ConvertNode;
