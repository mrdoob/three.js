import Node from '../core/Node.js';

class SplitNode extends Node {

	constructor( node, components = 'x' ) {

		super();

		this.node = node;
		this.components = components;

	}

	getNodeType( builder ) {

		return builder.getTypeFromLength( this.components.length );

	}

	generate( builder, output ) {

		const type = this.node.getNodeType( builder );
		const nodeSnippet = this.node.build( builder, type );

		const snippet = `${nodeSnippet}.${this.components}`;

		return builder.format( snippet, this.getNodeType( builder ), output );

	}

}

export default SplitNode;
