import Node from './Node.js';

class ContextNode extends Node {

	constructor( node, context = {} ) {

		super();

		this.node = node;
		this.context = context;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.context } );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

ContextNode.prototype.isContextNode = true;

export default ContextNode;
