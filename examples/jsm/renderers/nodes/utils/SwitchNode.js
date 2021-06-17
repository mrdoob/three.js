import Node from '../core/Node.js';

class SwitchNode extends Node {

	constructor( node, components = 'x' ) {

		super();

		this.node = node;
		this.components = components;

	}

	getType( builder ) {

		return builder.getTypeFromLength( this.components.length );

	}

	generate( builder, output ) {

		const nodeType = this.node.getType( builder );
		const nodeSnippet = this.node.build( builder, nodeType );

		const snippet = `${nodeSnippet}.${this.components}`;

		return builder.format( snippet, this.getType( builder ), output );

	}

}

export default SwitchNode;
