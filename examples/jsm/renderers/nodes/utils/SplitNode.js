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

	generate( builder ) {

		const node = this.node;
		const nodeTypeLength = builder.getTypeLength( node.getNodeType( builder ) );

		const components = this.components;

		let type = null;

		if ( components.length >= nodeTypeLength ) {

			// need expand the input node

			type = this.getNodeType( builder );

		}

		const nodeSnippet = node.build( builder, type );

		return `${nodeSnippet}.${this.components}`;

	}

}

export default SplitNode;
