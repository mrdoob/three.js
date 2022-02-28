import Node from 'three-nodes/core/Node.js';

class SlotNode extends Node {

	constructor( node, name, nodeType ) {

		super( nodeType );

		this.node = node;
		this.name = name;

	}

	generate( builder ) {

		return this.node.build( builder, this.getNodeType( builder ) );

	}

}

export default SlotNode;
