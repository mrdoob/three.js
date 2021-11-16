import Node from '../core/Node.js';

class ArrayElementNode extends Node {

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'int' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;
