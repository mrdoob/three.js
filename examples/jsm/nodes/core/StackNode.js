import Node from './Node.js';
import OperatorNode from '../math/OperatorNode.js';

class StackNode extends Node {

	constructor() {

		super();

		this.nodes = [];
		this.outputNode = null;

		this.isStackNode = true;

	}

	getNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	assign( targetNode, sourceValue ) {

		this.nodes.push( new OperatorNode( '=', targetNode, sourceValue ) );

		return this;

	}

	build( builder, ...params ) {

		for ( const node of this.nodes ) {

			node.build( builder );

		}

		return this.outputNode ? this.outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

}

export default StackNode;
